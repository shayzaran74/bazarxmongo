FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@9

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build
RUN pnpm --filter=@barterborsa/delivery-service deploy /prod/delivery

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache wget tini && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nestjs

COPY --from=builder --chown=nestjs:nodejs /prod/delivery ./

USER nestjs

EXPOSE 3002

ENV NODE_ENV=production

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/apps/delivery-service/src/main.js"]
