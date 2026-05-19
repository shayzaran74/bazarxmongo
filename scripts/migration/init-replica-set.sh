#!/bin/bash
# scripts/migration/init-replica-set.sh
# MongoDB replica set'i başlatır — docker-compose up sonrası çalıştırılır.
# Kullanım: bash scripts/migration/init-replica-set.sh

set -e

echo "MongoDB replica set init başlatılıyor..."

# Replica set'in hazır olmasını bekle
sleep 5

# rs.initiate() — mongo1 primary olarak başlar
docker exec bazarx-mongo1 mongosh --quiet --eval '
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "mongo1:27017", priority: 2 },
      { _id: 1, host: "mongo2:27017", priority: 1 },
      { _id: 2, host: "mongo3:27017", priority: 1 }
    ]
  });
'

echo "Replica set initiate edildi. Primary seçimi için 10 sn bekleniyor..."
sleep 10

# Status kontrolü
docker exec bazarx-mongo1 mongosh --quiet --eval 'rs.status().ok' | grep -q "1" && echo "✅ Replica set OK" || echo "❌ Replica set hatası"

# Read/Write concern test
docker exec bazarx-mongo1 mongosh --quiet --eval '
  db.adminCommand({
    setDefaultRWConcern: 1,
    defaultWriteConcern: { w: "majority" }
  });
'
echo "✅ Write concern majority olarak ayarlandı"