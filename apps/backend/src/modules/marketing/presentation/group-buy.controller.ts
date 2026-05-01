import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Marketing')
@Controller('group-buy')
export class GroupBuyController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @ApiOperation({ summary: 'List active group buy deals', description: 'Aktif grup satın alma kampanyalarını döner.' })
  @ApiResponse({ status: 200, description: 'Grup satın alma listesi.' })
  @Get('active')
  async getActiveDeals() {
    const activeCampaign = await this.prisma.groupBuy.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });

    if (!activeCampaign) {
      return { success: true, data: null };
    }

    const campaignData: any = activeCampaign;
    let productDetails = null;

    if (campaignData.productId) {
      const p = await this.prisma.catalogProduct.findUnique({
        where: { id: campaignData.productId },
        include: { media: { take: 1 } }
      });
      if (p) {
        productDetails = {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: campaignData.price,
          image: p.media?.[0]?.url || 'https://placehold.co/600x600?text=PRODUCT'
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
    const activeCampaigns = await this.prisma.groupBuy.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });

    const productIds = activeCampaigns.map((c: any) => c.productId).filter(Boolean);
    const products = productIds.length > 0 ? await this.prisma.catalogProduct.findMany({
      where: { id: { in: productIds } },
      include: { media: { take: 1 } }
    }) : [];

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
          image: p.media?.[0]?.url || 'https://placehold.co/600x600?text=PRODUCT'
        } : null
      };
    });

    return {
      success: true,
      data: dataWithProducts
    };
  }
}
