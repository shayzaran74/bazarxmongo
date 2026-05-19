# BazarX Master Plan — Sürüm 4.3
> **Gizli | Ticari Sır Niteliğindedir**  
> Son güncelleme: Mayıs 2026

> **⚙️ Teknik Güncelleme (Mayıs 2026):** Veri katmanı **MongoDB + Mongoose** olarak güncellendi. PostgreSQL/Prisma kaldırıldı. İş kuralları ve gelir modeli değişmemiştir.

---

## İçindekiler

1. [Stratejik Vizyon ve Ekosistem Mimarisi](#1-stratejik-vizyon-ve-ekosistem-mimarisi)
2. [BazarX — B2C Platformu](#2-bazarx--b2c-platformu)
   - [2.1 Tier Sistemi (8 Seviye)](#21-tier-sistemi-8-seviye)
   - [2.2 BazarX Menü Sistemi](#22-bazarx-menü-sistemi)
   - [2.3 Platform Hizmet Bedeli](#23-platform-hizmet-bedeli)
   - [2.4 Hediye Çeki Modeli](#24-hediye-çeki-modeli)
   - [2.5 XP Ekonomisi](#25-xp-ekonomisi)
   - [2.6 Referans Sistemi](#26-referans-sistemi)
   - [2.7 Tier Yükseltme Kuralları](#27-tier-yükseltme-kuralları)
   - [2.8 Lansman Ortağı Modeli](#28-lansman-ortağı-modeli)
3. [TicariTakas — B2B Platformu](#3-ticaritakas--b2b-platformu)
   - [3.1 Üyelik Seviyeleri](#31-üyelik-seviyeleri)
   - [3.2 Komisyon Yapısı](#32-komisyon-yapısı)
   - [3.3 XP ve TrustScore](#33-xp-ve-trustScore)
   - [3.4 Watchtower ve Denetim](#34-watchtower-ve-denetim)
4. [BarterBorsa — Kurumsal Platform](#4-barterborsa--kurumsal-platform)
5. [Gelir Modeli ve Vergisel Yükümlülükler](#5-gelir-modeli-ve-vergisel-yükümlülükler)
6. [Karlılık Simülatörü](#6-karlılık-simülatörü)
7. [CFO Özeti](#7-cfo-özeti)

---

## 1. Stratejik Vizyon ve Ekosistem Mimarisi

BazarX, nakit yakma odaklı e-ticaret modellerine karşı **O2O (Online-to-Offline)** yapısıyla lokal ekonomiyi, takası ve sosyal statüyü dijitalleştirir. Üç ayrı marka yüzüyle hizmet verir; arka planda tek bir Core motoru çalışır.

| Marka | Model | Hedef Kitle | Temel Gelir |
|:---|:---|:---|:---|
| **BazarX** | B2C Marketplace | Son tüketici | Aidat + Satıcı komisyonu + Hizmet bedeli + Reklam |
| **TicariTakas** | B2B Takas | KOBİ / Orta ölçekli işletme | Aidat + Takas komisyonu + Reklam |
| **BarterBorsa** | Kurumsal SaaS | Büyük işletmeler / AVM | SaaS lisans + İşlem yönetim bedeli + Reklam |

### Teknik Altyapı (Mayıs 2026 itibarıyla)

| Katman | Teknoloji |
|:---|:---|
| **Backend** | NestJS — DDD/CQRS/Hexagonal |
| **Veritabanı** | **MongoDB + Mongoose** |
| **Cache** | Redis |
| **Queue** | RabbitMQ + BullMQ |
| **Storage** | MinIO |
| **Mobil** | React Native (Expo) |
| **Web Frontend** | Nuxt 3 + Vue 3 + Pinia |

---

## 2. BazarX — B2C Platformu

### 2.1 Tier Sistemi (8 Seviye)

Dört ana liga (Bronz, Gümüş, Altın, Elmas) ve her ligada iki aidat düzeyi (Prime 1 / Prime 2). **Cashback yoktur** — değer menü sistemi ve hediye çekleriyle sağlanır.

| Seviye | Aylık Aidat | Breakeven Ciro/Ay | Başlıca Avantajlar |
|:---|:---:|:---:|:---|
| **Bronz Prime 1** | 199 ₺ | 4.975 ₺ | Erken erişim, temel XP, 2× menü hakkı |
| **Bronz Prime 2** | 399 ₺ | 7.980 ₺ | QR kampanya erişimi, öncelikli destek |
| **Gümüş Prime 1** | 699 ₺ | 11.650 ₺ | Etkinlik daveti, genişletilmiş menü hakkı |
| **Gümüş Prime 2** | 999 ₺ | 14.271 ₺ | Drop erişimi, özel restoran menüleri |
| **Altın Prime 1** | 1.499 ₺ | 18.738 ₺ | Öncelikli rezervasyon, çift XP günleri |
| **Altın Prime 2** | 1.999 ₺ | 22.211 ₺ | VIP etkinlik, kişisel danışman |
| **Elmas Prime 1** | 2.999 ₺ | 29.990 ₺ | Tüm haklara tam erişim, özel masa garantisi |
| **Elmas Prime 2** | 4.999 ₺ | 41.658 ₺ | Konsiyerj hizmet, sınırsız menü hakkı |

> **Breakeven:** Yıllık aidatı platform üzerindeki harcamadan geri kazanmak için gereken minimum aylık ciro.

---

### 2.2 BazarX Menü Sistemi

Her üye, ödediği aylık aidatın **2 katı** tutarında BazarX Menü Hakkı kazanır.

#### Nasıl Çalışır?

**Adım 1 — Anlaşma şartı**  
Restoran, BazarX ile anlaşırken menülerini %50 indirimli fiyatla sisteme sunar. Bu indirim, ilk 1 ay ücretsiz reklam karşılığıdır — platformdan **nakit çıkışı yoktur.**

**Adım 2 — 1. Menü: QR ödeme**  
Kullanıcı BazarX uygulamasından 1. menüyü satın alır, QR kodu restorana gösterir. İndirimli fiyat + %8 hizmet bedeli + %20 KDV uygulanır. Ödeme doğrudan bazarx yapılır 

**Adım 3 — 2. Menü: Bedava QR**  
Kullanıcı uygulamadan "1 alana 1 bedava" seçeneğini aktifleştirir, 0 ₺'ye 2. menü QR kodu alır ve restorana gösterir. 2. menü restoranın %50 indirim taahhüdü kapsamında servis edilir.1 alan kısmını bazarx öder restorana hizmet bedeli alınır
**Adım 4 — Denkleştirme**  
Restoran 2 menü servis eder, kasasına %50 fiyat girer. Karşılığında 1 ay ücretsiz platform reklamı alır. **Platform nakit çıkışı: 0 ₺.**

#### Üç Taraf Dengesi

| Taraf | Veren | Alan |
|:---|:---|:---|
| **Restoran** | %50 indirimli 2 menü | İndirimli fiyat üzerinden nakit + 1 ay ücretsiz reklam bronz üyelik süresince | ayrıca resturantın fiyat yüksekliğine göre ücretsiz reklam gümüş üyelere 2 ay altın üyelere 3 ay uzatılabilir elmas üyelere 4 ay uzatılabilir resturantın menü fiyatı yüksekse reklam hakkı artırılabilir 1000 tl altı ise ek olarak 1 ay reklam hakkı verilebilir 1000 tl üstü ise ek olarak 2 ay reklam hakkı verilebilir bunların hepsini verme hakkını bazarx saklı tutar
| **Kullanıcı** | QR ödeme (menü fiyatının %50'si + hizmet bedeli) | 2× menü değeri |
| **BazarX** | 1 ay ücretsiz reklam alanı | Üyelik aidatı + %8 hizmet bedeli + platform trafiği |

---

### 2.3 Platform Hizmet Bedeli

**Sabit oran: %8 — tüm işlemlerde geçerli.**  
Hizmet bedeline ayrıca **%20 KDV** uygulanır. KDV matrahı yalnızca %8'lik hizmet bedeli üzerinden hesaplanır; menü tutarının tamamından değil.

#### Fiyat Hesaplama Örneği

| Kalem | Tutar |
|:---|---:|
| Tam menü fiyatı | 1.000 ₺ |
| %50 indirimli menü bedeli (QR) | 500 ₺ |
| Platform hizmet bedeli (%8 × 500) | 40 ₺ |
| KDV (%20 × 40) | 8 ₺ |
| **Kullanıcının toplam ödemesi** | **548 ₺** |
| **Kullanıcı tasarrufu** | **452 ₺ (%45)** |

---

### 2.4 Hediye Çeki Modeli

Cashback yerine **sürpriz hediye çeki** stratejisi uygulanır.

- Doğum günü çeki, platform yıl dönümü, 3. ay tamamlama gibi zamanlı ve beklenmedik ödüller
- Çek tutarı ve geçerlilik süresi platform tarafından belirlenir
- Satıcı komisyonu gelirinden finanse edilir
- Kullanıcı bağlılığını cashback'e göre daha güçlü etkiler: beklenmedik ödül, beklenen ödülden daha değerli algılanır

---

### 2.5 XP Ekonomisi

XP (Deneyim Puanı) platform içinde geçerli bir sadakat para birimidir. **Nakite çevrilemez, başkasına devredilemez.**

#### Kazanım Tablosu

| Görev | XP | Tekrar |
|:---|:---:|:---|
| Profil tamamlama | 5 XP | Tek seferlik |
| Instagram / Facebook'ta 3 kişiye paylaşım | 10 XP | Aylık 1 kez |
| BazarX Menüsü QR ile kullanım | 5 XP | Her kullanımda |
| Referans — üye olan kişi başına | 20 XP | Maks. 3 kişi |
| Referans alan yeni üye (karşılama bonusu) | 10 XP | Tek seferlik |
| Aylık harcama hedefini %110+ aşma | 15 XP | Aylık 1 kez |

#### Harcama Kuralları

| Kategori | Pay | Kural |
|:---|:---:|:---|
| Tier yükseltme | %50 maks. | Aidat farkının %50'sine kadar. 1 XP = 1 ₺ |
| Sistem içi ödeme | %20 maks. | Menü ödemesinin %20'sine kadar |

- **6 ay geçerlilik:** Kullanılmayan XP her ay %10 erir
- **İlk işlem kuralı:** İlk işlemde XP kazanımı ve kullanımı kapalı

---

### 2.6 Referans Sistemi

Tek katmanlıdır — zincirleme yapı oluşturulamaz.

| Referans | Referans Verene | Referans Alana |
|:---|:---|:---|
| 1. kişi üye olur | 20 XP | 10 XP karşılama bonusu |
| 2. kişi üye olur | 20 XP (toplam 40 XP) | 10 XP karşılama bonusu |
| 3. kişi üye olur | 20 XP + bir alt tier menüden 1+1 hakkı + tier geçişinde %20 aidat indirimi | 10 XP karşılama bonusu |

#### Somut Senaryo — Bronz Prime 2 Üye

| Adım | Olay | Değer |
|:---|:---|:---|
| Üyelik | Bronz Prime 2 alır | 399 ₺ öder |
| Menü hakkı | 2× aidat tutarında menü (798 ₺) | 800 ₺ değerinde yemek yer |
| 3 referans tamamlar | 1+1 Bronz Prime 1 menü hakkı doğar | 400 ₺ değerinde kahve/menü için 200 ₺ öder |
| **Özet** | Toplam 599 ₺ öder | **1.200 ₺ değer alır — 601 ₺ net tasarruf** |

---

### 2.7 Tier Yükseltme Kuralları

İki koşul **aynı anda** sağlanmalıdır:

**Koşul 1 — Ciro eşiği**  
Son 1 ayda platform üzerinden gerçekleştirilen toplam harcama, mevcut tier aylık aidatının **en az 5 katı** olmalıdır.  
*(Aidat ödemesi ve XP harcamaları hesaba dahil edilmez.)*

**Koşul 2 — Ödeme yapısı**  
Tier aidat farkının **en az %50'si nakit**, kalan **maks. %50'si XP** ile ödenebilir.

#### Tüm Geçişler

| Geçiş | Mevcut Aidat | Min. Ciro (5×) | Aidat Farkı | Min. Nakit | Maks. XP |
|:---|:---:|:---:|:---:|:---:|:---:|
| Bronz P1 → P2 | 199 ₺ | 995 ₺ | 200 ₺ | 100 ₺ | 100 XP |
| Bronz P2 → Gümüş P1 | 399 ₺ | 1.995 ₺ | 300 ₺ | 150 ₺ | 150 XP |
| Gümüş P1 → P2 | 699 ₺ | 3.495 ₺ | 300 ₺ | 150 ₺ | 150 XP |
| Gümüş P2 → Altın P1 | 999 ₺ | 4.995 ₺ | 500 ₺ | 250 ₺ | 250 XP |
| Altın P1 → P2 | 1.499 ₺ | 7.495 ₺ | 500 ₺ | 250 ₺ | 250 XP |
| Altın P2 → Elmas P1 | 1.999 ₺ | 9.995 ₺ | 1.000 ₺ | 500 ₺ | 500 XP |
| Elmas P1 → P2 | 2.999 ₺ | 14.995 ₺ | 2.000 ₺ | 1.000 ₺ | 1.000 XP |

#### Ek Kurallar

- **Otomatik hatırlatma:** Ciro eşiğinin %80'ine ulaşıldığında bildirim gönderilir
- **Downgrade koruması:** Seviye düşürüldüğünde menü hakkı 30 gün daha geçerlidir
- **Ücretsiz deneme:** Core kullanıcılar ilk 30 günde Bronz P1 avantajlarını deneyimler
- **Yıllık taahhüt:** 10 ay fiyatına 12 ay (2 ay ücretsiz)
- **3 referans ödülü:** Tier geçişinde nakit pay %50'den %40'a düşer, XP payı %60'a çıkar

---

### 2.8 Lansman Ortağı Modeli

#### 3 Fazlı Süreç

| Faz | Süre | İşletmeye Verilen | İşletmeden Alınan |
|:---|:---:|:---|:---|
| Faz 1 | Ay 1 | Platform profili + ücretsiz ilan + sosyal medya tanıtımı + 60 menü hediye kotası | 60 adet BazarX Menüsü taahhüdü |
| Faz 2 | Ay 2–3 | Ücretsiz reklam kampanyası + QR operasyonu desteği | Menü güncellemesi + min. %20 indirimli BazarX Menüsü |
| Faz 3 | Ay 4+ | Ücretli B2B üyeliğe geçiş daveti | Standart komisyon + takas sistemi |

#### 60 Menü Organik Büyüme Döngüsü

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

#### Büyüme Projeksiyonu (10 Lansman Ortağı)

| Metrik | Hesaplama | Sonuç |
|:---|:---|:---|
| Dağıtılan menü | 10 × 60 | 600 menü |
| Beklenen üye dönüşümü (%30) | 600 × 0.30 | ~180 ücretli üye |
| Ortalama aidat (Bronz ort.) | (199 + 399) / 2 | 299 ₺ |
| İlk ay üyelik geliri | 180 × 299 | ~53.820 ₺/ay |
| Kullanıcı edinme maliyeti | Menü taahhüdü karşılığı reklam takası | **~0 ₺ nakit** |

---

## 3. TicariTakas — B2B Platformu

### 3.1 Üyelik Seviyeleri

Tüm aidatlar **nakit** tahsil edilir. Aidat ödemeyenler tedarik havuzuna erişemez.

| Seviye | Yıllık Aidat | Barter Komisyonu | XP Kazanım | Havuz Limiti |
|:---|:---:|:---:|:---:|:---:|
| **CORE** | 12.000 ₺ | %12 | %50 | 150.000 ₺ |
| **PRIME** | 48.000 ₺ | %10 | %70 | 500.000 ₺ |
| **ELITE** | 120.000 ₺ | %8 | %85 | 1.500.000 ₺ |
| **APEX** | 300.000 ₺ | %6 | %100 | 10.000.000 ₺ |

---

### 3.2 Komisyon Yapısı

| Seviye | Standart Kom. | Grup İçi Oran | XP İndirimi Sonrası | XP İndirimi Formülü |
|:---|:---:|:---:|:---:|:---|
| CORE | %12 | %9 | **%6** | %12 × 0.5 = %6 |
| PRIME | %10 | %8 | **%5** | %10 × 0.5 = %5 |
| ELITE | %8 | %7 | **%4** | %8 × 0.5 = %4 |
| APEX | %6 | %6 | **%3** | %6 × 0.5 = %3 |

> XP indirimi komisyonun maks. **%50'sine** uygulanır. Kalan %50 her zaman nakit ödenir. XP indirimi ve grup içi oran aynı işlemde birlikte uygulanamaz.

#### Reklam ve Barter Çıpalama

| Paket | Haftalık | Aylık | Kombo Değeri | İçerik |
|:---|:---:|:---:|:---:|:---|
| Prime 1 | 6.000 ₺ | 22.000 ₺ | 800 ₺ | 2 Kahve + Tatlı + 250gr Çekirdek |
| Prime 2 | 8.000 ₺ | 30.000 ₺ | 1.000 ₺ | 2 İmza Tatlı + Özel Kutu Çikolata |
| Prime 3 | 10.000 ₺ | 38.000 ₺ | 1.200 ₺ | 2 Burger/Pizza + Çıtır Sepeti |
| Prime 4 | 12.000 ₺ | 46.000 ₺ | 1.600 ₺ | Şefin Özel Tadım Menüsü |

> Aylık fiyat = Haftalık × 4 × 0.9 (%10 aylık bağlılık indirimi)

---

### 3.3 XP ve TrustScore

#### XP Harcama Kuralı (50/25/25)

| Kategori | Pay | Süre | Kural |
|:---|:---:|:---:|:---|
| Komisyon sübvansiyonu | %50 | — | Komisyonun maks. %50'si XP ile ödenebilir |
| Reklam / ilan | %25 | 6 ay | 6 ay içinde kullanılmazsa silinir |
| Havuz peşinatı | %25 | — | Her işlemde kota tutarının maks. %30'u |

#### TrustScore Algoritması

| Kriter | Ağırlık | Ölçüm | Uyumsuzluk Cezası |
|:---|:---:|:---|:---|
| Ticari performans | %40 | Tamamlanan takas hızı | 90 günde işlem yoksa −10 puan/ay |
| XP sadakati | %30 | Cüzdandaki XP miktarı | Bakiye sıfırlanırsa −5 puan/ay |
| Uyumluluk | %30 | Price Floor ve kota uyumu | 1. ihlal uyarı, 2. −15 puan, 3. dondurma |

---

### 3.4 Watchtower ve Denetim

- **Kayıtlı Denetim Modu:** Şüpheli mesaj ve teklifler incelenebilir; tüm işlemler şifreli log'a kaydedilir. KVKK md. 5, 10, 12 çerçevesinde kullanıcı üyelik sözleşmesinde bu yetkiyi kabul eder.
- **İlk İşlem Kuralı:** Sisteme ilk girişte XP kazanımı ve kullanımı kapalıdır.
- **Tek Seviye Referans:** Referans komisyonu sabit tutar, yüzde bazlı zincirleme yapı oluşturulamaz.
- **Uyuşmazlık Çözümü:** 72 saat içinde itiraz açılabilir → otomatik sistem kararı → manuel inceleme → bağlayıcı hakem kurulu.
- **Çıkış Mekanizması:** Sistemden ayrılırken XP komisyon payı 90 gün kullanılabilir; kalan silinir. Aidat iadesi yapılmaz.

---

## 4. BarterBorsa — Kurumsal Platform

Büyük markaların kendi bayileri arasında stok eritme ve kota yönetimi yapabileceği SaaS modelidir.

| Özellik | Açıklama |
|:---|:---|
| **Kör Havuz (Blind Pool)** | Bayiler toplam stoğu görür, rakip bayinin kimliğini göremez |
| **Smart Cap (Akıllı Kota)** | Bir bayi havuz stoğunun maks. %25'ini tek işlemde alabilir |
| **Grup İçi Oran** | Aynı grup içi takaslarda %6 sistem yönetim bedeli |
| **Marka Yönetim Paneli** | Bayi TrustScore'ları, stok hareketleri gerçek zamanlı izlenir |
| **Veri Gizliliği** | KVKK kapsamında açık rıza ile sınırlı; ham veri üçüncü tarafla paylaşılmaz |

---

### 4.1 Fabrika Ekosistemi — Aktörler ve Roller

| Aktör | Üyelik Seviyesi | Açıklama |
|:---|:---:|:---|
| **Fabrika** | `APEX` (zorunlu) | Ekosistemin sahibi. Alt bayileri sisteme kaydeder. Ürün gamını ve görünürlüğü yönetir. |
| **Bayi** | `CORE` (başlangıç) | Fabrika tarafından sisteme dahil edilir. Kendi başına kayıt olamaz. |

- Fabrika sisteme **APEX** üyesi olarak girmek **zorundadır**. APEX altında ekosistem kurulamaz.
- Bayiler `CORE` seviyesinden başlar; seviye yükseltme fabrika onayına tabidir.
- Bir bayi aynı anda yalnızca **bir** fabrikanın ekosistemine dahil olabilir.

### 4.2 Ürün Gamı ve Görünürlük Kontrolü

- Fabrika ürünleri yalnızca **o fabrikanın bayileri** tarafından görülebilir; genel BazarX pazaryerinde görünmez.
- Fabrika her ürün için aşağıdaki parametreleri **ayrı ayrı** belirler:

| Parametre | Açıklama |
|:---|:---|
| `visibleTo` | `ALL_DEALERS` / `SELECTED_DEALERS` / `NONE` |
| `availableFrom` / `availableTo` | Görünürlük zaman aralığı (null = süresiz) |
| `allowOnlineResale` | Bayinin ürünü internette satıp satamayacağı |
| `maxOrderQtyPerDealer` | Bayi başına maksimum sipariş adedi (zorunlu, null olamaz) |

### 4.3 Watchover (Kota) Mekanizması

- Sipariş anında sistem, bayinin o ürün için toplam geçmiş siparişini kontrol eder.
- `toplamSiparişAdedi + yeniAdet > maxOrderQtyPerDealer` → sipariş reddedilir (`DEALER_QUOTA_EXCEEDED`).
- Kontrol uygulama katmanında **atomic** olarak yapılır (tekelleşme önlemi).
- **Smart Cap:** Bir bayi havuz stoğunun **%25'inden** fazlasını tek siparişte alamaz.

### 4.4 Garaj Günü (Flash Sale)

Fabrika belirli bir zaman aralığında indirimli stok satışı yapabilir. Fabrika şu parametrelerin **tamamını** belirler:

| Parametre | Açıklama |
|:---|:---|
| `discountRate` | İndirim oranı (%) |
| `maxTotalQty` | Kampanya toplam stok limiti |
| `maxQtyPerDealer` | Bayi başına limit (Watchover'dan bağımsız, daha kısıtlayıcı olabilir) |
| `startsAt` / `endsAt` | Kampanya zaman aralığı |

- Stok (`maxTotalQty`) tükenince kampanya **otomatik kapanır**; süre dolmamış olsa bile yeni sipariş alınmaz (`GARAGE_SALE_STOCK_EXHAUSTED`).
- Stok tüketimi **atomic** artırılır (race condition önlemi).

### 4.5 Ekosistem İçi Takas Yasağı

- **Bayiler ekosistem içinde birbirleriyle takas yapamaz.**
- Takas için genel **BazarX Pazaryeri**'ne geçmeleri gerekir.
- Pazaryerindeki takas standart kurallar (escrow, 5 adım, sanal isim) dahilinde gerçekleşir.
- Fabrikadan satın alınan ürünün pazaryerinde takas edilebilmesi `allowOnlineResale` iznine tabidir.

---

## 5. Gelir Modeli ve Vergisel Yükümlülükler

### 5.1 Konsolide Gelir Kalemleri

| Platform | Gelir Kalemi | Oran / Tutar |
|:---|:---|:---|
| **BazarX** | Üyelik aidatı | 199 – 4.999 ₺/ay |
| **BazarX** | Satıcı komisyonu | %6 – %12 (ciro üzerinden) |
| **BazarX** | Platform hizmet bedeli | %8 × indirimli menü tutarı |
| **BazarX** | Reklam geliri | Değişken |
| **TicariTakas** | Yıllık aidat | 12.000 – 300.000 ₺/yıl |
| **TicariTakas** | İşlem komisyonu | %6 – %12 |
| **TicariTakas** | Reklam geliri | Değişken |
| **BarterBorsa** | SaaS lisans bedeli | Kurum başı aylık sabit |
| **BarterBorsa** | İşlem yönetim bedeli | %6 × işlem hacmi |
| **BarterBorsa** | Reklam geliri | Değişken |

### 5.2 Vergisel Yükümlülükler

#### BazarX KDV

- Aidat, satıcı komisyonu ve reklam geliri: **%20 KDV tahakkuku**
- Platform hizmet bedeli: **%8 hizmet × %20 KDV** (matrah yalnızca hizmet bedeli)
- Gider faturalarının KDV'si indirim mekanizmasına dahil edilir
- Net KDV = Tahakkuk eden KDV − İndirilecek KDV

#### TicariTakas KDV + Stopaj

- Tüm gelir kalemleri: **%20 KDV**
- Aracılık komisyonu üzerinden: **%10 stopaj**
- Stopaj her ay muhtasar beyannameyle beyan edilir

#### Kurumlar Vergisi

- **%25 yıllık** (aylık karşılık ayrılır)
- Matrah: Brüt gelir − Giderler − Ödenen KDV
- Geçici vergi: 3 ayda bir beyan

#### Damga Vergisi

- Üyelik sözleşmeleri üzerinden tahmini **‰1**
- Elektronik sözleşmeler için mali müşavir görüşü alınmalıdır

> **Önemli not:** Bu tablolar genel çerçeve bilgisi niteliğindedir. Platform yapısına göre bazı muafiyet ve optimizasyon imkânları bulunabilir. Tüm vergisel süreçler için mali müşavir görüşü alınmalıdır.

---

## 6. Karlılık Simülatörü

Aşağıdaki simülatör üç platformu (BazarX, TicariTakas, BarterBorsa) ayrı ayrı ve konsolide olarak modellemektedir. Parametreleri kaydırarak kırılım noktalarını ve karlılık marjını gerçek zamanlı görebilirsiniz.

> **Simülatör parametreleri ve varsayımlar:**
> - BazarX hizmet bedeli: sabit **%8** (tüm işlemlerde)
> - KDV: **%20** (yalnızca hizmet bedeli üzerinden)
> - Cashback: **yok** (hediye çeki modeli uygulanır)
> - TicariTakas stopajı: **%10** × komisyon geliri
> - Kurumlar vergisi karşılığı: **%25 yıllık → aylık**
> - Operasyon gideri dağılımı: BazarX %50, TicariTakas %30, BarterBorsa %20

```html
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BazarX Karlılık Simülatörü</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; background: #f5f5f5; padding: 1rem; }
  h1 { font-size: 20px; font-weight: 600; margin-bottom: 1.5rem; color: #1A3A5C; }
  h2 { font-size: 15px; font-weight: 600; color: #2E6DA4; margin: 1.5rem 0 0.75rem; text-transform: uppercase; letter-spacing: .04em; }
  .card { background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
  .row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .row label { font-size: 13px; color: #555; width: 220px; flex-shrink: 0; }
  .row input[type=range] { flex: 1; }
  .row .rv { font-size: 13px; font-weight: 600; min-width: 90px; text-align: right; }
  .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 1rem; }
  .sc { background: #f0f4f8; border-radius: 8px; padding: 12px; }
  .sc .lbl { font-size: 11px; color: #666; margin-bottom: 4px; }
  .sc .val { font-size: 20px; font-weight: 600; }
  .green { color: #1E7B45; } .red { color: #C0392B; } .blue { color: #185FA5; } .amber { color: #B8860B; }
  .pgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 1rem; }
  .pc { background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 14px; }
  .pc .pt { font-size: 13px; font-weight: 600; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
  .pc .pr { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; color: #666; }
  .pc .pr span:last-child { font-weight: 600; color: #1a1a1a; }
  .pc .pnet { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; padding-top: 8px; margin-top: 4px; border-top: 1px solid #eee; }
  .chart-wrap { position: relative; width: 100%; height: 220px; margin-bottom: 1rem; }
  .be-wrap { position: relative; width: 100%; height: 180px; margin-bottom: 1rem; }
  .warn { background: #fef9ec; color: #b45309; border: 1px solid #f59e0b; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 8px; }
  .danger { background: #fef2f2; color: #991b1b; border: 1px solid #ef4444; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 8px; }
  .info { background: #eff6ff; color: #1e40af; border: 1px solid #93c5fd; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 1rem; }
  .tgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 1rem; }
  .tbox { border: 1px solid #ddd; border-radius: 8px; padding: 9px; background: #fff; }
  .tbox .tn { font-size: 11px; font-weight: 600; margin-bottom: 5px; }
  .tbox .tr { display: flex; align-items: center; gap: 5px; }
  .tbox .tr label { font-size: 11px; color: #666; width: 30px; flex-shrink: 0; }
  .tbox .tr input[type=range] { flex: 1; min-width: 0; }
  .tbox .tr .tv { font-size: 11px; font-weight: 600; min-width: 26px; text-align: right; }
  .tbox .tcount { font-size: 10px; color: #999; text-align: center; margin-top: 3px; }
  .distw { background: #fef9ec; color: #b45309; border-radius: 6px; padding: 6px 10px; font-size: 12px; margin-bottom: 8px; display: none; }
  .fiyat-box { background: #f0f7ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 12px 16px; margin-bottom: 1rem; }
  .fiyat-box .fb-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #dbeafe; font-size: 13px; }
  .fiyat-box .fb-row:last-child { border-bottom: none; font-weight: 600; padding-top: 6px; }
  .fiyat-box .fb-row span:last-child { font-weight: 600; color: #1E7B45; }
  .tax-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 1rem; }
  .tc { border: 1px solid #ddd; border-radius: 8px; padding: 12px; background: #fff; }
  .tc .tct { font-size: 12px; font-weight: 600; margin-bottom: 8px; color: #666; }
  .tcr { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; border-bottom: 1px solid #eee; color: #666; }
  .tcr span:last-child { color: #1a1a1a; }
  .tcr.tot { border-bottom: none; font-weight: 600; font-size: 13px; padding-top: 6px; color: #1a1a1a; }
  .tcr.tot span:last-child { color: #C0392B; }
  @media (max-width: 700px) {
    .summary, .pgrid, .tgrid, .tax-grid { grid-template-columns: 1fr 1fr; }
    .row label { width: 140px; }
  }
</style>
</head>
<body>
<h1>BazarX Ekosistemi — Karlılık Simülatörü</h1>

<h2>Fiyat Hesaplayıcı — %8 Hizmet Bedeli + %20 KDV</h2>
<div class="fiyat-box">
  <div style="margin-bottom:8px;font-size:13px;font-weight:600">
    Menü tutarı: <input type="number" id="ornekM" value="500" min="100" max="10000" step="50"
      style="width:80px;font-size:13px;padding:3px 8px;border:1px solid #ccc;border-radius:4px"> ₺
  </div>
  <div class="fb-row"><span>%50 indirimli menü bedeli (QR)</span><span id="fp_menu">—</span></div>
  <div class="fb-row"><span>Platform hizmet bedeli (%8)</span><span id="fp_hizmet">—</span></div>
  <div class="fb-row"><span>KDV (%20 × hizmet bedeli)</span><span id="fp_kdv">—</span></div>
  <div class="fb-row"><span>Kullanıcının toplam ödemesi</span><span id="fp_toplam">—</span></div>
  <div class="fb-row"><span>Tasarruf (tam fiyata göre)</span><span id="fp_tasarruf">—</span></div>
</div>

<h2>BazarX — B2C Parametreleri</h2>
<div class="card">
  <div class="row"><label>B2C üye sayısı</label><input type="range" id="b2cM" min="50" max="5000" step="50" value="500"><span class="rv" id="v_b2cM">500</span></div>
  <div class="row"><label>Üye başı aylık menü harcaması</label><input type="range" id="b2cCiro" min="200" max="15000" step="100" value="1500"><span class="rv" id="v_b2cCiro">1.500 ₺</span></div>
  <div class="row"><label>Satıcı komisyon oranı (ort.)</label><input type="range" id="b2cKom" min="6" max="12" step="1" value="9"><span class="rv" id="v_b2cKom">%9</span></div>
  <div class="row"><label>BazarX reklam geliri / ay</label><input type="range" id="b2cRek" min="0" max="200000" step="5000" value="30000"><span class="rv" id="v_b2cRek">30.000 ₺</span></div>
  <div class="row"><label>Hediye çeki gideri / ay</label><input type="range" id="hediye" min="0" max="50000" step="1000" value="5000"><span class="rv" id="v_hediye">5.000 ₺</span></div>

  <div style="font-size:11px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:.05em;margin:12px 0 8px">Tier Dağılımı (Toplam 100%)</div>
  <div class="tgrid">
    <div class="tbox"><div class="tn" style="color:#8B5E3C">Bronz P1 — 199₺</div>
      <div class="tr"><label>Pay</label><input type="range" class="td" data-i="0" min="0" max="70" step="1" value="30"><span class="tv" id="td0">30%</span></div>
      <div class="tcount" id="tc0"></div></div>
    <div class="tbox"><div class="tn" style="color:#8B5E3C">Bronz P2 — 399₺</div>
      <div class="tr"><label>Pay</label><input type="range" class="td" data-i="1" min="0" max="70" step="1" value="25"><span class="tv" id="td1">25%</span></div>
      <div class="tcount" id="tc1"></div></div>
    <div class="tbox"><div class="tn" style="color:#6B7280">Gümüş P1 — 699₺</div>
      <div class="tr"><label>Pay</label><input type="range" class="td" data-i="2" min="0" max="60" step="1" value="18"><span class="tv" id="td2">18%</span></div>
      <div class="tcount" id="tc2"></div></div>
    <div class="tbox"><div class="tn" style="color:#6B7280">Gümüş P2 — 999₺</div>
      <div class="tr"><label>Pay</label><input type="range" class="td" data-i="3" min="0" max="60" step="1" value="12"><span class="tv" id="td3">12%</span></div>
      <div class="tcount" id="tc3"></div></div>
    <div class="tbox"><div class="tn" style="color:#B8860B">Altın P1 — 1.499₺</div>
      <div class="tr"><label>Pay</label><input type="range" class="td" data-i="4" min="0" max="40" step="1" value="7"><span class="tv" id="td4">7%</span></div>
      <div class="tcount" id="tc4"></div></div>
    <div class="tbox"><div class="tn" style="color:#B8860B">Altın P2 — 1.999₺</div>
      <div class="tr"><label>Pay</label><input type="range" class="td" data-i="5" min="0" max="40" step="1" value="5"><span class="tv" id="td5">5%</span></div>
      <div class="tcount" id="tc5"></div></div>
    <div class="tbox"><div class="tn" style="color:#1A3A5C">Elmas P1 — 2.999₺</div>
      <div class="tr"><label>Pay</label><input type="range" class="td" data-i="6" min="0" max="20" step="1" value="2"><span class="tv" id="td6">2%</span></div>
      <div class="tcount" id="tc6"></div></div>
    <div class="tbox"><div class="tn" style="color:#1A3A5C">Elmas P2 — 4.999₺</div>
      <div class="tr"><label>Pay</label><input type="range" class="td" data-i="7" min="0" max="20" step="1" value="1"><span class="tv" id="td7">1%</span></div>
      <div class="tcount" id="tc7"></div></div>
  </div>
  <div class="distw" id="distWarn">Tier toplamı <span id="distSum"></span>% — 100% olmalı</div>
</div>

<h2>TicariTakas — B2B Parametreleri</h2>
<div class="card">
  <div class="row"><label>CORE üye (12.000₺/yıl, %12)</label><input type="range" id="ttC" min="0" max="200" step="1" value="30"><span class="rv" id="v_ttC">30</span></div>
  <div class="row"><label>PRIME üye (48.000₺/yıl, %10)</label><input type="range" id="ttP" min="0" max="100" step="1" value="15"><span class="rv" id="v_ttP">15</span></div>
  <div class="row"><label>ELITE üye (120.000₺/yıl, %8)</label><input type="range" id="ttE" min="0" max="50" step="1" value="5"><span class="rv" id="v_ttE">5</span></div>
  <div class="row"><label>APEX üye (300.000₺/yıl, %6)</label><input type="range" id="ttA" min="0" max="20" step="1" value="1"><span class="rv" id="v_ttA">1</span></div>
  <div class="row"><label>Üye başı aylık takas cirosu</label><input type="range" id="ttCiro" min="10000" max="500000" step="5000" value="80000"><span class="rv" id="v_ttCiro">80.000 ₺</span></div>
  <div class="row"><label>TicariTakas reklam geliri / ay</label><input type="range" id="ttRek" min="0" max="200000" step="5000" value="20000"><span class="rv" id="v_ttRek">20.000 ₺</span></div>
</div>

<h2>BarterBorsa — Kurumsal Parametreler</h2>
<div class="card">
  <div class="row"><label>Aktif kurum sayısı</label><input type="range" id="bbK" min="0" max="50" step="1" value="3"><span class="rv" id="v_bbK">3</span></div>
  <div class="row"><label>Kurum başı aylık SaaS bedeli</label><input type="range" id="bbS" min="5000" max="100000" step="1000" value="25000"><span class="rv" id="v_bbS">25.000 ₺</span></div>
  <div class="row"><label>Kurum başı aylık işlem hacmi</label><input type="range" id="bbH" min="100000" max="10000000" step="100000" value="2000000"><span class="rv" id="v_bbH">2.000.000 ₺</span></div>
  <div class="row"><label>BarterBorsa reklam geliri / ay</label><input type="range" id="bbR" min="0" max="100000" step="5000" value="10000"><span class="rv" id="v_bbR">10.000 ₺</span></div>
  <div class="row"><label>Sabit operasyon gideri / ay</label><input type="range" id="opsBase" min="20000" max="300000" step="5000" value="60000"><span class="rv" id="v_ops">60.000 ₺</span></div>
</div>

<h2>Platform Bazlı Karlılık</h2>
<div class="pgrid">
  <div class="pc"><div class="pt" style="color:#185FA5">BazarX — B2C</div>
    <div class="pr"><span>Aidat geliri</span><span id="bx_aidat">—</span></div>
    <div class="pr"><span>Satıcı komisyonu</span><span id="bx_satkom">—</span></div>
    <div class="pr"><span>Hizmet bedeli (%8 + %20 KDV)</span><span id="bx_hizmet">—</span></div>
    <div class="pr"><span>Reklam geliri</span><span id="bx_rek">—</span></div>
    <div class="pr"><span>Hediye çeki gideri</span><span id="bx_hediye" class="red">—</span></div>
    <div class="pr"><span>XP + operasyon payı</span><span id="bx_ops" class="red">—</span></div>
    <div class="pr"><span>Vergi yükü</span><span id="bx_vergi" class="amber">—</span></div>
    <div class="pnet"><span>Net kâr</span><span id="bx_net">—</span></div></div>
  <div class="pc"><div class="pt" style="color:#1E7B45">TicariTakas — B2B</div>
    <div class="pr"><span>Aidat geliri (aylık)</span><span id="tt_aidat">—</span></div>
    <div class="pr"><span>İşlem komisyonu</span><span id="tt_kom">—</span></div>
    <div class="pr"><span>Reklam geliri</span><span id="tt_rek">—</span></div>
    <div class="pr"><span>Operasyon payı</span><span id="tt_ops" class="red">—</span></div>
    <div class="pr"><span>Vergi yükü</span><span id="tt_vergi" class="amber">—</span></div>
    <div class="pnet"><span>Net kâr</span><span id="tt_net">—</span></div></div>
  <div class="pc"><div class="pt" style="color:#8B5E3C">BarterBorsa — Kurumsal</div>
    <div class="pr"><span>SaaS lisans geliri</span><span id="bb_saas">—</span></div>
    <div class="pr"><span>İşlem yönetim bedeli (%6)</span><span id="bb_kom">—</span></div>
    <div class="pr"><span>Reklam geliri</span><span id="bb_rek">—</span></div>
    <div class="pr"><span>Operasyon payı</span><span id="bb_ops" class="red">—</span></div>
    <div class="pr"><span>Vergi yükü</span><span id="bb_vergi" class="amber">—</span></div>
    <div class="pnet"><span>Net kâr</span><span id="bb_net">—</span></div></div>
</div>

<h2>Konsolide Özet</h2>
<div class="summary">
  <div class="sc"><div class="lbl">Toplam brüt gelir</div><div class="val blue" id="c_brut">—</div></div>
  <div class="sc"><div class="lbl">Toplam gider</div><div class="val red" id="c_gider">—</div></div>
  <div class="sc"><div class="lbl">Toplam vergi yükü</div><div class="val amber" id="c_vergi">—</div></div>
  <div class="sc"><div class="lbl">Konsolide net kâr</div><div class="val" id="c_net">—</div></div>
</div>

<h2>Gelir & Gider Dağılımı</h2>
<div class="chart-wrap"><canvas id="mainChart" role="img" aria-label="Konsolide gelir gider grafiği">Gelir ve gider dağılımı.</canvas></div>

<h2>Vergisel Yükümlülükler (Aylık)</h2>
<div class="tax-grid">
  <div class="tc"><div class="tct">BazarX KDV</div>
    <div class="tcr"><span>Tahakkuk (%20)</span><span id="tx_bx_kdvt">—</span></div>
    <div class="tcr"><span>Hizmet bedeli KDV'si</span><span id="tx_bx_hkdv">—</span></div>
    <div class="tcr"><span>İndirilecek KDV</span><span id="tx_bx_kdvi">—</span></div>
    <div class="tcr tot"><span>Net ödenecek KDV</span><span id="tx_bx_net">—</span></div></div>
  <div class="tc"><div class="tct">TicariTakas KDV + Stopaj</div>
    <div class="tcr"><span>KDV tahakkuku (%20)</span><span id="tx_tt_kdv">—</span></div>
    <div class="tcr"><span>Stopaj (%10 × komisyon)</span><span id="tx_tt_stopaj">—</span></div>
    <div class="tcr tot"><span>Toplam yük</span><span id="tx_tt_top">—</span></div></div>
  <div class="tc"><div class="tct">Kurumlar V. + Damga</div>
    <div class="tcr"><span>KV karşılığı (%25 → aylık)</span><span id="tx_kv">—</span></div>
    <div class="tcr"><span>Damga vergisi (‰1)</span><span id="tx_dv">—</span></div>
    <div class="tcr tot"><span>Konsolide toplam vergi</span><span id="tx_toplam">—</span></div></div>
</div>

<div id="riskArea"></div>
<div id="infoBox" class="info"></div>

<h2>Kırılım Noktası — B2C Üye Sayısına Göre Net Kâr</h2>
<div class="be-wrap"><canvas id="beChart" role="img" aria-label="Kırılım noktası analizi">Kırılım noktası grafiği.</canvas></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<script>
const TIERS=[{aidat:199},{aidat:399},{aidat:699},{aidat:999},{aidat:1499},{aidat:1999},{aidat:2999},{aidat:4999}];
const TT_TIERS=[{aidat:12000,kom:0.12},{aidat:48000,kom:0.10},{aidat:120000,kom:0.08},{aidat:300000,kom:0.06}];
const HB=0.08,KDV=0.20;
const fmt=n=>Math.round(n).toLocaleString('tr-TR')+' ₺';
let dist=[30,25,18,12,7,5,2,1];
let mainChart,beChart;
const g=id=>document.getElementById(id);
const gv=id=>+g(id).value;

function updateFiyat(){
  const m=gv('ornekM'),mi=m*0.5,hb=mi*HB,kdv=hb*KDV,top=mi+hb+kdv,tas=m-top;
  g('fp_menu').textContent=fmt(mi);g('fp_hizmet').textContent=fmt(hb);
  g('fp_kdv').textContent=fmt(kdv);g('fp_toplam').textContent=fmt(top);
  g('fp_tasarruf').textContent=fmt(tas)+' (%'+Math.round(tas/m*100)+' tasarruf)';
}
g('ornekM').addEventListener('input',updateFiyat);updateFiyat();

document.querySelectorAll('.td').forEach(el=>{
  el.addEventListener('input',function(){dist[+this.dataset.i]=+this.value;g('td'+this.dataset.i).textContent=this.value+'%';calc();});
});
[['b2cM','v_b2cM',v=>Math.round(v).toLocaleString('tr-TR')],['b2cCiro','v_b2cCiro',v=>Math.round(v).toLocaleString('tr-TR')+' ₺'],
 ['b2cKom','v_b2cKom',v=>'%'+v],['b2cRek','v_b2cRek',v=>Math.round(v).toLocaleString('tr-TR')+' ₺'],
 ['hediye','v_hediye',v=>Math.round(v).toLocaleString('tr-TR')+' ₺'],
 ['ttC','v_ttC',v=>v],['ttP','v_ttP',v=>v],['ttE','v_ttE',v=>v],['ttA','v_ttA',v=>v],
 ['ttCiro','v_ttCiro',v=>Math.round(v).toLocaleString('tr-TR')+' ₺'],['ttRek','v_ttRek',v=>Math.round(v).toLocaleString('tr-TR')+' ₺'],
 ['bbK','v_bbK',v=>v],['bbS','v_bbS',v=>Math.round(v).toLocaleString('tr-TR')+' ₺'],
 ['bbH','v_bbH',v=>Math.round(v).toLocaleString('tr-TR')+' ₺'],['bbR','v_bbR',v=>Math.round(v).toLocaleString('tr-TR')+' ₺'],
 ['opsBase','v_ops',v=>Math.round(v).toLocaleString('tr-TR')+' ₺'],
].forEach(([id,vid,fn])=>{ g(id).addEventListener('input',function(){g(vid).textContent=fn(this.value);calc();}); });

function calcBX(m,ciro,komR,rek,hed,opsS){
  let aidat=0;TIERS.forEach((t,i)=>{aidat+=m*dist[i]/100*t.aidat;});
  const satKom=m*ciro*(komR/100),mi=m*ciro*0.5,hb=mi*HB,hkdv=hb*KDV,hTop=hb+hkdv;
  const brut=aidat+satKom+hTop+rek,xp=aidat*0.05,gider=hed+xp+opsS;
  const kdvT=(aidat+satKom+rek)*KDV+hkdv,kdvI=gider*0.18,kdvN=Math.max(0,kdvT-kdvI);
  const dv=brut*0.001,kv=Math.max(0,brut-gider-kdvN)*0.25/12,vergi=kdvN+kv+dv;
  return {aidat,satKom,hb,hkdv,hTop,rek,hed,xp,opsS,gider,kdvT,hkdvVal:hkdv,kdvI,kdvN,dv,kv,vergi,net:brut-gider-vergi,brut};
}
function calcTT(c,p,e,a,ciro,rek,opsS){
  let aidat=0,kom=0;TT_TIERS.forEach((t,i)=>{const n=[c,p,e,a][i];aidat+=n*t.aidat/12;kom+=n*ciro*t.kom;});
  const brut=aidat+kom+rek,kdvT=brut*KDV,stop=kom*0.10,kv=Math.max(0,brut-opsS-kdvT)*0.25/12;
  return {aidat,kom,rek,ops:opsS,gider:opsS,kdvT,stop,kv,vergi:kdvT+stop+kv,net:brut-opsS-(kdvT+stop+kv),brut};
}
function calcBB(k,s,h,r,opsS){
  const sg=k*s,kg=k*h*0.06,brut=sg+kg+r,kdvT=brut*KDV,kdvI=opsS*0.18,kdvN=Math.max(0,kdvT-kdvI);
  const kv=Math.max(0,brut-opsS-kdvN)*0.25/12;
  return {saas:sg,kom:kg,rek:r,ops:opsS,gider:opsS,kdvT,kdvI,kdvN,kv,vergi:kdvN+kv,net:brut-opsS-(kdvN+kv),brut};
}

function calc(){
  const ds=dist.reduce((a,b)=>a+b,0);
  g('distSum').textContent=ds;g('distWarn').style.display=ds!==100?'block':'none';if(ds!==100)return;
  TIERS.forEach((_,i)=>{g('tc'+i).textContent=Math.round(gv('b2cM')*dist[i]/100)+' üye';});
  const BX=calcBX(gv('b2cM'),gv('b2cCiro'),gv('b2cKom'),gv('b2cRek'),gv('hediye'),gv('opsBase')*0.50);
  const TT=calcTT(gv('ttC'),gv('ttP'),gv('ttE'),gv('ttA'),gv('ttCiro'),gv('ttRek'),gv('opsBase')*0.30);
  const BB=calcBB(gv('bbK'),gv('bbS'),gv('bbH'),gv('bbR'),gv('opsBase')*0.20);
  const s=(id,v)=>{g(id).textContent=fmt(v);};
  s('bx_aidat',BX.aidat);s('bx_satkom',BX.satKom);s('bx_hizmet',BX.hTop);s('bx_rek',BX.rek);
  s('bx_hediye',BX.hed);s('bx_ops',BX.xp+BX.opsS);s('bx_vergi',BX.vergi);
  g('bx_net').textContent=fmt(BX.net);g('bx_net').className=BX.net>=0?'green':'red';
  s('tt_aidat',TT.aidat);s('tt_kom',TT.kom);s('tt_rek',TT.rek);s('tt_ops',TT.ops);s('tt_vergi',TT.vergi);
  g('tt_net').textContent=fmt(TT.net);g('tt_net').className=TT.net>=0?'green':'red';
  s('bb_saas',BB.saas);s('bb_kom',BB.kom);s('bb_rek',BB.rek);s('bb_ops',BB.ops);s('bb_vergi',BB.vergi);
  g('bb_net').textContent=fmt(BB.net);g('bb_net').className=BB.net>=0?'green':'red';
  const cB=BX.brut+TT.brut+BB.brut,cG=BX.gider+TT.gider+BB.gider,cV=BX.vergi+TT.vergi+BB.vergi,cN=BX.net+TT.net+BB.net;
  g('c_brut').textContent=fmt(cB);g('c_gider').textContent=fmt(cG);g('c_vergi').textContent=fmt(cV);
  g('c_net').textContent=fmt(cN);g('c_net').className='val '+(cN>=0?'green':'red');
  s('tx_bx_kdvt',BX.kdvT-BX.hkdvVal);s('tx_bx_hkdv',BX.hkdvVal);
  g('tx_bx_kdvi').textContent='-'+fmt(BX.kdvI);s('tx_bx_net',BX.kdvN);
  s('tx_tt_kdv',TT.kdvT);s('tx_tt_stopaj',TT.stop);s('tx_tt_top',TT.kdvT+TT.stop);
  s('tx_kv',BX.kv+TT.kv+BB.kv);s('tx_dv',BX.dv);s('tx_toplam',cV);
  const risks=[];
  if(BX.satKom<BX.hed) risks.push({t:'warn',m:'BazarX: Satıcı komisyonu hediye çeki giderini karşılamıyor.'});
  if(cN<0) risks.push({t:'danger',m:'Konsolide model zarar ediyor. Üye sayısını artır veya operasyon giderini düşür.'});
  if(BB.net<0) risks.push({t:'warn',m:'BarterBorsa bu kurum sayısıyla kârsız.'});
  g('riskArea').innerHTML=risks.map(r=>`<div class="${r.t}" style="margin-bottom:6px">${r.m}</div>`).join('');
  g('infoBox').innerHTML=`<strong>BX hizmet bedeli geliri:</strong> ${fmt(BX.hb)} &nbsp;|&nbsp; <strong>BX net:</strong> ${fmt(BX.net)} &nbsp;|&nbsp; <strong>TT net:</strong> ${fmt(TT.net)} &nbsp;|&nbsp; <strong>BB net:</strong> ${fmt(BB.net)}`;
  const bL=['BX aidat','BX sat.kom','BX hizmet','BX rek.','TT aidat','TT kom.','TT rek.','BB SaaS','BB kom.','BB rek.','Giderler','Vergiler','Net kâr'];
  const bV=[BX.aidat,BX.satKom,BX.hTop,BX.rek,TT.aidat,TT.kom,TT.rek,BB.saas,BB.kom,BB.rek,-cG,-cV,cN];
  if(mainChart) mainChart.destroy();
  mainChart=new Chart(g('mainChart'),{type:'bar',data:{labels:bL,datasets:[{data:bV.map(Math.abs),backgroundColor:bV.map(v=>v>=0?'#1E7B45':'#C0392B'),borderWidth:0.5}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>(bV[ctx.dataIndex]<0?'-':'')+Math.round(Math.abs(ctx.raw)).toLocaleString('tr-TR')+' ₺'}}},
    scales:{x:{ticks:{font:{size:10},maxRotation:40,autoSkip:false},grid:{display:false}},y:{ticks:{callback:v=>(v/1000).toFixed(0)+'K ₺',font:{size:10}},grid:{color:'rgba(0,0,0,0.05)'}}}}});
  const maxM=Math.max(gv('b2cM')*2.5,500),pts=[];
  for(let m=50;m<=maxM;m+=50){const bx=calcBX(m,gv('b2cCiro'),gv('b2cKom'),gv('b2cRek'),gv('hediye'),gv('opsBase')*0.50),tt=calcTT(gv('ttC'),gv('ttP'),gv('ttE'),gv('ttA'),gv('ttCiro'),gv('ttRek'),gv('opsBase')*0.30),bb=calcBB(gv('bbK'),gv('bbS'),gv('bbH'),gv('bbR'),gv('opsBase')*0.20);pts.push({x:m,y:Math.round(bx.net+tt.net+bb.net)});}
  if(beChart) beChart.destroy();
  beChart=new Chart(g('beChart'),{type:'line',data:{datasets:[{data:pts,borderWidth:1.5,pointRadius:0,fill:false,tension:0.3,segment:{borderColor:ctx=>ctx.p0.parsed.y<0?'#C0392B':'#1E7B45'}},{data:pts.map(p=>({x:p.x,y:0})),borderColor:'rgba(0,0,0,0.2)',borderWidth:0.5,pointRadius:0,fill:false}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{title:ctx=>'B2C üye: '+ctx[0].raw.x.toLocaleString('tr-TR'),label:ctx=>ctx.datasetIndex===0?(ctx.raw.y>=0?'Kâr: ':'Zarar: ')+Math.abs(ctx.raw.y).toLocaleString('tr-TR')+' ₺':null,filter:i=>i.datasetIndex===0}}},
    scales:{x:{type:'linear',ticks:{callback:v=>v.toLocaleString('tr-TR'),font:{size:10}},grid:{display:false}},y:{ticks:{callback:v=>(v/1000).toFixed(0)+'K ₺',font:{size:10}},grid:{color:'rgba(0,0,0,0.05)'}}}}});
}
calc();
</script>
</body>
</html>
```

---

## 7. CFO Özeti

> *"BazarX; bilançonuzdaki hareketsiz stokları operasyonel giderlerinizi karşılayan likit değere dönüştüren, kullanıcıyı platforma çeken ve orada tutan üç katmanlı bir ekosistemdir."*

### Örnek Senaryo — PRIME B2B Üye (500.000 ₺ Atıl Stok)

| Kalem | Tutar |
|:---|---:|
| Başlangıç: Atıl stok değeri | 500.000 ₺ |
| Yıllık PRIME aidatı (nakit) | 48.000 ₺ |
| İşlem komisyonu — standart (%10) | 50.000 ₺ |
| XP indirimi sonrası komisyon (%5) | 25.000 ₺ |
| **Toplam nakit çıkışı** | **73.000 ₺** |
| Havuzdan alınan mal/hizmet değeri | 500.000 ₺ |
| **Net kazanım** | **427.000 ₺** |

### Kullanıcı Değer Döngüsü (Bronz P2 + 3 Referans)

| Adım | Ödenen | Alınan Değer |
|:---|---:|---:|
| Üyelik aidatı | 399 ₺ | — |
| 2× menü hakkı | — | 800 ₺ |
| 3 referans — 1+1 menü | 200 ₺ | 400 ₺ |
| **Toplam** | **599 ₺** | **1.200 ₺** |

**Net tasarruf: 601 ₺ — kullanıcı ödediğinin 2 katı değer alır.**

---

*BazarX Master Plan v4.3 — Tüm hakları saklıdır.*
