# ───────────────────────────────────────────────
# Frontend Dockerfile — Multi-Stage Nuxt.js SSR
# ───────────────────────────────────────────────
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci

# Uygulama kodunu kopyala
COPY . .

# Production build
RUN npm run build

# ───────────────────────────────────────────────
# Stage 2: Production Runtime (minimal)
FROM node:20-alpine AS runner

WORKDIR /app

# Minimal runtime bağımlılıkları
RUN apk add --no-cache wget tini

# Non-root user oluştur (güvenlik)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nuxtjs

# Sadece Nuxt output'u ve gerekli dosyaları kopyala
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Non-root kullanıcıya geç
USER nuxtjs

# Port
EXPOSE 3000

# Ortam değişkenleri
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Tini ile PID 1 olarak başlat
ENTRYPOINT ["tini", "--"]

# Başlatma komutu
CMD ["node", ".output/server/index.mjs"]
