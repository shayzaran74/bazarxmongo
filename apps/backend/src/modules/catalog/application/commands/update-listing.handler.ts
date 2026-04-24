import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { UpdateListingCommand } from './update-listing.command';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateListingCommand)
export class UpdateListingHandler implements ICommandHandler<UpdateListingCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateListingCommand) {
    const { userId, userRole, id, dto } = command;

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

    // Yetki Kontrolü
    if (!isAdmin) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId }
      });

      if (!vendor || listing.vendorId !== vendor.id) {
        throw new ForbiddenException('Bu ilanı güncelleme yetkiniz yok');
      }
    }

    // Güncelleme işlemi
    const updatedListing = await this.prisma.listing.update({
      where: { id },
      data: {
        title: dto.title,
        price: dto.price !== undefined ? Number(dto.price) : undefined,
        stock: dto.stock !== undefined ? Number(dto.stock) : undefined,
        status: dto.status,
        sku: dto.sku,
        // Diğer alanlar buraya eklenebilir
      }
    });

    return updatedListing;
  }
}
