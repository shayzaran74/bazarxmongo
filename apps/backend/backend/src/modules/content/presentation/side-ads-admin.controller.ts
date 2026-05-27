// apps/backend/src/modules/content/presentation/side-ads-admin.controller.ts

import { Controller, Get, Post, Body, Query, UseGuards, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { ISideAd, IAdLocation } from '@barterborsa/shared-persistence';

@ApiTags('Side Ads Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/side-ads')
export class SideAdsAdminController {
  constructor(
    @InjectModel('SideAd')    private readonly sideAdModel:    Model<ISideAd>,
    @InjectModel('AdLocation')private readonly adLocationModel:Model<IAdLocation>,
  ) {}

  @ApiOperation({ summary: 'List all side ads' })
  @Get()
  async getSideAds(@Query('side') side?: string) {
    const where: Record<string, unknown> = {};
    if (side) where.side = side;
    const items = await this.sideAdModel.find(where).sort({ order: 1 }).lean();
    return { success: true, data: items };
  }

  @Post()
  async createSideAd(@Body() dto: Record<string, unknown>) {
    const newId = new Types.ObjectId().toString();
    const item  = await this.sideAdModel.create([{
      _id: newId, id: newId,
      side:       dto.side        ?? 'LEFT',
      title:      dto.title,
      subtitle:   dto.subtitle,
      image:      dto.image,
      emoji:      dto.emoji,
      link:       dto.link,
      order:      dto.order       ?? 0,
      isActive:   dto.isActive !== undefined ? dto.isActive : true,
      ecosystems: (dto.ecosystems as string[] ?? ['GLOBAL']).filter(Boolean),
      category:   dto.category,
    }]);
    return { success: true, data: item[0] };
  }

  @Put('reorder')
  async reorderSideAds(@Body() dto: { ids: string[] }) {
    await Promise.all(
      dto.ids.map((id, index) =>
        this.sideAdModel.updateOne({ id }, { $set: { order: index } }),
      ),
    );
    return { success: true };
  }

  @Put(':id')
  async updateSideAd(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    const upd: Record<string, unknown> = {};
    for (const key of ['side','title','subtitle','image','emoji','link','order','isActive','ecosystems','category']) {
      if (dto[key] !== undefined) upd[key] = dto[key];
    }
    const item = await this.sideAdModel.findOneAndUpdate({ id }, { $set: upd }, { new: true }).lean();
    return { success: true, data: item };
  }

  @Delete(':id')
  async deleteSideAd(@Param('id') id: string) {
    await this.adLocationModel.deleteMany({ sideAdId: id });
    await this.sideAdModel.deleteOne({ id });
    return { success: true };
  }
}
