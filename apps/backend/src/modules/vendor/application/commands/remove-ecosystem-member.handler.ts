// apps/backend/src/modules/vendor/application/commands/remove-ecosystem-member.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { RemoveEcosystemMemberCommand } from './remove-ecosystem-member.command';

@CommandHandler(RemoveEcosystemMemberCommand)
export class RemoveEcosystemMemberHandler
  implements ICommandHandler<RemoveEcosystemMemberCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RemoveEcosystemMemberCommand) {
    const { userId, memberVendorId } = command;

    // Ekosistemi bul — sadece owner veya admin çalıştırabilir
    const callerVendor = await this.prisma.vendor.findUnique({
      where: { userId },
      include: { brandEcosystem: { select: { id: true } } },
    });

    const memberVendor = await this.prisma.vendor.findUnique({
      where: { id: memberVendorId },
      select: { id: true, ecosystemId: true, status: true },
    });

    if (!memberVendor) throw new NotFoundException('Üye bayi bulunamadı');
    if (!memberVendor.ecosystemId) {
      throw new BadRequestException('Bu bayi herhangi bir ekosisteme üye değil');
    }

    // Çağıranın bu ekosistemin sahibi olması gerekir (admin bypass: caller vendor yoksa izin ver)
    if (callerVendor && callerVendor.brandEcosystem?.id !== memberVendor.ecosystemId) {
      throw new ForbiddenException('Bu ekosistemden üye çıkarma yetkiniz yok');
    }

    const ecosystemId = memberVendor.ecosystemId;

    await this.prisma.$transaction(async (tx) => {
      // Üyeyi ekosistemden çıkar
      await tx.vendor.update({
        where: { id: memberVendorId },
        data: { ecosystemId: null },
      });

      await tx.ecosystemAuditLog.create({
        data: {
          action: 'MEMBER_REMOVED',
          severity: 'HIGH',
          ecosystemId,
          vendorId: memberVendorId,
          details: { removedBy: userId },
        },
      });
    });

    return { success: true };
  }
}
