import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { GetBrandsQuery } from '../application/queries/get-brands/get-brands.query';

@ApiTags('Catalog')
@Controller('brands')
export class BrandController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @ApiOperation({ summary: 'List brands' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 12 })
  @ApiResponse({ status: 200 })
  @Get()
  async getBrands(@Query('limit') limit: string = '12') {
    const data = await this.queryBus.execute(
      new GetBrandsQuery(parseInt(limit) || 12)
    );
    return { success: true, data };
  }
}
