FROM node:20-alpine
WORKDIR /app
COPY services/customer-service/package*.json ./
RUN npm install --omit=dev
COPY services/customer-service/src ./src
COPY proto ./proto
USER node
EXPOSE 3002 50052
CMD ["node", "src/server.js"]