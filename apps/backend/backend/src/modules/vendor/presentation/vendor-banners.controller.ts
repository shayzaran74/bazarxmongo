// apps/backend/src/modules/vendor/presentation/vendor-banners.controller.ts

import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
  ApiParam, ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles, Public } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { ListVendorBannersQuery } from '../application/queries/list-vendor-banners.query';
import { CreateBannerCommand } from '../application/commands/create-banner.command';
import { UpdateBannerCommand } from '../application/commands/update-banner.command';
import { DeleteBannerCommand } from '../application/commands/delete-banner.command';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
}

@ApiTags('Vendor Content')
@ApiBearerAuth()
@Controller('vendor-banners')
export class VendorBannersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Satıcıya ait bannerları listele (Genel/Public)' })
  @ApiResponse({ status: 200 })
  @Get('public/:vendorId')
  async getPublicBanners(@Param('vendorId') vendorId: string) {
    const data = await this.queryBus.execute(new ListVendorBannersQuery(vendorId));
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Satıcının kendi bannerlarını listele' })
  @ApiResponse({ status: 200 })
  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new ListVendorBannersQuery(user.id));
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Yeni banner oluştur' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl:        { type: 'string', example: 'https://storage.bazarx.com/...' },
        linkUrl:         { type: 'string', example: 'https://bazarx.com/kampanya' },
        type:            { type: 'number', example: 1 },
        template:        { type: 'string', example: 'A' },
        order:           { type: 'number', example: 0 },
        targetCities:    { type: 'array', items: { type: 'string' } },
        targetDistricts: { type: 'array', items: { type: 'string' } },
      },
      required: ['imageUrl'],
    },
  })
  @ApiResponse({ status: 201 })
  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: {
      imageUrl: string;
      linkUrl?: string;
      type?: number;
      template?: string;
      order?: number;
      targetCities?: string[];
      targetDistricts?: string[];
    },
  ) {
    return this.commandBus.execute(new CreateBannerCommand(user.id, body));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Banner güncelle' })
  @ApiParam({ name: 'id' })
  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: {
      imageUrl?: string;
      linkUrl?: string;
      type?: number;
      template?: string;
      order?: number;
      targetCities?: string[];
      targetDistricts?: string[];
    },
  ) {
    return this.commandBus.execute(new UpdateBannerCommand(user.id, id, body));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Banner sil' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteBannerCommand(user.id, id));
  }
}
