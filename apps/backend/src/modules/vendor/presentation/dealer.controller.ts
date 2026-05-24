// apps/backend/src/modules/vendor/presentation/dealer.controller.ts

import { Controller, Get, Param, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { GarageSaleService } from '../application/services/garage-sale.service';
import { IEcosystemMembershipRepository } from '../domain/repositories/i-ecosystem-membership.repository';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
}

@ApiTags('Dealer — Garage Sales')
@ApiBearerAuth()
@Controller('dealer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DealerController {
  constructor(
    private readonly garageSaleService: GarageSaleService,
    @Inject('IEcosystemMembershipRepository')
    private readonly membershipRepo: IEcosystemMembershipRepository,
  ) {}

  @ApiOperation({ summary: 'Aktif garaj günü kampanyalarını listele (üye olunan ekosistemlerde)' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('garage-sales')
  async listActiveGarageSales(@CurrentUser() user: AuthenticatedUser) {
    if (!user.vendorId) return { success: false, message: 'Vendor profiliniz bulunamadı' };

    // Bayinin aktif olduğu ekosistemleri bul
    const memberships = await this.membershipRepo.findActiveByDealerId(user.vendorId);
    if (memberships.length === 0) return { success: true, data: [] };

    // Her ekosistemdeki ACTIVE kampanyaları bul
    const campaigns: Record<string, unknown>[] = [];
    for (const membership of memberships) {
      const sales = await this.getActiveSalesForEcosystem(membership.ecosystemId);
      campaigns.push(...sales);
    }

    return { success: true, data: campaigns };
  }

  @ApiOperation({ summary: 'Kampanya detayı + kendi kota durumu' })
  @ApiParam({ name: 'id', description: 'GarageSale ID' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('garage-sales/:id')
  async getGarageSaleDetail(
    @Param('id') garageSaleId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!user.vendorId) return { success: false, message: 'Vendor profiliniz bulunamadı' };

    const sale = await this.garageSaleService.findById(garageSaleId);
    if (!sale) return { success: false, message: 'Kampanya bulunamadı' };

    // Bayinin bu kampanyadaki kota durumunu bul
    const memberships = await this.membershipRepo.findActiveByDealerId(user.vendorId);
    const isMember = memberships.some(m => m.ecosystemId === sale.ecosystemId.toString());
    if (!isMember) return { success: false, message: 'Bu kampanyaya erişim yetkiniz yok' };

    return {
      success: true,
      data: {
        campaign: sale,
        // Kota durumu — frontend bu bilgiyi gösterir
        quotaStatus: 'OK', // Basitleştirilmiş
      },
    };
  }

  private async getActiveSalesForEcosystem(ecosystemId: string): Promise<Record<string, unknown>[]> {
    const { GarageSale } = await import('@barterborsa/shared-persistence/schemas/backend/garageSale.schema');
    const sales = await GarageSale.find({
      ecosystemId: ecosystemId,
      status: 'ACTIVE',
    }).lean() as Array<{ _id?: string; id: string; listingId: string; discountRate: { toString(): string }; normalPrice: { toString(): string }; discountedPrice: { toString(): string }; maxTotalQty: number; soldQty: number; maxQtyPerDealer: number; startsAt: Date; endsAt: Date; status: string }>;

    return sales.map(s => ({
      id: s._id?.toString() || s.id,
      listingId: s.listingId,
      discountRate: s.discountRate?.toString(),
      normalPrice: s.normalPrice?.toString(),
      discountedPrice: s.discountedPrice?.toString(),
      maxTotalQty: s.maxTotalQty,
      soldQty: s.soldQty,
      maxQtyPerDealer: s.maxQtyPerDealer,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      status: s.status,
    }));
  }
}