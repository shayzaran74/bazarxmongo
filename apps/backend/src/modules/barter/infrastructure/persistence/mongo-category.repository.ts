// apps/backend/src/modules/barter/infrastructure/persistence/mongo-category.repository.ts
// SurplusCategory repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ISurplusCategory } from '@barterborsa/shared-persistence';
import { SurplusCategory as SurplusCategoryModel } from '@barterborsa/shared-persistence/schemas/backend/surplusCategory.schema';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';

@Injectable()
export class MongoCategoryRepository implements ICategoryRepository {
  private readonly model: Model<ISurplusCategory>;

  constructor() {
    this.model = SurplusCategoryModel;
  }

  async findById(id: string): Promise<ISurplusCategory | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? doc.toObject() : null;
  }

  async findAll(): Promise<ISurplusCategory[]> {
    const docs = await this.model.find({}).exec();
    return docs.map(doc => doc.toObject());
  }

  async findRootCategories(): Promise<ISurplusCategory[]> {
    const docs = await this.model.find({ parentId: null }).exec();
    return docs.map(doc => doc.toObject());
  }

  async findWithChildren(parentId: string | null): Promise<ISurplusCategory[]> {
    const docs = await this.model.find({ parentId }).exec();
    return docs.map(doc => doc.toObject());
  }

  async create(data: {
    name: string;
    slug?: string;
    icon?: string;
    parentId?: string;
    order?: number;
    isActive?: boolean;
  }): Promise<any> {
    const id = 'cat-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const doc = await this.model.create({
      id,
      name: data.name,
      slug: data.slug ?? data.name.toLowerCase().replace(/ /g, '-'),
      icon: data.icon,
      parentId: data.parentId ?? null,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.toObject();
  }

  async update(id: string, data: Partial<{
    name: string;
    slug?: string;
    icon?: string;
    parentId?: string;
    order?: number;
    isActive?: boolean;
  }>): Promise<any> {
    const doc = await this.model.findOneAndUpdate(
      { id },
      { $set: { ...data, updatedAt: new Date() } },
      { new: true },
    ).exec();
    return doc ? doc.toObject() : null;
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }
}