// apps/backend/src/modules/tax/presentation/tax.controller.ts

import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';
import { TaxCalculatorService } from '../application/services/tax-calculator.service';

@ApiTags('Tax')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/tax')
export class TaxController {
  constructor(
    private readonly taxCalc: TaxCalculatorService,
    private readonly prisma:  PrismaService,
  ) {}

  @ApiOperation({ summary: 'Aylık konsolide vergi raporu (gerçek zamanlı hesaplama)' })
  @Get('monthly-report')
  async getMonthlyReport(
    @Query('year')  year?:  string,
    @Query('month') month?: string,
  ) {
    const now = new Date();
    const y   = Number(year)  || now.getFullYear();
    const m   = Number(month) || now.getMonth() + 1;

    const startDate = new Date(y, m - 1, 1);
    const endDate   = new Date(y, m, 0, 23, 59, 59);

    // DB'den bu aya ait gelir verilerini topla
    const [menuRevenue, subscriptionRevenue, orderCommission] = await Promise.all([
      // Menü hizmet bedeli geliri
      this.prisma.menuPurchase.aggregate({
        where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
        _sum:  { serviceFee: true, vatAmount: true },
      }),
      // Abonelik geliri
      this.prisma.userSubscription.count({
        where: { startDate: { gte: startDate, lte: endDate }, status: 'ACTIVE' },
      }),
      // Sipariş komisyonu (yaklaşık — tam hesap financial-service'de)
      this.prisma.order.aggregate({
        where: { createdAt: { gte: startDate, lte: endDate }, status: { in: ['COMPLETED', 'DELIVERED'] } },
        _sum:  { totalAmount: true },
        _count: { id: true },
      }),
    ]);

    const hizmetBedeli  = Number(menuRevenue._sum.serviceFee ?? 0);
    const menuVat       = Number(menuRevenue._sum.vatAmount ?? 0);
    const saticiKomisyon = Number(orderCommission._sum.totalAmount ?? 0) * 0.09; // ~%9 ortalama

    const taxReport = this.taxCalc.calculateConsolidated({
      bazarX: {
        aidatGeliri:    0,  // abonelik → ayrı entegrasyon gerekli
        saticiKomisyon,
        reklamGeliri:   0,
        hizmetBedeli,
        giderler:       0,
      },
      ticariTakas: {
        aidatGeliri:    0,
        komisyonGeliri: 0,
        reklamGeliri:   0,
        giderler:       0,
      },
    });

    return {
      success: true,
      data: {
        period:    `${y}-${String(m).padStart(2, '0')}`,
        metrics: {
          menuPurchases:      await this.prisma.menuPurchase.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
          activeSubscriptions: subscriptionRevenue,
          completedOrders:    orderCommission._count.id,
          menuServiceRevenue: hizmetBedeli,
          menuVatCollected:   menuVat,
        },
        taxBreakdown: taxReport,
        note: 'Tam vergi hesabı için mali müşavir onayı gereklidir. Bu rapor yaklaşık değerler içerir.',
      },
    };
  }

  @ApiOperation({ summary: 'Vergi ön hesaplama (parametrik)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bazarX:      { type: 'object' },
        ticariTakas: { type: 'object' },
      },
    },
  })
  @Post('calculate')
  async calculate(
    @Body() body: {
      bazarX: {
        aidatGeliri: number; saticiKomisyon: number; reklamGeliri: number;
        hizmetBedeli: number; giderler: number;
      };
      ticariTakas: {
        aidatGeliri: number; komisyonGeliri: number; reklamGeliri: number; giderler: number;
      };
    },
  ) {
    const data = this.taxCalc.calculateConsolidated(body);
    return { success: true, data };
  }
}
