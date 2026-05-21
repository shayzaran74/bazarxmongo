import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { GetVendorCampaignsQuery } from '../application/queries/get-vendor-campaigns.query';
import { CreateAdCampaignCommand } from '../application/commands/create-ad-campaign.command';

@ApiTags('Ad Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vendors/me/campaigns')
export class AdCampaignVendorController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List my ad campaigns', description: 'Satıcının kendine ait tüm reklam kampanyalarını listeler.' })
  @ApiResponse({ status: 200, description: 'Kampanya listesi.' })
  @Get()
  async getMyCampaigns(@CurrentUser() user: AuthenticatedUser) {
    // Note: Assuming vendorId is same as user.id or reachable via user context
    return this.queryBus.execute(new GetVendorCampaignsQuery(user.id));
  }

  @ApiOperation({ summary: 'Create new ad campaign', description: 'Satıcı için yeni bir reklam kampanyası (banner, side ad vb.) oluşturur.' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Summer Sale' },
        slotType: { type: 'string', example: 'HOME_HERO' },
        imageUrl: { type: 'string' },
        targetUrl: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' }
      },
      required: ['title', 'slotType', 'imageUrl']
    }
  })
  @ApiResponse({ status: 201, description: 'Kampanya başarıyla oluşturuldu.' })
  @Post()
  async createCampaign(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {
    return this.commandBus.execute(new CreateAdCampaignCommand(user.id, dto));
  }
}

export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }
