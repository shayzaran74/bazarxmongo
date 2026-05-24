// apps/backend/src/modules/barter/application/services/dispute-resolution-scheduler.service.ts
// Master Plan v4.3 §3.4 — Uyuşmazlık Çözüm Otomasyonu
// Akış: OPEN → (24h) → AUTO_REVIEW → otomatik karar | MANUAL_REVIEW → (48h) → ARBITRATION → RESOLVED

import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IDisputeRepository } from '../../domain/repositories/dispute.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DisputeResolutionStatus, DISPUTE_TIMINGS } from '../../domain/enums/dispute-resolution-status.enum';
import { IBarterDisputeLog } from '@barterborsa/shared-persistence/schemas/backend/barterDisputeLog.schema';

const TICK_INTERVAL_MS = 15 * 60 * 1000;
const BATCH_SIZE = 50;

@Injectable()
export class DisputeResolutionSchedulerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(DisputeResolutionSchedulerService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject('IDisputeRepository') private readonly disputeRepo: IDisputeRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  onApplicationBootstrap(): void {
    setTimeout(() => {
      void this.tick();
      this.intervalHandle = setInterval(() => void this.tick(), TICK_INTERVAL_MS);
    }, 60_000);
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }

  async tick(): Promise<void> {
    try {
      await this.transitionOpenToAutoReview();
      await this.transitionAutoReviewToFinal();
      await this.transitionManualReviewToArbitration();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('Dispute scheduler tick hatası', { error: msg });
    }
  }

  private async transitionOpenToAutoReview(): Promise<void> {
    const cutoff = new Date(Date.now() - DISPUTE_TIMINGS.RESPONSE_WINDOW_HOURS * 60 * 60 * 1000);

    const rows = await this.disputeRepo.findByStatusAndCreatedBefore(
      DisputeResolutionStatus.OPEN,
      cutoff,
      BATCH_SIZE,
    );

    for (const row of rows) {
      const deadline = new Date(Date.now() + DISPUTE_TIMINGS.RESPONSE_WINDOW_HOURS * 60 * 60 * 1000);
      await this.disputeRepo.updateStatusAndDeadline(row.id, DisputeResolutionStatus.AUTO_REVIEW, deadline);

      await this.auditLog.log({
        actorId:      'SYSTEM',
        action:       'DISPUTE_AUTO_REVIEW_TRIGGERED',
        resourceType: 'BarterDisputeLog',
        resourceId:   row.id,
        newValue:     { previousStatus: row.status, newStatus: DisputeResolutionStatus.AUTO_REVIEW },
      });
    }

    if (rows.length > 0) {
      this.logger.log(`OPEN → AUTO_REVIEW geçişi: ${rows.length} kayıt`);
    }
  }

  private async transitionAutoReviewToFinal(): Promise<void> {
    const rows = await this.disputeRepo.findByStatus(
      DisputeResolutionStatus.AUTO_REVIEW,
      BATCH_SIZE,
    );

    for (const row of rows) {
      const verdict = this.autoDecide(row);

      if (verdict.kind === 'AUTO_RESOLVED') {
        await this.disputeRepo.updateResolutionDetails(row.id, {
          status:         DisputeResolutionStatus.RESOLVED,
          resolution:     verdict.resolution,
          resolutionNote: verdict.note,
          resolvedAt:     new Date(),
          arbitratorType: 'INTERNAL',
        });

        await this.auditLog.log({
          actorId:      'SYSTEM',
          action:       'DISPUTE_AUTO_RESOLVED',
          resourceType: 'BarterDisputeLog',
          resourceId:   row.id,
          newValue:     { resolution: verdict.resolution, reason: verdict.note },
        });
      } else {
        const deadline = new Date(Date.now() + DISPUTE_TIMINGS.MANUAL_REVIEW_HOURS * 60 * 60 * 1000);
        await this.disputeRepo.updateStatusAndDeadline(
          row.id,
          DisputeResolutionStatus.MANUAL_REVIEW,
          deadline,
        );

        await this.auditLog.log({
          actorId:      'SYSTEM',
          action:       'DISPUTE_ESCALATED_TO_MANUAL_REVIEW',
          resourceType: 'BarterDisputeLog',
          resourceId:   row.id,
          newValue:     { reason: verdict.note },
        });
      }
    }

    if (rows.length > 0) {
      this.logger.log(`AUTO_REVIEW işlendi: ${rows.length} kayıt`);
    }
  }

  private async transitionManualReviewToArbitration(): Promise<void> {
    const cutoff = new Date(Date.now() - DISPUTE_TIMINGS.MANUAL_REVIEW_HOURS * 60 * 60 * 1000);

    const rows = await this.disputeRepo.findByStatusAndUpdatedBefore(
      DisputeResolutionStatus.MANUAL_REVIEW,
      cutoff,
      BATCH_SIZE,
    );

    for (const row of rows) {
      const deadline = new Date(Date.now() + DISPUTE_TIMINGS.ARBITRATION_HOURS * 60 * 60 * 1000);
      await this.disputeRepo.updateResolutionDetails(row.id, {
        status:               DisputeResolutionStatus.ARBITRATION,
        arbitratorType:       'EXTERNAL',
        resolutionDeadlineAt: deadline,
        resolvedAt:           new Date(),
      });

      await this.auditLog.log({
        actorId:      'SYSTEM',
        action:       'DISPUTE_ESCALATED_TO_ARBITRATION',
        resourceType: 'BarterDisputeLog',
        resourceId:   row.id,
        newValue:     { previousStatus: DisputeResolutionStatus.MANUAL_REVIEW },
      });
    }

    if (rows.length > 0) {
      this.logger.log(`MANUAL_REVIEW → ARBITRATION geçişi: ${rows.length} kayıt`);
    }
  }

  private autoDecide(row: IBarterDisputeLog):
    | { kind: 'AUTO_RESOLVED'; resolution: string; note: string }
    | { kind: 'ESCALATE'; note: string }
  {
    const evidence = (row.evidence ?? {}) as Record<string, unknown>;
    const claimantEvidence  = this.evidenceCount(evidence['claimant']);
    const respondentEvidence = this.evidenceCount(evidence['respondent']);

    if (claimantEvidence > 0 && respondentEvidence === 0) {
      return {
        kind:       'AUTO_RESOLVED',
        resolution: 'REFUND_CLAIMANT',
        note:       'Karşı taraf 24 saat içinde delil sunmadı, şikayetçi lehine otomatik karar verildi.',
      };
    }

    if (respondentEvidence > 0 && claimantEvidence === 0) {
      return {
        kind:       'AUTO_RESOLVED',
        resolution: 'DISMISS',
        note:       'Şikayetçi destekleyici delil sunmadı, karşı taraf lehine otomatik karar verildi.',
      };
    }

    return {
      kind: 'ESCALATE',
      note: claimantEvidence === 0
        ? 'Hiçbir tarafta delil sunulmadı, manuel inceleme gerekli.'
        : 'Her iki tarafta da delil mevcut, manuel inceleme gerekli.',
    };
  }

  private evidenceCount(side: unknown): number {
    if (Array.isArray(side)) return side.length;
    if (side && typeof side === 'object') return Object.keys(side).length;
    return 0;
  }
}