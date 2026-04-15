// apps/financial-service/src/modules/wallet/application/commands/topup-wallet.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TopUpWalletCommand } from './topup-wallet.command';
import { IWalletRepository } from '../../domain/repositories/wallet.repository.interface';
import { Money } from '../../domain/value-objects/money.vo';
import { Wallet } from '../../domain/entities/wallet.entity';
import { NotFoundException } from '@barterborsa/shared-core';
import { Inject } from '@nestjs/common';

@CommandHandler(TopUpWalletCommand)
export class TopUpWalletHandler implements ICommandHandler<TopUpWalletCommand> {
  constructor(
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository
  ) {}

  async execute(command: TopUpWalletCommand): Promise<void> {
    const { userId, amount, currency } = command;

    let wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      // Cüzdan yoksa oluştur (Auto-provisioning)
      wallet = Wallet.create(userId);
    }

    const moneyToAdd = Money.fromDecimal(amount, currency);
    
    if (currency === 'TRY') {
      wallet.topUpTL(moneyToAdd);
    } else {
      // Diğer para birimleri için mantık eklenebilir
      throw new Error(`${currency} için bakiye yükleme henüz desteklenmiyor.`);
    }

    await this.walletRepository.save(wallet);
  }
}
// Note: Wallet model was imported implicitly, need to add it or fix.
