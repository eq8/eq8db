FROM node:6.10.3-alpine

WORKDIR /opt/eq8store

COPY ./defaults.json /opt/eq8store/defaults.json
COPY ./bin /opt/eq8store/bin
COPY package.json /opt/eq8store/package.json
RUN npm link --production

COPY ./docker-compose.yml /opt/eq8store/docker-compose.yml

COPY ./index.js /opt/eq8store/index.js
COPY ./lib /opt/eq8store/lib

CMD eq8store
