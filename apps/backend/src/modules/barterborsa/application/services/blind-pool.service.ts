// apps/backend/src/modules/barterborsa/application/services/blind-pool.service.ts
// Master Plan v4.3 §4 — BarterBorsa Kör Havuz + Akıllı Kota
// ADR-005 Faz 2c: Prisma → Mongoose (Phase 3 transaction pattern)

import { Injectable, BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { WatchtowerService } from '../../../barter/application/services/watchtower.service';
import { MongoBlindPoolRepository } from '../../infrastructure/persistence/mongo-blind-pool.repository';
import { MongoBlindPoolEntryRepository } from '../../infrastructure/persistence/mongo-blind-pool-entry.repository';
import { MongoVendorB2BDataRepository } from '../../infrastructure/persistence/mongo-vendor-b2b-data.repository';
import { MongoListingRepository } from '../../../catalog/infrastructure/persistence/mongo-listing.repository';
import { MongoVendorRepository } from '../../../vendor/infrastructure/persistence/mongo-vendor.repository';

const SMART_CAP_PCT = 0.25; // Tek işlemde max %25
const POOL_ACCESS_STATUSES = ['ACTIVE', 'GRACE_PERIOD'] as const;

@Injectable()
export class BlindPoolService {
  private readonly logger = new Logger(BlindPoolService.name);

  constructor(
    private readonly poolRepo:    MongoBlindPoolRepository,
    private readonly entryRepo:   MongoBlindPoolEntryRepository,
    private readonly b2bDataRepo: MongoVendorB2BDataRepository,
    private readonly listingRepo: MongoListingRepository,
    private readonly vendorRepo:   MongoVendorRepository,
    private readonly watchtower:  WatchtowerService,
    @InjectConnection() private readonly connection:  Connection,
  ) {}

  async createPool(data: {
    groupId:   string;
    name:      string;
    vendorId:  string;
    listingId: string;
    quantity:  number;
  }): Promise<string> {
    const listing = await this.listingRepo.findById(data.listingId);
    if (!listing || listing.vendorId !== data.vendorId) {
      throw new NotFoundException('İlan bulunamadı veya bu vendor\'a ait değil');
    }

    const session = await this.connection.startSession();
    try {
      let createdPoolId = '';
      await session.withTransaction(async () => {
        const pool = await this.poolRepo.createWithSession(session, {
          groupId:         data.groupId,
          name:            data.name,
          totalStock:      data.quantity,
          availableStock:  data.quantity,
          smartCapPct:     SMART_CAP_PCT * 100,
          isActive:        true,
        });

        await this.entryRepo.createWithSession(session, {
          poolId:    pool.id,
          vendorId:  data.vendorId,
          listingId: data.listingId,
          quantity:  data.quantity,
        });

        createdPoolId = pool.id;
        this.logger.log('Blind Pool oluşturuldu', { poolId: pool.id, name: data.name });
      });
      return createdPoolId;
    } finally {
      await session.endSession();
    }
  }

  async requestFromPool(data: {
    poolId:   string;
    vendorId: string;
    quantity: number;
  }): Promise<{ approved: boolean; maxAllowed: number; requestedQty: number }> {
    await this.assertActiveSubscription(data.vendorId);

    const pool = await this.poolRepo.findById(data.poolId);
    if (!pool || !pool.isActive) throw new NotFoundException('Havuz bulunamadı veya aktif değil');

    const total      = Number(pool.totalStock);
    const available  = Number(pool.availableStock);
    const capPct     = Number(pool.smartCapPct) / 100;
    const maxAllowed  = Math.floor(total * capPct);

    const violated = await this.watchtower.checkSmartCap(data.poolId, data.vendorId, data.quantity);
    if (violated) {
      return { approved: false, maxAllowed, requestedQty: data.quantity };
    }

    if (data.quantity > available) {
      throw new BadRequestException(`Havuzda yeterli stok yok (mevcut: ${available})`);
    }

    const ownEntry = await this.entryRepo.findByPoolAndVendor(data.poolId, data.vendorId);
    if (ownEntry) {
      throw new BadRequestException('Kendi havuzunuzdan talep edemezsiniz (Blind Pool kuralı)');
    }

    await this.poolRepo.updateStock(data.poolId, data.quantity);

    return { approved: true, maxAllowed, requestedQty: data.quantity };
  }

  async getPoolView(poolId: string, requestingVendorId: string) {
    const pool = await this.poolRepo.findById(poolId);
    if (!pool) throw new NotFoundException('Havuz bulunamadı');

    const entries = await this.entryRepo.findByPoolId(poolId);
    const total    = Number(pool.totalStock);
    const maxOrder = Math.floor(total * (Number(pool.smartCapPct) / 100));

    return {
      id:             pool.id,
      name:           pool.name,
      totalStock:     total,
      availableStock:  Number(pool.availableStock),
      maxOrderQty:    maxOrder,
      isActive:       pool.isActive,
      items: entries.map((e) => ({
        listingTitle: e.listingId,
        quantity:     Number(e.quantity),
        isOwnEntry:   e.vendorId === requestingVendorId,
      })),
    };
  }

  async listGroupPools(groupId: string) {
    const pools = await this.poolRepo.findByGroupId(groupId);

    return pools.map((p) => ({
      id:              p.id,
      name:            p.name,
      totalStock:      Number(p.totalStock),
      availableStock:  Number(p.availableStock),
      utilizationPct:  Math.round(((Number(p.totalStock) - Number(p.availableStock)) / Number(p.totalStock)) * 100),
      smartCapMaxQty:  Math.floor(Number(p.totalStock) * (Number(p.smartCapPct) / 100)),
    }));
  }

  private async assertActiveSubscription(vendorId: string): Promise<void> {
    const b2bData = await this.b2bDataRepo.findByVendorId(vendorId);

    if (!b2bData || b2bData.b2bTier === 'NONE') {
      throw new ForbiddenException(
        'Bu vendor B2B üyesi değil. Havuza erişmek için TicariTakas üyeliği zorunludur.',
      );
    }

    if (!POOL_ACCESS_STATUSES.includes(b2bData.subscriptionStatus as 'ACTIVE' | 'GRACE_PERIOD')) {
      throw new ForbiddenException(
        'Aidat ödemesi aktif değil. Tedarik havuzuna erişim için yıllık aidatınızı yenileyin.',
      );
    }

    if (b2bData.subscriptionExpiresAt && b2bData.subscriptionExpiresAt < new Date()) {
      await this.b2bDataRepo.updateSubscriptionStatus(vendorId, 'EXPIRED');
      throw new ForbiddenException(
        'Aidat süresi doldu. Tedarik havuzuna erişim için aidatınızı yenileyin.',
      );
    }
  }
}