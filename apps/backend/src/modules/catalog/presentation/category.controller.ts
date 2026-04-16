import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';

@ApiTags('Listings')
@Controller('categories')
export class CategoryController {
  @Public()
  @ApiOperation({ summary: 'List all categories', description: 'Sistemdeki tüm ürün kategorilerini hiyerarşik veya liste olarak döner.' })
  @ApiResponse({ status: 200, description: 'Kategori listesi.' })
  @Get()
  async getCategories() {
    return this.getCategoryTree();
  }

  @Public()
  @ApiOperation({ summary: 'Get category tree', description: 'Kategorileri parent-child ilişkisiyle ağaç yapısında döner.' })
  @ApiResponse({ status: 200, description: 'Kategori ağacı.' })
  @Get('tree')
  async getCategoryTree() {
    return {
      success: true,
      data: [
        { id: '1', name: 'Elektronik', slug: 'elektronik', icon: 'heroicons:cpu-chip' },
        { id: '2', name: 'Ofis Malzemeleri', slug: 'ofis', icon: 'heroicons:briefcase' },
        { id: '3', name: 'Endüstriyel', slug: 'endustriyel', icon: 'heroicons:building-factory' }
      ]
    };
  }
}
