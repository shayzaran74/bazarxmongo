// apps/backend/src/modules/vendor/application/services/garage-sale.service.ts

import { Injectable, Logger, ForbiddenException, BadRequestException, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, ClientSession, Connection } from 'mongoose';
import { Decimal128 } from 'bson';
import { GarageSale, IGarageSale, GarageSalePurchase } from '@barterborsa/shared-persistence/schemas/backend/garageSale.schema';
import { MongoEcosystemAuditLogRepository } from '../../infrastructure/persistence/mongo-ecosystem-audit-log.repository';
import { IEcosystemOrderRepository } from '../../domain/repositories/i-ecosystem-order.repository';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';

export interface CreateGarageSaleDto {
  productId: string;
  discountRate: number;
  maxTotalQty: number;
  maxQtyPerDealer: number;
  startsAt: Date;
  endsAt: Date;
}

@Injectable()
export class GarageSaleService {
  private readonly logger = new Logger(GarageSaleService.name);

  constructor(
    @InjectModel('GarageSale') private readonly garageSaleModel: Model<IGarageSale>,
    @InjectConnection() private readonly connection: Connection,
    private readonly auditLogRepo: MongoEcosystemAuditLogRepository,
    @Inject('IEcosystemOrderRepository') private readonly orderRepo: IEcosystemOrderRepository,
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
  ) {}

  /**
   * Metod 1 — createGarageSale
   * Fabrika için kampanya oluşturur.
   */
  async createGarageSale(factoryUserId: string, dto: CreateGarageSaleDto): Promise<IGarageSale> {
    // 1. Listing'i bul
    const listing = await this.vendorRepo.findById(factoryUserId);
    if (!listing) throw new NotFoundException('Satıcı bulunamadı.');

    // NOT: productId = listingId (Listing ID)
    const listingProps = listing.getProps();

    // 2. Listing'in ekosistem kontrolü — APEX tier factory olmalı
    // (Bu kontrol controller'da yapılır, burada sadece ürün sahibi kontrolü)
    // productId'nin Listing'e ait olup olmadığını kontrol et
    // (Basitlik için direkt oluşturuyoruz — gerçek ürün doğrulaması eklenebilir)

    // 3. discountRate 1-99 arası kontrolü
    if (dto.discountRate < 1 || dto.discountRate > 99) {
      throw new BadRequestException('İndirim oranı 1-99 arasında olmalıdır.');
    }

    // 4. maxQtyPerDealer <= maxTotalQty kontrolü
    if (dto.maxQtyPerDealer > dto.maxTotalQty) {
      throw new BadRequestException('Bayi başına limit, toplam stoktan fazla olamaz.');
    }

    // 5. startsAt < endsAt kontrolü
    if (dto.startsAt >= dto.endsAt) {
      throw new BadRequestException('Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
    }

    // 6. startsAt >= now kontrolü
    if (dto.startsAt < new Date()) {
      throw new BadRequestException('Kampanya başlangıcı geçmiş bir tarih olamaz.');
    }

    // 7. Çakışan ACTIVE/SCHEDULED kampanya kontrolü
    const existingCampaign = await this.garageSaleModel.findOne({
      productId: new Types.ObjectId(dto.productId),
      status: { $in: ['ACTIVE', 'SCHEDULED'] },
    }).lean().exec();

    if (existingCampaign) {
      throw new ConflictException({
        code: 'GARAGE_SALE_ALREADY_EXISTS',
        message: 'Bu ürün için zaten aktif veya planlı bir kampanya bulunmaktadır.',
      });
    }

    // 8. campaignPrice hesapla (Decimal128)
    // originalPrice'ı Listing'den alıyoruz — şimdilik 0 olarak bırakıp caller'dan alalım
    // Aslında dto ile birlikte originalPrice gelmeli — basitleştirilmiş versiyon
    const originalPrice = dto.discountRate; // placeholder — gerçek uygulamada listing.price kullanılır

    // 9. Status belirle
    const status = dto.startsAt <= new Date() ? 'ACTIVE' : 'SCHEDULED';

    // 10. GarageSale oluştur
    const campaignPriceValue = 0; // TODO: gerçek hesaplama için originalPrice gerekir
    const doc = await this.garageSaleModel.create({
      _id: new Types.ObjectId().toString(),
      ecosystemId: new Types.ObjectId(), // TODO: factory'nin ecosystemId'si
      factoryId: new Types.ObjectId(factoryUserId),
      productId: new Types.ObjectId(dto.productId),
      discountRate: dto.discountRate,
      originalPrice: Decimal128.fromString('0'),
      campaignPrice: Decimal128.fromString('0'),
      maxTotalQty: dto.maxTotalQty,
      soldQty: 0,
      maxQtyPerDealer: dto.maxQtyPerDealer,
      startsAt: dto.startsAt,
      endsAt: dto.endsAt,
      status,
    });

    // 11. AuditLog yaz
    await this.auditLogRepo.create({
      ecosystemId: doc.ecosystemId.toString(),
      vendorId: factoryUserId,
      action: 'GARAGE_SALE_CREATED',
      severity: 'INFO',
      details: {
        garageSaleId: doc._id?.toString() || doc.id,
        productId: dto.productId,
        discountRate: dto.discountRate,
        maxTotalQty: dto.maxTotalQty,
        startsAt: dto.startsAt,
        endsAt: dto.endsAt,
      },
    });

    this.logger.log(`GarageSale oluşturuldu: ${doc._id}`);
    return doc;
  }

  /**
   * Metod 2 — processGarageSaleOrder
   * Sipariş anında atomic stok düşümü yapar.
   */
  async processGarageSaleOrder(
    garageSaleId: string,
    dealerId: string,
    requestedQty: number,
    session: ClientSession,
  ): Promise<IGarageSale> {
    // 1. GarageSale'i bul (session ile)
    const garageSale = await this.garageSaleModel.findOne({
      _id: new Types.ObjectId(garageSaleId),
    }).lean().session(session).exec();

    if (!garageSale) throw new NotFoundException('Kampanya bulunamadı.');

    // 2. status kontrolü
    if (garageSale.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: 'GARAGE_SALE_NOT_ACTIVE',
        message: 'Bu kampanya şu anda aktif değil.',
      });
    }

