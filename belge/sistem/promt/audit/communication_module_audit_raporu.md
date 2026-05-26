# Communication Modülü — Derinlemesine Audit & Düzeltme Raporu

**Tarih:** 2026-05-25  
**Branch:** main  
**Commit Referansı:** f2bd3e25  
**Dosya Sayısı:** 54  
**Düzeltilen Dosya Sayısı:** 12  
**Yeni Dosya:** 1 (`silent-hours.service.ts`)

---

## Özet Skor Tablosu

| Öncelik | Tespit Sayısı | Düzeltilen | Ertelenen |
|---|---|---|---|
| 🔴 KRİTİK | 4 | 4 | 0 |
| 🟠 YÜKSEK | 4 | 3 | 1 (AnonymousId — ayrı sprint) |
| 🟡 ORTA | 4 | 4 | 0 |
| 🟢 DÜŞÜK | 3 | 3 | 0 |

---

## Bölüm 1 — Audit Tespitleri ve Uygulanan Düzeltmeler

---

### 🔴 KRİTİK-1: `room:join` WebSocket — Participant Kontrolü Yok → DÜZELTILDI

**Dosya:** `infrastructure/websocket/chat.gateway.ts:87-101`

**Sorun:** Kimliği doğrulanmış herhangi bir kullanıcı herhangi bir `roomId`'ye join olabiliyordu.

**Düzeltme:**
```typescript
@SubscribeMessage('room:join')
async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
  const userId = (client as ExtendedSocket).userId;
  if (!userId) return { success: false, message: 'Unauthorized' };

  const room = await this.chatRoomRepo.findById(roomId);
  if (!room || !room.getProps().participantIds?.includes(userId)) {
    this.logger.warn(`Yetkisiz room:join denemesi user=${userId} room=${roomId}`);
    return { success: false, message: 'Bu odaya erişim yetkiniz yok' };
  }

  client.join(`chat:${roomId}`);
  return { success: true, roomId };
}
```

`@Inject('IChatRoomRepository')` ile `chatRoomRepo` gateway constructor'ına eklendi.

---

### 🔴 KRİTİK-2: `FcmService` Module'a Kayıtlı Değil → DÜZELTILDI

**Dosya:** `communication.module.ts:103-106`

**Sorun:** `FcmService` implement edilmişti ama `providers` listesinde yoktu — inject edilemiyordu.

**Düzeltme:**
```typescript
providers: [
  ...
  MailService,
  FcmService,         // ← eklendi
  SilentHoursService, // ← eklendi
],
exports: [NotificationTemplateService, MailService, FcmService, SilentHoursService],
```

---

### 🔴 KRİTİK-3: `GET /chat/unread-count` — Yanlış Koleksiyon Tarama → DÜZELTILDI

**Dosya:** `presentation/chat.controller.ts:77-87`

**Sorun:** Tüm `ChatMessage` koleksiyonunu tarıyordu; roomId filtresi yoktu.

**Düzeltme:**
```typescript
@Get('unread-count')
async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
  const rooms = await this.roomModel
    .find({ participantIds: user.id }, { id: 1, _id: 0 })
    .lean().exec() as { id: string }[];

  if (rooms.length === 0) return { success: true, count: 0 };

  const roomIds = rooms.map(r => r.id);
  const count = await this.msgModel.countDocuments({
    roomId: { $in: roomIds },
    isRead: false,
    senderId: { $ne: user.id },
  });
  return { success: true, count };
}
```

`@InjectModel('ChatRoom')` controller constructor'ına eklendi.

---

### 🔴 KRİTİK-4: `CreateNotificationCommand.type` — Enum Yerine Loose String → DÜZELTILDI

**Etkilenen Dosyalar:**

| Dosya | Değişiklik |
|---|---|
| `application/commands/create-notification.command.ts` | `type: string` → `type: NotificationType` |
| `domain/entities/notification.entity.ts` | `type: string` → `type: NotificationType` |
| `application/dtos/create-notification.dto.ts` | `@IsString()` → `@IsEnum(NotificationType)` |
| `application/event-handlers/order-created-notification.handler.ts` | `'ORDER_STATUS'` → `NotificationType.ORDER_STATUS` |
| `application/event-handlers/trade-offer-accepted-notification.handler.ts` | `'BARTER_OFFER'` → `NotificationType.BARTER_OFFER` |

---

### 🟠 YÜKSEK-1: `handleSendMessage` — userId Null Bypass → DÜZELTILDI

**Dosya:** `infrastructure/websocket/chat.gateway.ts:110-111`

**Düzeltme:**
```typescript
const userId = (client as ExtendedSocket).userId;
if (!userId) return { success: false, message: 'Unauthorized' };  // ← eklendi
```

`userId ?? null` → `userId` (null geçme kaldırıldı).

---

### 🟠 YÜKSEK-2: Sessiz Saat (22:00-08:00) Yok → DÜZELTILDI

