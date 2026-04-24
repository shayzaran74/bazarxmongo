import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { DeleteListingCommand } from './delete-listing.command';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteListingCommand)
export class DeleteListingHandler implements ICommandHandler<DeleteListingCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteListingCommand) {
    const { userId, userRole, id } = command;

    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { vendor: true }
    });

    if (!listing) {
      throw new NotFoundException('İlan bulunamadı');
    }

    const isAdmin = Array.isArray(userRole) 
      ? userRole.includes('ADMIN') 
      : userRole === 'ADMIN';

    // Eğer ADMIN değilse, ilanın sahibi olan vendor mu kontrol et
    if (!isAdmin) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId }
      });

      if (!vendor || listing.vendorId !== vendor.id) {
        throw new ForbiddenException('Bu ilanı silme yetkiniz yok');
      }
    }

    // İlanı sil (veya pasife çek)
    // Sipariş geçmişi varsa silme hata verebilir, bu yüzden prisma transaction veya soft delete düşünülebilir
    await this.prisma.listing.delete({
      where: { id }
    });

    return { success: true };
  }
}
