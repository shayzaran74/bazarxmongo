Not: Bu yapıya geçtikten sonra servisleri başlatmak için artık kök dizinden şu komutu kullanmalısınız: docker-compose -f infra/docker-compose.yml up -d

Sadece şu iki komutu bilmeniz yeterli:

Servisleri Başlat: npm run docker:up
Servisleri Durdur: npm run docker:down


npx prisma generate && npx prisma db push