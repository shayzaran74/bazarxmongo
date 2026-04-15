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

@CommandHandler(CreateEscrowCommand)
export class CreateEscrowHandler implements ICommandHandler<CreateEscrowCommand> {
  constructor(
    @Inject('IEscrowRepository')
    private readonly escrowRepository: IEscrowRepository,
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,
    @Inject('IGeneralLedgerRepository')
    private readonly ledgerRepository: IGeneralLedgerRepository,
  ) {}

  async execute(command: CreateEscrowCommand): Promise<void> {
    const { orderId, buyerId, sellerId, amount } = command;

    // 1. Mükerrer kontrolü
    const existing = await this.escrowRepository.findByOrderId(orderId);
    if (existing) return;

    // 2. Cüzdan kontrolü ve bakiye düşümü
    const wallet = await this.walletRepository.findByUserId(buyerId);
    if (!wallet) throw new Error('Kullanıcı cüzdanı bulunamadı.');
    
    // Money VO kullanarak bakiye düş (Not: Money.fromDecimal kullanımı varsayılmıştır)
    const orderMoney = { amount: new Decimal(amount), currency: 'TRY' } as any; 
    wallet.withdrawTL(orderMoney); 

    // 3. Emanet kaydı oluştur
    const escrow = Escrow.create({
      orderId,
      buyerId,
      sellerId,
      amount: new Decimal(amount),
    });

    // 4. Muhasebe kaydı (Defter-i Kebir)
    const ledgerEntry = GeneralLedgerEntry.create({
      type: 'ESCROW_FUND',
      debitAccountId: buyerId,
      creditAccountId: 'SYSTEM_ESCROW_ACCOUNT',
      amount: new Decimal(amount),
      referenceId: orderId,
      refType: 'ORDER',
      note: `Order ${orderId} için bakiye rezerve edildi.`,
    });

    // 5. Atomik kayıt (İdealde bir unit-of-work/transaction içinde olmalı)
    await this.walletRepository.save(wallet);
    await this.escrowRepository.save(escrow);
    await this.ledgerRepository.save(ledgerEntry); 
  }
}
