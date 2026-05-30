// apps/backend/src/database/migrations/2026-05-30-company-verified-to-approved-backfill.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { ICompany } from '@barterborsa/shared-persistence';

/**
 * Company statü düzeltme migration'ı:
 * Eski ApproveVendorHandler enum dışı 'VERIFIED' yazıyordu. CompanyStatus enum'u
 * yalnızca PENDING|APPROVED|REJECTED|SUSPENDED kabul eder. Bu backfill, geçmişte
 * onaylanmış firmaların 'VERIFIED' statüsünü 'APPROVED'a çevirir; aksi halde yeni
 * firma onay duvarı bu firmaları yanlışlıkla engeller.
 */
@Injectable()
export class CompanyVerifiedToApprovedBackfill {
  private readonly logger = new Logger(CompanyVerifiedToApprovedBackfill.name);

  constructor(
    @InjectModel('Company') private readonly companyModel: Model<ICompany>,
  ) {}

  async run(): Promise<{ updated: number }> {
    const result = await this.companyModel
      .updateMany(
        { status: 'VERIFIED' },
        { $set: { status: 'APPROVED' } },
      )
      .exec();

    const updated = result.modifiedCount ?? 0;
    this.logger.log(`Company statü backfill tamamlandı: ${updated} firma 'VERIFIED' → 'APPROVED'`);
    return { updated };
  }
}
