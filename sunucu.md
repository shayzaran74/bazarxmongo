# BazarX Sunucu Yönetim ve Kurulum Rehberi

Bu belge, BazarX e-ticaret sisteminin (bazarxmongo) canlı sunucuda (Production) "Kurumsal Seviye" (Corporate Grade) kaliteye ulaşması için yapılan tüm optimizasyon, güvenlik, yedekleme ve hata giderme adımlarını kronolojik olarak listeler.

---

## 1. Dağıtım ve Otomasyon (Deployment)

Sunucudaki kodları güncellemek, yeni veritabanı şemalarını (Prisma) uygulamak ve sistemi en baştan temiz bir şekilde ayağa kaldırmak için otomatik bir dağıtım betiği oluşturduk.

**Dosya:** `scripts/deploy-prod.sh`

**İçeriğinde Yapılan İşlemler:**
- `NUXT_TELEMETRY_DISABLED=1` : Nuxt'un veri göndermesini kapatarak RAM şişmesini/takılmasını engeller.
- `git pull origin main` : En güncel kodları çeker.
- `docker compose ... up -d --build` : Yeni kodlarla imajları tekrar oluşturur ve servisleri başlatır.
- `npx prisma db push --accept-data-loss` : Local'de yazdığımız yeni veritabanı alanlarını (IBAN, TC No vb.) canlı PostgreSQL veritabanında otomatik açar.
- `docker image prune -f` & `docker builder prune` : Kullanılmayan eski Docker kalıntılarını silerek SSD'de yer açar.
- `truncate -s 0 ...` : Docker'ın şişen log dosyalarını temizler.
- `echo 3 > /proc/sys/vm/drop_caches` : Linux RAM önbelleğini boşaltır.

**Kullanımı:**
```bash
# Her kod güncellemesinden sonra sunucuda çalıştırılması gereken tek komut:
./scripts/deploy-prod.sh
```

---

## 2. Sistem Sağlık Kontrolü (Health-Check)

BazarX'in tüm mikro servislerinin (Frontend, Backend, Nginx, Veritabanları) anlık durumunu (`healthy`, `restarting`, `unhealthy`) tek ekranda tablo halinde gösteren bir betik yazdık.

**Dosya:** `scripts/health-check.sh`

**Kullanımı:**
```bash
./scripts/health-check.sh
```
*(Eğer bir servis çökerse veya hata verirse, hangi servisin problemli olduğunu anında görmek için kullanılır).*

---

## 3. MongoDB Şifreleme (Replica Set) İzin Krizi ve Çözümü

MongoDB'nin şifreli çalışabilmesi için gereken `mongodb.key` dosyasının izinleri dışarıya çok açık (644) olduğu ve sahibi root olduğu için MongoDB `"permissions are too open"` diyerek çöktü. 

**Kullanılan Komutlar:**
```bash
# Dosyanın sahibini MongoDB'nin dahili izole kullanıcısına (999) verdik
sudo chown 999:999 mongodb.key

# İzinleri "Sadece sahibi okuyabilir" olarak en katı seviyeye çektik
sudo chmod 400 mongodb.key

# MongoDB'yi yeniden başlattık
docker compose -f docker-compose.prod.yml restart mongodb
```
*(Bu işlem 1 defaya mahsustur. Bir daha asla MongoDB izin hatası vermeyecektir).*

---

## 4. Backend Güvenlik Anahtarı (Encryption Key) Eksikliği

Backend ayağa kalkarken `ENCRYPTION_KEY tanımlı değil` hatası verip sürekli yeniden başlıyordu. Bu durum Nginx'in de backend'i bulamayıp çökmesine sebep oluyordu.

**Çözümü:** Rastgele ve kırılmaz 32 karakterlik bir güvenlik şifresi üretip production çevre değişkenlerine yazdırdık.
```bash
echo "ENCRYPTION_KEY=$(openssl rand -hex 16)" >> apps/backend/.env.production
```

---

## 5. Otomatik Yedekleme Sistemi (Backup)

PostgreSQL ve MongoDB veritabanlarının tam dökümünü alıp, sıkıştıran ve sunucuda saklayan bir betik yazdık. Aynı zamanda disk dolmasın diye **7 günden eski yedekleri otomatik silecek** bir temizlik mantığı ekledik.

**Dosya:** `scripts/backup.sh`

**Kullanımı:**
```bash
./scripts/backup.sh
```

---

## 6. Yedeklerin Sunucu Dışına Çıkarılması (Off-site Google Drive)

Sunucuya donanımsal bir zarar gelmesi riskine karşı, alınan yedeklerin anında Google Drive'a kopyalanması için **Rclone** kurduk.

**Rclone Kurulumu:**
```bash
# Önce zip açıcı programı kurduk
sudo apt update && sudo apt install unzip -y

# Rclone yazılımını kurduk
sudo -v ; curl https://rclone.org/install.sh | sudo bash
```

**Rclone Konfigürasyonu:**
`rclone config` menüsü üzerinden `gdrive` adında yeni bir bağlantı oluşturduk. "Google Drive" (24) seçilip Full Access (1) verildi. Macbook üzerinde `rclone authorize` komutuyla tarayıcı onayı alınıp sunucuya yapıştırıldı.

**Otomasyon (Backup Script Entegrasyonu):**
`backup.sh` dosyasının içine şu komut eklendi, böylece yerel yedek biter bitmez otomatik buluta yükleniyor:
```bash
rclone copy "$TARGET_DIR" "gdrive:BazarX_Backups/$DATE"
```

---

## 7. Zamanlanmış Görevler (Cron Job - Gece Çalışması)

Yazdığımız yedekleme sisteminin manuel değil, biz uyurken (her gece saat 03:00'te) kendi kendine çalışması için sunucuya Cron kuralı tanımladık.

**Komut:** `crontab -e`
**Eklenen Kural:**
```bash
0 3 * * * cd /home/hayzaran/bazarxmongo && ./scripts/backup.sh >> /home/hayzaran/bazarxmongo/backups/cron_log.txt 2>&1
```

---

## 8. 7/24 Kesintisiz Uptime İzleme (UptimeRobot)

Sistemin çökmesi, Nginx'in durması veya veritabanının cevap vermemesi gibi felaket anlarında size 1 dakika içinde Acil Durum E-postası atması için bağımsız UptimeRobot kuruldu.

**İzlenen Adres:** `https://www.bazarx.info/api/v1/health`
**Protokol:** HTTP/S
**Mimari:** Nginx 443 portundan dış dünyaya açıldı, dışarıdan gelen istek Nginx üzerinden güvenli bir şekilde arka plandaki kapalı 3001 portundaki backend sağlık kontrolüne yönlendirildi. (Tam not alan yüksek güvenlikli firewall/proxy mimarisi).
