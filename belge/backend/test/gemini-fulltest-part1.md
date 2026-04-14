# Gemini Prompt — Tam Test Coverage Bölüm 1: Servisler + Identity + Vendor

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT

```
Sen bir senior NestJS test engineer'sın. BarterBorsa projesinin test coverage'ını artırıyorsun.

TEST KURALLARI:
- Framework: Jest 29+ / ts-jest
- AAA pattern: Arrange → Act → Assert
- Test isimleri Türkçe
- `any` YASAK — her yerde doğru tip
- beforeEach'te jest.clearAllMocks()
- Mock'lar tipli: Partial<Interface> veya jest.Mocked<Type>
- Her test bağımsız
- Her dosyanın tam path'ini başına yorum olarak yaz

MOCK PATTERN:
```typescript
const mockRepository = {
  findById: jest.fn(),
  save: jest.fn(),
  // ... sadece testte kullanılan metodlar
} as Partial<ISomeRepository>;

const module = await Test.createTestingModule({
  providers: [
    HandlerUnderTest,
    { provide: 'IRepository', useValue: mockRepository },
  ],
}).compile();
```

ÖNEMLİ: Sadece istenen dosyaları yaz. Mevcut test dosyalarına DOKUNMA.
```

### GÖREV — SERVİS TESTLERİ (16 dosya)

