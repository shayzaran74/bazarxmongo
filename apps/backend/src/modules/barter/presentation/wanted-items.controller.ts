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
import { PrismaService } from '@barterborsa/shared-persistence';
import { WantedItem } from '../domain/entities/wanted-item.entity';
import { WantedItemType } from '../domain/enums/wanted-item-type.enum';

interface AuthenticatedUser { id: string; role: string; }

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
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Kullanıcının aradıkları listesi' })
  @Get('me')
  async getMyItems(@CurrentUser() user: AuthenticatedUser) {
    const items = await this.prisma.wantedItem.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'Aranan ürün ekle' })
  @ApiResponse({ status: 201 })
  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: WantedItemCreateBody) {
    // Kategori var mı kontrol et
    const category = await this.prisma.surplusCategory.findUnique({
      where: { id: body.categoryId },
    });
    if (!category) throw new NotFoundException('Kategori bulunamadı');

    // Şirket ID — vendor hesabından al
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      include: { company: { select: { id: true } } },
    });

    // Domain entity ile oluştur
    const item = WantedItem.create(
      body.categoryId,
      body.keywords || [],
      vendor?.company?.id,
      user.id,
      (body.type as WantedItemType) || WantedItemType.PRODUCT,
    );

    // Prisma'ya yaz
    await this.prisma.wantedItem.create({
      data: {
        id:          item.id,
        categoryId:  body.categoryId,
        keywords:    body.keywords ?? [],
        description: body.description,
        companyId:   vendor?.company?.id,
        userId:      user.id,
        type:        (body.type || 'PRODUCT') as any,
        minPrice:    body.minPrice,
        maxPrice:    body.maxPrice,
        latitude:    body.latitude,
        longitude:   body.longitude,
        status:      'ACTIVE',
        isActive:    true,
      },
    });

    return { success: true, data: { id: item.id } };
  }

  @ApiOperation({ summary: 'Aranan ürün sil' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const item = await this.prisma.wantedItem.findFirst({
      where: { id, userId: user.id },
    });
    if (!item) throw new NotFoundException('Aranan ürün bulunamadı');

    await this.prisma.wantedItem.update({
      where: { id },
      data: { isActive: false, status: 'EXPIRED' },
    });
    return { success: true };
  }
}
