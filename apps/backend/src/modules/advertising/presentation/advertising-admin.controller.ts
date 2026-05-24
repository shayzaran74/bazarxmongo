// apps/backend/src/modules/advertising/presentation/advertising-admin.controller.ts

import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { ApproveAdCampaignCommand } from '../application/commands/approve-ad-campaign.command';
import { RejectAdCampaignCommand } from '../application/commands/reject-ad-campaign.command';
import { RecordImpressionCommand } from '../application/commands/record-impression.command';
import { RecordClickCommand } from '../application/commands/record-click.command';
import { GetAdsAdminQuery } from '../application/queries/get-ads-admin.query';
import { AdCampaign } from '../domain/entities/ad-campaign.entity';

@ApiTags('Advertising Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/ads')
export class AdvertisingAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @ApiOperation({ summary: 'List all campaigns (Admin)' })
  @ApiResponse({ status: 200 })
  @Get('campaigns')
  async getAllCampaigns() {
    const campaigns = await this.queryBus.execute(new GetAdsAdminQuery());
    
    const db = this.connection.db;
    
    // Campaign vendorId is actually the user UUID, not the vendor document _id.
    // We need a two-hop join:
    //   1. campaigns.vendorId → vendors.userId  → get vendor._id
    //   2. vendor._id        → vendor_profiles.vendorId → get storeName/logo
    const userIds = campaigns.map((c: AdCampaign) => c.getProps().vendorId).filter(Boolean);

    // Step 1: Resolve user UUIDs to vendor document _ids
    const vendors = db
      ? await db.collection('vendors').find({ userId: { $in: userIds } }).toArray()
      : [];
    // Map userId → vendor doc (to get _id and any fallback fields)
    const vendorByUserId = new Map(vendors.map(v => [v.userId, v]));
    // Collect vendor _ids (could be ObjectId or string)
    const vendorDocIds = vendors.map(v => String(v._id));

    // Step 2: Fetch vendor_profiles keyed by vendor document _id
    const profiles = db && vendorDocIds.length > 0
      ? await db.collection('vendor_profiles').find({ vendorId: { $in: vendorDocIds } }).toArray()
      : [];
    const profileByVendorDocId = new Map(profiles.map(p => [p.vendorId, p]));

    // Step 3: Fetch companies as fallback for business name
    const companyIds = vendors.map(v => v.companyId).filter(Boolean);
    const companies = db && companyIds.length > 0
      ? await db.collection('companies').find({ _id: { $in: companyIds } }).toArray()
      : [];
    const companyById = new Map(companies.map(co => [String(co._id), co]));

    const mapped = campaigns.map((c: AdCampaign) => {
      const props = c.getProps();
      const vendor = props.vendorId ? vendorByUserId.get(props.vendorId) : null;
      const vendorDocId = vendor ? String(vendor._id) : null;
      const profile = vendorDocId ? profileByVendorDocId.get(vendorDocId) : null;
      const company = vendor?.companyId ? companyById.get(vendor.companyId) : null;

      // Resolve business name: profile.storeName → company.name → slug → fallback
      const businessName = 
        profile?.storeName || profile?.businessName ||
        company?.name || company?.businessName ||
        vendor?.slug ||
        'Bilinmeyen Mağaza';

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
        vendor: {
          id: props.vendorId || '',
          businessName,
          logoUrl: profile?.logo || '',
        },
        products: [],
        metrics: []
      };
    });
    return { success: true, data: mapped };
  }

  @ApiOperation({ summary: 'Approve ad campaign (Admin)' })
  @ApiParam({ name: 'id' })
  @Post('campaigns/:id/approve')
  async approve(@Param('id') id: string) {
    const result = await this.commandBus.execute(new ApproveAdCampaignCommand(id));
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Reject ad campaign (Admin)' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string' } }, required: ['reason'] } })
  @Post('campaigns/:id/reject')
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    const result = await this.commandBus.execute(new RejectAdCampaignCommand(id, reason));
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Record ad impression' })
  @Post('impression')
  async recordImpression(@Body() dto: { campaignId: string; cost: number }) {
    const result = await this.commandBus.execute(new RecordImpressionCommand(dto.campaignId, dto.cost));
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Record ad click' })
  @Post('click')
  async recordClick(@Body() dto: { campaignId: string; cost: number }) {
    const result = await this.commandBus.execute(new RecordClickCommand(dto.campaignId, dto.cost));
    return { success: true, data: result };
  }
}
