import { Controller, Get, Put, Delete, Param, Body, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { ListAdminBrandsQuery } from '../application/queries/list-admin-brands/list-admin-brands.query';
import { Brand } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';

interface AuthenticatedUser {
  id: string;
  role: string;
}

@ApiTags('Brand Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/brands')
export class BrandAdminController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List all brands for admin' })
  @Get()
  async getBrands(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('q') search?: string
  ) {
    const result = await this.queryBus.execute(
      new ListAdminBrandsQuery({
        search,
        page: Number(page) || 1,
        limit: Number(limit) || 50
      })
    );
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Approve brand' })
  @Put(':id/approve')
  async approveBrand(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const brand = await Brand.findOneAndUpdate(
      { id },
      { status: 'APPROVED', approvedAt: new Date(), reviewedBy: user.id },
      { new: true }
    );
    if (!brand) throw new NotFoundException('Brand not found');
    return { success: true, data: brand };
  }

  @ApiOperation({ summary: 'Reject brand' })
  @Put(':id/reject')
  async rejectBrand(@Param('id') id: string, @Body('rejectionReason') reason: string, @CurrentUser() user: AuthenticatedUser) {
    const brand = await Brand.findOneAndUpdate(
      { id },
      { status: 'REJECTED', rejectedAt: new Date(), rejectionReason: reason, reviewedBy: user.id },
      { new: true }
    );
    if (!brand) throw new NotFoundException('Brand not found');
    return { success: true, data: brand };
  }

  @ApiOperation({ summary: 'Delete brand' })
  @Delete(':id')
  async deleteBrand(@Param('id') id: string) {
    const result = await Brand.deleteOne({ id });
    if (result.deletedCount === 0) throw new NotFoundException('Brand not found');
    return { success: true };
  }
}
