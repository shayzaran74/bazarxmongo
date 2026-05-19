// packages/shared/shared-persistence/src/mongodb/inventory/inventory.repository.ts
// Inventory repository — MongoDB atomic stock management + inventory log
// ADR-005 §2: inventory module — StockReservation TTL, InventoryLog append-only

import { Injectable } from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { InventoryLog, IInventoryLog, InventoryLogType, InventoryLogTypeType } from '../../schemas/backend/inventoryLog.schema';
import { Stock, IStock } from '../../schemas/backend/stock.schema';
import { StockReservation, IStockReservation } from '../../schemas/backend/stockReservation.schema';
import { Types } from 'mongoose';

export interface ReserveStockInput {
  listingId: string;
  warehouseId?: string;
  quantity: number;
  orderId: string;
  ttlMinutes?: number;
}

export interface ReleaseStockInput {
  stockId: string;
  orderId: string;
  quantity: number;
}

@Injectable()
export class InventoryRepository {
  constructor(private readonly connection: Connection) {}

  // === Stock atomic operations ===

  /**
   * Atomic stock reserve — tek document update + inventory log
   * reservation TTL ile otomatik expire (StockReservation TTL index)
   */
  async reserveStock(input: ReserveStockInput): Promise<IStockReservation | null> {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(async () => {
        // Stock update — atomic
        const stockRes = await Stock.updateOne(
          {
            listingId: input.listingId,
            ...(input.warehouseId ? { warehouseId: input.warehouseId } : {}),
            quantity: { $gte: input.quantity },
          },
          {
            $inc: {
              quantity: -input.quantity,
              reservedQuantity: input.quantity,
            },
          },
          { session }
        );

        if (stockRes.modifiedCount === 0) return null;

        // Reservation document
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + (input.ttlMinutes ?? 15));

        const reservation = new StockReservation({
          id: new Types.ObjectId().toString(),
          stockId: input.listingId, // simplified — actual would query stock first
          orderId: input.orderId,
          quantity: input.quantity,
          expiresAt,
          isComplete: false,
          createdAt: new Date(),
        });

        await reservation.save({ session });

        // Inventory log
        await this.logInventoryChange(
          input.listingId,
          input.quantity,
          'RESERVE',
          `Order ${input.orderId}`,
          session
        );

        return reservation;
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Stock release — reservation complete veya order iptal
   */
  async releaseStock(input: ReleaseStockInput): Promise<boolean> {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(async () => {
        const stockRes = await Stock.updateOne(
          {
            stockId: input.stockId, // simplified
            reservedQuantity: { $gte: input.quantity },
          },
          {
            $inc: {
              quantity: input.quantity,
              reservedQuantity: -input.quantity,
            },
          },
          { session }
        );

        if (stockRes.modifiedCount === 0) return false;

        await StockReservation.updateOne(
          { orderId: input.orderId },
          { $set: { isComplete: true } },
          { session }
        );

        await this.logInventoryChange(
          input.stockId,
          input.quantity,
          'RELEASE',
          `Order ${input.orderId}`,
          session
        );

        return true;
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Commit stock — satış tamamlandı, reserved → stock düş
   */
  async commitStock(listingId: string, quantity: number, orderId: string): Promise<boolean> {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(async () => {
        const stockRes = await Stock.updateOne(
          { listingId, reservedQuantity: { $gte: quantity } },
          {
            $inc: {
              reservedQuantity: -quantity,
              // stock kalıyor çünkü zaten reserved'dan düşmüştü
            },
          },
          { session }
        );

        if (stockRes.modifiedCount === 0) return false;

        await StockReservation.updateOne(
          { orderId, isComplete: false },
          { $set: { isComplete: true } },
          { session }
        );

        await this.logInventoryChange(listingId, quantity, 'SALE', `Order ${orderId}`, session);
        return true;
      });
    } finally {
      await session.endSession();
    }
  }

  // === Inventory log helpers ===

  private async logInventoryChange(
    listingId: string,
    quantity: number,
    type: InventoryLogTypeType,
    reason: string,
    session?: any
  ): Promise<void> {
    const log = new InventoryLog({
      id: new Types.ObjectId().toString(),
      listingId,
      quantity,
      type,
      reason,
      createdAt: new Date(),
    });
    await log.save({ session });
  }

  // === Query methods ===

  async findLogByListing(listingId: string, limit = 100): Promise<IInventoryLog[]> {
    return InventoryLog.find({ listingId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async findLogByVendor(vendorId: string, limit = 200): Promise<IInventoryLog[]> {
    return InventoryLog.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async findLogByType(type: InventoryLogTypeType, limit = 200): Promise<IInventoryLog[]> {
    return InventoryLog.find({ type })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async findActiveReservations(orderId: string): Promise<IStockReservation[]> {
    return StockReservation.find({ orderId, isComplete: false }).lean();
  }

  async getStock(listingId: string, warehouseId?: string): Promise<IStock | null> {
    const query: Record<string, string> = { listingId };
    if (warehouseId) query.warehouseId = warehouseId;
    return Stock.findOne(query).lean();
  }
}