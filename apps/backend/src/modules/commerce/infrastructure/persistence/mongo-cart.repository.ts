// apps/backend/src/modules/commerce/infrastructure/persistence/mongo-cart.repository.ts
// Cart repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { BaseMongoRepository } from '@barterborsa/shared-persistence/mongodb/base-mongo.repository';
import { Cart as CartModel, ICart } from '@barterborsa/shared-persistence/schemas/backend/cart.schema';
import { CartItem as CartItemModel, ICartItem } from '@barterborsa/shared-persistence/schemas/backend/cartItem.schema';
import { CartMapper, CartDocument } from './mappers/cart.mapper';
import { ICartRepository } from '../../domain/repositories/cart.repository.interface';
import { Cart } from '../../domain/entities/cart.entity';
import { CartItem } from '../../domain/entities/cart-item.entity';

@Injectable()
export class MongoCartRepository implements ICartRepository {
  private readonly cartModel: Model<CartDocument>;
  private readonly cartItemModel: Model<ICartItem>;

  constructor() {
    this.cartModel = CartModel;
    this.cartItemModel = CartItemModel;
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) return null;

    const itemDocs = await this.cartItemModel.find({ cartId: cart.id }).exec();
    const items = itemDocs.map(doc =>
      CartItem.fromPersistence(
        {
          cartId: doc.cartId,
          listingId: doc.listingId,
          quantity: doc.quantity,
          variantId: doc.variantId || undefined,
          addedAt: doc.addedAt,
        },
        doc.id
      )
    );

    return Cart.fromPersistence({ userId: cart.userId, items }, cart.id);
  }

  async save(cart: Cart): Promise<void> {
    const props = cart.getProps();
    await this.cartModel.findOneAndUpdate(
      { userId: props.userId },
      { id: cart.id, userId: props.userId },
      { upsert: true, new: true }
    ).exec();

    await this.cartItemModel.deleteMany({ cartId: cart.id }).exec();

    if (props.items.length > 0) {
      await this.cartItemModel.insertMany(props.items.map(item => ({
        _id: new Types.ObjectId().toString(),
        id: item.id,
        cartId: cart.id,
        listingId: item.getProps().listingId,
        quantity: item.getProps().quantity,
        variantId: item.getProps().variantId,
        addedAt: new Date(),
      })));
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (cart) {
      await this.cartItemModel.deleteMany({ cartId: cart.id }).exec();
      await this.cartModel.deleteOne({ userId }).exec();
    }
  }

  async removeItem(itemId: string): Promise<void> {
    await this.cartItemModel.deleteOne({ id: itemId }).exec();
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await this.cartItemModel.updateOne({ id: itemId }, { $set: { quantity } }).exec();
  }

  async findOrCreate(userId: string): Promise<Cart> {
    let cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) {
      const id = 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(7);
      const doc = new this.cartModel({ 
        _id: new (require('mongoose')).Types.ObjectId().toString(),
        id, 
        userId, 
        items: [] 
      });
      await doc.save();
      cart = doc;
    }
    const itemDocs = await this.cartItemModel.find({ cartId: cart.id }).exec();
    const items = itemDocs.map(doc =>
      CartItem.fromPersistence(
        {
          cartId: doc.cartId,
          listingId: doc.listingId,
          quantity: doc.quantity,
          variantId: doc.variantId || undefined,
          addedAt: doc.addedAt,
        },
        doc.id
      )
    );
    return Cart.fromPersistence({ userId: cart.userId, items }, cart.id);
  }

  async addItem(cartId: string, listingId: string, quantity: number, variantId?: string): Promise<void> {
    const id = 'ci-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    await this.cartItemModel.create({
      _id: new Types.ObjectId().toString(),
      id,
      cartId,
      listingId,
      quantity,
      variantId,
      addedAt: new Date(),
    });
  }

  async clearItems(userId: string): Promise<void> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (cart) {
      await this.cartItemModel.deleteMany({ cartId: cart.id }).exec();
    }
  }
}