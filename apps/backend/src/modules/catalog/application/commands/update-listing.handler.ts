// apps/backend/src/modules/catalog/application/commands/update-listing.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateListingCommand } from './update-listing.command';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateListingCommand)
export class UpdateListingHandler implements ICommandHandler<UpdateListingCommand> {
  async execute(command: UpdateListingCommand) {
    const { userId, userRole, id, dto } = command;

    const listing = await Listing.findOne({ id }).exec();
    if (!listing) throw new NotFoundException('İlan bulunamadı');

    const isAdmin = Array.isArray(userRole)
      ? userRole.includes('ADMIN')
      : userRole === 'ADMIN';

    if (!isAdmin) {
      const vendor = await Vendor.findOne({ userId }).exec();
      if (!vendor || (listing as any).vendorId !== vendor.id) {
        throw new ForbiddenException('Bu ilanı güncelleme yetkiniz yok');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.title || dto.name) updateData.title = dto.title || dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = Number(dto.price);
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.sku !== undefined) updateData.sku = dto.sku;
    if (dto.visibility !== undefined) updateData.visibility = dto.visibility;
    if (dto.minMarketPrice !== undefined) updateData.minMarketPrice = Number(dto.minMarketPrice);
    if (dto.maxPurchasePerMember !== undefined) updateData.maxPurchasePerMember = Number(dto.maxPurchasePerMember);
    if (dto.compareAtPrice !== undefined) updateData.originalPrice = Number(dto.compareAtPrice);
    if (dto.weight !== undefined) updateData.weight = Number(dto.weight);
    if (dto.volume !== undefined) updateData.volume = Number(dto.volume);
    if (dto.isDigital !== undefined) updateData.isDigital = dto.isDigital;
    if (dto.isB2BOnly !== undefined) updateData.isB2BOnly = dto.isB2BOnly;

    // Master Plan v4.3 §4.2 — Fabrika ekosistemi alanları
    if (dto.ecosystemId !== undefined) updateData.ecosystemId = dto.ecosystemId;
    if (dto.visibleTo !== undefined) {
      if (!['ALL_DEALERS', 'SELECTED_DEALERS', 'NONE'].includes(dto.visibleTo as string)) {
        throw new ForbiddenException('Geçersiz visibleTo değeri');
      }
      updateData.visibleTo = dto.visibleTo;
    }
    if (dto.selectedDealerIds !== undefined) {
      if (dto.visibleTo === 'SELECTED_DEALERS' && (!Array.isArray(dto.selectedDealerIds) || dto.selectedDealerIds.length === 0)) {
        throw new ForbiddenException('SELECTED_DEALERS_REQUIRES_DEALER_IDS');
      }
      updateData.selectedDealerIds = dto.selectedDealerIds;
    }
    if (dto.availableFrom !== undefined) updateData.availableFrom = dto.availableFrom ? new Date(dto.availableFrom as string) : null;
    if (dto.availableTo !== undefined) updateData.availableTo = dto.availableTo ? new Date(dto.availableTo as string) : null;
    if (dto.allowOnlineResale !== undefined) updateData.allowOnlineResale = Boolean(dto.allowOnlineResale);
    if (dto.maxOrderQtyPerDealer !== undefined) updateData.maxOrderQtyPerDealer = Number(dto.maxOrderQtyPerDealer);

    // Ekosistem listing'inde maxOrderQtyPerDealer null/undefined olamaz (§4.2)
    const willBeEcosystem = (updateData.ecosystemId ?? (listing as any).ecosystemId);
    const willBeMaxQty = (updateData.maxOrderQtyPerDealer ?? (listing as any).maxOrderQtyPerDealer);
    if (willBeEcosystem && (willBeMaxQty === undefined || willBeMaxQty === null)) {
      throw new ForbiddenException('ECOSYSTEM_LISTING_REQUIRES_MAX_ORDER_QTY_PER_DEALER');
    }
    // Tarih aralığı kontrolü
    const fromVal = (updateData.availableFrom ?? (listing as any).availableFrom) as Date | undefined | null;
    const toVal = (updateData.availableTo ?? (listing as any).availableTo) as Date | undefined | null;
    if (fromVal && toVal && fromVal >= toVal) {
      throw new ForbiddenException('AVAILABLE_FROM_MUST_BE_BEFORE_AVAILABLE_TO');
    }

    if (dto.stock !== undefined) {
      const newStock = Number(dto.stock);
      const stockDiff = newStock - listing.stock;
      updateData.stock = newStock;
      updateData.availableQuantity = Number((listing as any).availableQuantity || 0) + stockDiff;
      if (Number(updateData.availableQuantity) > 0 && listing.status === 'OUT_OF_STOCK') {
        updateData.status = 'ACTIVE';
      }
    }

    const updatedListing = await Listing.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true }
    ).exec();

    if (listing.catalogProductId && (dto.categoryId || dto.name || dto.title || dto.description)) {
      const catalogData: Record<string, unknown> = {};
      if (dto.categoryId) catalogData.categoryId = dto.categoryId;
      if (dto.name || dto.title) catalogData.name = dto.name || dto.title;
      if (dto.description) catalogData.description = dto.description;

      await CatalogProduct.updateOne(
        { id: listing.catalogProductId },
        { $set: catalogData }
      ).exec();

      if (dto.productImages && Array.isArray(dto.productImages)) {
        await ProductMedia.deleteMany({ productId: listing.catalogProductId }).exec();
        if (dto.productImages.length > 0) {
          const mediaDocs = dto.productImages.map((url: string, index: number) => ({
            id: 'media-' + Date.now() + '-' + index,
            productId: listing.catalogProductId,
            url,
            type: 'IMAGE',
            sortOrder: index,
          }));
          await ProductMedia.insertMany(mediaDocs);
        }
      }
    }

    return updatedListing;
  }
}
