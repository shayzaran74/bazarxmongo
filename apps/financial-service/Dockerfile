FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Proje dosyalarını kopyala
COPY . .

# Bağımlılıkları yükle ve build al
RUN pnpm install
RUN pnpm --filter @barterborsa/financial-service build

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app ./

EXPOSE 50051
CMD ["npm", "--filter", "@barterborsa/financial-service", "run", "start"]
