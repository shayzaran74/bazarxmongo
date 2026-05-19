// apps/backend/src/modules/vendor/application/queries/get-ecosystem-dashboard.handler.ts
// Master Plan v4.3 §4 — Marka Yönetim Paneli
// Bayi TrustScore'ları, stok hareketleri ve komisyon özeti gerçek zamanlı döner.

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetEcosystemDashboardQuery } from './get-ecosystem-dashboard.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { ITrustScoreRepository } from '../../domain/repositories/trust-score.repository.interface';
import { ISwapSessionRepository } from '../../../barter/domain/repositories/swap-session.repository.interface';
import { MongoBrandEcosystemRepository } from '../../infrastructure/persistence/mongo-brand-ecosystem.repository';
import { IListingRepository } from '../../../catalog/domain/repositories/listing.repository.interface';

// Son N günlük stok hareketi penceresi
const ACTIVITY_WINDOW_DAYS = 30;

export interface EcosystemMemberDashboard {
  vendorId:          string;
  vendorName:        string;
  tier:              string;
  trustScore:        number;
  trustLevel:        string;
  violationCount:    number;
  isFrozen:          boolean;
  activeListings:    number;
  recentTradeCount:  number;
  lastActivityAt:    Date | null;
}

export interface EcosystemDashboardResult {
  ecosystemId:     string;
  ecosystemName:   string;
  isBlindPool:     boolean;
  internalCommRate: number;
  memberCount:     number;
  members:         EcosystemMemberDashboard[];
  summary: {
    avgTrustScore:    number;
    frozenCount:      number;
    totalActiveItems: number;
    totalTradesLast30: number;
  };
}

@QueryHandler(GetEcosystemDashboardQuery)
export class GetEcosystemDashboardHandler implements IQueryHandler<GetEcosystemDashboardQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('ITrustScoreRepository') private readonly trustScoreRepo: ITrustScoreRepository,
    @Inject('ISwapSessionRepository') private readonly swapRepo: ISwapSessionRepository,
    private readonly ecosystemRepo: MongoBrandEcosystemRepository,
    @Inject('IListingRepository') private readonly listingRepo: IListingRepository,
  ) {}

  async execute(query: GetEcosystemDashboardQuery): Promise<EcosystemDashboardResult> {
    const { actorUserId, ecosystemId } = query;

    const actorVendor = await this.vendorRepo.findByUserId(actorUserId);
    if (!actorVendor) throw new NotFoundException('Vendor bulunamadı.');

    const actorProps = actorVendor.getProps();
    const actorVendorId = (actorProps as any).id || actorVendor.id;

    const ecosystem = await this.ecosystemRepo.findById(ecosystemId);
    if (!ecosystem) throw new NotFoundException('Ekosistem bulunamadı.');

    const isOwner = ecosystem.ownerId === actorVendorId;
    const actorUser = await this.vendorRepo.findById(actorUserId);
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes((actorProps as any).role ?? '');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Bu ekosistemin yönetim paneline erişim yetkiniz yok.');
    }

    const since = new Date();
    since.setDate(since.getDate() - ACTIVITY_WINDOW_DAYS);

    const members: EcosystemMemberDashboard[] = [];
    for (const memberId of (ecosystem as any).memberIds || []) {
      const memberVendor = await this.vendorRepo.findById(memberId);
      if (!memberVendor) continue;

      const memberProps = memberVendor.getProps();
      const trustRecord = await this.trustScoreRepo.findByVendorId(memberId);

      // Son 30 gündeki takas sayısı
      const initiatorSessions = await this.swapRepo.findByInitiatorId(memberId);
      const receiverSessions = await this.swapRepo.findByReceiverId(memberId);
      const allSessions = [...initiatorSessions, ...receiverSessions];
      const recentTrades = allSessions.filter((s: any) => {
        const createdAt = new Date((s as any).createdAt || (s.getProps && s.getProps().createdAt) || 0);
        return createdAt >= since;
      }).length;

      // Son aktivite
      const sortedSessions = allSessions.sort((a: any, b: any) => {
        const aDate = new Date((a as any).createdAt || 0);
        const bDate = new Date((b as any).createdAt || 0);
        return bDate.getTime() - aDate.getTime();
      });
      const lastSession = sortedSessions[0] || null;
      const lastActivityAt = lastSession
        ? new Date((lastSession as any).createdAt || (lastSession.getProps && lastSession.getProps().createdAt) || 0)
        : null;

      // Aktif ilan sayısı
      const listingsResult = await this.listingRepo.search({ vendorId: memberId, status: 'ACTIVE', take: 1 });

      members.push({
        vendorId:         memberId,
        vendorName:       (memberProps as any).storeName || (memberProps as any).slug || memberId,
        tier:             (memberProps as any).tier || 'CORE',
        trustScore:       trustRecord?.score ?? 100,
        trustLevel:       trustRecord?.level ?? 'GOOD',
        violationCount:   trustRecord?.violationCount ?? 0,
        isFrozen:         trustRecord?.isFrozen ?? false,
        activeListings:   listingsResult.total,
        recentTradeCount: recentTrades,
        lastActivityAt,
      });
    }

    const avgTrustScore    = members.length
      ? Math.round(members.reduce((s, m) => s + m.trustScore, 0) / members.length)
      : 100;
    const frozenCount      = members.filter(m => m.isFrozen).length;
    const totalActiveItems = members.reduce((s, m) => s + m.activeListings, 0);
    const totalTrades       = members.reduce((s, m) => s + m.recentTradeCount, 0);

    return {
      ecosystemId:      ecosystem.id,
      ecosystemName:    (ecosystem as any).name || ecosystemId,
      isBlindPool:      (ecosystem as any).isBlindPool ?? false,
      internalCommRate: Number((ecosystem as any).internalCommRate ?? 4),
      memberCount:      members.length,
      members:          members.sort((a, b) => b.trustScore - a.trustScore),
      summary: {
        avgTrustScore,
        frozenCount,
        totalActiveItems,
        totalTradesLast30: totalTrades,
      },
    };
  }
}