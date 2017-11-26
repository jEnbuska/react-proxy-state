FROM node:8.9.1-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN yarn install
CMD yarn build
