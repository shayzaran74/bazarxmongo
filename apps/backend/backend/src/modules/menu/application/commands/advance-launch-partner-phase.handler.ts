// apps/backend/src/modules/menu/application/commands/advance-launch-partner-phase.handler.ts
// Master Plan v4.3 §2.8 — 3 Fazlı Süreç Yönetimi

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ILaunchPartner, IVendor, IUserProfile } from '@barterborsa/shared-persistence';
import { AdvanceLaunchPartnerPhaseCommand } from './advance-launch-partner-phase.command';

const PHASE_TRANSITIONS: Record<string, string> = { PHASE_1: 'PHASE_2', PHASE_2: 'PHASE_3' };
const PHASE_LABELS: Record<string, string> = {
  PHASE_1: 'Ay 1 — Platform profili + 60 menü taahhüdü',
  PHASE_2: 'Ay 2-3 — Ücretsiz reklam + QR operasyon desteği',
  PHASE_3: 'Ay 4+ — Ücretli B2B üyeliğe geçiş',
};

@CommandHandler(AdvanceLaunchPartnerPhaseCommand)
export class AdvanceLaunchPartnerPhaseHandler implements ICommandHandler<AdvanceLaunchPartnerPhaseCommand> {
  private readonly logger = new Logger(AdvanceLaunchPartnerPhaseHandler.name);

  constructor(
    @InjectModel('LaunchPartner') private readonly partnerModel: Model<ILaunchPartner>,
    @InjectModel('Vendor')        private readonly vendorModel:  Model<IVendor>,
    @InjectModel('UserProfile')   private readonly profileModel: Model<IUserProfile>,
  ) {}

  async execute(command: AdvanceLaunchPartnerPhaseCommand) {
    const { vendorId, adminId, notes } = command;

    const partner = await this.partnerModel.findOne({ vendorId }).lean();
    if (!partner) throw new NotFoundException('Lansman ortağı bulunamadı');

    const currentPhase = partner.phase;
    const nextPhase    = PHASE_TRANSITIONS[currentPhase];
    if (!nextPhase) throw new BadRequestException('Zaten son faza ulaşıldı (PHASE_3)');

    if (currentPhase === 'PHASE_1' && partner.distributedCount < partner.pledgedMenuCount) {
      throw new BadRequestException(
        `${partner.pledgedMenuCount} menü taahhüdünden yalnızca ${partner.distributedCount} dağıtıldı. Faz 2 için taahhüt karşılanmalı.`,
      );
    }

    const updateData: Record<string, unknown> = { phase: nextPhase, notes: notes ?? partner.notes };
    if (nextPhase === 'PHASE_2') updateData.phase2StartDate = new Date();
    if (nextPhase === 'PHASE_3') updateData.phase3StartDate = new Date();

    await this.partnerModel.updateOne({ vendorId }, { $set: updateData });

    // Satıcı profil adını bul
    const vendor  = await this.vendorModel.findOne({ id: vendorId }, { userId: 1 }).lean();
    const profile = vendor ? await this.profileModel.findOne({ userId: vendor.userId }, { storeName: 1 }).lean() : null;
    const storeName = (profile as Record<string, unknown> | null)?.storeName as string ?? 'Satıcı';

    this.logger.log('Lansman ortağı fazı ilerledi', { vendorId, storeName, adminId, from: currentPhase, to: nextPhase });

    return {
      success: true,
      message: `${storeName} → ${PHASE_LABELS[nextPhase]}`,
      data: { previousPhase: currentPhase, currentPhase: nextPhase },
    };
  }
}