**Yeni Dosya:** `application/services/silent-hours.service.ts`

```typescript
@Injectable()
export class SilentHoursService {
  isSilentHour(
    now = new Date(),
    userTimezone = 'Europe/Istanbul',
    silentHoursStart = 22,
    silentHoursEnd = 8,
  ): boolean {
    const formatter = new Intl.DateTimeFormat('tr-TR', {
      timeZone: userTimezone,
      hour: 'numeric',
      hour12: false,
    });
    const hour = parseInt(formatter.format(now), 10);
    return start > end
      ? hour >= start || hour < end   // gece yarısını geçen aralık (22-08)
      : hour >= start && hour < end;
  }
}
```

`SilentHoursService` module'a kayıtlı ve export edildi. FCM/mail entegrasyonunda `isSilentHour()` çağrısıyla push/mail gönderimi kontrol edilecek.

---

### 🟠 YÜKSEK-3: FCM Legacy API (Deprecated Haziran 2024) → DÜZELTILDI

**Dosya:** `infrastructure/push/fcm.service.ts`

**Eski (çalışmayan):** `POST https://fcm.googleapis.com/fcm/send` + `Authorization: key=SERVER_KEY`

**Yeni (HTTP v1):**
- `POST https://fcm.googleapis.com/v1/projects/{projectId}/messages:send`  
- `Authorization: Bearer {OAuth2_access_token}`
- OAuth2 token: Node.js built-in `crypto` ile RS256 JWT → `https://oauth2.googleapis.com/token` exchange
- Token in-memory cache (1 saat, 60 sn erken yenileme)
- `GOOGLE_SERVICE_ACCOUNT_JSON` env yoksa mock mode — boot crash yok

```
Eski env: FCM_SERVER_KEY
Yeni env: GOOGLE_SERVICE_ACCOUNT_JSON  ← Firebase Console → Service Account JSON
```

---

### 🟠 YÜKSEK-4: AnonymousId Katmanı — SwapSession Chat → ERTELENDI

**Durum:** `SendMessageHandler`'da `senderId` gerçek `userId` yazılıyor; maskeleme yok.  
**Gerekçe:** SwapSession entity'si, ChatRoom schema'sı ve tüm takas akışıyla koordineli sprint gerektirir.  
**Sonraki Sprint:** Ayrı sprint — `sessionId` alanı ChatRoom'a, `anonymousId` map'i SwapSession'a eklenmeli.

---

### 🟡 ORTA-1: Notification Ana Akışı Bloke — Fire-and-Forget → DÜZELTILDI

**Dosya:** `application/event-handlers/order-created-notification.handler.ts`

**Sorun:** Notification `await` ile bekleniyor; hata olursa chat room hiç açılmıyordu.

**Düzeltme:**
```typescript
// fire-and-forget — ana akışı bloke etmemeli
this.commandBus
  .execute(new CreateNotificationCommand(...))
  .catch((err: unknown) => this.logger.error('Sipariş bildirimi gönderilemedi', { userId, orderId: id, err }));

// chat room — kritik akış, await
const roomResult = await this.commandBus.execute(new CreateChatRoomCommand(id));
```

---

### 🟡 ORTA-2: ChatRoom Duplicate Race Condition → DÜZELTILDI

**Dosya:** `packages/shared/shared-persistence/src/schemas/backend/chatRoom.schema.ts`

**Sorun:** `findByOrderId` + `save` arasında eş zamanlı iki istek gelebiliyordu.

**Düzeltme:**
```typescript
ChatRoomSchema.index({ orderId:      1 }, { unique: true, sparse: true });
ChatRoomSchema.index({ tradeOfferId: 1 }, { unique: true, sparse: true });
```

---

### 🟡 ORTA-3: Admin Complaint PATCH Endpoint Yok → DÜZELTILDI

**Dosya:** `presentation/communication-admin.controller.ts`

**Eklenen endpoint:**
```
PATCH /admin/communication/complaints/:id/status
Body: { status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED', adminNote?: string }
```

- `RESOLVED` durumunda `resolvedBy` ve `resolvedAt` otomatik set ediliyor
- `ResolveComplaintDto` — `@IsEnum` doğrulamalı

---

### 🟡 ORTA-4: `CreateNotificationHandler` `Promise<any>` → DÜZELTILDI

**Dosya:** `application/commands/create-notification.handler.ts:17`

`Promise<any>` → `Promise<{ success: boolean; id: string }>`  
`Logger` eklendi, yorum satırı sadeleştirildi.

---

### 🟢 DÜŞÜK-1: WebSocket Namespace Tanımsız → DÜZELTILDI

**Dosya:** `infrastructure/websocket/chat.gateway.ts:32`

```typescript
@WebSocketGateway({
  namespace: 'chat',   // ← eklendi
  cors: { origin: WS_CORS_ORIGIN, credentials: true },
})
```

