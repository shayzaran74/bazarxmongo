// apps/backend/src/modules/content/infrastructure/persistence/content-misc.repositories.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import * as repo from '../../domain/repositories/announcement.repository.interface';
import { IPolicyRepository } from '../../domain/repositories/policy.repository.interface';
import { IDynamicContentRepository } from '../../domain/repositories/dynamic-content.repository.interface';
import { ISeoMetadataRepository } from '../../domain/repositories/seo-metadata.repository.interface';
import { Announcement } from '../../domain/entities/announcement.entity';
import { Policy } from '../../domain/entities/policy.entity';
import { DynamicContent } from '../../domain/entities/dynamic-content.entity';
import { SeoMetadata } from '../../domain/entities/seo-metadata.entity';

@Injectable()
export class PrismaAnnouncementRepository implements repo.IAnnouncementRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { 
    const r = await this.prisma.announcement.findUnique({ where: { id } });
    return r ? (Announcement as any).create(r, r.id) : null; 
  }
  async findAllActive() {
    const now = new Date();
    const rs = await this.prisma.announcement.findMany({
      where: { 
        isActive: true, 
        OR: [
          { startDate: null }, 
          { startDate: { lte: now } }
        ], 
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: now } }] }
        ]
      },
      orderBy: { priority: 'desc' }
    });
    return rs.map(r => (Announcement as any).create(r, r.id));
  }
  async save(e: Announcement) {
    const d = { ...e.getProps(), id: e.id.toString() };
    await this.prisma.announcement.upsert({ where: { id: e.id.toString() }, create: d, update: d });
  }
  async findAll() { return []; }
  async delete(id: string) { await this.prisma.announcement.delete({ where: { id } }); }
}

@Injectable()
export class PrismaPolicyRepository implements IPolicyRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) {
    const r = await this.prisma.policy.findUnique({ where: { id } });
    return r ? (Policy as any).create(r, r.id) : null;
  }
  async findBySlug(slug: string) {
    const r = await this.prisma.policy.findUnique({ where: { slug } });
    return r ? (Policy as any).create(r, r.id) : null;
  }
  async findAllActive() {
    const rs = await this.prisma.policy.findMany({ where: { isActive: true } });
    return rs.map(r => (Policy as any).create(r, r.id));
  }
  async save(e: Policy) {
    const d = { ...e.getProps(), id: e.id.toString() };
    await this.prisma.policy.upsert({ where: { id: e.id.toString() }, create: d, update: d });
  }
  async findAll() { return []; }
  async delete(id: string) { await this.prisma.policy.delete({ where: { id } }); }
}

@Injectable()
export class PrismaDynamicContentRepository implements IDynamicContentRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) {
    const r = await this.prisma.dynamicContent.findUnique({ where: { id } });
    return r ? (DynamicContent as any).create(r, r.id) : null;
  }
  async findByKey(key: string) {
    const r = await this.prisma.dynamicContent.findUnique({ where: { key } });
    return r ? (DynamicContent as any).create(r, r.id) : null;
  }
  async save(e: DynamicContent) {
    const d = { ...e.getProps(), id: e.id.toString() };
    await this.prisma.dynamicContent.upsert({ where: { id: e.id.toString() }, create: d, update: d });
  }
  async findAll() { return []; }
  async delete(id: string) { await this.prisma.dynamicContent.delete({ where: { id } }); }
}

@Injectable()
export class PrismaSeoMetadataRepository implements ISeoMetadataRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) {
    const r = await this.prisma.seoMetadata.findUnique({ where: { id } });
    return r ? (SeoMetadata as any).create(r, r.id) : null;
  }
  async findByPath(path: string, platform: string) {
    const r = await this.prisma.seoMetadata.findUnique({ where: { path } });
    return r ? (SeoMetadata as any).create(r, r.id) : null;
  }
  async save(e: SeoMetadata) {
    const d = { ...e.getProps(), id: e.id.toString(), platform: e.getProps().platform as any };
    await this.prisma.seoMetadata.upsert({ where: { id: e.id.toString() }, create: d, update: d });
  }
  async findAll() { return []; }
  async delete(id: string) { await this.prisma.seoMetadata.delete({ where: { id } }); }
}
