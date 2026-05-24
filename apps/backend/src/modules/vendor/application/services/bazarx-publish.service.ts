// apps/backend/src/modules/vendor/application/services/bazarx-publish.service.ts
// BazarX Publish Service — MAP entegrasyonu ve BazarX köprüsü

import { Injectable, Logger, ForbiddenException, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, ClientSession, Connection } from 'mongoose';
import { Listing, IListing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { IEcosystemMembershipRepository } from '../../domain/repositories/i-ecosystem-membership.repository';

export interface PublishListingDto {
  listingId: string;
  minMarketPrice?: number;
}

@Injectable()
export class BazarXPublishService {
  private readonly logger = new Logger(BazarXPublishService.name);

  constructor(
    @InjectModel('Listing') private readonly listingModel: Model<IListing>,
    @InjectConnection() private readonly connection: Connection,
    @Inject('IEcosystemMembershipRepository') private readonly membershipRepo: IEcosystemMembershipRepository,
  ) {}

  /**
   * Bir listing'i BazarX'te yayınlar (MAP kurallarına uygun).
   * Sadece ecosystem üyesi bayiler bu listing'i görebilir.
   */
  async publishToBazarX(
    dealerId: string,
    ecosystemId: string,
    dto: PublishListingDto,
    session?: ClientSession,
  ): Promise<IListing> {
    // 1. Membership kontrolü — dealer ecosystem üyesi mi?
    const membership = await this.membershipRepo.findOne(dealerId, ecosystemId);
    if (!membership || membership.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: 'NOT_ECOSYSTEM_MEMBER',
        message: 'Bu işlem için ekosistemin üyesi olmalısınız.',
      });
    }

    // 2. Listing'i bul
    const listing = await this.listingModel.findById(dto.listingId).lean().exec();
    if (!listing) throw new NotFoundException('Listing bulunamadı.');

    // 3. Listing'in ecosystem kontrolü — sadece kendi ekosistem ürününü yayınlayabilir
    const ecosystemIdField = (listing as Record<string, unknown>).ecosystemId as string | undefined;
    if (ecosystemIdField && ecosystemIdField !== ecosystemId) {
      throw new ForbiddenException({
        code: 'LISTING_ECOSYSTEM_MISMATCH',
        message: 'Yalnızca kendi ekosisteminize ait ürünleri yayınlayabilirsiniz.',
      });
    }

    // 4. MAP kontrolü — minMarketPrice belirlenmişse fiyat altında yayınlanamaz
    const priceField = listing.price as unknown as string | number | undefined;
    if (dto.minMarketPrice !== undefined && priceField !== undefined) {
      // Listing fiyatı MAP'ın altındaysa yayınlama
      const listingPrice = typeof priceField === 'number' ? priceField : Number(priceField);
      if (listingPrice < dto.minMarketPrice) {
        throw new BadRequestException({
          code: 'MAP_PRICE_VIOLATION',
          message: `Listing fiyatı (${listingPrice}) MAP minimum (${dto.minMarketPrice}) altında.`,
        });
      }
    }

    // 5. allowOnlineResale === false ise yayınlanamaz
    const allowOnlineResaleField = (listing as Record<string, unknown>).allowOnlineResale as boolean | undefined;
    if (allowOnlineResaleField === false) {
      throw new BadRequestException({
        code: 'ONLINE_RESALE_NOT_ALLOWED',
        message: 'Bu ürün için online satış izin verilmiyor.',
      });
    }

    // 6. bazarxPublished alanlarını güncelle
    const updated = await this.listingModel.findByIdAndUpdate(
      dto.listingId,
      {
        $set: {
          'bazarxPublished.published': true,
          'bazarxPublished.publishedAt': new Date(),
          'bazarxPublished.publishedBy': dealerId,
          'bazarxPublished.ecosystemId': ecosystemId,
          'bazarxPublished.minMarketPrice': dto.minMarketPrice ? Types.Decimal128.fromString(String(dto.minMarketPrice)) : null,
        },
      },
      { new: true, session },
    ).lean().exec();

    this.logger.log(`Listing yayınlandı: ${dto.listingId}`, {
      dealerId,
      ecosystemId,
      minMarketPrice: dto.minMarketPrice,
    });

    return updated as IListing;
  }

  /**
   * BazarX yayınını kaldırır.
   */
  async unpublishFromBazarX(
    dealerId: string,
    ecosystemId: string,
    listingId: string,
    session?: ClientSession,
  ): Promise<IListing> {
    const membership = await this.membershipRepo.findOne(dealerId, ecosystemId);
    if (!membership || membership.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: 'NOT_ECOSYSTEM_MEMBER',
        message: 'Bu işlem için ekosistemin üyesi olmalısınız.',
      });
    }

    const listing = await this.listingModel.findById(listingId).lean().exec();
    if (!listing) throw new NotFoundException('Listing bulunamadı.');

    const ecosystemIdField = (listing as Record<string, unknown>).ecosystemId as string | undefined;
    if (ecosystemIdField && ecosystemIdField !== ecosystemId) {
      throw new ForbiddenException({
        code: 'LISTING_ECOSYSTEM_MISMATCH',
        message: 'Yalnızca kendi ekosisteminize ait ürünlerin yayınını kaldırabilirsiniz.',
      });
    }

    const updated = await this.listingModel.findByIdAndUpdate(
      listingId,
      {
        $set: {
          'bazarxPublished.published': false,
          'bazarxPublished.unpublishedAt': new Date(),
          'bazarxPublished.unpublishedBy': dealerId,
        },
      },
      { new: true, session },
    ).lean().exec();

    this.logger.log(`Listing yayını kaldırıldı: ${listingId}`, { dealerId, ecosystemId });
    return updated as IListing;
  }

  /**
   * Bir ecosystem'deki tüm yayınlanmış listing'leri getirir.
   */
  async getPublishedListings(ecosystemId: string, includeUnpublished = false): Promise<IListing[]> {
    const query: Record<string, unknown> = {
      'bazarxPublished.ecosystemId': ecosystemId,
    };
    if (!includeUnpublished) {
      query['bazarxPublished.published'] = true;
    }
    return this.listingModel.find(query).lean().exec();
  }

  /**
   * Bir dealer's yayınladığı listing'leri getirir.
   */
  async getDealerPublishedListings(dealerId: string, ecosystemId: string): Promise<IListing[]> {
    return this.listingModel.find({
      'bazarxPublished.publishedBy': dealerId,
      'bazarxPublished.ecosystemId': ecosystemId,
      'bazarxPublished.published': true,
    }).lean().exec();
  }
}