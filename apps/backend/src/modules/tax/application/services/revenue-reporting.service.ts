// apps/backend/src/modules/tax/application/services/revenue-reporting.service.ts
// Master Plan v4.3 §5.1 — Gelir Modeli Konsolide Rapor
// 10 gelir kalemi: 3 platform × üyelik / komisyon / reklam / hizmet bedeli

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';

// Master Plan §6 simülatör sabit oranları
const SERVICE_FEE_RATE = 0.08;
const KDV_RATE        = 0.20;
const BB_GROUP_RATE   = 0.06;

export interface PlatformRevenueDetail {
  aidatGeliri:     number;
  saticiKomisyon:  number;
  hizmetBedeli:    number;
  reklamGeliri:    number;
  toplamBrut:      number;
}

export interface ConsolidatedRevenueReport {
  period: { year: number; month: number };
  bx:     PlatformRevenueDetail;   // BazarX B2C
  tt:     PlatformRevenueDetail;   // TicariTakas B2B
  bb:     PlatformRevenueDetail;   // BarterBorsa Kurumsal
  konsolide: {
    toplamBrut:       number;
    toplamAidat:      number;
    toplamKomisyon:   number;
    toplamHizmet:     number;
    toplamReklam:     number;
    aktifB2cUye:      number;
    aktifB2bUye:      number;
    aktifKurum:       number;
  };
}

@Injectable()
export class RevenueReportingService {
  private readonly logger = new Logger(RevenueReportingService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Master Plan v4.3 §5.1 — Aylık/Yıllık konsolide gelir raporu
  async getConsolidatedReport(year: number, month: number): Promise<ConsolidatedRevenueReport> {
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 1);

    const [bx, tt, bb] = await Promise.all([
      this.getBazarXRevenue(startDate, endDate),
      this.getTicariTakasRevenue(startDate, endDate),
      this.getBarterBorsaRevenue(startDate, endDate),
    ]);

    return {
      period: { year, month },
      bx,
      tt,
      bb,
      konsolide: {
        toplamBrut:       bx.toplamBrut + tt.toplamBrut + bb.toplamBrut,
        toplamAidat:      bx.aidatGeliri + tt.aidatGeliri,
        toplamKomisyon:   bx.saticiKomisyon + tt.saticiKomisyon + bb.saticiKomisyon,
        toplamHizmet:     bx.hizmetBedeli,
        toplamReklam:     bx.reklamGeliri + tt.reklamGeliri + bb.reklamGeliri,
        aktifB2cUye:      await this.countActiveB2CMembers(startDate, endDate),
        aktifB2bUye:      await this.countActiveB2BMembers(),
        aktifKurum:       await this.countActiveBarterBorsaFirms(),
      },
    };
  }

  // Master Plan §5.1 — Yıllık özet (12 ay)
  async getYearlyReport(year: number): Promise<{ months: ConsolidatedRevenueReport[]; totalBrut: number }> {
    const months = await Promise.all(
      Array.from({ length: 12 }, (_, i) => this.getConsolidatedReport(year, i + 1)),
    );
    const totalBrut = months.reduce((s, m) => s + m.konsolide.toplamBrut, 0);
    return { months, totalBrut };
  }

  // ─── BazarX B2C ───────────────────────────────────────────────────────────
  private async getBazarXRevenue(start: Date, end: Date): Promise<PlatformRevenueDetail> {
    // Aidat geliri — aktif B2C abonelik ödemeleri
    const subs = await this.prisma.userSubscription.findMany({
      where:   { status: 'ACTIVE', startDate: { gte: start, lt: end } },
      include: { plan: true },
    });
    const aidatGeliri = subs.reduce((s, sub) => s + Number(sub.plan.monthlyFee), 0);

    // Satıcı komisyon geliri — sipariş bazlı %6-12
    const orders = await this.prisma.order.findMany({
      where:  { status: 'DELIVERED', createdAt: { gte: start, lt: end } },
      select: { totalAmount: true },
    });
    const toplamCiro     = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
    const saticiKomisyon = toplamCiro * 0.08; // ortalama %8

    // Platform hizmet bedeli — %8 + %20 KDV
    const menuPurchases = await this.prisma.menuPurchase.findMany({
      where:  { createdAt: { gte: start, lt: end }, status: 'REDEEMED' },
      select: { paidAmount: true },
    });
    const menuCiro   = menuPurchases.reduce((s, m) => s + Number(m.paidAmount), 0);
    const hizmetBase = menuCiro * SERVICE_FEE_RATE;
    const hizmetBedeli = hizmetBase + hizmetBase * KDV_RATE;

    // Reklam geliri — BAZARX platform kampanyaları
    const adBudgets = await this.prisma.adCampaign.findMany({
      where:  { platform: 'BAZARX', adStatus: 'ACTIVE', createdAt: { gte: start, lt: end } },
      select: { budget: true },
    });
    const reklamGeliri = adBudgets.reduce((s, a) => s + Number(a.budget), 0);

    const toplamBrut = aidatGeliri + saticiKomisyon + hizmetBedeli + reklamGeliri;
    return { aidatGeliri, saticiKomisyon, hizmetBedeli, reklamGeliri, toplamBrut };
  }

