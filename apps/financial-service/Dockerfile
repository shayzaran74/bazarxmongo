FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Proje dosyalarını kopyala
COPY . .

# Bağımlılıkları yükle ve build al
RUN pnpm install
RUN npx turbo run build --filter=@barterborsa/financial-service...

FROM node:20-alpine AS runner

WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app ./

EXPOSE 50051
CMD ["pnpm", "--filter", "@barterborsa/financial-service", "run", "start"]

