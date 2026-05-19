// apps/backend/src/modules/barter/application/queries/get-my-barter-offers.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMyBarterOffersQuery } from './get-my-barter-offers.query';
import { BadRequestException } from '@nestjs/common';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';

@QueryHandler(GetMyBarterOffersQuery)
export class GetMyBarterOffersHandler implements IQueryHandler<GetMyBarterOffersQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @Inject('ITradeOfferRepository') private readonly tradeOfferRepository: ITradeOfferRepository,
  ) {}

  async execute(query: GetMyBarterOffersQuery) {
    const vendor = await this.vendorRepository.findByUserId(query.userId);

    if (!vendor) {
      throw new BadRequestException('Satıcı hesabı bulunamadı');
    }

    const companyId = vendor.getProps().companyId;
    if (!companyId) {
      throw new BadRequestException('Şirket kaydı bulunamadı');
    }

    const result = await this.tradeOfferRepository.findByCompanyWithFilters(
      companyId,
      0,
      100,
      ['PENDING', 'COUNTER_OFFERED', 'ACCEPTED'],
    );

    return result.items;
  }
}