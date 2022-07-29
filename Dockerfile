FROM node:lts-alpine as build-stage

WORKDIR /app

RUN apk add dumb-init

# Install dependencies first
COPY package*.json ./
RUN npm install

# Then source
COPY . .

# Run the vue development server.
EXPOSE 8080
ENTRYPOINT ["dumb-init", "docker/run.sh"]
