import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam 
} from '@nestjs/swagger';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { GetNotificationsQuery } from '../application/queries/get-notifications.query';
import { GetNotificationUnreadCountQuery } from '../application/queries/get-notification-unread-count.query';
import { MarkNotificationReadCommand } from '../application/commands/mark-notification-read.command';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'List notifications', description: 'Kullanıcıya özel bildirimleri listeler. Sayfalama destekler.' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Bildirim listesi.' })
  @Get()
  async getNotifications(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.queryBus.execute(
      new GetNotificationsQuery(user.id, limit ? Number(limit) : 20, offset ? Number(offset) : 0)
    );
  }

  @ApiOperation({ summary: 'Get unread notification count', description: 'Kullanıcının henüz okumadığı bildirimlerin sayısını döner.' })
  @ApiResponse({ status: 200, description: 'Okunmamış bildirim sayısı.' })
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    return this.queryBus.execute(new GetNotificationUnreadCountQuery(user.id));
  }

  @ApiOperation({ summary: 'Mark notification as read', description: 'Belirli bir bildirimi okundu olarak işaretler.' })
  @ApiParam({ name: 'id', description: 'Bildirim ID' })
  @ApiResponse({ status: 200, description: 'İşlem başarılı.' })
  @Patch(':id/read')
  async markRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.commandBus.execute(new MarkNotificationReadCommand(id, user.id));
  }
}
