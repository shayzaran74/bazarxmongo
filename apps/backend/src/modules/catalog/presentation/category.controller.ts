import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CreateCategoryDto } from '../application/dtos/create-category.dto';
import { CreateCategoryCommand } from '../application/commands/create-category.command';
import { GetCategoryTreeQuery } from '../application/queries/get-category-tree/get-category-tree.query';

@ApiTags('Listings')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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
    const data = await this.queryBus.execute(new GetCategoryTreeQuery());
    return {
      success: true,
      data
    };
  }

  @Public()
  @ApiOperation({ summary: 'Get mega menu categories', description: 'Mega menu için optimize edilmiş kategori ağacını döner.' })
  @ApiResponse({ status: 200, description: 'Mega menu kategorileri.' })
  @Get('mega-menu')
  async getMegaMenu() {
    return this.getCategoryTree();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (Admin)', description: 'Yeni bir ürün kategorisi oluşturur.' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Kategori oluşturuldu.' })
  @ApiResponse({ status: 403, description: 'Sadece admin yetkisiyle erişilebilir.' })
  @Post()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateCategoryDto) {
    return this.commandBus.execute(new CreateCategoryCommand(dto));
  }
}
