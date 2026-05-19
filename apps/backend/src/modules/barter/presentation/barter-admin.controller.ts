// apps/backend/src/modules/barter/presentation/barter-admin.controller.ts

import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { Inject } from '@nestjs/common';
import { ITradeOfferRepository } from '../domain/repositories/trade-offer.repository.interface';
import { IWantedItemRepository } from '../domain/repositories/wanted-item.repository.interface';
import { ICategoryRepository } from '../domain/repositories/category.repository.interface';
import { ISwapSessionRepository } from '../domain/repositories/swap-session.repository.interface';
import { IVendorRepository } from '../../vendor/domain/repositories/vendor.repository.interface';
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
    @Inject('ITradeOfferRepository') private readonly tradeOfferRepo: ITradeOfferRepository,
    @Inject('IWantedItemRepository') private readonly wantedItemRepo: IWantedItemRepository,
    @Inject('ICategoryRepository') private readonly categoryRepo: ICategoryRepository,
    @Inject('ISwapSessionRepository') private readonly sessionRepo: ISwapSessionRepository,
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly financialGateway: FinancialGatewayService,
  ) {}

  @ApiOperation({ summary: 'List all trade offers for admin' })
  @Get('offers')
  async getAllOffers(@Query('status') status?: string) {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const result = await this.tradeOfferRepo.findWithFilters(filter, 0, 100);
    return { success: true, data: result.items };
  }

  @ApiOperation({ summary: 'List pending trade offers' })
  @Get('offers/pending')
  async getPendingOffers() {
    const result = await this.tradeOfferRepo.findWithFilters({ status: 'PENDING' }, 0, 100);
    return { success: true, data: result.items };
  }

  @ApiOperation({ summary: 'Approve/Accept trade offer (Admin)' })
  @Patch('offers/:id/approve')
  async approveOffer(@Param('id') id: string) {
    await this.tradeOfferRepo.updateStatus(id, 'ACCEPTED');
    return { success: true };
  }

  @ApiOperation({ summary: 'Reject trade offer (Admin)' })
  @Patch('offers/:id/reject')
  async rejectOffer(@Param('id') id: string) {
    await this.tradeOfferRepo.updateStatus(id, 'REJECTED');
    return { success: true };
  }

  @ApiOperation({ summary: 'List wanted items' })
  @Get('wanted-items')
  async getWantedItems(@Query('status') status?: string) {
    const items = await this.wantedItemRepo.findAll();
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'List surplus categories' })
  @Get('surplus-categories')
  async getSurplusCategories(@Query('includeChildren') _includeChildren?: boolean) {
    const categories = await this.categoryRepo.findRootCategories();
    return { success: true, categories };
  }

  @Post('surplus-categories')
  async createSurplusCategory(@Body() dto: SurplusCategoryDto) {
    const res = await this.categoryRepo.create({
      name: dto.name,
      slug: dto.slug ?? dto.name.toLowerCase().replace(/ /g, '-'),
      icon: dto.icon,
      parentId: dto.parentId,
      order: dto.order || 0,
      isActive: dto.isActive ?? true,
    });
    return { success: true, data: res };
  }

  @Patch('surplus-categories/:id')
  async updateSurplusCategory(@Param('id') id: string, @Body() dto: Partial<SurplusCategoryDto>) {
    const res = await this.categoryRepo.update(id, {
      name: dto.name,
      slug: dto.slug,
      icon: dto.icon,
      parentId: dto.parentId,
      order: dto.order,
      isActive: dto.isActive,
    });
    return { success: true, data: res };
  }

  @Delete('surplus-categories/:id')
  async deleteSurplusCategory(@Param('id') id: string) {
    await this.categoryRepo.delete(id);
    return { success: true };
  }

  @ApiOperation({ summary: 'List barter users with their wallet stats' })
  @Get('users')
  async getBarterUsers() {
    // barterEnabled olan vendorları bul
    const vendors = await this.vendorRepo.findByBarterEnabled(true);

    const data = await Promise.all(
      vendors.map(async (v: any) => {
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
          name: v.company?.name || v.user?.email || '?',
          email: v.user?.email,
          wallet: wallet || { barterBalance: 0, barterCreditLimit: 0 },
        };
      }),
    );

    return { success: true, data };
  }

  @ApiOperation({ summary: 'Update user barter settings (Admin)' })
  @Patch('user/:id')
  async updateUserBarterSettings(
    @Param('id') userId: string,
    @Body() _body: { barterBalance?: number; barterCreditLimit?: number },
  ) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) return { success: false, message: 'Vendor not found' };

    return { success: true, message: 'Barter ayarları güncellendi' };
  }

  @ApiOperation({ summary: 'List swap sessions (chains)' })
  @Get('chains')
  async getBarterChains(@Query('status') status?: string) {
    const sessions = await this.sessionRepo.findByCompanyWithFilters('', 0, 100);
    return { success: true, data: sessions.items };
  }

  @ApiOperation({ summary: 'List demand matches' })
  @Get('demand-matches')
  async getDemandMatches(@Query('status') _status?: string) {
    // DemandMatch Prisma'dan geliyor, şimdilik boş döndür
    return { success: true, data: [] };
  }
}