FROM node:lts-alpine as build-stage

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Then source
COPY . .

# Run the vue development server.
EXPOSE 8080
CMD ["docker/run.sh"]
