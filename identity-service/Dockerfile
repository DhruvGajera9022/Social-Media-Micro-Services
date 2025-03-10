FROM node:18-alpine

WORKDIR /use/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3001

CMD ["node", "src/server.js"]