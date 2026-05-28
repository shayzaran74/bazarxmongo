#!/bin/bash
# ---------------------------------------------------------
# BazarX Otomatik Veritabanı Yedekleme Scripti
# ---------------------------------------------------------

# Hata durumunda çıkış yap
set -e

# Yedeklerin tutulacağı ana klasör (Proje dizini içinde backups)
BACKUP_DIR="./backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
TARGET_DIR="$BACKUP_DIR/$DATE"

echo "📦 Yedekleme işlemi başlatılıyor: $DATE"

# Klasörleri oluştur (Yoksa)
mkdir -p "$TARGET_DIR"

# 1. PostgreSQL Yedeği Alınması
# pg_dump komutu konteyner içinde çalıştırılır ve çıktı sıkıştırılarak dışarıya kaydedilir.
echo "⏳ PostgreSQL yedeği alınıyor..."
docker exec bazarx-postgresql-prod sh -c 'pg_dump -U $POSTGRES_USER $POSTGRES_DB' | gzip > "$TARGET_DIR/postgres_backup_$DATE.sql.gz"
echo "✅ PostgreSQL yedeği tamamlandı."

# 2. MongoDB Yedeği Alınması
# mongodump komutu çalıştırılarak arşiv (archive) modunda sıkıştırılmış yedek alınır.
echo "⏳ MongoDB yedeği alınıyor..."
docker exec bazarx-mongodb-prod sh -c 'mongodump --username $MONGO_INITDB_ROOT_USERNAME --password $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin --archive --gzip' > "$TARGET_DIR/mongo_backup_$DATE.archive"
echo "✅ MongoDB yedeği tamamlandı."

# 3. Eski Yedeklerin Temizlenmesi (Sadece son 7 günlük yedeği tutar)
echo "🧹 7 günden eski yedekler temizleniyor..."
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} +
echo "✅ Temizlik tamamlandı."

# 4. Yedeklerin Google Drive'a Yüklenmesi (Off-site Backup)
# 'gdrive' burada rclone config sırasında vereceğimiz bağlantı ismidir.
echo "☁️ Yedekler Google Drive'a kopyalanıyor..."
# Sadece yeni aldığımız yedeği Drive içindeki BazarX_Backups klasörüne gönderiyoruz.
rclone copy "$TARGET_DIR" "gdrive:BazarX_Backups/$DATE"
echo "✅ Google Drive aktarımı tamamlandı."

echo "---------------------------------------------------------"
echo "🎉 Tüm yedekler başarıyla alındı, sıkıştırıldı ve Google Drive'a kopyalandı!"
echo "📂 Yedek konumu: $TARGET_DIR"
echo "---------------------------------------------------------"