// apps/backend/src/modules/vendor/application/commands/update-company-status.command.ts
export class UpdateCompanyStatusCommand {
  constructor(
    public readonly companyId: string,
    public readonly status: string,
    public readonly adminId: string,
    public readonly rejectionReason?: string,
  ) {}
}
