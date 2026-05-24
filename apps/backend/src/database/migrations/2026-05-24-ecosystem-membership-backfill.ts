// apps/backend/src/database/migrations/2026-05-24-ecosystem-membership-backfill.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import type { IVendor } from '@barterborsa/shared-persistence';
import type { IEcosystemMembership } from '../../modules/vendor/infrastructure/persistence/schemas/ecosystemMembership.schema';
import { EcosystemMembership } from '../../modules/vendor/infrastructure/persistence/schemas/ecosystemMembership.schema';

/**
 * Sprint 1 backfill migration:
 * Mevcut vendors.ecosystemId alanını ecosystem_memberships koleksiyonuna taşır.
 * Geçiş dönemi için tutulur — vendors.ecosystemId Sprint 2'de silinecek.
 */
@Injectable()
export class EcosystemMembershipBackfill {
  private readonly logger = new Logger(EcosystemMembershipBackfill.name);

  constructor(
    @InjectModel('Vendor') private readonly vendorModel: Model<IVendor>,
    private readonly connection: Connection,
  ) {}

  async run(): Promise<{ processed: number; skipped: number }> {
    // Sadece ecosystemId'si olan vendor'ları bul
    const vendorsWithEcosystem = await this.vendorModel
      .find({ ecosystemId: { $exists: true, $ne: null } })
      .lean()
      .exec();

    this.logger.log(`Backfill: ${vendorsWithEcosystem.length} vendor bulundu`);

    let processed = 0;
    let skipped = 0;

    for (const vendor of vendorsWithEcosystem) {
      const ecosystemId = vendor.ecosystemId as string;
      if (!ecosystemId) { skipped++; continue; }

      // Zaten membership kaydı var mı kontrol et
      const existing = await this.connection
        .model<IEcosystemMembership>('EcosystemMembership')
        .findOne({
          dealerId: new Types.ObjectId(vendor.id || (vendor as any)._id),
          ecosystemId: new Types.ObjectId(ecosystemId),
        })
        .lean()
        .exec();

      if (existing) {
        this.logger.debug(`Atlanan (zaten var): vendor=${vendor.id}`);
        skipped++;
        continue;
      }

      // Yeni membership kaydı oluştur
      await this.connection
        .model<IEcosystemMembership>('EcosystemMembership')
        .create({
          _id: new Types.ObjectId().toString(),
          dealerId: new Types.ObjectId(vendor.id || (vendor as any)._id),
          ecosystemId: new Types.ObjectId(ecosystemId),
          status: 'ACTIVE',
          joinedAt: (vendor as any).updatedAt || (vendor as any).createdAt || new Date(),
          addedByUserId: new Types.ObjectId(vendor.id || (vendor as any)._id),
        });

      processed++;
      this.logger.debug(`Backfill edildi: vendor=${vendor.id} → ecosystem=${ecosystemId}`);
    }

    this.logger.log(`Backfill tamamlandı: ${processed} işlendi, ${skipped} atlandı`);
    return { processed, skipped };
  }
}