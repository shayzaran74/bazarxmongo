// apps/backend/src/modules/content/presentation/banners-admin.controller.ts

import { Controller, Get, Post, Body, Query, UseGuards, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { IHomeBanner } from '@barterborsa/shared-persistence';

@ApiTags('Banners Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/banners')
export class BannersAdminController {
  constructor(
    @InjectModel('HomeBanner') private readonly bannerModel: Model<IHomeBanner>,
  ) {}

  @ApiOperation({ summary: 'List all banners for admin' })
  @Get()
  async getBanners() {
    const items = await this.bannerModel.find().sort({ order: 1 }).lean();
    return { success: true, data: items };
  }

  @Post()
  async createBanner(@Body() dto: Record<string, unknown>) {
    const newId = new Types.ObjectId().toString();
    const item  = await this.bannerModel.create([{
      _id: newId, id: newId,
      title:       dto.title,
      description: dto.description,
      image:       dto.imageUrl ?? dto.image ?? '',
      link:        dto.linkUrl  ?? dto.link,
      order:       dto.order    ?? 0,
      isActive:    dto.isActive !== undefined ? dto.isActive : true,
      startDate:   dto.startDate ? new Date(String(dto.startDate)) : null,
      endDate:     dto.endDate   ? new Date(String(dto.endDate))   : null,
      platform:    dto.platform  ?? 'BAZARX',
      tag:         dto.tag       ?? dto.position,
    }]);
    return { success: true, data: item[0] };
  }

  @Put(':id')
  async updateBanner(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    const upd: Record<string, unknown> = {};
    if (dto.title       !== undefined) upd.title       = dto.title;
    if (dto.description !== undefined) upd.description = dto.description;
    if (dto.imageUrl    !== undefined) upd.image       = dto.imageUrl;
    if (dto.image       !== undefined) upd.image       = dto.image;
    if (dto.linkUrl     !== undefined) upd.link        = dto.linkUrl;
    if (dto.link        !== undefined) upd.link        = dto.link;
    if (dto.order       !== undefined) upd.order       = dto.order;
    if (dto.isActive    !== undefined) upd.isActive    = dto.isActive;
    if (dto.startDate   !== undefined) upd.startDate   = dto.startDate ? new Date(String(dto.startDate)) : null;
    if (dto.endDate     !== undefined) upd.endDate     = dto.endDate   ? new Date(String(dto.endDate))   : null;
    if (dto.platform)                  upd.platform    = dto.platform;
    if (dto.tag         !== undefined) upd.tag         = dto.tag;
    if (dto.position    !== undefined) upd.tag         = dto.position;

    const item = await this.bannerModel.findOneAndUpdate({ id }, { $set: upd }, { new: true }).lean();
    return { success: true, data: item };
  }

  @Delete(':id')
  async deleteBanner(@Param('id') id: string) {
    await this.bannerModel.deleteOne({ id });
    return { success: true };
  }
}
