# BazarX-GO — Sistem Tasarımı & İş Modeli
> **Durum:** Geliştirme & Optimizasyon
> **URL:** `http://localhost:3002/bazarx-go`
> **Son güncelleme:** Mayıs 2026 (Düzeltmeler 2–8 + Faz 5–7 sonrası)

---

## 1. Konsept Özeti

BazarX-GO, yemeksepeti benzeri bir O2O (Online-to-Offline) yiyecek/içecek deneyim platformudur. Geleneksel sipariş platformlarından temel farkı: **teslimat yoktur** — kullanıcı restorana gider, QR kodu gösterir, menüsünü alır. BazarX, restoranlarla peşin anlaşma yaparak kullanıcıya değer aktarır; nakit çıkışı ise üyelik + hizmet bedeli geliriyle karşılanır.

---

## 2. Taraflar ve Roller

| Taraf | Rolü | Kazancı |
|:---|:---|:---|
| **Restoran** | Menü sağlar, %50 indirimli taahhüt verir | İndirimli fiyat üzerinden nakit + ücretsiz reklam |
| **Kullanıcı** | Aylık üyelik öder, QR ile menü alır | Ödediğinin 2 katı değer |
| **BazarX** | Aracı & finansör | Üyelik aidatı + %8 hizmet bedeli + platform trafiği |

---

## 3. B2B Katmanı — BazarX ↔ Restoran Anlaşması

### Anlaşma Şartları
- BazarX, restoranla ilk tanışmada **60 menüyü peşin satın alır** — restoran nakit görür, güven tesis edilir
- Menü bedeli restoran fiyatının **%50'si** üzerinden hesaplanır (örn: 200 ₺ menü → BazarX 100 ₺ peşin öder)
- Karşılığında restoran **1 ila 3 ay ücretsiz platform reklamı** alır (süre BazarX takdirine bağlıdır)
- Restoran, kendi belirlediği saatler ve kapasitede QR kota limiti tanımlar
- Rezervasyonlu / rezervasyonsuz seçeneği restoran bazında ayarlanır

### Ücretsiz Reklam Süresi (Tier'a Göre)

Restoranın menü fiyat aralığına göre reklam süresi uzatılabilir. Bu hakkı kullanma kararı **tamamen BazarX'e aittir.**

| Kullanıcı Tier'ı | Temel Reklam Süresi | +1.000₺ Altı Menü | +1.000₺ Üstü Menü |
|:---|:---:|:---:|:---:|
| Bronz üyeler | 1 ay | +1 ay | +2 ay |
| Gümüş üyeler | 2 ay | +1 ay | +2 ay |
| Altın üyeler | 3 ay | +1 ay | +2 ay |
| Elmas üyeler | 4 ay | +1 ay | +2 ay |

---

## 4. B2C Katmanı — 8 Tier Üyelik Sistemi

Her üye, ödediği **aylık aidatın 2 katı** tutarında BazarX Menü Hakkı kazanır. Üyelik **her ay yenilenir**, hak o ay içinde kullanılmazsa **ay sonunda sıfırlanır (burn).**

### Üyelik Aktivasyon & İptal Kuralları

#### Aktivasyon Bekleme Süresi
- Üyelik satın alındığında **15 günlük aktivasyon bekleme süresi** başlar
- Bu 15 gün içinde menü **satın alınabilir**, ancak **kupon kullanılamaz**
- **16. günde** sistem üyeliğin aktif olduğunu teyit eder
- Üyelik aktifse kuponlar açılır ve **45. güne kadar** kullanılabilir
- Toplam pencere: **Satın alma günü + 45 gün**

#### Menü Kullanım Zaman Çizelgesi

```
Gün 1        Gün 15       Gün 16       Gün 43-45    Gün 45
  │            │            │            │            │
  ▼            ▼            ▼            ▼            ▼
Üyelik      Bekleme      Üyelik       Son 3 gün    Kupon
satın        sona         teyit        uyarısı      yanar
alındı       erer         edilir       (Push+Mail)
             Menü         Kupon
             alınabilir   aktif
```

#### Son 3 Gün Uyarı Bildirimleri
- **43. gün:** "Menü hakkın 3 gün sonra sona eriyor! Kullan veya devret."
- **44. gün:** "Yarın son gün! Menü hakkını kaybetmeden önce harekete geç."
- **45. gün:** "Bugün son gün! Saat 23:59'a kadar kullanabilirsin."

Bildirimler Push + Mail olarak çift kanaldan gönderilir.

#### Menü Devir Hakkı

Kullanıcı satın aldığı menüyü kullanamayacaksa **uygulamayı indirmiş herhangi birine** devredebilir — karşı tarafın üye olması gerekmez.

