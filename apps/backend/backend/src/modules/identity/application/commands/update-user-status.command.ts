export class UpdateUserStatusCommand {
  constructor(
    public readonly userId: string,
    public readonly status: string,
    public readonly adminId: string,
  ) {}
}
