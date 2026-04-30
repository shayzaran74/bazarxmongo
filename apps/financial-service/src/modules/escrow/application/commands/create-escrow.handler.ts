// apps/financial-service/src/modules/escrow/application/commands/create-escrow.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEscrowCommand } from './create-escrow.command';
import { Escrow } from '../../domain/entities/escrow.entity';
import { Decimal } from 'decimal.js';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@CommandHandler(CreateEscrowCommand)
export class CreateEscrowHandler implements ICommandHandler<CreateEscrowCommand, Escrow> {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: CreateEscrowCommand): Promise<Escrow> {
    const { orderId, buyerId, sellerId, amount } = command;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Mükerrer kontrol — aynı sipariş için escrow zaten açılmışsa döndür
      const existingEscrow = await tx.escrow.findUnique({ where: { orderId } });
      if (existingEscrow) {
        return Escrow.fromPersistence(existingEscrow);
      }

      // 2. Atomik okuma (Transaction içinde — TOCTOU önlemi)
      const [walletRecord, mainAccount] = await Promise.all([
        tx.wallet.findUnique({ where: { userId: buyerId } }),
        tx.account.findFirst({ where: { userId: buyerId, type: 'MAIN' } }),
      ]);

      if (!walletRecord) throw new Error('Kullanıcı cüzdanı bulunamadı.');
      if (!mainAccount) throw new Error('Kullanıcının ana (MAIN) hesabı bulunamadı.');

      const amountDec = new Decimal(amount);
      if (walletRecord.balanceTL.lessThan(amountDec)) {
        throw new Error('Yersiz bakiye.');
      }

      // 3. Atomik yazma
      // a. Legacy cüzdan düşümü
      await tx.wallet.update({
        where: { userId: buyerId },
        data: { balanceTL: { decrement: amountDec } },
      });

      // b. Modern Account tablosu senkronizasyonu
      await tx.account.update({
        where: { id: mainAccount.id },
        data: {
          balance: { decrement: amountDec },
          availableBalance: { decrement: amountDec },
        },
      });

      // c. Escrow kaydı oluştur
      const escrow = await tx.escrow.create({
        data: {
          orderId,
          buyerId,
          sellerId,
          amount: amountDec,
          status: 'FUNDED',
        },
      });

      // d. Muhasebe kaydı
      await tx.generalLedger.create({
        data: {
          type: 'ESCROW_FUND',
          debitAccountId: buyerId,
          creditAccountId: 'SYSTEM_ESCROW_ACCOUNT',
          amount: amountDec,
          referenceId: orderId,
          refType: 'ORDER',
          note: `Order ${orderId} için bakiye rezerve edildi.`,
        },
      });

      // e. Kullanıcı ekstresi kaydı
      await tx.accountTransaction.create({
        data: {
          accountId: mainAccount.id,
          type: 'PAYMENT',
          direction: 'DEBIT',
          amount: amountDec,
          description: `Sipariş #${orderId} için ödeme (Emanet)`,
          referenceId: orderId,
          referenceType: 'ORDER',
          status: 'COMPLETED',
        },
      });

      return Escrow.fromPersistence(escrow);
    });
  }
}
