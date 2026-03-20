FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js .
COPY middlewares/ ./middlewares/
COPY routes/ ./routes/
COPY controllers/ ./controllers/
COPY services/ ./services/
COPY config/ ./config/
EXPOSE 3000
CMD ["node", "server.js"]
