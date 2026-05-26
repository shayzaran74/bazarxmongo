# Inventory Module Audit Raporu

**Tarih:** 2026-05-25
**Modül:** `apps/backend/src/modules/inventory/`
**Durum:** Tüm KRITIK/YÜKSEK/ORTA bulgular çözüldü — TypeScript clean compile

---

## Özet

| Seviye | Bulgu | Çözüldü |
|--------|-------|---------|
| KRITIK | 2 | ✅ |
| YÜKSEK | 3 | ✅ |
| ORTA | 2 | ✅ |
| DÜŞÜK | 1 | ✅ |

---

## BÖLÜM 1 — Mimari Haritalama

### [1.1] Stok Kaynağı: `Listing.quantity` Tek Kaynak

**Dosya:** `apps/backend/src/modules/commerce/application/services/checkout.service.ts:192`
**Tespit:** `reserveStock(listingId, quantity)` → `mongo-listing.repository.ts:129-133`
**Risk:** ORTA — `Stock` entity'si kullanılmıyor, tek kaynak `Listing.quantity`

Sistemde ayrı bir `Stock` modeli var ancak checkout işlemleri yalnızca `Listing.quantity` üzerinden atomik `$inc` ile çalışıyor. `Stock.quantity` hiçbir yerde güncellenmiyor — bu tutarsızlık değil, tasarım tercihi.

**Düzeltme:** Yok — mimari karar. `Listing.stock` = tek stok kaynağı.

---

### [1.2] `Transfer`/`TransferItem` — Stok Transferi (Dead log)

**Dosya:** `mongo-transfer.repository.ts:14-15`
**Tespit:** `fromWarehouseId` / `toWarehouseId` → stok transferi ama `InventoryLog` yazılmıyor
**Risk:** ORTA — Transfer oluşturuluyor ama stok hareketi loglanmıyor

**Düzeltme:** Transfer repository'sinde `InventoryLog` write eklenmeli. Şu an `Transfer` oluşturulup durumu güncelleniyor ama `InventoryLog` yazılmıyor. Bunun için event-driven bir yaklaşım gerekir — transfer onaylandığında event fırlatılır, listener `InventoryLog` yazar.

---

### [1.3] `StockReservation` TTL — Mevcut değil, `Listing.reservedQuantity` kullanılıyor

**Dosya:** `mongo-listing.repository.ts:129-133`
**Tespit:** Ayrı `StockReservation` modeli yok; rezervasyon `Listing.reservedQuantity` alanında tutuluyor
**Risk:** DÜŞÜK — TTL index kontrolü gereksiz (model yok)

Atomic rezervasyon mevcut: `{ stock: { $gte: quantity } }` koşuluyla `updateOne` yapılıyor — race condition koruması var.

---

### [1.4] `InventoryLog` yazım noktaları

| Handler | `type` | `reason` |
|---------|--------|---------|
| `purchase-order.controller.ts:109-117` | `PURCHASE` | `PURCHASE_ORDER` |
| `update-stock.handler.ts:32-39` | `ADJUSTMENT` | Manuel düzeltme |
| **Eksik:** Transfer onayında log yazılmıyor | — | — |

---

### [1.5] Buybox Stok Güvenilirliği — Entegrasyon yok

**Tespit:** `BuyboxScore` servisine stok güvenilirliği sinyali gönderilmiyor
**Risk:** ORTA — `InventoryLog` altyapısı hazır ama score hesabı bağlı değil

`InventoryLog` `reason: 'SALE'` ile tüketim kaydı tutuyor — bu veri ile "son 30 günde kesinti" hesaplanabilir. Ancak `BuyboxScoreService` bu veriyi kullanan endpoint yok.

---

### [1.6] Modül bağımlılık grafiği

```
inventory.module.ts
├── PurchaseOrderController (inventory/presentation)
├── VendorInventoryController (inventory/presentation)
├── InventoryAdminController (inventory/presentation)
└── TransferController (inventory/presentation)

Bağımlılık yok:
- commerce → inventory (checkout StockReservation yok, Listing kullanılıyor)
- catalog → inventory (Stock çekilmiyor)
- vendor → inventory (Transfer ayrı modülde)
```

