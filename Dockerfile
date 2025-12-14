FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app (creates 'dist' folder)
RUN npm run build

# Install serve
RUN npm i -g serve

# Expose port 80
EXPOSE 80

# Serve from 'dist' folder on port 80
CMD ["serve", "-s", "dist", "-l", "80"]