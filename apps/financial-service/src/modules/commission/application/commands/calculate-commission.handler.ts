// apps/financial-service/src/modules/commission/application/commands/calculate-commission.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { CalculateCommissionCommand } from './calculate-commission.command';
import { CommissionCalculatorService } from '../../domain/services/commission-calculator.service';
import {
  IWallet,
  IFinancialCommissionRecord,
  IFinancialGeneralLedger,
} from '@barterborsa/shared-persistence';

const d128 = (v: number | string): Types.Decimal128 =>
  Types.Decimal128.fromString(Number(v).toFixed(4));

@CommandHandler(CalculateCommissionCommand)
export class CalculateCommissionHandler implements ICommandHandler<CalculateCommissionCommand> {
  constructor(
    @InjectModel('CommissionRecord') private readonly commissionModel: Model<IFinancialCommissionRecord>,
    @InjectModel('Wallet') private readonly walletModel: Model<IWallet>,
    @InjectModel('GeneralLedger') private readonly ledgerModel: Model<IFinancialGeneralLedger>,
    @InjectConnection() private readonly connection: Connection,
    private readonly calculator: CommissionCalculatorService,
  ) {}

  async execute(command: CalculateCommissionCommand): Promise<void> {
    const { vendorId, vendorTier, amount, type, referenceId, referenceType } = command;

    const { rate, commission } = this.calculator.calculateSimple(amount, vendorTier);
    const currency = type === 'CASH' ? 'TRY' : 'BARTER';

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        // Mükerrer kontrol
        const existing = await this.commissionModel
          .findOne({
            ...(referenceType === 'ORDER' ? { orderId: referenceId } : { tradeOfferId: referenceId }),
            status: 'COLLECTED',
          })
          .session(session)
          .lean();
        if (existing) return;

        const now = new Date();
        const newId = new Types.ObjectId().toString();

        await this.commissionModel.create(
          [{
            _id: newId, id: newId, vendorId, vendorTier,
            baseAmount:       d128(amount.toFixed(4)),
            commissionRate:   d128(String(rate)),
            commissionAmount: d128(commission.toFixed(4)),
            commissionType:   type as IFinancialCommissionRecord['commissionType'],
            orderId:    referenceType === 'ORDER' ? referenceId : undefined,
            tradeOfferId: referenceType === 'TRADE' ? referenceId : undefined,
            status: 'COLLECTED', createdAt: now, collectedAt: now,
          }],
          { session },
        );

        if (currency === 'TRY') {
          await this.walletModel.findOneAndUpdate(
            { userId: 'SYSTEM_PLATFORM_ACCOUNT' },
            {
              $inc: { balanceTL: d128(commission.toFixed(2)) },
              $setOnInsert: {
                _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), userId: 'SYSTEM_PLATFORM_ACCOUNT',
                barterBalance: d128(0), xpPoints: 0,
                xpAdsBalance: d128(0), xpTradeBalance: d128(0), xpCommissionBalance: d128(0),
              },
            },
            { upsert: true, session },
          );
        }

        await this.ledgerModel.create(
          [{
            _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), type: 'DEBIT',
            debitAccountId:  vendorId,
            creditAccountId: 'SYSTEM_PLATFORM_ACCOUNT',
            amount:          d128(commission.toFixed(2)),
            referenceId:     `commission_${referenceType}_${referenceId}`,
            refType:         referenceType,
            note:            `Komisyon tahsilatı — Tier: ${vendorTier}, Oran: %${rate}`,
          }],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
  }
}
