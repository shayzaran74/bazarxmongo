// apps/backend/src/modules/barter/presentation/surplus.controller.ts

import {
  Controller, Get, Post, Delete, Patch,
  Body, Param, Query, UseGuards,
  NotFoundException, BadRequestException,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
  ApiQuery, ApiParam,
} from '@nestjs/swagger';
import { Public, JwtAuthGuard, Roles, RolesGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Prisma, Vendor, Company } from '@prisma/client';
import { CreateSurplusItemCommand } from '../application/commands/create-surplus-item.command';
import { ApproveSurplusCommand } from '../application/commands/approve-surplus.command';
import { RejectSurplusCommand } from '../application/commands/reject-surplus.command';
import { ReactivateSurplusCommand } from '../application/commands/reactivate-surplus.command';
import { PilotCity } from '../domain/enums/pilot-city.enum';
import { SurplusStatus } from '../domain/enums/surplus-status.enum';
import {
  SurplusCreateDto,
  SurplusUpdateDto,
  SurplusRejectDto,
  SurplusReactivateDto,
} from '../application/dtos/surplus.dto';

interface AuthenticatedUser { id: string; role: string; }

type VendorWithCompany = Vendor & { company: Pick<Company, 'id' | 'name' | 'status'> | null };

// Frontend'den gelebilecek durum parametrelerini DB enum'una map eden lookup
const STATUS_FILTER_MAP: Record<string, SurplusStatus> = {
  pending:          SurplusStatus.PENDING_APPROVAL,
  pending_approval: SurplusStatus.PENDING_APPROVAL,
  approved:         SurplusStatus.ACTIVE,
  active:           SurplusStatus.ACTIVE,
  rejected:         SurplusStatus.REJECTED,
  reserved:         SurplusStatus.RESERVED,
  traded:           SurplusStatus.TRADED,
  expired:          SurplusStatus.EXPIRED,
  deactivated:      SurplusStatus.DEACTIVATED,
};

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

  // Kategori özelliklerini döndür (formda dinamik alan için)
  @Public()
  @ApiOperation({ summary: 'Surplus kategori özelliklerini listele' })
  @ApiParam({ name: 'id' })
  @Get('categories/:id/attributes')
  async getCategoryAttributes(@Param('id') id: string) {
    const category = await this.prisma.surplusCategory.findUnique({
      where: { id },
      include: { attributes: true },
    });
    if (!category) throw new NotFoundException('Kategori bulunamadı');
    const attributes = (category as unknown as { attributes?: unknown[] }).attributes ?? [];
    return { success: true, data: attributes };
  }

  // ─── Surplus listesi ──────────────────────────────────────────────────────

  @Public()
  @ApiOperation({ summary: 'Surplus ürünleri listele' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'companyId',  required: false })
  @ApiQuery({ name: 'city',       required: false })
  @ApiQuery({ name: 'q',          required: false })
  @ApiQuery({ name: 'status',     required: false })
  @ApiQuery({ name: 'page',       required: false, type: Number })
  @ApiQuery({ name: 'limit',      required: false, type: Number })
  @Get()
  async list(@Query() query: {
    categoryId?: string;
    city?: string;
    q?: string;
    page?: string;
    limit?: string;
    status?: string;
    companyId?: string;
  }) {
    const page  = Math.max(1, parseInt(query.page  ?? '1',  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20));
    const skip  = (page - 1) * limit;

    const where: Prisma.SurplusItemWhereInput = {};

    if (query.status && query.status.toLowerCase() !== 'all') {
      const mapped = STATUS_FILTER_MAP[query.status.toLowerCase()];
      if (mapped) {
        where.status = mapped as any;
      }
      // Geçersiz status gönderildiğinde filtre uygulanmaz — sessizce geçilir
    }

    if (query.companyId)  where.companyId = query.companyId;
    if (query.categoryId) where.category  = query.categoryId;
    if (query.city)       where.city      = query.city;
    if (query.q)          where.title     = { contains: query.q, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.surplusItem.findMany({
        where,
        skip,
        take:      limit,
        orderBy:   { createdAt: 'desc' },
        include:   { company: { select: { id: true, name: true } } },
      }),
      this.prisma.surplusItem.count({ where }),
    ]);

    return {
      success: true,
      items,
      data:  items,
      meta:  { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  @Public()
  @Get('all')
  async listAll() {
    return this.list({ status: 'all' });
  }

  // ─── Surplus oluştur ──────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Surplus ürün ekle' })
  @ApiResponse({ status: 201 })
  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: SurplusCreateDto) {
    const vendor = await this.getVendorWithCompany(user.id);
    // this.assertBarterEnabled(vendor); // Removed: approved vendors have automatic authority

    const categoryId = body.categoryId ?? body.category ?? '';

    const result = await this.commandBus.execute(
      new CreateSurplusItemCommand(
        vendor.company!.id,
        body.title,
        categoryId,
        body.quantity,
        body.unit,
        (body.city ?? PilotCity.ISTANBUL) as PilotCity,
        body.description,
        body.unitPrice,
        body.images,
        body.materialType,
        body.location,
        body.wantedCategories,
        body.tradeModes,
        body.technicalSpecs,
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
    if (id === 'all') return this.listAll();
    const item = await this.prisma.surplusItem.findUnique({
      where:   { id },
      include: { company: { select: { id: true, name: true } } },
    });
    if (!item) throw new NotFoundException('Surplus ürün bulunamadı');
    return { success: true, data: item };
  }

  // ─── Surplus güncelle (vendor) ────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Surplus ürün güncelle' })
  @ApiParam({ name: 'id' })
  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: SurplusUpdateDto,
  ) {
    const vendor = await this.getVendorWithCompany(user.id);

    const item = await this.prisma.surplusItem.findFirst({
      where: { id, companyId: vendor.company?.id },
    });
    if (!item) throw new NotFoundException('Surplus ürün bulunamadı');

    const updateData: Prisma.SurplusItemUpdateInput = {
      status: SurplusStatus.PENDING_APPROVAL as any, // her güncellemede onaya düşer
    };
    if (body.title        !== undefined) updateData.title       = body.title;
    if (body.description  !== undefined) updateData.description = body.description;
    if (body.quantity     !== undefined) updateData.quantity    = new Prisma.Decimal(body.quantity);
    if (body.unitPrice    !== undefined) updateData.unitPrice   = new Prisma.Decimal(body.unitPrice);
    if (body.materialType !== undefined) updateData.materialType = body.materialType;
    if (body.location     !== undefined) updateData.location    = body.location;
    if (body.images       !== undefined) updateData.images      = body.images;
    if (body.wantedCategories !== undefined) updateData.wantedCategories = body.wantedCategories;
    if (body.tradeModes   !== undefined) updateData.tradeModes  = body.tradeModes;
    if (body.technicalSpecs !== undefined) updateData.technicalSpecs = body.technicalSpecs as Prisma.InputJsonValue;

    const updated = await this.prisma.surplusItem.update({ where: { id }, data: updateData });
    return { success: true, data: updated };
  }

  // ─── Surplus sil (vendor) ─────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Surplus ürün sil' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const where: Prisma.SurplusItemWhereInput = { id };

    if (!isAdmin) {
      const vendor = await this.getVendorWithCompany(user.id);
      where.companyId = vendor.company?.id;
    }

    const item = await this.prisma.surplusItem.findFirst({ where });
    if (!item) throw new NotFoundException('Surplus ürün bulunamadı');

    await this.prisma.surplusItem.delete({ where: { id } });
    return { success: true };
  }

  // ─── Surplus onay (admin) ─────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Surplus ürün statüsünü güncelle (Admin)' })
  @ApiParam({ name: 'id' })
  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('status') rawStatus: string,
  ) {
    const normalised = (rawStatus ?? '').toUpperCase();
    const mapped     = STATUS_FILTER_MAP[normalised.toLowerCase()];
    const finalStatus: SurplusStatus = (mapped ?? normalised) as SurplusStatus;

    if (!Object.values(SurplusStatus).includes(finalStatus)) {
      throw new BadRequestException(`Geçersiz statü: ${rawStatus}`);
    }

    // APPROVED → ACTIVE dönüşümünü DDD handler üzerinden yap
    if (finalStatus === SurplusStatus.ACTIVE) {
      return this.commandBus.execute(new ApproveSurplusCommand(id, user.id));
    }

    const updated = await this.prisma.surplusItem.update({
      where: { id },
      data:  { status: finalStatus as any },
    });
    return { success: true, data: updated };
  }

  // ─── Surplus reddet (admin) ───────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Surplus ürün reddet (Admin)' })
  @ApiParam({ name: 'id' })
  @Post(':id/reject')
  async rejectItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: SurplusRejectDto,
  ) {
    if (!body.reason?.trim()) {
      throw new BadRequestException('Red gerekçesi zorunludur');
    }
    return this.commandBus.execute(new RejectSurplusCommand(id, user.id, body.reason));
  }

  // ─── Surplus yeniden aktifleştir (vendor) ─────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Pasif ilanı yeniden onaya gönder' })
  @ApiParam({ name: 'id' })
  @Patch(':id/reactivate')
  async reactivate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: SurplusReactivateDto,
  ) {
    return this.commandBus.execute(
      new ReactivateSurplusCommand(id, user.id, body.quantity),
    );
  }

  // ─── Yardımcılar ──────────────────────────────────────────────────────────

  private async getVendorWithCompany(userId: string): Promise<VendorWithCompany> {
    const vendor = await this.prisma.vendor.findFirst({
      where:   { userId },
      include: { company: { select: { id: true, name: true, status: true } } },
    });

    if (!vendor) {
      throw new BadRequestException('Satıcı profiliniz bulunamadı.');
    }
    if (vendor.status !== 'APPROVED') {
      throw new BadRequestException('Satıcı hesabınız henüz onaylanmamış.');
    }

    // Şirket kaydı yoksa vendor'ı bireysel satıcı olarak kabul et
    if (!vendor.company) {
      return {
        ...vendor,
        company: {
          id:     vendor.id,
          name:   vendor.slug ?? 'Bireysel Satıcı',
          status: 'APPROVED',
        },
      };
    }

    return vendor as VendorWithCompany;
  }
}