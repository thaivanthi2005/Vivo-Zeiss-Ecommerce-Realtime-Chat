FROM node:20-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --omit=dev

   FROM node:20-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   ENV PORT=3000
   RUN addgroup -S app && adduser -S app -G app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   USER app
   EXPOSE 3000
   CMD ["node", "index.js"]
