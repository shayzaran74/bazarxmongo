# Media ID Format Contract (Media ID Format Sözleşmesi)

BazarX platformunda yüklenen dosyaların `mediaId` (veya `fileKey`) değerleri, dosyanın türüne ve depolama şekline göre belirli bir formata sahiptir. Bu format veritabanına kaydedilir ve dosya okuma, silme, geçici imzalı URL (presigned URL) üretme işlemlerinde kullanılır.

## Format Tipleri

### 1. Kamu Erişimli Varyantlı Görseller (Public Images)
* **Format:** `{subPath}/{uuid}`
* **Örnek:** `products/c6f619aa-a58b-4c5c-96e4-542013e24c38`
* **Açıklama:** Uzantı içermez. MinIO veya CDN üzerinde bu dizin altında farklı çözünürlüklerde varyantlar (`thumb.webp`, `medium.webp`, `large.webp`, `original.webp`) saklanır.
* **Geçerli Alt Yollar (subPath):** `products`, `avatars`, `banners`, `categories`, `brands`, `surplus`

### 2. Özel Belgeler ve Resim Dışı Dosyalar (Private Documents & Non-Images)
* **Format:** `{subPath}/{uuid}{ext}`
* **Örnek:** `documents/c6f619aa-a58b-4c5c-96e4-542013e24c38.pdf`
* **Açıklama:** UUID ve orijinal dosya uzantısını içerir. Bu dosyalar Sharp ile işlenmez, doğrudan orijinal haliyle private bucket'a yüklenir.
* **Geçerli Alt Yollar (subPath):** `documents`

## Çözümleme Kuralları (Parsing Rules)

Herhangi bir servis veya bileşen `mediaId` üzerinden işlem yaparken şu kuralları uygulamalıdır:

1. **Bucket Belirleme:**
   - `mediaId.split('/')[0]` değeri ilk segmenti (yani `subPath`) verir.
   - Eğer bu değer `documents` ise, dosya **private** bucket (`bazarx-documents`) üzerindedir.
   - Diğer durumlarda dosya **public** bucket (`bazarx-media`) üzerindedir.

2. **Dosya Uzantısı Kontrolü:**
   - Eğer `mediaId` bir nokta (`.`) karakteri içeriyorsa, bu tek bir dosyadır (belge/pdf/ham görsel). Silme veya okuma işlemi doğrudan bu anahtarla yapılmalıdır.
   - Nokta içermiyorsa, bu bir varyantlı görsel dizinidir. Silme işlemi 4 varyantı birden silmeli, okuma işlemi ise istenen boyuta göre (`medium`, `thumb` vb.) uzantı eklemelidir.
