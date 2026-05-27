FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Proje dosyalarını kopyala
COPY . .

# Bağımlılıkları yükle ve build al
RUN pnpm install
RUN npx turbo run build --filter=ecommerce-frontend...

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3000
CMD ["node", "apps/frontend/.output/server/index.mjs"]
