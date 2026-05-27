// apps/backend/src/modules/communication/presentation/complaint.controller.ts

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { IUserComplaint } from '@barterborsa/shared-persistence';
import { CreateComplaintDto } from '../application/dtos/create-complaint.dto';
import { CreateComplaintCommand } from '../application/commands/create-complaint.command';

interface AuthenticatedUser { id: string; role: string }

@ApiTags('Complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('complaints')
export class ComplaintController {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectModel('UserComplaint') private readonly complaintModel: Model<IUserComplaint>,
  ) {}

  @Post()
  createComplaint(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateComplaintDto) {
    return this.commandBus.execute(
      new CreateComplaintCommand(user.id, dto.subjectId, dto.reason, dto.description),
    );
  }

  @Get()
  async getMyComplaints(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.complaintModel
      .find({ reporterId: user.id })
      .sort({ createdAt: -1 })
      .lean();
    return { success: true, data };
  }
}
