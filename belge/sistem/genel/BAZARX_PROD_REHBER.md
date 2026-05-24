# 🚀 BazarX Production Yönetim Rehberi

Bu belge, BazarX (BarterBorsa V2) platformunun production ortamındaki yönetimi, güncellenmesi ve bakımı için gerekli tüm komutları ve bilgileri içerir.

> **Veritabanı:** MongoDB + Mongoose. PostgreSQL/Prisma kullanılmamaktadır.
> **Transactions için** MongoDB replica set zorunludur.

---

## 🏗️ Sistemi Başlatma ve Durdurma

### Sistemi Başlat (Arka Planda)
```bash
cd ~/bazarx
sudo docker compose -f docker-compose.prod.yml up -d
```

### Sistemi Durdur
```bash
cd ~/bazarx
sudo docker compose -f docker-compose.prod.yml down
```

### Sistemi Yeniden Başlat (Yapılandırma Değişikliklerinde)
```bash
sudo docker compose -f docker-compose.prod.yml up -d --force-recreate
```

---

## 🔍 İzleme ve Loglar

### Konteynır Durumlarını Gör
```bash
sudo docker ps
```

### Backend Loglarını İzle (Anlık)
```bash
sudo docker logs -f bazarx_backend
```

### Nginx Hatalarını Gör
```bash
sudo docker logs bazarx_nginx
```

### MongoDB Loglarını Gör
```bash
sudo docker logs bazarx_mongo
```

### Ngrok Linkini Al (Dış Erişim İçin)
```bash
sudo docker logs bazarx_ngrok
```

---

## 🗄️ Veritabanı İşlemleri (MongoDB)

### MongoDB'ye Bağlan (Mongo Shell)
```bash
sudo docker exec -it bazarx_mongo mongosh -u admin -p <MONGODB_PASSWORD> --authenticationDatabase admin
```

### Replica Set Başlatma (Transactions için zorunlu — ilk kurulumda bir kez)
```bash
sudo docker exec -it bazarx_mongo mongosh --eval "rs.initiate()"
# Durum kontrolü:
sudo docker exec -it bazarx_mongo mongosh --eval "rs.status()"
```

### Index'leri Sync Et
```bash
sudo docker exec -it bazarx_backend sh -c "node dist/scripts/sync-indexes.js"
# veya dev ortamında:
pnpm --filter backend mongoose:sync-indexes
```

### Veritabanını Sıfırdan Doldur (Seed)
```bash
sudo docker exec -it bazarx_backend sh -c "node dist/scripts/seed.js"
```

### Redis Önbelleğini Temizle
```bash
sudo docker exec bazarx_redis redis-cli -a <REDIS_PASSWORD> flushall
```

### MongoDB Koleksiyon Listesi (Kontrol)
```bash
sudo docker exec -it bazarx_mongo mongosh bazarx --eval "db.getCollectionNames()"
```

### Yedek Al (Dump)
```bash
sudo docker exec bazarx_mongo mongodump \
  --uri="mongodb://admin:<MONGODB_PASSWORD>@localhost:27017/bazarx?authSource=admin" \
  --out=/backup/$(date +%Y%m%d)
```

### Yedekten Geri Yükle (Restore)
```bash
sudo docker exec bazarx_mongo mongorestore \
  --uri="mongodb://admin:<MONGODB_PASSWORD>@localhost:27017/bazarx?authSource=admin" \
  /backup/<tarih>/bazarx
```

---

## 🌐 Ağ ve Erişim Yapılandırması

### Ngrok Token Güncelleme
`.env` dosyasındaki `NGROK_AUTHTOKEN` değerini değiştirdikten sonra:
```bash
sudo docker compose -f docker-compose.prod.yml up -d --force-recreate ngrok
```

### Nginx Yapılandırması
Yapılandırma dosyaları `~/bazarx/nginx/conf.d/` altındadır:
```bash
sudo docker restart bazarx_nginx
```

---

## 🚀 Yeni Kod Güncelleme (Deployment)

```bash
# 1. Lokalden dosyaları gönder
rsync -avz ./apps/backend bazarx_server:~/bazarx/apps/

# 2. Sunucuda backend'i rebuild et
sudo docker compose -f docker-compose.prod.yml up -d --build backend

# 3. Index sync (schema değişikliği varsa)
sudo docker exec -it bazarx_backend sh -c "node dist/scripts/sync-indexes.js"
```

---

## 🔧 Kritik ENV Değişkenleri

```bash
# MongoDB
MONGODB_URI=mongodb://admin:<MONGODB_PASSWORD>@mongo:27017/bazarx?authSource=admin&replicaSet=rs0
MONGODB_PASSWORD=<güçlü şifre>

# Redis
REDIS_URL=redis://:<REDIS_PASSWORD>@redis:6379
REDIS_PASSWORD=<güçlü şifre>

# JWT
JWT_SECRET=<openssl rand -base64 64>
JWT_REFRESH_SECRET=<openssl rand -base64 64>

# gRPC
FINANCIAL_GRPC_URL=financial-service:50051

# Iyzico
IYZICO_API_KEY=<canlı key>
IYZICO_SECRET_KEY=<canlı key>

# Google OAuth
GOOGLE_CLIENT_ID=<Google Cloud Console>
GOOGLE_CLIENT_SECRET=<Google Cloud Console>
```

---

## 🩺 Sağlık Kontrolleri

```bash
# Backend API sağlığı
curl http://localhost:3001/health

# MongoDB bağlantısı
sudo docker exec bazarx_mongo mongosh --eval "db.adminCommand({ ping: 1 })"

# Replica set durumu
sudo docker exec bazarx_mongo mongosh --eval "rs.status()"

# Redis bağlantısı
sudo docker exec bazarx_redis redis-cli -a <REDIS_PASSWORD> ping
```

---

**Not:** Sistem Port 80 (HTTP) üzerinden çalışacak şekilde Nginx tarafında optimize edilmiştir. Ngrok tüneli üzerinden güvenli (HTTPS) erişim sağlanmaktadır.
