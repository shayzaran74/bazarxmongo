// apps/backend/src/modules/catalog/presentation/category-admin.controller.ts

import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { ICategory, ICatalogProduct, ICategoryAttribute } from '@barterborsa/shared-persistence';
import { GetCategoryTreeQuery }  from '../application/queries/get-category-tree/get-category-tree.query';
import { CreateCategoryCommand } from '../application/commands/create-category.command';

@ApiTags('Category Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/categories')
export class CategoryAdminController {
  constructor(
    private readonly commandBus:   CommandBus,
    private readonly queryBus:     QueryBus,
    @InjectModel('Category')          private readonly categoryModel:  Model<ICategory>,
    @InjectModel('CatalogProduct')    private readonly productModel:   Model<ICatalogProduct>,
    @InjectModel('CategoryAttribute') private readonly attrModel:      Model<ICategoryAttribute>,
  ) {}

  @Get()
  async getCategories() {
    const data = await this.queryBus.execute(new GetCategoryTreeQuery());
    return { success: true, data };
  }

  @Post()
  create(@Body() dto: Record<string, unknown>) {
    return this.commandBus.execute(new CreateCategoryCommand(dto as any));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    await this.categoryModel.updateOne(
      { id },
      { $set: {
        name:        dto.name,
        slug:        dto.slug,
        description: dto.description,
        icon:        dto.icon,
        image:       dto.image,
        parentId:    dto.parentId,
        order:       dto.order,
        isActive:    dto.status === 'ACTIVE',
      }},
    );
    return { success: true, message: 'Kategori güncellendi' };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const category = await this.categoryModel.findOne({ id }).lean();
    if (!category) return { success: true, message: 'Kategori zaten silinmiş' };

    // Genel kategorisini bul veya oluştur
    let generalCategory = await this.categoryModel.findOne({ slug: 'genel' }).lean();
    if (!generalCategory) {
      const newId = new Types.ObjectId().toString();
      await this.categoryModel.create([{ _id: newId, id: newId, name: 'Genel', slug: 'genel', isActive: true }]);
      generalCategory = await this.categoryModel.findOne({ slug: 'genel' }).lean();
    }

    if ((category as Record<string, unknown>).slug === 'genel') {
      return { success: false, message: 'Genel kategori silinemez' };
    }

    await Promise.all([
      this.productModel.updateMany({ categoryId: id }, { $set: { categoryId: generalCategory!.id } }),
      this.categoryModel.updateMany({ parentId: id }, { $set: { parentId: null } }),
      this.attrModel.deleteMany({ categoryId: id }),
    ]);

    await this.categoryModel.deleteOne({ id });
    return { success: true, message: 'Kategori ve bağlı veriler başarıyla silindi' };
  }
}
