FROM node:8.11.3-alpine

ENV MVP_AUTHENTICATION_SECRET=secret
ENV MVP_STORE_URI=rethinkdb://admin@rethinkdb:28015

# install mvp
WORKDIR /opt/mvp

COPY ./bin /opt/mvp/bin
COPY package.json /opt/mvp/package.json
RUN npm link --production

COPY ./index.js /opt/mvp/index.js
COPY ./lib /opt/mvp/lib

CMD mvp --log-level=${LOG_LEVEL}
