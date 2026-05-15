# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Verify dist/main.js was produced; print structure and fail if not
RUN test -f dist/main.js || \
    (echo "=== dist structure ===" && find dist -name "*.js" | head -20 && exit 1)

# Create a runtime path-alias register so production can resolve @domain/* etc.
RUN printf "require('tsconfig-paths').register({\n\
  baseUrl: __dirname,\n\
  paths: {\n\
    '@domain/*':         ['./domain/*'],\n\
    '@application/*':    ['./application/*'],\n\
    '@infrastructure/*': ['./infrastructure/*'],\n\
    '@presentation/*':   ['./presentation/*']\n\
  }\n\
});\n" > dist/register.js

# ---- Migrate Stage ----
FROM builder AS migrate
ENV NODE_ENV=production
CMD ["npx", "typeorm-ts-node-commonjs", "migration:run", "-d", "ormconfig.ts"]

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm install --no-save tsconfig-paths

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "-r", "/app/dist/register.js", "dist/main"]
