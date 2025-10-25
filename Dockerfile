# Build stage
FROM node:22-alpine AS builder

RUN apk update && apk upgrade --no-cache

WORKDIR /app
COPY package.json yarn.lock ./

ARG ENV_PATH
COPY ${ENV_PATH} ./

RUN apk add --no-cache python3 make g++ && \
    yarn cache clean && \
    yarn install --frozen-lockfile && \
    apk del python3 make g++

COPY . .

# Production stage
FROM node:22-alpine AS production

RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Copy only the necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY . .

ENV NODE_ENV=development
EXPOSE 3000
CMD ["yarn","start"]
