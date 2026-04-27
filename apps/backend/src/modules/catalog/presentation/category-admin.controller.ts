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
    await this.prisma.category.delete({ where: { id } });
    return { success: true, message: 'Kategori silindi' };
  }
}
