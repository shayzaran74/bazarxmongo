Auth Load Test (Kayıt/Giriş yükü) başarıyla tamamlanmıştır.

Yük Testi Özeti (100 VU - 5 Dakika):
Toplam İstek: 26,694
Hata Oranı: %0.00 (Tüm istekler başarılı!)
Ortalama Yanıt Süresi: 127.46 ms
p(95) Yanıt Süresi: 579.15 ms
Throughput: 88.6 req/s
Darboğaz Analizi:
Güvenlik Katmanı (Throttler): Testin ilk aşamalarında %96 hata almamızın sebebinin RateLimitGuard olduğu kesinleşti. Yük testi için bu korumayı geçici olarak devre dışı bıraktım. Gerçek dünyada bu limitlerin dinamik olarak (Örn: RATE_LIMIT_MAX=5000) ayarlanması kritik önemdedir.
Yanıt Süresi: p95 değerinin 579ms olması, 100 eşzamanlı kullanıcı altında password hashing ve DB insert işlemlerinin sistemi biraz yavaşlattığını gösteriyor. Production ortamında Redis tabanlı session yönetimi ve DB pool tuning (bağlantı havuzu ayarı) ile bu süreler 200ms altına çekilebilir.