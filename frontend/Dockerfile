# Same BASE_IMAGE is used in all stages (set once via build-arg / compose).
ARG BASE_IMAGE=node:20-alpine
FROM ${BASE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Default: https://registry.npmjs.org (reliable from most networks).
# If npm is blocked/slow, build with: --build-arg NPM_REGISTRY=https://registry.npmmirror.com
ARG NPM_REGISTRY=
RUN if [ -n "$NPM_REGISTRY" ]; then npm config set registry "$NPM_REGISTRY"; fi && \
    npm ci --no-audit --no-fund --legacy-peer-deps

ARG BASE_IMAGE=node:20-alpine
FROM ${BASE_IMAGE} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next does not require public/; without it, runner COPY --from=builder /app/public fails
RUN mkdir -p public
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
EXPOSE 3000
# Next must listen on 0.0.0.0 so host:3000 → container is reachable (not only 127.0.0.1)
CMD ["npm", "start"]