- Devir için karşı tarafın yalnızca **uygulamayı indirmiş ve giriş yapmış** olması yeterlidir
- Üyelik şartı aranmaz
- Kullanıcı aldığı menüleri **dilediği kadar farklı kişiye** devredebilir
- Devredilen menü, **orijinal 45 günlük pencere** içinde geçerliliğini korur
- Devir işlemi **geri alınamaz**
- QR kod **tek kullanımlıktır** — bir kez tarandıktan sonra geçersiz olur

> **Aile & Öğrenci Senaryosu:** Ebeveyn uygulamadan menü satın alır, çocuğuna devreder. Çocuk restorana gidip QR'ı gösterir, menüsünü alır. Ebeveyn uygulama üzerinden **nerede, ne zaman kullanıldığını** takip edebilir.

---

### Üyelik Teyit Kuralları

Sistemde iki farklı kullanım modu vardır ve her birinde üyelik teyidi farklı çalışır:

| Mod | Üyelik Teyidi | Gerekçe |
|:---|:---:|:---|
| **Üyelik menü sistemi** (2× hak) | ✅ Zorunlu | Menü hakkı doğrudan üyeliğe bağlıdır |
| **Gel-Al fırsat menüsü** | ❌ Gerekmez | Kullanıcı normal fiyat üzerinden + platform hizmet bedeli ödemiştir |
| **Devir alınan menü** | ❌ Gerekmez | Menü bedeli zaten orijinal alıcı tarafından ödenmiştir |

> Gel-Al ve devir menülerinde üyelik teyidi istemek kullanıcıyı platformdan kaçırır. Bu modlarda kişi zaten platformun gelir modelini desteklemiştir — kapı açık tutulur.

#### Erken İptal Cezası

Kullanıcı 16. günden önce (aktivasyon tamamlanmadan) üyeliği iptal etmek isterse:

- Satın aldığı menü kuponları **iptal edilir**
- Tier farkı **geri talep edilir**

**Örnek — Bronz Prime 1 (199 ₺ üyelik, 398 ₺ menü hakkı):**

| Kalem | Tutar |
|:---|---:|
| Kullanıcının ödediği aidat | 199 ₺ |
| Aldığı menü hakkının gerçek değeri | 398 ₺ |
| Fark (platform zararı) | 199 ₺ |
| **Erken iptal durumunda kullanıcıdan talep edilecek** | **199 ₺** |

Kullanıcı bu farkı ödemeden üyeliği sonlandıramaz; ödeme yapılmadığı sürece hesap **kısıtlı** modda kalır.

> **Caydırıcılık Notu:** Kullanıcı iptal akışında bu tabloyu açıkça görür — "199 ₺ daha öderseniz üyeliğiniz sonlanır" mesajı gösterilir. Bu şeffaflık hem itirazı önler hem de impulsif iptali caydırır.

### Tier Tablosu

| Tier | Aylık Aidat | Menü Hakkı | Net Tasarruf | Giriş Koşulu |
|:---|:---:|:---:|:---:|:---|
| Bronz Prime 1 | 199 ₺ | 398 ₺ | ~199 ₺ | **Sadece para ile girilir** |
| Bronz Prime 2 | 399 ₺ | 798 ₺ | ~399 ₺ | **Sadece para ile girilir** |
| Gümüş Prime 1 | 699 ₺ | 1.398 ₺ | ~699 ₺ | **Sadece para ile girilir** |
| Gümüş Prime 2 | 999 ₺ | 1.998 ₺ | ~999 ₺ | **Sadece para ile girilir** |
| Altın Prime 1 | 1.499 ₺ | 2.998 ₺ | ~1.499 ₺ | Para + min. XP eşiği gerekir |
| Altın Prime 2 | 1.999 ₺ | 3.998 ₺ | ~1.999 ₺ | Para + min. XP eşiği gerekir |
| Elmas Prime 1 | 2.999 ₺ | 5.998 ₺ | ~2.999 ₺ | Para + min. XP eşiği gerekir |
| Elmas Prime 2 | 4.999 ₺ | 9.998 ₺ | ~4.999 ₺ | Para + min. XP eşiği gerekir |

### Tier Giriş Kuralları

**Bronz P1 — Gümüş P2 (4 alt tier): Serbest Giriş**
- Yalnızca aidat ödenerek girilir
- XP şartı yoktur
- Yeni kullanıcılar buradan başlar

**Altın P1 ve üstü (4 üst tier): XP Kapılı Giriş**
- Para tek başına yeterli değildir
- Bulunduğu tier'da **minimum XP eşiğini** doldurmuş olmak gerekir
- XP eşiğini doldurmadan aidat ödense de üst tier'a geçilemez
- Bu kural, sadakati ödüllendirmek ve hızlı atlama arbitrajını engellemek için tasarlanmıştır

> **Tasarım Notu:** XP eşik değerleri (her tier için kaç XP gerektiği) admin panelinden konfigüre edilebilir olmalıdır; sabit kodlanmamalıdır.

---

