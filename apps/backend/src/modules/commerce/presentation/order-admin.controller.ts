// apps/backend/src/modules/commerce/presentation/order-admin.controller.ts
import { Controller, Get, Query, UseGuards, Param, Patch, Post, Body } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { CurrentUser } from '@barterborsa/shared-nest';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { ListAdminOrdersQuery } from '../application/queries/list-admin-orders.query';
import { GetAdminOrderQuery } from '../application/queries/get-admin-order.query';
import { ResolveOrderDisputeCommand } from '../application/commands/resolve-order-dispute.command';
import { UpdateOrderStatusCommand } from '../application/commands/update-order-status.command';
import { BulkUpdateOrderStatusCommand } from '../application/commands/bulk-update-order-status.command';
import { CancelOrderAdminCommand } from '../application/commands/cancel-order-admin.command';
import { ResolveOrderDisputeDto } from './dto/resolve-dispute.dto';
import { UpdateOrderStatusDto } from '../application/dtos/update-order-status.dto';
import { BulkUpdateOrderStatusDto } from '../application/dtos/bulk-update-order-status.dto';
import { CancelOrderAdminDto } from '../application/dtos/cancel-order-admin.dto';

interface AuthenticatedUser {
  id: string;
  role: string;
}

@ApiTags('Order Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/orders')
export class OrderAdminController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiOperation({ summary: 'Tüm siparişleri listele (Admin)' })
  @Get()
  async getOrders(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('vendorId') vendorId?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.queryBus.execute(
      new ListAdminOrdersQuery({
        status,
        vendorId,
        search,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      }),
    );
    return {
      success: true,
      data: {
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @ApiOperation({ summary: 'Toplu durum güncellemesi' })
  @Patch('bulk-status')
  async bulkUpdateStatus(
    @CurrentUser() admin: AuthenticatedUser,
    @Body() dto: BulkUpdateOrderStatusDto,
  ) {
    const data = await this.commandBus.execute(
      new BulkUpdateOrderStatusCommand(dto.orderIds, dto.status, admin.id),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Sipariş detayları (Admin)' })
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    const order = await this.queryBus.execute(new GetAdminOrderQuery(id));
    if (!order) {
      return { success: false, message: 'Sipariş bulunamadı' };
    }
    return { success: true, data: order };
  }

  @ApiOperation({ summary: 'Sipariş durumunu güncelle' })
  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const data = await this.commandBus.execute(
      new UpdateOrderStatusCommand(id, dto.status, admin.id, dto.reason),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Siparişi iptal et / reddet (soft delete)' })
  @Post(':id/cancel')
  async cancelOrder(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CancelOrderAdminDto,
  ) {
    const data = await this.commandBus.execute(
      new CancelOrderAdminCommand(id, admin.id, dto.reason, dto.refund ?? false),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'İtirazı (Dispute) sonuçlandır' })
  @Patch('dispute/:disputeId/resolve')
  async resolveDispute(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('disputeId') disputeId: string,
    @Body() dto: ResolveOrderDisputeDto,
  ) {
    return this.commandBus.execute(
      new ResolveOrderDisputeCommand(disputeId, admin.id, dto.resolution, dto.adminNote),
    );
  }
}