```
Aşağıdaki 16 servis için unit test yaz. Her servisin iş mantığını test et.

DOSYA #1: apps/backend/src/modules/identity/infrastructure/auth/session.service.spec.ts
Test senaryoları:
- ✅ Session oluşturma başarılı (userId, userAgent, ipAddress)
- ✅ Aktif session listesi döndürülmeli
- ✅ Session revoke edilebilmeli
- ✅ Tüm session'lar revoke edilebilmeli (logoutAll)
- ✅ lastActiveAt güncellenmeli

DOSYA #2: apps/backend/src/modules/commerce/application/services/checkout.service.spec.ts
Test senaryoları:
- ✅ Başarılı checkout akışı (cart → order → stok reserve → escrow)
- ✅ Boş sepette checkout hatası
- ✅ Stok yetersizse tüm işlem rollback olmalı
- ✅ Farklı vendor'lardan ürünler ayrı order'lara bölünmeli
- ✅ Checkout sonrası cart temizlenmeli
- ✅ OrderNumber unique üretilmeli
- ✅ Escrow oluşturma başarısız olursa stok geri bırakılmalı

DOSYA #3: apps/backend/src/modules/commerce/application/services/order-number.service.spec.ts
Test senaryoları:
- ✅ BB-YYYYMMDD-XXXXX formatında numara üretmeli
- ✅ Her çağrıda farklı numara üretmeli
- ✅ Format regex'e uymalı

DOSYA #4: apps/backend/src/modules/commerce/domain/services/order-state-machine.service.spec.ts
(Mevcut ama eksik olabilir — tam coverage yap)
- ✅ Tüm geçerli geçişler test edilmeli (PENDING→PAID, PAID→CONFIRMED, vs.)
- ✅ Tüm geçersiz geçişler exception fırlatmalı
- ✅ canTransition() doğru boolean dönmeli

DOSYA #5: apps/backend/src/modules/barter/application/services/collateral-calculator.service.spec.ts
- ✅ Trade value'nun %25'i collateral olmalı (default)
- ✅ DownPaymentPolicy'den oran alınmalı (varsa)
- ✅ Min/max amount kontrolü
- ✅ Sıfır trade value'da hata

DOSYA #6: apps/backend/src/modules/barter/application/services/matching.service.spec.ts
- ✅ Kategori eşleşmesinde yüksek score
- ✅ Lokasyon yakınlığında bonus score
- ✅ Fiyat aralığı uyumunda bonus score
- ✅ Eşleşme yoksa boş dizi dönmeli
- ✅ Score sıralaması doğru olmalı (en yüksek ilk)

DOSYA #7: apps/backend/src/modules/barter/domain/services/trade-state-machine.service.spec.ts
- ✅ PENDING → ACCEPTED geçerli
- ✅ PENDING → REJECTED geçerli
- ✅ PENDING → COUNTER_OFFERED geçerli
- ✅ ACCEPTED → LEGAL_PENDING geçerli
- ✅ CANCELLED → herhangi bir duruma geçiş geçersiz
- ✅ COMPLETED → herhangi bir duruma geçiş geçersiz

DOSYA #8: apps/backend/src/modules/communication/application/services/notification-template.service.spec.ts
- ✅ getOrderCreatedTemplate doğru Türkçe title/message üretmeli
- ✅ getOrderShippedTemplate trackingNumber içermeli
- ✅ getTradeOfferTemplate doğru link üretmeli
- ✅ Tüm template'ler link içermeli

DOSYA #9: apps/backend/src/modules/advertising/application/services/budget-manager.service.spec.ts
- ✅ Bütçe düşme başarılı (remainingBudget -= amount)
- ✅ Bütçe sıfırın altına düşememeli
- ✅ Bütçe bitince campaign PAUSED olmalı
- ✅ Transaction içinde çalışmalı (race condition koruması)

DOSYA #10: apps/backend/src/modules/advertising/application/services/ad-auction.service.spec.ts
- ✅ Slot'a uygun aktif kampanyaları filtrelemeli
- ✅ bidAmount × qualityScore ile rank hesaplamalı
- ✅ Bütçesi bitmiş kampanyaları atlamalı
- ✅ Hedefleme (category, city) filtresi çalışmalı
- ✅ Sonuçlar rank sırasına göre dönmeli

DOSYA #11: apps/backend/src/modules/loyalty/application/services/xp-calculator.service.spec.ts
- ✅ İlk sipariş: 500 bonus + %2
- ✅ Normal sipariş: sadece %2
- ✅ Barter takas: %3
- ✅ Login bonus: 10 XP
- ✅ Referral bonus: 200 XP

DOSYA #12: apps/backend/src/modules/loyalty/application/services/level-calculator.service.spec.ts
- ✅ 0 XP → Level 1
- ✅ 1000 XP → Level 2
- ✅ 5000 XP → Level 3
- ✅ Tier: 0→BRONZE, 1000→SILVER, 5000→GOLD, 25000→PLATINUM, 100000→DIAMOND
- ✅ Sınır değerler (999 → L1, 1000 → L2)

DOSYA #13: apps/backend/src/modules/loyalty/application/services/spending-limit.service.spec.ts
- ✅ maxSpendPercentage kontrolü (sipariş tutarının max %'si)
- ✅ dailyLimit aşılamaz
- ✅ weeklyLimit aşılamaz
- ✅ monthlyLimit aşılamaz
- ✅ minCartAmount altında XP kullanılamaz
- ✅ XP→TL dönüşümü doğru hesaplanmalı

DOSYA #14: apps/backend/src/modules/loyalty/application/services/milestone-checker.service.spec.ts
- ✅ Haftalık 3 sipariş → bonus tetiklenmeli
- ✅ Haftalık bonus zaten verilmişse tekrar verilmemeli
- ✅ Aylık 1000 TL → bonus tetiklenmeli
- ✅ Yeni hafta başladığında counter sıfırlanmalı
- ✅ Yeni ay başladığında counter sıfırlanmalı

DOSYA #15: apps/backend/src/modules/financial-gateway/grpc/wallet-grpc.service.spec.ts
- ✅ getBalance doğru gRPC çağrısı yapmalı
- ✅ topupWallet idempotencyKey göndermeli
- ✅ transferFunds from/to parametreleri doğru olmalı
- ✅ gRPC timeout → DomainException

DOSYA #16: apps/backend/src/modules/financial-gateway/grpc/escrow-grpc.service.spec.ts
- ✅ createEscrow doğru parametrelerle çağrılmalı
- ✅ holdFunds amount ve reason doğru olmalı
- ✅ releaseFunds holdId doğru olmalı
- ✅ refundFunds amount doğru olmalı
- ✅ gRPC hata → DomainException
```

### GÖREV — IDENTITY EKSİK HANDLER TESTLERİ (10 dosya)

