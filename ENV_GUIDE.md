# ENV Güvenlik Kılavuzu

## Üretilmesi Gereken Secret'lar

Aşağıdaki komutları sunucuda çalıştırarak güvenli değerler üret:

```bash
# JWT_SECRET (64 karakter)
openssl rand -base64 64 | tr -d '\n'

# JWT_REFRESH_SECRET (64 karakter — farklı olmalı!)
openssl rand -base64 64 | tr -d '\n'

# CSRF_SECRET (32 karakter)
openssl rand -base64 32 | tr -d '\n'

# DB şifresi (32 karakter)
openssl rand -base64 32 | tr -d '\n'

# Redis şifresi (24 karakter)
openssl rand -base64 24 | tr -d '\n'

# MinIO key (20 karakter)
openssl rand -base64 20 | tr -d '\n' | tr '+/' 'aA'
```

## .gitignore — Eklenmesi Gerekenler

```gitignore
# Env dosyaları — sadece .example commit edilir
.env
.env.*
!.env.example
!.env.development.example
!.env.production.example

# Playwright auth state'leri
e2e/.auth/

# SSL sertifikaları
nginx/ssl/
*.pem
*.key
*.crt
```

## Stripe → Iyzico Geçişi

Frontend'deki `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` artık kullanılmıyor.
`StripePayment.vue` komponenti `CheckoutPaymentMethod.vue` ile değiştirildi.
Eski Stripe key'i `.env`'den kaldırabilirsiniz.

## Iyzico Sandbox Kurulumu

1. https://sandbox-merchant.iyzipay.com → Kayıt ol
2. Ayarlar → API Anahtarları → API Key + Secret Key al
3. `IYZICO_API_KEY` ve `IYZICO_SECRET_KEY` değerlerini doldur
4. Test kartı: `5528790000000008`, CVV: `123`, SKT: `12/30`

## Docker Compose ile Env Kullanımı

```bash
# .env.prod dosyasından değerleri oku
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Env Değişkeni Kontrol Listesi (Prod'a Çıkmadan)

- [ ] JWT_SECRET gerçek random değer (dev default değil)
- [ ] JWT_REFRESH_SECRET gerçek random değer
- [ ] POSTGRES_PASSWORD güçlü şifre
- [ ] REDIS_PASSWORD dolu
- [ ] IYZICO_API_KEY canlı key (sandbox değil)
- [ ] GOOGLE_CLIENT_ID canlı OAuth credentials
- [ ] SMTP değerleri gerçek mail servisi
- [ ] FRONTEND_URL doğru domain
- [ ] MINIO_PUBLIC_URL doğru domain
- [ ] CSRF_SECRET dolu
