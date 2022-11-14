FROM node:19-bullseye

EXPOSE 80

WORKDIR /var/app

COPY package*.json /var/app/
COPY test.js /var/app/server.js
RUN npm install

CMD [ "node", "server.js" ]
