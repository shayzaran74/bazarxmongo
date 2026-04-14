# Gemini Prompt — FAZ 7A: Communication Modülü (Chat + Notification + Complaint)

Aşağıdaki prompt'u Gemini'ye olduğu gibi yapıştır.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT

```
Sen bir senior NestJS backend developer'sın. BarterBorsa adlı bir ticari takas platformunun backend'ini yazıyorsun.

MİMARİ KARARLAR (ASLA sorgulamayacaksın):

- Framework: NestJS 10+ / Fastify adapter
- Monorepo: Turborepo + pnpm workspaces
- TypeScript strict mode
- PostgreSQL 16 — Prisma ORM
- DDD: Entity, AggregateRoot, ValueObject, UseCase, Repository pattern
- CQRS: NestJS CQRS modülü ile Command/Query ayrımı
- Package prefix: @barterborsa/*
- Real-time: WebSocket (Socket.IO) ile chat

ÖNEMLİ DI PATTERN:
- IEventBus interface'ini KULLANMA. Her modülün kendi EventPublisher sınıfı olacak.
- `any` tipi YASAK — her yerde doğru tip kullan.
- Repository'ler için @Inject('TOKEN') ile injection token kullan.
- Diğer servisler için somut sınıf inject et.

MEVCUT MODÜLLER:
- Identity (User, Auth), Vendor, Catalog, Inventory, Commerce, Barter, Auction
- FinancialGateway (backend içinde facade)
- Financial Service (ayrı servis, gRPC)
- Delivery Service (ayrı servis, MongoDB)

SHARED PAKETLER:

@barterborsa/shared-core:
  - Entity<T>, AggregateRoot<T>, ValueObject<T>, DomainEvent
  - IRepository<T>, Command, Query, PaginationInput, PaginatedResult<T>
  - DomainException, NotFoundException, ConflictException
  - Result<T, E>, Ok(), Err()

@barterborsa/shared-persistence:
  - PrismaModule, PrismaService, BasePrismaRepository<T>

@barterborsa/shared-messaging:
  - RabbitMQModule, PublisherService, IntegrationEvent

@barterborsa/shared-nest:
  - @CurrentUser(), @Roles(), @Public()
  - ResponseTransformInterceptor, GlobalExceptionFilter

KURALLAR:
1. Sadece istenen dosyaları yaz
2. Her dosyanın tam path'ini başına yorum olarak yaz
3. TypeScript strict mode — `any` YASAK
4. Import'larda @barterborsa/* workspace alias kullan
5. Kod yorumlarını Türkçe yaz
6. User tablosuna relation EKLEME — sadece userId string
7. Order/TradeOffer tablosuna relation EKLEME — sadece orderId/tradeOfferId string
8. WebSocket ile gerçek zamanlı chat mesajı iletimi
```

### GÖREV