```
Identity modülünde 14 handler var, 2'si test edilmiş. Kalan 12'den iş mantığı olan 10'unu test et.
(Basit getter query handler'ları atla: GetUser, GetProfile, GetAddresses, GetLoginHistory — bunlar sadece repository çağırıyor)

DOSYA #17: apps/backend/src/modules/identity/application/commands/update-profile.handler.spec.ts
- ✅ Profil yoksa yeni oluşturmalı
- ✅ Profil varsa güncellemeli
- ✅ Kullanıcı bulunamazsa NotFoundException

DOSYA #18: apps/backend/src/modules/identity/application/commands/add-address.handler.spec.ts
- ✅ Adres ekleme başarılı
- ✅ isDefault=true ise diğer adreslerin isDefault'u false olmalı
- ✅ Kullanıcı bulunamazsa hata

DOSYA #19: apps/backend/src/modules/identity/application/commands/update-address.handler.spec.ts
- ✅ Adres güncelleme başarılı
- ✅ Başka kullanıcının adresi güncellenememeli
- ✅ Adres bulunamazsa NotFoundException

DOSYA #20: apps/backend/src/modules/identity/application/commands/delete-address.handler.spec.ts
- ✅ Soft delete (deletedAt set edilmeli)
- ✅ Başka kullanıcının adresi silinememeli

DOSYA #21: apps/backend/src/modules/identity/application/commands/set-transaction-pin.handler.spec.ts
- ✅ PIN hash'lenerek kaydedilmeli
- ✅ Kullanıcı bulunamazsa hata

DOSYA #22: apps/backend/src/modules/identity/application/event-handlers/user-registered.handler.spec.ts
- ✅ UserRegistered event'i RabbitMQ'ya publish edilmeli
- ✅ Doğru exchange ve routing key kullanılmalı
```

### GÖREV — VENDOR HANDLER TESTLERİ (kritik 10 tanesi)

```
Vendor modülünde 32 handler var. Kritik iş mantığı olan 10'unu test et.
(CRUD getter'lar ve basit update'ler atlanacak)

DOSYA #23: apps/backend/src/modules/vendor/application/commands/create-company.handler.spec.ts
- ✅ Şirket oluşturma başarılı
- ✅ Vergi numarası zaten varsa ConflictException
- ✅ Geçersiz vergi numarası formatında hata

DOSYA #24: apps/backend/src/modules/vendor/application/commands/register-vendor.handler.spec.ts
- ✅ Vendor kaydı başarılı (status PENDING)
- ✅ Company bulunamazsa hata
- ✅ Kullanıcı zaten vendor ise hata
- ✅ Slug otomatik üretilmeli (storeName'den)
- ✅ VendorRegistered event publish edilmeli

DOSYA #25: apps/backend/src/modules/vendor/application/commands/approve-vendor.handler.spec.ts
- ✅ PENDING vendor onaylanabilmeli
- ✅ Zaten APPROVED olan vendor tekrar onaylanamamalı
- ✅ VendorApproved event publish edilmeli

DOSYA #26: apps/backend/src/modules/vendor/application/commands/reject-vendor.handler.spec.ts
- ✅ PENDING vendor reddedilebilmeli
- ✅ Rejection reason kaydedilmeli

DOSYA #27: apps/backend/src/modules/vendor/application/commands/suspend-vendor.handler.spec.ts
- ✅ APPROVED vendor askıya alınabilmeli
- ✅ Suspension reason kaydedilmeli
- ✅ VendorSuspended event publish edilmeli

DOSYA #28: apps/backend/src/modules/vendor/application/commands/add-bank-account.handler.spec.ts
- ✅ Banka hesabı ekleme başarılı
- ✅ Geçersiz IBAN formatında hata
- ✅ isPrimary=true ise diğerlerinin isPrimary'si false olmalı

DOSYA #29: apps/backend/src/modules/vendor/application/commands/toggle-vacation-mode.handler.spec.ts
- ✅ Vacation mode aktif edilebilmeli (vacationEndAt set)
- ✅ Vacation mode kapatılabilmeli

DOSYA #30: apps/backend/src/modules/vendor/application/commands/create-ecosystem.handler.spec.ts
- ✅ Ecosystem oluşturma başarılı
- ✅ Slug üretilmeli
- ✅ EcosystemCreated event publish edilmeli

DOSYA #31: apps/backend/src/modules/vendor/application/commands/follow-vendor.handler.spec.ts
- ✅ Vendor takip başarılı
- ✅ Zaten takip ediyorsa duplicate hata

DOSYA #32: apps/backend/src/modules/vendor/application/commands/unfollow-vendor.handler.spec.ts
- ✅ Takipten çıkma başarılı
- ✅ Takip etmiyorsa hata
```