## 5. Menü Sistemi Nasıl Çalışır?

### Adım Adım Akış

**Adım 1 — Menü Satın Alma**  
Kullanıcı BazarX uygulamasından menüyü satın alır. Ödeme doğrudan BazarX'e yapılır. 2 adet QR kodu cüzdana düşer.

**Adım 2 — QR Cüzdanı**  
2 QR aynı anda kullanılmak zorunda değildir. Kullanıcı istediği zaman, istediği sırayla her QR'ı **ayrı ayrı** kullanabilir. 45 günlük pencere içinde kalan QR bekler.

**Örnek:**
```
Pazartesi: 200 ₺ kahve menüsü satın alındı → 100 ₺ + hizmet bedeli ödendi
           → 2 kahve QR'ı cüzdana düştü
Salı:      1. QR restorana gösterildi → 1 kahve içildi
Cuma:      2. QR restorana gösterildi → 2. kahve içildi
```

**Adım 3 — Restoranda Kullanım**  
QR kodu restorana gösterilir, ödeme yoktur, menü teslim edilir. Her QR tek kullanımlıktır.

---

### Gel-Al Fırsat Menüsü (Üyeliksiz Erişim)

Restoranlar, üyelik sisteminden bağımsız olarak **sınırlı adetli özel fırsat menüleri** oluşturabilir. Bu menüler BazarX platformunda herkese açık satışa sunulur — üye olmayanlar da satın alabilir.

#### Nasıl Çalışır?

- Restoran, belirli bir menü için **adet ve fiyat** tanımlar
- Bu fiyat, normal menü fiyatından daha düşüktür (restoran tamamen kendi inisiyatifinde belirler)
- Kullanıcı uygulamadan satın alır, QR kodu cüzdana düşer
- Restorana gider, QR'ı gösterir, menüsünü alır — nakit ödeme yoktur

**Örnek:**
```
Normal fiyat:        200 ₺ kahve menüsü
Gel-Al fiyatı:       175 ₺ (restoran belirledi)
Adet:                50 adet (stok tükenince kapanır)
Geçerlilik:          30 gün (restoran belirler)
```

| Kalem | Tutar |
|:---|---:|
| Gel-Al menü fiyatı | 175 ₺ |
| Platform hizmet bedeli (%8 × 175) | 14 ₺ |
| KDV (%20 × 14) | 2,80 ₺ |
| **Kullanıcının toplam ödemesi** | **191,80 ₺** |
| **Tasarruf** | **8,20 ₺** |

#### Restoranın Kazancı
- Ölü saatler ve düşük yoğunluklu dönemlerde **önceden nakit akışı** sağlar
- Stok/kapasite planlamasını önceden yapabilir
- Yeni müşteri çeker — üye olmayan kullanıcılar Gel-Al menüyle platformu tanır, üyeliğe geçebilir

#### Platform Kuralları
- Gel-Al menüler **BazarX üyeliği gerektirmez** — herkese açıktır
- Adet dolduğunda satış otomatik kapanır
- Restoran istediği zaman kampanyayı durdurabilir; **önceden satılan QR'lar geçerliliğini korur**
- QR geçerlilik süresi restoran tarafından belirlenir (min. 7, maks. 90 gün)
- Kullanılmayan Gel-Al QR'ları süre sonunda yanar; **iade politikası** üyelik sözleşmesinde ayrıca tanımlanır

### Fiyat Hesaplama Örneği

| Kalem | Tutar |
|:---|---:|
| Tam menü fiyatı | 1.000 ₺ |
| %50 indirimli menü bedeli (QR) | 500 ₺ |
| Platform hizmet bedeli (%8 × 500) | 40 ₺ |
| KDV (%20 × 40 hizmet bedeli üzerinden) | 8 ₺ |
| **Kullanıcının toplam ödemesi** | **548 ₺** |
| **Kullanıcı tasarrufu** | **452 ₺ (%45)** |

> **Not:** KDV matrahı yalnızca %8'lik hizmet bedeli üzerinden hesaplanır; menü tutarının tamamından değil.

---

## 6. Menü Kategorileri

Referans sistemi ve tier hiyerarşisi için menüler **6 ana kategoriye** ayrılır. Tier ne kadar yüksekse, o kadar üst kategoriden menü hakkı doğar.

