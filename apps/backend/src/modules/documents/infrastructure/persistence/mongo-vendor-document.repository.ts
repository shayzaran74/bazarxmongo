// apps/backend/src/modules/documents/infrastructure/persistence/mongo-vendor-document.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IVendorDocumentRepository } from '../../domain/repositories/vendor-document.repository.interface';
import { VendorDocument } from '../../domain/entities/vendor-document.entity';
import { IVendorDocument } from './schemas/vendor-document.schema';

@Injectable()
export class MongoVendorDocumentRepository implements IVendorDocumentRepository {
  constructor(
    @InjectModel('VendorDocument')
    private readonly model: Model<IVendorDocument>,
  ) {}

  async findById(id: string): Promise<VendorDocument | null> {
    const doc = await this.model.findOne({ id }).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByVendorId(vendorId: string): Promise<VendorDocument[]> {
    const docs = await this.model.find({ vendorId }).lean();
    return docs.map(doc => this.toEntity(doc));
  }

  async save(document: VendorDocument): Promise<void> {
    const data = {
      id: document.id,
      vendorId: document.vendorId,
      documentType: document.documentType,
      fileKey: document.fileKey,
      fileName: document.fileName,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      uploadedAt: document.uploadedAt,
      uploadedBy: document.uploadedBy,
    };
    await this.model.findOneAndUpdate(
      { id: document.id },
      { $set: data },
      { upsert: true, new: true },
    );
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id });
  }

  private toEntity(doc: any): VendorDocument {
    return new VendorDocument(
      doc.id,
      doc.vendorId,
      doc.documentType,
      doc.fileKey,
      doc.fileName,
      doc.fileSize,
      doc.mimeType,
      doc.uploadedAt,
      doc.uploadedBy,
    );
  }
}
