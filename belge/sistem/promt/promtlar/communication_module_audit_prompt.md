# Communication Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Communication modülü 54 dosya ile sistemin büyük modüllerinden — ama Section S8 "Chat + Notifications ✅" olarak tamamlandı ve üzerinde detaylı inceleme yapılmadı.

**Kritik bağlam:**

1. **FCM + Mail entegrasyonu henüz yok** — GO Faz 5 olarak işaretlenmiş: `🔜 FCM Push + Mail (Resend/Postmark) entegrasyonu`. Bu modül push ve mail gönderiyor mu, yoksa stub mu?

2. **İki ayrı chat store** — Frontend'de `chat` ve `adminChat` Pinia store'ları var. Backend'de tek `ChatRoom` + `ChatMessage` modeli. Bu ayrım doğru mu implement edilmiş?

3. **WebSocket gateway paylaşımı** — Auction modülü aynı Socket.io altyapısını mı kullanıyor? Ayrı gateway mı? Namespace karmaşası riski var.

4. **Notification dağıtım mekanizması** — BullMQ mu, RabbitMQ mu, doğrudan send mi? Notification başarısız olursa retry var mı?

Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Proje yolu:** `apps/backend/src/modules/communication/`

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose · Socket.io · BullMQ  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)

**Mongoose modelleri:**
```
ChatRoom          → Sohbet odası (kim ↔ kim, tip: USER_USER | VENDOR_USER | SUPPORT)
ChatMessage       → Mesaj (senderId, content, isRead, attachment?)
Notification      → Bildirim kaydı (userId, type, isRead, payload)
UserComplaint     → Kullanıcı şikayeti
```

**Frontend:**
```
Pinia stores: chat, adminChat, notification
Section S8: Chat + Notifications ✅ (Section olarak tamamlandı)
WebSocket: Socket.io üzerinden gerçek zamanlı chat
```

**GO sprint bildirim kanalları (Faz 5 - implement edilmemiş):**
```
FCM Push (Firebase Cloud Messaging) — mobil push
Resend — işlemsel mail (tercih edilen)
Bildirim türleri: konum bazlı fırsat, ölü saat, QR expiry uyarısı, aktivasyon
Sessiz saatler: 22:00-08:00 arası gönderilmez
Kullanıcı tercihleri: hangi bildirim türlerini istediğini ayarlayabilir
```

---

## Communication İş Kuralları — Bunları Bilmeden İnceleme Yapma

### Chat Sistemi

```
ChatRoom tipleri:
  USER_USER:   İki kullanıcı arasında (takas mesajlaşma)
  VENDOR_USER: Vendor ↔ müşteri (sipariş destek)
  SUPPORT:     Admin ↔ kullanıcı (müşteri hizmetleri)
  ADMIN_CHAT:  Admin dahili mesajlaşma

Chat iş kuralları:
  - Teklif verilmeden önce chat açılabilir mi? (barter flow)
  - SwapSession içindeki chat anonim mi? (§AnonymousId katmanı — implement edilmemiş)
  - Mesaj silme: soft delete mi, hard delete mi?
  - Dosya/resim eki: var mı?
  - Mesaj okuma durumu: isRead flag + read_at timestamp

WebSocket events (beklenen):
  → message.send         (client → server)
  ← message.received     (server → client, broadcast to room)
  ← message.read         (server → client, okuma bildirim)
  ← notification.new     (server → client, yeni bildirim)
  → typing.start/stop    (client → server, yazıyor göstergesi)
```

### Notification Sistemi

```
Notification türleri (beklenen):
  ORDER_STATUS_CHANGED    → sipariş durumu değişti
  BID_PLACED              → artırmada yeni teklif
  TRADE_OFFER_RECEIVED    → takas teklifi geldi
  SWAP_SESSION_UPDATE     → takas durumu güncellendi
  PAYMENT_RECEIVED        → ödeme alındı
  QR_EXPIRY_WARNING       → QR bitimine N gün kaldı
  MEMBERSHIP_ACTIVATED    → üyelik aktif oldu
  GEOFENCE_NEARBY         → yakın restoran bildirimi
  INSTANT_OPPORTUNITY     → anlık fırsat menüsü açıldı

Dağıtım kanalları:
  In-app: Notification koleksiyonuna yaz + WebSocket push
  FCM: Mobil push (Faz 5 - implement edilmemiş)
  Mail: Resend ile e-posta (Faz 5 - implement edilmemiş)

Kullanıcı tercihleri:
  notificationPreferences: {
    geofence: boolean         (konum bazlı)
    menuExpiry: boolean       (QR bitiş uyarısı)
    instantOpportunity: boolean
    silentHoursStart: number  (22)
    silentHoursEnd: number    (8)
  }

Sessiz saat kuralı:
  22:00-08:00 arası bildirim gönderilmez (push + mail)
  In-app Notification kaydı yazılabilir ama push/mail gönderilmez
```

