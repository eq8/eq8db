FROM node:6.10.3-alpine

WORKDIR /opt/eq8store

COPY ./cli /opt/eq8store/cli
COPY package.json /opt/eq8store/package.json
RUN npm link --production

COPY ./docker-compose.yml /opt/eq8store/docker-compose.yml

COPY ./index.js /opt/eq8store/index.js

CMD eq8store
