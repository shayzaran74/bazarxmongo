// apps/backend/src/modules/vendor/application/commands/update-ecosystem-settings.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { UpdateEcosystemSettingsCommand } from './update-ecosystem-settings.command';

@CommandHandler(UpdateEcosystemSettingsCommand)
export class UpdateEcosystemSettingsHandler
  implements ICommandHandler<UpdateEcosystemSettingsCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateEcosystemSettingsCommand) {
    const { userId, settings } = command;

    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      include: { brandEcosystem: { select: { id: true, isBlindPool: true, internalCommRate: true } } },
    });

    if (!vendor?.brandEcosystem) {
      throw new NotFoundException('Bu kullanıcıya ait bir ekosistem bulunamadı');
    }

    const ecosystem = vendor.brandEcosystem;

    // Sadece owner güncelleyebilir (admin zaten bu handler'ı RBAC'ten geçip çağırır)
    if (vendor.userId !== userId) {
      throw new ForbiddenException('Ekosistem ayarlarını yalnızca sahibi güncelleyebilir');
    }

    const updateData: Record<string, unknown> = {};
    if (settings.isBlindPool !== undefined) updateData.isBlindPool = settings.isBlindPool;
    if (settings.internalCommRate !== undefined) updateData.internalCommRate = settings.internalCommRate;

    const updated = await this.prisma.brandEcosystem.update({
      where: { id: ecosystem.id },
      data: updateData,
    });

    await this.prisma.ecosystemAuditLog.create({
      data: {
        action: 'SETTINGS_UPDATED',
        severity: 'HIGH',
        ecosystemId: ecosystem.id,
        vendorId: vendor.id,
        details: {
          updatedBy: userId,
          oldValues: {
            isBlindPool: ecosystem.isBlindPool,
            internalCommRate: ecosystem.internalCommRate.toString(),
          },
          newValues: updateData,
        } as any,
      },
    });

    return { success: true, data: updated };
  }
}
