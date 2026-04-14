# Gemini Prompt — FAZ 6: Delivery Service (MongoDB + Mongoose)

Aşağıdaki prompt'u Gemini'ye olduğu gibi yapıştır.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT

```
Sen bir senior NestJS backend developer'sın. BarterBorsa adlı bir ticari takas platformunun
BAĞIMSIZ delivery (kargo/teslimat) servisini yazıyorsun.

MİMARİ KARARLAR (ASLA sorgulamayacaksın):

- Framework: NestJS 10+ / Fastify adapter
- Monorepo: Turborepo + pnpm workspaces
- TypeScript strict mode
- VERİTABANI: MongoDB 7 — Mongoose ODM (PostgreSQL DEĞİL, Prisma DEĞİL)
- DDD: Entity, AggregateRoot, ValueObject, UseCase, Repository pattern
- CQRS: NestJS CQRS modülü ile Command/Query ayrımı
- Package prefix: @barterborsa/*
- Inter-service: gRPC (senkron) + RabbitMQ (asenkron)
- Real-time: WebSocket (Socket.IO) ile canlı kargo takibi

ÖNEMLİ — BU BAĞIMSIZ BİR SERVİSTİR:
- apps/delivery-service/ dizininde yaşar (apps/backend/ DEĞİL)
- Kendi MongoDB veritabanına bağlanır (barterborsa_delivery)
- Kendi main.ts, app.module.ts, package.json dosyaları var
- Backend ile iletişim: gRPC (senkron) + RabbitMQ (asenkron)
- User/Order/Vendor tablolarına ERİŞİMİ YOK — sadece userId, orderId, vendorId string referansları

ÖNEMLİ — DI PATTERN:
- IEventBus interface'ini KULLANMA. DeliveryEventPublisher sınıfını kullan.
- EventPublisher, PublisherService'i inject eder ve spesifik event metotları sunar.
- `any` tipi YASAK — her yerde doğru tip kullan.

DAHA ÖNCE TAMAMLANAN:
- Backend: Identity, Vendor, Catalog, Inventory, Commerce, Barter, Auction modülleri
- Financial Service: Wallet, Ledger, Commission, Escrow (ayrı servis, gRPC)
- Event'ler bu servise gelir:
  - commerce.events / order.created → kargo oluştur
  - commerce.events / order.cancelled → kargo iptal et
  - barter.events / offer.accepted → barter kargo oluştur (çift yönlü)
  - barter.events / part.shipped → barter kargo durumu güncelle

SHARED PAKETLER (bunları kullanacaksın):

@barterborsa/shared-core:
  - Entity<T>, AggregateRoot<T>, ValueObject<T>, DomainEvent
  - IRepository<T>, Command, Query
  - PaginationInput, PaginatedResult<T>
  - DomainException, NotFoundException
  - Result<T, E>, Ok(), Err()

@barterborsa/shared-persistence:
  - BaseMongoRepository<T> — Mongoose base repository
  - MongooseModule (shared konfigürasyon)

@barterborsa/shared-messaging:
  - RabbitMQModule, PublisherService, IntegrationEvent
  - DELIVERY_EXCHANGE: shipment.created, shipment.picked_up, shipment.in_transit,
    shipment.delivered, shipment.failed, shipment.returned

@barterborsa/shared-observability:
  - LoggerModule, StructuredLogger, HealthModule

@barterborsa/shared-nest:
  - @CurrentUser(), @Roles(), @Public()
  - ResponseTransformInterceptor, GlobalExceptionFilter, TimeoutInterceptor

KURALLAR:
1. Sadece istenen dosyaları yaz
2. Her dosyanın tam path'ini başına yorum olarak yaz
3. TypeScript strict mode — `any` YASAK
4. Import'larda @barterborsa/* workspace alias kullan
5. Kod yorumlarını Türkçe yaz
6. MONGOOSE kullan, Prisma DEĞİL
7. Schema tanımları @nestjs/mongoose @Schema() ve @Prop() decorator'ları ile
8. Her Mongoose schema'da timestamps: true kullan
9. GeoJSON desteği ile lokasyon takibi (2dsphere index)
10. User/Order/Vendor tablosuna erişim YOK — sadece string ID referansları
```

