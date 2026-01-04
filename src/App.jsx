import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Box,
  // Grid, // REMOVED Grid
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Send as SendIcon,
  AccountCircle,
  EventNote,
  AddTask,
  CalendarMonth,
  Groups
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { pickersLayoutClasses } from '@mui/x-date-pickers/PickersLayout';
import gsap from 'gsap';

// --- 1. Theme Definition ---
const m3Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7cbf7b',
    },
    secondary: {
      main: '#3b8c5a',
    },
    background: {
      default: '#0d1a12',
      paper: '#1a2e21',
    },
    text: {
      primary: '#e8f5e9',
      secondary: '#a3d9a1',
    },
  },
  shape: {
    borderRadius: 24,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontFamily: '"Instrument Serif", serif',
      fontWeight: 400,
    },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.4)',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }),
      },
    },
    MuiDateCalendar: {
      styleOverrides: {
        root: { 
            backgroundColor: 'transparent',
            width: '100%', 
            maxWidth: '100%',
            overflow: 'visible' 
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: '#0d1a12',
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          },
        }),
        today: ({ theme }) => ({ borderColor: theme.palette.primary.main }),
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: { paddingLeft: 0 },
        label: ({ theme }) => ({ color: theme.palette.text.primary, fontWeight: 600 }),
        switchViewButton: ({ theme }) => ({ color: theme.palette.text.primary })
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({ color: theme.palette.text.primary })
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: ({ theme }) => ({ color: theme.palette.text.primary })
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          '&.Mui-checked': { color: theme.palette.primary.main }
        })
      }
    }
  },
});

// --- 2. Styled Components ---
const GradientSearchBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: 50,
  padding: '4px',
  background: 'linear-gradient(90deg, #7cbf7b 0%, #3b8c5a 100%)',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
}));

const SearchInner = styled('div')(({ theme }) => ({
  backgroundColor: '#1a2e21',
  borderRadius: 46,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  flexGrow: 1,
  color: theme.palette.text.primary,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 2),
    width: '100%',
    fontWeight: 500,
    '&::placeholder': { color: theme.palette.text.secondary, opacity: 0.5 }
  },
}));

