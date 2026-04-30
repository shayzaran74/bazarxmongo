import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ApplyBrandCommand } from './apply-brand.command';

@CommandHandler(ApplyBrandCommand)
export class ApplyBrandHandler implements ICommandHandler<ApplyBrandCommand> {
  private readonly logger = new Logger(ApplyBrandHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ApplyBrandCommand) {
    const { userId, dto, slug } = command;

    const vendor = await this.prisma.vendor.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    try {
      const brand = await this.prisma.brand.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          aliases: dto.aliases ?? [],
          vendorId: vendor.id,
          status: 'PENDING',
          submittedAt: new Date(),
        },
      });

      this.logger.log('Marka başvurusu oluşturuldu', { brandId: brand.id, vendorId: vendor.id });
      return { success: true, data: brand };
    } catch (err: unknown) {
      // Prisma P2002: unique constraint (name veya slug çakışması)
      if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'P2002') {
        throw new BadRequestException('Bu marka adı zaten mevcut');
      }
      throw err;
    }
  }
}
