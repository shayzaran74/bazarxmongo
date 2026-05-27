// apps/backend/src/modules/menu/application/commands/update-surprise-menu.handler.ts
// BazarX-GO §10 — Sürpriz menü opt-in/opt-out yönetimi

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ISurpriseMenu } from '@barterborsa/shared-persistence';
import { UpdateSurpriseMenuCommand } from './update-surprise-menu.command';

@CommandHandler(UpdateSurpriseMenuCommand)
export class UpdateSurpriseMenuHandler implements ICommandHandler<UpdateSurpriseMenuCommand> {
  private readonly logger = new Logger(UpdateSurpriseMenuHandler.name);

  constructor(
    @InjectModel('SurpriseMenu') private readonly model: Model<ISurpriseMenu>,
  ) {}

  async execute(cmd: UpdateSurpriseMenuCommand) {
    const { vendorId, listingId, isActive, activeHours, dailyQuota, radiusMeters } = cmd;

    const fields = { isActive, listingId, activeHours, dailyQuota, radiusMeters };
    const newId  = new Types.ObjectId().toString();

    const result = await this.model.findOneAndUpdate(
      { vendorId },
      {
        $set:         fields,
        $setOnInsert: { _id: newId, id: newId, vendorId, usedToday: 0, lastResetAt: new Date() },
      },
      { upsert: true, new: true },
    );

    this.logger.log('Sürpriz menü güncellendi', { vendorId, isActive });

    return { success: true, data: result };
  }
}
