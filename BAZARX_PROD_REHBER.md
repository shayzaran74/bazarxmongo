# 🚀 BazarX Production Yönetim Rehberi

Bu belge, BazarX (BarterBorsa V2) platformunun production ortamındaki yönetimi, güncellenmesi ve bakımı için gerekli tüm komutları ve bilgileri içerir.

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

### Ngrok Linkini Al (Dış Erişim İçin)
```bash
sudo docker logs bazarx_ngrok
```

## 🗄️ Veritabanı ve Seed İşlemleri

### Veritabanını Sıfırdan Doldur (Seed)
Eğer veritabanı boşsa veya verileri tazelemek isterseniz:
```bash
sudo docker exec -it bazarx_backend sh -c "cd /app/belge/seed && npx tsx seed.js"
```

### Redis Önbelleğini Temizle
```bash
sudo docker exec bazarx_redis redis-cli -a barterborsa123 flushall
```

## 🌐 Ağ ve Erişim Yapılandırması

### Ngrok Token Güncelleme
`.env` dosyasındaki `NGROK_AUTHTOKEN` değerini değiştirdikten sonra:
```bash
sudo docker compose -f docker-compose.prod.yml up -d --force-recreate ngrok
```

### Nginx Yapılandırması
Yapılandırma dosyaları `~/bazarx/nginx/conf.d/` altındadır. Bir değişiklik yaparsanız Nginx'i restart etmelisiniz:
```bash
sudo docker restart bazarx_nginx
```

## 🚀 Yeni Kod Güncelleme (Deployment)

Lokalde yaptığınız değişiklikleri sunucuya yansıtmak için:
1. Lokalden dosyaları gönder: `rsync -avz ...`
2. Sunucuda ilgili servisi rebuild et:
```bash
sudo docker compose -f docker-compose.prod.yml up -d --build [servis_adi]
```

---
**Not:** Sistem şu an Port 80 (HTTP) üzerinden çalışacak şekilde Nginx tarafında optimize edilmiştir. Ngrok tüneli üzerinden güvenli (HTTPS) erişim sağlanmaktadır.
