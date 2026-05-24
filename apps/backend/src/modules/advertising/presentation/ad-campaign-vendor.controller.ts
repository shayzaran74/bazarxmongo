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
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { GetVendorCampaignsQuery } from '../application/queries/get-vendor-campaigns.query';
import { CreateAdCampaignCommand } from '../application/commands/create-ad-campaign.command';
import { CreateAdCampaignDto } from '../application/dtos/create-ad-campaign.dto';
import { AdCampaign } from '../domain/entities/ad-campaign.entity';

@ApiTags('Ad Campaigns')
@ApiBearerAuth()
@Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vendors/me/campaigns')
export class AdCampaignVendorController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List my ad campaigns', description: 'Satıcının kendine ait tüm reklam kampanyalarını listeler.' })
  @ApiResponse({ status: 200, description: 'Kampanya listesi.' })
  @Get()
  async getMyCampaigns(@CurrentUser() user: AuthenticatedUser) {
    const campaigns = await this.queryBus.execute(new GetVendorCampaignsQuery(user.vendorId ?? user.id));
    const mapped = campaigns.map((c: AdCampaign) => {
      const props = c.getProps();
      return {
        id: c.id,
        name: props.name,
        type: props.adType,
        status: props.adStatus === 'ACTIVE' ? 'ENABLED' : props.adStatus,
        budget: props.budget,
        bidAmount: props.bidAmount,
        startDate: props.startDate,
        endDate: props.endDate,
        mediaUrl: props.mediaUrl,
        imageUrl: props.imageUrl,
        linkUrl: props.linkUrl,
        targetUrl: props.targetUrl,
        targetKeywords: props.targetKeywords,
        targetSlots: props.targetSlots,
        targetCities: props.targetCities,
        targetDistricts: props.targetDistricts,
        negativeKeywords: props.negativeKeywords,
        rejectionReason: props.rejectionReason,
        products: [],
        metrics: []
      };
    });
    return { success: true, data: mapped };
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
  async createCampaign(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAdCampaignDto) {
    const result = await this.commandBus.execute(new CreateAdCampaignCommand(user.vendorId ?? user.id, dto));
    return { success: true, data: result };
  }
}

export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }
