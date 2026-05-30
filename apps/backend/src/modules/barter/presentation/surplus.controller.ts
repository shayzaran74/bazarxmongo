// apps/backend/src/modules/barter/presentation/surplus.controller.ts
import { ISurplusCategory, ICompany, ICategoryAttribute } from '@barterborsa/shared-persistence';
import { safeRegexFilter } from '../../../common/utils/regex.utils';

import {
  Controller, Get, Post, Delete, Patch,
  Body, Param, Query, UseGuards,
  NotFoundException, BadRequestException, Inject,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
  ApiQuery, ApiParam,
} from '@nestjs/swagger';
import { Public, JwtAuthGuard, Roles, RolesGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { CreateSurplusItemCommand } from '../application/commands/create-surplus-item.command';
import { ApproveSurplusCommand } from '../application/commands/approve-surplus.command';
import { RejectSurplusCommand } from '../application/commands/reject-surplus.command';
import { ReactivateSurplusCommand } from '../application/commands/reactivate-surplus.command';
import { PilotCity } from '../domain/enums/pilot-city.enum';
import { SurplusStatus } from '../domain/enums/surplus-status.enum';
import { ISurplusItemRepository, SurplusItemUpdateData } from '../domain/repositories/surplus-item.repository.interface';
import { IVendorRepository } from '../../vendor/domain/repositories/vendor.repository.interface';
import {
  SurplusCreateDto,
  SurplusUpdateDto,
  SurplusRejectDto,
  SurplusReactivateDto,
} from '../application/dtos/surplus.dto';

interface AuthenticatedUser { id: string; role: string; }

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
    @Inject('ISurplusItemRepository') private readonly surplusRepository: ISurplusItemRepository,
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @InjectModel('SurplusCategory') private readonly surplusCategoryModel: Model<ISurplusCategory>,
    @InjectModel('Company') private readonly companyModel: Model<ICompany>,
    @InjectModel('CategoryAttribute') private readonly categoryAttributeModel: Model<ICategoryAttribute>,
  ) {}

  // ─── Kategoriler ──────────────────────────────────────────────────────────

  @Public()
  @ApiOperation({ summary: 'Surplus kategorilerini listele' })
  @ApiQuery({ name: 'all', required: false, type: Boolean })
  @Get('categories')
  async getCategories(@Query('all') all?: string) {
    const categories = await this.surplusCategoryModel.find({ isActive: true }).lean();
    const mapped = categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug || '',
      icon: c.icon || '',
      parentId: c.parentId || null,
      order: c.order || 0,
      isActive: c.isActive,
    }));

    if (all === 'true') {
      return { success: true, data: mapped };
    }

    interface CategoryNode { id: string; name: string; slug: string; icon: string; parentId: string | null; order: number; isActive: boolean; children: CategoryNode[] }
    // Build category tree
    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    mapped.forEach(cat => {
      categoryMap.set(cat.id, {
        ...cat,
        children: [],
      });
    });

    mapped.forEach(cat => {
      const dto = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children.push(dto);
      } else {
        rootCategories.push(dto);
      }
    });

    return { success: true, data: rootCategories };
  }

  // Kategori özelliklerini döndür (formda dinamik alan için)
  @Public()
  @ApiOperation({ summary: 'Surplus kategori özelliklerini listele' })
  @ApiParam({ name: 'id' })
  @Get('categories/:id/attributes')
  async getCategoryAttributes(@Param('id') id: string): Promise<{ success: boolean; data: { id: string; name: string; label: string; type: string; options: unknown[]; unit?: string; placeholder?: string; isRequired?: boolean; isFilterable?: boolean; order?: number }[] }> {
    // surplusCategoryId veya categoryId üzerinden eşleştir, isActive filtrele
    const attrs = await this.categoryAttributeModel
      .find({
        $or: [{ surplusCategoryId: id }, { categoryId: id }],
        isActive: true,
      })
      .sort({ order: 1 })
      .lean()
      .exec();

    const data = attrs.map(a => ({
      id:          a.id,
      name:        a.name,
      label:       a.label,
      type:        a.type,
      options:     (a.options as unknown as unknown[]) ?? [],
      unit:        a.unit,
      placeholder: a.placeholder,
      isRequired:  a.isRequired,
      isFilterable: a.isFilterable,
      order:       a.order,
    }));

    return { success: true, data };
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

    const filter: Record<string, unknown> = {};
    if (query.status && query.status.toLowerCase() !== 'all') {
      const mapped = STATUS_FILTER_MAP[query.status.toLowerCase()];
      if (mapped) filter.status = mapped;
    }
    if (query.companyId)  filter.companyId = query.companyId;
    if (query.categoryId) filter.category  = query.categoryId;
    if (query.city)       filter.city      = query.city;
    if (query.q) {
      const regex = safeRegexFilter(query.q);
      if (regex) filter.title = regex;
    }

    const result = await this.surplusRepository.findWithFilters(filter, skip, limit);
    
    // Get unique companyIds
    const companyIds = Array.from(new Set(result.items.map(item => item.getProps().companyId).filter(Boolean)));
    
    // Load companies
    const companies = await this.companyModel.find({ id: { $in: companyIds } }).lean();
    const companyMap = new Map<string, ICompany>();
    companies.forEach(c => {
      companyMap.set(c.id, c);
    });
    
    // Map items to include company details
    const mappedItems = result.items.map(item => {
      const props = item.getProps();
      const company = props.companyId ? companyMap.get(props.companyId) : null;
      return {
        ...props,
        id: item.id,
        company: company ? { id: company.id, name: company.name } : null
      };
    });

    return {
      success: true,
      data:  mappedItems,
      meta:  { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
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

    // findById mapper üzerinden geçer — Decimal128 alanlar düzgün number'a dönüşür
    const item = await this.surplusRepository.findById(id);
    if (!item) throw new NotFoundException('Surplus ürün bulunamadı');

    const props = item.getProps();

    let company: { id: string; name: string } | null = null;
    if (props.companyId) {
      const companyDoc = (await this.companyModel.findOne({ id: props.companyId }).lean()) as { id: string; name?: string } | null;
      if (companyDoc) {
        company = { id: companyDoc.id, name: companyDoc.name ?? '' };
      }
    }

    return {
      success: true,
      data: {
        ...props,
        id: item.id,
        company,
      },
    };
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
    const item = await this.surplusRepository.findByIdWithCompany(id);

    if (!item) throw new NotFoundException('Surplus ürün bulunamadı');
    if (item.companyId !== vendor.company?.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new NotFoundException('Surplus ürün bulunamadı');
    }

    const updateData: Partial<SurplusItemUpdateData> = { status: SurplusStatus.PENDING_APPROVAL };
    if (body.title        !== undefined) updateData.title       = body.title;
    if (body.description  !== undefined) updateData.description = body.description;
    if (body.quantity     !== undefined) updateData.quantity    = body.quantity;
    if (body.unitPrice    !== undefined) updateData.unitPrice   = body.unitPrice;
    if (body.materialType !== undefined) updateData.materialType = body.materialType;
    if (body.location     !== undefined) updateData.location    = body.location;
    if (body.images       !== undefined) updateData.images      = body.images;
    if (body.wantedCategories !== undefined) updateData.wantedCategories = body.wantedCategories;
    if (body.tradeModes   !== undefined) updateData.tradeModes  = body.tradeModes;
    if (body.technicalSpecs !== undefined) updateData.technicalSpecs = body.technicalSpecs;

    const updated = await this.surplusRepository.update(id, updateData);
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
    const item = await this.surplusRepository.findByIdWithCompany(id);

    if (!item) throw new NotFoundException('Surplus ürün bulunamadı');
    if (!isAdmin) {
      const vendor = await this.getVendorWithCompany(user.id);
      if (item.companyId !== vendor.company?.id) {
        throw new NotFoundException('Surplus ürün bulunamadı');
      }
    }

    await this.surplusRepository.delete(id);
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

    const updated = await this.surplusRepository.update(id, { status: finalStatus });
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

  private async getVendorWithCompany(userId: string): Promise<{ id: string; company: { id: string; name: string; status: string } }> {
    const vendor = await this.vendorRepository.findByUserId(userId);

    if (!vendor) {
      throw new BadRequestException('Satıcı profiliniz bulunamadı.');
    }
    const props = vendor.getProps();
    if (props.status !== 'APPROVED') {
      throw new BadRequestException('Satıcı hesabınız henüz onaylanmamış.');
    }
    if (!props.barterEnabled) {
      throw new BadRequestException('Takas (barter) modülü hesabınız için aktif değil.');
    }
    if (!props.companyId) {
      throw new BadRequestException('Satıcı hesabınıza bağlı bir firma bulunamadı.');
    }

    // Firma onay duvarı (barter-audit kural A): firma da APPROVED olmalı
    const companyDoc = await this.companyModel.findOne({ id: props.companyId }).lean().exec();
    if (!companyDoc) {
      throw new BadRequestException('Firma kaydınız bulunamadı.');
    }
    if (companyDoc.status !== 'APPROVED') {
      throw new BadRequestException('Firmanız henüz onaylanmamış. Takas işlemleri için firma onayı gereklidir.');
    }

    return {
      id: vendor.id,
      company: { id: companyDoc.id, name: companyDoc.name ?? '', status: companyDoc.status },
    };
  }
}