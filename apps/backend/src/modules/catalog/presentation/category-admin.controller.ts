import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { GetCategoryTreeQuery } from '../application/queries/get-category-tree/get-category-tree.query';
import { CreateCategoryCommand } from '../application/commands/create-category.command';

@ApiTags('Category Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/categories')
export class CategoryAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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
    // Update logic here (can be added to CommandBus)
    return { success: true, message: 'Kategori güncellendi' };
  }

  @ApiOperation({ summary: 'Delete category' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    // Delete logic here
    return { success: true, message: 'Kategori silindi' };
  }
}
