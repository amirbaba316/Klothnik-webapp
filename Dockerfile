# Fetching the latest node image on apline linux
FROM node:22-alpine

# Setting up the work directory
WORKDIR /app

# Copying the package.json and package-lock.json
COPY ./package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copying tsconfig file
COPY ./tsconfig.json ./

# Copying everything
COPY . .

# Expose environment variable to select environment configuration (defaults to production)
ARG ENVIRONMENT=development

# Copy env files based on environment
RUN if [ "$ENVIRONMENT" = "production" ]; then \
    cp .env.production .env.production.local; \
    else cp .env.staging .env.production.local; \
    fi

# Build app
RUN npm run build

# Install static server
RUN npm i -g serve

# Serve files using static server
CMD ["serve", "-s", "build", "-l", "8008"]

# docker build --platform linux/amd64 --build-arg ENVIRONMENT=staging -t amir316/admin-webapp .
# docker run -p  3000:80 amir316/admin-webapp