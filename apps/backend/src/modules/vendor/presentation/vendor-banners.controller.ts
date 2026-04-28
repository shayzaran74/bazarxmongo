// apps/backend/src/modules/vendor/presentation/vendor-banners.controller.ts

import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, NotFoundException,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
  ApiParam, ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Vendor Content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vendor-banners')
export class VendorBannersController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Satıcının bannerlarını listele' })
  @ApiResponse({ status: 200 })
  @Get()
  async findAll(@CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) return { success: true, data: [] };

    const data = await this.prisma.vendorBanner.findMany({
      where: { vendorId: vendor.id },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return { success: true, data };
  }

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
  async create(@CurrentUser() user: any, @Body() body: any) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    const banner = await this.prisma.vendorBanner.create({
      data: {
        vendorId:        vendor.id,
        imageUrl:        body.imageUrl,
        linkUrl:         body.linkUrl,
        type:            body.type ?? 1,
        template:        body.template ?? 'A',
        order:           body.order ?? 0,
        targetCities:    body.targetCities ?? [],
        targetDistricts: body.targetDistricts ?? [],
        status:          'PENDING',
        isActive:        false,
      },
    });
    return { success: true, data: banner };
  }

  @ApiOperation({ summary: 'Banner güncelle' })
  @ApiParam({ name: 'id' })
  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    const existing = await this.prisma.vendorBanner.findFirst({
      where: { id, vendorId: vendor.id },
    });
    if (!existing) throw new NotFoundException('Banner bulunamadı');

    const updated = await this.prisma.vendorBanner.update({
      where: { id },
      data: {
        ...(body.imageUrl        !== undefined && { imageUrl: body.imageUrl }),
        ...(body.linkUrl         !== undefined && { linkUrl: body.linkUrl }),
        ...(body.type            !== undefined && { type: body.type }),
        ...(body.template        !== undefined && { template: body.template }),
        ...(body.order           !== undefined && { order: body.order }),
        ...(body.targetCities    !== undefined && { targetCities: body.targetCities }),
        ...(body.targetDistricts !== undefined && { targetDistricts: body.targetDistricts }),
      },
    });
    return { success: true, data: updated };
  }

  @ApiOperation({ summary: 'Banner sil' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    const existing = await this.prisma.vendorBanner.findFirst({
      where: { id, vendorId: vendor.id },
    });
    if (!existing) throw new NotFoundException('Banner bulunamadı');

    await this.prisma.vendorBanner.delete({ where: { id } });
    return { success: true };
  }
}
