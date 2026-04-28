// apps/backend/src/modules/commerce/presentation/order.controller.ts
import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Get my orders' })
  @ApiResponse({ status: 200 })
  @Get()
  async getMyOrders(@CurrentUser() user: any) {
    const orders = await this.prisma.order.findMany({
      where: { userId: user.id },
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: orders };
  }

  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  @Get(':id')
  async getOrder(@CurrentUser() user: any, @Param('id') id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId: user.id },
      include: { orderItems: true },
    });

    if (!order) throw new NotFoundException('Sipariş bulunamadı.');

    return { success: true, data: order };
  }
}
