ARG BASE_IMAGE=node:22-bookworm-slim
FROM ${BASE_IMAGE}

WORKDIR /app

# Prisma engines need OpenSSL; slim image is minimal
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# `npm ci` runs `postinstall` → `prisma generate` — `prisma/schema.prisma` must exist first
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

ENV NODE_ENV=production
ENV DATA_DIR=/data
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/pdf_ocr

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD node -e "require('http').get('http://127.0.0.1:8000/health',(r)=>{let d='';r.on('data',(c)=>d+=c);r.on('end',()=>process.exit(r.statusCode===200?0:1))}).on('error',()=>process.exit(1))"

CMD ["sh", "-c", "npx prisma db push && exec node dist/server.js"]
