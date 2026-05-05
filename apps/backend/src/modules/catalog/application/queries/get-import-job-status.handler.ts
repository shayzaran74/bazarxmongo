// apps/backend/src/modules/catalog/application/queries/get-import-job-status.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetImportJobStatusQuery } from './get-import-job-status.query';
import { PrismaService } from '@barterborsa/shared-persistence';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetImportJobStatusQuery)
export class GetImportJobStatusHandler implements IQueryHandler<GetImportJobStatusQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetImportJobStatusQuery) {
    const job = await this.prisma.importJob.findUnique({
      where: { id: query.jobId },
    });

    if (!job || job.adminId !== query.adminId) {
      throw new NotFoundException('Import job bulunamadı');
    }

    const progressPercent =
      job.totalRows > 0
        ? Math.round((job.processedRows / job.totalRows) * 100)
        : 0;

    const elapsedSeconds = job.startedAt
      ? Math.round(
          ((job.completedAt ?? new Date()).getTime() - job.startedAt.getTime()) / 1000,
        )
      : null;

    return {
      jobId: job.id,
      status: job.status,
      progress: {
        percent: progressPercent,
        processed: job.processedRows,
        total: job.totalRows,
        created: job.createdRows,
        failed: job.failedRows,
      },
      errors: job.errors ?? [],
      timing: {
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        elapsedSeconds,
      },
      isDone: job.status === 'COMPLETED' || job.status === 'FAILED',
    };
  }
}
