// apps/financial-service/src/modules/commission/application/commands/calculate-commission.handler.ts

import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CalculateCommissionCommand } from './calculate-commission.command';
import { CommissionCalculatorService } from '../../domain/services/commission-calculator.service';
import { ICommissionRepository } from '../../domain/repositories/commission.repository.interface';
import { CommissionRecord } from '../../domain/entities/commission-record.entity';
import { TopUpWalletCommand } from '../../../wallet/application/commands/topup-wallet.command';

@CommandHandler(CalculateCommissionCommand)
export class CalculateCommissionHandler implements ICommandHandler<CalculateCommissionCommand> {
  constructor(
    private readonly calculator: CommissionCalculatorService,
    @Inject('ICommissionRepository')
    private readonly commissionRepository: ICommissionRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: CalculateCommissionCommand): Promise<void> {
    const { vendorId, vendorTier, amount, type, referenceId, referenceType } = command;

    // 1. Hesapla
    const { rate, commission } = this.calculator.calculate(amount, vendorTier);

    // 2. Kaydet
    const record = CommissionRecord.create({
      vendorId,
      vendorTier,
      baseAmount: amount,
      commissionRate: rate,
      commissionAmount: commission,
      commissionType: type,
      orderId: referenceType === 'ORDER' ? referenceId : undefined,
      tradeOfferId: referenceType === 'TRADE' ? referenceId : undefined,
    });

    await this.commissionRepository.save(record);

    // 3. Cüzdana işleme (Platform komisyon cüzdanına ekle)
    // Gerçek senaryoda bu bir System UserIdsine (Platform) aktarılır.
    await this.commandBus.execute(
      new TopUpWalletCommand(
        'SYSTEM_PLATFORM_ACCOUNT', // Platformun genel cüzdanı
        commission,
        type === 'CASH' ? 'TRY' : 'BARTER',
        `commission_${record.id}`
      )
    );

    record.markAsCollected();
    await this.commissionRepository.save(record);
  }
}