### GÖREV

```
FAZ 6: Delivery Service'i bağımsız bir NestJS + MongoDB uygulaması olarak yaz.

Bu servis hem e-ticaret siparişlerinin hem de barter takas kargolarının
teslimat sürecini yönetir. İki ana modülden oluşur:

1. Shipment — Kargo oluşturma, durum takibi, kargo firması entegrasyonu
2. Tracking — Gerçek zamanlı konum takibi (WebSocket), tracking event'leri

=== KARGO AKIŞI ===

E-TİCARET SİPARİŞ KARGOSU:
1. Backend order.created event'i yayınlar → delivery-service dinler
2. Shipment oluşturulur (status: PENDING, type: ORDER)
3. Vendor kargoyu hazırlar → status: PROCESSING
4. Kargo firmasına teslim edilir → status: PICKED_UP (carrier info eklenir)
5. Kargo yolda → status: IN_TRANSIT (tracking event'leri)
6. Kargo teslim edildi → status: DELIVERED
   → shipment.delivered event yayınlanır → backend dinler → Order DELIVERED yapar
7. İade kargosu → status: RETURN_REQUESTED → RETURNING → RETURNED

BARTER TAKAS KARGOSU:
1. Backend barter.accepted event'i yayınlar → delivery-service dinler
2. İKİ ayrı Shipment oluşturulur (type: BARTER, barterSessionId ile bağlı)
   - Shipment A: initiator → receiver (part 1)
   - Shipment B: receiver → initiator (part 2)
3. Her iki kargo bağımsız takip edilir
4. Her biri DELIVERED olduğunda → barter part delivered event'i yayınlanır

KARGO FİRMASI ENTEGRASYONU:
- Carrier adaptör pattern'ı (strategy pattern)
- Desteklenen firmalar: Yurtiçi Kargo, Aras Kargo, MNG Kargo, PTT Kargo
- Her adaptör: createShipment, getTrackingInfo, cancelShipment metodları
- Şimdilik mock implementasyon (gerçek API entegrasyonu sonra yapılacak)
- Her carrier'ın trackingUrl template'i var

Servis yapısı:

apps/delivery-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── modules/
│   │   ├── shipment/
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── create-shipment.command.ts
│   │   │   │   │   ├── create-shipment.handler.ts
│   │   │   │   │   ├── create-barter-shipments.command.ts
│   │   │   │   │   ├── create-barter-shipments.handler.ts
│   │   │   │   │   ├── assign-carrier.command.ts
│   │   │   │   │   ├── assign-carrier.handler.ts
│   │   │   │   │   ├── pick-up-shipment.command.ts
│   │   │   │   │   ├── pick-up-shipment.handler.ts
│   │   │   │   │   ├── update-shipment-status.command.ts
│   │   │   │   │   ├── update-shipment-status.handler.ts
│   │   │   │   │   ├── deliver-shipment.command.ts
│   │   │   │   │   ├── deliver-shipment.handler.ts
│   │   │   │   │   ├── fail-shipment.command.ts
│   │   │   │   │   ├── fail-shipment.handler.ts
│   │   │   │   │   ├── request-return-shipment.command.ts
│   │   │   │   │   ├── request-return-shipment.handler.ts
│   │   │   │   │   ├── cancel-shipment.command.ts
│   │   │   │   │   └── cancel-shipment.handler.ts
│   │   │   │   ├── queries/
│   │   │   │   │   ├── get-shipment.query.ts
│   │   │   │   │   ├── get-shipment.handler.ts
│   │   │   │   │   ├── get-shipment-by-tracking.query.ts
│   │   │   │   │   ├── get-shipment-by-tracking.handler.ts
│   │   │   │   │   ├── list-shipments.query.ts
│   │   │   │   │   ├── list-shipments.handler.ts
│   │   │   │   │   ├── get-shipments-by-order.query.ts
│   │   │   │   │   ├── get-shipments-by-order.handler.ts
│   │   │   │   │   ├── get-barter-shipments.query.ts
│   │   │   │   │   └── get-barter-shipments.handler.ts
│   │   │   │   ├── event-handlers/
│   │   │   │   │   ├── order-created.handler.ts
│   │   │   │   │   ├── order-cancelled.handler.ts
│   │   │   │   │   ├── barter-accepted.handler.ts
│   │   │   │   │   └── order-shipped.handler.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── shipment-number.service.ts
│   │   │   │   │   └── estimated-delivery.service.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── create-shipment.dto.ts
│   │   │   │       ├── assign-carrier.dto.ts
│   │   │   │       ├── update-status.dto.ts
│   │   │   │       ├── shipment-response.dto.ts
│   │   │   │       ├── shipment-detail-response.dto.ts
│   │   │   │       └── shipment-list-response.dto.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── shipment.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── tracking-number.vo.ts
│   │   │   │   │   ├── shipping-address.vo.ts
│   │   │   │   │   ├── carrier-info.vo.ts
│   │   │   │   │   └── dimensions.vo.ts
│   │   │   │   ├── events/
│   │   │   │   │   ├── shipment-created.event.ts
│   │   │   │   │   ├── shipment-picked-up.event.ts
│   │   │   │   │   ├── shipment-in-transit.event.ts
│   │   │   │   │   ├── shipment-delivered.event.ts
│   │   │   │   │   ├── shipment-failed.event.ts
│   │   │   │   │   └── shipment-returned.event.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   └── shipment.repository.interface.ts
│   │   │   │   ├── enums/
│   │   │   │   │   ├── shipment-status.enum.ts
│   │   │   │   │   ├── shipment-type.enum.ts
│   │   │   │   │   └── carrier-code.enum.ts
│   │   │   │   └── services/
│   │   │   │       └── shipment-state-machine.service.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── shipment.schema.ts
│   │   │   │   │   ├── mongo-shipment.repository.ts
│   │   │   │   │   └── mappers/
│   │   │   │   │       └── shipment.mapper.ts
│   │   │   │   ├── carriers/
│   │   │   │   │   ├── carrier.interface.ts
│   │   │   │   │   ├── carrier.factory.ts
│   │   │   │   │   ├── yurtici.adapter.ts
│   │   │   │   │   ├── aras.adapter.ts
│   │   │   │   │   ├── mng.adapter.ts
│   │   │   │   │   └── ptt.adapter.ts
│   │   │   │   └── event-publishers/
│   │   │   │       └── shipment-event.publisher.ts
│   │   │   ├── presentation/
│   │   │   │   ├── shipment.controller.ts
│   │   │   │   ├── shipment.grpc.controller.ts
│   │   │   │   └── shipment-admin.controller.ts
│   │   │   └── shipment.module.ts
│   │   │
│   │   └── tracking/
│   │       ├── application/
│   │       │   ├── commands/
│   │       │   │   ├── add-tracking-event.command.ts
│   │       │   │   ├── add-tracking-event.handler.ts
│   │       │   │   ├── update-location.command.ts
│   │       │   │   └── update-location.handler.ts
│   │       │   ├── queries/
│   │       │   │   ├── get-tracking-events.query.ts
│   │       │   │   ├── get-tracking-events.handler.ts
│   │       │   │   ├── get-current-location.query.ts
│   │       │   │   └── get-current-location.handler.ts
│   │       │   └── dtos/
│   │       │       ├── add-tracking-event.dto.ts
│   │       │       ├── update-location.dto.ts
│   │       │       ├── tracking-event-response.dto.ts
│   │       │       └── location-response.dto.ts
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   ├── tracking-event.entity.ts
│   │       │   │   └── shipment-location.entity.ts
│   │       │   ├── value-objects/
│   │       │   │   └── geo-point.vo.ts
│   │       │   ├── repositories/
│   │       │   │   ├── tracking-event.repository.interface.ts
│   │       │   │   └── shipment-location.repository.interface.ts
│   │       │   └── enums/
│   │       │       └── tracking-event-type.enum.ts
│   │       ├── infrastructure/
│   │       │   ├── persistence/
│   │       │   │   ├── schemas/
│   │       │   │   │   ├── tracking-event.schema.ts
│   │       │   │   │   └── shipment-location.schema.ts
│   │       │   │   ├── mongo-tracking-event.repository.ts
│   │       │   │   ├── mongo-shipment-location.repository.ts
│   │       │   │   └── mappers/
│   │       │   │       ├── tracking-event.mapper.ts
│   │       │   │       └── shipment-location.mapper.ts
│   │       │   └── websocket/
│   │       │       └── tracking.gateway.ts
│   │       ├── presentation/
│   │       │   └── tracking.controller.ts
│   │       └── tracking.module.ts
│   │
│   ├── grpc/
│   │   └── delivery.proto
│   │
│   └── config/
│       ├── app.config.ts
│       ├── mongodb.config.ts
│       ├── grpc.config.ts
│       ├── rabbitmq.config.ts
│       └── redis.config.ts
│
├── test/
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### MONGOOSE ŞEMALARI

Bu servis MongoDB kullanır. Mongoose şemaları şöyle olacak:

```typescript
// === SHIPMENT SCHEMA ===
// apps/delivery-service/src/modules/shipment/infrastructure/persistence/schemas/shipment.schema.ts

