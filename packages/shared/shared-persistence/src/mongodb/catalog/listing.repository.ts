// packages/shared/shared-persistence/src/mongodb/catalog/listing.repository.ts
// Listing repository — MongoDB atomic stock management
// ADR-005 §3b: checkout.service transaction pattern
// Catalog module — Listing/Category/Brand/Image/PriceHistory/Stats/Analytic

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { Listing, IListing, ListingStatusType, ListingVisibilityType } from '../../schemas/backend/listing.schema';
import { ListingImage } from '../../schemas/backend/listingImage.schema';
import { ListingPriceHistory } from '../../schemas/backend/listingPriceHistory.schema';
import { ListingStats } from '../../schemas/backend/listingStats.schema';
import { Category } from '../../schemas/backend/category.schema';
import { Brand } from '../../schemas/backend/brand.schema';
import { Types } from 'mongoose';

export interface CreateListingInput {
  vendorId: string;
  title: string;
  price: Types.Decimal128;
  categoryId?: string;
  listingType?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  stock?: number;
  condition?: string;
}

export interface UpdateStockInput {
  listingId: string;
  quantity: number; // positive = reserve, negative = release
  reason?: string;
}

@Injectable()
export class ListingRepository {
  constructor(private readonly connection: Connection) {}

  private get model(): Model<IListing> {
    return Listing;
  }

  // === Stock atomic operations ===

  /**
   * Atomic stock reserve — PENDING order için
   * Tek listing için $inc + availableQuantity >= qty guard
   */
  async reserveStock(listingId: string, quantity: number): Promise<boolean> {
    const res = await this.model.updateOne(
      {
        _id: listingId,
        availableQuantity: { $gte: quantity },
        status: 'ACTIVE',
      },
      {
        $inc: {
          availableQuantity: -quantity,
          reservedQuantity: quantity,
        },
      }
    );
    return res.modifiedCount > 0;
  }

  /**
   * Atomic stock release — order iptal veya tamamlandı
   */
  async releaseStock(listingId: string, quantity: number): Promise<boolean> {
    const res = await this.model.updateOne(
      {
        _id: listingId,
        reservedQuantity: { $gte: quantity },
      },
      {
        $inc: {
          availableQuantity: quantity,
          reservedQuantity: -quantity,
        },
      }
    );
    return res.modifiedCount > 0;
  }

  /**
   * Stock düşümü (satıştamamlandığında — checkout flow'ta)
   * reserveStock -> releaseStock zinciri yerine tek seferde
   */
  async commitStock(listingId: string, quantity: number): Promise<boolean> {
    const res = await this.model.updateOne(
      {
        _id: listingId,
        reservedQuantity: { $gte: quantity },
      },
      {
        $inc: {
          stock: -quantity,
          reservedQuantity: -quantity,
        },
      }
    );
    return res.modifiedCount > 0;
  }

  // === Query methods ===

  async findById(id: string): Promise<IListing | null> {
    return this.model.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<IListing | null> {
    return this.model.findOne({ slug }).exec();
  }

  async findByVendor(vendorId: string, limit = 50): Promise<IListing[]> {
    return this.model
      .find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByCategory(categoryId: string, limit = 100): Promise<IListing[]> {
    return this.model
      .find({ categoryId, status: 'ACTIVE', isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findActive(limit = 100): Promise<IListing[]> {
    return this.model
      .find({ status: 'ACTIVE', isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByEcosystem(ecosystemId: string, limit = 100): Promise<IListing[]> {
    return this.model
      .find({ ecosystemId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async updateStatus(id: string, status: ListingStatusType): Promise<IListing | null> {
    return this.model.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          lastStatusChangedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).exec();
  }

  async create(input: CreateListingInput): Promise<IListing> {
    const doc = new this.model({
      id: new Types.ObjectId().toString(),
      vendorId: input.vendorId,
      title: input.title,
      price: input.price,
      categoryId: input.categoryId,
      listingType: input.listingType ?? 'SELL',
      description: input.description,
      sku: input.sku,
      barcode: input.barcode,
      stock: input.stock ?? 0,
      availableQuantity: input.stock ?? 0,
      reservedQuantity: 0,
      condition: input.condition ?? 'NEW',
      status: 'DRAFT',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  // === Image management ===
  async addImage(listingId: string, url: string, order = 0): Promise<void> {
    const image = new ListingImage({
      id: new Types.ObjectId().toString(),
      listingId,
      url,
      order,
      createdAt: new Date(),
    });
    await image.save();
  }

  async getImages(listingId: string): Promise<any[]> {
    return ListingImage.find({ listingId }).sort({ order: 1 }).lean();
  }

  // === Price history ===
  async addPriceHistory(listingId: string, price: Types.Decimal128): Promise<void> {
    const doc = new ListingPriceHistory({
      id: new Types.ObjectId().toString(),
      listingId,
      price,
      changedAt: new Date(),
    });
    await doc.save();
  }

  async getPriceHistory(listingId: string, limit = 30): Promise<any[]> {
    return ListingPriceHistory
      .find({ listingId })
      .sort({ changedAt: -1 })
      .limit(limit)
      .lean();
  }

  // === Stats ===
  async upsertStats(listingId: string, views = 0, sales = 0): Promise<void> {
    await ListingStats.findOneAndUpdate(
      { listingId },
      { $inc: { views, sales }, $set: { updatedAt: new Date() } },
      { upsert: true }
    );
  }

  async getStats(listingId: string): Promise<any | null> {
    return ListingStats.findOne({ listingId }).lean();
  }
}

@Injectable()
export class CategoryRepository {
  constructor(private readonly connection: Connection) {}

  async findById(id: string): Promise<any | null> {
    return Category.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<any | null> {
    return Category.findOne({ slug }).exec();
  }

  async findRootCategories(): Promise<any[]> {
    return Category.find({ parentId: null, isActive: true }).sort({ order: 1 }).exec();
  }

  async findByParent(parentId: string): Promise<any[]> {
    return Category.find({ parentId, isActive: true }).sort({ order: 1 }).exec();
  }

  async findActive(limit = 100): Promise<any[]> {
    return Category.find({ isActive: true }).sort({ order: 1 }).limit(limit).exec();
  }
}

@Injectable()
export class BrandRepository {
  constructor(private readonly connection: Connection) {}

  async findById(id: string): Promise<any | null> {
    return Brand.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<any | null> {
    return Brand.findOne({ slug }).exec();
  }

  async findByVendor(vendorId: string): Promise<any[]> {
    return Brand.find({ vendorId }).sort({ order: 1 }).exec();
  }

  async findPopular(limit = 20): Promise<any[]> {
    return Brand.find({ isPopular: true }).sort({ popularityScore: -1 }).limit(limit).exec();
  }

  async findOfficial(): Promise<any[]> {
    return Brand.find({ isOfficial: true }).sort({ order: 1 }).exec();
  }
}