### UserComplaint (Şikayet Sistemi)

```
Kullanıcı şikayeti akışı:
  Kullanıcı şikayet açar → PENDING
  Admin inceler → INVESTIGATING
  Çözüm: RESOLVED veya REJECTED

Bu modül yeterince belgelenmemiş — kodu okuyarak öğren.
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 WebSocket gateway yapısı:**

```
Kontrol listesi:
  □ Communication modülünde özel @WebSocketGateway var mı?
    Dosya adı: chat.gateway.ts, notification.gateway.ts, communication.gateway.ts?
  □ Auction modülüyle gateway paylaşımı var mı?
    Aynı Socket.io instance mi?
    Ayrı namespace'ler mi? (/chat vs /auction)
  □ JWT authentication middleware WebSocket'te uygulanıyor mu?
    handshake.auth.token veya query.token ile?
  □ Room yönetimi: her ChatRoom._id için ayrı Socket.io room mu?
    join/leave event'leri doğru mu?
  □ Disconnect event handler var mı?
    Kullanıcı bağlantıyı kesince room'dan çıkıyor mu?
```

**1.2 Notification dağıtım mekanizması:**

```bash
grep -rn "NotificationQueue\|notification.*queue\|NOTIFICATION_QUEUE\|sendNotification\|BullMQ.*notif\|notif.*BullMQ" \
  apps/backend/src/modules/communication/ \
  --include="*.ts"
```

- BullMQ kullanılıyor mu? Queue adı ne?
- RabbitMQ'dan event consume edip notification yazıyor mu?
- Doğrudan `NotificationService.send()` inject mi?
- Retry politikası var mı?

**1.3 FCM ve Mail implement durumu:**

```bash
find apps/backend/src/ -name "*fcm*" -o -name "*firebase*" -o -name "*resend*" -o -name "*postmark*" | head -10
grep -rn "firebase-admin\|FCM\|FcmService\|ResendService\|sendmail\|nodemailer\|@sendgrid\|resend.com" \
  apps/backend/src/ --include="*.ts" | grep -v "\.spec\." | head -20
