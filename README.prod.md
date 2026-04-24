# BazarX — Prod Deploy Kılavuzu

## Dizin Yapısı

```
/bazarx/                          ← Repo kök
├── docker-compose.prod.yml
├── .env.prod                     ← gitignore'da (örnek: .env.prod.example)
├── nginx/
│   ├── nginx.conf
│   ├── conf.d/
│   │   └── bazarx.conf
│   └── ssl/                      ← Let's Encrypt sertifikaları
│       ├── fullchain.pem
│       └── privkey.pem
├── scripts/
│   └── deploy.sh
├── apps/
│   ├── frontend/
│   │   └── Dockerfile.prod
│   └── backend/
│       └── Dockerfile.prod
```

## İlk Kurulum (Sıfırdan)

```bash
# 1. Sunucuya bağlan
ssh user@sunucu_ip

# 2. Docker kur (Ubuntu)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# 3. Repo klonla
git clone https://github.com/bazarx/bazarx.git /bazarx
cd /bazarx

# 4. .env.prod oluştur ve doldur
cp .env.prod.example .env.prod
nano .env.prod  # Tüm değerleri doldur!

# 5. Nginx conf'ta domain'i güncelle
sed -i 's/bazarx.com.tr/SENIN_DOMAININ/g' nginx/conf.d/bazarx.conf

# 6. İlk kurulum
chmod +x scripts/deploy.sh
./scripts/deploy.sh first
```

## Güncelleme Deploy

```bash
cd /bazarx
git pull origin main
./scripts/deploy.sh update
```

## Socket.io Önemli Notlar

### Neden `ip_hash`?
Socket.io önce HTTP long-polling ile bağlanır, sonra WebSocket'e upgrade eder.
Bu süreçte birden fazla istek gelir. `ip_hash` olmadan farklı worker'lara
düşebilir ve oturum kopar.

### Polling → WebSocket geçişi
```
Client → Nginx → Backend
  1. POST /socket.io/?transport=polling  (handshake)
  2. GET  /socket.io/?transport=polling  (long-poll)
  3. GET  /socket.io/?transport=websocket (upgrade)
```
Tüm bu istekler `ip_hash` sayesinde aynı backend worker'ına gider.

### Prod'da Socket.io bağlantı URL'i
```typescript
// Store'larda socketUrl boş bırakıldığında:
// window.location.origin → https://bazarx.com.tr
// Nginx: /socket.io/ → backend:3001/socket.io/
```

### Backend CORS ayarı (NestJS main.ts)
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true,
});

// Socket.io gateway için de:
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  transports: ['polling', 'websocket'],
})
```

## SSL Yenileme (Otomatik)

```bash
# Crontab'a ekle (her 3 ayda bir)
0 3 1 */3 * cd /bazarx && docker run --rm \
  -v $(pwd)/nginx/ssl:/etc/letsencrypt/live/bazarx.com.tr \
  certbot/certbot renew && \
  docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## Monitoring

```bash
# Servis durumu
./scripts/deploy.sh status

# Backend logları
./scripts/deploy.sh logs backend

# Nginx access log
./scripts/deploy.sh logs nginx

# Tüm loglar
docker compose -f docker-compose.prod.yml logs -f

# Container stats
docker stats
```

## Sorun Giderme

### Socket.io bağlanamıyor
```bash
# Nginx config test
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Backend socket log
docker compose -f docker-compose.prod.yml logs backend | grep -i socket

# WebSocket upgrade header kontrolü
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     https://bazarx.com.tr/socket.io/?transport=websocket
```

### 502 Bad Gateway
```bash
# Backend ayakta mı?
docker compose -f docker-compose.prod.yml ps backend
docker compose -f docker-compose.prod.yml logs --tail=50 backend
```

### Prisma migration hatası
```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate status
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```


Tüm konfigürasyon dosyalarındaki bazarx.com ibareleri, senin belirttiğin gerçek alan adın olan bazarx.com.tr ile değiştirildi.

✅ Neler Güncellendi?
Nginx Yapılandırması: nginx/conf.d/bazarx.conf içindeki tüm server_name ve CORS Access-Control-Allow-Origin satırları güncellendi. Artık Nginx sadece senin domaininden gelen istekleri kabul edecek.
Deploy Kılavuzu: README.prod.md dökümantasyonu senin domainine göre güncellendi.
Tüm Proje: E-posta şablonları, test ortamları ve diğer yardımcı dosyalardaki tüm linkler bazarx.com.tr olarak revize edildi.
Artık tek yapman gereken sunucuya bağlandığında ilgili klasöre gidip şu komutu çalıştırmak:

bash
./scripts/deploy.sh first
Deployment altyapısı artık %100 senin markana ve domainine hazır durumda! Başka bir isteğin var mı?

