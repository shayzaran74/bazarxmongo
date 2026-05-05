import { Controller, Get, Query, UseGuards, Param, Patch, Body } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { CurrentUser } from '@barterborsa/shared-nest';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { ListAdminOrdersQuery }
  from '../application/queries/list-admin-orders.query';
import { GetAdminOrderQuery }
  from '../application/queries/get-admin-order.query';
import { ResolveOrderDisputeCommand } from '../application/commands/resolve-order-dispute.command';
import { ResolveOrderDisputeDto } from './dto/resolve-dispute.dto';

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

  @ApiOperation({ summary: 'List all orders for admin' })
  @Get()
  async getOrders(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
    @Query('vendorId') vendorId?: string
  ) {
    const result = await this.queryBus.execute(
      new ListAdminOrdersQuery({
        status,
        vendorId,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20
      })
    );
    return {
      success: true,
      data: {
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit
      }
    };
  }

  @ApiOperation({ summary: 'Get order details for admin' })
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    const order = await this.queryBus.execute(
      new GetAdminOrderQuery(id)
    );
    
    if (!order) {
      return {
        success: false,
        message: 'Order not found'
      };
    }

    return {
      success: true,
      data: order
    };
  }

  @ApiOperation({ summary: 'İtirazı (Dispute) sonuçlandır' })
  @Patch('dispute/:disputeId/resolve')
  async resolveDispute(
    @CurrentUser() admin: any,
    @Param('disputeId') disputeId: string,
    @Body() dto: ResolveOrderDisputeDto,
  ) {
    return this.commandBus.execute(
      new ResolveOrderDisputeCommand(disputeId, admin.id, dto.resolution, dto.adminNote),
    );
  }
}
