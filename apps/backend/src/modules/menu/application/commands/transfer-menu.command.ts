// apps/backend/src/modules/menu/application/commands/transfer-menu.command.ts
export class TransferMenuCommand {
  constructor(
    public readonly fromUserId:  string,
    public readonly purchaseId:  string,
    public readonly toUserId:    string,  // alıcı userId
  ) {}
}