@Schema({ collection: 'shipments', timestamps: true })
export class ShipmentDocument {
  @Prop({ required: true, unique: true })
  shipmentNumber: string;  // SHP-YYYYMMDD-XXXXX

  @Prop({ required: true, enum: ShipmentType })
  type: string;  // ORDER, BARTER, RETURN

  @Prop({ required: true, enum: ShipmentStatus, default: 'PENDING' })
  status: string;

  // Referanslar (dış servislerden — sadece ID)
  @Prop({ required: true })
  orderId: string;  // Commerce order veya barter offer ID

  @Prop()
  barterSessionId?: string;  // Barter swap session ID (barter kargo ise)

  @Prop()
  barterPartNumber?: number;  // Barter part number (1 veya 2)

  @Prop({ required: true })
  senderId: string;  // userId veya vendorId

  @Prop({ required: true })
  receiverId: string;  // userId

  @Prop({ required: true })
  vendorId: string;

  // Adres bilgileri (embedded document)
  @Prop({ type: Object, required: true })
  senderAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    neighborhood?: string;
    postalCode?: string;
  };

  @Prop({ type: Object, required: true })
  receiverAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    neighborhood?: string;
    postalCode?: string;
  };

  // Kargo firması bilgileri
  @Prop({ enum: CarrierCode })
  carrierCode?: string;  // YURTICI, ARAS, MNG, PTT

  @Prop()
  carrierName?: string;

  @Prop()
  carrierTrackingNumber?: string;  // Kargo firmasının takip numarası

  @Prop()
  carrierTrackingUrl?: string;  // Takip URL'i

  // Paket bilgileri
  @Prop({ type: Object })
  packageInfo?: {
    weight: number;  // kg
    width: number;   // cm
    height: number;  // cm
    depth: number;   // cm
    description?: string;
    itemCount: number;
  };

  // Tahmini teslimat
  @Prop()
  estimatedDeliveryDate?: Date;

  @Prop()
  actualDeliveryDate?: Date;

  // Ücret
  @Prop({ type: Number, default: 0 })
  shippingCost: number;

  @Prop({ type: String, default: 'TRY' })
  currency: string;

  // Durum tarihleri
  @Prop()
  pickedUpAt?: Date;

  @Prop()
  inTransitAt?: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  failedAt?: Date;

  @Prop()
  returnRequestedAt?: Date;

  @Prop()
  returnedAt?: Date;

  @Prop()
  cancelledAt?: Date;

  // Hata/İptal bilgisi
  @Prop()
  failureReason?: string;

  @Prop()
  cancellationReason?: string;

  // Notlar
  @Prop()
  notes?: string;

  @Prop()
  deliveryNotes?: string;  // Teslimat notu ("kapıda bırakın" vs.)

  // Son konum (tracking'den güncellenir)
  @Prop({ type: Object })
  lastKnownLocation?: {
    type: 'Point';
    coordinates: [number, number];  // [longitude, latitude]
    updatedAt: Date;
    description?: string;
  };

  // Metadata
  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

