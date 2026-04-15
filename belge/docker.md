Not: Bu yapıya geçtikten sonra servisleri başlatmak için artık kök dizinden şu komutu kullanmalısınız: docker-compose -f infra/docker-compose.yml up -d

Sadece şu iki komutu bilmeniz yeterli:

Servisleri Başlat: npm run docker:up
Servisleri Durdur: npm run docker:down


npx prisma generate && npx prisma db push

İşlem tamam! 🚀 mongo-express servisini Docker konfigürasyonuna ekledim.

Bu değişikliğin devreye girmesi ve arayüze erişebilmeniz için terminalde (ana dizinde) şu komutu çalıştırmanız yeterli:

bash
docker-compose -f infra/docker-compose.yml up -d mongo-express
Konteyner ayağa kalktıktan sonra:

URL: http://localhost:8081
Giriş Kullanıcı Adı: admin
Giriş Şifresi: pass
(Not: Giriş yaptıktan sonra barterborsa_delivery veritabanını ve içindeki kargo verilerini tıpkı Prisma Studio'daki gibi görebileceksiniz.) 👋📦
