# Gemini Prompt — Kritik Akış Testleri (Auth, Checkout, Barter, Payment)

Aşağıdaki prompt'u Gemini'ye olduğu gibi yapıştır.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT

```
Sen bir senior NestJS test engineer'sın. BarterBorsa projesinin kritik iş akışları için
unit test ve e2e test yazacaksın.

TEKNİK BİLGİ:
- Framework: NestJS 10+ / Fastify
- Test Framework: Jest 29+
- E2E: @nestjs/testing + Fastify inject
- Mocking: jest.mock, jest.fn, jest.spyOn
- DB: PrismaService mock'lanacak (gerçek DB'ye bağlanmayacak unit testlerde)
- CQRS: CommandBus ve QueryBus mock'lanacak

TEST PRENSİPLERİ:
1. AAA pattern: Arrange (hazırla) → Act (çalıştır) → Assert (doğrula)
2. Her test bağımsız — birbirinden etkilenmez
3. Mock'lar minimal — sadece dış bağımlılıklar mock'lanır
4. Test isimleri Türkçe olacak (describe ve it blokları)
5. Edge case'ler test edilecek (hatalı input, yetkisiz erişim, duplicate kayıt)
6. `any` tipi YASAK — test'lerde de doğru tipler kullanılacak
7. Her test dosyasının tam path'i başına yorum olarak yazılacak

DOSYA KONUMU:
- Unit testler: handler dosyasının yanına `.spec.ts` uzantısıyla
  Örn: register-user.handler.ts → register-user.handler.spec.ts
- E2E testler: apps/backend/test/ altına
  Örn: apps/backend/test/auth.e2e-spec.ts

MOCK PATTERN:
```typescript
// Repository mock örneği
const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  existsByEmail: jest.fn(),
  save: jest.fn(),
};

// Service mock örneği
const mockHashingService = {
  hash: jest.fn(),
  compare: jest.fn(),
};

// Test module setup
const module = await Test.createTestingModule({
  providers: [
    RegisterUserHandler,
    { provide: 'IUserRepository', useValue: mockUserRepository },
    { provide: HashingService, useValue: mockHashingService },
    { provide: IdentityEventPublisher, useValue: { publishUserRegistered: jest.fn() } },
  ],
}).compile();
```

KURALLAR:
1. Her test dosyasının TAM içeriğini yaz
2. Her test dosyasının başında tam path yorum olarak
3. `any` YASAK
4. Mock'lar tipli olmalı (Partial<IUserRepository> vs.)
5. Test coverage: happy path + error cases + edge cases
6. beforeEach'te mock'ları resetle (jest.clearAllMocks())
```

### GÖREV

