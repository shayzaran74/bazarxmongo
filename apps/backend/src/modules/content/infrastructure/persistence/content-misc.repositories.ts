// apps/backend/src/modules/content/infrastructure/persistence/content-misc.repositories.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as repo from '../../domain/repositories/announcement.repository.interface';
import { IPolicyRepository } from '../../domain/repositories/policy.repository.interface';
import { IDynamicContentRepository } from '../../domain/repositories/dynamic-content.repository.interface';
import { ISeoMetadataRepository } from '../../domain/repositories/seo-metadata.repository.interface';
import { Announcement } from '../../domain/entities/announcement.entity';
import { Policy } from '../../domain/entities/policy.entity';
import { DynamicContent } from '../../domain/entities/dynamic-content.entity';
import { SeoMetadata } from '../../domain/entities/seo-metadata.entity';
import {
  IAnnouncement, IPolicy, IDynamicContent, ISeoMetadata,
} from '@barterborsa/shared-persistence';

type EntityFactory<T> = { create: (data: unknown, id: string) => T };

@Injectable()
export class PrismaAnnouncementRepository implements repo.IAnnouncementRepository {
  constructor(
    @InjectModel('Announcement') private readonly model: Model<IAnnouncement>,
  ) {}

  async findById(id: string) {
    const r = await this.model.findOne({ id }).lean();
    return r ? (Announcement as unknown as EntityFactory<Announcement>).create(r, r.id) : null;
  }

  async findAllActive() {
    const now = new Date();
    const rs  = await this.model
      .find({ isActive: true, startDate: { $lte: now }, $or: [{ endDate: null }, { endDate: { $gte: now } }] })
      .sort({ priority: -1 })
      .lean();
    return rs.map(r => (Announcement as unknown as EntityFactory<Announcement>).create(r, r.id));
  }

  async save(e: Announcement) {
    const d = { ...e.getProps(), id: e.id.toString() };
    await this.model.findOneAndUpdate(
      { id: e.id.toString() },
      { $set: d, $setOnInsert: { _id: new Types.ObjectId().toString() } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async findAll() { return []; }
  async delete(id: string) { await this.model.deleteOne({ id }); }
}

@Injectable()
export class PrismaPolicyRepository implements IPolicyRepository {
  constructor(
    @InjectModel('Policy') private readonly model: Model<IPolicy>,
  ) {}

  async findById(id: string) {
    const r = await this.model.findOne({ id }).lean();
    return r ? (Policy as unknown as EntityFactory<Policy>).create(r, r.id) : null;
  }

  async findBySlug(slug: string) {
    const r = await this.model.findOne({ slug }).lean();
    return r ? (Policy as unknown as EntityFactory<Policy>).create(r, r.id) : null;
  }

  async findAllActive() {
    const rs = await this.model.find({ isActive: true }).lean();
    return rs.map(r => (Policy as unknown as EntityFactory<Policy>).create(r, r.id));
  }

  async save(e: Policy) {
    const d = { ...e.getProps(), id: e.id.toString() };
    await this.model.findOneAndUpdate(
      { id: e.id.toString() },
      { $set: d, $setOnInsert: { _id: new Types.ObjectId().toString() } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async findAll() { return []; }
  async delete(id: string) { await this.model.deleteOne({ id }); }
}

@Injectable()
export class PrismaDynamicContentRepository implements IDynamicContentRepository {
  constructor(
    @InjectModel('DynamicContent') private readonly model: Model<IDynamicContent>,
  ) {}

  async findById(id: string) {
    const r = await this.model.findOne({ id }).lean();
    return r ? (DynamicContent as unknown as EntityFactory<DynamicContent>).create(r, r.id) : null;
  }

  async findByKey(key: string) {
    const r = await this.model.findOne({ key }).lean();
    return r ? (DynamicContent as unknown as EntityFactory<DynamicContent>).create(r, r.id) : null;
  }

  async save(e: DynamicContent) {
    const d = { ...e.getProps(), id: e.id.toString() };
    await this.model.findOneAndUpdate(
      { id: e.id.toString() },
      { $set: d, $setOnInsert: { _id: new Types.ObjectId().toString() } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async findAll() { return []; }
  async delete(id: string) { await this.model.deleteOne({ id }); }
}

@Injectable()
export class PrismaSeoMetadataRepository implements ISeoMetadataRepository {
  constructor(
    @InjectModel('SeoMetadata') private readonly model: Model<ISeoMetadata>,
  ) {}

  async findById(id: string) {
    const r = await this.model.findOne({ id }).lean();
    return r ? (SeoMetadata as unknown as EntityFactory<SeoMetadata>).create(r, r.id) : null;
  }

  async findByPath(path: string, _platform: string) {
    const r = await this.model.findOne({ path }).lean();
    return r ? (SeoMetadata as unknown as EntityFactory<SeoMetadata>).create(r, r.id) : null;
  }

  async save(e: SeoMetadata) {
    const d = { ...e.getProps(), id: e.id.toString() };
    await this.model.findOneAndUpdate(
      { id: e.id.toString() },
      { $set: d, $setOnInsert: { _id: new Types.ObjectId().toString() } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async findAll() { return []; }
  async delete(id: string) { await this.model.deleteOne({ id }); }
}
