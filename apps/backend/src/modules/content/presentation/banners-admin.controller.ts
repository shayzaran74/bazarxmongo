import { Controller, Get, Post, Body, Query, UseGuards, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Banners Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/banners')
export class BannersAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all banners for admin' })
  @Get()
  async getBanners(@Query('ecosystem') ecosystem?: string) {
    const where: any = {};
    if (ecosystem && ecosystem !== 'GLOBAL') {
      where.ecosystems = { has: ecosystem };
    }
    
    const items = await this.prisma.homeBanner.findMany({
      orderBy: { order: 'asc' }
    });

    return {
      success: true,
      data: items
    };
  }

  @Post()
  async createBanner(@Body() dto: any) {
    const item = await this.prisma.homeBanner.create({
      data: {
        title: dto.title,
        description: dto.description,
        image: dto.imageUrl || dto.image || '',
        link: dto.linkUrl || dto.link,
        order: dto.order || 0,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        platform: dto.platform || 'BAZARX',
        tag: dto.tag || dto.position,
      }
    });
    return { success: true, data: item };
  }

  @Put(':id')
  async updateBanner(@Param('id') id: string, @Body() dto: any) {
    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.imageUrl !== undefined) updateData.image = dto.imageUrl;
    if (dto.image !== undefined) updateData.image = dto.image;
    if (dto.linkUrl !== undefined) updateData.link = dto.linkUrl;
    if (dto.link !== undefined) updateData.link = dto.link;
    if (dto.order !== undefined) updateData.order = dto.order;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.startDate !== undefined) updateData.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined) updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.platform) updateData.platform = dto.platform;
    if (dto.tag !== undefined) updateData.tag = dto.tag;
    if (dto.position !== undefined) updateData.tag = dto.position;

    const item = await this.prisma.homeBanner.update({
      where: { id },
      data: updateData
    });
    return { success: true, data: item };
  }

  @Delete(':id')
  async deleteBanner(@Param('id') id: string) {
    await this.prisma.homeBanner.delete({ where: { id } });
    return { success: true };
  }
}
