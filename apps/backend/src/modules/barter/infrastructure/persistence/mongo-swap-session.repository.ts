// apps/backend/src/modules/barter/infrastructure/persistence/mongo-swap-session.repository.ts
// SwapSession repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '@barterborsa/shared-persistence/mongodb/base-mongo.repository';
import { SwapSession as SwapSessionModel, ISwapSession } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';
import { BarterPart as BarterPartModel } from '@barterborsa/shared-persistence/schemas/backend/barterPart.schema';
import { TradeOffer as TradeOfferModel } from '@barterborsa/shared-persistence/schemas/backend/tradeOffer.schema';
import { TradeOfferItem as TradeOfferItemModel } from '@barterborsa/shared-persistence/schemas/backend/tradeOfferItem.schema';
import { SurplusItem as SurplusItemModel } from '@barterborsa/shared-persistence/schemas/backend/surplusItem.schema';
import { Company as CompanyModel } from '@barterborsa/shared-persistence/schemas/backend/company.schema';
import { SwapSessionMapper, SwapSessionDocument } from './mappers/swap-session.mapper';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { SwapSession } from '../../domain/entities/swap-session.entity';

@Injectable()
export class MongoSwapSessionRepository
  extends BaseMongoRepository<SwapSession, SwapSessionDocument>
  implements ISwapSessionRepository
{
  constructor() {
    const model: Model<SwapSessionDocument> = SwapSessionModel;
    super(model, {
      toDomain: SwapSessionMapper.prototype.toDomain.bind(SwapSessionMapper.prototype),
      toPersistence: SwapSessionMapper.prototype.toPersistence.bind(SwapSessionMapper.prototype),
    });
  }

  async findByTradeOfferId(tradeOfferId: string): Promise<SwapSession | null> {
    const doc = await this.model.findOne({ tradeOfferId }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findByInitiatorId(initiatorId: string): Promise<SwapSession[]> {
    const docs = await this.model.find({ initiatorId }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByReceiverId(receiverId: string): Promise<SwapSession[]> {
    const docs = await this.model.find({ receiverId }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findActive(): Promise<SwapSession[]> {
    const docs = await this.model.find({ status: { $in: ['PENDING', 'ACTIVE', 'SHIPPING'] } }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByCompanyWithFilters(companyId: string, skip: number, take: number): Promise<{ items: SwapSession[]; total: number }> {
    const filter = { $or: [{ initiatorId: companyId }, { receiverId: companyId }] };
    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip, limit: take }).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments(filter),
    ]);
    return { items: docs.map(doc => this.mapper.toDomain(doc)), total };
  }

  async findByIdWithRelations(id: string): Promise<any | null> {
    const doc = await this.model.findOne({ id }).exec();
    if (!doc) return null;
    
    let parts = await BarterPartModel.find({ swapSessionId: id }).lean().exec();
    
    // Backward compatibility for older swap sessions that lack parts in the DB
    if (!parts || parts.length === 0) {
      parts = [
        {
          id: `${id}-part-1`,
          swapSessionId: id,
          partNumber: 1,
          senderId: doc.initiatorId,
          recipientId: doc.receiverId,
          status: 'PENDING',
        },
        {
          id: `${id}-part-2`,
          swapSessionId: id,
          partNumber: 2,
          senderId: doc.receiverId,
          recipientId: doc.initiatorId,
          status: 'PENDING',
        },
      ] as any;
    }
    
    const tradeOfferRaw = await TradeOfferModel.findOne({ id: doc.tradeOfferId }).lean().exec() as Record<string, unknown> | null;

    // Offered / Requested item'ları zenginleştir
    let offeredItems: Record<string, unknown>[] = [];
    let requestedItems: Record<string, unknown>[] = [];
    if (tradeOfferRaw) {
      const offeredDocs = await TradeOfferItemModel.find({ offeredOfferId: tradeOfferRaw.id }).lean().exec();
      const requestedDocs = await TradeOfferItemModel.find({ requestedOfferId: tradeOfferRaw.id }).lean().exec();

      const surplusIds = [
        ...offeredDocs.map(d => d.surplusItemId),
        ...requestedDocs.map(d => d.surplusItemId),
        tradeOfferRaw.offeredItemId,
        tradeOfferRaw.requestedItemId,
      ].filter(Boolean) as string[];

      const surplusDocs = surplusIds.length > 0
        ? await SurplusItemModel.find({ id: { $in: surplusIds } }).select('id title images unitPrice unit quantity').lean().exec()
        : [];
      const surplusMap = new Map(surplusDocs.map(s => [(s as unknown as { id: string }).id, s]));

      const enrichItem = (item: Record<string, unknown>) => {
        const surplus = surplusMap.get(item.surplusItemId as string);
        if (surplus) {
          return { ...item, title: (surplus as Record<string, unknown>).title, images: (surplus as Record<string, unknown>).images, unit: (surplus as Record<string, unknown>).unit };
        }
        return item;
      };

      offeredItems = offeredDocs.map(d => enrichItem(d as unknown as Record<string, unknown>));
      requestedItems = requestedDocs.map(d => enrichItem(d as unknown as Record<string, unknown>));

      // Tekil offeredItemId / requestedItemId fallback
      if (offeredItems.length === 0 && tradeOfferRaw.offeredItemId) {
        const s = surplusMap.get(tradeOfferRaw.offeredItemId as string);
        if (s) offeredItems = [{ surplusItemId: tradeOfferRaw.offeredItemId, ...(s as Record<string, unknown>) }];
      }
      if (requestedItems.length === 0 && tradeOfferRaw.requestedItemId) {
        const s = surplusMap.get(tradeOfferRaw.requestedItemId as string);
        if (s) requestedItems = [{ surplusItemId: tradeOfferRaw.requestedItemId, ...(s as Record<string, unknown>) }];
      }
    }

    // Company bilgileri
    const [fromCompany, toCompany] = await Promise.all([
      CompanyModel.findOne({ id: doc.initiatorId }).select('id name logoUrl').lean().exec(),
      CompanyModel.findOne({ id: doc.receiverId }).select('id name logoUrl').lean().exec(),
    ]);

    // CompanyId → userId çözümlemesi
    let initiatorUserId: string | undefined;
    let receiverUserId: string | undefined;
    const { Vendor } = await import('@barterborsa/shared-persistence/schemas/backend/vendor.schema');
    const [initiatorVendor, receiverVendor] = await Promise.all([
      Vendor.findOne({ companyId: doc.initiatorId }).select('userId').lean().exec(),
      Vendor.findOne({ companyId: doc.receiverId }).select('userId').lean().exec(),
    ]);
    if (initiatorVendor) initiatorUserId = (initiatorVendor as { userId?: string }).userId;
    if (receiverVendor) receiverUserId = (receiverVendor as { userId?: string }).userId;

    const tradeOffer = tradeOfferRaw
      ? {
          ...tradeOfferRaw,
          fromCompanyId: doc.initiatorId,
          toCompanyId: doc.receiverId,
          fromCompany: fromCompany ?? { id: doc.initiatorId, name: '—' },
          toCompany: toCompany ?? { id: doc.receiverId, name: '—' },
          offeredItems,
          requestedItems,
        }
      : null;

    return { ...doc.toObject(), parts, tradeOffer, initiatorUserId, receiverUserId };
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.model.updateOne({ id }, { $set: { status, updatedAt: new Date() } }).exec();
  }

  async findByStatusAndDeadlineBefore(
    status: string,
    deadline: Date,
    limit: number,
  ): Promise<SwapSession[]> {
    const docs = await this.model
      .find({
        status,
        timeoutAt: { $lte: deadline },
      })
      .limit(limit)
      .exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByStatusAndPendingReleaseBefore(deadline: Date, limit: number): Promise<SwapSession[]> {
    const docs = await this.model
      .find({
        status: 'PENDING_RELEASE',
        pendingReleaseAt: { $lte: deadline },
      })
      .limit(limit)
      .exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }
}