import { Controller, Get } from '@nestjs/common';
import { Public } from '@barterborsa/shared-security';

@Controller('categories')
export class CategoryController {
  @Public()
  @Get()
  async getCategories() {
    return this.getCategoryTree();
  }

  @Public()
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
