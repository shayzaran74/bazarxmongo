import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiBody 
} from '@nestjs/swagger';
import { Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateNotificationDto } from '../application/dtos/notification-complaint.dtos';
import { CreateNotificationCommand } from '../application/commands/create-notification.command';

@ApiTags('Communication Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/communication')
export class CommunicationAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'List all complaints (Admin)', description: 'Sistemdeki tüm şikayetleri admin olarak listeler.' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Şikayet listesi.' })
  @ApiResponse({ status: 403, description: 'Sadece admin yetkisiyle erişilebilir.' })
  @Get('complaints')
  async getComplaints(@Query('status') status?: string) {
    // Should use GetComplaintsQuery
    return [];
  }

  @ApiOperation({ summary: 'Send bulk notification (Admin)', description: 'Yönetici tarafından kullanıcılara manuel bildirim gönderir.' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: 'Bildirim başarıyla gönderildi.' })
  @Post('notifications/bulk')
  async sendBulkNotification(@Body() dto: CreateNotificationDto) {
    return this.commandBus.execute(
      new CreateNotificationCommand(dto.userId, dto.type, dto.title, dto.message, dto.link)
    );
  }
}

@ApiTags('Chat Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/chats')
export class ChatAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all chats (Admin)' })
  @Get()
  async getChats() {
    return { success: true, data: [] };
  }
}
