import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AddEcosystemMemberCommand } from './add-ecosystem-member.command';

@CommandHandler(AddEcosystemMemberCommand)
export class AddEcosystemMemberHandler
  implements ICommandHandler<AddEcosystemMemberCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AddEcosystemMemberCommand) {
    const { userId, memberVendorId } = command;

    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      include: { brandEcosystem: true }
    });

    if (!vendor?.brandEcosystem) {
      throw new NotFoundException('No ecosystem owned by this vendor');
    }

    const memberVendor = await this.prisma.vendor.findUnique({
      where: { id: memberVendorId },
    });

    if (!memberVendor) {
      throw new NotFoundException('Eklenmek istenen bayi bulunamadı');
    }
    
    if (memberVendor.status !== 'APPROVED') {
      throw new BadRequestException('Sadece onaylanmış (APPROVED) bayiler ekosisteme eklenebilir');
    }

    if (memberVendor.ecosystemId) {
      throw new BadRequestException('Bu bayi zaten bir ekosisteme üye');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.vendor.update({
        where: { id: memberVendorId },
        data: { ecosystemId: vendor.brandEcosystem!.id }
      });

      await tx.ecosystemAuditLog.create({
        data: {
          action: 'MEMBER_ADDED',
          severity: 'HIGH',
          ecosystemId: vendor.brandEcosystem!.id,
          vendorId: memberVendorId,
          details: { addedBy: userId }
        }
      });
    });

    return { success: true };
  }
}
