FROM mirror.gcr.io/library/node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
# Use npmmirror (accessible from RU/CIS) + generous timeouts to avoid hangs.
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 600000 && \
    npm install --no-audit --no-fund --legacy-peer-deps --prefer-offline

FROM mirror.gcr.io/library/node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM mirror.gcr.io/library/node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
EXPOSE 3000
CMD ["npm", "start"]
