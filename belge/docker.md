# 1. Tüm çalışan konteynerları durdur
docker stop $(docker ps -aq)

# 2. Tüm konteynerları sil
docker rm $(docker ps -aq)

# 3. Tüm imajları (images) sil
docker rmi $(docker images -aq) -f

# 4. Tüm volume'ları (veritabanı verileri vb.) sil
docker volume rm $(docker volume ls -q)

# 5. Kullanılmayan networkleri temizle
docker network prune -f

# 6. EN KESİN ÇÖZÜM: Docker sistemindeki her şeyi (cache dahil) temizle
docker system prune -a --volumes -f


# Cache kullanmadan imajları baştan oluştur
docker compose build --no-cache

# Servisleri arka planda (detached) başlat
docker compose up -d

Her şeyin doğru çalıştığından emin olmak için logları izleyebilirsin:
docker compose logs -f

# seed dosyasını sunucuda çalıştırmak için:
docker exec -it bazarx_backend node /app/belge/seed/seed.js


1. Dosyaları Sunucuya Kopyalama (rsync)
Gereksiz dosyaları (node_modules, .git, vb.) hariç tutarak sadece kaynak kodları gönderiyoruz:

rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.turbo' --exclude '.next' --exclude 'dist' --exclude 'apps/frontend/.output' --exclude 'apps/frontend/.nuxt' . shayzaran@188.119.3.242:~/bazarx
2. Sunucuda Build ve Başlatma
Kopyalama bittikten sonra sunucuya bağlanıp daha önce hazırladığımız deploy scriptini çalıştıralım:

bash
# Sunucuya bağlan ve build'i başlat
ssh shayzaran@188.119.3.242 "cd ~/bazarx && ./scripts/deploy.sh update"
TIP

Eğer sunucuda ilk kez kurulum yapıyorsan veya Docker'ı tamamen sıfırladıysan update yerine first komutunu (SSL sertifikası dahil kurulum için) kullanabilirsin: ./scripts/deploy.sh first


ssh shayzaran@188.119.3.242 "cd ~/bazarx && ./scripts/deploy.sh update"

ssh shayzaran@188.119.3.242 "cd ~/bazarx && docker compose -f docker-compose.prod.yml build --no-cache && docker compose -f docker-compose.prod.yml up -d"

Konteynerlerin Durumu:

bash
ssh shayzaran@188.119.3.242 "cd ~/bazarx && docker compose -f docker-compose.prod.yml ps"
Backend Logları (Özellikle Database Bağlantısı):

bash
ssh shayzaran@188.119.3.242 "cd ~/bazarx && docker compose -f docker-compose.prod.yml logs --tail=50 backend"
Hatalı Durum Var mı? (Restart atan konteyner var mı?): Eğer ps çıktısında Exit veya Restarting görüyorsak o servisin loglarına derinlemesine bakmamız gerekecek.bazarx
