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
1. Önce takılı kalan mevcut yapıyı durduralım:

bash


docker compose -f docker-compose.prod.yml down
2. Artık var olmayan ve sorun çıkaran hatalı ağ bağlantılarını temizleyelim:

bash


docker network prune -f
3. Şimdi her şeyi tekrar, temiz bir şekilde ayağa kaldıralım:

bash


docker compose -f docker-compose.prod.yml up -d
Konteynerlerin Durumu:

bash
ssh shayzaran@188.119.3.242 "cd ~/bazarx && docker compose -f docker-compose.prod.yml ps"
Backend Logları (Özellikle Database Bağlantısı):

bash
ssh shayzaran@188.119.3.242 "cd ~/bazarx && docker compose -f docker-compose.prod.yml logs --tail=50 backend"
Hatalı Durum Var mı? (Restart atan konteyner var mı?): Eğer ps çıktısında Exit veya Restarting görüyorsak o servisin loglarına derinlemesine bakmamız gerekecek.bazarx


Yerelde çalışıp sunucuda (server) çalışmamasının (özellikle kodlar birebir aynı olmasına rağmen) arkasında genellikle derleme (build), veritabanı senkronizasyonu veya önbellek (cache) ile ilgili temel adımların atlanması yatar. `git pull` sadece kaynak kodları (TypeScript, Vue dosyaları vb.) günceller; ancak çalışan uygulama bu ham kodları değil, derlenmiş çıktıları okur.

Bu sorunu kalıcı olarak çözmek için sunucu tarafında aşağıdaki 4 temel adımı sırasıyla uygulamanız gerekiyor:

### 1. Uygulamayı Yeniden Derleyin (Build İşlemi)
Sizin uygulamanız muhtemelen NestJS (backend) ve Nuxt/Vue (frontend) kullanıyor. Bunlar TypeScript tabanlıdır ve sunucunun yeni kodları algılaması için derlenmesi şarttır:
```bash
# Bağımlılıkları güncelleyin (yeni bir paket eklendiyse diye)
pnpm install

# Backend ve Frontend'i yeniden derleyin
pnpm build
```
*(Eğer ayrı ayrı klasörlerde derliyorsanız `cd apps/backend && pnpm build` ve `cd apps/frontend && pnpm build` şeklinde ilerleyin)*

### 2. Prisma Veritabanı ve İstemcisini (Client) Güncelleyin
Kategori gizleme (isHidden / isActive gibi) işlemleri için veritabanı şemasına yeni bir alan eklediysek, sunucudaki veritabanının da bundan haberi olmalıdır:
```bash
# Prisma Client'ı yeniden oluşturun (yeni tiplerin algılanması için)
npx prisma generate

# Eğer veritabanı yapısında bir değişiklik varsa sunucu veritabanına uygulayın
# (Not: Eğer migrate kullanıyorsanız 'migrate deploy' yapın)
npx prisma db push
```

### 3. Uygulamayı Yeniden Başlatın
Sadece derlemek yetmez, hafızadaki (RAM) eski çalışan versiyonu kapatıp yeni derlenen versiyonu başlatmalısınız. Genelde sunucularda PM2 veya Docker kullanılır.

**Eğer PM2 kullanıyorsanız:**
```bash
pm2 restart all
# veya belirli servisleri: pm2 restart backend frontend
```

**Eğer Docker / Docker Compose kullanıyorsanız:**
```bash
docker-compose down
docker-compose up -d --build
```

### 4. Önbelleği (Cache / Redis) Temizleyin
Kategoriler veya ürünler Redis tarafında önbelleğe alınıyorsa, eski veriler gelmeye devam ediyor olabilir. Uygulama güncellendikten sonra eski önbelleği temizlemek iyi bir pratiktir:
```bash
# Eğer Redis kullanıyorsanız sunucuda:
redis-cli flushall
```

**Özetle Sunucuda Yapmanız Gereken "Güncelleme Ritüeli":**
1. `git pull origin main`
2. `pnpm install`
3. `npx prisma generate` *(gerekirse `db push`)*
4. `pnpm build`
5. `pm2 restart all` *(veya uygulamanızı nasıl yönetiyorsanız)*

Bu adımları uyguladığınızda sorun büyük ihtimalle çözülecektir. Lütfen sunucuda bu adımları (özellikle **build** ve **restart**) çalıştırıp sonucu kontrol eder misiniz?