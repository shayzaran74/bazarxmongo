// apps/backend/src/modules/vendor/application/commands/update-restaurant-settings.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DomainException } from '@barterborsa/shared-core';
import { UpdateRestaurantSettingsCommand } from './update-restaurant-settings.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IVendorProfileRepository } from '../../domain/repositories/vendor-profile.repository.interface';
import { IVendorSettingsRepository } from '../../domain/repositories/vendor-settings.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(UpdateRestaurantSettingsCommand)
export class UpdateRestaurantSettingsHandler implements ICommandHandler<UpdateRestaurantSettingsCommand> {
  constructor(
    @Inject('IVendorRepository')
    private readonly vendorRepository: IVendorRepository,
    @Inject('IVendorProfileRepository')
    private readonly profileRepository: IVendorProfileRepository,
    @Inject('IVendorSettingsRepository')
    private readonly settingsRepository: IVendorSettingsRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: UpdateRestaurantSettingsCommand): Promise<{ vendorId: string }> {
    const { userId, dto } = command;

    // 1. Vendor bul + tip kontrolü
    const vendor = await this.vendorRepository.findByUserId(userId);
    if (!vendor) {
      throw new NotFoundException('Satıcı kaydı bulunamadı.');
    }
    if (!vendor.isRestaurant()) {
      throw new ForbiddenException('Bu ayarlar yalnızca RESTAURANT tipi satıcılar için geçerlidir.');
    }

    // 2. Profile + Settings yükle
    const profile = await this.profileRepository.findByVendorId(vendor.id);
    const settings = await this.settingsRepository.findByVendorId(vendor.id);
    if (!profile || !settings) {
      throw new DomainException('Satıcı profili veya ayarları bulunamadı.');
    }

    // 3. Eski değerleri AuditLog için sakla
    const oldProfile = profile.getProps();
    const oldSettings = settings.getProps();

    // 4. Profile restoran alanlarını güncelle
    if (
      dto.openingHours !== undefined ||
      dto.deliveryRadius !== undefined ||
      dto.minOrderAmount !== undefined ||
      dto.avgPrepTimeMinutes !== undefined
    ) {
      profile.updateRestaurantSettings({
        openingHours:       dto.openingHours,
        deliveryRadius:     dto.deliveryRadius,
        minOrderAmount:     dto.minOrderAmount,
        avgPrepTimeMinutes: dto.avgPrepTimeMinutes,
      });
    }

    // 5. Settings holidayMode + acceptingOrders güncelle
    if (dto.holidayMode !== undefined) {
      settings.setHolidayMode(dto.holidayMode);
    }
    if (dto.acceptingOrders !== undefined) {
      settings.setAcceptingOrders(dto.acceptingOrders);
    }

    // 6. Kaydet
    await this.profileRepository.save(profile);
    await this.settingsRepository.save(settings);

    // 7. AuditLog
    await this.auditLog.log({
      actorId:      userId,
      action:       'RESTAURANT_SETTINGS_UPDATED',
      resourceType: 'Vendor',
      resourceId:   vendor.id,
      oldValue: {
        holidayMode:        oldSettings.holidayMode,
        acceptingOrders:    oldSettings.acceptingOrders,
        deliveryRadius:     oldProfile.deliveryRadius,
        minOrderAmount:     oldProfile.minOrderAmount,
        avgPrepTimeMinutes: oldProfile.avgPrepTimeMinutes,
      },
      newValue: {
        holidayMode:        settings.getProps().holidayMode,
        acceptingOrders:    settings.getProps().acceptingOrders,
        deliveryRadius:     profile.getProps().deliveryRadius,
        minOrderAmount:     profile.getProps().minOrderAmount,
        avgPrepTimeMinutes: profile.getProps().avgPrepTimeMinutes,
      },
    });

    return { vendorId: vendor.id };
  }
}
