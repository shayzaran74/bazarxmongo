// apps/backend/src/modules/commerce/infrastructure/persistence/mongo-invoice.repository.ts
// Invoice repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Invoice as InvoiceModel, IInvoice } from '@barterborsa/shared-persistence/schemas/backend/invoice.schema';
import { InvoiceItem as InvoiceItemModel, IInvoiceItem } from '@barterborsa/shared-persistence/schemas/backend/invoiceItem.schema';
import { InvoiceMapper, InvoiceDocument } from './mappers/invoice.mapper';
import { IInvoiceRepository } from '../../domain/repositories/invoice.repository.interface';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceStatus } from '../../domain/entities/invoice.entity';

@Injectable()
export class MongoInvoiceRepository implements IInvoiceRepository {
  private readonly model: Model<InvoiceDocument>;
  private readonly itemModel: Model<IInvoiceItem>;

  constructor() {
    this.model = InvoiceModel;
    this.itemModel = InvoiceItemModel;
  }

  private toDomain(doc: InvoiceDocument): Invoice {
    return InvoiceMapper.toDomain(doc);
  }

  async findById(id: string): Promise<Invoice | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByOrderId(orderId: string): Promise<Invoice[]> {
    const docs = await this.model.find({ orderId }).exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async findByRecipientId(
    recipientId: string,
    pagination: { page?: number; limit?: number } = {}
  ): Promise<{ items: Invoice[]; total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.model.find({ recipientId }, {}, { skip, limit, sort: { issuedAt: -1 } }),
      this.model.countDocuments({ recipientId }),
    ]);

    return { items: docs.map(doc => this.toDomain(doc)), total };
  }

  async save(invoice: Invoice): Promise<void> {
    const props = invoice.getProps();
    const doc = InvoiceMapper.toPersistence(invoice);

    await this.model.findOneAndUpdate(
      { id: invoice.id },
      doc,
      { upsert: true, new: true }
    ).exec();

    await this.itemModel.deleteMany({ invoiceId: invoice.id }).exec();

    if (props.items.length > 0) {
      await this.itemModel.insertMany(props.items.map((item, idx) => ({
        id: `inv-item-${invoice.id}-${idx}`,
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        taxRate: item.taxRate,
      })));
    }
  }

  async findAll(): Promise<Invoice[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => this.toDomain(doc));
  }
}