```

- FCM entegrasyonu var mı? (firebase-admin npm paketi?)
- Resend/Postmark entegrasyonu var mı?
- Yoksa: notification sadece in-app (Notification koleksiyonu + WebSocket)?
- Stub servis mi, gerçekten implement mi?

**1.4 Chat → Barter modülü entegrasyonu:**

SwapSession içindeki chat için anonim kimlik katmanı: "AnonymousId katmanı (SwapSession chat anonimleştirme) ⬜ implement edilmeli" notu var.

```
  □ ChatRoom oluştururken SwapSession bağlantısı kuruluyor mu?
    (ChatRoom.sessionId field'ı?)
  □ Chat mesajlarında senderId maskeleniyor mu?
    ("Kullanıcı-4521" gibi alias mı, gerçek userId mi görünüyor?)
  □ AnonymousId katmanı implement edilmiş mi yoksa hâlâ açık mı?
```

**1.5 `UserComplaint` sistemi:**

```bash
grep -rn "UserComplaint\|userComplaint\|complaint" \
  apps/backend/src/modules/communication/ \
  --include="*.ts" \
  | grep -v "schema\|module\|\.spec\."
```

- Endpoint'ler tanımlı mı? (`POST /complaints`, `GET /admin/complaints`)
- Handler'lar body dolu mu?
- Status geçiş logic'i var mı? (PENDING → INVESTIGATING → RESOLVED)
- Admin bildirim tetikleniyor mu?

**1.6 Modül bağımlılık grafiği:**

- `communication.module.ts` hangi modüllere bağımlı?
- Hangi modüller `NotificationService`'e inject ediyor?
  - Commerce (sipariş bildirimi)?
  - Barter (teklif bildirimi)?
  - GO/menu (QR expiry)?
- Cross-module notification: doğrudan inject mi, RabbitMQ event mi?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm communication klasörünü tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/communication/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| notification.service.ts | ? | `payload: any` | YÜKSEK | `NotificationPayload` |
| chat.gateway.ts | ? | `data: any` | YÜKSEK | `ChatMessageDto` |

Risk seviyeleri:
- `YÜKSEK`: WebSocket mesaj payload `any` → sahte mesaj format kabul edilebilir
- `YÜKSEK`: Notification payload `any` → yanlış payload ile bildirim gönderilir
- `ORTA`: ChatRoom response `any` → eksik field gösterilmez
- `DÜŞÜK`: Display-only, cascade yok

**Adım 3:** Notification payload discriminated union:

```typescript
// Kötü:
interface Notification {
  type: string;
  payload: any;   // her type için farklı yapı — tip güvensiz
}

// Doğru — discriminated union:
type NotificationPayload =
  | {
      type: 'ORDER_STATUS_CHANGED';
      orderId: string;
      previousStatus: string;
      newStatus: string;
    }
  | {
      type: 'TRADE_OFFER_RECEIVED';
      offerId: string;
      fromVendorId: string;
      estimatedValue: string;
    }
  | {
      type: 'QR_EXPIRY_WARNING';
      menuPurchaseId: string;
      expiresAt: string;
      daysRemaining: number;
    }
  | {
      type: 'BID_PLACED';
      auctionId: string;
      newBidAmount: string;
      previousBidAmount: string;
    }
  | {
      type: 'GEOFENCE_NEARBY';
      restaurantId: string;
      restaurantName: string;
      distanceMeters: number;
    };

interface NotificationDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  payload: NotificationPayload;    // any değil — tip güvenli
  isRead: boolean;
  readAt?: Date;
  channel: 'IN_APP' | 'PUSH' | 'EMAIL';
  sentAt?: Date;
  createdAt: Date;
}
```

**Adım 4:** WebSocket mesaj tipleri:

```typescript
// Socket.io event payload'ları tipli olmalı:
interface ChatMessagePayload {
  roomId: string;
  content: string;
  attachmentUrl?: string;
  clientTempId?: string;   // client-side idempotency
}

interface ChatMessageResponse {
  _id: string;
  roomId: string;
  senderId: string;
  senderAlias?: string;    // anonim chat için
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface TypingEvent {
  roomId: string;
  isTyping: boolean;
}
```

**Adım 5:** `Notification.type` string mi enum mi?

```bash
grep -rn "type.*ORDER_STATUS\|type.*TRADE_OFFER\|type.*QR_EXPIRY\|type.*BID_PLACED\|NotificationType" \
  apps/backend/src/modules/communication/ \
  --include="*.ts"
```

- `NotificationType` enum tanımlı mı?
- Her modülden gönderilen notification type'ları tutarlı string'ler mi?

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — Notification type dallanması:**
```typescript
// Kötü — notification.service.ts'de:
if (type === 'ORDER_STATUS_CHANGED') {
  // e-posta template A
  // push payload A
} else if (type === 'TRADE_OFFER_RECEIVED') {
  // e-posta template B
  // push payload B
}
// → NotificationStrategy pattern:
interface INotificationStrategy {
  buildPushPayload(notification: NotificationPayload): FCMMessage;
  buildMailPayload(notification: NotificationPayload): MailMessage;
  shouldSend(prefs: NotificationPreferences): boolean;
}
```

**Pattern B — Kanal dallanması (push vs mail vs in-app):**
```typescript
// Kötü:
if (user.fcmToken) {
  await fcmService.send(...);
} else {
  // sadece in-app
}
if (user.email && user.emailNotifications) {
  await mailService.send(...);
}
// → Multi-channel dispatcher pattern
```

**Pattern C — Sessiz saat kontrolü:**
```typescript
// Kötü — inline:
const hour = new Date().getHours();
if (hour >= 22 || hour < 8) {
  // gönderme
  return;
}
// → SilentHoursChecker utility:
function isSilentHour(
  now: Date,
  prefs: { silentHoursStart: number; silentHoursEnd: number },
  userTimezone?: string  // timezone-aware mı?
): boolean
```

**Pattern D — ChatRoom tip dallanması:**
```typescript
// Kötü:
if (room.type === 'USER_USER') {
  // iki taraf
} else if (room.type === 'VENDOR_USER') {
  // vendor + müşteri
} else if (room.type === 'SUPPORT') {
  // admin dahil
}
// → Hangi context'te kullanılıyor?
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — Notification gönderiminde ana akış engelleme:**
```typescript
// Kötü — sipariş tamamlanınca:
await this.orderRepo.update(id, { status: 'COMPLETED' });
await this.notificationService.send({  // await — başarısız olursa?
  userId,
  type: 'ORDER_STATUS_CHANGED',
  payload: { ... }
});

// Doğru — fire-and-forget ile notification:
await this.orderRepo.update(id, { status: 'COMPLETED' });
this.notificationService.send({ ... })
  .catch(err => this.logger.error('Notification failed', { userId, err }));
```

**Antipattern B — WebSocket broadcast'te client disconnect hatası:**
```typescript
// Kötü — tüm room'a broadcast:
server.to(roomId).emit('message.received', message);
// Eğer bazı client'lar bağlantı kesti ve socket error fırlatıyorsa?
// → Socket.io genellikle bunu handle eder ama error event dinleniyor mu?

gateway.server.on('error', (err) => {
  this.logger.error('WebSocket server error', err);
});
```

**Antipattern C — FCM token stale kalması:**
```typescript
// FCM token implement edilince bu risk oluşacak:
// Kullanıcı uygulamayı yeniden kurdu → yeni FCM token
// Eski token ile gönderim → FCM 404/410 döner → token silinmeli
// Bu handle edilmiş mi? (Yoksa ileride eklenmeli)
```

**Antipattern D — Okunmamış notification sayısı race condition:**
```typescript
// Kötü — sayma + güncelleme ayrı:
const unreadCount = await Notification.countDocuments({ userId, isRead: false });
// Bu sürede başka notification geldi...
// → Atomic $inc ile counter veya real-time WebSocket event
```

**Antipattern E — ChatRoom oluşturmada duplicate:**
```typescript
// Aynı iki kullanıcı arasında iki kez ChatRoom oluşturulabilir mi?
// Kontrol:
const existing = await ChatRoom.findOne({
  type: 'USER_USER',
  participants: { $all: [userId1, userId2] }
});
if (existing) return existing; // var olanı döndür
// Bu kontrol var mı? Atomic mı?
```

**3.3 Sessiz saat timezone sorusu:**

```
Sessiz saat 22:00-08:00 — bu:
  □ Server timezone'una göre mi?
    (Ankara EST/UTC+3 → farklı şehirlerde sorun)
  □ Kullanıcı timezone'una göre mi?
    (Kullanıcı profilde timezone tutuluyor mu?)
  □ Sabit UTC olarak mı?

Gerçek hayatta: Ankara kullanıcısı → UTC+3 → 22:00 = UTC 19:00
Server UTC ise sessiz saat hesabı 3 saat kayıyor
```

**3.4 Yetkilendirme kontrolü:**

```
  □ Kullanıcı A, Kullanıcı B'nin chat mesajlarını okuyabilir mi?
    (ChatRoom.participants kontrolü var mı?)
  □ Admin tüm chat odalarını görebilir mi?
  □ UserComplaint: kullanıcı sadece kendi şikayetini görüyor mu?
  □ `GET /chat/:roomId/messages` → bu roomId'nin bu kullanıcıya ait olduğu kontrol ediliyor mu?
```

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 FCM ve Mail stub servisleri:**

```bash
find apps/backend/src/modules/communication/ \
  -name "*.service.ts" | xargs grep -l "fcm\|FCM\|mail\|Mail\|push\|Push" 2>/dev/null
```

- FCM servis dosyası var ama implement edilmemiş mi?
- Mail servis dosyası var ama body boş mu?
- Module'da provider olarak kayıtlı stub'lar boot'ta crash yapıyor mu?

**4.2 Dead model tespiti:**

```bash
for model in ChatRoom ChatMessage Notification UserComplaint; do
  echo "=== $model yazılıyor ==="
  grep -rn "$model\.\(create\|insertMany\|findOneAndUpdate\)" \
    apps/backend/src/ --include="*.ts" | grep -v "schema\|module\|\.spec\." | wc -l
  echo "=== $model okunuyor ==="
  grep -rn "$model\.\(find\|findOne\|aggregate\)" \
    apps/backend/src/ --include="*.ts" | grep -v "schema\|module\|\.spec\." | wc -l
done
```

**4.3 Notification → tüm kaynak modüller:**

```bash
grep -rn "notificationService\|NotificationService\|sendNotification\|notification.*send\|NOTIFICATION_QUEUE" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "communication\|schema\|module\|\.spec\." \
  | awk -F: '{print $1}' | sort | uniq
```

Hangi modüller `NotificationService` kullanıyor? Doğrudan inject mi, event mi?

**4.4 `communication.module.ts` sağlık kontrolü:**

- 54 dosya için `providers` listesi kaç provider içeriyor?
- Kayıtlı ama hiç inject edilmeyen provider var mı?
- WebSocket gateway doğru register edilmiş mi?

**4.5 Unread notification count optimize:**

```bash
grep -rn "unread\|isRead.*false\|countDocuments.*isRead\|notification.*count" \
  apps/backend/src/modules/communication/ \
  --include="*.ts"
```

- Okunmamış bildirim sayısı her request'te aggregate mi yapılıyor?
- Redis counter ile optimize edilmiş mi?
- WebSocket üzerinden real-time güncelleniyor mu?

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `apps/backend/src/modules/communication/path/to/file.ts:satır`
**Tespit:** [Ne buldun]
**Risk:** KRİTİK / YÜKSEK / ORTA / DÜŞÜK
**Sorun:** [Neden sorun — tek cümle]

**Düzeltme:**
```typescript
// Tam, çalışır, copy-paste edilebilir kod
```

**Cascade etkisi:** [Bu değişiklik başka neyi etkiler]
```

---

## Önceliklendirme

1. **KRİTİK** — Chat yetkilendirme eksikliği (Kullanıcı A, Kullanıcı B'nin mesajlarını okuyabilir), WebSocket JWT authentication yoksa anonim mesaj gönderimi, ChatRoom duplicate oluşturma (aynı iki kullanıcı için iki room)
2. **YÜKSEK** — Notification payload `any` (yanlış payload ile bildirim), FCM stub module'da kayıtlı ve boot'ta crash yapıyor, sessiz saat timezone'a duyarsız
3. **ORTA** — Notification ana akışı bloke ediyor (fire-and-forget değil), AnonymousId katmanı implement edilmemiş (SwapSession chat açık), `NotificationType` enum yerine string
4. **DÜŞÜK** — UserComplaint stub durumu, unread count optimize edilmemiş, WebSocket error event handler

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **FCM vs APNs seçimi** — iş/teknik karar
- **Resend vs Postmark seçimi** — iş kararı (Resend önerisi önceki sprintte yapıldı)
- **Sessiz saat değerleri (22:00-08:00)** — iş kararı
- **ChatRoom tipleri (USER_USER/VENDOR_USER/SUPPORT)** — frontend bağımlı
- **AnonymousId katmanının tam implementasyonu** — ayrı sprint (sadece durumu raporla)
- **GO Faz 5-6-7 implementasyonu** — ayrı sprint (sadece stub durumunu raporla)
- **Socket.io vs WebSocket seçimi** — değiştirme

---

## Son Not

Communication modülünde üç öncelikli risk:

**Chat yetkilendirme** — `GET /chat/:roomId/messages` isteğinde bu roomId'nin bu kullanıcıya ait olduğu kontrol edilmezse herkes herkese ait chat'i okuyabilir. 54 dosyalık büyük modülde bu tür kontrollerin atlanması kolay.

**FCM stub boot crash** — Firebase Admin SDK yapılandırılmadan `FcmService` module'a provider olarak eklenirse NestJS boot'ta DI injection hatası verir. Tüm sistem ayağa kalkmaz. FCM implement edilmeyecekse stub doğru exception fırlatmalı.

**Notification payload `any`** — `ORDER_STATUS_CHANGED` bildirimi ile `GEOFENCE_NEARBY` bildirimi aynı `payload: any` field'ını kullanıyorsa, yanlış payload gönderildiğinde frontend'de parse hatası oluşur ve bildirim gösterilmez — sessiz başarısızlık.

Bu üçü önce raporla.
