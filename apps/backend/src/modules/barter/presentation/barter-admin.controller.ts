import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Barter Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class BarterAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all trade offers for admin' })
  @Get('offers/all')
  async getAllOffers() {
    const data = await this.prisma.tradeOffer.findMany({
      include: {
        fromCompany: true,
        toCompany: true,
        offeredItems: true,
        requestedItems: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data };
  }

  @ApiOperation({ summary: 'List pending trade offers' })
  @Get('offers/pending')
  async getPendingOffers() {
    const data = await this.prisma.tradeOffer.findMany({
      where: { status: 'PENDING' },
      include: {
        fromCompany: true,
        toCompany: true,
        offeredItems: true,
        requestedItems: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data };
  }

  @ApiOperation({ summary: 'List wanted items/surplus requests' })
  @Get('wanted-items')
  async getWantedItems(@Query('status') status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const data = await this.prisma.wantedItem.findMany({
      where,
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data };
  }

  @ApiOperation({ summary: 'List surplus categories' })
  @Get('surplus-categories')
  async getSurplusCategories() {
    // Kategori ağacını döndür
    const data = await this.prisma.category.findMany({
      where: { parentId: null },
      include: { children: true }
    });
    return { success: true, data };
  }

  @ApiOperation({ summary: 'List barter users' })
  @Get('barter/users')
  async getBarterUsers() {
    const data = await this.prisma.vendor.findMany({
      include: { company: true, profile: true },
      take: 50
    });
    return { success: true, data };
  }

  @ApiOperation({ summary: 'List barter chains' })
  @Get('barter/chains')
  async getBarterChains() {
    return { success: true, data: [] };
  }

  @ApiOperation({ summary: 'List demand matches' })
  @Get('barter/demand-matches')
  async getDemandMatches() {
    return { success: true, data: [] };
  }
}
