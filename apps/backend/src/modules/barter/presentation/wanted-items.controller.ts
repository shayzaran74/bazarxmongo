// apps/backend/src/modules/barter/presentation/wanted-items.controller.ts

import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, NotFoundException, ForbiddenException,
  HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { ISurplusCategory } from '@barterborsa/shared-persistence';
import { WantedItem } from '../domain/entities/wanted-item.entity';
import { WantedItemType } from '../domain/enums/wanted-item-type.enum';
import { IWantedItemRepository } from '../domain/repositories/wanted-item.repository.interface';
import { IVendorRepository } from '../../vendor/domain/repositories/vendor.repository.interface';

interface AuthenticatedUser { id: string; role: string; vendorId?: string; }

interface WantedItemCreateBody {
  categoryId: string;
  keywords?: string[];
  description?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
}

@ApiTags('Wanted Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wanted-items')
export class WantedItemsController {
  constructor(
    @Inject('IWantedItemRepository') private readonly wantedItemRepo: IWantedItemRepository,
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @InjectModel('SurplusCategory') private readonly surplusCategoryModel: Model<ISurplusCategory>,
  ) {}

  @ApiOperation({ summary: 'Kullanıcının aradıkları listesi' })
  @Get('me')
  async getMyItems(@CurrentUser() user: AuthenticatedUser) {
    const items = await this.wantedItemRepo.findByUserId(user.id);
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'Aranan ürün ekle' })
  @ApiResponse({ status: 201 })
  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: WantedItemCreateBody) {
    // Kategori geçerlilik kontrolü — doğru surplusCategory modelinden yapılır
    const category = await this.surplusCategoryModel.findOne({ _id: body.categoryId }).lean().exec();
    if (!category) throw new NotFoundException('Kategori bulunamadı');

    // companyId — vendor profili üzerinden çözümlenir
    const vendor = await this.vendorRepository.findByUserId(user.id);
    if (!vendor) throw new ForbiddenException('Satıcı profiliniz bulunamadı.');
    const companyId = vendor.getProps().companyId;
    if (!companyId) throw new ForbiddenException('Şirket kaydınız bulunamadı.');

    const item = WantedItem.create(
      body.categoryId,
      body.keywords || [],
      companyId,
      user.id,
      (body.type as WantedItemType) || WantedItemType.PRODUCT,
    );

    await this.wantedItemRepo.create({
      id:          item.id,
      categoryId:  body.categoryId,
      keywords:    body.keywords ?? [],
      description: body.description,
      companyId,
      userId:      user.id,
      type:        (body.type || 'PRODUCT'),
      minPrice:    body.minPrice,
      maxPrice:    body.maxPrice,
      latitude:    body.latitude,
      longitude:   body.longitude,
      status:      'ACTIVE',
      isActive:    true,
    });

    return { success: true, data: { id: item.id } };
  }

  @ApiOperation({ summary: 'Aranan ürün sil' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const item = await this.wantedItemRepo.findById(id);
    if (!item || item.getProps().userId !== user.id) throw new NotFoundException('Aranan ürün bulunamadı');

    await this.wantedItemRepo.softDelete(id);
    return { success: true };
  }
}