// apps/financial-service/src/modules/wallet/application/commands/reject-topup.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RejectTopUpCommand } from './reject-topup.command';
import { NotFoundException } from '@barterborsa/shared-core';
import { IFinancialAccountTopUpRequest } from '@barterborsa/shared-persistence';

@CommandHandler(RejectTopUpCommand)
export class RejectTopUpHandler implements ICommandHandler<RejectTopUpCommand> {
  constructor(
    @InjectModel('AccountTopUpRequest')
    private readonly topUpModel: Model<IFinancialAccountTopUpRequest>,
  ) {}

  async execute(command: RejectTopUpCommand): Promise<void> {
    const { requestId, adminId, reason } = command;

    const request = await this.topUpModel.findById(requestId).lean();

    if (!request) throw new NotFoundException(`Top-up isteği bulunamadı: ${requestId}`);
    if (request.status !== 'PENDING') throw new Error(`İstek zaten işlenmiş: ${request.status}`);

    await this.topUpModel.updateOne(
      { _id: requestId },
      {
        $set: {
          status:          'REJECTED',
          rejectionReason: reason,
          processedAt:     new Date(),
          processedBy:     adminId,
        },
      },
    );
  }
}
