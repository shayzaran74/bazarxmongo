#!/bin/bash
# ---------------------------------------------------------
# BazarX Production Deployment Script
# ---------------------------------------------------------

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 BazarX Güncelleme ve Dağıtım İşlemi Başlıyor..."

# 1. Nuxt Telemetry'i kapat (Build işlemi sırasında takılmayı önler)
export NUXT_TELEMETRY_DISABLED=1
echo "✅ Nuxt Telemetry devre dışı bırakıldı."

# 2. Github'dan güncel kodları çek
echo "⬇️  Github üzerinden güncel kodlar indiriliyor..."
git pull origin main
echo "✅ Kodlar güncellendi."

# 3. Mevcut Docker konteynerlerini durdur
echo "🛑 Mevcut konteynerler durduruluyor..."
docker compose -f docker-compose.prod.yml down
echo "✅ Konteynerler durduruldu."

# 4. Yeni kodlarla Docker konteynerlerini yeniden inşa et ve başlat
echo "🏗️  Projeler derleniyor (Build) ve yeniden ayağa kaldırılıyor..."
docker compose -f docker-compose.prod.yml up -d --build
echo "✅ Sistem başarıyla ayağa kaldırıldı."

# 4.5. Veritabanı Şemasını Güncelle (Prisma)
echo "🗄️  Veritabanı şeması güncelleniyor (Prisma)..."
# Konteynerler tam ayağa kalkıp veritabanı bağlantısı kurulması için 5 saniye bekle
sleep 5
docker compose -f docker-compose.prod.yml exec -T backend npx prisma db push --accept-data-loss
echo "✅ Veritabanı başarıyla güncel kodlarla eşitlendi."

# 5. Sunucuda yer açmak için logları ve kullanılmayan imajları temizle
echo "🧹 Gereksiz imajlar, build önbelleği ve loglar temizleniyor..."

# Kullanılmayan (dangling) imajları siler (Disk açar)
docker image prune -f

# Docker build önbelleğini temizler (Çok ciddi disk açar)
docker builder prune -a -f

# Docker konteyner loglarını temizler (Eski logların diski doldurmasını engeller)
sudo sh -c 'truncate -s 0 /var/lib/docker/containers/*/*-json.log' || true

echo "✅ Disk temizliği tamamlandı."

# 6. İşletim sistemi RAM önbelleğini (Cache) temizle
echo "🧠 RAM (Bellek) önbelleği boşaltılıyor..."
sudo sh -c 'sync; echo 3 > /proc/sys/vm/drop_caches' || true
echo "✅ Bellek temizliği tamamlandı."

echo "🎉 Güncelleme Başarıyla Tamamlandı! BazarX yayında."
