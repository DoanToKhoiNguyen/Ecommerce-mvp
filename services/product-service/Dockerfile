FROM node:20-alpine
WORKDIR /app
COPY services/product-service/package*.json ./
RUN npm install --omit=dev
COPY services/product-service/src ./src
COPY proto ./proto
USER node
EXPOSE 3003 50053
CMD ["node", "src/server.js"]