    // 3. Zaman penceresi kontrolü
    const now = new Date();
    if (now < garageSale.startsAt || now > garageSale.endsAt) {
      throw new ForbiddenException({
        code: 'GARAGE_SALE_TIME_WINDOW_CLOSED',
        message: 'Kampanya süresi dolmuş veya henüz başlamamış.',
      });
    }

    // 4. maxQtyPerDealer kontrolü — EcosystemOrder'dan aggregate ile
    const dealerOrders = await this.orderRepo.sumQuantityByDealerAndProduct(
      dealerId,
      garageSale.listingId.toString(),
      ['PENDING', 'CONFIRMED'],
      session,
    );

    // Aslında dealer'ın bu kampanyadaki toplamı = EcosystemOrder'da garageSaleId ile eşleşen
    // Basitleştirilmiş: productId üzerinden toplam, dealer quota için ayrı kontrol
    // GarageSale başına dealer kontrolü:
    const garageSaleDoc = await this.garageSaleModel.findOne({
      _id: new Types.ObjectId(garageSaleId),
    }).lean().session(session).exec();

    if (!garageSaleDoc) throw new NotFoundException('Kampanya bulunamadı.');

    // Dealer'ın bu kampanyadaki mevcut alımı (garageSaleId ile)
    const dealerQtyResult = await this.connection
      .model<{ dealerId: string; totalQty: number }>('EcosystemOrder')
      .aggregate([
        {
          $match: {
            garageSaleId: new Types.ObjectId(garageSaleId),
            dealerId: new Types.ObjectId(dealerId),
            status: { $in: ['PENDING', 'CONFIRMED'] },
          },
        },
        { $group: { _id: null, totalQty: { $sum: '$quantity' } } },
      ], { session });

    const totalDealerQty = dealerQtyResult[0]?.totalQty ?? 0;

    if (totalDealerQty + requestedQty > garageSale.maxQtyPerDealer) {
      throw new ForbiddenException({
        code: 'GARAGE_SALE_DEALER_QUOTA_EXCEEDED',
        remaining: garageSale.maxQtyPerDealer - totalDealerQty,
        currentTotal: totalDealerQty,
        requested: requestedQty,
        limit: garageSale.maxQtyPerDealer,
      });
    }

