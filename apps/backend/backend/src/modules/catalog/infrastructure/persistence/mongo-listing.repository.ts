// apps/backend/src/modules/catalog/infrastructure/persistence/mongo-listing.repository.ts
// Listing repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '@barterborsa/shared-persistence/mongodb/base-mongo.repository';
import { Listing as ListingModel, IListing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { ListingMapper, ListingDocument } from './mappers/listing.mapper';
import { IListingRepository } from '../../domain/repositories/listing.repository.interface';
import { Listing } from '../../domain/entities/listing.entity';
import { Slug } from '../../domain/value-objects/slug.vo';

@Injectable()
export class MongoListingRepository
  extends BaseMongoRepository<Listing, ListingDocument>
  implements IListingRepository
{
  constructor() {
    const model: Model<ListingDocument> = ListingModel;
    super(model, {
      toDomain: ListingMapper.toDomain,
      toPersistence: ListingMapper.toPersistence,
    });
  }

  async findBySlug(slug: Slug): Promise<Listing | null> {
    const doc = await this.model.findOne({ slug: slug.value }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findByVendorId(vendorId: string): Promise<Listing[]> {
    const docs = await this.model.find({ vendorId }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByCatalogProductId(catalogProductId: string): Promise<Listing[]> {
    const docs = await this.model.find({ catalogProductId }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async search(params: {
    vendorId?: string;
    catalogProductId?: string;
    categoryId?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    skip?: number;
    take?: number;
  }): Promise<{ items: Listing[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (params.vendorId) filter.vendorId = params.vendorId;
    if (params.catalogProductId) filter.catalogProductId = params.catalogProductId;
    if (params.categoryId) filter.categoryId = params.categoryId;
    if (params.status) filter.status = params.status;

    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip: params.skip ?? 0, limit: params.take ?? 20 }),
      this.model.countDocuments(filter),
    ]);

    return {
      items: docs.map(doc => this.mapper.toDomain(doc)),
      total,
    };
  }

  async update(id: string, data: Partial<{ stock: number; status: string }>): Promise<Listing | null> {
    const doc = await this.model.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true }
    ).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async create(data: {
    vendorId: string;
    catalogProductId: string;
    title: string;
    description?: string;
    price: number;
    stock: number;
    status: string;
    barcode?: string;
    sku?: string;
    slug?: string;
    categoryId?: string;
  }): Promise<Listing> {
    const id = 'listing-' + crypto.randomUUID();
    const doc = new this.model({
      _id: id,
      id,
      vendorId: data.vendorId,
      catalogProductId: data.catalogProductId,
      title: data.title,
      description: data.description ?? '',
      price: data.price,
      stock: data.stock,
      status: data.status,
      barcode: data.barcode,
      sku: data.sku,
      slug: data.slug ?? 'listing-' + id,
      categoryId: data.categoryId,
      images: [],
    });
    await doc.save();
    return this.mapper.toDomain(doc);
  }

  async findByBarcodeOrSku(vendorId: string, barcode?: string, sku?: string): Promise<Listing | null> {
    const filter: Record<string, unknown> = { vendorId };
    if (barcode || sku) {
      filter.$or = [
        ...(barcode ? [{ barcode }] : []),
        ...(sku ? [{ sku }] : []),
      ];
    }
    const doc = await this.model.findOne(filter).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findByIds(ids: string[]): Promise<Listing[]> {
    const docs = await this.model.find({ id: { $in: ids }, status: 'ACTIVE' }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async reserveStock(listingId: string, quantity: number): Promise<boolean> {
    const result = await this.model.updateOne(
      { id: listingId, stock: { $gte: quantity }, status: 'ACTIVE' },
      { $inc: { stock: -quantity, reservedQuantity: quantity }, $set: { updatedAt: new Date() } }
    ).exec();
    return result.modifiedCount > 0;
  }

  async releaseStock(listingId: string, quantity: number): Promise<void> {
    await this.model.updateOne(
      { id: listingId },
      { $inc: { stock: quantity, reservedQuantity: -quantity }, $set: { updatedAt: new Date() } }
    ).exec();
  }

  async updateListing(id: string, data: Partial<{ title?: string; description?: string; isAuctionEnabled?: boolean; isLotteryEnabled?: boolean }>): Promise<void> {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isAuctionEnabled !== undefined) updateData.isAuctionEnabled = data.isAuctionEnabled;
    if (data.isLotteryEnabled !== undefined) updateData.isLotteryEnabled = data.isLotteryEnabled;
    await this.model.updateOne({ id }, { $set: updateData }).exec();
  }

  async findByProductId(catalogProductId: string): Promise<Listing | null> {
    const doc = await this.model.findOne({ catalogProductId }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }
}