import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { ListAdminBrandsQuery }
  from '../application/queries/list-admin-brands/list-admin-brands.query';

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
}