// --- 3. Main App Component ---
function App() {
  const [date, setDate] = useState(new Date());
  const [checked, setChecked] = useState([0, 1, 2]);

  // ANIMATION STATE
  const [isAnimating, setIsAnimating] = useState(true);
  const mindTextRef = useRef(null);

  // GSAP Animation Effect
  useEffect(() => {
    const ctx = gsap.context(() => {
      const chars = mindTextRef.current.querySelectorAll('.mind-char');

      if (isAnimating) {
        gsap.to(chars, {
          y: -15, 
          ease: "sine.inOut", 
          duration: 0.6, 
          stagger: {
            each: 0.1, 
            repeat: -1, 
            yoyo: true 
          }
        });
      } else {
        gsap.killTweensOf(chars);
        gsap.to(chars, {
          y: 0,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    }, mindTextRef);

    return () => ctx.revert();
  }, [isAnimating]);

  // Timer to stop animation
  useEffect(() => {
    let timer;
    if (isAnimating) {
      timer = setTimeout(() => {
        setIsAnimating(false);
      }, 15000);
    }
    return () => clearTimeout(timer);
  }, [isAnimating]);


  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  // --- Prompt / Webhook state ---
  const [prompt, setPrompt] = useState('');
  const [responseText, setResponseText] = useState('');
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [promptError, setPromptError] = useState('');

  // --- Google OAuth & Tasks state ---
  const [accessToken, setAccessToken] = useState('');
  const [googleTasks, setGoogleTasks] = useState([]);
  const tokenClientRef = React.useRef(null);
  const [tokenClientReady, setTokenClientReady] = useState(false);

  // Replace with your actual n8n webhook URL or wire to env (Vite: import.meta.env.VITE_WEBHOOK_URL)
  const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://agentx2026.app.n8n.cloud/webhook/time-assistant';
  const WEBHOOK_SECRET = import.meta.env.VITE_WEBHOOK_SECRET || '';

  async function handleSubmitPrompt() {
    if (!prompt.trim()) return;
    setLoadingPrompt(true);
    setPromptError('');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (WEBHOOK_SECRET) headers['x-webhook-secret'] = WEBHOOK_SECRET;
      console.log('POST', WEBHOOK_URL, { prompt });
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'cors',
        headers,
        body: JSON.stringify({ prompt }),
      });
      const text = await res.text();
      console.log('webhook response', res.status, text);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${text || res.statusText}`);

      if (!text) {
        // No body: show response metadata as JSON (status + headers)
        const headers = {};
        try {
          for (const [k, v] of res.headers.entries()) headers[k] = v;
        } catch (e) {}
        const meta = { status: res.status, statusText: res.statusText, headers };
        setResponseText(JSON.stringify(meta, null, 2));
      } else {
        // Try to parse JSON, otherwise display raw text
        try {
          const data = JSON.parse(text);
          setResponseText(JSON.stringify(data, null, 2));
        } catch (e) {
          setResponseText(text);
        }
      }
      setPrompt('');
    } catch (err) {
      setPromptError(String(err));
      setResponseText('');
    } finally {
      setLoadingPrompt(false);
    }
  }

  function handlePromptKeyDown(e) {
    if (e.key === 'Enter' && !loadingPrompt) {
      e.preventDefault();
      handleSubmitPrompt();
    }
  }

  // --- Google Identity Services: load and init token client ---
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    // load token from localStorage if present and not expired
    try {
      const stored = localStorage.getItem('google_token');
      const expiry = parseInt(localStorage.getItem('google_token_expires') || '0', 10);
      if (stored && expiry && expiry > Date.now()) {
        setAccessToken(stored);
      }
    } catch (e) {
      console.warn('localStorage read error', e);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      console.log('Google Identity script loaded');
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/tasks.readonly https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/gmail.readonly',
          callback: (resp) => {
            console.log('token callback', resp);
            if (resp && resp.access_token) {
              setAccessToken(resp.access_token);
              try {
                localStorage.setItem('google_token', resp.access_token);
                if (resp.expires_in) {
                  const expiry = Date.now() + resp.expires_in * 1000;
                  localStorage.setItem('google_token_expires', String(expiry));
                }
              } catch (e) {
                console.warn('localStorage write failed', e);
              }
            }
          }
        });
        setTokenClientReady(true);
        console.log('tokenClient initialized', !!tokenClientRef.current);
      } else {
        console.warn('Google Identity not available on window');
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  function handleGoogleSignIn() {
    if (!tokenClientRef.current) {
      alert('Google Identity client not ready');
      console.warn('tokenClientRef.current not set');
      return;
    }
    console.log('requesting access token');
    tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
  }

  function handleGoogleSignOut() {
    setAccessToken('');
    setGoogleTasks([]);
  }

  async function fetchGoogleTasks() {
    if (!accessToken) return;
    try {
      const res = await fetch('https://www.googleapis.com/tasks/v1/lists/@default/tasks', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`Tasks API ${res.status}`);
      const data = await res.json();
      let items = (data && data.items) ? data.items : [];
      // keep only unfinished or future tasks
      const now = Date.now();
      items = items.filter(it => {
        // Google Tasks: status may be 'completed' or 'needsAction'
        if (it.status === 'completed') return false;
        if (it.due) {
          const dueTs = Date.parse(it.due);
          if (!Number.isNaN(dueTs) && dueTs <= now) return false; // past due -> skip
        }
        return true;
      });
      setGoogleTasks(items);
    } catch (err) {
      console.error('fetchGoogleTasks error', err);
    }
  }

  // Calendar & Gmail state
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [gmailMeetings, setGmailMeetings] = useState([]);
  const [filteredCalendar, setFilteredCalendar] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

  // --- Gemini brain: try external API if key provided, otherwise local heuristic summarizer ---
  async function callGeminiSummarizer(promptText) {
    if (!GEMINI_API_KEY) return null;
    try {
      // Try calling Google's generative API if available. This is a generic example and
      // may need adjustments depending on your Gemini endpoint/version.
      const endpoint = 'https://generativeai.googleapis.com/v1beta2/models/text-bison-001:generate?key=' + encodeURIComponent(GEMINI_API_KEY);
      const body = {
        prompt: {
          text: promptText
        },
        temperature: 0.2,
        maxOutputTokens: 200
      };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Gemini API ' + res.status);
      const json = await res.json();
      // Try various response shapes; prefer text found at json?.candidates?.[0]?.output
      const text = json?.candidates?.[0]?.content || json?.output?.[0]?.content || JSON.stringify(json);
      return String(text).trim();
    } catch (err) {
      console.warn('Gemini call failed, falling back to local summarizer', err);
      return null;
    }
  }

  function simpleTimeFormat(dateStr) {
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return 'time unknown';
      // YYYY-MM-DD HH:MM
      const Y = d.getFullYear();
      const M = String(d.getMonth() + 1).padStart(2, '0');
      const D = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${Y}-${M}-${D} ${hh}:${mm}`;
    } catch (e) {
      return 'time unknown';
    }
  }

  async function geminiFilterCalendar(events) {
    if (!events || events.length === 0) return [];
    // Prepare simple records
    const now = Date.now();
    const records = events.map(ev => {
      const title = (ev.summary || '(no title)').trim();
      const start = ev.start?.dateTime || ev.start?.date || null;
      const startTs = start ? Date.parse(start) : NaN;
      const time = start ? simpleTimeFormat(start) : 'time unknown';
      return { id: ev.id, title, time, startTs, raw: ev };
    }).filter(r => {
      // only keep future events
      if (Number.isNaN(r.startTs)) return false;
      return r.startTs > now;
    });
    // Try to call Gemini to shorten/clean if available
    const prompt = 'Summarize these calendar events into short lines: title — time (use format YYYY-MM-DD HH:MM).\n' + records.map(r => `${r.title} | ${r.time}`).join('\n');
    const ai = await callGeminiSummarizer(prompt);
    if (ai) {
      // parse AI output lines
      const lines = ai.split(/\r?\n/).filter(Boolean).slice(0, records.length);
      return lines.map((line, i) => ({ id: records[i].id, out: line }));
    }
    // fallback: short title and simple time
    return records.map(r => ({ id: r.id, out: `${r.title} — ${r.time}` }));
  }

  async function geminiFilterGmail(meetings) {
    if (!meetings || meetings.length === 0) return [];
    // classify meetings: online if has links, offline if contains offline keywords
    const offlineKeywords = /\b(in[- ]?person|room|office|meet at|on-site|onsite|location|address|addr)\b/i;
    const filtered = [];
    for (const m of meetings) {
      const body = (m.body || m.snippet || '') + ' ' + (m.links || []).join(' ');
      const isOnline = (m.links && m.links.length > 0);
      const isOffline = offlineKeywords.test(body);
      if (!isOnline && !isOffline) continue; // skip items that are neither online nor offline

      // determine a date: prefer parsedDate (from header or body), else skip
      let parsed = m.parsedDate || null;
      if (!parsed && m.dateHeader) {
        const pd = new Date(m.dateHeader);
        if (!Number.isNaN(pd.getTime())) parsed = pd;
      }
      if (!parsed) {
        const timeMatch = body.match(/(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2})|(\d{1,2}[:]\d{2}\s?(AM|PM|am|pm)?)/);
        if (timeMatch) {
          const tryDate = new Date(timeMatch[0]);
          if (!Number.isNaN(tryDate.getTime())) parsed = tryDate;
        }
      }
      if (!parsed) continue; // skip meetings without any date

      // only include future meetings
      if (parsed.getTime() <= Date.now()) continue;

      const dateStr = simpleTimeFormat(parsed.toISOString());
      filtered.push({ id: m.id, subject: m.subject || '(no subject)', dateStr, isOnline, raw: m });
    }

    if (filtered.length === 0) return [];

    // Ask Gemini to shorten subjects to a very brief title (few words) and return lines: TITLE — DATE
    const promptLines = filtered.map(f => `${f.subject} | ${f.dateStr}`);
    const prompt = 'For each line, produce a very short title (3 words max) followed by " — " and the date in format YYYY-MM-DD HH:MM. Input lines:\n' + promptLines.join('\n');
    const ai = await callGeminiSummarizer(prompt);
    if (ai) {
      const lines = ai.split(/\r?\n/).filter(Boolean).slice(0, filtered.length);
      return lines.map((line, i) => ({ id: filtered[i].id, out: line }));
    }

    // fallback: subject trimmed + date
    return filtered.map(f => ({ id: f.id, out: `${f.subject.replace(/\s+/g,' ').slice(0,60)} — ${f.dateStr}` }));
  }

  async function fetchCalendarEventsForDate(selectedDate) {
    if (!accessToken || !selectedDate) return;
    try {
      const start = new Date(selectedDate);
      start.setHours(0,0,0,0);
      const end = new Date(selectedDate);
      end.setHours(23,59,59,999);
      const timeMin = start.toISOString();
      const timeMax = end.toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!res.ok) throw new Error(`Calendar API ${res.status}`);
      const data = await res.json();
      setCalendarEvents((data && data.items) ? data.items : []);
    } catch (err) {
      console.error('fetchCalendarEvents error', err);
      setCalendarEvents([]);
    }
  }

  async function fetchGmailMeetings() {
    if (!accessToken) return;
    try {
      // search common meeting keywords
      const q = encodeURIComponent('meeting OR invite OR zoom OR "google meet" OR webinar');
      const listUrl = `https://www.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=20`;
      const listRes = await fetch(listUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!listRes.ok) throw new Error(`Gmail list ${listRes.status}`);
      const listData = await listRes.json();
      const ids = (listData.messages || []).map(m => m.id).slice(0, 20);
      const meetings = [];
      for (const id of ids) {
        const msgRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (!msgRes.ok) continue;
        const msg = await msgRes.json();
        const headers = msg.payload?.headers || [];
        const subjectH = headers.find(h => h.name === 'Subject');
        const fromH = headers.find(h => h.name === 'From');
        const dateH = headers.find(h => h.name === 'Date');
        const subject = subjectH?.value || '(no subject)';
        const snippet = msg.snippet || '';
        // extract links and full body (if available)
        const body = (msg.payload?.body?.data) ? atob(msg.payload.body.data.replace(/-/g, '+').replace(/_/g, '/')) : snippet;
        const links = (body && body.match(/https?:\/\/[\w\-./?=&%#]+/g)) || [];
        const dateHeader = dateH?.value || null;
        // Determine parsed date (if any)
        let parsedDate = null;
        if (dateHeader) {
          const pd = new Date(dateHeader);
          if (!Number.isNaN(pd.getTime())) parsedDate = pd;
        }
        // also attempt to find explicit timestamps in the body
        if (!parsedDate) {
          const tm = body.match(/(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2})/);
          if (tm) {
            const pd2 = new Date(tm[0]);
            if (!Number.isNaN(pd2.getTime())) parsedDate = pd2;
          }
        }
        meetings.push({ id, subject, from: fromH?.value, snippet, links, body, dateHeader, parsedDate });
      }
      setGmailMeetings(meetings);
    } catch (err) {
      console.error('fetchGmailMeetings error', err);
      setGmailMeetings([]);
    }
  }

  // fetch calendar events when `date` or accessToken changes
  useEffect(() => {
    if (accessToken) fetchCalendarEventsForDate(date);
  }, [accessToken, date]);

  // fetch gmail meetings when token becomes available
  useEffect(() => {
    if (accessToken) fetchGmailMeetings();
  }, [accessToken]);

  // Run Gemini filtering when data arrives
  useEffect(() => {
    (async () => {
      const fc = await geminiFilterCalendar(calendarEvents);
      setFilteredCalendar(fc);
      const fm = await geminiFilterGmail(gmailMeetings);
      setFilteredMeetings(fm);
    })();
  }, [calendarEvents, gmailMeetings]);

  // auto-fetch tasks when token is obtained
  useEffect(() => {
    if (accessToken) fetchGoogleTasks();
  }, [accessToken]);

  const wordToAnimate = "mind";

  return (
    <ThemeProvider theme={m3Theme}>
      <CssBaseline />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden'
      }}>

        {/* --- Top Bar --- */}
        <AppBar position="static" elevation={0} sx={{ pt: 1, backgroundColor: 'background.paper', borderBottom: '1px solid #2f4836' }}>
          <Toolbar>
            <Typography
              variant="h5"
              component="div"
              sx={{
                flexGrow: 1,
                ml: 1,
                color: 'text.primary',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.5px'
              }}
            >
              Agenta
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {accessToken ? (
                <>
                  <Typography sx={{ mr: 1, color: 'text.secondary', fontSize: 14 }}>Connected</Typography>
                  <IconButton size="large" onClick={handleGoogleSignOut} color="inherit"><AccountCircle sx={{ fontSize: 32 }} /></IconButton>
                </>
              ) : (
                <IconButton size="large" onClick={handleGoogleSignIn} color="inherit"><AccountCircle sx={{ fontSize: 32 }} /></IconButton>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* --- Main Content --- */}
        <Box
          component="div"
          sx={{
            px: 4,
            py: 4,
            flexGrow: 1,
            width: '100%',
            maxWidth: 'none !important',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Header & Search Section */}
          <Box sx={{ textAlign: 'center', mb: 10, mt: 4 }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                mb: 6,
                color: 'text.primary',
                fontFamily: '"Instrument Serif", serif',
                fontSize: '4.5rem',
                letterSpacing: '0.01em',
                wordSpacing: '0.05em',
              }}
            >
              What do you have in
              <Box
                component="span"
                ref={mindTextRef}
                sx={{
                  fontStyle: 'italic',
                  color: 'secondary.main',
                  display: 'inline-block',
                  ml: 1.5,
                  mr: 1.5,
                  whiteSpace: 'nowrap'
                }}
              >
                {wordToAnimate.split('').map((char, index) => (
                  <span
                    key={index}
                    className="mind-char"
                    style={{ display: 'inline-block', minWidth: char === ' ' ? '1rem' : 'auto' }}
                  >
                    {char}
                  </span>
                ))}
              </Box>
              today?
            </Typography>

            {/* Display webhook JSON (pretty) above the prompt */}
            {responseText && (
              <Box sx={{ maxWidth: 800, margin: '0 auto', mb: 2, textAlign: 'left' }}>
                <Box sx={{ whiteSpace: 'pre-wrap', background: '#0b1a12', padding: 2, borderRadius: 2, fontFamily: 'monospace', fontSize: 13, color: 'text.primary' }}>
                  {responseText}
                </Box>
              </Box>
            )}
            {promptError && (
              <Box sx={{ maxWidth: 800, margin: '0 auto', mb: 1, color: 'crimson' }}>{promptError}</Box>
            )}

            <GradientSearchBox>
              <SearchInner>
                <StyledInputBase
                  placeholder="Schedule a meeting..."
                  inputProps={{ 'aria-label': 'schedule a meeting' }}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handlePromptKeyDown}
                  disabled={loadingPrompt}
                />
                <IconButton
                  sx={{ p: '10px', color: 'primary.main' }}
                  aria-label="send"
                  onClick={handleSubmitPrompt}
                  disabled={loadingPrompt}
                >
                  <SendIcon />
                </IconButton>
              </SearchInner>
            </GradientSearchBox>
          </Box>

          {/* Widgets Grid REPLACEMENT - Flexbox for Equal Widths */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' }, // Stack on small, Row on large
            gap: 4,
            alignItems: 'stretch',
            width: '100%',
          }}>
            
            {/* Widget 1: Today's Task */}
            {/* flex: 1 combined with minWidth: 0 forces equal width division */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
              <Card sx={{ width: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AddTask sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Today’s task</Typography>
                  </Box>
                  <List sx={{ width: '100%', bgcolor: 'transparent' }}>
                    {accessToken ? (
                      googleTasks.length ? (
                        googleTasks.map((task, idx) => {
                          const labelId = `gtask-${idx}`;
                          return (
                            <ListItem key={task.id || idx} disablePadding>
                              <ListItemButton dense>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  <EventNote sx={{ color: 'text.secondary' }} />
                                </ListItemIcon>
                                <ListItemText
                                  id={labelId}
                                  primary={task.title}
                                  secondary={task.due ? new Date(task.due).toLocaleString() : ''}
                                  primaryTypographyProps={{ fontWeight: 500 }}
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })
                      ) : (
                        <ListItem>
                          <ListItemText primary="No tasks" primaryTypographyProps={{ color: 'text.secondary' }} />
                        </ListItem>
                      )
                    ) : (
                      // fallback static items when not connected
                      [0, 1, 2].map((value) => {
                        const labelId = `checkbox-list-label-${value}`;
                        return (
                          <ListItem
                            key={value}
                            secondaryAction={
                              <Checkbox
                                edge="end"
                                onChange={handleToggle(value)}
                                checked={checked.indexOf(value) !== -1}
                                inputProps={{ 'aria-labelledby': labelId }}
                              />
                            }
                            disablePadding
                          >
                            <ListItemButton onClick={handleToggle(value)} dense>
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <EventNote sx={{ color: 'text.secondary' }} />
                              </ListItemIcon>
                              <ListItemText
                                id={labelId}
                                primary={`Task name ${value + 1}`}
                                primaryTypographyProps={{ fontWeight: 500 }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })
                    )}
                  </List>
                </CardContent>
              </Card>
            </Box>

            {/* Widget 2: Calendar */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
              <Card sx={{ width: '100%' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarMonth sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Select date</Typography>
                  </Box>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateCalendar
                      value={date}
                      onChange={(newValue) => setDate(newValue)}
                      showDaysOutsideCurrentMonth
                      fixedWeekNumber={6}
                      sx={{
                        width: '100%',
                        overflow: 'visible',
                        [`& .${pickersLayoutClasses.contentWrapper}`]: { alignItems: 'center' }
                      }}
                    />
                  </LocalizationProvider>
                  {/* Events for the selected date */}
                  <Box sx={{ mt: 2 }}>
                    {filteredCalendar.length ? (
                      filteredCalendar.map((ev) => (
                        <Box key={ev.id} sx={{ mb: 1, p: 1, bgcolor: 'transparent' }}>
                          <Typography variant="body2" sx={{ color: 'text.primary' }}>{ev.out}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>No events</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Widget 3: Upcoming Meetings */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
              <Card sx={{ width: '100%' }}>
                <CardContent sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Groups sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Upcoming meetings</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'text.secondary' }}>
                    {filteredMeetings.length ? (
                      <Box sx={{ width: '100%' }}>
                        {filteredMeetings.map((m) => (
                          <Box key={m.id} sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>{m.out}</Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2">No meetings scheduled</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        <Box component="footer" sx={{ py: 3, textAlign: 'center', bgcolor: 'transparent' }}>
          <Typography variant="body2" color="text.secondary">
            © IT Mambas / Gemini can make mistakes, so double-check it.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;