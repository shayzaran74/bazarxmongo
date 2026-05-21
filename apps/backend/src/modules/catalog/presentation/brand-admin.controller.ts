import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { ListAdminBrandsQuery } from '../application/queries/list-admin-brands/list-admin-brands.query';
import { Brand } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
}

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
    @Query('q') search?: string,
    @Query('status') status?: string,
    @Query('letter') letter?: string
  ) {
    const result = await this.queryBus.execute(
      new ListAdminBrandsQuery({
        search,
        status,
        letter,
        page: Number(page) || 1,
        limit: Number(limit) || 50
      })
    );
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Create brand' })
  @Post()
  async createBrand(@Body() data: any) {
    const mongoose = require('mongoose');
    const id = new mongoose.Types.ObjectId().toString();
    const brand = await Brand.create({ ...data, id, _id: id });
    return { success: true, data: brand };
  }

  @ApiOperation({ summary: 'Approve brand' })
  @Put(':id/approve')
  async approveBrand(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const mongoose = require('mongoose');
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: new mongoose.Types.ObjectId(id) }, { _id: id }] }
      : { id };

    const result = await Brand.collection.findOneAndUpdate(
      filter,
      { $set: { id, status: 'APPROVED', approvedAt: new Date(), reviewedBy: user.id } },
      { returnDocument: 'after' }
    );
    if (!result) throw new NotFoundException('Brand not found');
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Reject brand' })
  @Put(':id/reject')
  async rejectBrand(@Param('id') id: string, @Body('rejectionReason') reason: string, @CurrentUser() user: AuthenticatedUser) {
    const mongoose = require('mongoose');
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: new mongoose.Types.ObjectId(id) }, { _id: id }] }
      : { id };

    const result = await Brand.collection.findOneAndUpdate(
      filter,
      { $set: { id, status: 'REJECTED', rejectedAt: new Date(), rejectionReason: reason, reviewedBy: user.id } },
      { returnDocument: 'after' }
    );
    if (!result) throw new NotFoundException('Brand not found');
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Update brand' })
  @Put(':id')
  async updateBrand(@Param('id') id: string, @Body() data: any) {
    const mongoose = require('mongoose');
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: new mongoose.Types.ObjectId(id) }, { _id: id }] }
      : { id };

    const payload = { ...data };
    delete payload._id;

    const result = await Brand.collection.findOneAndUpdate(
      filter,
      { $set: payload },
      { returnDocument: 'after' }
    );
    if (!result) throw new NotFoundException('Brand not found');
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Delete brand' })
  @Delete(':id')
  async deleteBrand(@Param('id') id: string) {
    const mongoose = require('mongoose');
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: new mongoose.Types.ObjectId(id) }, { _id: id }] }
      : { id };

    const result = await Brand.collection.deleteOne(filter);
    if (result.deletedCount === 0) throw new NotFoundException('Brand not found');
    return { success: true };
  }
}
