// apps/backend/src/modules/catalog/application/queries/list-admin-reviews/list-admin-reviews.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListAdminReviewsQuery } from './list-admin-reviews.query';
import { Review } from '@barterborsa/shared-persistence/schemas/backend/review.schema';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { User, UserProfile } from '@barterborsa/shared-persistence';
import { Order } from '@barterborsa/shared-persistence/schemas/backend/order.schema';

interface ReviewLeanDoc {
  id?: string; _id?: { toString(): string };
  userId: string; catalogProductId: string; orderId?: string;
  rating: number; comment?: string; isApproved: boolean; isVerified: boolean;
  createdAt: Date;
}
interface ProductLeanDoc   { id?: string; _id?: { toString(): string }; name: string; }
interface UserLeanDoc      { id?: string; _id?: { toString(): string }; email: string; }
interface ProfileLeanDoc   { userId: string; firstName?: string; lastName?: string; }
interface OrderLeanDoc     { id?: string; _id?: { toString(): string }; orderNumber?: string; }

@QueryHandler(ListAdminReviewsQuery)
export class ListAdminReviewsHandler implements IQueryHandler<ListAdminReviewsQuery> {
  async execute(query: ListAdminReviewsQuery) {
    const { page = 1, limit = 10, searchProduct, searchUser, isApproved } = query.filters;
    const dbFilter: Record<string, unknown> = {};

    if (isApproved !== undefined) {
      dbFilter.isApproved = isApproved;
    }

    if (searchProduct) {
      const matchingProducts = await CatalogProduct.find({
        name: { $regex: searchProduct, $options: 'i' }
      }).select('id').lean().exec();
      const productIds = (matchingProducts as ProductLeanDoc[]).map(p => p.id).filter(Boolean);
      dbFilter.catalogProductId = { $in: productIds };
    }

    if (searchUser) {
      const [matchingUsers, matchingProfiles] = await Promise.all([
        User.find({
          $or: [
            { email: { $regex: searchUser, $options: 'i' } },
            { id: { $regex: searchUser, $options: 'i' } }
          ]
        }).select('id email').lean().exec(),
        UserProfile.find({
          $or: [
            { firstName: { $regex: searchUser, $options: 'i' } },
            { lastName: { $regex: searchUser, $options: 'i' } }
          ]
        }).select('userId').lean().exec()
      ]);

      const userIds = new Set<string>();
      for (const u of matchingUsers) {
        if (u.id) userIds.add(u.id);
        if (u.email) userIds.add(u.email);
      }
      for (const p of matchingProfiles) {
        if (p.userId) userIds.add(p.userId);
      }
      dbFilter.userId = { $in: Array.from(userIds) };
    }

    const skip = (page - 1) * limit;

    const [rawItems, total] = await Promise.all([
      Review.find(dbFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      Review.countDocuments(dbFilter).exec(),
    ]);

    const reviews = rawItems as ReviewLeanDoc[];
    const productIds = reviews.map(i => i.catalogProductId).filter(Boolean);
    const userIds    = reviews.map(i => i.userId).filter(Boolean);
    const orderIds   = reviews.map(i => i.orderId).filter(Boolean);

    const [products, users, userProfiles, orders] = await Promise.all([
      CatalogProduct.find({ id: { $in: productIds } }).lean().exec(),
      User.find({ $or: [{ id: { $in: userIds } }, { email: { $in: userIds } }] }).lean().exec(),
      UserProfile.find({ userId: { $in: userIds } }).lean().exec(),
      Order.find({ id: { $in: orderIds } }).lean().exec(),
    ]);

    const productMap  = new Map((products as ProductLeanDoc[]).map(p => [p.id ?? p._id?.toString(), p]));
    const userMap     = new Map((users as UserLeanDoc[]).map(u => [u.id ?? u._id?.toString(), u]));
    const userEmailMap = new Map((users as UserLeanDoc[]).map(u => [u.email, u]));
    const profileMap  = new Map((userProfiles as ProfileLeanDoc[]).map(p => [p.userId, p]));
    const orderMap    = new Map((orders as OrderLeanDoc[]).map(o => [o.id ?? o._id?.toString(), o]));

    const items = reviews.map(r => {
      const p       = productMap.get(r.catalogProductId);
      const u       = userMap.get(r.userId) ?? userEmailMap.get(r.userId);
      const uProfile = u
        ? profileMap.get(u.id ?? '') ?? profileMap.get(u.email)
        : profileMap.get(r.userId);
      const o = r.orderId ? orderMap.get(r.orderId) : undefined;

      return {
        id:              r.id ?? r._id?.toString(),
        userId:          r.userId,
        catalogProductId: r.catalogProductId,
        orderId:         r.orderId,
        rating:          r.rating,
        comment:         r.comment,
        isApproved:      r.isApproved,
        isVerified:      r.isVerified,
        createdAt:       r.createdAt,
        CatalogProduct:  p ? { id: p.id, name: p.name } : null,
        User: u ? {
          id:    u.id ?? u._id?.toString(),
          email: u.email,
          name:  uProfile
            ? `${uProfile.firstName ?? ''} ${uProfile.lastName ?? ''}`.trim()
            : u.email,
        } : { email: r.userId, name: r.userId },
        Order: o ? { id: o.id, orderNumber: o.orderNumber } : null,
      };
    });

    return { items, total, page, limit };
  }
}
