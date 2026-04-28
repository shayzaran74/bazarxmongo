// apps/backend/src/modules/barter/presentation/barter-admin.controller.ts

import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Barter Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/barter')
export class BarterAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all trade offers for admin' })
  @Get('offers')
  async getAllOffers() {
    const data = await this.prisma.tradeOffer.findMany({
      include: {
        fromCompany: true,
        toCompany: true,
        offeredItems: true,
        requestedItems: true,
      },
      orderBy: { createdAt: 'desc' },
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
        requestedItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data };
  }

  @ApiOperation({ summary: 'List wanted items' })
  @Get('wanted-items')
  async getWantedItems(@Query('status') status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const data = await this.prisma.wantedItem.findMany({
      where,
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data };
  }

  @ApiOperation({ summary: 'List surplus categories' })
  @Get('surplus-categories')
  async getSurplusCategories(@Query('includeChildren') includeChildren?: boolean) {
    const data = await this.prisma.surplusCategory.findMany({
      where: { parentId: null },
      include: { children: { include: { children: true } } },
    });
    return { success: true, categories: data };
  }

  @Post('surplus-categories')
  async createSurplusCategory(@Body() dto: any) {
    const res = await this.prisma.surplusCategory.create({
      data: {
        name: dto.name,
        slug: dto.slug || dto.name.toLowerCase().replace(/ /g, '-'),
        icon: dto.icon,
        parentId: dto.parentId,
        order: dto.order || 0,
        isActive: dto.isActive ?? true,
      },
    });
    return { success: true, data: res };
  }

  @Patch('surplus-categories/:id')
  async updateSurplusCategory(@Param('id') id: string, @Body() dto: any) {
    const res = await this.prisma.surplusCategory.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        icon: dto.icon,
        parentId: dto.parentId,
        order: dto.order,
        isActive: dto.isActive,
      },
    });
    return { success: true, data: res };
  }

  @Delete('surplus-categories/:id')
  async deleteSurplusCategory(@Param('id') id: string) {
    await this.prisma.surplusCategory.delete({ where: { id } });
    return { success: true };
  }

  @ApiOperation({ summary: 'List barter users' })
  @Get('users')
  async getBarterUsers() {
    const data = await this.prisma.vendor.findMany({
      include: { company: true, profile: true },
      take: 50,
    });
    return { success: true, data };
  }

  @ApiOperation({ summary: 'List swap sessions (chains)' })
  @Get('chains')
  async getBarterChains(@Query('status') status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const data = await this.prisma.swapSession.findMany({
      where,
      include: {
        tradeOffer: {
          include: { fromCompany: true, toCompany: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { success: true, data };
  }

  @ApiOperation({ summary: 'List demand matches' })
  @Get('demand-matches')
  async getDemandMatches(@Query('status') status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const data = await this.prisma.demandMatch.findMany({
      where,
      orderBy: { score: 'desc' },
      take: 100,
    });
    return { success: true, data };
  }
}
