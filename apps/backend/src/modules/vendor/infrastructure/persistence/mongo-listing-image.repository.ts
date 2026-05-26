// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-listing-image.repository.ts
// ListingImage repository — Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ListingImage as ListingImageModel, IListingImage } from '@barterborsa/shared-persistence/schemas/backend/listingImage.schema';

export interface ListingImageDocument extends IListingImage {
  _id?: string;
}

@Injectable()
export class MongoListingImageRepository {
  private readonly model: Model<ListingImageDocument>;

  constructor(@InjectModel('ListingImage') model: Model<ListingImageDocument>) {
    this.model = model;
  }

  async create(data: { listingId: string; url: string; order: number }): Promise<ListingImageDocument> {
    const id = 'li-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const doc = new this.model({ _id: id, id, listingId: data.listingId, url: data.url, order: data.order });
    await doc.save();
    return doc;
  }

  async deleteByListingId(listingId: string): Promise<void> {
    await this.model.deleteMany({ listingId }).exec();
  }

  async findByListingId(listingId: string): Promise<ListingImageDocument[]> {
    return this.model.find({ listingId }).sort({ order: 1 }).exec();
  }
}