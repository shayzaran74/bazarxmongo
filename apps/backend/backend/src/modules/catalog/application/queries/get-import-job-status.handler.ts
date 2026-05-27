// apps/backend/src/modules/catalog/application/queries/get-import-job-status.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetImportJobStatusQuery } from './get-import-job-status.query';
import { ImportJob, IImportJob } from '@barterborsa/shared-persistence/schemas/backend/importJob.schema';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetImportJobStatusQuery)
export class GetImportJobStatusHandler implements IQueryHandler<GetImportJobStatusQuery> {
  async execute(query: GetImportJobStatusQuery) {
    const job = await ImportJob.findOne({ id: query.jobId }).exec();

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
      status: (job as IImportJob).status,
      progress: {
        percent: progressPercent,
        processed: job.processedRows,
        total: job.totalRows,
        created: job.createdRows,
        failed: job.failedRows,
      },
      errors: (job.errors as unknown as string[]) ?? [],
      timing: {
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        elapsedSeconds,
      },
      isDone: (job as IImportJob).status === 'COMPLETED' || (job as IImportJob).status === 'FAILED',
    };
  }
}
