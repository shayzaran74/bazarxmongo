# 🔍 BazarX (BarterBorsa V2) Graphify Senior Audit — Prompt Kataloğu

> **Amaç:** Bir senior full-stack programcının, **BazarX** (BarterBorsa V2) gibi kompleks, çok alanlı (Multi-Domain), cüzdan ve escrow yönetimi içeren bir monorepo yapısını graphify ile uçtan uca denetlemek için kullanacağı komut ve prompt'lar.
> 
> **Kullanım:** Her fazı sırasıyla uygula. Finansal ve e-ticaret akışlarındaki (Escrow, Wallet, Dispute) kopuklukları bulmak için özellikle Faz 3 ve Faz 4'e dikkat et.

---

## Faz 0 — Ortam Hazırlığı

```bash
# 1. BazarX projesine git ve Graph'ı oluştur
cd /Users/macbook/Desktop/bazarx
graphify .

# 2. Raporu incele
cat graphify-out/GRAPH_REPORT.md

# 3. Görsel haritayı aç
open graphify-out/graph.html
```

---

## Faz 1 — Mimari ve Monorepo Sınırları (Kuş Bakışı)

BazarX karmaşık bir yapıya sahip. İlk olarak God Node'ları ve frontend-backend arasındaki (veya mikroservisler arası) sınırların ihlal edilip edilmediğini kontrol ediyoruz.

### 1.1 — God Node'lar ve Bağımlılık Yığılmaları
```
/graphify query "En çok bağlantıya sahip (highest degree) 10 node nedir? Özellikle Prisma Client, GeneralLedger veya Wallet servislerine bağımlı olan modüllerin haritasını çıkar."
```
**Ne arıyoruz:** Sistemin darboğazları. Eğer her şey tek bir `WalletService`'e doğrudan bağlıysa, bu bir God Object antikalıbıdır.

### 1.2 — İzole Modüller (Yetim Bileşenler)
```
/graphify query "Bağlantısız veya ≤1 bağlantılı isolated node'lar hangileri? Özellikle kullanılmayan eski Barter modüllerini veya unutulmuş utility'leri listele."
```
**Ne arıyoruz:** V1'den kalma, kullanılmayan ancak codebase'i şişiren "dead code" (ölü kod) tespiti.

### 1.3 — Katman (Layer) İhlalleri (NestJS DI)
```
/graphify query "Controller dosyalarından doğrudan Prisma Repository'sine giden (Service katmanını atlayan) bağlantılar var mı?"
```
**Ne arıyoruz:** NestJS Dependency Injection (DI) mantığına aykırı, doğrudan veritabanına erişen sızdırılmış controller mantıkları.

---

## Faz 2 — Finansal Bütünlük ve Escrow (Escrow & Wallet)

BazarX'in kalbi paralardır. Cüzdan bakiye düşüşleri ve Escrow state makinesi (durum geçişleri) hatasız olmalıdır.

### 2.1 — Sepet → Sipariş → Ödeme Akışı (Checkout Pipeline)
```
/graphify query "Cart checkout işleminden, siparişin (Order) oluşturulmasına ve Wallet'tan paranın düşüp Escrow'a (veya General Ledger'a) geçmesine kadar olan zinciri göster."
```
**Ne arıyoruz:** Ödeme çekildiği halde siparişin oluşmadığı (veya tam tersi) asenkron kopukluklar. İşlemlerin aynı transaction içinde olup olmadığını tespit etmek.

