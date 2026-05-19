// apps/backend/src/modules/barterborsa/presentation/blind-pool.controller.ts

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { BlindPoolService } from '../application/services/blind-pool.service';
import { CommissionEngineService } from '../../vendor/application/services/commission-engine.service';
import { MongoVendorRepository } from '../../vendor/infrastructure/persistence/mongo-vendor.repository';
import { MongoBlindPoolRepository } from '../infrastructure/persistence/mongo-blind-pool.repository';

interface AuthenticatedUser { id: string; role: string; }

@ApiTags('BarterBorsa — Blind Pool')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
@Controller('barterborsa/pools')
export class BlindPoolController {
  constructor(
    private readonly poolService:   BlindPoolService,
    private readonly commission:   CommissionEngineService,
    private readonly vendorRepo:   MongoVendorRepository,
    private readonly poolRepo:     MongoBlindPoolRepository,
  ) {}

  @ApiOperation({ summary: 'Grup havuzlarını listele (kör — sadece stok görünür)' })
  @Get('group/:groupId')
  async listGroupPools(@Param('groupId') groupId: string) {
    const data = await this.poolService.listGroupPools(groupId);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Havuz detayı (kendi girişleri işaretli, diğerleri gizli)' })
  @Get(':poolId')
  async getPool(@Param('poolId') poolId: string, @CurrentUser() user: AuthenticatedUser) {
    const vendor = await this.vendorRepo.findByUserId(user.id);
    if (!vendor) return { success: false, message: 'Vendor bulunamadı' };

    const data = await this.poolService.getPoolView(poolId, vendor.id);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Havuz oluştur (kendi stoğunu havuza ekle)' })
  @Post()
  async createPool(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { groupId: string; name: string; listingId: string; quantity: number },
  ) {
    const vendor = await this.vendorRepo.findByUserId(user.id);
    if (!vendor) return { success: false, message: 'Vendor bulunamadı' };

    const poolId = await this.poolService.createPool({
      groupId:   body.groupId,
      name:      body.name,
      vendorId:  vendor.id,
      listingId: body.listingId,
      quantity:  body.quantity,
    });
    return { success: true, data: { poolId } };
  }

  @ApiOperation({ summary: 'Havuzdan talep — Smart Cap %25 kontrolü ile' })
  @Post(':poolId/request')
  async requestFromPool(
    @Param('poolId') poolId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { quantity: number; xpToApply?: number },
  ) {
    const vendor = await this.vendorRepo.findByUserId(user.id);
    if (!vendor) return { success: false, message: 'Vendor bulunamadı' };

    const result = await this.poolService.requestFromPool({
      poolId,
      vendorId: vendor.id,
      quantity: body.quantity,
    });

    if (!result.approved) {
      return {
        success: false,
        message: `Smart Cap aşıldı. Tek işlemde max ${result.maxAllowed} adet talep edebilirsiniz.`,
        data:    result,
      };
    }

    const pool = await this.poolRepo.findById(poolId);
    const entries = pool ? [] : [];
    const unitPrice  = 0;
    const totalValue = unitPrice * body.quantity;

    const commBreakdown = await this.commission.calculate({
      vendorId:           vendor.id,
      transactionAmount:  totalValue,
      isGroupTransaction: true,
      xpToApply:          0,
      referenceId:        poolId,
      referenceType:      'TRADE',
      overrideRate:       6,
    });

    return {
      success: true,
      data: {
        ...result,
        commission: {
          totalValue,
          rate:          commBreakdown.appliedRate,
          rateType:      commBreakdown.rateType,
          cashCommission: commBreakdown.cashCommission,
        },
      },
    };
  }
}
