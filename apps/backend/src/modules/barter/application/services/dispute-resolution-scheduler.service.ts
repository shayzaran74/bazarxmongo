// apps/backend/src/modules/barter/application/services/dispute-resolution-scheduler.service.ts
// Master Plan v4.3 §3.4 — Uyuşmazlık Çözüm Otomasyonu
// Akış: OPEN → (24h) → AUTO_REVIEW → otomatik karar | MANUAL_REVIEW → (48h) → ARBITRATION → RESOLVED

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DisputeResolutionStatus, DISPUTE_TIMINGS } from '../../domain/enums/dispute-resolution-status.enum';

// Scheduler 15 dakikada bir state geçişlerini denetler
const TICK_INTERVAL_MS = 15 * 60 * 1000;
// Bir tick'te en fazla işlenecek kayıt sayısı (rate limit)
const BATCH_SIZE = 50;

interface DisputeRow {
  id:              string;
  status:          string;
  openedById:      string;
  respondentId:    string;
  evidence:        unknown;
  createdAt:       Date;
  updatedAt:       Date;
  resolutionDeadlineAt: Date | null;
}

@Injectable()
export class DisputeResolutionSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DisputeResolutionSchedulerService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma:   PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  onModuleInit(): void {
    // İlk tick uygulama ayağa kalkar kalkmaz 60sn sonra
    setTimeout(() => {
      void this.tick();
      this.intervalHandle = setInterval(() => void this.tick(), TICK_INTERVAL_MS);
    }, 60_000);
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }

  // Ana tick — tüm bekleyen dispute'lara state geçişi uygula
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

  // 1. Adım: OPEN durumundaki ve delil penceresi (24h) geçmiş kayıtları AUTO_REVIEW'a al
  private async transitionOpenToAutoReview(): Promise<void> {
    const cutoff = new Date(Date.now() - DISPUTE_TIMINGS.RESPONSE_WINDOW_HOURS * 60 * 60 * 1000);

    const rows = await this.prisma.barterDisputeLog.findMany({
      where: {
        status:    DisputeResolutionStatus.OPEN,
        createdAt: { lte: cutoff },
      },
      take: BATCH_SIZE,
      select: this.disputeSelect(),
    });

    for (const row of rows) {
      await this.prisma.barterDisputeLog.update({
        where: { id: row.id },
        data:  {
          status:               DisputeResolutionStatus.AUTO_REVIEW,
          resolutionDeadlineAt: this.deadlineFromNow(DISPUTE_TIMINGS.RESPONSE_WINDOW_HOURS),
        },
      });

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

  // 2. Adım: AUTO_REVIEW kayıtlarına basit karar mantığını uygula
  // - Tek taraflı delil varsa: delil sahibi lehine RESOLVED
  // - Her iki tarafta da delil varsa veya hiçbirinde yoksa: MANUAL_REVIEW
  private async transitionAutoReviewToFinal(): Promise<void> {
    const rows = await this.prisma.barterDisputeLog.findMany({
      where: { status: DisputeResolutionStatus.AUTO_REVIEW },
      take:  BATCH_SIZE,
      select: this.disputeSelect(),
    });

    for (const row of rows) {
      const verdict = this.autoDecide(row);

      if (verdict.kind === 'AUTO_RESOLVED') {
        await this.prisma.barterDisputeLog.update({
          where: { id: row.id },
          data:  {
            status:         DisputeResolutionStatus.RESOLVED,
            resolution:     verdict.resolution,
            resolutionNote: verdict.note,
            resolvedAt:     new Date(),
            arbitratorType: 'INTERNAL',
          },
        });

        await this.auditLog.log({
          actorId:      'SYSTEM',
          action:       'DISPUTE_AUTO_RESOLVED',
          resourceType: 'BarterDisputeLog',
          resourceId:   row.id,
          newValue:     { resolution: verdict.resolution, reason: verdict.note },
        });
      } else {
        await this.prisma.barterDisputeLog.update({
          where: { id: row.id },
          data:  {
            status:               DisputeResolutionStatus.MANUAL_REVIEW,
            resolutionDeadlineAt: this.deadlineFromNow(DISPUTE_TIMINGS.MANUAL_REVIEW_HOURS),
          },
        });

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

  // 3. Adım: MANUAL_REVIEW'da 48 saat hareketsiz kalanları ARBITRATION'a yönlendir
  private async transitionManualReviewToArbitration(): Promise<void> {
    const cutoff = new Date(Date.now() - DISPUTE_TIMINGS.MANUAL_REVIEW_HOURS * 60 * 60 * 1000);

    const rows = await this.prisma.barterDisputeLog.findMany({
      where: {
        status:    DisputeResolutionStatus.MANUAL_REVIEW,
        updatedAt: { lte: cutoff },
      },
      take: BATCH_SIZE,
      select: this.disputeSelect(),
    });

    for (const row of rows) {
      await this.prisma.barterDisputeLog.update({
        where: { id: row.id },
        data:  {
          status:               DisputeResolutionStatus.ARBITRATION,
          arbitratorType:       'EXTERNAL',
          resolutionDeadlineAt: this.deadlineFromNow(DISPUTE_TIMINGS.ARBITRATION_HOURS),
        },
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

  // Otomatik karar mantığı — delil dengesine bakar
  private autoDecide(row: DisputeRow):
    | { kind: 'AUTO_RESOLVED'; resolution: string; note: string }
    | { kind: 'ESCALATE'; note: string }
  {
    const evidence = (row.evidence ?? {}) as Record<string, unknown>;
    const claimantEvidence  = this.evidenceCount(evidence['claimant']);
    const respondentEvidence = this.evidenceCount(evidence['respondent']);

    // Sadece şikayetçi delil sundu → şikayetçi lehine
    if (claimantEvidence > 0 && respondentEvidence === 0) {
      return {
        kind:       'AUTO_RESOLVED',
        resolution: 'REFUND_CLAIMANT',
        note:       'Karşı taraf 24 saat içinde delil sunmadı, şikayetçi lehine otomatik karar verildi.',
      };
    }

    // Sadece karşı taraf delil sundu → şikayet düşer
    if (respondentEvidence > 0 && claimantEvidence === 0) {
      return {
        kind:       'AUTO_RESOLVED',
        resolution: 'DISMISS',
        note:       'Şikayetçi destekleyici delil sunmadı, karşı taraf lehine otomatik karar verildi.',
      };
    }

    // Çakışan delil veya hiç delil yok → manuel inceleme
    return {
      kind: 'ESCALATE',
      note: claimantEvidence === 0
        ? 'Hiçbir tarafça delil sunulmadı, manuel inceleme gerekli.'
        : 'Her iki tarafta da delil mevcut, manuel inceleme gerekli.',
    };
  }

  private evidenceCount(side: unknown): number {
    if (Array.isArray(side)) return side.length;
    if (side && typeof side === 'object') return Object.keys(side).length;
    return 0;
  }

  private deadlineFromNow(hours: number): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  private disputeSelect() {
    return {
      id:                   true,
      status:               true,
      openedById:           true,
      respondentId:         true,
      evidence:             true,
      createdAt:            true,
      updatedAt:            true,
      resolutionDeadlineAt: true,
    } as const;
  }
}
