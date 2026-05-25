FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@9

COPY . .
RUN find . -name "*.tsbuildinfo" -delete || true
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:20-alpine AS runner

WORKDIR /app
RUN apk add --no-cache tini && npm install -g pnpm@9

COPY --from=builder /app ./

EXPOSE 3002
ENTRYPOINT ["tini", "--"]
CMD ["pnpm", "--filter", "@barterborsa/delivery-service", "run", "start"]
