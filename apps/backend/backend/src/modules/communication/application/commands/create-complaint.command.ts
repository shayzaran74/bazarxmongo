// apps/backend/src/modules/communication/application/commands/create-complaint.command.ts

import { Command } from '@barterborsa/shared-core';

export class CreateComplaintCommand extends Command {
  constructor(
    public readonly reporterId: string,
    public readonly subjectId: string,
    public readonly reason: string,
    public readonly description?: string
  ) {
    super();
  }
}
