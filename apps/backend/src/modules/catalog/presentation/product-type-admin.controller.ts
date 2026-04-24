import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';

@ApiTags('Product Type Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/product-types')
export class ProductTypeAdminController {
  @ApiOperation({ summary: 'Get all product types' })
  @Get()
  async getProductTypes() {
    return {
      success: true,
      data: [
        { id: 'STANDARD', name: 'Standart Ürün' },
        { id: 'VARIABLE', name: 'Varyantlı Ürün' },
        { id: 'VIRTUAL', name: 'Sanal Ürün' }
      ]
    };
  }
}