// GeoJSON index
ShipmentSchema.index({ 'lastKnownLocation': '2dsphere' });
ShipmentSchema.index({ orderId: 1 });
ShipmentSchema.index({ barterSessionId: 1 });
ShipmentSchema.index({ senderId: 1 });
ShipmentSchema.index({ receiverId: 1 });
ShipmentSchema.index({ vendorId: 1 });
ShipmentSchema.index({ status: 1, createdAt: -1 });
ShipmentSchema.index({ carrierCode: 1, carrierTrackingNumber: 1 });
ShipmentSchema.index({ shipmentNumber: 1 }, { unique: true });


// === TRACKING EVENT SCHEMA ===
// apps/delivery-service/src/modules/tracking/infrastructure/persistence/schemas/tracking-event.schema.ts

@Schema({ collection: 'tracking_events', timestamps: true })
export class TrackingEventDocument {
  @Prop({ required: true })
  shipmentId: string;  // Shipment._id referansı

  @Prop({ required: true, enum: TrackingEventType })
  eventType: string;
  // CREATED, PROCESSING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY,
  // DELIVERY_ATTEMPT, DELIVERED, FAILED, RETURN_REQUESTED, RETURNING, RETURNED, CANCELLED

  @Prop({ required: true })
  description: string;  // "Kargo Yurtiçi Kargo'ya teslim edildi"

