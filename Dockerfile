# syntax=docker/dockerfile:1

FROM node:16-alpine as base

WORKDIR /app


FROM base AS development

COPY package*.json ./

ENV NODE_ENV=development

RUN npm i

CMD ["npm", "run", "serve"]


FROM base AS production

COPY package*.json ./

COPY app.js /app/app.js
COPY index.js /app/index.js

ENV NODE_ENV=production

RUN npm i

CMD ["npm", "run", "serve"]

