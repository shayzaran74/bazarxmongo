import { Controller, Post, Body, Get, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiBody 
} from '@nestjs/swagger';
import { Roles, CurrentUser } from '@barterborsa/shared-nest';
import { Public } from '@barterborsa/shared-security';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { 
  TrackEventCommand, 
  GetDashboardStatsQuery, 
  GetAdminStatsQuery,
  GetVendorStatsQuery 
} from '../application/commands-queries/analytics.bus';

@ApiTags('Analytics')
@Controller('analytics')
export class TrackingController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @ApiOperation({ summary: 'Track user interaction event', description: 'Kullanıcı etkileşimlerini (tıklama, sayfa görüntüleme, sepet işlemi) sisteme kaydeder.' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        eventType: { type: 'string', example: 'PAGE_VIEW' },
        metadata: { type: 'object', additionalProperties: true }
      },
      required: ['eventType']
    }
  })
  @ApiResponse({ status: 201, description: 'Olay kaydedildi.' })
  @Post('track')
  async track(@Body() dto: any) { return this.commandBus.execute(new TrackEventCommand(dto)); }
}
