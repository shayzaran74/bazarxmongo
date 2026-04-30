import { Controller, Get, Post, Body, Param,
         Query, UseGuards, Put, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { ListAdminVendorsQuery } from '../application/queries/list-admin-vendors.query';
import { ApproveVendorCommand } from '../application/commands/approve-vendor.command';
import { RejectVendorCommand } from '../application/commands/reject-vendor.command';
import { UpdateAdminVendorCommand } from '../application/commands/update-admin-vendor.command';
import { AddVendorCategoryCommand } from '../application/commands/add-vendor-category.command';
import { RemoveVendorCategoryCommand } from '../application/commands/remove-vendor-category.command';

interface AuthenticatedUser {
  id: string;
  role: string;
}

interface UpdateVendorDto {
  isFeatured?: boolean;
  isB2B?: boolean;
  tier?: string;
  commissionRate?: number;
  [key: string]: unknown;
}

@ApiTags('Vendor Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/vendors')
export class VendorAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'List all vendors for admin' })
  @Get()
  async getVendors(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('q') search?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.queryBus.execute(
      new ListAdminVendorsQuery({
        search,
        status,
        page:  parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      }),
    );
    return {
      success: true,
      data: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @ApiOperation({ summary: 'Approve vendor' })
  @Put(':id/approve')
  async approveVendor(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    const data = await this.commandBus.execute(new ApproveVendorCommand(id, admin.id));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Reject vendor' })
  @Put(':id/reject')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { rejectionReason: { type: 'string' } },
    },
  })
  async rejectVendor(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    const data = await this.commandBus.execute(
      new RejectVendorCommand(id, rejectionReason ?? '', admin.id),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Update vendor (Featured, B2B, etc)' })
  @Put(':id')
  async updateVendor(
    @Param('id') id: string,
    @Body() body: UpdateVendorDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    const data = await this.commandBus.execute(
      new UpdateAdminVendorCommand(id, body),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Add category to vendor' })
  @Post(':id/categories')
  async addCategory(
    @Param('id') id: string,
    @Body('categoryId') categoryId: string,
  ) {
    const data = await this.commandBus.execute(new AddVendorCategoryCommand(id, categoryId));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Remove category from vendor' })
  @Delete(':id/categories/:categoryId')
  async removeCategory(
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.commandBus.execute(new RemoveVendorCategoryCommand(id, categoryId));
  }
}
