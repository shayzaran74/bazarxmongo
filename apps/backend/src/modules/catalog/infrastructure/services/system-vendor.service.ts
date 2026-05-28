// apps/backend/src/modules/catalog/infrastructure/services/system-vendor.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IVendor, ICompany } from '@barterborsa/shared-persistence';
import { IdentityPublicService } from '@barterborsa/domain-identity';

@Injectable()
export class SystemVendorService implements OnModuleInit {
  private readonly logger = new Logger(SystemVendorService.name);
  private systemVendorId: string | null = null;

  constructor(
    @InjectModel('Vendor')  private readonly vendorModel:  Model<IVendor>,
    @InjectModel('Company') private readonly companyModel: Model<ICompany>,
    private readonly identityPublic: IdentityPublicService,
  ) {}

  async onModuleInit() {
    try {
      await this.refreshSystemVendorId();
    } catch (error: unknown) {
      this.logger.warn(`SystemVendorService: Initial setup failed: ${error instanceof Error ? error.message : 'unknown'}`);
    }
  }

  async refreshSystemVendorId() {
    const v = await this.vendorModel.findOne({ companyId: 'bazarx-system-company' }, { id: 1 }).lean();
    this.systemVendorId = v ? v.id : await this.createSystemVendor();
  }

  getSystemVendorId(): string {
    if (!this.systemVendorId) {
      this.logger.warn('SystemVendorService: systemVendorId requested but not yet initialized');
      return '';
    }
    return this.systemVendorId;
  }

  private async createSystemVendor(): Promise<string> {
    const companyId = 'bazarx-system-company';
    await this.companyModel.findOneAndUpdate(
      { id: companyId },
      { $setOnInsert: { _id: companyId, id: companyId, name: 'BazarX Sistem', status: 'APPROVED', vatRate: 20 } },
      { upsert: true, setDefaultsOnInsert: true },
    );

    const admin = await this.identityPublic.findFirstAdmin();
    if (!admin) {
      this.logger.error('CRITICAL: No admin user found for system vendor. Seed the database!');
      return '';
    }

    const newId = new Types.ObjectId().toString();
    await this.vendorModel.create([{
      _id: newId, id: newId, userId: admin.id, companyId,
      status: 'APPROVED', slug: 'bazarx-sistem-core',
    }]);

    return newId;
  }
}
