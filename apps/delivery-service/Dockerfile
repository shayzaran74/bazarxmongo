FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Proje dosyalarını kopyala
COPY . .

# Bağımlılıkları yükle ve build al
RUN pnpm install
RUN npx turbo run build --filter=@barterborsa/delivery-service...

FROM node:20-alpine AS runner

WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app ./

EXPOSE 3002
CMD ["pnpm", "--filter", "@barterborsa/delivery-service", "run", "start"]

