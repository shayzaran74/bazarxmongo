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
import { IBrandEcosystemRepository } from '../../domain/repositories/brand-ecosystem.repository.interface';
import { IEcosystemMembershipRepository } from '../../domain/repositories/i-ecosystem-membership.repository';
import { IListingRepository } from '../../../catalog/domain/repositories/listing.repository.interface';
import { scoreToLevel } from '../../../barter/domain/trust-level.constants';

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
    @Inject('IBrandEcosystemRepository') private readonly ecosystemRepo: IBrandEcosystemRepository,
    @Inject('IEcosystemMembershipRepository')
    private readonly membershipRepo: IEcosystemMembershipRepository,
    @Inject('IListingRepository') private readonly listingRepo: IListingRepository,
  ) {}

  async execute(query: GetEcosystemDashboardQuery): Promise<EcosystemDashboardResult> {
    const { actorUserId, ecosystemId } = query;

    const actorVendor = await this.vendorRepo.findByUserId(actorUserId);
    if (!actorVendor) throw new NotFoundException('Vendor bulunamadı.');

    const actorVendorId = actorVendor.id;

    const ecosystem = await this.ecosystemRepo.findById(ecosystemId);
    if (!ecosystem) throw new NotFoundException('Ekosistem bulunamadı.');

    const isOwner = ecosystem.ownerId === actorVendorId;
    // Gizlilik fail-safe: alan tanımsızsa kör havuz (kimlik gizli) varsayılır
    const isBlindPool = ecosystem.isBlindPool ?? true;

    // Kör havuzda sahip dışında herkes anonymousId ile görür
    const isAnonymousViewer = isBlindPool && !isOwner;

    const since = new Date();
    since.setDate(since.getDate() - ACTIVITY_WINDOW_DAYS);

    // Üyelik tek doğruluk kaynağı: EcosystemMembership koleksiyonu (legacy memberIds/Vendor.ecosystemId değil)
    const memberships = await this.membershipRepo.findByEcosystemId(ecosystemId);
    const memberIds: string[] = memberships
      .filter(m => m.status === 'ACTIVE')
      .map(m => m.dealerId);

    const members: EcosystemMemberDashboard[] = [];
    for (const memberId of memberIds) {
      const memberVendor = await this.vendorRepo.findById(memberId);
      if (!memberVendor) continue;

      const memberProps = memberVendor.getProps();
      const trustRecord = await this.trustScoreRepo.findByVendorId(memberId);

      // Son 30 gündeki takas sayısı
      const initiatorSessions = await this.swapRepo.findByInitiatorId(memberId);
      const receiverSessions = await this.swapRepo.findByReceiverId(memberId);
      const allSessions = [...initiatorSessions, ...receiverSessions];
      const recentTrades = allSessions.filter(s => s.getProps().createdAt >= since).length;

      // Son aktivite
      const sortedSessions = allSessions.sort((a, b) =>
        b.getProps().createdAt.getTime() - a.getProps().createdAt.getTime()
      );
      const lastSession = sortedSessions[0] ?? null;
      const lastActivityAt = lastSession ? lastSession.getProps().createdAt : null;

      // Aktif ilan sayısı
      const listingsResult = await this.listingRepo.search({ vendorId: memberId, status: 'ACTIVE', take: 1 });

      // VendorProps'ta storeName/slug olmadığından güvenli fallback kullanılır
      const vendorMeta = memberProps as unknown as { storeName?: string; slug?: string };

      // Kör havuzda vendorId ve vendorName maskelenir — anonymousId kullanılır
      const displayVendorId = isAnonymousViewer
        ? `anon-${memberId.substring(0, 8)}`
        : memberId;
      const displayVendorName = isAnonymousViewer
        ? `Bayi ${memberId.substring(0, 8).toUpperCase()}`
        : (vendorMeta.storeName || vendorMeta.slug || memberId);

      members.push({
        vendorId:         displayVendorId,
        vendorName:       displayVendorName,
        tier:             isAnonymousViewer ? 'HIDDEN' : String(memberProps.tier ?? 'CORE'),
        trustScore:       isAnonymousViewer ? 0 : Number(trustRecord?.score?.toString() ?? 100),
        trustLevel:       isAnonymousViewer ? 'ANONYMOUS' : (trustRecord?.level ?? scoreToLevel(Number(trustRecord?.score?.toString() ?? 100))),
        violationCount:   isAnonymousViewer ? 0 : (trustRecord?.violationCount ?? 0),
        isFrozen:         isAnonymousViewer ? false : (trustRecord?.isFrozen ?? false),
        activeListings:   isAnonymousViewer ? 0 : listingsResult.total,
        recentTradeCount: isAnonymousViewer ? 0 : recentTrades,
        lastActivityAt:   isAnonymousViewer ? null : lastActivityAt,
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
      ecosystemName:    ecosystem.name || ecosystemId,
      isBlindPool:      ecosystem.isBlindPool ?? true,
      internalCommRate: Number(ecosystem.internalCommRate ?? 4),
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