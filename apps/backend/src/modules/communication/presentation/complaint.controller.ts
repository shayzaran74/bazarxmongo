// apps/backend/src/modules/communication/presentation/complaint.controller.ts

import { Controller, Get, Post, Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '@barterborsa/shared-nest';
import { CreateComplaintDto } from '../application/dtos/notification-complaint.dtos';
import { CreateComplaintCommand } from '../application/commands/create-complaint.command';

@Controller('complaints')
export class ComplaintController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createComplaint(@CurrentUser() user: any, @Body() dto: CreateComplaintDto) {
    return this.commandBus.execute(
      new CreateComplaintCommand(user.id, dto.subjectId, dto.reason, dto.description)
    );
  }

  @Get()
  async getMyComplaints(@CurrentUser() user: any) {
    // Should be handled by GetComplaintsQuery
    return [];
  }
}
