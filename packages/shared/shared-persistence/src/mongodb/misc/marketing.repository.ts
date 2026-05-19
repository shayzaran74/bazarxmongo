// packages/shared/shared-persistence/src/mongodb/misc/marketing.repository.ts
// Invoice/AdCampaign/Announcement/Chat/DynamicContent/Help/Coupon/Banner/Review/Return repositories
// ADR-005 §2b: tax, menu, advertising, communication, content, media

import { Injectable } from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { Types } from 'mongoose';

import {
  Invoice, IInvoice, InvoiceStatusType,
} from '../../schemas/backend/invoice.schema';
import {
  InvoiceItem, IInvoiceItem,
} from '../../schemas/backend/invoiceItem.schema';
import {
  AdCampaign, IAdCampaign, AdCampaignStatusType,
} from '../../schemas/backend/adCampaign.schema';
import {
  Announcement, IAnnouncement, AnnouncementTypeType,
} from '../../schemas/backend/announcement.schema';
import {
  ChatMessage, IChatMessage,
} from '../../schemas/backend/chatMessage.schema';
import {
  DynamicContent, IDynamicContent,
} from '../../schemas/backend/dynamicContent.schema';
import {
  HelpArticle, IHelpArticle, HelpArticleStatusType,
} from '../../schemas/backend/helpArticle.schema';
import {
  HelpCategory, IHelpCategory,
} from '../../schemas/backend/helpCategory.schema';
import {
  Coupon, ICoupon,
} from '../../schemas/backend/coupon.schema';
import {
  HomeBanner, IHomeBanner,
} from '../../schemas/backend/homeBanner.schema';
import {
  Review, IReview,
} from '../../schemas/backend/review.schema';
import {
  OrderReturn, IOrderReturn, ReturnStatusType,
} from '../../schemas/backend/orderReturn.schema';
import {
  ProductMedia, IProductMedia, MediaTypeType,
} from '../../schemas/backend/productMedia.schema';

