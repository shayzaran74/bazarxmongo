// apps/backend/src/modules/barter/application/commands/record-trust-violation.handler.ts
// Master Plan v4.3 §3.3 — 1. ihlal uyarı, 2. −15 puan, 3. dondurma

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { RecordTrustViolationCommand } from './record-trust-violation.command';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { ITrustScoreRepository } from '../../../vendor/domain/repositories/trust-score.repository.interface';
import { Types } from 'mongoose';

@CommandHandler(RecordTrustViolationCommand)
export class RecordTrustViolationHandler implements ICommandHandler<RecordTrustViolationCommand> {
  private readonly logger = new Logger(RecordTrustViolationHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @Inject('ITrustScoreRepository') private readonly trustScoreRepository: ITrustScoreRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: RecordTrustViolationCommand) {
    const { vendorId, violationType, description, adminId } = command;

    let trustScore = await this.trustScoreRepository.findByVendorId(vendorId);

    if (!trustScore) {
      trustScore = {
        id: 'trust-' + crypto.randomUUID(),
        vendorId,
        score: Types.Decimal128.fromString('100'),
        tradingPerformance: Types.Decimal128.fromString('100'),
        xpLoyalty: Types.Decimal128.fromString('100'),
        compliance: Types.Decimal128.fromString('100'),
        level: 'GOOD',
        lastCalculatedAt: new Date(),
        isFrozen: false,
        violationCount: 0,
        inactiveDays: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const newViolationCount = (trustScore.violationCount || 0) + 1;
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

    const newScore      = Math.max(0, Number(trustScore.score?.toString() ?? 100) - compliancePenalty);
    const newCompliance = Math.max(0, Number(trustScore.compliance?.toString() ?? 100) - compliancePenalty);

    await this.trustScoreRepository.updateScore(vendorId, {
      score: newScore,
      compliance: newCompliance,
      violationCount: newViolationCount,
      isFrozen: freeze,
    });

    // Hesap dondurulursa vendor'ı askıya al
    if (freeze) {
      const vendor = await this.vendorRepository.findById(vendorId);
      if (vendor) {
        await this.vendorRepository.update(vendorId, { status: 'SUSPENDED' });
      }
    }

    await this.auditLog.log({
      actorId:      adminId,
      action:       `TRUST_VIOLATION_${action}`,
      resourceType: 'TrustScore',
      resourceId:   vendorId,
      oldValue:     { score: trustScore.score, violations: trustScore.violationCount },
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