```
FAZ 7A: Communication modülünü yaz. 3 alt sistem:

1. Chat — Sipariş ve barter süreçlerinde alıcı-satıcı arası mesajlaşma
2. Notification — Platform bildirimleri (sipariş durumu, teklif, kampanya vs.)
3. Complaint — Kullanıcı şikayetleri

=== CHAT SİSTEMİ İŞ AKIŞI ===

- ChatRoom sipariş veya barter teklifi bazında oluşturulur (orderId veya tradeOfferId ile)
- Her ChatRoom'da sadece 2 katılımcı var (buyer + vendor veya initiator + receiver)
- Mesajlar gerçek zamanlı WebSocket ile iletilir
- Mesaj tipleri: TEXT, IMAGE, SYSTEM (otomatik bilgi mesajları)
- Okundu bilgisi (isRead, readAt)
- Arşivleme: belirli süre sonra oda arşivlenir (isArchived)
- SYSTEM mesajları otomatik oluşturulur:
  - Sipariş oluşturulduğunda: "Sipariş #{orderNumber} oluşturuldu"
  - Kargo gönderildiğinde: "Kargo gönderildi. Takip: {trackingNumber}"
  - Barter teklifi kabul edildiğinde: "Takas teklifi kabul edildi"

=== NOTIFICATION SİSTEMİ ===

- Her kullanıcıya özel bildirimler
- Bildirim tipleri: ORDER_STATUS, BARTER_OFFER, AUCTION_BID, CAMPAIGN, SYSTEM, CHAT_MESSAGE
- Okundu/okunmadı durumu
- Link: bildirime tıklandığında yönlendirilecek URL
- RabbitMQ event'lerinden otomatik bildirim oluşturma:
  - order.created → buyer'a "Siparişiniz oluşturuldu"
  - order.shipped → buyer'a "Siparişiniz kargoya verildi"
  - barter.offer.created → receiver'a "Yeni takas teklifi aldınız"
  - auction.bid.placed → auction owner'a "Yeni teklif: {amount} TL"

=== COMPLAINT SİSTEMİ ===

- Kullanıcı başka bir kullanıcıyı şikayet edebilir
- Durum: PENDING → UNDER_REVIEW → RESOLVED / REJECTED
- Admin tarafından incelenir ve çözümlenir

Modül yapısı:

apps/backend/src/modules/communication/
├── application/
│   ├── commands/
│   │   ├── create-chat-room.command.ts
│   │   ├── create-chat-room.handler.ts
│   │   ├── send-message.command.ts
│   │   ├── send-message.handler.ts
│   │   ├── send-system-message.command.ts
│   │   ├── send-system-message.handler.ts
│   │   ├── mark-messages-read.command.ts
│   │   ├── mark-messages-read.handler.ts
│   │   ├── archive-chat-room.command.ts
│   │   ├── archive-chat-room.handler.ts
│   │   ├── create-notification.command.ts
│   │   ├── create-notification.handler.ts
│   │   ├── create-bulk-notification.command.ts
│   │   ├── create-bulk-notification.handler.ts
│   │   ├── mark-notification-read.command.ts
│   │   ├── mark-notification-read.handler.ts
│   │   ├── mark-all-notifications-read.command.ts
│   │   ├── mark-all-notifications-read.handler.ts
│   │   ├── create-complaint.command.ts
│   │   ├── create-complaint.handler.ts
│   │   ├── review-complaint.command.ts
│   │   ├── review-complaint.handler.ts
│   │   ├── resolve-complaint.command.ts
│   │   └── resolve-complaint.handler.ts
│   ├── queries/
│   │   ├── get-chat-room.query.ts
│   │   ├── get-chat-room.handler.ts
│   │   ├── get-chat-rooms.query.ts
│   │   ├── get-chat-rooms.handler.ts
│   │   ├── get-messages.query.ts
│   │   ├── get-messages.handler.ts
│   │   ├── get-unread-count.query.ts
│   │   ├── get-unread-count.handler.ts
│   │   ├── get-notifications.query.ts
│   │   ├── get-notifications.handler.ts
│   │   ├── get-unread-notification-count.query.ts
│   │   ├── get-unread-notification-count.handler.ts
│   │   ├── get-complaints.query.ts
│   │   ├── get-complaints.handler.ts
│   │   ├── get-complaint.query.ts
│   │   └── get-complaint.handler.ts
│   ├── event-handlers/
│   │   ├── order-created-notification.handler.ts
│   │   ├── order-shipped-notification.handler.ts
│   │   ├── order-delivered-notification.handler.ts
│   │   ├── trade-offer-created-notification.handler.ts
│   │   ├── trade-offer-accepted-notification.handler.ts
│   │   ├── auction-bid-notification.handler.ts
│   │   └── payment-completed-notification.handler.ts
│   ├── services/
│   │   └── notification-template.service.ts
│   └── dtos/
│       ├── create-chat-room.dto.ts
│       ├── send-message.dto.ts
│       ├── create-notification.dto.ts
│       ├── create-complaint.dto.ts
│       ├── resolve-complaint.dto.ts
│       ├── chat-room-response.dto.ts
│       ├── message-response.dto.ts
│       ├── notification-response.dto.ts
│       └── complaint-response.dto.ts
├── domain/
│   ├── entities/
│   │   ├── chat-room.entity.ts
│   │   ├── chat-message.entity.ts
│   │   ├── notification.entity.ts
│   │   └── user-complaint.entity.ts
│   ├── value-objects/
│   │   ├── message-content.vo.ts
│   │   └── notification-type.vo.ts
│   ├── events/
│   │   ├── message-sent.event.ts
│   │   ├── notification-created.event.ts
│   │   └── complaint-created.event.ts
│   ├── repositories/
│   │   ├── chat-room.repository.interface.ts
│   │   ├── chat-message.repository.interface.ts
│   │   ├── notification.repository.interface.ts
│   │   └── user-complaint.repository.interface.ts
│   └── enums/
│       ├── chat-room-status.enum.ts
│       ├── chat-message-type.enum.ts
│       ├── notification-type.enum.ts
│       └── complaint-status.enum.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-chat-room.repository.ts
│   │   ├── prisma-chat-message.repository.ts
│   │   ├── prisma-notification.repository.ts
│   │   ├── prisma-user-complaint.repository.ts
│   │   └── mappers/
│   │       ├── chat-room.mapper.ts
│   │       ├── chat-message.mapper.ts
│   │       ├── notification.mapper.ts
│   │       └── user-complaint.mapper.ts
│   ├── websocket/
│   │   └── chat.gateway.ts
│   └── event-publishers/
│       └── communication-event.publisher.ts
├── presentation/
│   ├── chat.controller.ts
│   ├── notification.controller.ts
│   ├── complaint.controller.ts
│   └── communication-admin.controller.ts
└── communication.module.ts
```

