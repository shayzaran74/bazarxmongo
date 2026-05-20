// apps/backend/src/modules/catalog/application/commands/create-listing.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateListingCommand } from './create-listing.command';
import { IListingRepository } from '../../domain/repositories/listing.repository.interface';
import { ICatalogProductRepository } from '../../domain/repositories/catalog-product.repository.interface';
import { Listing } from '../../domain/entities/listing.entity';
import { CatalogProduct } from '../../domain/entities/catalog-product.entity';
import { Slug } from '../../domain/value-objects/slug.vo';
import { Price } from '../../domain/value-objects/price.vo';
import { NotFoundException, DomainException, isErr } from '@barterborsa/shared-core';
import { Inject } from '@nestjs/common';

@CommandHandler(CreateListingCommand)
export class CreateListingHandler implements ICommandHandler<CreateListingCommand> {
  constructor(
    @Inject('IListingRepository')
    private readonly listingRepository: IListingRepository,
    @Inject('ICatalogProductRepository')
    private readonly productRepository: ICatalogProductRepository,
    // Note: Vendor check should ideally happen through a service or inter-module query
    // Here we assume the vendor module provides ICatalogVendorService or similar in a real scenario
    // For this implementation, we will perform the check in the controller or assume valid for now
    // to maintain module boundaries.
  ) {}

  async execute(command: CreateListingCommand): Promise<string> {
    const { vendorId, dto } = command;

    // 1. Katalog Ürünü Kontrolü veya Oluşturma
    let catalogProductId = dto.catalogProductId;

    if (!catalogProductId) {
      // Eğer catalogProductId yoksa, yeni bir Katalog Ürünü oluşturalım
      const newProduct = CatalogProduct.create({
        name: dto.title,
        slug: Slug.fromText(dto.title),
        brand: 'Bilinmeyen',
        description: dto.description || '',
        categoryId: (dto as any).categoryId || 'other',
        attributes: (dto as any).attributes || {}
      });

      await this.productRepository.save(newProduct);
      catalogProductId = newProduct.id;
    } else {
      // Eğer varsa doğrula
      const product = await this.productRepository.findById(catalogProductId);
      if (!product) {
        throw new NotFoundException('Belirtilen katalog ürünü bulunamadı.');
      }
    }

    // 2. Slug üret (Mağaza başlığı + Ürün adı) - Basitleştirilmiş
    const slugValue = Slug.fromText(`${dto.title}-${Date.now()}`);

    // 3. Fiyat VO
    const priceResult = Price.create(dto.price);
    if (!priceResult.success) {
      throw priceResult.error;
    }

    // 4. Listing oluştur — Master Plan §4.2 ekosistem alanları dahil
    const listing = Listing.create({
      vendorId,
      catalogProductId: catalogProductId,
      title: dto.title,
      description: dto.description,
      price: priceResult.data,
      stock: dto.stock,
      visibility: dto.visibility,
      condition: dto.condition,
      slug: slugValue,
      sku: dto.sku,
      isDigital: dto.isDigital,
      isB2BOnly: dto.isB2BOnly,
      tags: dto.tags,
      listingType: 'SELL',
      isAuctionEnabled: false,
      isLotteryEnabled: false,
      // Master Plan §4.2 — Ekosistem (fabrika) alanları
      ecosystemId: dto.ecosystemId,
      visibleTo: dto.visibleTo as unknown as import('../../domain/entities/listing.entity').DealerVisibility,
      selectedDealerIds: dto.selectedDealerIds,
      availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : undefined,
      availableTo: dto.availableTo ? new Date(dto.availableTo) : undefined,
      allowOnlineResale: dto.allowOnlineResale,
      maxOrderQtyPerDealer: dto.maxOrderQtyPerDealer,
    });

    await this.listingRepository.save(listing);

    return listing.id;
  }
}
