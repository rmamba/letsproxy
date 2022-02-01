FROM node:16-alpine as build

COPY . .

ENV NODE_ENV production
RUN yarn
RUN yarn build

FROM nginx:1.21.6-alpine

ENV NODE_ENV production
COPY --from=build /build .

EXPOSE 3000
