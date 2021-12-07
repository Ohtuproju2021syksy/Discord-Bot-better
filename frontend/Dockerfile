FROM node:16.8-alpine

WORKDIR /usr/src/app/

COPY package* ./

RUN npm ci

COPY . .

# RUN npm run build

CMD npm start