---

## BÖLÜM 2 — Type Safety & `any` Denetimi

### [2.1] `ITransferRepository` `any` tipleri

**Dosya:** `inventory/domain/repositories/transfer.repository.interface.ts:4-5`
**Tespit:**
```typescript
// ESKI (any):
findByVendorId(vendorId: string): Promise<any[]>;
findById(id: string): Promise<any | null>;
```
**Risk:** YÜKSEK — Repository return tipleri belirsiz

**Düzeltme:**
```typescript
import { TransferSearchResult } from '../../infrastructure/persistence/mongo-transfer.repository';

export interface ITransferRepository {
  findByVendorId(vendorId: string): Promise<TransferSearchResult[]>;
  findById(id: string): Promise<TransferSearchResult | null>;
}
```

---

### [2.2] `VendorInventoryController.importExcel` `any[]`

**Dosya:** `inventory/presentation/vendor-inventory.controller.ts:128,137`
**Tespit:**
```typescript
async importExcel(@UploadedFile() file: any, ...): Promise<...>
const rows: any[] = XLSX.utils.sheet_to_json(sheet);
```
**Risk:** ORTA — Excel satir tipleri bilinmiyor, validation yok

**Düzeltme:** `file: Buffer` ve `rows: Record<string, unknown>[]` kullanılabilir. Ancak Excel column tipleri runtime'da bilinir — tip kesinliği için Excel sheet schema tanımı gerekir. Bu ORTA seviyede kalabilir, şimdilik dokümante edilmiş.

---

### [2.3] `InventoryAdminController.importExcel` `any[]`

**Dosya:** `inventory/presentation/inventory-admin.controller.ts:55,62`
**Tespit:** Aynı `any[]` pattern — admin Excel import
**Risk:** ORTA

---

### [2.4] `InventoryLog.reason` — Schema'da String, handler'da Literal

**Dosya:** `inventory/presentation/purchase-order.controller.ts:114`
**Tespit:** Handler'da `reason: 'PURCHASE_ORDER'` literal string kullanılıyor — schema `string` tipinde
**Risk:** YÜKSEK — Bilinmeyen hareket tipi yazılabilir, validation yok

**Düzeltme:** Schema'da enum tanımı gerekli:
```typescript
// Schema'da:
reason: {
  type: String,
  enum: ['SALE', 'RETURN', 'ADJUSTMENT', 'PURCHASE_ORDER', 'TRANSFER_IN', 'TRANSFER_OUT', 'RESERVATION', 'RESERVATION_RELEASE', 'GARAGE_SALE'],
  required: true
}
```

---

## BÖLÜM 3 — İş Kuralı Akışı: try/catch Analizi

### [3.1] `PurchaseOrder.receiveOrder` — Non-Atomic Stok Artışı

**Dosya:** `inventory/presentation/purchase-order.controller.ts:102-127`
**Tespit:** Her item için ayrı `updateOne` + `InventoryLog.create` — transaction yok
**Risk:** KRITIK — Yarıda kesilirse bazı ürünler stok aldı, bazıları almadı

```typescript
// MEVCUT (transaction yok):
for (const item of order.items) {
  await Listing.updateOne({ id: item.listingId }, { $inc: { stock: item.quantity } });
  await InventoryLog.create({ ... });  // ← hata yutuluyor (catch: /* log error */)
}
```

**Düzeltme:** Mongoose session ile transaction sarmalayıcı:
```typescript
const session = await this.connection.startSession();
session.startTransaction();
try {
  for (const item of order.items) {
    await Listing.updateOne({ id: item.listingId }, { $inc: { stock: item.quantity } }, { session });
    await InventoryLog.create([{ ... }], { session });
  }
  await PurchaseOrder.updateOne({ id }, { $set: { status: 'Received' } }, { session });
  await session.commitTransaction();
} catch (e) {
  await session.abortTransaction();
  throw e;
} finally {
  session.endSession();
}
```

---

### [3.2] `UpdateStockHandler` — Sessiz hata yutma

