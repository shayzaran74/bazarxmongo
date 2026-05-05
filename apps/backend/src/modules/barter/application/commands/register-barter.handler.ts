// apps/backend/src/modules/barter/application/commands/register-barter.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterBarterCommand } from './register-barter.command';
import { PrismaService } from '@barterborsa/shared-persistence';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(RegisterBarterCommand)
export class RegisterBarterHandler implements ICommandHandler<RegisterBarterCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RegisterBarterCommand) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: command.userId },
      select: { id: true, status: true },
    });

    if (!vendor) {
      throw new BadRequestException('Önce satıcı kaydı yapılmalıdır');
    }
    if (vendor.status !== 'APPROVED') {
      throw new BadRequestException('Barter sistemine katılmak için satıcı hesabı onaylı olmalıdır');
    }

    // Vendor tier'ı güncelle — barter erişimi aç
    await this.prisma.vendor.update({
      where: { id: vendor.id },
      data: { barterEnabled: true },
    });

    return {
      success: true,
      message: 'Barter sistemine başarıyla kayıt oldunuz',
      data: { vendorId: vendor.id },
    };
  }
}
