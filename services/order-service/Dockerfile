FROM node:20-alpine
WORKDIR /app
COPY services/order-service/package*.json ./
RUN npm install --omit=dev
COPY services/order-service/src ./src
COPY proto ./proto
USER node
EXPOSE 3004
CMD ["node", "src/server.js"]