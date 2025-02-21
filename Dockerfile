FROM node:20-alpine

WORKDIR /app

COPY ../../package.json ../../yarn.lock ./

ARG ENV_PATH
COPY ${ENV_PATH} ./

RUN apk add --no-cache python3 make g++ && yarn install --frozen-lockfile

COPY . .

ENV NODE_ENV=development

EXPOSE 3000

CMD ["yarn", "start"]
