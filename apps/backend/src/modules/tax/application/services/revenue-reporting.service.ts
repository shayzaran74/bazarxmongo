// apps/backend/src/modules/tax/application/services/revenue-reporting.service.ts
// Master Plan v4.3 §5.1 — Gelir Modeli Konsolide Rapor
// 10 gelir kalemi: 3 platform × üyelik / komisyon / reklam / hizmet bedeli

import { Injectable, Logger } from '@nestjs/common';
import { UserSubscription } from '@barterborsa/shared-persistence/schemas/backend/userSubscription.schema';
import { Order } from '@barterborsa/shared-persistence/schemas/backend/order.schema';
import { MenuPurchase } from '@barterborsa/shared-persistence/schemas/backend/menuPurchase.schema';
import { AdCampaign } from '@barterborsa/shared-persistence/schemas/backend/adCampaign.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { SwapSession } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';
import { BrandEcosystem } from '@barterborsa/shared-persistence/schemas/backend/brandEcosystem.schema';
import { BlindPoolEntry } from '@barterborsa/shared-persistence/schemas/backend/blindPoolEntry.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';

// Master Plan §6 simülatör sabit oranları
const SERVICE_FEE_RATE = 0.08;
const KDV_RATE        = 0.20;
const BB_GROUP_RATE   = 0.06;

import { Types } from 'mongoose';

