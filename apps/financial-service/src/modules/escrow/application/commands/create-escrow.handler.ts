// apps/financial-service/src/modules/escrow/application/commands/create-escrow.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateEscrowCommand } from './create-escrow.command';
import { IEscrowRepository } from '../../domain/repositories/escrow.repository.interface';
import { Escrow } from '../../domain/entities/escrow.entity';
import { IWalletRepository } from '../../../wallet/domain/repositories/wallet.repository.interface';
import { IGeneralLedgerRepository } from '../../../ledger/domain/repositories/general-ledger.repository.interface';
import { GeneralLedgerEntry } from '../../../ledger/domain/entities/general-ledger-entry.entity';
import { Decimal } from 'decimal.js';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@CommandHandler(CreateEscrowCommand)
export class CreateEscrowHandler implements ICommandHandler<CreateEscrowCommand, Escrow> {
  constructor(
    @Inject('IEscrowRepository')
    private readonly escrowRepository: IEscrowRepository,
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,
    @Inject('IGeneralLedgerRepository')
    private readonly ledgerRepository: IGeneralLedgerRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: CreateEscrowCommand): Promise<Escrow> {
    const { orderId, buyerId, sellerId, amount } = command;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Idempotency Check (Mükerrer kontrolü)
      const existingEscrow = await tx.escrow.findUnique({
        where: { orderId }
      });
      if (existingEscrow) {
        return Escrow.fromPersistence(existingEscrow);
      }

      // 2. Atomic Read (Transaction içinde okuma - TOCTOU önlemi)
      const [walletRecord, mainAccount] = await Promise.all([
        tx.wallet.findUnique({ where: { userId: buyerId } }),
        tx.account.findFirst({ where: { userId: buyerId, type: 'MAIN' } })
      ]);

      if (!walletRecord) throw new Error('Kullanıcı cüzdanı bulunamadı.');
      if (!mainAccount) throw new Error('Kullanıcının ana (MAIN) hesabı bulunamadı.');

      const amountDec = new Decimal(amount);
      if (walletRecord.balanceTL.lessThan(amountDec)) {
        throw new Error('Yersiz bakiye.');
      }

      // 3. Update Database (Atomic and Consistent)
      // a. Update Legacy Wallet
      const updatedWallet = await tx.wallet.update({
        where: { userId: buyerId },
        data: {
          balanceTL: { decrement: amountDec }
        }
      });

      // b. Update Modern Account Table (Sync with legacy)
      await tx.account.update({
        where: { id: mainAccount.id },
        data: {
          balance: { decrement: amountDec },
          availableBalance: { decrement: amountDec }
        }
      });

      // c. Create Escrow Record
      const escrow = await tx.escrow.create({
        data: {
          orderId,
          buyerId,
          sellerId,
          amount: amountDec,
          status: 'FUNDED'
        }
      });

      // d. Create Ledger Entry (Muhasebe)
      await tx.generalLedger.create({
        data: {
          type: 'ESCROW_FUND',
          debitAccountId: buyerId,
          creditAccountId: 'SYSTEM_ESCROW_ACCOUNT',
          amount: amountDec,
          referenceId: orderId,
          refType: 'ORDER',
          note: `Order ${orderId} için bakiye rezerve edildi.`,
        }
      });

      // e. Create Account Transaction (Kullanıcı ekstresi için)
      await tx.accountTransaction.create({
        data: {
          accountId: mainAccount.id,
          type: 'PAYMENT',
          direction: 'DEBIT',
          amount: amountDec,
          description: `Sipariş #${orderId} için ödeme (Emanet)`,
          referenceId: orderId,
          referenceType: 'ORDER',
          status: 'COMPLETED'
        }
      });

      return Escrow.fromPersistence(escrow);
    });
  }
}
