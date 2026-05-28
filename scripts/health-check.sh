#!/bin/bash
# ---------------------------------------------------------
# BazarX Docker Health Check Script
# ---------------------------------------------------------

echo "🔍 BazarX Sistem Durumu Kontrol Ediliyor..."
echo "---------------------------------------------------------"

# Bütün container'ların isimlerini al
CONTAINERS=$(docker ps -a --format "{{.Names}}")

if [ -z "$CONTAINERS" ]; then
    echo "⚠️ Hiç çalışan Docker container'ı bulunamadı!"
    exit 1
fi

for CONTAINER in $CONTAINERS; do
    # Eğer isimde bazarx geçmiyorsa atla (Sadece BazarX servislerini listele)
    if [[ ! "$CONTAINER" == *"bazarx"* ]] && [[ ! "$CONTAINER" == *"barter"* ]]; then
        # Sadece bizim projeyle ilgili olanları kontrol edelim (opsiyonel)
        # İsterseniz bu if bloğunu tamamen kaldırıp sunucudaki her şeyi listeleyebilirsiniz.
        continue
    fi

    # Container'ın state ve health bilgilerini çek
    STATE=$(docker inspect --format='{{.State.Status}}' "$CONTAINER" 2>/dev/null)
    HEALTH=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$CONTAINER" 2>/dev/null)

    # Duruma göre ikon ve mesaj belirle
    if [ "$STATE" == "running" ]; then
        if [ "$HEALTH" == "healthy" ]; then
            echo "✅ $CONTAINER: healthy"
        elif [ "$HEALTH" == "unhealthy" ]; then
            echo "❌ $CONTAINER: unhealthy"
        elif [ "$HEALTH" == "starting" ]; then
            echo "⏳ $CONTAINER: starting"
        else
            echo "✅ $CONTAINER: up"
        fi
    elif [ "$STATE" == "exited" ]; then
        echo "🛑 $CONTAINER: exited (down)"
    elif [ "$STATE" == "restarting" ]; then
        echo "🔄 $CONTAINER: restarting"
    else
        echo "⚠️ $CONTAINER: $STATE"
    fi
done

echo "---------------------------------------------------------"
echo "Sistem Raporu Tamamlandı."