interface SubscriptionLeanDoc  { plan?: { monthlyFee?: Types.Decimal128 | number } }
interface OrderLeanDoc         { totalAmount?: Types.Decimal128 | number }
interface MenuPurchaseLeanDoc  { paidAmount?: Types.Decimal128 | number }
interface AdCampaignLeanDoc    { budget?: Types.Decimal128 | number }
interface VendorLeanDoc        { tier?: string }
interface SwapSessionLeanDoc   { tradeOffer?: { cashAmount?: Types.Decimal128 | number } }
interface BlindPoolEntryLeanDoc { listing?: { price?: Types.Decimal128 | number }; quantity?: Types.Decimal128 | number }

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
    const subs = await UserSubscription.find({ status: 'ACTIVE', startDate: { $gte: start, $lt: end } })
      .populate('plan')
      .lean();
    const aidatGeliri = (subs as SubscriptionLeanDoc[])
      .reduce((s, sub) => s + Number(sub.plan?.monthlyFee?.toString() ?? 0), 0);

    // Satıcı komisyon geliri — sipariş bazlı %6-12
    const orders = await Order.find({ status: 'DELIVERED', createdAt: { $gte: start, $lt: end } })
      .select('totalAmount')
      .lean();
    const toplamCiro     = (orders as OrderLeanDoc[]).reduce((s, o) => s + Number(o.totalAmount?.toString() ?? 0), 0);
    const saticiKomisyon = toplamCiro * 0.08; // ortalama %8

    // Platform hizmet bedeli — %8 + %20 KDV
    const menuPurchases = await MenuPurchase.find({ createdAt: { $gte: start, $lt: end }, status: 'REDEEMED' })
      .select('paidAmount')
      .lean();
    const menuCiro   = (menuPurchases as MenuPurchaseLeanDoc[]).reduce((s, m) => s + Number(m.paidAmount?.toString() ?? 0), 0);
    const hizmetBase = menuCiro * SERVICE_FEE_RATE;
    const hizmetBedeli = hizmetBase + hizmetBase * KDV_RATE;

    // Reklam geliri — BAZARX platform kampanyaları
    const adBudgets = await AdCampaign.find({ platform: 'BAZARX', adStatus: 'ACTIVE', createdAt: { $gte: start, $lt: end } })
      .select('budget')
      .lean();
    const reklamGeliri = (adBudgets as AdCampaignLeanDoc[]).reduce((s, a) => s + Number(a.budget?.toString() ?? 0), 0);

    const toplamBrut = aidatGeliri + saticiKomisyon + hizmetBedeli + reklamGeliri;
    return { aidatGeliri, saticiKomisyon, hizmetBedeli, reklamGeliri, toplamBrut };
  }

  // ─── TicariTakas B2B ──────────────────────────────────────────────────────
  private async getTicariTakasRevenue(start: Date, end: Date): Promise<PlatformRevenueDetail> {
    // Yıllık aidat aylığa bölünmüş
    const b2bVendors = await Vendor.find({
      tier: { $in: ['CORE', 'PRIME', 'ELITE', 'APEX'] },
      status: 'APPROVED',
    }).select('tier').lean();
    const ANNUAL_FEES: Record<string, number> = {
      CORE: 12000, PRIME: 48000, ELITE: 120000, APEX: 300000,
    };
    const aidatGeliri = (b2bVendors as VendorLeanDoc[])
      .reduce((s, v) => s + (ANNUAL_FEES[v.tier ?? ''] ?? 0) / 12, 0);

    // Takas komisyon geliri — tamamlanan swap session'lar
    const sessions = await SwapSession.find({ status: 'COMPLETED', createdAt: { $gte: start, $lt: end } })
      .populate('tradeOffer')
      .lean();
    const saticiKomisyon = (sessions as SwapSessionLeanDoc[]).reduce((s, ss) => {
      const val = Number(ss.tradeOffer?.cashAmount?.toString() ?? 0);
      return s + val * 0.09; // ortalama %9 (grup dışı standart)
    }, 0);

    // Reklam geliri — BARTERBORSA platform (TicariTakas kanalı)
    const adBudgets = await AdCampaign.find({ platform: 'BARTERBORSA', adStatus: 'ACTIVE', createdAt: { $gte: start, $lt: end } })
      .select('budget')
      .lean();
    const reklamGeliri = (adBudgets as AdCampaignLeanDoc[]).reduce((s, a) => s + Number(a.budget?.toString() ?? 0), 0);

    const toplamBrut = aidatGeliri + saticiKomisyon + reklamGeliri;
    return { aidatGeliri, saticiKomisyon, hizmetBedeli: 0, reklamGeliri, toplamBrut };
  }

  // ─── BarterBorsa Kurumsal ─────────────────────────────────────────────────
  private async getBarterBorsaRevenue(start: Date, end: Date): Promise<PlatformRevenueDetail> {
    // SaaS lisans geliri — aktif ecosystem'ler
    const ecosystems = await BrandEcosystem.find({ createdAt: { $lt: end } })
      .select('id')
      .lean();
    // Her ekosistem için sabit aylık SaaS bedeli 25.000₺ varsayılan
    const DEFAULT_SAAS = 25_000;
    const aidatGeliri  = ecosystems.length * DEFAULT_SAAS;

    // BlindPool işlem yönetim bedeli %6
    const poolRequests = await BlindPoolEntry.find({ createdAt: { $gte: start, $lt: end } })
      .populate('listing')
      .lean();
    const saticiKomisyon = (poolRequests as BlindPoolEntryLeanDoc[]).reduce((s, r) => {
      const price = Number(r.listing?.price?.toString() ?? 0);
      return s + price * Number(r.quantity?.toString() ?? 0) * BB_GROUP_RATE;
    }, 0);

    const toplamBrut = aidatGeliri + saticiKomisyon;
    return { aidatGeliri, saticiKomisyon, hizmetBedeli: 0, reklamGeliri: 0, toplamBrut };
  }

  // ─── Sayım yardımcıları ───────────────────────────────────────────────────
  private async countActiveB2CMembers(start: Date, end: Date): Promise<number> {
    return UserSubscription.countDocuments({ status: 'ACTIVE', startDate: { $lt: end }, endDate: { $gte: start } });
  }

  private async countActiveB2BMembers(): Promise<number> {
    return Vendor.countDocuments({ status: 'APPROVED', tier: { $in: ['CORE', 'PRIME', 'ELITE', 'APEX'] } });
  }

  private async countActiveBarterBorsaFirms(): Promise<number> {
    return BrandEcosystem.countDocuments();
  }
}
