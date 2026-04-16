// apps/backend/src/modules/catalog/application/queries/get-listings/get-listings.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetListingsQuery } from './get-listings.query';
import {
  IProductRepository,
  PRODUCT_REPO,
} from '../../../domain/repositories/product.repository.interface';
import { IMediaService, MEDIA_SERVICE } from '../../../../media/domain/media.service.interface';
import {
  PaginatedListingsDto,
  ProductListingItemDto,
} from '../../dtos/catalog-response.dtos';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@QueryHandler(GetListingsQuery)
export class GetListingsHandler
  implements IQueryHandler<GetListingsQuery, PaginatedListingsDto>
{
  constructor(
    @Inject(PRODUCT_REPO)
    private readonly productRepo: IProductRepository,
    @Inject(MEDIA_SERVICE)
    private readonly mediaService: IMediaService,
  ) {}

  async execute({ filters }: GetListingsQuery): Promise<PaginatedListingsDto> {
    const normalizedFilters = {
      ...filters,
      page: filters.page ?? DEFAULT_PAGE,
      // Limit'i üst sınırla kapat — kazara tüm tabloyu çekmeyi önler
      limit: Math.min(filters.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
    };

    const paginated = await this.productRepo.findAll(normalizedFilters);

    // Tek DB sorgusu + N paralel URL çözümü — sıralı await değil
    const items: ProductListingItemDto[] = await Promise.all(
      paginated.items.map(async (p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        price: p.price,
        currency: p.currency,
        condition: p.condition,
        thumbnail: await this.mediaService.resolveUrl(p.mainImageUrl, 'thumb'),
        categoryId: p.categoryId,
        createdAt: p.createdAt,
      })),
    );

    return {
      items,
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
      totalPages: paginated.totalPages,
    };
  }
}
