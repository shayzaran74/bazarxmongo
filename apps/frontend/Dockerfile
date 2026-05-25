FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Proje dosyalarını kopyala
COPY . .

# Bağımlılıkları yükle ve build al
RUN pnpm install
RUN pnpm --filter ecommerce-frontend build

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "--filter", "ecommerce-frontend", "run", "start"]
