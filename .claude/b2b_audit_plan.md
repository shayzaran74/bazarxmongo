# BazarX B2B (Ticari Takas) Ekosistemi Audit Planı

Bu belge, Ticari Takas (B2B / Surplus) modülünde geliştirme yaparken sistem bütünlüğünü korumak ve hata payını sıfıra indirmek için takip edilmesi gereken standartları içerir.

## 🏗️ 1. Sistem Mimarisi Özeti

### Veritabanı (Prisma)
- **Model**: `SurplusItem`
- **Kritik Alanlar**: 
  - `status`: `SurplusStatus` Enum (`PENDING_APPROVAL`, `ACTIVE`, `REJECTED`, `RESERVED`, `SOLD`).
  - `images`: `Json` tipinde (Array of URLs).
  - `quantity`: `Decimal` (Prisma.Decimal).
  - `category`: `String` (Kategori ID'si burada tutulur).

### Backend (NestJS)
- **Modül**: `apps/backend/src/modules/barter`
- **Controller**: `SurplusController` (Giriş noktası, statü mapping ve listeleme).
- **Application**: 
  - `CreateSurplusItemCommand`: İlan oluşturma parametreleri.
  - `CreateSurplusItemHandler`: İş mantığı ve veritabanı kaydı.
- **Domain**: `SurplusItem` Entity (Domain validation kuralları).

### Frontend (Nuxt 3)
- **Composables**: `useSurplusForm.ts` (Form yönetimi, resim yükleme, şehir mapping).
- **Pages**:
  - Dashboard: `ticaritakas/b2b-dashboard.vue`
  - Liste: `ticaritakas/trade-pool/index.vue`
  - Detay: `ticaritakas/trade-pool/[id].vue`
  - Admin: `admin/wanted-items.vue` `admin/surplus-approvals`

---

## 🛠️ 2. Audit Kontrol Listesi (Checklist)

### A. Veri ve Statü Yönetimi
- [ ] **Statü Mapping**: Frontend'den gelen `PENDING`, backend'de mutlaka `PENDING_APPROVAL` olarak karşılanmalıdır.
- [ ] **Statü Mapping**: Onaylanan ilanlar `ACTIVE` statüsüne çekilmelidir (APPROVED değil).
- [ ] **Güncelleme Kuralı**: Bir ilan güncellendiğinde statüsü otomatik olarak tekrar `PENDING_APPROVAL` olmalıdır.

### B. Image Upload (Resim Yönetimi)
- [ ] **Field Name**: Resim yükleme sırasında kullanılan `FormData` anahtarı mutlaka `file` olmalıdır.
- [ ] **Data Type**: Veritabanına kaydedilen resimler `Json` (String Array) formatında olmalıdır.
- [ ] **Create/Update**: Hem oluşturma hem güncelleme metodlarında `images` alanı mutlaka işlenmelidir.

### C. Yetkilendirme (RBAC)
- [ ] **Satıcı Kontrolü**: İşlem yapan kullanıcının `Vendor` profili onaylı (`APPROVED`) olmalıdır.
- [ ] **Şirket Mapping**: Şirket kaydı olmayan satıcılar için otomatik "Individual" şirket mapping'i yapılmalıdır (Bkz: `SurplusController.getVendorWithCompany`).

### D. Frontend Güvenliği
- [ ] **Null Check**: `location` veya `description` gibi opsiyonel alanlarda `.split()` veya `.trim()` kullanmadan önce mutlaka null-check yapılmalıdır.
- [ ] **API Endpoint**: Admin paneli `/api/v1/surplus` endpoint'ini kullanmalıdır (Eski `/admin/wanted-items` kullanılmamalıdır).

---

## 🚨 3. Kritik Kurallar (Asla Çiğnemeyin)

1. **Prisma Validation**: `Decimal` alanlar (quantity, price) için `Prisma.Decimal` instance'ı kullanılmalıdır. Doğrudan `number` gönderilmemelidir.
2. **Routing**: `/surplus/all` rotası mutlaka `findOne` (`:id`) metodundan önce tanımlanmalıdır veya `findOne` içinde `id === 'all'` kontrolü yapılmalıdır.
3. **Localization**: Kullanıcı arayüzündeki tüm mesajlar, butonlar ve statü isimleri Türkçe (`tr-TR`) olmalıdır.
4. **Mock Data**: Hiçbir frontend sayfasında mock veri bırakılmamalıdır; tüm veriler `useApi` üzerinden çekilmelidir.

---

## 🔍 4. Audit Nasıl Yapılır?

Bir AI asistanı bir dosyayı değiştirmeden önce şu soruyu sormalıdır:
> "Bu değişiklik `SurplusStatus` enum değerlerini bozuyor mu? Resim yükleme field ismini (file) değiştiriyor mu? Admin panelindeki 404 riskini tetikliyor mu?"

Bu plan dahilinde yapılan her geliştirme, BazarX B2B ekosisteminin kararlılığını koruyacaktır.
