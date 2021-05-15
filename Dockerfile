FROM node:14-alpine

WORKDIR /container

COPY /server/* /container 

RUN npm install --production

CMD ["node", "tracker"]