### PRİSMA ŞEMASI

Backend Prisma şemasına ekle (mevcut tablolara DOKUNMA):

```prisma
// === COMMUNICATION ENUMS ===

enum ChatRoomStatus {
  ACTIVE
  ARCHIVED
  CLOSED
}

enum ChatMessageType {
  TEXT
  IMAGE
  SYSTEM
  FILE
}

enum ComplaintStatus {
  PENDING
  UNDER_REVIEW
  RESOLVED
  REJECTED
}

// === COMMUNICATION TABLES ===

model ChatRoom {
  id             String         @id @default(cuid())
  orderId        String?        @unique @map("order_id")
  tradeOfferId   String?        @unique @map("trade_offer_id")
  status         ChatRoomStatus @default(ACTIVE)
  archivePreview Json?          @map("archive_preview")
  archiveUrl     String?        @map("archive_url")
  archivedAt     DateTime?      @map("archived_at")
  isArchived     Boolean        @default(false) @map("is_archived")
  storageTier    String         @default("STANDARD") @map("storage_tier")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  // Katılımcılar — userId dizisi olarak tutulacak (User relation yok)
  participantIds String[]       @map("participant_ids")
  messages       ChatMessage[]

  @@index([isArchived])
  @@index([updatedAt])
  @@map("chat_rooms")
}

model ChatMessage {
  id        String          @id @default(cuid())
  roomId    String          @map("room_id")
  senderId  String?         @map("sender_id")  // null = SYSTEM mesajı
  content   String
  type      ChatMessageType @default(TEXT)
  isRead    Boolean         @default(false) @map("is_read")
  readAt    DateTime?       @map("read_at")
  readById  String?         @map("read_by_id")
  metadata  Json?
  createdAt DateTime        @default(now()) @map("created_at")
  room      ChatRoom        @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@index([roomId])
  @@index([senderId])
  @@index([roomId, createdAt])
  @@map("chat_messages")
}

model Notification {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  type      String   // ORDER_STATUS, BARTER_OFFER, AUCTION_BID, CAMPAIGN, SYSTEM, CHAT_MESSAGE
  title     String
  message   String
  link      String?
  isRead    Boolean  @default(false) @map("is_read")
  metadata  Json?
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([userId, isRead])
  @@index([createdAt])
  @@map("notifications")
}

model UserComplaint {
  id          String          @id @default(cuid())
  reporterId  String          @map("reporter_id")
  subjectId   String          @map("subject_id")
  reason      String
  description String?
  status      ComplaintStatus @default(PENDING)
  adminNote   String?         @map("admin_note")
  resolvedAt  DateTime?       @map("resolved_at")
  resolvedBy  String?         @map("resolved_by")
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  @@index([reporterId])
  @@index([subjectId])
  @@index([status])
  @@map("user_complaints")
}
```

