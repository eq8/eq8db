FROM node:8.11.1-alpine

WORKDIR /workspace

COPY package.json /workspace/
RUN npm install

COPY index.js /workspace/

CMD node index.js
