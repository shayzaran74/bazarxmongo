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

# 5. (Opsiyonel) Sunucuda yer açmak için kullanılmayan (dangling) imajları temizle
# Bu işlem disk şişmesini önler.
echo "🧹 Gereksiz ve eski imajlar temizleniyor..."
docker image prune -f
echo "✅ Temizlik tamamlandı."

echo "🎉 Güncelleme Başarıyla Tamamlandı! BazarX yayında."
