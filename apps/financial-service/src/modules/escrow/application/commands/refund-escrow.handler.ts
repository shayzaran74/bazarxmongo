
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RefundEscrowCommand } from './refund-escrow.command';
import { IEscrowRepository } from '../../domain/repositories/escrow.repository.interface';
import { IWalletRepository } from '../../../wallet/domain/repositories/wallet.repository.interface';
import { IGeneralLedgerRepository } from '../../../ledger/domain/repositories/general-ledger.repository.interface';
import { GeneralLedgerEntry } from '../../../ledger/domain/entities/general-ledger-entry.entity';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Money } from '../../../wallet/domain/value-objects/money.vo';
import { Escrow } from '../../domain/entities/escrow.entity';

@CommandHandler(RefundEscrowCommand)
export class RefundEscrowHandler implements ICommandHandler<RefundEscrowCommand> {
  constructor(
    @Inject('IEscrowRepository')
    private readonly escrowRepository: IEscrowRepository,
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,
    @Inject('IGeneralLedgerRepository')
    private readonly ledgerRepository: IGeneralLedgerRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: RefundEscrowCommand): Promise<void> {
    const { orderId, reason } = command;

    await this.prisma.$transaction(async (tx) => {
      // 1. Atomic Read & Idempotency Check
      const escrow = await tx.escrow.findUnique({
        where: { orderId }
      });

      if (!escrow) throw new Error(`Escrow record not found for order: ${orderId}`);
      
      // Idempotency: Zaten iade edilmişse başarılı say
      if (escrow.status === 'REFUNDED') return;
      
      // Semantik kontrol: Sadece FONLANMIŞ (FUNDED) para iade edilebilir
      if (escrow.status !== 'FUNDED') {
        throw new Error(`Escrow bu durumdan iade edilemez: ${escrow.status}`);
      }

      const escrowEntity = Escrow.fromPersistence(escrow);
      escrowEntity.refund();

      // 2. Fetch Buyer Wallet (Atomic Read)
      const buyerWallet = await tx.wallet.findUnique({
        where: { userId: escrow.buyerId }
      });
      if (!buyerWallet) throw new Error(`Buyer wallet not found: ${escrow.buyerId}`);

      // 3. Find Buyer's MAIN Account
      const buyerMainAccount = await tx.account.findFirst({
        where: { userId: escrow.buyerId, type: 'MAIN' }
      });

      // 4. Update Database (Atomic)
      // a. Refund Legacy Wallet
      await tx.wallet.update({
        where: { userId: escrow.buyerId },
        data: {
          balanceTL: { increment: escrow.amount }
        }
      });

      // b. Update Escrow Status
      await tx.escrow.update({
        where: { orderId },
        data: {
          status: 'REFUNDED',
          updatedAt: escrowEntity.updatedAt
        }
      });

      // c. General Ledger Entry
      await tx.generalLedger.create({
        data: {
          type: 'REFUND',
          debitAccountId: 'SYSTEM_ESCROW_ACCOUNT',
          creditAccountId: escrow.buyerId,
          amount: escrow.amount,
          referenceId: orderId,
          refType: 'ORDER',
          note: `Order ${orderId} iadesi alıcıya aktarıldı. Sebep: ${reason || 'İptal'}`,
        }
      });

      // d. Account Transaction & Balance Sync (Modern)
      if (buyerMainAccount) {
        await tx.accountTransaction.create({
          data: {
            accountId: buyerMainAccount.id,
            type: 'REFUND',
            direction: 'CREDIT',
            amount: escrow.amount,
            description: `İade: Sipariş #${orderId} tutarı cüzdanınıza geri yüklendi.`,
            referenceId: orderId,
            referenceType: 'ORDER',
            status: 'COMPLETED'
          }
        });
        
        await tx.account.update({
          where: { id: buyerMainAccount.id },
          data: {
            balance: { increment: escrow.amount },
            availableBalance: { increment: escrow.amount }
          }
        });
      }
    });
  }
}
