import { Controller, Get, Post, Body, Param, UseGuards, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { PurchaseOrder } from '@barterborsa/shared-persistence/schemas/backend/purchaseOrder.schema';
import { PurchaseOrderItem } from '@barterborsa/shared-persistence/schemas/backend/purchaseOrderItem.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { InventoryLog } from '@barterborsa/shared-persistence/schemas/backend/inventoryLog.schema';

@ApiTags('Vendor Purchase Orders')
@ApiBearerAuth()
@Controller('vendors/purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
export class PurchaseOrderController {
  @ApiOperation({ summary: 'Get vendor purchase orders' })
  @Get()
  async getPurchaseOrders(@CurrentUser() user: AuthenticatedUser) {
    const vendor = await Vendor.findOne({ userId: user.id }).select('id').exec();
    if (!vendor) return { success: false, message: 'Vendor not found' };

    const orders = await PurchaseOrder.find({ vendorId: vendor.id })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: orders };
  }

  @ApiOperation({ summary: 'Get purchase order details' })
  @Get(':id')
  async getPurchaseOrderDetails(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const vendor = await Vendor.findOne({ userId: user.id }).select('id').exec();

    const order = await PurchaseOrder.findOne({ id, vendorId: vendor?.id })
      .populate('items')
      .lean();

    if (!order) return { success: false, message: 'Order not found' };

    return { success: true, data: order };
  }

  @ApiOperation({ summary: 'Create purchase order' })
  @Post()
  async createPurchaseOrder(@Body() body: Record<string, any>, @CurrentUser() user: AuthenticatedUser) {
    const vendor = await Vendor.findOne({ userId: user.id }).select('id').exec();
    if (!vendor) return { success: false, message: 'Vendor not found' };

    const { supplierName, items } = body;

    const orderId = 'po-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0);

    const order = await PurchaseOrder.create({
      id: orderId,
      vendorId: vendor.id,
      supplierName,
      status: 'Draft',
      totalAmount,
    });

    for (const item of items) {
      const itemId = 'poi-' + Date.now() + '-' + Math.random().toString(36).substring(7);
      await PurchaseOrderItem.create({
        id: itemId,
        purchaseOrderId: orderId,
        listingId: item.listingId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    return { success: true, data: order };
  }

  @ApiOperation({ summary: 'Receive purchase order (Update Stock)' })
  @Patch(':id/receive')
  async receiveOrder(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const vendor = await Vendor.findOne({ userId: user.id }).select('id').exec();

    const order = await PurchaseOrder.findOne({ id, vendorId: vendor?.id })
      .populate('items')
      .lean();

    if (!order) return { success: false, message: 'Order not found' };
    if (order.status === 'Received') return { success: false, message: 'Order already received' };

    for (const item of (order as any).items || []) {
      await Listing.updateOne(
        { id: item.listingId },
        { $inc: { stock: item.quantity } }
      ).exec();

      try {
        await InventoryLog.create({
          id: 'ilog-' + Date.now() + '-' + Math.random().toString(36).substring(7),
          productId: item.listingId,
          vendorId: vendor?.id,
          change: item.quantity,
          reason: 'PURCHASE_ORDER',
          referenceId: order.id,
        });
      } catch { /* log error */ }
    }

    const updatedOrder = await PurchaseOrder.findOneAndUpdate(
      { id },
      { $set: { status: 'Received', receivedAt: new Date() } },
      { new: true }
    ).exec();

    return { success: true, data: updatedOrder };
  }
}

export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }
