// apps/backend/src/modules/barter/application/services/barter-vendor-guard.service.ts
// Barter firma onay duvarı (barter-audit kural #1/A) — tek kaynak.
// surplus.controller ve offers.controller bu servisi kullanır (DRY).

import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICompany } from '@barterborsa/shared-persistence';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';

export interface ApprovedVendorWithCompany {
  id: string;
  status: string;
  barterEnabled: boolean;
  ecosystemId?: string;
  company: { id: string; name: string; status: string };
}

@Injectable()
export class BarterVendorGuardService {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @InjectModel('Company') private readonly companyModel: Model<ICompany>,
  ) {}

  /**
   * İşlem yapan kullanıcının onaylı satıcı (APPROVED) + barter aktif + onaylı firmaya
   * (company.status === 'APPROVED') sahip olduğunu doğrular. Aksi halde BadRequestException.
   */
  async requireApprovedVendorWithCompany(userId: string): Promise<ApprovedVendorWithCompany> {
    const vendor = await this.vendorRepository.findByUserId(userId);
    if (!vendor) {
      throw new BadRequestException('Satıcı profiliniz bulunamadı.');
    }
    const props = vendor.getProps();
    if (props.status !== 'APPROVED') {
      throw new BadRequestException('Satıcı hesabınız henüz onaylanmamış.');
    }
    if (!props.barterEnabled) {
      throw new BadRequestException('Takas (barter) modülü hesabınız için aktif değil.');
    }
    if (!props.companyId) {
      throw new BadRequestException('Satıcı hesabınıza bağlı bir firma bulunamadı.');
    }

    const companyDoc = await this.companyModel.findOne({ id: props.companyId }).lean().exec();
    if (!companyDoc) {
      throw new BadRequestException('Firma kaydınız bulunamadı.');
    }
    if (companyDoc.status !== 'APPROVED') {
      throw new BadRequestException('Firmanız henüz onaylanmamış. Takas işlemleri için firma onayı gereklidir.');
    }

    return {
      id: vendor.id,
      status: props.status,
      barterEnabled: props.barterEnabled ?? false,
      ecosystemId: props.ecosystemId,
      company: { id: companyDoc.id, name: companyDoc.name ?? '', status: companyDoc.status },
    };
  }
}