### 2.2 — Escrow State Machine Analizi
```
/graphify query "Escrow modelinin status (Bekliyor, Onaylandı, İptal, İhtilaf) değişimlerini tetikleyen tüm servisleri listele."
```
**Ne arıyoruz:** Yetkisiz bir servisin (örneğin sıradan bir user endpoint'inin) Escrow'u "Tamamlandı" statüsüne çekip parayı vendor'a aktarma riski.

### 2.3 — General Ledger Tutarlılığı
```
/graphify path "WalletService" "GeneralLedgerRepository"
```
**Ne arıyoruz:** Cüzdandan çıkan her paranın muhasebe defterine (Ledger) tam olarak yazıldığını garantileyen direkt bağlantının doğrulanması.

---

## Faz 3 — İhtilaf (Dispute) ve Hakem Yönetimi

Kullanıcı ile satıcı anlaşamadığında devreye giren sistemin analizi.

### 3.1 — Dispute Lifecycle (İhtilaf Döngüsü)
```
/graphify query "Kullanıcının ihtilaf (dispute) başlatmasından, admin/hakem kararına ve sonucunda Escrow'un refund (iade) veya release (satıcıya aktarım) işlemlerine kadar giden dosyaları listele."
```
**Ne arıyoruz:** Hakem kararının Escrow'u tetiklemediği (paranın kilitli kaldığı) uç durumların tespiti.

### 3.2 — Dispute Yetki Sınırları
```
/graphify query "DisputeRepository'ye yazma (create/update) yetkisi olan tüm controller'ları bul. Yalnızca Admin/Mediator rolüne sahip olanlar mı erişebiliyor?"
```
**Ne arıyoruz:** Standart bir kullanıcının başkasının ihtilaf dosyasını kapatabilmesi veya manipüle edebilmesi.

---

## Faz 4 — Yan Domainler (Auction, Lottery, Barter)

BazarX sadece düz e-ticaret değil, açık artırma ve çekiliş de içeriyor.

### 4.1 — Açık Artırma (Auction) Bakiye Blokajı
```
/graphify query "Açık artırmada teklif (bid) verildiğinde cüzdandan (Wallet) provizyon (Hold) alınmasını sağlayan akışı göster."
```
**Ne arıyoruz:** Kullanıcının bakiyesi olmadan teklif verip artırmayı bozması (blokaj eksikliği).

### 4.2 — Çekiliş (Lottery) Adil Dağıtım Algoritması
```
/graphify path "LotteryController" "DrawService"
```
**Ne arıyoruz:** Bilet satışından çekilişin yapılmasına giden yolda dışarıdan müdahale edilebilir zafiyet noktaları. Çekilişi tetikleyen kaynağın (cron/admin) izolasyonu.

### 4.3 — Barter (Takas) Teklif Zinciri
```
/graphify query "İki kullanıcı arasındaki TradeOffer (Takas Teklifi) yaratılmasından kabul edilmesine kadar olan status değişim zincirini çıkar."
```
**Ne arıyoruz:** Eski Barter sisteminden kalan ve yeni mimariyle çelişen durum güncellemeleri.

---

## Faz 5 — Güvenlik, RBAC ve Rol Yönetimi

### 5.1 — Guard ve Middleware Kapsamı
```
/graphify query "RolesGuard veya JwtAuthGuard kullanmayan POST/PATCH/DELETE endpoint'leri (veya resolver'lar) var mı?"
```
**Ne arıyoruz:** Korumasız veri değiştirme endpoint'leri.

### 5.2 — Vendor vs User İzolasyonu
```
/graphify query "Sadece 'Vendor' rolünün yapması gereken işlemleri (örneğin Product oluşturma) yapan fonksiyonlara, User controller'larından erişim var mı?"
```
**Ne arıyoruz:** Normal bir kullanıcının sisteme ürün ekleyebilmesi gibi yetki aşım hataları (Privilege Escalation).

---

## Faz 6 — Frontend (Vue/Nuxt/React) ve API Senkronizasyonu

### 6.1 — Composable ve Store Bağlantıları
```
/graphify query "Frontend'deki useCart veya useWallet composable'larının tetiklediği tüm API servis yollarını bul."
```
**Ne arıyoruz:** Frontend store'unda güncellenen ama backend'e asenkron gitmeyen, state senkronizasyon hataları.

### 6.2 — API Route Shadowing
```
/graphify query "Backend route'larında (özellikle wildcard /:id barındıranlarda) sıralama hatası nedeniyle gölgelenen (shadowing) endpoint var mı?"
```
**Ne arıyoruz:** `/products/featured` isteğinin `/products/:id` tarafından yakalanıp 404 dönmesi gibi routing çatışmaları.

---

## 🎯 Hızlı Referans — BazarX İçin En Kritik 7 Prompt

| # | Komut | Ne Bulur (BazarX Odaklı) |
|---|-------|--------------------------|
| 1 | `/graphify query "Cart'tan Escrow'a giden zinciri göster"` | E-ticaret ödeme kopuklukları |
| 2 | `/graphify path "WalletService" "GeneralLedger"` | Muhasebe / Bakiye kaçakları |
| 3 | `/graphify query "Escrow status değişimini tetikleyenler"` | Yetkisiz para aktarımı / Refund riskleri |
| 4 | `/graphify query "DisputeRepository'ye kimler yazabiliyor"` | İhtilaf sürecini manipüle etme riskleri |
| 5 | `/graphify query "Controller'dan doğrudan Model'e gidenler"` | NestJS DI katman ihlalleri |
| 6 | `/graphify query "RolesGuard içermeyen kritik mutasyonlar"` | Yetkisiz (Anonymous) işlemler |
| 7 | `/graphify query "Auction bid işleminde cüzdan blokaj akışı"` | Karşılıksız teklif (Fake Bid) riskleri |

---

## 📋 BazarX Denetim Kontrol Listesi

- [x] **Faz 0 — BazarX projesinde Graph oluşturuldu ve güncellendi.** ✅
- [x] **Faz 1 — NestJS DI sınırları ve Katman ihlalleri incelendi.** ✅ (`useApi` God Node stabilize edildi)
- [x] **Faz 2 — E-Ticaret, Escrow ve Ledger transaction zinciri doğrulandı.** ✅ (`WalletRepository` Race Condition onarıldı)
- [x] **Faz 3 — Dispute (İhtilaf) ve Mediator yetki akışları test edildi.** ✅ (`ResolveDispute` akışı ve Admin Guard'lı API eklendi)
- [x] **Faz 6 — Frontend Composable'ları ile API arasındaki senkronizasyon kontrol edildi.** ✅ (`useWallet` singleton yapıldı, `useCartStore` guest bug'ı çözüldü)

---

## 🛠️ Tamamlanan Stabilizasyon Günlüğü (Audit Log)

| Tarih | Faz | İşlem | Detay | Durum |
| :--- | :--- | :--- | :--- | :--- |
| 05.05.2026 | Faz 5 | **Architecture Stabilization** | `OrderController`, `BarterController` ve `ProductAdminController` CQRS pattern'ine geçirildi; doğrudan Prisma erişimi kaldırıldı. | ✅ Tamamlandı |
| 05.05.2026 | Faz 3 | **Order Dispute Infrastructure** | `DisputeRepository` ve `OrderDispute` flow (Open/Resolve) implemente edildi. Alıcılar artık siparişlere itiraz edebiliyor. | ✅ Tamamlandı |
| 05.05.2026 | Faz 3 | **Barter Security Fix** | `FinalizeSwapHandler` üzerinde 3 günlük "itiraz penceresi" (time-lock) kontrolü eklendi; erken teminat tahliyesi engellendi. | ✅ Tamamlandı |
| 05.05.2026 | Faz 2 | **General Ledger Integrity** | `ReleaseEscrowHandler` refaktör edildi; platform komisyonu (%6-12) kesintisi ve çift kayıt muhasebe girişi eklendi. | ✅ Tamamlandı |
| 05.05.2026 | Faz 2 | **Cart-to-Escrow Automation** | `OrderEscrowWorker` servisi eklendi; teslim edilen siparişlerin ödemeleri T+3 gün sonunda otomatik release ediliyor. | ✅ Tamamlandı |
| 05.05.2026 | Faz 2 | **Cart-to-Escrow Persistence** | `CheckoutService` üzerinde Escrow `holdId` kaydetme açığı giderildi; `Order` tablosuna `escrow_hold_id` eklendi. | ✅ Tamamlandı |
| 05.05.2026 | Faz 6 | **State Synchronization** | `useWallet` state'i global scope'a taşınarak Singleton yapıldı. `useCartStore` guest `updateQuantity` bug'ı giderildi. | ✅ Tamamlandı |
| 05.05.2026 | Faz 5 | **RBAC Hardening** | Barter modülündeki (`surplus`, `barter`, `trust-score`) controller'lara merkezi RolesGuard ve @Roles standartları uygulandı. | ✅ Tamamlandı |
| 05.05.2026 | Faz 4 | **Side Domain Fixes** | Auction bid bakiye kontrolü, Lottery garanti kazanan algoritması ve Barter oturum aktivasyonu eklendi. | ✅ Tamamlandı |
| 05.05.2026 | Faz 3 | **ResolveDispute Flow** | `ResolveDisputeCommand`, Handler ve Admin API rotası eklendi. Escrow iade/aktarım mekanizması bağlandı. | ✅ Tamamlandı |
| 05.05.2026 | Faz 1 & 6 | **useApi.ts Refactoring** | 15s Timeout ve Global Toast Error Handling eklendi. | ✅ Tamamlandı |
| 05.05.2026 | Faz 2 | **Wallet Race Condition Fix** | `save()` metodu Atomic Increment/Decrement yapısına geçirildi. | ✅ Tamamlandı |
| 05.05.2026 | Faz 0 | **Graphify Audit** | Tüm monorepo haritası çıkarıldı ve God Node'lar tespit edildi. | ✅ Tamamlandı |
