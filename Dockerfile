# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci && npm install --no-save tsc-alias

COPY . .
RUN npm run build && npx tsc-alias

# ---- Migrate Stage ----
FROM builder AS migrate
ENV NODE_ENV=production
CMD ["npx", "typeorm-ts-node-commonjs", "migration:run", "-d", "ormconfig.ts"]

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
