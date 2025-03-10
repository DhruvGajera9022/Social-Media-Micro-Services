FROM node:18-alpine

WORKDIR /use/src/app

COPY package*.json ./

RUN npm cli --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]