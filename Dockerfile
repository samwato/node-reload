# syntax=docker/dockerfile:1

FROM node:16-alpine as base

WORKDIR /app


FROM base AS development

COPY package*.json ./
ENV NODE_ENV=development
RUN npm i

CMD ["npm", "run", "dev"]


FROM base as build

COPY package*.json ./
ENV NODE_ENV=development
RUN npm i


CMD ["npm", "run", "build"]


FROM base AS production

COPY package.json ./
ENV NODE_ENV=production

COPY --from=build server.js /app/server.js
COPY certs /app/certs

CMD ["npm", "run", "serve"]

