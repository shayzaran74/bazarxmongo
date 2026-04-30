// apps/backend/src/modules/barter/application/commands/record-trust-violation.handler.ts
// Master Plan v4.3 §3.3 — 1. ihlal uyarı, 2. −15 puan, 3. dondurma

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { RecordTrustViolationCommand } from './record-trust-violation.command';
import { TrustScoreCalculatorService } from '../services/trust-score-calculator.service';

@CommandHandler(RecordTrustViolationCommand)
export class RecordTrustViolationHandler implements ICommandHandler<RecordTrustViolationCommand> {
  private readonly logger = new Logger(RecordTrustViolationHandler.name);

  constructor(
    private readonly prisma:      PrismaService,
    private readonly calculator:  TrustScoreCalculatorService,
    private readonly auditLog:    AuditLogService,
  ) {}

  async execute(command: RecordTrustViolationCommand) {
    const { vendorId, violationType, description, adminId } = command;

    const existing = await this.prisma.trustScore.findUnique({ where: { vendorId } });

    let trustScore = existing ?? await this.prisma.trustScore.create({
      data: { vendorId, score: 100, tradingPerformance: 100, xpLoyalty: 100, compliance: 100 },
    });

    const newViolationCount = trustScore.violationCount + 1;
    let action = 'WARNING';
    let compliancePenalty = 0;
    let freeze = false;

    // Master Plan ihlal kademeleri
    if (newViolationCount === 1) {
      action = 'WARNING';
      compliancePenalty = 0;
      this.logger.warn('1. İhlal — Uyarı verildi', { vendorId, violationType });
    } else if (newViolationCount === 2) {
      action = 'PENALTY_15';
      compliancePenalty = 15;
      this.logger.warn('2. İhlal — 15 puan kesildi', { vendorId, violationType });
    } else {
      action = 'FREEZE';
      freeze = true;
      this.logger.warn('3. İhlal — Hesap donduruldu', { vendorId, violationType });
    }

    const newScore      = Math.max(0, Number(trustScore.score) - compliancePenalty);
    const newCompliance = Math.max(0, Number(trustScore.compliance) - compliancePenalty);

    await this.prisma.trustScore.update({
      where: { vendorId },
      data: {
        violationCount:  newViolationCount,
        score:           newScore,
        compliance:      newCompliance,
        isFrozen:        freeze,
        lastCalculatedAt: new Date(),
      },
    });

    // Hesap dondurulursa vendor'ı askıya al
    if (freeze) {
      await this.prisma.vendor.update({
        where: { id: vendorId },
        data:  { status: 'SUSPENDED', suspensionReason: `3. TrustScore ihlali: ${violationType}` },
      });
    }

    await this.auditLog.log({
      actorId:      adminId,
      action:       `TRUST_VIOLATION_${action}`,
      resourceType: 'TrustScore',
      resourceId:   vendorId,
      oldValue:     { score: Number(trustScore.score), violations: trustScore.violationCount },
      newValue:     { score: newScore, violations: newViolationCount, action, freeze },
    });

    return {
      success:        true,
      action,
      message:        this.actionMessage(newViolationCount, freeze),
      newScore,
      violationCount: newViolationCount,
      isFrozen:       freeze,
    };
  }

  private actionMessage(count: number, freeze: boolean): string {
    if (freeze) return '3. ihlal: Hesap donduruldu ve vendor askıya alındı.';
    if (count === 2) return '2. ihlal: TrustScore −15 puan düşürüldü.';
    return '1. ihlal: Uyarı verildi, puan düşmedi.';
  }
}
