// apps/backend/src/modules/communication/presentation/complaint.controller.ts

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody,
} from '@nestjs/swagger';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateComplaintDto } from '../application/dtos/create-complaint.dto';
import { CreateComplaintCommand } from '../application/commands/create-complaint.command';

@ApiTags('Complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('complaints')
export class ComplaintController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Şikayet oluştur' })
  @ApiBody({ type: CreateComplaintDto })
  @ApiResponse({ status: 201 })
  @Post()
  async createComplaint(@CurrentUser() user: any, @Body() dto: CreateComplaintDto) {
    return this.commandBus.execute(
      new CreateComplaintCommand(user.id, dto.subjectId, dto.reason, dto.description),
    );
  }

  @ApiOperation({ summary: 'Kendi şikayetlerimi listele' })
  @ApiResponse({ status: 200 })
  @Get()
  async getMyComplaints(@CurrentUser() user: any) {
    const data = await this.prisma.userComplaint.findMany({
      where: { reporterId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data };
  }
}
