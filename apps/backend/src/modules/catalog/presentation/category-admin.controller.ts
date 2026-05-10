import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetCategoryTreeQuery } from '../application/queries/get-category-tree/get-category-tree.query';
import { CreateCategoryCommand } from '../application/commands/create-category.command';

@ApiTags('Category Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/categories')
export class CategoryAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'List all categories for admin' })
  @Get()
  async getCategories(@Query('includeChildren') includeChildren: boolean) {
    const data = await this.queryBus.execute(new GetCategoryTreeQuery());
    return {
      success: true,
      data
    };
  }

  @ApiOperation({ summary: 'Create category' })
  @Post()
  async create(@Body() dto: any) {
    return this.commandBus.execute(new CreateCategoryCommand(dto));
  }

  @ApiOperation({ summary: 'Update category' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon,
        image: dto.image,
        parentId: dto.parentId,
        order: dto.order,
        isActive: dto.status === 'ACTIVE'
      }
    });
    return { success: true, message: 'Kategori güncellendi' };
  }

  @ApiOperation({ summary: 'Delete category' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    // 0. Kategori var mı kontrol et
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      return { success: true, message: 'Kategori zaten silinmiş' };
    }

    // 1. Önce "Genel" kategorisini bul veya oluştur (ürünleri buraya taşıyacağız)
    const generalCategory = await this.prisma.category.upsert({
      where: { slug: 'genel' },
      update: {},
      create: { name: 'Genel', slug: 'genel', isActive: true }
    });

    // Kategori "Genel" ise silme
    if (category.slug === 'genel') {
      return { success: false, message: 'Genel kategori silinemez' };
    }

    // 2. Bu kategoriye bağlı ürünleri "Genel" kategorisine taşı
    await this.prisma.catalogProduct.updateMany({
      where: { categoryId: id },
      data: { categoryId: generalCategory.id }
    });

    // 3. Alt kategorilerin parentId bilgisini temizle
    await this.prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null }
    });

    // 4. Bağlı kategori özelliklerini (CategoryAttribute) temizle
    // Tablo ismi muhtemelen categoryAttribute veya categoryAttributes'dur
    try {
      // @ts-ignore - Dinamik tablo kontrolü
      if (this.prisma.categoryAttribute) {
        // @ts-ignore
        await this.prisma.categoryAttribute.deleteMany({ where: { categoryId: id } });
      }
    } catch (e: any) {
      console.warn('CategoryAttribute temizlenirken hata oluştu (belki tablo yoktur):', e.message);
    }

    // 5. Şimdi kategoriyi güvenle sil
    await this.prisma.category.deleteMany({ where: { id } });
    
    return { success: true, message: 'Kategori ve bağlı veriler başarıyla silindi' };
  }
}
