// apps/backend/src/modules/barter/presentation/surplus.controller.ts

import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, NotFoundException, BadRequestException,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
  ApiQuery, ApiParam,
} from '@nestjs/swagger';
import { Public, JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Prisma } from '@prisma/client';
import { CreateSurplusItemCommand } from '../application/commands/create-surplus-item.command';
import { PilotCity } from '../domain/enums/pilot-city.enum';

interface AuthenticatedUser { id: string; role: string; }

interface SurplusListQuery {
  categoryId?: string;
  city?: string;
  q?: string;
  page?: string;
  limit?: string;
}

interface SurplusCreateBody {
  title: string;
  category?: string;
  categoryId?: string;
  quantity: number;
  unit: string;
  city: string;
  description?: string;
  unitPrice?: number;
}

interface SurplusUpdateBody {
  title?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  images?: unknown;
}

@ApiTags('Surplus')
@Controller('surplus')
export class SurplusController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Kategoriler ──────────────────────────────────────────────────────────

  @Public()
  @ApiOperation({ summary: 'Surplus kategorilerini listele' })
  @ApiQuery({ name: 'all', required: false, type: Boolean })
  @Get('categories')
  async getCategories(@Query('all') all?: string) {
    const categories = await this.prisma.surplusCategory.findMany({
      where: all === 'true' ? undefined : { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
    return { success: true, data: categories };
  }

  // ─── Surplus listesi ──────────────────────────────────────────────────────

  @Public()
  @ApiOperation({ summary: 'Surplus ürünleri listele' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  async list(@Query() query: SurplusListQuery) {
    const page  = parseInt(query.page  ?? '1',  10) || 1;
    const limit = parseInt(query.limit ?? '20', 10) || 20;
    const skip  = (page - 1) * limit;

    const where: Prisma.SurplusItemWhereInput = { status: 'ACTIVE' };
    if (query.categoryId) where.category = query.categoryId;
    if (query.city)       where.city = query.city;
    if (query.q) {
      where.title = { contains: query.q, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.surplusItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { company: { select: { id: true, name: true } } },
      }),
      this.prisma.surplusItem.count({ where }),
    ]);

    return {
      success: true,
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Surplus oluştur ──────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Surplus ürün ekle' })
  @ApiResponse({ status: 201 })
  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: SurplusCreateBody) {
    const vendor = await this.getVendorWithCompany(user.id);

    const result = await this.commandBus.execute(
      new CreateSurplusItemCommand(
        vendor.company.id,
        body.title,
        body.category || body.categoryId,
        body.quantity,
        body.unit,
        body.city as PilotCity,
        body.description,
        body.unitPrice,
      ),
    );
    return { success: true, data: result };
  }

  // ─── Surplus detay ────────────────────────────────────────────────────────

  @Public()
  @ApiOperation({ summary: 'Surplus ürün detayı' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.prisma.surplusItem.findUnique({
      where: { id },
      include: { company: { select: { id: true, name: true } } },
    });
    if (!item) throw new NotFoundException('Surplus ürün bulunamadı');
    return { success: true, data: item };
  }

  // ─── Surplus güncelle ─────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Surplus ürün güncelle' })
  @ApiParam({ name: 'id' })
  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: SurplusUpdateBody,
  ) {
    const vendor = await this.getVendorWithCompany(user.id);

    const item = await this.prisma.surplusItem.findFirst({
      where: { id, companyId: vendor?.company?.id },
    });
    if (!item) throw new NotFoundException('Surplus ürün bulunamadı');

    const updated = await this.prisma.surplusItem.update({
      where: { id },
      data: {
        ...(body.title       !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.quantity    !== undefined && { quantity: body.quantity }),
        ...(body.unitPrice   !== undefined && { unitPrice: body.unitPrice }),
        ...(body.images      !== undefined && { images: body.images as any }),
      },
    });
    return { success: true, data: updated };
  }

  // ─── Surplus sil ─────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Surplus ürün sil' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const vendor = await this.getVendorWithCompany(user.id);

    const item = await this.prisma.surplusItem.findFirst({
      where: { id, companyId: vendor?.company?.id },
    });
    if (!item) throw new NotFoundException('Surplus ürün bulunamadı');

    await this.prisma.surplusItem.delete({ where: { id } });
    return { success: true };
  }

  // ─── Yardımcı ─────────────────────────────────────────────────────────────

  private async getVendorWithCompany(userId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId },
      include: { company: { select: { id: true, name: true, status: true } } },
    });
    if (!vendor?.company) {
      throw new BadRequestException('Şirket hesabı bulunamadı');
    }
    if (vendor.status !== 'APPROVED') {
      throw new BadRequestException('Satıcı hesabınız henüz onaylanmamış.');
    }
    if (vendor.company.status !== 'APPROVED') {
      throw new BadRequestException('Şirketiniz onaylanmamış. Takas işlemi yapamazsınız.');
    }
    if (!vendor.barterEnabled) {
      throw new BadRequestException('Ticari takas yetkiniz aktif değil.');
    }
    return vendor;
  }
}
