import { Controller, Get, Post, Body, Param, UseGuards, Query, Patch } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';

@ApiTags('Vendor Purchase Orders')
@ApiBearerAuth()
@Controller('vendors/purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
export class PurchaseOrderController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Get vendor purchase orders' })
  @Get()
  async getPurchaseOrders(@CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) return { success: false, message: 'Vendor not found' };

    const orders = await this.prisma.purchaseOrder.findMany({
      where: { vendorId: vendor.id },
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: orders };
  }

  @ApiOperation({ summary: 'Get purchase order details' })
  @Get(':id')
  async getPurchaseOrderDetails(@Param('id') id: string, @CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id, vendorId: vendor?.id },
      include: {
        items: {
          include: {
            listing: {
              include: {
                catalogProduct: {
                  include: {
                    media: { take: 1 }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order) return { success: false, message: 'Order not found' };

    return { success: true, data: order };
  }

  @ApiOperation({ summary: 'Create purchase order' })
  @Post()
  async createPurchaseOrder(@Body() body: any, @CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) return { success: false, message: 'Vendor not found' };

    const { supplierName, items } = body;

    const order = await this.prisma.purchaseOrder.create({
      data: {
        vendorId: vendor.id,
        supplierName,
        status: 'Draft',
        totalAmount: items.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0),
        items: {
          create: items.map((item: any) => ({
            listingId: item.listingId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      },
      include: { items: true }
    });

    return { success: true, data: order };
  }

  @ApiOperation({ summary: 'Receive purchase order (Update Stock)' })
  @Patch(':id/receive')
  async receiveOrder(@Param('id') id: string, @CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id, vendorId: vendor?.id },
      include: { items: true }
    });

    if (!order) return { success: false, message: 'Order not found' };
    if (order.status === 'Received') return { success: false, message: 'Order already received' };

    return await this.prisma.$transaction(async (tx) => {
      // Update each item's stock
      for (const item of order.items) {
        await tx.listing.update({
          where: { id: item.listingId },
          data: {
            stock: { increment: item.quantity }
          }
        });

        // Log stock movement
        try {
          await (tx as any).inventoryLog.create({
            data: {
              productId: item.listingId,
              vendorId: vendor?.id,
              change: item.quantity,
              reason: 'PURCHASE_ORDER',
              referenceId: order.id,
              createdAt: new Date()
            }
          });
        } catch (e) {}
      }

      const updatedOrder = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: 'Received',
          receivedAt: new Date()
        }
      });

      return { success: true, data: updatedOrder };
    });
  }
}