NOT: Mevcut şemadaki ChatRoom'daki `participants User[] @relation("ChatParticipants")` relation'ını
KALDIRDIK ve yerine `participantIds String[]` koyduk. Çünkü User tablosuna relation eklemiyoruz.

### DOSYA LİSTESİ

Yukarıdaki klasör yapısındaki HER DOSYANIN tam içeriğini yaz. Özellikle dikkat:

DOMAIN:
- ChatRoom entity:
  - static createForOrder(orderId, buyerId, vendorId): sipariş odası
  - static createForTrade(tradeOfferId, initiatorId, receiverId): barter odası
  - archive(): isArchived = true, archivedAt = now
  - close(): status CLOSED
  - isParticipant(userId): participantIds.includes kontrolü

- ChatMessage entity:
  - static createText(roomId, senderId, content): TEXT mesaj
  - static createSystem(roomId, content): SYSTEM mesaj (senderId null)
  - static createImage(roomId, senderId, imageUrl): IMAGE mesaj
  - markAsRead(readById): isRead = true, readAt = now

- Notification entity:
  - static create(userId, type, title, message, link?): bildirim oluştur
  - markAsRead(): isRead = true

- UserComplaint entity:
  - static create(reporterId, subjectId, reason, description?): status PENDING
  - review(): PENDING → UNDER_REVIEW
  - resolve(adminNote, resolvedBy): → RESOLVED
  - reject(adminNote, resolvedBy): → REJECTED

APPLICATION SERVICES:
- notification-template.service.ts:
  - getOrderCreatedTemplate(orderNumber): { title, message, link }
  - getOrderShippedTemplate(orderNumber, trackingNumber): { title, message, link }
  - getTradeOfferTemplate(offerDetails): { title, message, link }
  - getAuctionBidTemplate(auctionId, amount): { title, message, link }
  Template'ler Türkçe olacak:
    title: "Siparişiniz Oluşturuldu"
    message: "#{orderNumber} numaralı siparişiniz başarıyla oluşturuldu."
    link: "/orders/{orderId}"

