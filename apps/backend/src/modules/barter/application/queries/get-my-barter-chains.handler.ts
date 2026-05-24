// apps/backend/src/modules/barter/application/queries/get-my-barter-chains.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMyBarterChainsQuery } from './get-my-barter-chains.query';
import { BadRequestException } from '@nestjs/common';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';

interface BarterChainResponse {
  id: string;
  offers: Array<{ offeredItemId?: string; requestedItemId?: string }>;
}

@QueryHandler(GetMyBarterChainsQuery)
export class GetMyBarterChainsHandler implements IQueryHandler<GetMyBarterChainsQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @Inject('ISwapSessionRepository') private readonly swapSessionRepository: ISwapSessionRepository,
  ) {}

  async execute(query: GetMyBarterChainsQuery): Promise<BarterChainResponse[]> {
    const vendor = await this.vendorRepository.findByUserId(query.userId);

    if (!vendor) {
      throw new BadRequestException('Satıcı hesabı bulunamadı');
    }

    const companyId = vendor.getProps().companyId;
    if (!companyId) {
      throw new BadRequestException('Şirket kaydı bulunamadı');
    }

    const result = await this.swapSessionRepository.findByCompanyWithFilters(companyId, 0, 100);

    // SwapSession → BarterChain formatına map et
    return result.items.map(session => {
      const props = session.getProps();
      return {
        id:     session.id,
        offers: [{ offeredItemId: props.tradeOfferId }],
      } as BarterChainResponse;
    });
  }
}