```
4 kritik akış için test yaz:

=== AKIŞ 1: AUTH (7 test dosyası) ===

1. register-user.handler.spec.ts (Unit Test)
   Test senaryoları:
   - ✅ Geçerli bilgilerle kullanıcı kaydı başarılı olmalı
   - ✅ Email zaten kayıtlıysa ConflictException fırlatmalı
   - ✅ Geçersiz email formatında hata dönmeli
   - ✅ Zayıf şifrede (8 karakterden kısa) hata dönmeli
   - ✅ Telefon numarası zaten kayıtlıysa hata dönmeli
   - ✅ Kayıt sonrası UserRegisteredEvent publish edilmeli
   - ✅ Şifre hash'lenmiş olarak kaydedilmeli (düz metin DEĞİL)

2. change-password.handler.spec.ts (Unit Test)
   Test senaryoları:
   - ✅ Mevcut şifre doğruysa şifre değişmeli
   - ✅ Mevcut şifre yanlışsa hata dönmeli
   - ✅ Kullanıcı bulunamazsa NotFoundException fırlatmalı
   - ✅ Yeni şifre zayıfsa hata dönmeli
   - ✅ Google OAuth kullanıcısı (password null) şifre set edebilmeli

3. auth.service.spec.ts (Unit Test)
   Test senaryoları:
   - ✅ Email/password ile giriş başarılı olmalı
   - ✅ Yanlış şifreyle giriş başarısız olmalı
   - ✅ 5 başarısız girişten sonra hesap kilitlenmeli (lockout)
   - ✅ Kilitli hesapla giriş denemesinde hata dönmeli
   - ✅ Google OAuth ile giriş — mevcut kullanıcı bulunmalı
   - ✅ Google OAuth ile giriş — yeni kullanıcı oluşturulmalı
   - ✅ Refresh token rotation çalışmalı (eski token revoke, yeni token üret)
   - ✅ Logout'ta access token blacklist'e eklenmeli
   - ✅ Logout'ta refresh token revoke edilmeli

4. token.service.spec.ts (Unit Test)
   Test senaryoları:
   - ✅ Access token üretimi doğru payload içermeli (sub, email, role)
   - ✅ Access token 15dk ömürlü olmalı
   - ✅ Refresh token 7 gün ömürlü olmalı
   - ✅ Blacklist'teki token doğrulamada başarısız olmalı
   - ✅ Revoke edilmiş refresh token doğrulamada başarısız olmalı

5. apps/backend/test/auth.e2e-spec.ts (E2E Test)
   Test senaryoları:
   - ✅ POST /auth/register → 201 + token döndürmeli
   - ✅ POST /auth/register (duplicate email) → 409 dönmeli
   - ✅ POST /auth/login → 200 + accessToken + refreshToken döndürmeli
   - ✅ POST /auth/login (yanlış şifre) → 401 dönmeli
   - ✅ POST /auth/refresh → 200 + yeni token'lar döndürmeli
   - ✅ POST /auth/logout → 200
   - ✅ GET /users/me (geçerli token) → 200 + kullanıcı bilgisi
   - ✅ GET /users/me (token yok) → 401

=== AKIŞ 2: CHECKOUT (5 test dosyası) ===

6. add-to-cart.handler.spec.ts (Unit Test)
   - ✅ Sepete ürün ekleme başarılı
   - ✅ Aynı ürün tekrar eklendiğinde quantity artmalı
   - ✅ Stokta olmayan ürün eklenememeli
   - ✅ Aktif olmayan listing eklenememeli
   - ✅ maxPurchasePerMember aşılamamalı

7. checkout.handler.spec.ts (Unit Test) — EN KRİTİK TEST
   - ✅ Başarılı checkout: Order oluşur, stok reserve edilir, escrow oluşur
   - ✅ Boş sepette checkout yapılamamalı
   - ✅ Stok yetersizse checkout başarısız olmalı (ve hiçbir şey commit edilmemeli)
   - ✅ Farklı vendor'lardan ürünler ayrı Order'lara bölünmeli
   - ✅ Kupon kodu uygulanması — indirim doğru hesaplanmalı
   - ✅ Checkout sonrası cart temizlenmeli
   - ✅ Escrow oluşturma başarısız olursa stok reserve geri alınmalı (rollback)

8. cancel-order.handler.spec.ts (Unit Test)
   - ✅ PENDING siparişi iptal edilebilmeli
   - ✅ PAID siparişi iptal edilebilmeli (refund tetiklenmeli)
   - ✅ SHIPPED sipariş iptal edilememeli
   - ✅ İptal'de stok serbest bırakılmalı
   - ✅ İptal'de escrow refund yapılmalı

9. pricing.service.spec.ts (Unit Test)
   - ✅ Subtotal doğru hesaplanmalı (price × quantity)
   - ✅ Kupon indirimi doğru uygulanmalı (yüzde ve sabit tutar)
   - ✅ Süresi dolmuş kupon uygulanamamalı
   - ✅ Minimum tutar altında kupon uygulanamamalı
   - ✅ Kargo ücreti eklenmeli

10. apps/backend/test/checkout.e2e-spec.ts (E2E Test)
    - ✅ POST /cart/items → 201 (sepete ekleme)
    - ✅ GET /cart → 200 + sepet içeriği
    - ✅ POST /checkout → 201 + order döndürmeli
    - ✅ POST /checkout (boş sepet) → 400
    - ✅ GET /orders → 200 + sipariş listesi
    - ✅ POST /orders/:id/cancel → 200

=== AKIŞ 3: BARTER ACCEPT (4 test dosyası) ===

11. create-trade-offer.handler.spec.ts (Unit Test)
    - ✅ Takas teklifi oluşturma başarılı
    - ✅ Kendi ürününe teklif verememe kontrolü
    - ✅ Aktif olmayan surplus item'a teklif verememe
    - ✅ CashAmount + cashDirection doğru set edilmeli
    - ✅ ExpiresAt set edilmeli (default 7 gün)

12. accept-trade-offer.handler.spec.ts (Unit Test) — KRİTİK
    - ✅ Teklif kabul başarılı → SwapSession oluşur
    - ✅ Sadece receiver kabul edebilmeli (initiator edilememeli)
    - ✅ PENDING olmayan teklif kabul edilememeli
    - ✅ SwapSession status PENDING_COLLATERAL olmalı
    - ✅ BarterPart'lar oluşturulmalı (2 adet)
    - ✅ TradeOfferAccepted event publish edilmeli

13. lock-collateral.handler.spec.ts (Unit Test)
    - ✅ Her iki taraftan collateral lock başarılı
    - ✅ Bakiye yetersizse lock başarısız olmalı
    - ✅ Lock sonrası SwapSession status ACTIVE olmalı
    - ✅ FinancialGateway.holdFunds çağrılmalı (her iki taraf için)
    - ✅ Collateral amount doğru hesaplanmalı (trade value'nun %25'i)

14. complete-swap.handler.spec.ts (Unit Test)
    - ✅ Tüm BarterPart'lar CONFIRMED ise swap tamamlanmalı
    - ✅ CONFIRMED olmayan part varsa swap tamamlanamamalı
    - ✅ Collateral release edilmeli (FinancialGateway.releaseFunds)
    - ✅ Cash fark varsa transfer yapılmalı (FinancialGateway.transferFunds)
    - ✅ TradeCompletion kaydı oluşturulmalı
    - ✅ barter.completed event publish edilmeli

=== AKIŞ 4: PAYMENT / FINANCIAL GATEWAY (3 test dosyası) ===

15. financial-gateway.service.spec.ts (Unit Test)
    - ✅ getBalance gRPC çağrısı doğru parametrelerle yapılmalı
    - ✅ createEscrow gRPC çağrısı doğru parametrelerle yapılmalı
    - ✅ holdFunds gRPC çağrısı doğru parametrelerle yapılmalı
    - ✅ releaseFunds gRPC çağrısı doğru parametrelerle yapılmalı
    - ✅ refundFunds gRPC çağrısı doğru parametrelerle yapılmalı
    - ✅ gRPC timeout'ta hata fırlatmalı
    - ✅ gRPC bağlantı hatası DomainException'a dönüşmeli

16. payment-completed.handler.spec.ts (Unit Test)
    - ✅ payment.completed event geldiğinde Order status PAID olmalı
    - ✅ OrderStatusHistory kaydı oluşturulmalı
    - ✅ Geçersiz orderId ile event geldiğinde hata loglanmalı (crash olmamalı)

17. order-state-machine.service.spec.ts (Unit Test)
    - ✅ PENDING → PAID geçişi geçerli
    - ✅ PENDING → CANCELLED geçişi geçerli
    - ✅ PAID → CONFIRMED geçişi geçerli
    - ✅ CANCELLED → herhangi bir duruma geçiş geçersiz
    - ✅ COMPLETED → herhangi bir duruma geçiş geçersiz
    - ✅ PENDING → SHIPPED geçişi geçersiz (atlama yapılamaz)
    - ✅ DELIVERED → COMPLETED geçişi geçerli
    - ✅ DELIVERED → REFUNDED geçişi geçerli
    - ✅ Geçersiz geçişte DomainException fırlatılmalı
```