  // ─── TicariTakas B2B ──────────────────────────────────────────────────────
  private async getTicariTakasRevenue(start: Date, end: Date): Promise<PlatformRevenueDetail> {
    // Yıllık aidat aylığa bölünmüş
    const b2bVendors = await this.prisma.vendor.findMany({
      where:  { tier: { in: ['CORE', 'PRIME', 'ELITE', 'APEX'] }, status: 'APPROVED' },
      select: { tier: true },
    });
    const ANNUAL_FEES: Record<string, number> = {
      CORE: 12000, PRIME: 48000, ELITE: 120000, APEX: 300000,
    };
    const aidatGeliri = b2bVendors.reduce((s, v) => s + (ANNUAL_FEES[v.tier] ?? 0) / 12, 0);

    // Takas komisyon geliri — tamamlanan swap session'lar
    const sessions = await this.prisma.swapSession.findMany({
      where:  { status: 'COMPLETED', createdAt: { gte: start, lt: end } },
      include: {
        tradeOffer: { select: { cashAmount: true } },
      },
    });
    const saticiKomisyon = sessions.reduce((s, ss) => {
      const val = Number(ss.tradeOffer.cashAmount ?? 0);
      return s + val * 0.09; // ortalama %9 (grup dışı standart)
    }, 0);

    // Reklam geliri — BARTERBORSA platform (TicariTakas kanalı)
    const adBudgets = await this.prisma.adCampaign.findMany({
      where:  { platform: 'BARTERBORSA', adStatus: 'ACTIVE', createdAt: { gte: start, lt: end } },
      select: { budget: true },
    });
    const reklamGeliri = adBudgets.reduce((s, a) => s + Number(a.budget), 0);

    const toplamBrut = aidatGeliri + saticiKomisyon + reklamGeliri;
    return { aidatGeliri, saticiKomisyon, hizmetBedeli: 0, reklamGeliri, toplamBrut };
  }

  // ─── BarterBorsa Kurumsal ─────────────────────────────────────────────────
  private async getBarterBorsaRevenue(start: Date, end: Date): Promise<PlatformRevenueDetail> {
    // SaaS lisans geliri — aktif ecosystem'ler
    const ecosystems = await this.prisma.brandEcosystem.findMany({
      where: { createdAt: { lt: end } },
      select: { id: true },
    });
    // Her ekosistem için sabit aylık SaaS bedeli 25.000₺ varsayılan
    const DEFAULT_SAAS = 25_000;
    const aidatGeliri  = ecosystems.length * DEFAULT_SAAS;

    // BlindPool işlem yönetim bedeli %6
    const poolRequests = await this.prisma.blindPoolEntry.findMany({
      where:  { createdAt: { gte: start, lt: end } },
      include: { listing: { select: { price: true } } },
    });
    const saticiKomisyon = poolRequests.reduce((s, r) => {
      const price = Number(r.listing?.price ?? 0);
      return s + price * Number(r.quantity) * BB_GROUP_RATE;
    }, 0);

    const toplamBrut = aidatGeliri + saticiKomisyon;
    return { aidatGeliri, saticiKomisyon, hizmetBedeli: 0, reklamGeliri: 0, toplamBrut };
  }

  // ─── Sayım yardımcıları ───────────────────────────────────────────────────
  private async countActiveB2CMembers(start: Date, end: Date): Promise<number> {
    return this.prisma.userSubscription.count({
      where: { status: 'ACTIVE', startDate: { lt: end }, endDate: { gte: start } },
    });
  }

  private async countActiveB2BMembers(): Promise<number> {
    return this.prisma.vendor.count({
      where: {
        status: 'APPROVED',
        tier:   { in: ['CORE', 'PRIME', 'ELITE', 'APEX'] },
      },
    });
  }

  private async countActiveBarterBorsaFirms(): Promise<number> {
    return this.prisma.brandEcosystem.count();
  }
}
