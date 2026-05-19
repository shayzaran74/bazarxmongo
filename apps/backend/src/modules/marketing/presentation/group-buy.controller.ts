import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { GroupBuy } from '@barterborsa/shared-persistence/schemas/backend/groupBuy.schema';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';

@ApiTags('Marketing')
@Controller('group-buy')
export class GroupBuyController {
  @Public()
  @ApiOperation({ summary: 'List active group buy deals', description: 'Aktif grup satın alma kampanyalarını döner.' })
  @ApiResponse({ status: 200, description: 'Grup satın alma listesi.' })
  @Get('active')
  async getActiveDeals() {
    const activeCampaign = await GroupBuy.findOne({ status: 'ACTIVE' })
      .sort({ createdAt: -1 })
      .lean();

    if (!activeCampaign) {
      return { success: true, data: null };
    }

    const campaignData: any = activeCampaign;
    let productDetails = null;

    if (campaignData.productId) {
      const p = await CatalogProduct.findOne({ id: campaignData.productId })
        .populate('media')
        .lean();
      if (p) {
        productDetails = {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: campaignData.price,
          image: (p as any).media?.[0]?.url || 'https://placehold.co/600x600?text=PRODUCT'
        };
      }
    }

    return {
      success: true,
      data: {
        ...campaignData,
        isActive: campaignData.status === 'ACTIVE',
        Product: productDetails
      }
    };
  }

  @Public()
  @ApiOperation({ summary: 'List all active group buy deals', description: 'Tüm aktif grup satın alma kampanyalarını döner.' })
  @ApiResponse({ status: 200, description: 'Tüm grup satın alma listesi.' })
  @Get('all')
  async getAllActiveDeals() {
    const activeCampaigns = await GroupBuy.find({ status: 'ACTIVE' })
      .sort({ createdAt: -1 })
      .lean();

    const productIds = activeCampaigns.map((c: any) => c.productId).filter(Boolean);
    const products = productIds.length > 0 ? await CatalogProduct.find({ id: { $in: productIds } })
      .populate('media')
      .lean() : [];

    const dataWithProducts = activeCampaigns.map((c: any) => {
      const p = products.find(prod => prod.id === c.productId);
      return {
        ...c,
        isActive: c.status === 'ACTIVE',
        Product: p ? {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: c.price,
          image: (p as any).media?.[0]?.url || 'https://placehold.co/600x600?text=PRODUCT'
        } : null
      };
    });

    return {
      success: true,
      data: dataWithProducts
    };
  }
}
