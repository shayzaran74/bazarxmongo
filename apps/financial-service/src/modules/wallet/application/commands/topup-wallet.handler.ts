// apps/financial-service/src/modules/wallet/application/commands/topup-wallet.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TopUpWalletCommand } from './topup-wallet.command';
import { IWalletRepository } from '../../domain/repositories/wallet.repository.interface';
import { Money } from '../../domain/value-objects/money.vo';
import { Wallet } from '../../domain/entities/wallet.entity';
import { NotFoundException } from '@barterborsa/shared-core';
import { Inject } from '@nestjs/common';
import { IGeneralLedgerRepository } from '../../../ledger/domain/repositories/general-ledger.repository.interface';

@CommandHandler(TopUpWalletCommand)
export class TopUpWalletHandler implements ICommandHandler<TopUpWalletCommand> {
  constructor(
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,
    @Inject('IGeneralLedgerRepository')
    private readonly ledgerRepository: IGeneralLedgerRepository,
  ) {}

  async execute(command: TopUpWalletCommand): Promise<void> {
    const { userId, amount, currency } = command;

    let wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      wallet = Wallet.create(userId);
    }

    const moneyToAdd = Money.fromDecimal(amount, currency);
    
    if (currency === 'TRY') {
      wallet.topUpTL(moneyToAdd);
    } else {
      throw new Error(`${currency} için bakiye yükleme henüz desteklenmiyor.`);
    }

    // Record in General Ledger
    const { GeneralLedgerEntry } = await import('../../../ledger/domain/entities/general-ledger-entry.entity');
    const ledgerEntry = GeneralLedgerEntry.create({
      type: 'DEPOSIT',
      debitAccountId: 'SYSTEM_BANK_ACCOUNT',
      creditAccountId: userId,
      amount: amount,
      referenceId: command.idempotencyKey || `topup-${Date.now()}`,
      refType: 'TOPUP',
      note: `Cüzdan bakiye yükleme (${currency})`,
    });

    await this.walletRepository.save(wallet);
    await this.ledgerRepository.save(ledgerEntry);

    // Sync Prisma Account table
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Find MAIN account
    const mainAcc = await prisma.account.findFirst({
      where: { userId, type: 'MAIN' }
    });
    
    if (mainAcc) {
      await prisma.account.update({
        where: { id: mainAcc.id },
        data: {
          balance: { increment: amount },
          availableBalance: { increment: amount }
        }
      });
    }
    await prisma.$disconnect();
  }
}
// Note: Wallet model was imported implicitly, need to add it or fix.
