// apps/backend/src/modules/vendor/presentation/ecosystem.controller.ts

import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';

import { GetMyEcosystemQuery } from '../application/queries/get-my-ecosystem.query';
import { GetEcosystemAuditLogsQuery } from '../application/queries/get-ecosystem-audit-logs.query';
import { GetEcosystemDashboardQuery } from '../application/queries/get-ecosystem-dashboard.query';
import { CreateEcosystemCommand } from '../application/commands/create-ecosystem.command';
import { AddEcosystemMemberCommand } from '../application/commands/add-ecosystem-member.command';
import { RemoveEcosystemMemberCommand } from '../application/commands/remove-ecosystem-member.command';
import { UpdateEcosystemSettingsCommand } from '../application/commands/update-ecosystem-settings.command';
import { CreateEcosystemDto } from '../application/dtos/create-ecosystem.dto';
import { UpdateEcosystemSettingsDto } from '../application/dtos/update-ecosystem-settings.dto';
import { BazarXPublishService } from '../application/services/bazarx-publish.service';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
}

@ApiTags('Ecosystem')
@ApiBearerAuth()
@Controller('ecosystem')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EcosystemController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly bazarxPublishService: BazarXPublishService,
  ) {}

  @ApiOperation({ summary: 'Ekosistem durumumu getir' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('my')
  async getMyEcosystem(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new GetMyEcosystemQuery(user.id));
    if (!data) return { success: false, message: 'Vendor bulunamadı' };
    return { success: true, ...data };
  }

  @ApiOperation({ summary: 'Yeni ekosistem kur' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Post('create')
  async createEcosystem(
    @Body() dto: CreateEcosystemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.commandBus.execute(
      new CreateEcosystemCommand(user.id, { name: dto.name, description: dto.description }),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Ekosistem ayarlarını güncelle (isBlindPool, internalCommRate)' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Patch('settings')
  async updateSettings(
    @Body() dto: UpdateEcosystemSettingsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commandBus.execute(
      new UpdateEcosystemSettingsCommand(user.id, {
        isBlindPool: dto.isBlindPool,
        internalCommRate: dto.internalCommRate,
      }),
    );
  }

  @ApiOperation({ summary: 'Ekosistem denetim logları' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('audit')
  async getAuditLogs(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new GetEcosystemAuditLogsQuery(user.id));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Ekosisteme üye ekle' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Post('members')
  async addMember(
    @Body() body: { memberVendorId: string; ecosystemId: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commandBus.execute(
      new AddEcosystemMemberCommand(user.id, body.memberVendorId, body.ecosystemId),
    );
  }

  // Master Plan v4.3 §4 — Marka Yönetim Paneli
  @ApiOperation({ summary: 'Ekosistem yönetim paneli — bayi TrustScore + stok hareketleri' })
  @ApiParam({ name: 'ecosystemId', description: 'Ekosistem ID' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get(':ecosystemId/dashboard')
  async getEcosystemDashboard(
    @Param('ecosystemId') ecosystemId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.queryBus.execute(
      new GetEcosystemDashboardQuery(user.id, ecosystemId),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Ekosistemden üye çıkar' })
  @ApiParam({ name: 'ecosystemId', description: 'Ekosistem ID' })
  @ApiParam({ name: 'vendorId', description: 'Çıkarılacak bayi ID' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Delete(':ecosystemId/members/:vendorId')
  async removeMember(
    @Param('ecosystemId') ecosystemId: string,
    @Param('vendorId') memberVendorId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commandBus.execute(
      new RemoveEcosystemMemberCommand(user.id, memberVendorId, ecosystemId),
    );
  }

  // === BazarX Publish Endpoints ===

  @ApiOperation({ summary: 'Listing\'i BazarX\'te yayınla' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Post('dealer/publish/:listingId')
  async publishToBazarX(
    @Param('listingId') listingId: string,
    @Body() body: { ecosystemId: string; minMarketPrice?: number },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.bazarxPublishService.publishToBazarX(
      user.vendorId ?? user.id,
      body.ecosystemId,
      { listingId, minMarketPrice: body.minMarketPrice },
    );
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'BazarX yayınını kaldır' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Delete('dealer/unpublish/:listingId')
  async unpublishFromBazarX(
    @Param('listingId') listingId: string,
    @Body() body: { ecosystemId: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.bazarxPublishService.unpublishFromBazarX(
      user.vendorId ?? user.id,
      body.ecosystemId,
      listingId,
    );
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Bayinin yayınladığı listing\'leri getir' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('dealer/published')
  async getDealerPublishedListings(
    @Query('ecosystemId') ecosystemId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const listings = await this.bazarxPublishService.getDealerPublishedListings(
      user.vendorId ?? user.id,
      ecosystemId,
    );
    return { success: true, data: listings };
  }

  @ApiOperation({ summary: 'Ekosistemin tüm yayınlanmış listing\'lerini getir' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('published-listings')
  async getPublishedListings(
    @Query('ecosystemId') ecosystemId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const listings = await this.bazarxPublishService.getPublishedListings(ecosystemId);
    return { success: true, data: listings };
  }
}
