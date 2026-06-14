FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG API_URL=http://localhost:8080
RUN sed -i "s|__API_URL__|${API_URL}|g" src/environments/environment.prod.ts

RUN npm run build

FROM nginx:alpine

ENV PORT=80

COPY --from=build /app/dist/vita-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