EVENT HANDLERS (RabbitMQ'dan dinle — otomatik bildirim):
- order.created → buyer'a notification + chat room oluştur + system mesajı
- order.shipped → buyer'a notification + chat'e system mesajı
- order.delivered → buyer'a notification
- barter.offer.created → receiver'a notification
- barter.offer.accepted → her iki tarafa notification + chat room oluştur
- auction.bid.placed → auction creator'a notification
- payment.completed → buyer'a notification

WEBSOCKET (chat.gateway.ts):
- @WebSocketGateway({ namespace: '/chat' })
- handleConnection: JWT token doğrula, userId çıkar
- joinRoom(roomId): kullanıcı odaya katılır — isParticipant kontrolü
- sendMessage(roomId, content, type): mesaj gönder
  1. ChatMessage kaydet (DB)
  2. Odadaki diğer kullanıcıya WebSocket emit ('message:new')
  3. Diğer kullanıcı online değilse → notification oluştur
- markRead(roomId): okundu bilgisi gönder
  1. Tüm okunmamış mesajları okundu yap
  2. Karşı tarafa emit ('message:read')
- typing(roomId): yazıyor göstergesi emit ('user:typing')
- Room-based: her ChatRoom kendi room'u (chat:{roomId})

CONTROLLERS:
- chat.controller.ts:
  - GET /chat/rooms — authenticated, kullanıcının chat odaları (son mesajla birlikte)
  - GET /chat/rooms/:id — authenticated, oda detayı + isParticipant kontrolü
  - GET /chat/rooms/:id/messages — authenticated, mesaj geçmişi (paginated, cursor-based)
  - POST /chat/rooms — authenticated, yeni oda oluştur (orderId veya tradeOfferId ile)
  - POST /chat/rooms/:id/messages — authenticated, mesaj gönder (WebSocket yoksa REST fallback)
  - PATCH /chat/rooms/:id/read — authenticated, okundu işaretle
  - GET /chat/unread-count — authenticated, toplam okunmamış mesaj sayısı

- notification.controller.ts:
  - GET /notifications — authenticated, paginated bildirim listesi
  - GET /notifications/unread-count — authenticated, okunmamış sayısı
  - PATCH /notifications/:id/read — authenticated, tek bildirimi okundu yap
  - PATCH /notifications/read-all — authenticated, tümünü okundu yap

- complaint.controller.ts:
  - POST /complaints — authenticated, şikayet oluştur
  - GET /complaints — authenticated, kendi şikayetlerim

- communication-admin.controller.ts:
  - @Roles('ADMIN')
  - GET /admin/chat/rooms — tüm chat odaları
  - GET /admin/chat/rooms/:id/messages — oda mesajları (admin inceleme)
  - GET /admin/complaints — tüm şikayetler (filtrelenebilir: status)
  - PATCH /admin/complaints/:id/review — incelemeye al
  - PATCH /admin/complaints/:id/resolve — çözümle
  - PATCH /admin/complaints/:id/reject — reddet
  - POST /admin/notifications — toplu bildirim gönder (tüm kullanıcılara)

MODULE:
- communication.module.ts:
  - imports: CqrsModule, PrismaModule, RabbitMQModule
  - providers: tüm repository'ler, handler'lar, services, ChatGateway, CommunicationEventPublisher
  - controllers: tüm controller'lar
  - exports: NotificationService (diğer modüller bildirim göndermek isteyebilir)

- app-components.ts: SUPPORT grubuna CommunicationModule ekle

### KONTROL

1. `any` tipi SIFIR mı?
2. IEventBus KULLANILMAMIŞ mı? (CommunicationEventPublisher var mı?)
3. WebSocket JWT doğrulama yapıyor mu?
4. WebSocket room-based: her oda kendi room'u mu?
5. isParticipant kontrolü: sadece oda katılımcıları mesaj görebilir mi?
6. System mesajları senderId null mı?
7. RabbitMQ event handler'lar doğru exchange/routing key dinliyor mu?
8. Notification template'ler Türkçe mi?
9. Cursor-based pagination mesaj geçmişinde var mı?
10. Chat room oluşturma: orderId veya tradeOfferId ile (duplikat kontrolü — unique)?
11. TypeScript strict mode derlenir mi?
12. User tablosuna relation EKLENMEMİŞ mi?

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

Parçalı verme planı:

- Birinci mesaj: System prompt + Prisma + Domain katmanı (entities, VOs, events, repos, enums)
- İkinci mesaj: Application katmanı (DTOs + Commands + Queries + Event Handlers + Services)
- Üçüncü mesaj: Infrastructure + Presentation + WebSocket + Module (mappers, repos, gateway, controllers)

Her parçada system prompt'u TEKRAR VER.

ÖNEMLİ DEĞİŞİKLİK:
Mevcut şemadaki ChatRoom'da `participants User[]` relation'ı vardı.
Bunu `participantIds String[]` ile değiştirdik — User tablosuna relation eklemiyoruz.
Bu, mevcut veritabanındaki chat_room_participants pivot tablosunu kaldırıyor.
Eğer mevcut veride bu tablo varsa migration'da dikkat edilmeli.

Sonraki prompt'lar:
- Faz 7B: Content + Advertising (CMS, AdCampaign, HomeBanner, Help, SEO, Announcement)
- Faz 7C: Loyalty/XP + Analytics (XP transactions, missions, milestones, levels, analytics events)
