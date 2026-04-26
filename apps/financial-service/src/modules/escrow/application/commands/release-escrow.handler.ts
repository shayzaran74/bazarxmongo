
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReleaseEscrowCommand } from './release-escrow.command';
import { IEscrowRepository } from '../../domain/repositories/escrow.repository.interface';
import { IWalletRepository } from '../../../wallet/domain/repositories/wallet.repository.interface';
import { IGeneralLedgerRepository } from '../../../ledger/domain/repositories/general-ledger.repository.interface';
import { GeneralLedgerEntry } from '../../../ledger/domain/entities/general-ledger-entry.entity';
import { Decimal } from 'decimal.js';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Money } from '../../../wallet/domain/value-objects/money.vo';
import { Escrow } from '../../domain/entities/escrow.entity';

@CommandHandler(ReleaseEscrowCommand)
export class ReleaseEscrowHandler implements ICommandHandler<ReleaseEscrowCommand> {
  constructor(
    @Inject('IEscrowRepository')
    private readonly escrowRepository: IEscrowRepository,
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,
    @Inject('IGeneralLedgerRepository')
    private readonly ledgerRepository: IGeneralLedgerRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: ReleaseEscrowCommand): Promise<void> {
    const { orderId } = command;

    await this.prisma.$transaction(async (tx) => {
      // 1. Atomic Read & Idempotency Check
      const escrow = await tx.escrow.findUnique({
        where: { orderId }
      });

      if (!escrow) throw new Error(`Escrow record not found for order: ${orderId}`);
      
      // Idempotency: Zaten çözülmüşse hata verme, başarılı say (Ağ retry'ları için)
      if (escrow.status === 'RELEASED') return;
      
      // Semantik kontrol: Sadece FONLANMIŞ (FUNDED) para çözülebilir
      if (escrow.status !== 'FUNDED') {
        throw new Error(`Escrow bu durumdan serbest bırakılamaz: ${escrow.status}`);
      }

      const escrowEntity = Escrow.fromPersistence(escrow);
      escrowEntity.release();

      // 2. Fetch or Create Seller Wallet (Atomic Upsert)
      // Transaction içinde satıcının cüzdanını bul veya oluştur
      await tx.wallet.upsert({
        where: { userId: escrow.sellerId },
        update: {
          balanceTL: { increment: escrow.amount }
        },
        create: {
          userId: escrow.sellerId,
          balanceTL: escrow.amount,
          barterBalance: 0,
          xpPoints: 0,
          xpAdsBalance: 0,
          xpTradeBalance: 0,
          xpCommissionBalance: 0
        }
      });

      // 3. Find Seller's MAIN Account (Atomic Read)
      const sellerMainAccount = await tx.account.findFirst({
        where: { userId: escrow.sellerId, type: 'MAIN' }
      });

      // 4. Update Escrow Status
      await tx.escrow.update({
        where: { orderId },
        data: {
          status: 'RELEASED',
          releasedAt: escrowEntity.releasedAt,
          releasedAmount: escrowEntity.releasedAmount,
          updatedAt: escrowEntity.updatedAt
        }
      });

      // 5. Accounting (General Ledger)
      await tx.generalLedger.create({
        data: {
          type: 'ESCROW_RELEASE',
          debitAccountId: 'SYSTEM_ESCROW_ACCOUNT',
          creditAccountId: escrow.sellerId,
          amount: escrow.amount,
          referenceId: orderId,
          refType: 'ORDER',
          note: `Order ${orderId} emanet ödemesi satıcıya aktarıldı.`,
        }
      });

      // 6. Account Transaction & Balance Sync (Modern Table)
      if (sellerMainAccount) {
        await tx.accountTransaction.create({
          data: {
            accountId: sellerMainAccount.id,
            type: 'RELEASE',
            direction: 'CREDIT',
            amount: escrow.amount,
            description: `Sipariş #${orderId} ödemesi cüzdanınıza eklendi.`,
            referenceId: orderId,
            referenceType: 'ORDER',
            status: 'COMPLETED'
          }
        });
        
        await tx.account.update({
          where: { id: sellerMainAccount.id },
          data: {
            balance: { increment: escrow.amount },
            availableBalance: { increment: escrow.amount }
          }
        });
      }
    });
  }
}
