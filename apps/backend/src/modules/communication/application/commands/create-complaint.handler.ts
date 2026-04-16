// apps/backend/src/modules/communication/application/commands/create-complaint.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateComplaintCommand } from './create-complaint.command';
import { IUserComplaintRepository } from '../../domain/repositories/user-complaint.repository.interface';
import { UserComplaint } from '../../domain/entities/user-complaint.entity';

@CommandHandler(CreateComplaintCommand)
export class CreateComplaintHandler implements ICommandHandler<CreateComplaintCommand> {
  constructor(
    @Inject('IUserComplaintRepository') private readonly repository: IUserComplaintRepository,
  ) {}

  async execute(command: CreateComplaintCommand) {
    const complaint = UserComplaint.create(
      command.reporterId,
      command.subjectId,
      command.reason,
      command.description
    );

    await this.repository.save(complaint);

    return { success: true, id: complaint.id };
  }
}
