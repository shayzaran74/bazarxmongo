ngrok tünelini başlatmak için hangi servisi dışarı açmak istediğine göre şu komutları kullanabilirsin:

1. Backend'i Dışarı Açmak (Port 3001)
Google OAuth veya dış servislerin (webhook vb.) senin yerel sunucuna erişmesi gerekiyorsa:

bash
ngrok http 3001
2. Frontend'i Dışarı Açmak (Port 3000)
Web sitesini mobil cihazdan veya başka birine göstermek için:

bash
ngrok http 3000
Nasıl Çalıştırılır?
Terminalde yeni bir sekme açıp yukarıdaki komutu yazman yeterlidir. Karşına çıkan ekranda Forwarding kısmındaki https://... ile başlayan adres senin dış dünyaya açılan adresin olacaktır.

İpucu: Eğer Google OAuth kullanıyorsan, ngrok'un verdiği bu yeni adresi Google Cloud Console'daki Authorized redirect URIs kısmına eklemeyi ve .env dosyasındaki GOOGLE_CALLBACK_URL değerini güncellemeyi unutma.

İstersen senin için backend tünelini arka planda başlatıp adresi sana söyleyebilirim?