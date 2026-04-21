import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { ListAdminOrdersQuery }
  from '../application/queries/list-admin-orders.query';

@ApiTags('Order Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/orders')
export class OrderAdminController {
  constructor(private readonly queryBus: QueryBus) {}

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
}
