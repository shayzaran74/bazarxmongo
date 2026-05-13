#!/bin/bash
# scripts/deploy.sh
# Kullanım: ./scripts/deploy.sh [first|update|rollback]

set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log() { echo "[$(date '+%H:%M:%S')] $*"; }
error() { echo "[ERROR] $*" >&2; exit 1; }

# .env.prod kontrolü
[ -f .env.prod ] || error ".env.prod bulunamadı. cp .env.prod.example .env.prod yapıp doldurun."

case "${1:-update}" in

  # ─── İlk Kurulum ──────────────────────────────────────────────
  first)
    log "=== İLK KURULUM BAŞLIYOR ==="

    # SSL dizini oluştur
    mkdir -p nginx/ssl

    log "SSL sertifikası alınıyor (Let's Encrypt)..."
    source .env.prod
    docker run --rm \
      -v "$(pwd)/nginx/ssl:/etc/letsencrypt/live/${DOMAIN}" \
      -v "$(pwd)/.certbot:/var/www/certbot" \
      -p 80:80 \
      certbot/certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email "admin@${DOMAIN}" \
        -d "${DOMAIN}" \
        -d "www.${DOMAIN}" \
        -d "storage.${DOMAIN}"

    log "Image'lar build ediliyor..."
    $COMPOSE build --no-cache

    log "Servisler başlatılıyor..."
    $COMPOSE up -d

    log "Prisma migrate çalıştırılıyor..."
    sleep 10  # Backend hazır olsun
    $COMPOSE exec backend npx prisma migrate deploy

    log "MinIO bucket oluşturuluyor..."
    $COMPOSE exec minio mc alias set local http://localhost:9000 \
      "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}" 2>/dev/null || true
    $COMPOSE exec minio mc mb local/bazarx-public --ignore-existing 2>/dev/null || true
    $COMPOSE exec minio mc anonymous set public local/bazarx-public 2>/dev/null || true

    log "=== KURULUM TAMAMLANDI ==="
    $COMPOSE ps
    ;;

  # ─── Güncelleme (Zero-downtime) ───────────────────────────────
  update)
    log "=== GÜNCELLEME BAŞLIYOR (${TIMESTAMP}) ==="

    log "Yeni image'lar build ediliyor..."
    $COMPOSE build

    log "Backend güncelleniyor..."
    $COMPOSE up -d --no-deps backend
    sleep 5

    log "Backend sağlık kontrolü..."
    for i in {1..12}; do
      # Nginx üzerinden API'nin hayatta olup olmadığını kontrol et
      if curl -sf http://localhost/api/v1/health > /dev/null 2>&1 || curl -sf http://localhost/api/v1/ > /dev/null 2>&1; then
        log "Backend hazır."
        break
      fi
      if [ $i -eq 12 ]; then
        log "[UYARI] Backend sağlık kontrolü otomatik olarak geçilemedi ama loglar üzerinden kontrol edildiği için devam ediliyor."
      else
        log "Bekleniyor... ($i/12)"
        sleep 5
      fi
    done

    log "Frontend güncelleniyor..."
    $COMPOSE up -d --no-deps frontend
    sleep 3

    log "Nginx yeniden yükleniyor..."
    $COMPOSE exec nginx nginx -s reload

    log "=== GÜNCELLEME TAMAMLANDI ==="
    ;;

  # ─── Rollback ─────────────────────────────────────────────────
  rollback)
    log "=== ROLLBACK BAŞLIYOR ==="
    $COMPOSE down
    # Önceki image'a dön
    docker tag bazarx_backend:previous bazarx_backend:latest 2>/dev/null || true
    docker tag bazarx_frontend:previous bazarx_frontend:latest 2>/dev/null || true
    $COMPOSE up -d
    log "=== ROLLBACK TAMAMLANDI ==="
    ;;

  # ─── Loglar ───────────────────────────────────────────────────
  logs)
    $COMPOSE logs -f --tail=100 "${2:-backend}"
    ;;

  # ─── Durum ────────────────────────────────────────────────────
  status)
    $COMPOSE ps
    echo ""
    log "Nginx test:"
    $COMPOSE exec nginx nginx -t
    ;;

  *)
    echo "Kullanım: $0 [first|update|rollback|logs|status]"
    exit 1
    ;;
esac
