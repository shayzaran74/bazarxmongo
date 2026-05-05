// apps/financial-service/src/modules/wallet/domain/entities/wallet.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { Money } from '../value-objects/money.vo';

interface WalletProps {
  userId: string;
  balanceTL: Money;
  barterBalance: Money;
  xpPoints: number;
  xpAdsBalance: Money;
  xpTradeBalance: Money;
  xpCommissionBalance: Money;
  lastXpAdsEarnedDate?: Date | null;
}

export class Wallet extends AggregateRoot<WalletProps> {
  constructor(props: WalletProps, id?: string) {
    super(props, id);
  }

  get userId(): string { return this.props.userId; }
  get balanceTL(): Money { return this.props.balanceTL; }
  get barterBalance(): Money { return this.props.barterBalance; }
  get xpPoints(): number { return this.props.xpPoints; }
  get xpAdsBalance(): Money { return this.props.xpAdsBalance; }
  get xpTradeBalance(): Money { return this.props.xpTradeBalance; }
  get xpCommissionBalance(): Money { return this.props.xpCommissionBalance; }
  get lastXpAdsEarnedDate(): Date | null | undefined { return this.props.lastXpAdsEarnedDate; }

  // Topup TL
  public topUpTL(amount: Money): void {
    if (amount.currency !== 'TRY') throw new Error('Para birimi TRY olmalıdır.');
    this.props.balanceTL = this.props.balanceTL.add(amount);
  }

  // Withdraw TL
  public withdrawTL(amount: Money): void {
    if (amount.currency !== 'TRY') throw new Error('Para birimi TRY olmalıdır.');
    this.props.balanceTL = this.props.balanceTL.subtract(amount);
  }

  static create(userId: string): Wallet {
    return new Wallet({
      userId,
      balanceTL: Money.zero('TRY'),
      barterBalance: Money.zero('BARTER'),
      xpPoints: 0,
      xpAdsBalance: Money.zero('TRY'),
      xpTradeBalance: Money.zero('TRY'),
      xpCommissionBalance: Money.zero('TRY'),
    });
  }
}
