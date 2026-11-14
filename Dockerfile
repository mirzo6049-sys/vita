FROM node:20-alpine
WORKDIR /app/api
COPY api/package.json ./
RUN npm install --omit=dev
COPY api/ ./
COPY web/ /app/web/
ENV PORT=3000 WEB_DIR=/app/web
EXPOSE 3000
CMD ["node", "server.js"]