### KONTROL

1. `any` SIFIR mı?
2. Her test dosyasında beforeEach jest.clearAllMocks() var mı?
3. Mock'lar tipli mi?
4. Test isimleri Türkçe mi?
5. Her test bağımsız çalışıyor mu?
6. `pnpm test` hatasız geçiyor mu?

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için)

Parçalı verme planı:

### PARÇA 1: Service testleri (#1-8)
System prompt + görev. İlgili servis kodlarını yapıştır:
```bash
cat apps/backend/src/modules/identity/infrastructure/auth/session.service.ts && echo "---" && \
cat apps/backend/src/modules/commerce/application/services/checkout.service.ts && echo "---" && \
cat apps/backend/src/modules/commerce/application/services/order-number.service.ts && echo "---" && \
cat apps/backend/src/modules/barter/application/services/collateral-calculator.service.ts && echo "---" && \
cat apps/backend/src/modules/barter/application/services/matching.service.ts && echo "---" && \
cat apps/backend/src/modules/barter/domain/services/trade-state-machine.service.ts && echo "---" && \
cat apps/backend/src/modules/communication/application/services/notification-template.service.ts && echo "---" && \
cat apps/backend/src/modules/advertising/application/services/budget-manager.service.ts
```

### PARÇA 2: Service testleri (#9-16)
```bash
cat apps/backend/src/modules/advertising/application/services/ad-auction.service.ts && echo "---" && \
cat apps/backend/src/modules/loyalty/application/services/xp-calculator.service.ts && echo "---" && \
cat apps/backend/src/modules/loyalty/application/services/level-calculator.service.ts && echo "---" && \
cat apps/backend/src/modules/loyalty/application/services/spending-limit.service.ts && echo "---" && \
cat apps/backend/src/modules/loyalty/application/services/milestone-checker.service.ts && echo "---" && \
cat apps/backend/src/modules/financial-gateway/grpc/wallet-grpc.service.ts && echo "---" && \
cat apps/backend/src/modules/financial-gateway/grpc/escrow-grpc.service.ts
```

### PARÇA 3: Identity handler testleri (#17-22)
```bash
cat apps/backend/src/modules/identity/application/commands/update-profile.handler.ts && echo "---" && \
cat apps/backend/src/modules/identity/application/commands/add-address.handler.ts && echo "---" && \
cat apps/backend/src/modules/identity/application/commands/update-address.handler.ts && echo "---" && \
cat apps/backend/src/modules/identity/application/commands/delete-address.handler.ts && echo "---" && \
cat apps/backend/src/modules/identity/application/commands/set-transaction-pin.handler.ts && echo "---" && \
cat apps/backend/src/modules/identity/application/event-handlers/user-registered.handler.ts
```

### PARÇA 4: Vendor handler testleri (#23-32)
```bash
cat apps/backend/src/modules/vendor/application/commands/create-company.handler.ts && echo "---" && \
cat apps/backend/src/modules/vendor/application/commands/register-vendor.handler.ts && echo "---" && \
cat apps/backend/src/modules/vendor/application/commands/approve-vendor.handler.ts && echo "---" && \
cat apps/backend/src/modules/vendor/application/commands/reject-vendor.handler.ts && echo "---" && \
cat apps/backend/src/modules/vendor/application/commands/suspend-vendor.handler.ts && echo "---" && \
cat apps/backend/src/modules/vendor/application/commands/add-bank-account.handler.ts && echo "---" && \
cat apps/backend/src/modules/vendor/application/commands/toggle-vacation-mode.handler.ts && echo "---" && \
cat apps/backend/src/modules/vendor/application/commands/create-ecosystem.handler.ts && echo "---" && \
cat apps/backend/src/modules/vendor/application/commands/follow-vendor.handler.ts && echo "---" && \
cat apps/backend/src/modules/vendor/application/commands/unfollow-vendor.handler.ts
```

Her parça bitince `pnpm test` çalıştır.

Bu BÖLÜM 1. Bölüm 2 (Barter eksik + Communication + Advertising + Loyalty) ve Bölüm 3 (E2E testleri) ayrıca hazırlanacak.