### DOSYA LİSTESİ

17 test dosyası. Her birinin TAM içeriğini yaz:

```
=== AUTH UNIT TESTS ===
DOSYA #1:  apps/backend/src/modules/identity/application/commands/register-user.handler.spec.ts
DOSYA #2:  apps/backend/src/modules/identity/application/commands/change-password.handler.spec.ts
DOSYA #3:  apps/backend/src/modules/identity/infrastructure/auth/auth.service.spec.ts
DOSYA #4:  apps/backend/src/modules/identity/infrastructure/auth/token.service.spec.ts

=== AUTH E2E TEST ===
DOSYA #5:  apps/backend/test/auth.e2e-spec.ts

=== CHECKOUT UNIT TESTS ===
DOSYA #6:  apps/backend/src/modules/commerce/application/commands/add-to-cart.handler.spec.ts
DOSYA #7:  apps/backend/src/modules/commerce/application/commands/checkout.handler.spec.ts
DOSYA #8:  apps/backend/src/modules/commerce/application/commands/cancel-order.handler.spec.ts
DOSYA #9:  apps/backend/src/modules/commerce/application/services/pricing.service.spec.ts

=== CHECKOUT E2E TEST ===
DOSYA #10: apps/backend/test/checkout.e2e-spec.ts

=== BARTER UNIT TESTS ===
DOSYA #11: apps/backend/src/modules/barter/application/commands/create-trade-offer.handler.spec.ts
DOSYA #12: apps/backend/src/modules/barter/application/commands/accept-trade-offer.handler.spec.ts
DOSYA #13: apps/backend/src/modules/barter/application/commands/lock-collateral.handler.spec.ts
DOSYA #14: apps/backend/src/modules/barter/application/commands/complete-swap.handler.spec.ts

=== PAYMENT / FINANCIAL GATEWAY UNIT TESTS ===
DOSYA #15: apps/backend/src/modules/financial-gateway/financial-gateway.service.spec.ts
DOSYA #16: apps/backend/src/modules/commerce/application/event-handlers/payment-completed.handler.spec.ts
DOSYA #17: apps/backend/src/modules/commerce/domain/services/order-state-machine.service.spec.ts
```

