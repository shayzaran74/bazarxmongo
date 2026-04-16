import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCatalogProductCommand } from './create-catalog-product.command';
import { ICatalogProductRepository } from '../../domain/repositories/catalog-product.repository.interface';
import { CatalogProduct } from '../../domain/entities/catalog-product.entity';
import { Slug } from '../../domain/value-objects/slug.vo';
import { GTIN } from '../../domain/value-objects/gtin.vo';
import { ConflictException } from '@barterborsa/shared-core';

@CommandHandler(CreateCatalogProductCommand)
export class CreateCatalogProductHandler implements ICommandHandler<CreateCatalogProductCommand> {
  constructor(
    @Inject('ICatalogProductRepository')
    private readonly catalogProductRepository: ICatalogProductRepository,
  ) {}

  async execute(command: CreateCatalogProductCommand): Promise<string> {
    const { dto } = command;

    let gtin: GTIN | undefined;
    // Check GTIN if provided
    if (dto.gtin) {
      const gtinResult = GTIN.create(dto.gtin);
      if (!gtinResult.success) throw gtinResult.error;
      gtin = gtinResult.data;
      
      if (gtin) {
        const existing = await this.catalogProductRepository.findByGTIN(gtin);
        if (existing) {
          throw new ConflictException('Bu GTIN ile bir ürün zaten mevcut.');
        }
      }
    }

    // Slug creation (for URL)
    const slug = Slug.fromText(dto.name);

    const product = CatalogProduct.create({
      name: dto.name,
      slug: slug,
      gtin: gtin,
      brand: dto.brand,
      description: dto.description,
      categoryId: dto.categoryId,
      modelId: dto.modelId,
      specs: dto.specs,
      attributes: dto.attributes
    });

    await this.catalogProductRepository.save(product);

    return product.id;
  }
}
