import { Controller, Get, Post, Body, Query, UseGuards, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Side Ads Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/side-ads')
export class SideAdsAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all side ads' })
  @Get()
  async getSideAds(@Query('ecosystem') ecosystem?: string, @Query('side') side?: string) {
    const where: any = {};
    if (side) where.side = side;
    if (ecosystem && ecosystem !== 'GLOBAL') {
      where.ecosystems = { has: ecosystem };
    }

    const items = await this.prisma.sideAd.findMany({
      where,
      include: { locations: true },
      orderBy: { order: 'asc' },
    });

    return { success: true, data: items };
  }

  @Post()
  async createSideAd(@Body() dto: any) {
    const { locationTags, ...rest } = dto;

    const item = await this.prisma.sideAd.create({
      data: {
        side: rest.side || 'LEFT',
        title: rest.title,
        subtitle: rest.subtitle,
        image: rest.image,
        emoji: rest.emoji,
        link: rest.link,
        order: rest.order ?? 0,
        isActive: rest.isActive !== undefined ? rest.isActive : true,
        // null/undefined değerleri temizle, boşsa ['GLOBAL'] kullan
        ecosystems: (rest.ecosystems || ['GLOBAL']).filter((e: any) => e != null && e !== '') as string[],
        category: rest.category,
        ...(locationTags?.city ? {
          locations: {
            create: [{
              tag: [locationTags.city, locationTags.district].filter(Boolean).join(':'),
            }]
          }
        } : {}),
      },
      include: { locations: true },
    });

    return { success: true, data: item };
  }

  @Put('reorder')
  async reorderSideAds(@Body() dto: { ids: string[] }) {
    await Promise.all(
      dto.ids.map((id, index) =>
        this.prisma.sideAd.update({ where: { id }, data: { order: index } })
      )
    );
    return { success: true };
  }

  @Put(':id')
  async updateSideAd(@Param('id') id: string, @Body() dto: any) {
    const { locationTags, locations, ...rest } = dto;

    const updateData: any = {};
    if (rest.side !== undefined) updateData.side = rest.side;
    if (rest.title !== undefined) updateData.title = rest.title;
    if (rest.subtitle !== undefined) updateData.subtitle = rest.subtitle;
    if (rest.image !== undefined) updateData.image = rest.image;
    if (rest.emoji !== undefined) updateData.emoji = rest.emoji;
    if (rest.link !== undefined) updateData.link = rest.link;
    if (rest.order !== undefined) updateData.order = rest.order;
    if (rest.isActive !== undefined) updateData.isActive = rest.isActive;
    if (rest.ecosystems !== undefined) updateData.ecosystems = rest.ecosystems;
    if (rest.category !== undefined) updateData.category = rest.category;

    const item = await this.prisma.sideAd.update({
      where: { id },
      data: updateData,
      include: { locations: true },
    });

    return { success: true, data: item };
  }

  @Delete(':id')
  async deleteSideAd(@Param('id') id: string) {
    // Önce ilişkili locations'ları sil
    await this.prisma.adLocation.deleteMany({ where: { sideAdId: id } });
    await this.prisma.sideAd.delete({ where: { id } });
    return { success: true };
  }
}