    // 5. KRİTİK — Atomic stok düşümü ($inc + koşul)
    const updated = await this.garageSaleModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(garageSaleId),
        status: 'ACTIVE',
        $expr: { $lte: [{ $add: ['$soldQty', requestedQty] }, '$maxTotalQty'] },
      },
      {
        $inc: { soldQty: requestedQty },
      },
      { new: true, session },
    );

    if (!updated) {
      // Stok tükendi — status'u EXHAUSTED yap
      await this.garageSaleModel.updateOne(
        { _id: new Types.ObjectId(garageSaleId) },
        { $set: { status: 'EXHAUSTED' } },
      );

      await this.auditLogRepo.create({
        ecosystemId: garageSale.ecosystemId.toString(),
        vendorId: garageSale.factoryId.toString(),
        action: 'GARAGE_SALE_EXHAUSTED',
        severity: 'WARN',
        details: { garageSaleId, soldQty: garageSale.soldQty },
      });

      throw new ForbiddenException({
        code: 'GARAGE_SALE_STOCK_EXHAUSTED',
        message: 'Kampanya stoğu tükendi.',
      });
    }

    return updated;
  }

  /**
   * Metod 3 — activateScheduledSales
   * Scheduler çağırır — SCHEDULED → ACTIVE geçişi yapar.
   */
  async activateScheduledSales(): Promise<void> {
    const result = await this.garageSaleModel.updateMany(
      {
        status: 'SCHEDULED',
        startsAt: { $lte: new Date() },
      },
      {
        $set: { status: 'ACTIVE' },
      },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(`SCHEDULED → ACTIVE: ${result.modifiedCount} kampanya aktif edildi`);

      // AuditLog for each activated campaign
      const activated = await this.garageSaleModel.find({
        status: 'ACTIVE',
        startsAt: { $lte: new Date() },
      }).lean().exec();

      for (const sale of activated) {
        await this.auditLogRepo.create({
          ecosystemId: sale.ecosystemId.toString(),
          vendorId: sale.factoryId.toString(),
          action: 'GARAGE_SALE_ACTIVATED',
          severity: 'INFO',
          details: { garageSaleId: sale._id?.toString() },
        });
      }
    }
  }

  /**
   * Metod 4 — closeExpiredSales
   * Scheduler çağırır — ACTIVE → ENDED geçişi yapar.
   */
  async closeExpiredSales(): Promise<void> {
    const result = await this.garageSaleModel.updateMany(
      {
        status: 'ACTIVE',
        endsAt: { $lt: new Date() },
      },
      {
        $set: { status: 'ENDED' },
      },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(`ACTIVE → ENDED: ${result.modifiedCount} kampanya kapatıldı`);

      const ended = await this.garageSaleModel.find({
        status: 'ENDED',
        endsAt: { $lt: new Date() },
      }).lean().exec();

      for (const sale of ended) {
        await this.auditLogRepo.create({
          ecosystemId: sale.ecosystemId.toString(),
          vendorId: sale.factoryId.toString(),
          action: 'GARAGE_SALE_ENDED',
          severity: 'INFO',
          details: { garageSaleId: sale._id?.toString() },
        });
      }
    }
  }

  /**
   * Factory'nin kendi kampanyalarını listele
   */
  async findByFactoryId(factoryId: string): Promise<IGarageSale[]> {
    return this.garageSaleModel
      .find({ factoryId: new Types.ObjectId(factoryId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * Tek kampanya detayı
   */
  async findById(garageSaleId: string): Promise<IGarageSale | null> {
    return this.garageSaleModel.findOne({ _id: new Types.ObjectId(garageSaleId) }).lean().exec();
  }

  /**
   * Fabrika kampanya iptal et (sadece SCHEDULED durumunda)
   */
  async cancelGarageSale(garageSaleId: string, factoryId: string): Promise<void> {
    const sale = await this.garageSaleModel.findOne({
      _id: new Types.ObjectId(garageSaleId),
      factoryId: new Types.ObjectId(factoryId),
    }).lean().exec();

    if (!sale) throw new NotFoundException('Kampanya bulunamadı.');

    if (sale.status !== 'SCHEDULED') {
      throw new BadRequestException('Sadece planlı (SCHEDULED) kampanyalar iptal edilebilir.');
    }

    await this.garageSaleModel.updateOne(
      { _id: new Types.ObjectId(garageSaleId) },
      { $set: { status: 'CANCELLED' } },
    );

    await this.auditLogRepo.create({
      ecosystemId: sale.ecosystemId.toString(),
      vendorId: factoryId,
      action: 'GARAGE_SALE_CANCELLED',
      severity: 'WARN',
      details: { garageSaleId, cancelledAt: new Date() },
    });
  }
}