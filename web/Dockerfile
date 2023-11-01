FROM node:18.18-slim

WORKDIR /app

COPY ./ ./

RUN npm install --silent
RUN npm i react-scripts -g --silent

CMD ["npm", "start"]
