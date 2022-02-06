FROM node:16-alpine as build

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn

FROM node:16-alpine

WORKDIR /usr/src/app

COPY . .
COPY --from=build /node_modules /node_modules

EXPOSE 3005

CMD [ "node", "index.js" ]
