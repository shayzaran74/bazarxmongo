// apps/backend/src/modules/marketing/presentation/marketing-admin.controller.ts
// Genel pazarlama yönetim paneli endpoint'leri

import { Controller, Get, Post, Put, Delete, UseGuards, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { GiftVoucher } from '@barterborsa/shared-persistence/schemas/backend/giftVoucher.schema';
import { GroupBuy } from '@barterborsa/shared-persistence/schemas/backend/groupBuy.schema';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';

@ApiTags('Marketing Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/marketing')
export class MarketingAdminController {
  @ApiOperation({ summary: 'Pazarlama genel istatistikleri' })
  @Get('stats')
  async getStats() {
    const [voucherCount, activeVouchers] = await Promise.all([
      GiftVoucher.countDocuments(),
      GiftVoucher.countDocuments({ redeemedAt: null }),
    ]);
    return { success: true, data: { voucherCount, activeVouchers } };
  }
}

// Temporary Mock Controller for Group Buys Admin
@ApiTags('Marketing Admin')
@Controller('admin/group-buys')
export class GroupBuyAdminController {
  @Get()
  async getCampaigns() {
    const data: any[] = await GroupBuy.find().sort({ createdAt: -1 }).lean();
    const productIds = data.map(d => d.productId).filter(Boolean) as string[];
    const products = productIds.length > 0 ? await CatalogProduct.find({ id: { $in: productIds } })
      .populate('media')
      .lean() : [];

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
          image: (p as any).media?.[0]?.url || 'https://placehold.co/600x600?text=PRODUCT',
        } : null,
      };
    });
    return { success: true, data: dataWithProducts };
  }

  @Post()
  async createCampaign(@Body() body: Record<string, any>) {
    const id = 'gb-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const createData: any = {
      _id: id,
      id,
      title: body.title,
      productId: body.productId,
      status: body.isActive ? 'ACTIVE' : 'INACTIVE',
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : new Date(Date.now() + 86400000 * 7),
      tiers: body.tiers || [],
      price: body.tiers?.[0]?.price || 0,
    };
    const newCampaign = await GroupBuy.create(createData);
    return { success: true, data: newCampaign };
  }

  @Put(':id')
  async updateCampaign(@Param('id') id: string, @Body() body: Record<string, any>) {
    const updateData: any = {
      title: body.title,
      productId: body.productId,
      status: body.isActive ? 'ACTIVE' : 'INACTIVE',
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      tiers: body.tiers || undefined,
      price: body.tiers?.[0]?.price !== undefined ? body.tiers[0].price : undefined,
    };
    await GroupBuy.updateOne({ id }, { $set: updateData }).exec();
    return { success: true };
  }

  @Delete(':id')
  async deleteCampaign(@Param('id') id: string) {
    await GroupBuy.deleteOne({ id }).exec();
    return { success: true };
  }
}
