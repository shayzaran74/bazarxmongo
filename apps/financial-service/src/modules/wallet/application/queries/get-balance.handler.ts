// apps/financial-service/src/modules/wallet/application/queries/get-balance.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBalanceQuery } from './get-balance.query';
import { Inject } from '@nestjs/common';
import { IWalletRepository } from '../../domain/repositories/wallet.repository.interface';
import { Wallet } from '../../domain/entities/wallet.entity';

@QueryHandler(GetBalanceQuery)
export class GetBalanceHandler implements IQueryHandler<GetBalanceQuery> {
  constructor(
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository
  ) {}

  async execute(query: GetBalanceQuery) {
    let wallet = await this.walletRepository.findByUserId(query.userId);
    if (!wallet) {
        wallet = Wallet.create(query.userId);
    }

    return {
      balance: wallet.balanceTL.amount,
      availableBalance: wallet.balanceTL.amount,
      blockedBalance: 0,
    };
  }
}
