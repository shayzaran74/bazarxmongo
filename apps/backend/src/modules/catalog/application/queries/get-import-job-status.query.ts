// apps/backend/src/modules/catalog/application/queries/get-import-job-status.query.ts

export class GetImportJobStatusQuery {
  constructor(
    public readonly jobId: string,
    public readonly adminId: string,
  ) {}
}
