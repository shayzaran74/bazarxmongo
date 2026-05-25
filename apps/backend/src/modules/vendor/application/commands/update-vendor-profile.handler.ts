// apps/backend/src/modules/vendor/application/commands/update-vendor-profile.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IVendorProfile } from '@barterborsa/shared-persistence';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { UpdateVendorProfileCommand } from './update-vendor-profile.command';
import { AuditLogService } from '../../../audit/application/audit-log.service';

// Güncellenebilir profil alanları
const ALLOWED_FIELDS = [
  'storeName', 'description', 'logo', 'banner', 'supportEmail',
  'city', 'district', 'phone', 'whatsapp', 'website',
  'address', 'zipCode', 'country',
  'bankName', 'bankAccountName', 'bankIban',
  'adProductIdLeft', 'adProductIdRight', 'showAd', 'showFlashSales', 'flashProductIds',
  'openingHours', 'cuisineType', 'deliveryRadius', 'minOrderAmount', 'avgPrepTimeMinutes',
  'lat', 'lng',
] as const;

// IBAN/bank değişikliği audit log gerektirir
const BANK_FIELDS = ['bankName', 'bankAccountName', 'bankIban'] as const;

@CommandHandler(UpdateVendorProfileCommand)
export class UpdateVendorProfileHandler implements ICommandHandler<UpdateVendorProfileCommand> {
  private readonly logger = new Logger(UpdateVendorProfileHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @InjectModel('VendorProfile')  private readonly profileModel: Model<IVendorProfile>,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: UpdateVendorProfileCommand) {
    const { userId, data } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor bulunamadı');

    const vendorProps = vendor.getProps() as unknown as Record<string, unknown>;
    const vendorId    = (vendorProps.id as string) ?? vendor.id;

    // Mevcut profil — banka değişikliği tespiti için
    const existingProfile = await this.profileModel.findOne({ vendorId }).lean() as Record<string, unknown> | null;
    const oldBankValues = BANK_FIELDS.reduce((acc, field) => {
      acc[field] = (existingProfile?.[field as string] as string | undefined) ?? null;
      return acc;
    }, {} as Record<string, string | null>);

    // Sadece izin verilen alanları filtrele
    const updateFields: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (data[field] !== undefined) {
        if (field === 'minOrderAmount' && typeof data[field] === 'number') {
          updateFields[field] = Types.Decimal128.fromString(String(data[field]));
        } else {
          updateFields[field] = data[field];
        }
      }
    }

    // Upsert — profil yoksa oluştur
    const newId = new Types.ObjectId().toString();
    const result = await this.profileModel.findOneAndUpdate(
      { vendorId },
      {
        $set:         updateFields,
        $setOnInsert: { _id: newId, id: newId, vendorId },
      },
      { upsert: true, new: true },
    ).lean();

    // Banka alanları değiştiyse audit log yaz
    const bankChanged = BANK_FIELDS.some(field => {
      const oldVal = oldBankValues[field];
      const newVal = data[field as keyof typeof data] as string | undefined;
      return newVal !== undefined && oldVal !== newVal;
    });
    if (bankChanged) {
      this.auditLog.log({
        actorId:      userId,
        action:       'VENDOR_BANK_CHANGED',
        resourceType: 'Vendor',
        resourceId:   vendorId,
        oldValue:     oldBankValues,
        newValue:      BANK_FIELDS.reduce((acc, field) => {
          acc[field] = (data[field as keyof typeof data] as string) ?? null;
          return acc;
        }, {} as Record<string, string | null>),
      }).catch((err: Error) => {
        this.logger.warn('Banka değişikliği audit log yazılamadı', { error: err.message });
      });
    }

    this.logger.log('Vendor profil güncellendi', { vendorId, fields: Object.keys(updateFields) });

    return {
      ...result,
      id:        vendorId,
      vendorType:vendorProps.vendorType,
      status:    vendorProps.status,
    };
  }
}