| Sıra | Kategori | Açıklama | Örnek Mekanlar & Menüler |
|:---:|:---|:---|:---|
| **1** | **VIP & Fine Dining** | Üst segment restoranlar, şef menüleri, tadım menüleri | Aspava, vakantibar tarzı fine dining; çok kişilik tadım menüleri, şefin özel tabağı |
| **2** | **Mid-Point & New Casual** | Orta-üst segment, modern konsept restoranlar | Steakhouse, et & biftek restoranları, yerel premium et yemekleri, ızgara menüleri |
| **3** | **Casual Dining & Yerel Lezzetler** | Günlük yemek, yerel mutfak, fast-casual | Hamburger, wrap, döner, pide, lahmacun, ev yemeği |
| **4** | **Tatlı & Pastane** | Tatlı odaklı mekanlar | Waffle, cheesecake, baklava, künefe, pasta, profiterol |
| **5** | **Kahve & İçecek** | Kafe ve içecek mekanları | Filtre kahve, espresso bazlı içecekler, soğuk brew, smoothie, limonata, çay |
| **6** | **Dondurma & Ekler** | Hafif atıştırmalık ve dondurma mekanları | Dondurma külahı, waffle külah, ekler, muffin, kruvasan, mini tatlılar |

### Tier ↔ Kategori Eşleşmesi

| Tier | Tam Erişim Kategorileri | Preview (1×/ay) |
|:---|:---|:---|
| Bronz Prime 1 | 6 — Dondurma & Ekler | 5 — Kahve & İçecek |
| Bronz Prime 2 | 5-6 | 4 — Tatlı & Pastane |
| Gümüş Prime 1 | 4-5-6 | 3 — Casual Dining |
| Gümüş Prime 2 | 3-4-5-6 | 2 — Mid-Point |
| Altın Prime 1 | 2-3-4-5-6 | 1 — VIP Fine Dining |
| Altın Prime 2 | 2-3-4-5-6 | 1 — VIP (genişletilmiş kota) |
| Elmas Prime 1 | 1-2-3-4-5-6 | — |
| Elmas Prime 2 | 1-2-3-4-5-6 | — |

> **Preview:** Üst kategoriden ayda 1 kez sınırlı erişim. `purchaseType: 'PREVIEW'`, `previewCategoryId`, `previewUsedAt` alanlarıyla takip edilir.

---

## 7. Referans Sistemi

### Kurallar
- İlk üyelik ayında **3 referans hakkı** verilir
- Her üyelik yenilemesinde **+1 referans hakkı** ek olarak kazanılır
- Referans sistemi **tek katmanlıdır** — zincirleme yapı oluşturulamaz
- Referans bonusu kazanıldıktan itibaren **45 gün içinde** kullanılmazsa yanar
- Kullanılmayan referans hakları **devredilmez**
- Bonus menü kullanımında sistem **45. gün itibarıyla üyeliğin aktif olduğunu teyit eder**; üyelik iptal edilmiş veya askıda ise bonus kullanılamaz ve yanar

#### Referans Hakkı Tablosu (Örnek)

| Üyelik Ayı | O Ay Kazanılan Hak | Kullanılabilir |
|:---:|:---:|:---:|
| 1. ay | 3 hak | 3 kişi |
| 2. ay | +1 hak | 1 kişi |
| 3. ay | +1 hak | 1 kişi |
| 4. ay+ | +1 hak/ay | 1 kişi/ay |

> Kullanılmayan hak yanar, biriktirme yoktur.

### Referans → Bonus Hesaplama

**3. referansın üye olmasıyla bonus devreye girer.**  
Bonus tier'ı **yukarı yuvarlama** (ceiling) algoritmasıyla hesaplanır:

```
3 referansın toplam ödediği aidat toplamı
        ↓
Bu toplama EN KÜÇÜK tier bulunur where totalAidat <= maxAidat (yukarı yuvarlama)
        ↓
O tier'ın bonusTier alanındaki tier'dan 1 adet menü hakkı verilir
```

**Örnek:** 1.479₺ → GOLD_P1 (maxAidat=1.998) → bonus: SILVER_P2 (kategori 3)

#### Doğru Ceiling Algoritması Test Cases

| Toplam Aidat | Denk Tier (ceiling) | Bonus Tier | Açıklama |
|:---|:---:|:---:|:---|
| 1.479₺ | GOLD_P1 (max=1.998) | SILVER_P2 | ← yukarı yuvarlama |
| 1.499₺ | GOLD_P1 (max=1.998) | SILVER_P2 | tam eşik |
| 1.500₺ | GOLD_P1 (max=1.998) | SILVER_P2 | altında |
| 1.999₺ | GOLD_P2 (max=2.998) | GOLD_P1 | 2.000₺ eşiği |
| 398₺ | BRONZE_P2 (max=698) | BRONZE_P1 | tam eşik |
| 399₺ | BRONZE_P2 (max=698) | BRONZE_P1 | üstünde |

#### Senaryo Örnekleri

| Referans Eden | Referans Alanlar | Toplam Aidat | Denk Tier | Bonus Tier |
|:---|:---|:---:|:---:|:---:|
| Herhangi tier | 3 × Bronz P1 (3×199=597₺) | 597₺ | Bronz P2 | **Bronz P1 menüsü** |
| Herhangi tier | 2×Bronz P2 + 1×Gümüş P1 (798+699=1.497₺) | 1.497₺ | Altın P1 | **Gümüş P2 menüsü** |
| Herhangi tier | 3 × Gümüş P2 (3×999=2.997₺) | 2.997₺ | Elmas P1 | **Altın P2 menüsü** |

