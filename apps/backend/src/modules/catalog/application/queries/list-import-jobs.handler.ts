// apps/backend/src/modules/catalog/application/queries/list-import-jobs.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListImportJobsQuery } from './list-import-jobs.query';
import { ImportJob } from '@barterborsa/shared-persistence/schemas/backend/importJob.schema';

@QueryHandler(ListImportJobsQuery)
export class ListImportJobsHandler implements IQueryHandler<ListImportJobsQuery> {
  async execute(query: ListImportJobsQuery) {
    const skip = (query.page - 1) * query.limit;

    const [jobs, total] = await Promise.all([
      ImportJob.find({ adminId: query.adminId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .select({
          id: true,
          status: true,
          totalRows: true,
          processedRows: true,
          createdRows: true,
          failedRows: true,
          createdAt: true,
          completedAt: true,
        })
        .exec(),
      ImportJob.countDocuments({ adminId: query.adminId }).exec(),
    ]);

    return {
      items: jobs.map(j => ({
        id: j.id,
        status: j.status,
        totalRows: j.totalRows,
        processedRows: j.processedRows,
        createdRows: j.createdRows,
        failedRows: j.failedRows,
        createdAt: j.createdAt,
        completedAt: j.completedAt,
      })),
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
