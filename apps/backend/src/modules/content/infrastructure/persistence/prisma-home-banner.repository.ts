// apps/backend/src/modules/content/infrastructure/persistence/prisma-home-banner.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IHomeBannerRepository } from '../../domain/repositories/home-banner.repository.interface';
import { HomeBanner } from '../../domain/entities/home-banner.entity';
import { HomeBannerMapper } from './mappers/home-banner.mapper';

@Injectable()
export class PrismaHomeBannerRepository implements IHomeBannerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<HomeBanner | null> {
    const raw = await this.prisma.homeBanner.findUnique({ where: { id } });
    return raw ? HomeBannerMapper.toDomain(raw) : null;
  }

  async findAll(): Promise<HomeBanner[]> {
    const raws = await this.prisma.homeBanner.findMany();
    return raws.map(HomeBannerMapper.toDomain);
  }

  async save(entity: HomeBanner): Promise<void> {
    const data = HomeBannerMapper.toPersistence(entity);
    await this.prisma.homeBanner.upsert({
      where: { id: entity.id.toString() },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.homeBanner.delete({ where: { id } });
  }

  async findAllActive(platform: string): Promise<HomeBanner[]> {
    const now = new Date();
    const raws = await this.prisma.homeBanner.findMany({
      where: {
        platform: platform as any,
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { order: 'asc' },
    });
    return raws.map(HomeBannerMapper.toDomain);
  }
}
