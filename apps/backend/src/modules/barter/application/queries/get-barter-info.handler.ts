import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetBarterInfoQuery } from './get-barter-info.query';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';

interface WalletAccount {
  type: string;
  balance?: string;
  creditLimit?: string;
}

interface WalletResponse {
  accounts?: WalletAccount[];
}

interface TxResponse {
  items?: unknown[];
  transactions?: unknown[];
}

@QueryHandler(GetBarterInfoQuery)
export class GetBarterInfoHandler implements IQueryHandler<GetBarterInfoQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    private readonly financialGateway: FinancialGatewayService,
  ) {}

  async execute(query: GetBarterInfoQuery) {
    const vendor = await this.vendorRepository.findByUserId(query.userId);

    let balance = '0';
    let barterBalance = '0';
    let barterCreditLimit = '0';
    let commissionXP = '0';
    let adXP = '0';
    let serviceXP = '0';
    let transactions: unknown[] = [];

    try {
      const wallet = (await this.financialGateway.getWallet(query.userId)) as WalletResponse;
      if (wallet && wallet.accounts) {
        const mainAcc = wallet.accounts.find((a: WalletAccount) => a.type === 'MAIN');
        const barterAcc = wallet.accounts.find((a: WalletAccount) => a.type === 'BARTER');
        const xpCommAcc = wallet.accounts.find((a: WalletAccount) => a.type === 'XP_COMMISSION');
        const xpAdsAcc = wallet.accounts.find((a: WalletAccount) => a.type === 'XP_ADS');

        if (mainAcc) balance = mainAcc.balance || '0';
        if (barterAcc) {
          barterBalance = barterAcc.balance || '0';
          barterCreditLimit = barterAcc.creditLimit || '0';
        }
        if (xpCommAcc) commissionXP = xpCommAcc.balance || '0';
        if (xpAdsAcc) adXP = xpAdsAcc.balance || '0';
      }

      const txResult = (await this.financialGateway.getTransactions(query.userId)) as TxResponse;
      if (txResult) {
        transactions = txResult.items || txResult.transactions || [];
      }
    } catch (error) {
      // Silently fall back to 0/empty values
    }

    return {
      isRegistered: !!vendor,
      vendorId:     vendor?.id,
      companyId:    vendor?.getProps().companyId,
      companyName:  null, // Company tablosu ayrı sorgulanmalı
      tier:         vendor?.getProps().tier || 'CORE',
      rating:       0,
      trustScore:   100,
      loyaltyPoints: 0,
      balance,
      barterBalance,
      barterCreditLimit,
      commissionXP,
      adXP,
      serviceXP,
      transactions,
      xpTransactions: [],
    };
  }
}