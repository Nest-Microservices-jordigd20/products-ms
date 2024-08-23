FROM node:21-alpine3.19

RUN corepack enable pnpm && corepack install -g pnpm@latest-9

WORKDIR /usr/src/app

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .

RUN pnpm exec prisma generate

EXPOSE 3001



# FROM node:21-alpine3.19
# WORKDIR /usr/src/app
# COPY package*.json package-lock.json ./
# RUN npm install
# COPY . .

# EXPOSE 3000