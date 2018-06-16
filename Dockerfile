
FROM node:10

ADD ./package.json ./package-lock.json /opt/app/

RUN npm install 

ADD . /opt/app/

ENTRYPOINT [ "npm", "run", "start" ]

