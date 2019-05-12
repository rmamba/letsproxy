FROM alpine:3.5 AS acme

ENV GOPATH /tmp

RUN apk add --update build-base libcap-dev go bash git curl
RUN cd /tmp && \
    git config --global http.followRedirects true && \
    git clone https://github.com/hlandau/acme && \
    cd acme && \
    make && make install

FROM node:8-alpine

RUN apk add --update nginx openssl libcap

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json package.json
RUN npm install

# Bundle app source
COPY *.js ./
COPY static static
COPY scripts scripts
COPY nginx nginx
COPY modules modules
COPY express express
COPY views views
COPY --from=acme /usr/local/bin/acmetool /usr/local/bin/acmetool
# COPY --from=acme /var/lib/acme /var/lib/acme
COPY rootfs /

EXPOSE 80 443 3000

# CMD [ "node", "index.js" ]
COPY entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh && \
    mkdir -p /run/nginx && \
    mkdir -p /usr/src/app/cache && \
    mkdir -p /usr/src/app/acme && \
    mkdir -p /var/www/.well-known/acme-challenge && \
    mkdir -p /var/lib/acme/desired && \
    openssl dhparam -dsaparam -out /etc/nginx/dhparam.pem 2048 && \
    ln -s /usr/src/app/nginx/sites-available /etc/nginx/sites-available && \
    ln -s /var/lib/acme/desired /usr/src/app/acme/desired

RUN acmetool
# RUN sudo acmetool quickstart

CMD ./entrypoint.sh