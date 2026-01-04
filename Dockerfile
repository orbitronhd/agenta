FROM node:22-alpine as build-step
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Add your n8n URL here
ENV REACT_APP_N8N_WEBHOOK_URL=https://agentx2026.app.n8n.cloud/webhook/time-assistant
RUN npm run build

# Step 2: Serve using Nginx
FROM nginx:alpine

# Copy the build output (Vite uses 'dist')
COPY --from=build-step /app/dist /usr/share/nginx/html

# --- THE FIX IS HERE ---
# Instead of copying a config file, we edit the default one directly!
# This command changes "listen 80;" to "listen 8080;" inside Nginx
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

# Expose 8080 to match Cloud Run's default
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]