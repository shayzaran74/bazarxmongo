// apps/backend/src/modules/vendor/application/queries/get-ecosystem-dashboard.handler.ts
// Master Plan v4.3 §4 — Marka Yönetim Paneli
// Bayi TrustScore'ları, stok hareketleri ve komisyon özeti gerçek zamanlı döner.

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetEcosystemDashboardQuery } from './get-ecosystem-dashboard.query';

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
  recentTradeCount:  number;   // Son 30 gündeki takas sayısı
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
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEcosystemDashboardQuery): Promise<EcosystemDashboardResult> {
    const { actorUserId, ecosystemId } = query;

    // Actor vendor'ı bul
    const actorVendor = await this.prisma.vendor.findFirst({
      where:  { userId: actorUserId },
      select: { id: true },
    });
    if (!actorVendor) throw new NotFoundException('Vendor bulunamadı.');

    // Ekosistemi al — owner veya admin erişimi
    const ecosystem = await this.prisma.brandEcosystem.findUnique({
      where:   { id: ecosystemId },
      include: {
        members: {
          select: {
            id:     true,
            slug:   true,
            tier:   true,
            status: true,
            profile: {
              select: { storeName: true },
            },
            stats: {
              select: {
                trustScore:        true,
                activeListingCount: true,
              },
            },
          },
        },
      },
    });

    if (!ecosystem) throw new NotFoundException('Ekosistem bulunamadı.');

    // Sahip veya admin kontrolü
    const isOwner = ecosystem.ownerId === actorVendor.id;
    const actorUser = await this.prisma.user.findUnique({
      where:  { id: actorUserId },
      select: { role: true },
    });
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(actorUser?.role ?? '');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Bu ekosistemin yönetim paneline erişim yetkiniz yok.');
    }

    const since = new Date();
    since.setDate(since.getDate() - ACTIVITY_WINDOW_DAYS);

    // Her member için TrustScore + son işlem bilgisi + ihlal sayısı
    const members: EcosystemMemberDashboard[] = await Promise.all(
      ecosystem.members.map(async (member) => {
        const [trustRecord, recentTrades] = await Promise.all([
          this.prisma.trustScore.findUnique({
            where:  { vendorId: member.id },
            select: {
              score:          true,
              level:          true,
              violationCount: true,
              isFrozen:       true,
            },
          }),
          this.prisma.swapSession.count({
            where: {
              OR: [
                { initiatorId: member.id },
                { receiverId:  member.id },
              ],
              createdAt: { gte: since },
            },
          }),
        ]);

        // Son aktivite (en son swap session)
        const lastSession = await this.prisma.swapSession.findFirst({
          where: {
            OR: [{ initiatorId: member.id }, { receiverId: member.id }],
          },
          orderBy: { createdAt: 'desc' },
          select:  { createdAt: true },
        });

        return {
          vendorId:         member.id,
          vendorName:       member.profile?.storeName ?? member.slug,
          tier:             member.tier,
          trustScore:       Number(trustRecord?.score ?? 100),
          trustLevel:       trustRecord?.level ?? 'GOOD',
          violationCount:   trustRecord?.violationCount ?? 0,
          isFrozen:         trustRecord?.isFrozen ?? false,
          activeListings:   member.stats?.activeListingCount ?? 0,
          recentTradeCount: recentTrades,
          lastActivityAt:   lastSession?.createdAt ?? null,
        };
      }),
    );

    // Özet istatistikler
    const avgTrustScore    = members.length
      ? Math.round(members.reduce((s, m) => s + m.trustScore, 0) / members.length)
      : 100;
    const frozenCount      = members.filter(m => m.isFrozen).length;
    const totalActiveItems = members.reduce((s, m) => s + m.activeListings, 0);
    const totalTrades      = members.reduce((s, m) => s + m.recentTradeCount, 0);

    return {
      ecosystemId:      ecosystem.id,
      ecosystemName:    ecosystem.name,
      isBlindPool:      ecosystem.isBlindPool ?? false,
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
