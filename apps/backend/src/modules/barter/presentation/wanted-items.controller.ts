// apps/backend/src/modules/barter/presentation/wanted-items.controller.ts

import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, NotFoundException,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { WantedItem } from '../domain/entities/wanted-item.entity';
import { WantedItemType } from '../domain/enums/wanted-item-type.enum';
import { IWantedItemRepository } from '../domain/repositories/wanted-item.repository.interface';
import { ISurplusItemRepository } from '../domain/repositories/surplus-item.repository.interface';
import { Inject } from '@nestjs/common';

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
    @Inject('ISurplusItemRepository') private readonly surplusItemRepo: ISurplusItemRepository,
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
    const category = await this.surplusItemRepo.findById(body.categoryId);
    if (!category) throw new NotFoundException('Kategori bulunamadı');

    // Şirket ID — vendor hesabından al (surplusItem'tan companyId çekilir)
    const item = WantedItem.create(
      body.categoryId,
      body.keywords || [],
      undefined, // companyId — surplus category'den çekilebilir ama şimdilik undefined
      user.id,
      (body.type as WantedItemType) || WantedItemType.PRODUCT,
    );

    await this.wantedItemRepo.create({
      id:          item.id,
      categoryId:  body.categoryId,
      keywords:    body.keywords ?? [],
      description: body.description,
      companyId:   undefined,
      userId:      user.id,
      type:        (body.type || 'PRODUCT'),
      minPrice:    body.minPrice,
      maxPrice:    body.maxPrice,
      latitude:    body.latitude,
      longitude:    body.longitude,
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
    if (!item || (item as any).userId !== user.id) throw new NotFoundException('Aranan ürün bulunamadı');

    await this.wantedItemRepo.softDelete(id);
    return { success: true };
  }
}