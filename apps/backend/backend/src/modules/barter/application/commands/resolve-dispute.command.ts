// apps/backend/src/modules/barter/application/commands/resolve-dispute.command.ts
import { DisputeResolutionResult } from '../../domain/enums/dispute-resolution-result.enum';

export class ResolveDisputeCommand {
  constructor(
    public readonly sessionId: string,
    public readonly adminId: string,
    public readonly result: DisputeResolutionResult,
    public readonly adminNote: string,
  ) {}
}
