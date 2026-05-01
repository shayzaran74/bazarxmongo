// apps/backend/src/modules/marketing/presentation/marketing-admin.controller.ts
// Genel pazarlama yönetim paneli endpoint'leri

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Marketing Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/marketing')
export class MarketingAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Pazarlama genel istatistikleri' })
  @Get('stats')
  async getStats() {
    const [voucherCount, activeVouchers] = await Promise.all([
      this.prisma.giftVoucher.count(),
      this.prisma.giftVoucher.count({ where: { redeemedAt: null } }),
    ]);
    return { success: true, data: { voucherCount, activeVouchers } };
  }
}

// Temporary Mock Controller for Group Buys Admin
import { Post, Put, Delete, Body, Param } from '@nestjs/common';

@ApiTags('Marketing Admin')
@Controller('admin/group-buys')
export class GroupBuyAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getCampaigns() {
    const data: any[] = await this.prisma.groupBuy.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const productIds = data.map(d => d.productId).filter(Boolean) as string[];
    const products = productIds.length > 0 ? await this.prisma.catalogProduct.findMany({
      where: { id: { in: productIds } },
      include: { media: { take: 1 } },
    }) : [];

    const dataWithProducts = data.map(c => {
      const p = products.find(prod => prod.id === c.productId);
      return {
        ...c,
        isActive: c.status === 'ACTIVE',
        Product: p ? {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: c.price,
          image: p.media?.[0]?.url || 'https://placehold.co/600x600?text=PRODUCT',
        } : null,
      };
    });
    return { success: true, data: dataWithProducts };
  }

  @Post()
  async createCampaign(@Body() body: any) {
    const createData: any = {
      title: body.title,
      productId: body.productId,
      status: body.isActive ? 'ACTIVE' : 'INACTIVE',
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : new Date(Date.now() + 86400000 * 7),
      tiers: body.tiers || [],
      price: body.tiers?.[0]?.price || 0,
    };
    const newCampaign = await this.prisma.groupBuy.create({ data: createData });
    return { success: true, data: newCampaign };
  }

  @Put(':id')
  async updateCampaign(@Param('id') id: string, @Body() body: any) {
    const updateData: any = {
      title: body.title,
      productId: body.productId,
      status: body.isActive ? 'ACTIVE' : 'INACTIVE',
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      tiers: body.tiers || undefined,
      price: body.tiers?.[0]?.price !== undefined ? body.tiers[0].price : undefined,
    };
    await this.prisma.groupBuy.update({
      where: { id },
      data: updateData,
    });
    return { success: true };
  }

  @Delete(':id')
  async deleteCampaign(@Param('id') id: string) {
    await this.prisma.groupBuy.delete({ where: { id } });
    return { success: true };
  }
}
