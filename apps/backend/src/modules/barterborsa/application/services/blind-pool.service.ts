// apps/backend/src/modules/barterborsa/application/services/blind-pool.service.ts
// Master Plan v4.3 §4 — BarterBorsa Kör Havuz + Akıllı Kota

import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { WatchtowerService } from '../../../barter/application/services/watchtower.service';
import { Decimal } from 'decimal.js';

const SMART_CAP_PCT = 0.25; // Tek işlemde max %25

@Injectable()
export class BlindPoolService {
  private readonly logger = new Logger(BlindPoolService.name);

  constructor(
    private readonly prisma:      PrismaService,
    private readonly watchtower:  WatchtowerService,
  ) {}

  // Havuz oluştur (Marka tarafından)
  async createPool(data: {
    groupId:    string;
    name:       string;
    vendorId:   string;
    listingId:  string;
    quantity:   number;
  }): Promise<string> {
    const listing = await this.prisma.listing.findFirst({
      where: { id: data.listingId, vendorId: data.vendorId },
      select: { id: true, stock: true },
    });
    if (!listing) throw new NotFoundException('İlan bulunamadı veya bu vendor\'a ait değil');

    const pool = await this.prisma.$transaction(async (tx) => {
      const p = await tx.blindPool.create({
        data: {
          groupId:       data.groupId,
          name:          data.name,
          totalStock:    data.quantity,
          availableStock: data.quantity,
          smartCapPct:   SMART_CAP_PCT * 100, // %25
          isActive:      true,
        },
      });

      await tx.blindPoolEntry.create({
        data: {
          poolId:    p.id,
          vendorId:  data.vendorId,  // gizli — diğer bayiler göremez
          listingId: data.listingId,
          quantity:  data.quantity,
        },
      });

      return p;
    });

    this.logger.log('Blind Pool oluşturuldu', { poolId: pool.id, name: data.name });
    return pool.id;
  }

  // Havuzdan talep — Smart Cap kontrolü
  async requestFromPool(data: {
    poolId:    string;
    vendorId:  string;  // talep eden vendor
    quantity:  number;
  }): Promise<{ approved: boolean; maxAllowed: number; requestedQty: number }> {
    const pool = await this.prisma.blindPool.findUnique({
      where: { id: data.poolId },
      select: { id: true, totalStock: true, availableStock: true, smartCapPct: true, isActive: true },
    });
    if (!pool || !pool.isActive) throw new NotFoundException('Havuz bulunamadı veya aktif değil');

    const total     = Number(pool.totalStock);
    const available = Number(pool.availableStock);
    const capPct    = Number(pool.smartCapPct) / 100;
    const maxAllowed = Math.floor(total * capPct);

    // Smart Cap kontrolü
    const violated = await this.watchtower.checkSmartCap(data.poolId, data.vendorId, data.quantity);
    if (violated) {
      return { approved: false, maxAllowed, requestedQty: data.quantity };
    }

    if (data.quantity > available) {
      throw new BadRequestException(`Havuzda yeterli stok yok (mevcut: ${available})`);
    }

    // Kendi girişlerini göremez (kör havuz — vendor kimliği gizli)
    const ownEntry = await this.prisma.blindPoolEntry.findFirst({
      where: { poolId: data.poolId, vendorId: data.vendorId },
    });
    if (ownEntry) {
      throw new BadRequestException('Kendi havuzunuzdan talep edemezsiniz (Blind Pool kuralı)');
    }

    // Stoku rezerve et
    await this.prisma.blindPool.update({
      where: { id: data.poolId },
      data:  { availableStock: { decrement: data.quantity } },
    });

    return { approved: true, maxAllowed, requestedQty: data.quantity };
  }

  // Havuz görünümü — vendor kimliği gizli, sadece stok ve kategori görünür
  async getPoolView(poolId: string, requestingVendorId: string) {
    const pool = await this.prisma.blindPool.findUnique({
      where: { id: poolId },
      include: { entries: { include: { listing: { select: { title: true, price: true, catalogProductId: true } } } } },
    });
    if (!pool) throw new NotFoundException('Havuz bulunamadı');

    const total    = Number(pool.totalStock);
    const maxOrder = Math.floor(total * (Number(pool.smartCapPct) / 100));

    return {
      id:             pool.id,
      name:           pool.name,
      totalStock:     total,
      availableStock: Number(pool.availableStock),
      maxOrderQty:    maxOrder,  // Smart Cap limiti
      isActive:       pool.isActive,
      // Gizli: her giriş için vendor kimliği saklanır
      items: pool.entries.map((e) => ({
        listingTitle: e.listing?.title,
        quantity:     Number(e.quantity),
        isOwnEntry:   e.vendorId === requestingVendorId, // sadece kendi girdilerini bilir
      })),
    };
  }

  // Grup içi havuzları listele
  async listGroupPools(groupId: string) {
    const pools = await this.prisma.blindPool.findMany({
      where: { groupId, isActive: true },
      select: {
        id: true, name: true, totalStock: true, availableStock: true, smartCapPct: true,
      },
      orderBy: { availableStock: 'desc' },
    });

    return pools.map((p) => ({
      id:             p.id,
      name:           p.name,
      totalStock:     Number(p.totalStock),
      availableStock: Number(p.availableStock),
      utilizationPct: Math.round(((Number(p.totalStock) - Number(p.availableStock)) / Number(p.totalStock)) * 100),
      smartCapMaxQty: Math.floor(Number(p.totalStock) * (Number(p.smartCapPct) / 100)),
    }));
  }
}
