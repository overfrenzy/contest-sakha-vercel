FROM node:14-alpine

WORKDIR /app

RUN apk add --no-cache build-base

COPY package.json package-lock.json /app/

RUN npm i --production

COPY . /app/

CMD ["node", "index.mjs"]