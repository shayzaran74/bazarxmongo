export class DeleteAdminUserCommand {
  constructor(
    public readonly userId: string,
    public readonly adminId: string,
  ) {}
}