### KONTROL

Tüm testleri yazdıktan sonra:
1. Her test dosyasında `any` SIFIR mı?
2. Her test bağımsız çalışıyor mu (birbirine bağımlılık yok)?
3. beforeEach'te jest.clearAllMocks() var mı?
4. Mock'lar tipli mi (Partial<Interface> veya jest.Mocked<Type>)?
5. Edge case'ler kapsanmış mı (hatalı input, yetkisiz erişim)?
6. E2E testlerde app.inject() kullanılıyor mu (Fastify)?
7. Checkout test: rollback senaryosu (escrow fail → stok release) var mı?
8. Barter test: her iki taraf collateral lock testi var mı?
9. State machine: geçersiz geçişlerde exception kontrolü var mı?
10. Test isimleri Türkçe mi?

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

Parçalı verme planı:

### PARÇA 1: Auth testleri (Dosya #1-5)
System prompt + görev açıklamasını yapıştır, sonra:
```bash
echo "=== MEVCUT HANDLER KODLARI ===" && \
cat apps/backend/src/modules/identity/application/commands/register-user.handler.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/identity/application/commands/change-password.handler.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/identity/infrastructure/auth/auth.service.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/identity/infrastructure/auth/token.service.ts
```
"Bu handler'lar için test dosyalarını (#1-5) yaz" de.

### PARÇA 2: Checkout testleri (Dosya #6-10)
```bash
echo "=== MEVCUT HANDLER KODLARI ===" && \
cat apps/backend/src/modules/commerce/application/commands/add-to-cart.handler.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/commerce/application/commands/checkout.handler.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/commerce/application/commands/cancel-order.handler.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/commerce/application/services/pricing.service.ts
```

### PARÇA 3: Barter testleri (Dosya #11-14)
```bash
echo "=== MEVCUT HANDLER KODLARI ===" && \
cat apps/backend/src/modules/barter/application/commands/create-trade-offer.handler.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/barter/application/commands/accept-trade-offer.handler.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/barter/application/commands/lock-collateral.handler.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/barter/application/commands/complete-swap.handler.ts
```

### PARÇA 4: Payment / Financial Gateway testleri (Dosya #15-17)
```bash
echo "=== MEVCUT KODLAR ===" && \
cat apps/backend/src/modules/financial-gateway/financial-gateway.service.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/commerce/application/event-handlers/payment-completed.handler.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/commerce/domain/services/order-state-machine.service.ts
```

Her parçada system prompt'u TEKRAR VER.
Her parça bitince: `cd apps/backend && pnpm test` çalıştır.

Tamamlandıktan sonra:
```bash
# Tüm testleri çalıştır
cd apps/backend && pnpm test

# Coverage raporu
cd apps/backend && pnpm test:cov

# E2E testleri (DB bağlantısı gerekir)
cd apps/backend && pnpm test:e2e
```

Jest config dosyası (apps/backend/package.json'a ekle eğer yoksa):
```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^@barterborsa/(.*)$": "<rootDir>/../../packages/shared/$1/src"
    }
  }
}
```
