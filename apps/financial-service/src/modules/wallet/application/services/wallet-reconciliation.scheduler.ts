// apps/financial-service/src/modules/wallet/application/services/wallet-reconciliation.scheduler.ts
// Her gece 03:00'te walletModel.balanceTL ↔ accountModel.balance drift tespiti yapar.

import { Injectable, OnApplicationBootstrap, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Decimal } from 'decimal.js';
import { IWallet, IFinancialAccount } from '@barterborsa/shared-persistence';

const RECONCILE_INTERVAL_MS = 60 * 60 * 1000; // 1 saatte bir kontrol (ilk run 03:00'e denk getirilir)
const DRIFT_THRESHOLD = new Decimal('0.01'); // 1 kuruştan büyük fark alarm tetikler

@Injectable()
export class WalletReconciliationScheduler implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(WalletReconciliationScheduler.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    @InjectModel('Wallet') private readonly walletModel: Model<IWallet>,
    @InjectModel('Account') private readonly accountModel: Model<IFinancialAccount>,
  ) {}

  onApplicationBootstrap(): void {
    // İlk çalışmayı saat 03:00'e planla
    const now = new Date();
    const next3AM = new Date(now);
    next3AM.setHours(3, 0, 0, 0);
    if (next3AM <= now) next3AM.setDate(next3AM.getDate() + 1);
    const msUntil3AM = next3AM.getTime() - now.getTime();

    setTimeout(() => {
      void this.reconcile();
      this.intervalHandle = setInterval(() => void this.reconcile(), RECONCILE_INTERVAL_MS);
    }, msUntil3AM);

    this.logger.log(`Reconciliation scheduler başlatıldı — ilk çalışma ${next3AM.toISOString()}`);
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async reconcile(): Promise<void> {
    this.logger.log('Wallet ↔ Account reconciliation başladı');

    let checkedCount = 0;
    let driftCount = 0;
    const drifts: { userId: string; walletBalance: string; accountBalance: string; diff: string }[] = [];

    // Tüm cüzdanları sayfalı tara
    const PAGE_SIZE = 500;
    let skip = 0;

    while (true) {
      const wallets = await this.walletModel
        .find({})
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean();

      if (wallets.length === 0) break;

      for (const wallet of wallets) {
        checkedCount++;
        const walletBal = new Decimal(wallet.balanceTL?.toString() ?? '0');

        const mainAccount = await this.accountModel
          .findOne({ userId: wallet.userId, type: 'MAIN' })
          .lean();

        if (!mainAccount) {
          this.logger.warn('MAIN hesap bulunamadı', { userId: wallet.userId });
          driftCount++;
          continue;
        }

        const accountBal = new Decimal(mainAccount.balance?.toString() ?? '0');
        const diff = walletBal.minus(accountBal).abs();

        if (diff.gt(DRIFT_THRESHOLD)) {
          driftCount++;
          drifts.push({
            userId: wallet.userId,
            walletBalance: walletBal.toFixed(2),
            accountBalance: accountBal.toFixed(2),
            diff: diff.toFixed(2),
          });
          this.logger.warn('Wallet ↔ Account drift tespit edildi', {
            userId: wallet.userId,
            walletBalance: walletBal.toFixed(2),
            accountBalance: accountBal.toFixed(2),
            diff: diff.toFixed(2),
          });
        }
      }

      skip += PAGE_SIZE;
    }

    if (driftCount > 0) {
      this.logger.error('Reconciliation tamamlandı — drift bulundu', {
        checkedCount,
        driftCount,
        drifts,
      });
    } else {
      this.logger.log('Reconciliation tamamlandı — drift yok', { checkedCount });
    }
  }
}
