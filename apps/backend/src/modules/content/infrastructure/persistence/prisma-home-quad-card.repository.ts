// apps/backend/src/modules/content/infrastructure/persistence/prisma-home-quad-card.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IHomeQuadCardRepository } from '../../domain/repositories/home-quad-card.repository.interface';
import { HomeQuadCard } from '../../domain/entities/home-quad-card.entity';
import { HomeQuadCardItem } from '../../domain/entities/home-quad-card-item.entity';

@Injectable()
export class PrismaHomeQuadCardRepository implements IHomeQuadCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<HomeQuadCard | null> {
    const raw = await this.prisma.homeQuadCard.findUnique({ 
      where: { id },
      include: { items: true }
    });
    if (!raw) return null;
    
    const card = (HomeQuadCard as any).create(raw, raw.id);
    card.getProps().items = raw.items.map((item: any) => (HomeQuadCardItem as any).create(item, item.id));
    return card;
  }

  async findAllActive(platform: string): Promise<HomeQuadCard[]> {
    const raws = await this.prisma.homeQuadCard.findMany({
      where: {}, // Tüm filtreleri kaldırıyoruz ki verinin geldiğinden emin olalım
      include: { items: true },
      orderBy: { order: 'asc' }
    });
    
    return raws.map((raw: any) => {
      const card = (HomeQuadCard as any).create(raw, raw.id);
      card.getProps().items = raw.items.map((item: any) => (HomeQuadCardItem as any).create(item, item.id));
      return card;
    });
  }

  async save(entity: HomeQuadCard): Promise<void> {
    const data = entity.getProps();
    const { items, ...cardData } = data;

    await this.prisma.$transaction(async (tx) => {
      await tx.homeQuadCard.upsert({
        where: { id: entity.id.toString() },
        create: { ...cardData, id: entity.id.toString(), platform: cardData.platform as any },
        update: { ...cardData, platform: cardData.platform as any },
      });

      if (items) {
        // Simple sync strategy: delete and re-create items for the card
        await tx.homeQuadCardItem.deleteMany({ where: { quadCardId: entity.id.toString() } });
        await tx.homeQuadCardItem.createMany({
          data: items.map(item => ({
            ...item.getProps(),
            id: item.id.toString(),
            quadCardId: entity.id.toString(),
          }))
        });
      }
    });
  }

  async findAll(): Promise<HomeQuadCard[]> { return []; }
  async delete(id: string): Promise<void> { await this.prisma.homeQuadCard.delete({ where: { id } }); }
}