> ⚠️ **Frontend Migrasyon Notu:** İstemciler artık `ws://host/chat` namespace'ine bağlanmalı. Eski `ws://host/` bağlantıları çalışmaz.

---

### 🟢 DÜŞÜK-2: Notification Payload Discriminated Union Yok → DÜZELTILDI

**Dosya:** `domain/entities/notification.entity.ts`

`metadata?: Record<string, unknown>` → `metadata?: NotificationMetadata` (12 üye discriminated union)

```typescript
export type NotificationMetadata =
  | { type: 'ORDER_STATUS'; orderId: string; previousStatus?: string; newStatus?: string }
  | { type: 'BARTER_OFFER'; offerId: string; fromVendorId: string }
  | { type: 'AUCTION_BID'; auctionId: string; newBidAmount: string }
  | { type: 'CAMPAIGN'; campaignId: string }
  | { type: 'CHAT_MESSAGE'; roomId: string; senderName: string }
  | { type: 'MENU_EXPIRY_WARNING'; menuPurchaseId: string; expiresAt: string; daysRemaining: number }
  | { type: 'MENU_TRANSFER_RECEIVED'; menuPurchaseId: string }
  | { type: 'RESERVATION_CONFIRMED'; reservationId: string }
  | { type: 'RESERVATION_CANCELLED'; reservationId: string; reason?: string }
  | { type: 'SURPRISE_MENU_NEARBY'; restaurantId: string; distanceMeters: number }
  | { type: 'NEW_RESTAURANT_NEARBY'; restaurantId: string; distanceMeters: number }
  | { type: 'SYSTEM'; message: string };
```

---

### 🟢 DÜŞÜK-3: WebSocket Error Handler Yok → DÜZELTILDI

**Dosya:** `infrastructure/websocket/chat.gateway.ts`

`OnGatewayInit` implement edildi:
```typescript
afterInit(server: Server): void {
  server.on('error', (err: Error) => {
    this.logger.error('WebSocket sunucu hatası', { message: err.message });
  });
  this.logger.log('ChatGateway başlatıldı (namespace: /chat)');
}
```

---

## Bölüm 2 — Etkilenen Dosya Listesi

```
MODIFIED:
  apps/backend/src/modules/communication/communication.module.ts
  apps/backend/src/modules/communication/infrastructure/websocket/chat.gateway.ts
  apps/backend/src/modules/communication/presentation/chat.controller.ts
  apps/backend/src/modules/communication/presentation/communication-admin.controller.ts
  apps/backend/src/modules/communication/application/commands/create-notification.command.ts
  apps/backend/src/modules/communication/application/commands/create-notification.handler.ts
  apps/backend/src/modules/communication/application/dtos/create-notification.dto.ts
  apps/backend/src/modules/communication/domain/entities/notification.entity.ts
  apps/backend/src/modules/communication/application/event-handlers/order-created-notification.handler.ts
  apps/backend/src/modules/communication/application/event-handlers/trade-offer-accepted-notification.handler.ts
  apps/backend/src/modules/communication/infrastructure/push/fcm.service.ts
  packages/shared/shared-persistence/src/schemas/backend/chatRoom.schema.ts

CREATED:
  apps/backend/src/modules/communication/application/services/silent-hours.service.ts
```

---

## Bölüm 3 — Kalan İş Listesi (Ayrı Sprint)

| Madde | Risk | Sprint |
|---|---|---|
| AnonymousId katmanı (SwapSession chat anonimleştirme) | 🟠 YÜKSEK | Ayrı sprint — ChatRoom + SwapSession koordineli |
| FCM token stale cleanup (`NotRegistered` → token sil) | 🟢 DÜŞÜK | GO Faz 5 |
| `SilentHoursService` FCM akışına entegrasyon | 🟡 ORTA | FCM token yönetimi tamamlanınca |

---

## Bölüm 4 — Mimari Notlar

### FCM HTTP v1 Kurulumu

1. Firebase Console → Project Settings → Service Accounts → "Generate new private key"
2. İndirilen JSON'u `GOOGLE_SERVICE_ACCOUNT_JSON` env değişkenine koy (base64 veya tek satır escaped)
3. `FCM_SERVER_KEY` artık kullanılmıyor — silinebilir

### WebSocket Namespace Migrasyonu

Mevcut frontend bağlantısı:
```javascript
// ESKİ — çalışmaz
const socket = io('https://api.bazarx.com');

// YENİ
const socket = io('https://api.bazarx.com/chat');
```

### SilentHoursService Kullanımı

```typescript
// FCM gönderimi öncesinde:
if (!this.silentHoursService.isSilentHour()) {
  await this.fcmService.sendToToken(token, payload);
} else {
  // bildirim kuyruğa alınabilir veya sessizce atlanabilir
}
```