**Sonuç:** Referans veren kişi, hesaplanan bonus tier'ından **1 adet menü hakkı** kazanır (o kategorinin en iyi menüsü).

### Backend Algoritması (Pseudocode)

```
TIER_MAP = [
  { tier: "bronz_p1", minAidat: 0,     maxAidat: 398  },
  { tier: "bronz_p2", minAidat: 399,   maxAidat: 698  },
  { tier: "gumus_p1", minAidat: 699,   maxAidat: 998  },
  { tier: "gumus_p2", minAidat: 999,   maxAidat: 1498 },
  { tier: "altin_p1", minAidat: 1499,  maxAidat: 1998 },
  { tier: "altin_p2", minAidat: 1999,  maxAidat: 2998 },
  { tier: "elmas_p1", minAidat: 2999,  maxAidat: 4998 },
  { tier: "elmas_p2", minAidat: 4999,  maxAidat: ∞    },
]

function calculateReferralBonus(referralPayments[3]):
  total = sum(referralPayments)
  matchedTier = findTierByAmount(total)       // toplama en yakın tier
  bonusTier = oneLevelBelow(matchedTier)      // bir alt tier
  return bonusTier.menuCategory              // o kategoriden 1 menü hakkı
```

### XP Kazanımı (Referans)

| Olay | Referans Verene | Referans Alana |
|:---|:---:|:---:|
| 1. kişi üye olur | 20 XP | 10 XP karşılama bonusu |
| 2. kişi üye olur | 20 XP (toplam 40 XP) | 10 XP |
| 3. kişi üye olur | 20 XP + menü bonusu + tier geçişinde %20 aidat indirimi | 10 XP |

---

## 8. QR Kod Sistemi

### İki Ayrı QR Tipi

