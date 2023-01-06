# Build
FROM node:lts-alpine as build

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Then build dist
COPY . .
RUN npm run build


# Deploy
FROM nginx:1.22

COPY --from=build /app/dist /app/dist
COPY docker/nginx-default.conf.template /etc/nginx/templates/default.conf.template

# Inherit nginx ENTRYPOINT/CMD
