import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
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
  async getSurplusCategories(@Query('includeChildren') includeChildren: boolean) {
    const data = await this.prisma.surplusCategory.findMany({
      where: { parentId: null },
      include: { children: { include: { children: true } } }
    });
    return { success: true, categories: data };
  }

  @Post('surplus-categories')
  async createSurplusCategory(@Body() data: any) {
    const res = await this.prisma.surplusCategory.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/ /g, '-'),
        icon: data.icon,
        parentId: data.parentId,
        order: data.order || 0,
        isActive: data.isActive ?? true
      }
    });
    return { success: true, data: res };
  }

  @Patch('surplus-categories/:id')
  async updateSurplusCategory(@Param('id') id: string, @Body() data: any) {
    const res = await this.prisma.surplusCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        parentId: data.parentId,
        order: data.order,
        isActive: data.isActive
      }
    });
    return { success: true, data: res };
  }

  @Delete('surplus-categories/:id')
  async deleteSurplusCategory(@Param('id') id: string) {
    await this.prisma.surplusCategory.delete({ where: { id } });
    return { success: true };
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