**Tip 1 — Platform QR (Ana Üyelik QR'ı)**
- Kaynak: Kullanıcının aylık üyelik menü hakkından veya referans bonusundan üretilir
- Geçerlilik: **45 gün** (sabit — platform kuralı)
  - İlk 15 gün: QR cüzdanda görünür ama **taranamaz** (aktivasyon bekleme süresi)
  - 16–45. gün: Aktif, restoranda kullanılabilir
- Restoran müdahalesi: **YOK**

**Tip 2 — Anlık Fırsat QR'ı (Sürpriz / Ölü Saat)**
- Kaynak: Restoranın anlık olarak açtığı boş saat bildirimi
- Geçerlilik: Restoran tarafından belirlenir (min 2 saat, maks 7 gün)
- İçerik: Normal üyelik menüsüyle aynı kategoriden, ek indirim yok
- Kota: Restoran tanımlar

### Teknik Gereksinimler
- Her menü hakkı için **tek kullanımlık, zamanlı QR** üretilir
- QR içeriği: Tier bilgisi + menü kategorisi + kullanım zaman penceresi
- QR geçerlilik süresi: Restoranın tanımladığı saate göre dinamik
- Restoran panelinden QR tarama ve onaylama

### Restoran Ayarları
- Rezervasyonlu / rezervasyonsuz seçimi
- Günlük ve saatlik QR kota limiti
- BazarX-GO menü takvimi (bazı günler/saatler kapatılabilir)
- Minimum süre öncesi rezervasyon şartı

---

## 9. Rezervasyon Sistemi

**Karar: Tamamen uygulama içi.**  
Harici takvim entegrasyonu (Google Calendar vs.) gereksiz sürtünme yaratır ve kullanıcıyı uygulamadan koparır. Tüm rezervasyon akışı BazarX-GO içinde çalışır.

### Kullanıcı Akışı
1. Restoran seçilir → müsait saatler gösterilir
2. Saat ve kişi sayısı seçilir
3. QR kodu rezervasyona bağlanır
4. Restoran onaylar → kullanıcıya bildirim gider
5. Restoranda QR gösterilir, menü teslim edilir

### Restoran Paneli
- Gelen rezervasyonları listele / onayla / reddet
- Günlük kapasite ve müsait saat blokları
- "Bugün dolu" hızlı kapatma butonu

---

## 10. Sürpriz Menü & Anlık Bildirim Sistemi

Bu iki özellik birbirini tamamlar ve restoranların **ölü saatlerini** değere dönüştürmek için tasarlanmıştır.

### Sürpriz Menü — Restoran Opt-in

Restoran dashboard'unda **"Sürpriz Menü Havuzuna Katıl"** toggle'ı bulunur.

- Toggle açıksa: Restoran, ölü saatlerinde platform tarafından sürpriz menü olarak önerilebilir
- Sürpriz menü kullanan kullanıcı, **restorana gidene kadar** kimin menüsü olduğunu bilmez
- Restoran, bu özelliği sadece belirlediği saat bloklarında aktif edebilir (örn: 14:00–17:00 arası)
- Sürpriz menü fiyatı, normal BazarX-GO fiyatıyla aynıdır — ek indirim yoktur

**Restoranın kazancı:** Boş masa doldurmak, yeni müşteri kazanmak, reklam süresi uzatma hakkı.

### Anlık Bildirim Sistemi (Push + Mail)

**Çift kanal zorunludur:** Push bildirimi + mail birlikte çalışır. Push için uygulama yüklü olması yeterli, mail ise her durumda ulaşır.

#### Tetikleyici Senaryolar

| Senaryo | Tetikleyici | Mesaj Örneği |
|:---|:---|:---|
| **Konum bazlı fırsat** | Kullanıcı restorana 500m yaklaştığında | "Rokko Dondurma'da BazarX menün seni bekliyor! Şimdi al 🍦" |
| **Ölü saat bildirimi** | Restoran "boş saat" bildirimi gönderdiğinde, yakın kullanıcılara | "7. Cadde'deki Zeytin Restoran bugün 14-17 arası BazarX menüsü tanımladı. Fırsatı kaçırma!" |
| **Yeni restoran anlaşması** | Kullanıcının sık gittiği mahallede yeni restoran eklendiğinde | "Çankaya'da yeni BazarX restoranı: Burger House katıldı!" |
| **Menü hakkı dolmak üzere** | Ayın son 3 günü, kullanılmamış hak varsa | "Bu ay 2 menü hakkın kullanılmadı. Ay sonu sıfırlanmadan kullan! ⏰" |
| **Sürpriz menü aktif** | Konuma yakın restoran sürpriz menü açtığında | "Bulunduğun yere 300m mesafede sürpriz BazarX menüsü! Kim olduğunu git gör 🎁" |

#### Teknik Gereksinimler
- **Konum servisi:** Arka planda çalışan, pil dostu geofencing (500m yarıçap)
- **Mail sağlayıcı:** Resend veya Postmark (yüksek deliverability, işlemsel mail)
- **Push:** Firebase Cloud Messaging (FCM)
- **Kullanıcı tercihi:** Hangi bildirim türlerini almak istediğini ayarlayabilir
- **Sessiz saatler:** 22:00–08:00 arası bildirim gönderilmez (ayarlanabilir)

---

## 11. Multi-Şehir Açılım Planı

| Faz | Şehir | Öncelik Sırası | Hedef Restoran |
|:---|:---|:---:|:---:|
| **Faz 1** | Ankara | 1 | 100 restoran |
| **Faz 2** | İzmir | 2 | 100 restoran |
| **Faz 3** | Antalya | 3 | 100 restoran |
| **Faz 3** | Mersin | 4 | 100 restoran |
| **Faz 4** | Konya | 5 | 100 restoran |
| **Faz 4** | Adana | 6 | 100 restoran |
| **Faz 5** | Hatay | 7 | 100 restoran |

### Ankara Lansman Stratejisi

Ankara pilot için önerilen ilçe önceliği: **Çankaya → Kızılay/7. Cadde → Bahçelievler → Ümitköy → GOP**

- Yoğun ofis nüfusu = öğle arası ölü saat potansiyeli
- Üniversite kampüsleri (ODTÜ, Bilkent, Hacettepe) = genç kullanıcı kitlesi
- Hafta sonu akşamları için Kızılay/Tunalı Hilmi aksı

### Her Şehir İçin Açılış Kriterleri
- Min. **100 anlaşmalı restoran** hazır
- Push bildirim ve mail altyapısı o şehir için test edilmiş
- En az 1 saha ekibi / bölge koordinatörü atanmış

---

## 12. BazarX Finansal Dengesi

### Gelir Kalemleri
1. **Aylık üyelik aidatı** — doğrudan gelir, her ay tekrar eder
2. **%8 platform hizmet bedeli** — her 1. menü işleminde
3. **%20 KDV** — hizmet bedeli üzerinden (devlete aktarılır, gelir değil)

### Maliyet Kalemi
- 2. menüde restoran %50 indirim taahhüdü verir; bu indirim **ücretsiz reklam karşılığıdır** — platform nakit ödemez
- Referans bonus menüsü: Mevcut menü havuzundan karşılanır

### BazarX Kârlılık Koruması
Her tier'da pozitif marj korunur. Alt 4 tier serbest girişe açık olsa da aylık tekrar eden aidat yapısı ve %8 hizmet bedeli geliri dengeli tutar. Üst tier XP kapısı hem sadakat hem de churn önleme mekanizması olarak çalışır.

---

## 13. Platform Özellikleri (Özet)

### Kullanıcı Tarafı
- Konum bazlı restoran filtreleme ve harita görünümü
- Menü takvimi (hangi restoran, hangi saat müsait)
- QR cüzdanı (tüm aktif kodlar tek ekranda)
- Kullanım takibi: "Bu ay 3/5 menünü kullandın"
- Restoran puanlama (QR kullanımı sonrası)
- Sürpriz menü seçeneği
- Uygulama içi rezervasyon akışı
- Anlık konum bildirimleri (Push + Mail)

### Restoran Tarafı (Vendor Dashboard)
- Günlük/saatlik QR kota yönetimi
- Canlı QR tarama ve onaylama
- Rezervasyon yönetimi
- Sürpriz menü opt-in toggle'ı
- Ölü saat bildirimi gönderme
- Reklam hakkı takibi

### Admin Tarafı
- Restoran anlaşma yönetimi
- Tier, XP eşiği ve menü hakkı konfigürasyonu
- Referans sistemi izleme
- Şehir bazlı açılım yönetimi
- Kârlılık dashboard'u
- Push/Mail kampanya yönetimi

---

## 14. Teknik Entegrasyon (Mevcut BazarX Mimarisine)

| Faz | Durum | İçerik |
|:---|:---:|:---|
| Faz 1 — Schema | ✅ | VendorType, DeliveryType, MenuPurchase.listingId, LaunchPartner |
| Faz 2 — Backend | ✅ | Vendor domain, order transitions, menu modülü (Mongoose) |
| Faz 3 — Frontend | ✅ | StepVendorType.vue, useOrderStatusLabel, RestaurantSettingsSection |
| Faz 4 — Delivery | ✅ | DeliveryDispatch schema, BullMQ queue |
| Faz 5 — Bildirim | ✅ | FCM Push + Mail (Push: FCMService, Mail: MailService, GoNotificationProcessor) |
| Faz 6 — Geofencing | ✅ | Konum bazlı tetikleyici servisi (GeofenceService, 500m, Redis cooldown) |
| Faz 7 — Rezervasyon | ✅ | GoReservation schema + endpoint'ler (menu.presentation.menu.controller.ts) |

### Önemli Notlar
- **ORM:** MongoDB + Mongoose (Prisma kaldırıldı)
- **Stack:** NestJS backend (port 3001) + Nuxt 3 frontend (port 3002)
- **GO URL:** `/bazarx-go` altında izole route yapısı

---

## 15. Lansman Ortağı Modeli (İlk 1-100 Restoran)

### 3 Fazlı Süreç

| Faz | Süre | İşletmeye Verilen | İşletmeden Alınan |
|:---|:---:|:---|:---|
| Faz 1 | Ay 1 | Platform profili + ücretsiz ilan + sosyal medya tanıtımı + 60 menü hediye kotası | 60 adet BazarX-GO menüsü taahhüdü |
| Faz 2 | Ay 2–3 | Ücretsiz reklam kampanyası + QR operasyon desteği | Menü güncellemesi + min. %20 indirimli menü |
| Faz 3 | Ay 4+ | Ücretli B2B üyeliğe geçiş daveti | Standart komisyon + takas sistemi |

### 60 Menü Büyüme Döngüsü
```
Restoran 60 menü taahhüdü verir
        ↓
BazarX 60 menüyü yeni kullanıcılara HEDİYE dağıtır
        ↓
Kullanıcı ücretsiz menü deneyimi yaşar → platforma bağlanır
        ↓
Kullanıcı ücretli üye olur → 2× menü döngüsüne girer
        ↓
Restoran 60 yeni müşteri kazanır → B2B üyeliğe geçer
```

### Projeksiyon (10 Lansman Ortağı)

| Metrik | Hesaplama | Sonuç |
|:---|:---|:---|
| Dağıtılan menü | 10 × 60 | 600 menü |
| Beklenen üye dönüşümü (%30) | 600 × 0.30 | ~180 ücretli üye |
| Ortalama aidat | (199 + 399) / 2 | 299 ₺ |
| İlk ay üyelik geliri | 180 × 299 | ~53.820 ₺/ay |
| Kullanıcı edinme maliyeti | Menü taahhüdü ↔ reklam takası | **~0 ₺ nakit** |

---

## 16. Üyelik Hızlandırma Stratejileri

### 1. 15 Günlük Beklemeyi Silah Olarak Kullan
Kullanıcı üye oldu ama 16. güne kadar kupon kullanamıyor. Bu 15 günü boş bırakma.

- Her gün farklı bir BazarX-GO restoranı öner — menü, fotoğraf, konum
- "16. günde seni bekliyor 🍽️" mesajı gönder
- Kullanıcı o restorana gitmeyi kafaya koyar, iptal düşünmez
- **Kanal:** Push + Mail, günde 1 bildirim, aşırıya kaçma

> Bekleme süresi caydırıcı değil — doğru kullanılırsa bağlılık inşa eder.

---

### 2. Gel-Al Menüyü Üyelik Hunisine Dönüştür
Gel-Al üyelik gerektirmiyor — bu doğru ve değişmeyecek. Ama Gel-Al alan kullanıcıya ödeme sonrası somut kayıp göster:

**Ödeme onay ekranından hemen sonra:**
```
"Bu menüyü 191,80 ₺ ödedin.
Üye olsaydın:
→ 100 ₺ öderdin (yarı fiyat)
→ Bir tane daha bedava gelirdi
→ Toplam 200 ₺ tasarruf ederdin.

[Hemen Üye Ol — 199 ₺]"
```

Soyut "üye ol" çağrısı değil — **o an yaşanan somut kayıp.** Kaybı görmek kazanç vaadindan çok daha güçlü etkiler.

---

### 3. Devir Özelliğini Viral Mekanizmaya Dönüştür
Menü devri zaten var — ama bildirim tasarımı viral büyümeyi tetikleyebilir.

**Devralan kişiye giden bildirim:**
> *"Annen sana bir kahve gönderdi ☕ — BazarX'te seni bekliyor."*

**Akış:**
```
Ebeveyn menü devret → Çocuk push bildirimi + mail alır → Uygulamayı indirir
        ↓
Menüyü kullanır → Deneyim yaşar → Üye olur
        ↓
Üye olunca kendi referans hakkını kullanır → Zincir büyür
```

Devir = sıfır maliyetli organik büyüme kanalı. Özellikle aile grupları ve öğrenci-ebeveyn ilişkisinde çok güçlü çalışır.

---

### 4. Ölü Saat Kampanyası — İlk 500 Üye Avantajı
İlk 500 üyeye özel: hafta içi **14:00–17:00** arası kullanılan menülerde restoran **1 küçük içecek ekstra** verir.

- Restoran o saatte zaten boş — maliyeti düşük
- Kullanıcı için algılanan değer yüksek
- "Erken üye" hikayesi hem **aciliyet** hem **ayrıcalık** hissi yaratır
- 500 kota dolduğunda kapanır → kıtlık etkisi büyümeyi hızlandırır

**Bildirim örneği:**
> *"Erken üye avantajı: Bugün 14-17 arası menünü kullan, içeceğin bizden! (412/500 hak kaldı)"*

---

### 5. Referans Bonusunu Görünür Yap
Referans sistemi var ama kullanıcı bunu hissedemiyor. Çözüm gamification değil — **basit görünürlük.**

**Uygulama ana ekranında sabit sayaç:**
```
┌─────────────────────────────────┐
│ 3 arkadaşını davet et,          │
│ bu ayın kahvesini kazan ☕       │
│                                 │
│  ●●○  2/3 davet tamamlandı      │
│  [Şimdi Davet Et]               │
└─────────────────────────────────┘
```

- İlerleme çubuğu tamamlamaya iter
- "1 kişi kaldı" aşamasında ekstra push bildirimi gönder
- 3. davet tamamlandığında anında bonus menü bildirimi tetiklenir

---

## 17. Açık Maddeler

| Madde | Durum | Açıklama |
|:---|:---:|:---|
| Altın P1 ve üstü XP eşik değerleri | ✅ | `tier_benefits` koleksiyonuna `xpThreshold` alanı eklendi (admin konf.) |
| Referans bonus algoritması backend'e işlendi | ✅ | `findTierByReferralTotal()` — ceiling algoritması, Düzeltme 2 |
| Mail sağlayıcı seçimi | ✅ | Resend (mevcut MailService ile) |
| Geofencing yarıçapı | ✅ | 500m başlangıç, Redis cooldown 2 saat, GoFcmService sessiz saat |
| Ankara pilot restoran listesi | 🔜 | İş görevi — saha ekibi |
| Sürpriz menü A/B test planı | 🔜 | GoReservation + Instant QR altyapısıyla desteklendi |
| **GO sipariş flag (isGoOrder)** | ✅ | Order schema + checkout.service.ts (Düzeltme 7/8) |
| **Restoran teslimat seçeneği** | ✅ | hasDeliveryService, deliveryRadiusKm, deliveryFee (Düzeltme 7/8) |
| **Hediye kartı üyelik aktivasyonu** | ✅ | CreateGiftCardOnMembershipHandler, %50 değer (Düzeltme 3) |
| **CategoryAccessService + preview hakları** | ✅ | purchaseType: PREVIEW, ayda 1 kez kota (Düzeltme 4) |
| **FCM token + bildirim tercihleri** | ✅ | user.fcmToken, silentHoursStart/End (Faz 5) |
| **QR tip ayrımı (PLATFORM / INSTANT_OPPORTUNITY)** | ✅ | MenuPurchase.qrType, platformExpiresAt, activationDate (Düzeltme 5) |
| **GO Rezervasyon modülü** | ✅ | GoReservation schema + endpoint'ler (Faz 7) |
