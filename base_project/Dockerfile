FROM node:14-alpine

RUN mkdir -p /app
WORKDIR /app
ADD package.json yarn.lock /app/
RUN yarn install 
ADD . /app