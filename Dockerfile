FROM node:16-alpine AS build
WORKDIR /build

COPY . .

RUN yarn install
RUN yarn build

FROM nginx:1.23.4-alpine
WORKDIR /usr/share/nginx/html

ENV NODE_ENV production
COPY --from=build /build/build .
