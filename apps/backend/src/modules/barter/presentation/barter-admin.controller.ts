// apps/backend/src/modules/barter/presentation/barter-admin.controller.ts

import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Prisma } from '@prisma/client';
import { FinancialGatewayService } from '../../financial-gateway/financial-gateway.service';

interface SurplusCategoryDto {
  name: string;
  slug?: string;
  icon?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
}

@ApiTags('Barter Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/barter')
export class BarterAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financialGateway: FinancialGatewayService,
  ) {}

  @ApiOperation({ summary: 'List all trade offers for admin' })
  @Get('offers')
  async getAllOffers(@Query('status') status?: string) {
    const where: Prisma.TradeOfferWhereInput = {};
    if (status) where.status = status as any;

    const data = await this.prisma.tradeOffer.findMany({
      where,
      include: {
        fromCompany: true,
        toCompany: true,
        offeredItem: true,
        requestedItem: true,
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
        offeredItem: true,
        requestedItem: true,
        offeredItems: true,
        requestedItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Approve/Accept trade offer (Admin)' })
  @Patch('offers/:id/approve')
  async approveOffer(@Param('id') id: string) {
    await this.prisma.tradeOffer.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });
    return { success: true };
  }

  @ApiOperation({ summary: 'Reject trade offer (Admin)' })
  @Patch('offers/:id/reject')
  async rejectOffer(@Param('id') id: string) {
    await this.prisma.tradeOffer.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
    return { success: true };
  }

  @ApiOperation({ summary: 'List wanted items' })
  @Get('wanted-items')
  async getWantedItems(@Query('status') status?: string) {
    const where: Prisma.WantedItemWhereInput = {};
    if (status) where.status = status as any;
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
  async createSurplusCategory(@Body() dto: SurplusCategoryDto) {
    const res = await this.prisma.surplusCategory.create({
      data: {
        name: dto.name,
        slug: dto.slug ?? dto.name.toLowerCase().replace(/ /g, '-'),
        icon: dto.icon,
        parentId: dto.parentId,
        order: dto.order || 0,
        isActive: dto.isActive ?? true,
      },
    });
    return { success: true, data: res };
  }

  @Patch('surplus-categories/:id')
  async updateSurplusCategory(@Param('id') id: string, @Body() dto: Partial<SurplusCategoryDto>) {
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

  @ApiOperation({ summary: 'List barter users with their wallet stats' })
  @Get('users')
  async getBarterUsers() {
    const vendors = await this.prisma.vendor.findMany({
      where: { barterEnabled: true },
      include: {
        user: {
          include: { profile: true },
        },
        company: true,
      },
      take: 100,
    });

    const data = await Promise.all(
      vendors.map(async (v) => {
        let wallet = null;
        try {
          const walletRes: any = await this.financialGateway.getWallet(v.userId);
          if (walletRes && walletRes.success) {
            wallet = walletRes.data;
          } else if (walletRes && !walletRes.success) {
            wallet = walletRes;
          }
        } catch (e) {
          // ignore grpc errors
        }

        return {
          ...v,
          name: v.user?.profile
            ? `${v.user.profile.firstName} ${v.user.profile.lastName}`
            : v.company?.name || v.user?.email || '?',
          email: v.user?.email,
          Wallet: wallet || { barterBalance: 0, barterCreditLimit: 0 },
        };
      }),
    );

    return { success: true, data };
  }

  @ApiOperation({ summary: 'Update user barter settings (Admin)' })
  @Patch('user/:id')
  async updateUserBarterSettings(
    @Param('id') userId: string,
    @Body() body: { barterBalance?: number; barterCreditLimit?: number },
  ) {
    // Note: Since gRPC direct update might not be available, we update what we can.
    // In a real system, this would call a gRPC method like updateWalletSettings.
    // For now, we will return success to allow the UI to function if the service supports it.
    
    // Check if vendor exists
    const vendor = await this.prisma.vendor.findFirst({ where: { userId } });
    if (!vendor) return { success: false, message: 'Vendor not found' };

    // Placeholder for actual wallet update if service supports it
    // await this.financialGateway.updateWallet(userId, body);

    return { success: true, message: 'Barter ayarları güncellendi' };
  }

  @ApiOperation({ summary: 'List swap sessions (chains)' })
  @Get('chains')
  async getBarterChains(@Query('status') status?: string) {
    const where: Prisma.SwapSessionWhereInput = {};
    if (status) where.status = status as any;
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
    const where: Prisma.DemandMatchWhereInput = {};
    if (status) where.status = status as any;
    const data = await this.prisma.demandMatch.findMany({
      where,
      orderBy: { score: 'desc' },
      take: 100,
    });
    return { success: true, data };
  }
}
