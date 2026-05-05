// apps/backend/src/modules/catalog/application/queries/list-import-jobs.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListImportJobsQuery } from './list-import-jobs.query';
import { PrismaService } from '@barterborsa/shared-persistence';

@QueryHandler(ListImportJobsQuery)
export class ListImportJobsHandler implements IQueryHandler<ListImportJobsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListImportJobsQuery) {
    const skip = (query.page - 1) * query.limit;

    const [jobs, total] = await Promise.all([
      this.prisma.importJob.findMany({
        where: { adminId: query.adminId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        select: {
          id: true,
          status: true,
          totalRows: true,
          processedRows: true,
          createdRows: true,
          failedRows: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      this.prisma.importJob.count({ where: { adminId: query.adminId } }),
    ]);

    return {
      items: jobs,
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
