export class CreateAdminProductCommand {
  constructor(
    public readonly data: any,
    public readonly adminId: string
  ) {}
}
