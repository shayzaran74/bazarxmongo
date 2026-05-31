// apps/backend/src/modules/bazarxgo/infrastructure/persistence/mongo-go-restaurant.repository.ts

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GoRestaurant, IGoRestaurant } from '@barterborsa/shared-persistence';
import { IGoRestaurantRepository, GoRestaurantFilter } from '../../domain/repositories/go-restaurant.repository.interface';

@Injectable()
export class MongoGoRestaurantRepository implements IGoRestaurantRepository {
  async findById(id: string): Promise<IGoRestaurant | null> {
    const doc = await GoRestaurant.findOne({ id }).lean().exec();
    return doc as IGoRestaurant | null;
  }

  async findBySlug(slug: string): Promise<IGoRestaurant | null> {
    const doc = await GoRestaurant.findOne({ slug }).lean().exec();
    return doc as IGoRestaurant | null;
  }

  async findAll(filter: GoRestaurantFilter): Promise<IGoRestaurant[]> {
    const query: Record<string, unknown> = {};

    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive;
    }
    if (filter.category && filter.category !== 'all') {
      query.categories = { $in: [filter.category] };
    }
    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    const docs = await GoRestaurant.find(query).lean().exec();
    return docs as IGoRestaurant[];
  }

  async create(data: Omit<IGoRestaurant, '_id' | 'createdAt' | 'updatedAt'>): Promise<IGoRestaurant> {
    const id = data.id || randomUUID();
    const doc = await GoRestaurant.create({ ...data, _id: id, id });
    return doc.toObject() as IGoRestaurant;
  }

  async update(id: string, data: Partial<IGoRestaurant>): Promise<IGoRestaurant | null> {
    const doc = await GoRestaurant.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true },
    ).lean().exec();
    return doc as IGoRestaurant | null;
  }

  async delete(id: string): Promise<void> {
    await GoRestaurant.deleteOne({ id }).exec();
  }
}