  @Prop({ type: Object })
  location?: {
    type: 'Point';
    coordinates: [number, number];
    city?: string;
    district?: string;
    facility?: string;  // "İstanbul Anadolu Dağıtım Merkezi"
  };

  @Prop()
  performedBy?: string;  // userId, system, carrier

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

TrackingEventSchema.index({ shipmentId: 1, createdAt: -1 });
TrackingEventSchema.index({ 'location': '2dsphere' });


// === SHIPMENT LOCATION SCHEMA (gerçek zamanlı konum) ===
// apps/delivery-service/src/modules/tracking/infrastructure/persistence/schemas/shipment-location.schema.ts

@Schema({ collection: 'shipment_locations', timestamps: true })
export class ShipmentLocationDocument {
  @Prop({ required: true, index: true })
  shipmentId: string;

  @Prop({ type: { type: String, default: 'Point' }, coordinates: [Number] })
  location: {
    type: 'Point';
    coordinates: [number, number];  // [longitude, latitude]
  };

  @Prop()
  speed?: number;  // km/h

  @Prop()
  heading?: number;  // derece (0-360)

  @Prop()
  accuracy?: number;  // metre
}

ShipmentLocationSchema.index({ location: '2dsphere' });
ShipmentLocationSchema.index({ shipmentId: 1, createdAt: -1 });
// TTL: 30 gün sonra otomatik sil (konum geçmişi çok büyüyebilir)
ShipmentLocationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
```

### gRPC PROTO

```protobuf
// apps/delivery-service/src/grpc/delivery.proto

syntax = "proto3";
package barterborsa.delivery;

service DeliveryService {
  // Kargo durumu sorgulama
  rpc GetShipment (GetShipmentRequest) returns (ShipmentResponse);
  rpc GetShipmentByOrder (GetShipmentByOrderRequest) returns (ShipmentListResponse);
  rpc GetShipmentByTracking (GetShipmentByTrackingRequest) returns (ShipmentResponse);

  // Kargo durumu güncelleme (backend'den çağrılır)
  rpc UpdateShipmentStatus (UpdateStatusRequest) returns (ShipmentResponse);
}

message GetShipmentRequest {
  string shipment_id = 1;
}

message GetShipmentByOrderRequest {
  string order_id = 1;
}

message GetShipmentByTrackingRequest {
  string tracking_number = 1;
}

message UpdateStatusRequest {
  string shipment_id = 1;
  string status = 2;
  string tracking_number = 3;
  string carrier_code = 4;
  string notes = 5;
}

message ShipmentResponse {
  string id = 1;
  string shipment_number = 2;
  string type = 3;
  string status = 4;
  string order_id = 5;
  string carrier_code = 6;
  string carrier_tracking_number = 7;
  string carrier_tracking_url = 8;
  string estimated_delivery_date = 9;
  string actual_delivery_date = 10;
}

message ShipmentListResponse {
  repeated ShipmentResponse shipments = 1;
}
```

### DOSYA LİSTESİ — HER BİRİNİN TAM İÇERİĞİNİ YAZ

Sıralama:

BÖLÜM 1 — PROJE KONFİGÜRASYONU:
- package.json (dependencies: @nestjs/core, @nestjs/platform-fastify, @nestjs/cqrs, @nestjs/mongoose,
  @nestjs/microservices, @nestjs/websockets, @nestjs/platform-socket.io, mongoose,
  @grpc/grpc-js, @grpc/proto-loader, socket.io, ioredis
  + workspace: @barterborsa/shared-core, shared-persistence, shared-messaging,
  shared-observability, shared-nest)
- tsconfig.json
- nest-cli.json (assets: proto dosyaları dist'e kopyalansın)
- main.ts:
  - NestFactory.create FastifyAdapter
  - gRPC microservice ekle (port 50052)
  - WebSocket adapter ekle
  - REST port: 3005
  - Global pipes, filters, interceptors
  - Graceful shutdown
- app.module.ts:
  - MongooseModule.forRootAsync (MONGODB_URI env)
  - RabbitMQModule
  - LoggerModule, HealthModule
  - ShipmentModule, TrackingModule
- Config dosyaları (app, mongodb, grpc, rabbitmq, redis)
- delivery.proto

BÖLÜM 2 — SHIPMENT DOMAIN:
- Enum'lar:
  - ShipmentStatus: PENDING, PROCESSING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY,
    DELIVERED, FAILED, RETURN_REQUESTED, RETURNING, RETURNED, CANCELLED
  - ShipmentType: ORDER, BARTER, RETURN
  - CarrierCode: YURTICI, ARAS, MNG, PTT, OTHER
- Value Objects:
  - TrackingNumber: format SHP-YYYYMMDD-XXXXX, unique
  - ShippingAddress: embedded address (fullName, phone, address fields)
  - CarrierInfo: carrierCode, carrierName, trackingNumber, trackingUrl
  - Dimensions: weight, width, height, depth
- Shipment entity (AggregateRoot):
  - static create(): status PENDING + ShipmentCreatedEvent
  - static createForBarter(barterSessionId, partNumber): barter kargo
  - process(): PENDING → PROCESSING
  - assignCarrier(carrierInfo): carrier bilgisi ekle
  - pickUp(): PROCESSING → PICKED_UP + ShipmentPickedUpEvent
  - transit(): → IN_TRANSIT + ShipmentInTransitEvent
  - outForDelivery(): → OUT_FOR_DELIVERY
  - deliver(): → DELIVERED + ShipmentDeliveredEvent (actualDeliveryDate set)
  - fail(reason): → FAILED + ShipmentFailedEvent
  - requestReturn(): DELIVERED → RETURN_REQUESTED
  - returnShipment(): → RETURNING → RETURNED + ShipmentReturnedEvent
  - cancel(reason): → CANCELLED
  - updateLocation(geoPoint): lastKnownLocation güncelle
- shipment-state-machine.service.ts:
  PENDING → [PROCESSING, CANCELLED]
  PROCESSING → [PICKED_UP, CANCELLED]
  PICKED_UP → [IN_TRANSIT, FAILED]
  IN_TRANSIT → [OUT_FOR_DELIVERY, DELIVERED, FAILED]
  OUT_FOR_DELIVERY → [DELIVERED, FAILED]
  DELIVERED → [RETURN_REQUESTED]
  RETURN_REQUESTED → [RETURNING]
  RETURNING → [RETURNED, FAILED]
- Events + Repository interface

BÖLÜM 3 — SHIPMENT APPLICATION:
- DTOs (create, assign-carrier, update-status, response, detail-response, list-response)
- shipment-number.service.ts: SHP-YYYYMMDD-XXXXX format
- estimated-delivery.service.ts: city bazlı tahmini teslimat (İstanbul→İstanbul: 1 gün, farklı şehir: 2-3 gün)
- Commands:
  - create-shipment: orderId, senderId, receiverId, addresses, packageInfo → Shipment.create()
  - create-barter-shipments: barterSessionId, initiator/receiver info → 2 shipment oluştur
  - assign-carrier: carrierCode + carrier adapter ile tracking number al
  - pick-up-shipment: status PICKED_UP
  - update-shipment-status: genel durum güncelleme
  - deliver-shipment: status DELIVERED + shipment.delivered event publish
  - fail-shipment: status FAILED + reason
  - request-return-shipment: DELIVERED → RETURN_REQUESTED
  - cancel-shipment: status CANCELLED + reason
- Queries:
  - get-shipment: id ile
  - get-shipment-by-tracking: trackingNumber ile
  - list-shipments: paginated, filter (status, type, carrier, dateRange, vendorId)
  - get-shipments-by-order: orderId ile (bir siparişin tüm kargoları)
  - get-barter-shipments: barterSessionId ile (barter'ın iki kargosu)
- Event Handlers (RabbitMQ'dan dinle):
  - order-created: COMMERCE_EXCHANGE, order.created → CreateShipment dispatch
  - order-cancelled: order.cancelled → CancelShipment dispatch
  - barter-accepted: BARTER_EXCHANGE, offer.accepted → CreateBarterShipments dispatch
  - order-shipped: commerce.events, order.shipped → AssignCarrier + PickUp

BÖLÜM 4 — SHIPMENT INFRASTRUCTURE:
- Mongoose schema (yukarıda tanımlı)
- mongo-shipment.repository.ts (BaseMongoRepository<Shipment>'den türer):
  - findByShipmentNumber
  - findByOrderId
  - findByBarterSessionId
  - findByTrackingNumber (carrierCode + carrierTrackingNumber)
  - search: paginated + filter (status, type, carrier, dateRange, vendorId, senderId, receiverId)
  - updateLocation: lastKnownLocation güncelle
  - findNearby(lat, lng, radiusKm): GeoJSON $nearSphere sorgusu
- shipment.mapper.ts: Document ↔ Domain entity
- Carrier adaptörleri:
  - carrier.interface.ts:
    interface ICarrierAdapter {
      createShipment(shipment: Shipment): Promise<{ trackingNumber: string; trackingUrl: string }>;
      getTrackingInfo(trackingNumber: string): Promise<TrackingInfo>;
      cancelShipment(trackingNumber: string): Promise<boolean>;
      getTrackingUrl(trackingNumber: string): string;
    }
  - carrier.factory.ts: CarrierCode'a göre doğru adapter'ı döndür
  - yurtici.adapter.ts: Mock — trackingUrl: `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${trackingNumber}`
  - aras.adapter.ts: Mock — trackingUrl: `https://kargotakip.araskargo.com.tr/mainpage.aspx?code=${trackingNumber}`
  - mng.adapter.ts: Mock — trackingUrl: `https://www.mngkargo.com.tr/gonderi-takip/?code=${trackingNumber}`
  - ptt.adapter.ts: Mock — trackingUrl: `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${trackingNumber}`
- shipment-event.publisher.ts:
  - DELIVERY_EXCHANGE = 'delivery.events'
  - publishShipmentCreated, publishShipmentPickedUp, publishShipmentInTransit,
    publishShipmentDelivered, publishShipmentFailed, publishShipmentReturned

BÖLÜM 5 — SHIPMENT PRESENTATION:
- shipment.controller.ts:
  - GET /shipments — paginated list (filter: status, type, carrier)
  - GET /shipments/:id — detay
  - GET /shipments/tracking/:number — tracking number ile ara
  - GET /shipments/order/:orderId — siparişe ait kargolar
  - GET /shipments/barter/:sessionId — barter session'a ait kargolar
  - POST /shipments — yeni kargo oluştur (admin/system)
  - PATCH /shipments/:id/carrier — carrier ata
  - PATCH /shipments/:id/status — durum güncelle
- shipment.grpc.controller.ts: gRPC DeliveryService implementasyonu
- shipment-admin.controller.ts: @Roles('ADMIN'), tüm kargolar, durum değiştir, istatistikler

BÖLÜM 6 — TRACKING MODULE:
- TrackingEventType enum: CREATED, PROCESSING, PICKED_UP, DEPARTED_FACILITY,
  ARRIVED_FACILITY, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERY_ATTEMPT,
  DELIVERED, FAILED, RETURN_REQUESTED, RETURNING, RETURNED, CANCELLED, LOCATION_UPDATE
- TrackingEvent entity + ShipmentLocation entity
- GeoPoint value object: { type: 'Point', coordinates: [lng, lat] }
- Mongoose schemas (yukarıda tanımlı) — TrackingEvent + ShipmentLocation (TTL 30 gün)
- Repositories (Mongo)
- Commands:
  - add-tracking-event: shipmentId, eventType, description, location → tracking event kaydet
  - update-location: shipmentId, lat, lng, speed, heading → location kaydet + shipment.lastKnownLocation güncelle
- Queries:
  - get-tracking-events: shipmentId ile tüm event'ler (kronolojik)
  - get-current-location: shipmentId ile son konum
- WebSocket Gateway (tracking.gateway.ts):
  - @WebSocketGateway({ namespace: '/tracking' })
  - handleConnection: client shipmentId ile subscribe olur
  - Room-based: her shipment kendi room'u (shipment:{id})
  - Location update geldiğinde ilgili room'a broadcast
  - Event: 'tracking:update' → { shipmentId, location, eventType, description, timestamp }
  - Event: 'location:update' → { shipmentId, lat, lng, speed, timestamp }
- tracking.controller.ts:
  - GET /tracking/:shipmentId/events — tracking event listesi
  - GET /tracking/:shipmentId/location — son konum
  - POST /tracking/:shipmentId/events — yeni event ekle (carrier webhook simülasyonu)
  - POST /tracking/:shipmentId/location — konum güncelle (courier app simülasyonu)

BÖLÜM 7 — MODULE REGISTRATION + DOCKER:
- shipment.module.ts
- tracking.module.ts
- app.module.ts güncellemesi

Docker Compose'a delivery-service eklenmeli (infra/docker-compose.yml'e Faz 1'de eklenmişti zaten).

### EK GÖREV

Tüm dosyaları yazdıktan sonra `pnpm build` hatasız derlenmesi için gereken adımları listele.

### KONTROL

1. `any` tipi SIFIR mı? (grep ile kontrol)
2. Mongoose şemalarında timestamps: true var mı?
3. GeoJSON 2dsphere index tanımlı mı?
4. ShipmentLocation TTL (30 gün) tanımlı mı?
5. State machine geçişleri doğru mu?
6. WebSocket room-based broadcast çalışıyor mu?
7. Carrier factory doğru adapter'ı döndürüyor mu?
8. RabbitMQ event handler'ları doğru exchange/routing key dinliyor mu?
9. gRPC proto ile controller uyumlu mu?
10. TrackingNumber formatı SHP-YYYYMMDD-XXXXX mi?
11. Barter kargo: iki ayrı shipment oluşturuluyor mu?
12. TypeScript strict mode derlenir mi?

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

Parçalı verme planı:

- Birinci mesaj: System prompt + BÖLÜM 1 (Proje konfigürasyonu + proto)
- İkinci mesaj: BÖLÜM 2 + 3 (Shipment Domain + Application)
- Üçüncü mesaj: BÖLÜM 4 + 5 (Shipment Infrastructure + Presentation)
- Dördüncü mesaj: BÖLÜM 6 + 7 (Tracking Module + Module Registration)

Her parçada system prompt'u TEKRAR VER.

KRİTİK FARKLILIKLARI VURGULA:
- Bu servis MONGOOSE kullanıyor, PRISMA DEĞİL
- BaseMongoRepository kullanılıyor, BasePrismaRepository DEĞİL
- @Schema() ve @Prop() decorator'ları, Prisma model DEĞİL
- MongoDB'ye özgü: GeoJSON, 2dsphere index, TTL index, embedded documents
- WebSocket ile real-time tracking — HTTP polling DEĞİL
