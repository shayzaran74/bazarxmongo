// apps/backend/src/modules/catalog/application/queries/get-product-details/get-product-details.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';

import { GetProductDetailsQuery } from './get-product-details.query';
import {
  IProductRepository,
  PRODUCT_REPO,
} from '../../../domain/repositories/product.repository.interface';
import { IMediaService, MEDIA_SERVICE } from '../../../../media/domain/media.service.interface';
import {
  ProductDetailsDto,
  ProductImageDto,
} from '../../dtos/catalog-response.dtos';

@QueryHandler(GetProductDetailsQuery)
export class GetProductDetailsHandler
  implements IQueryHandler<GetProductDetailsQuery, ProductDetailsDto>
{
  constructor(
    @Inject(PRODUCT_REPO)
    private readonly productRepo: IProductRepository,
    @Inject(MEDIA_SERVICE)
    private readonly mediaService: IMediaService,
  ) {}

  async execute({ idOrSlug }: GetProductDetailsQuery): Promise<ProductDetailsDto> {
    const product = await this.productRepo.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw new NotFoundException(`Ürün bulunamadı: ${idOrSlug}`);
    }

    // Ana resim için iki boyutu paralel çöz
    const [mainImage, thumbnail] = await Promise.all([
      this.mediaService.resolveUrl(product.mainImageUrl, 'medium'),
      this.mediaService.resolveUrl(product.mainImageUrl, 'thumb'),
    ]);

    // Galeri — her resim için paralel çözümleme
    const gallery: ProductImageDto[] = await Promise.all(
      product.images.map(async (img) => ({
        url: await this.mediaService.resolveUrl(img.url, 'medium'),
        altText: img.altText,
        isPrimary: img.isPrimary,
      })),
    );

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      condition: product.condition,
      categoryId: product.categoryId,
      mainImage,
      thumbnail,
      gallery,
      sellerId: product.sellerId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
