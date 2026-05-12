// apps/backend/src/modules/menu/application/commands/advance-launch-partner-phase.handler.ts
// Master Plan v4.3 §2.8 — 3 Fazlı Süreç Yönetimi
// BazarX Go: LaunchPartner.restaurantId → vendorId

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AdvanceLaunchPartnerPhaseCommand } from './advance-launch-partner-phase.command';

const PHASE_TRANSITIONS: Record<string, string> = {
  PHASE_1: 'PHASE_2',
  PHASE_2: 'PHASE_3',
};

const PHASE_LABELS: Record<string, string> = {
  PHASE_1: 'Ay 1 — Platform profili + 60 menü taahhüdü',
  PHASE_2: 'Ay 2-3 — Ücretsiz reklam + QR operasyon desteği',
  PHASE_3: 'Ay 4+ — Ücretli B2B üyeliğe geçiş',
};

@CommandHandler(AdvanceLaunchPartnerPhaseCommand)
export class AdvanceLaunchPartnerPhaseHandler
  implements ICommandHandler<AdvanceLaunchPartnerPhaseCommand>
{
  private readonly logger = new Logger(AdvanceLaunchPartnerPhaseHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AdvanceLaunchPartnerPhaseCommand) {
    const { vendorId, adminId, notes } = command;

    const partner = await this.prisma.launchPartner.findUnique({
      where:   { vendorId },
      include: { vendor: { include: { profile: { select: { storeName: true } } } } },
    });
    if (!partner) throw new NotFoundException('Lansman ortağı bulunamadı');

    const currentPhase = partner.phase;
    const nextPhase    = PHASE_TRANSITIONS[currentPhase];

    if (!nextPhase) {
      throw new BadRequestException('Zaten son faza ulaşıldı (PHASE_3)');
    }

    // Faz 2'ye geçiş için: dağıtılan menü sayısı taahhüdü karşılamış mı?
    if (currentPhase === 'PHASE_1' && partner.distributedCount < partner.pledgedMenuCount) {
      throw new BadRequestException(
        `${partner.pledgedMenuCount} menü taahhüdünden yalnızca ${partner.distributedCount} dağıtıldı. Faz 2 için taahhüt karşılanmalı.`,
      );
    }

    const updateData: Record<string, unknown> = {
      phase: nextPhase,
      notes: notes ?? partner.notes,
    };
    if (nextPhase === 'PHASE_2') updateData.phase2StartDate = new Date();
    if (nextPhase === 'PHASE_3') updateData.phase3StartDate = new Date();

    await this.prisma.launchPartner.update({
      where: { vendorId },
      data:  updateData,
    });

    const storeName = partner.vendor.profile?.storeName ?? 'Satıcı';

    this.logger.log('Lansman ortağı fazı ilerledi', {
      vendorId,
      storeName,
      adminId,
      from: currentPhase,
      to:   nextPhase,
    });

    return {
      success: true,
      message: `${storeName} → ${PHASE_LABELS[nextPhase]}`,
      data: { previousPhase: currentPhase, currentPhase: nextPhase },
    };
  }
}
