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
        title: dto.title || dto.name, // Frontend sends 'name' in form
        description: dto.description,
        price: dto.price !== undefined ? Number(dto.price) : undefined,
        stock: dto.stock !== undefined ? Number(dto.stock) : undefined,
        status: dto.status,
        sku: dto.sku,
        visibility: dto.visibility,
        minMarketPrice: dto.minMarketPrice !== undefined ? Number(dto.minMarketPrice) : undefined,
        maxPurchasePerMember: dto.maxPurchasePerMember !== undefined ? Number(dto.maxPurchasePerMember) : undefined,
        originalPrice: dto.compareAtPrice !== undefined ? Number(dto.compareAtPrice) : undefined,
        weight: dto.weight !== undefined ? Number(dto.weight) : undefined,
        volume: dto.volume !== undefined ? Number(dto.volume) : undefined,
        isDigital: dto.isDigital,
        isB2BOnly: dto.isB2BOnly,
      }
    });

    // CatalogProduct güncellemesi (Kategori, isim vb. için)
    if (listing.catalogProductId && (dto.categoryId || dto.name || dto.title || dto.description)) {
      const catalogData: any = {};
      if (dto.categoryId) catalogData.categoryId = dto.categoryId;
      if (dto.name || dto.title) catalogData.name = dto.name || dto.title;
      if (dto.description) catalogData.description = dto.description;

      await this.prisma.catalogProduct.update({
        where: { id: listing.catalogProductId },
        data: catalogData
      });
    }

    return updatedListing;
  }
}