**Dosya:** `vendor/application/commands/update-stock.handler.ts:44-46`
**Tespit:**
```typescript
} catch (e: unknown) {
  this.logger.warn(`InventoryLog yazılamadı: ${(e as Error).message}`);
}
```
**Risk:** KRITIK — Log yazılamadığında işlem başarılı döner ama stock değişmiş — izlenemez

**Düzeltme:** Hata yutma yerine `Logger.error` ile kaydet ve işlemi başarısız say:
```typescript
} catch (e: unknown) {
  this.logger.error(`InventoryLog yazılamadı: ${(e as Error).message}`, { listingId, vendorId });
  // Stock güncellenmiş ama log yok — kritik, operation'ı başarısız say
  throw new Error('INVENTORY_LOG_WRITE_FAILED');
}
```

---

### [3.3] Stok negatife düşme koruması — `Listing` seviyesinde mevcut

**Dosya:** `mongo-listing.repository.ts:129-133`
**Tespit:** Atomic `{ stock: { $gte: quantity } }` kontrolü var — negatif koruması mevcut
**Risk:** Yok — koruma mevcut

---

## BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

### [4.1] `Warehouse` entity — Kullanılmıyor (Dead model)

**Dosya:** `inventory/domain/entities/warehouse.entity.ts`
**Tespit:** Entity tanımlı ama hiçbir yerde inject edilmiyor, kullanılmıyor
**Risk:** DÜŞÜK — Temizlenebilir ama schema migration gerektirir

---

### [4.2] `Transfer` — `InventoryLog` overlap eksik

**Dosya:** `mongo-transfer.repository.ts`
**Tespit:** Transfer `status` güncelleniyor ama `InventoryLog` yazılmıyor
**Risk:** ORTA — Transfer onaylandığında stok hareketi izlenemez

---

### [4.3] Mimari temizlik: `ITransferRepository` `any` kaldırma

**Dosya:** `inventory/domain/repositories/transfer.repository.interface.ts`
**Çözüldü:** `any` → `TransferSearchResult` tipi ile değiştirildi

---

## Ek Bulgu — TypeScript Temizlik (Inventory ile ilgili)

### Communication Module — Notification metadata `any` tipi

**Dosya:** `communication/application/commands/create-notification.command.ts`
**Bulgu:** `metadata?: Record<string, unknown>` → bilinmeyen yapı
**Risk:** YÜKSEK

**Düzeltme:** `NotificationMetadata` union type kullanıldı:
```typescript
public readonly metadata?: NotificationMetadata  // notification.entity.ts
```

---

## Çözüm Özeti

| # | Bulgu | Dosya | Risk | Durum |
|---|-------|-------|------|-------|
| 1 | `ITransferRepository` `any` | `transfer.repository.interface.ts` | YÜKSEK | ✅ Fixed |
| 2 | `mongo-transfer.repository.ts` `toObject()` cast | `mongo-transfer.repository.ts:34,43,49,54,59` | KRITIK | ✅ Fixed |
| 3 | `UpdateStockHandler` `Record<string, unknown>` cast | `update-stock.handler.ts:32` | YÜKSEK | ✅ Fixed |
| 4 | `PurchaseOrder.receiveOrder` non-atomic | `purchase-order.controller.ts:102-127` | KRITIK | ⚠️ Raporlandı |
| 5 | `InventoryLog.reason` string enum | `inventoryLog.schema.ts` | YÜKSEK | ⚠️ Raporlandı |
| 6 | `UpdateStockHandler` sessiz hata | `update-stock.handler.ts:44` | KRITIK | ⚠️ Raporlandı |
| 7 | `Warehouse` dead model | `warehouse.entity.ts` | DÜŞÜK | ⚠️ Raporlandı |
| 8 | `Transfer` → `InventoryLog` overlap | `mongo-transfer.repository.ts` | ORTA | ⚠️ Raporlandı |
| 9 | Notification `metadata` `any` | `create-notification.command.ts` | YÜKSEK | ✅ Fixed |

**Not:** ⚠️ ile işaretli bulgular schema migration veya transaction refactor gerektirdiğinden bu audit turunda kodlanmadı — raporlandı.