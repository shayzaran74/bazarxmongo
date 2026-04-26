import { Controller, Get, Query, UseGuards,
         Delete, Param, Post, Body, Put } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { ListAdminProductsQuery }
  from '../application/queries/list-admin-products/list-admin-products.query';
import { DeleteAdminProductCommand }
  from '../application/commands/delete-admin-product.command';
import { BulkDeleteAdminProductsCommand } from '../application/commands/bulk-delete-admin-products.command';
import { BulkUpdateAdminProductsCommand } from '../application/commands/bulk-update-admin-products.command';
import { UpdateAdminProductCommand } from '../application/commands/update-admin-product.command';
import { CreateAdminProductCommand } from '../application/commands/create-admin-product.command';
import { CurrentUser } from '@barterborsa/shared-nest';

@ApiTags('Product Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/products')
export class ProductAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Get product statistics' })
  @Get('stats')
  async getStats() {
    const [total, active, pending] = await Promise.all([
      this.prisma.catalogProduct.count(),
      this.prisma.listing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.listing.count({ where: { status: 'PENDING' } })
    ]);

    return {
      success: true,
      data: { total, active, pending }
    };
  }

  @ApiOperation({ summary: 'Create a product' })
  @Post()
  async createProduct(@Body() data: any, @CurrentUser() user: any) {
    try {
      return await this.commandBus.execute(
        new CreateAdminProductCommand(data, user.id)
      );
    } catch (error: any) {
      return {
        success: false,
        error: 'Ekleme sırasında hata: ' + error.message
      };
    }
  }

  @ApiOperation({ summary: 'List all products for admin' })
  @Get()
  async getProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('q') search?: string,
    @Query('status') status?: string
  ) {
    const result = await this.queryBus.execute(
      new ListAdminProductsQuery({
        search,
        status,
        page: Number(page) || 1,
        limit: Number(limit) || 50
      })
    );
    return {
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    };
  }

  @ApiOperation({ summary: 'Delete a product' })
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    try {
      return await this.commandBus.execute(
        new DeleteAdminProductCommand(id)
      );
    } catch (error: any) {
      return {
        success: false,
        error: 'Ürün silinirken hata oluştu. Sipariş geçmişine sahip olabilir, pasife alın.'
      };
    }
  }

  @ApiOperation({ summary: 'Bulk delete products' })
  @Post('bulk-delete')
  async bulkDelete(@Body('ids') ids: string[]) {
    try {
      return await this.commandBus.execute(
        new BulkDeleteAdminProductsCommand(ids)
      );
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @ApiOperation({ summary: 'Bulk update products' })
  @Put('bulk-update')
  async bulkUpdate(@Body() body: { ids: string[]; updates: any }) {
    try {
      return await this.commandBus.execute(
        new BulkUpdateAdminProductsCommand(body.ids, body.updates)
      );
    } catch (error: any) {
      return {
        success: false,
        error: 'Toplu güncelleme sırasında hata: ' + error.message
      };
    }
  }

  @ApiOperation({ summary: 'Update a product' })
  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.commandBus.execute(
        new UpdateAdminProductCommand(id, data)
      );
    } catch (error: any) {
      return {
        success: false,
        error: 'Güncelleme sırasında hata: ' + error.message
      };
    }
  }
}
