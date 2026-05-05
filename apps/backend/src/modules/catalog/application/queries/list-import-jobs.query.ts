// apps/backend/src/modules/catalog/application/queries/list-import-jobs.query.ts

export class ListImportJobsQuery {
  constructor(
    public readonly adminId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