@Injectable()
export class InvoiceRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    invoiceNumber: string;
    orderId: string;
    recipientId: string;
    subtotal: Types.Decimal128;
    taxAmount: Types.Decimal128;
    totalAmount: Types.Decimal128;
    currency?: string;
    issuedAt: Date;
    dueAt?: Date;
    notes?: string;
  }): Promise<IInvoice> {
    const doc = new Invoice({
      id: new Types.ObjectId().toString(),
      status: 'DRAFT',
      currency: input.currency ?? 'TRY',
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByOrder(orderId: string): Promise<IInvoice[]> {
    return Invoice.find({ orderId }).lean();
  }

  async findByRecipient(recipientId: string): Promise<IInvoice[]> {
    return Invoice.find({ recipientId }).sort({ issuedAt: -1 }).lean();
  }

  async updateStatus(id: string, status: InvoiceStatusType): Promise<boolean> {
    const res = await Invoice.updateOne(
      { _id: id },
      { $set: { status, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class InvoiceItemRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    invoiceId: string;
    description: string;
    quantity: number;
    unitPrice: Types.Decimal128;
    totalPrice: Types.Decimal128;
    taxRate: Types.Decimal128;
  }): Promise<IInvoiceItem> {
    const doc = new InvoiceItem({
      id: new Types.ObjectId().toString(),
      ...input,
    });
    await doc.save();
    return doc;
  }

  async findByInvoice(invoiceId: string): Promise<IInvoiceItem[]> {
    return InvoiceItem.find({ invoiceId }).lean();
  }
}

@Injectable()
export class AdCampaignRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    name: string;
    vendorId?: string;
    creatorId?: string;
    budget: Types.Decimal128;
    bidAmount: Types.Decimal128;
    startDate: Date;
    endDate: Date;
    adType: string;
    platform?: string;
  }): Promise<IAdCampaign> {
    const doc = new AdCampaign({
      id: new Types.ObjectId().toString(),
      remainingBudget: input.budget,
      adStatus: 'PENDING',
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByVendor(vendorId: string): Promise<IAdCampaign[]> {
    return AdCampaign.find({ vendorId }).sort({ createdAt: -1 }).lean();
  }

  async findActive(): Promise<IAdCampaign[]> {
    return AdCampaign.find({ adStatus: 'ACTIVE' }).lean();
  }

  async updateStatus(id: string, status: AdCampaignStatusType): Promise<boolean> {
    const res = await AdCampaign.updateOne(
      { _id: id },
      { $set: { adStatus: status, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async decrementBudget(id: string, amount: Types.Decimal128): Promise<boolean> {
    const res = await AdCampaign.updateOne(
      { _id: id, remainingBudget: { $gte: amount } },
      { $inc: { remainingBudget: -parseFloat(amount.toString()) }, $set: { updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class AnnouncementRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    title: string;
    content: string;
    type: AnnouncementTypeType;
    priority?: number;
    startDate: Date;
    endDate?: Date;
    imageUrl?: string;
    linkText?: string;
    linkUrl?: string;
    targetPage?: string;
  }): Promise<IAnnouncement> {
    const doc = new Announcement({
      id: new Types.ObjectId().toString(),
      isActive: true,
      priority: input.priority ?? 0,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findActive(): Promise<IAnnouncement[]> {
    const now = new Date();
    return Announcement.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    }).sort({ priority: -1, createdAt: -1 }).lean();
  }
}

@Injectable()
export class ChatMessageRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    roomId: string;
    senderId?: string;
    content: string;
  }): Promise<IChatMessage> {
    const doc = new ChatMessage({
      id: new Types.ObjectId().toString(),
      isRead: false,
      ...input,
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByRoom(roomId: string, limit = 100): Promise<IChatMessage[]> {
    return ChatMessage.find({ roomId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async markAsRead(id: string, readById: string): Promise<boolean> {
    const res = await ChatMessage.updateOne(
      { _id: id },
      { $set: { isRead: true, readAt: new Date(), readById, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async markRoomRead(roomId: string, readById: string): Promise<number> {
    const res = await ChatMessage.updateMany(
      { roomId, isRead: false },
      { $set: { isRead: true, readAt: new Date(), readById, updatedAt: new Date() } }
    );
    return res.modifiedCount;
  }
}

@Injectable()
export class DynamicContentRepository {
  constructor(private readonly connection: Connection) {}

  async getByKey(key: string): Promise<IDynamicContent | null> {
    return DynamicContent.findOne({ key, isActive: true }).lean();
  }

  async upsert(input: {
    key: string;
    title: string;
    content: string;
    contentType: string;
    category?: string;
  }): Promise<IDynamicContent> {
    const existing = await DynamicContent.findOne({ key: input.key });
    if (existing) {
      await DynamicContent.updateOne(
        { _id: existing._id },
        { $set: { title: input.title, content: input.content, contentType: input.contentType, category: input.category, updatedAt: new Date() } }
      );
      const updated = await DynamicContent.findOne({ key: input.key });
      return updated!;
    }
    const doc = new DynamicContent({
      id: new Types.ObjectId().toString(),
      isActive: true,
      key: input.key,
      title: input.title,
      content: input.content,
      contentType: input.contentType,
      category: input.category,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }
}

@Injectable()
export class HelpArticleRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    categoryId?: string;
    language?: string;
    order?: number;
  }): Promise<IHelpArticle> {
    const doc = new HelpArticle({
      id: new Types.ObjectId().toString(),
      upvotes: 0,
      downvotes: 0,
      viewCount: 0,
      status: 'DRAFT',
      isActive: true,
      isPopular: false,
      language: input.language ?? 'tr',
      order: input.order ?? 0,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findBySlug(slug: string): Promise<IHelpArticle | null> {
    return HelpArticle.findOne({ slug, isActive: true }).lean();
  }

  async findByCategory(categoryId: string, limit = 50): Promise<IHelpArticle[]> {
    return HelpArticle.find({ categoryId, status: 'PUBLISHED', isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async incrementViews(id: string): Promise<boolean> {
    const res = await HelpArticle.updateOne(
      { _id: id },
      { $inc: { viewCount: 1 }, $set: { updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async updateStatus(id: string, status: HelpArticleStatusType): Promise<boolean> {
    const res = await HelpArticle.updateOne(
      { _id: id },
      { $set: { status, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class HelpCategoryRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    order?: number;
    language?: string;
    parentId?: string;
  }): Promise<IHelpCategory> {
    const doc = new HelpCategory({
      id: new Types.ObjectId().toString(),
      language: input.language ?? 'tr',
      order: input.order ?? 0,
      isActive: true,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findAll(): Promise<IHelpCategory[]> {
    return HelpCategory.find({ isActive: true }).sort({ order: 1 }).lean();
  }

  async findBySlug(slug: string): Promise<IHelpCategory | null> {
    return HelpCategory.findOne({ slug, isActive: true }).lean();
  }
}

@Injectable()
export class CouponRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    code: string;
    discountAmount?: number;
    discountPercentage?: number;
    minOrderAmount?: number;
    expiresAt?: Date;
  }): Promise<ICoupon> {
    const doc = new Coupon({
      id: new Types.ObjectId().toString(),
      isActive: true,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByCode(code: string): Promise<ICoupon | null> {
    return Coupon.findOne({ code, isActive: true }).lean();
  }

  async deactivate(id: string): Promise<boolean> {
    const res = await Coupon.updateOne(
      { _id: id },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class HomeBannerRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    title: string;
    image: string;
    description?: string;
    subtitle?: string;
    tag?: string;
    link?: string;
    buttonText?: string;
    order?: number;
    startDate?: Date;
    endDate?: Date;
    platform?: string;
  }): Promise<IHomeBanner> {
    const doc = new HomeBanner({
      id: new Types.ObjectId().toString(),
      isActive: true,
      order: input.order ?? 0,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findActive(platform?: string): Promise<IHomeBanner[]> {
    const query: Record<string, unknown> = { isActive: true };
    if (platform) query.platform = platform;
    return HomeBanner.find(query).sort({ order: 1 }).lean();
  }
}

@Injectable()
export class ReviewRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    userId: string;
    catalogProductId: string;
    orderId?: string;
    rating: number;
    comment?: string;
  }): Promise<IReview> {
    const doc = new Review({
      id: new Types.ObjectId().toString(),
      isApproved: false,
      isVerified: false,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByProduct(catalogProductId: string, limit = 50): Promise<IReview[]> {
    return Review.find({ catalogProductId, isApproved: true }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async findByUser(userId: string): Promise<IReview[]> {
    return Review.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async approve(id: string): Promise<boolean> {
    const res = await Review.updateOne(
      { _id: id },
      { $set: { isApproved: true, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async averageRating(catalogProductId: string): Promise<number> {
    const result = await Review.aggregate([
      { $match: { catalogProductId, isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    return result[0]?.avg ?? 0;
  }
}

@Injectable()
export class OrderReturnRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    orderId: string;
    reason: string;
    refundAmount: Types.Decimal128;
    receiptUrl?: string;
  }): Promise<IOrderReturn> {
    const doc = new OrderReturn({
      id: new Types.ObjectId().toString(),
      status: 'PENDING',
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByOrder(orderId: string): Promise<IOrderReturn[]> {
    return OrderReturn.find({ orderId }).lean();
  }

  async updateStatus(id: string, status: ReturnStatusType): Promise<boolean> {
    const res = await OrderReturn.updateOne(
      { _id: id },
      { $set: { status, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class ProductMediaRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    productId: string;
    url: string;
    type?: MediaTypeType;
    blurhash?: string;
    sortOrder?: number;
  }): Promise<IProductMedia> {
    const doc = new ProductMedia({
      id: new Types.ObjectId().toString(),
      type: input.type ?? 'IMAGE',
      sortOrder: input.sortOrder ?? 0,
      ...input,
    });
    await doc.save();
    return doc;
  }

  async findByProduct(productId: string): Promise<IProductMedia[]> {
    return ProductMedia.find({ productId }).sort({ sortOrder: 1 }).lean();
  }

  async delete(id: string): Promise<boolean> {
    const res = await ProductMedia.deleteOne({ _id: id });
    return res.deletedCount > 0;
  }
}