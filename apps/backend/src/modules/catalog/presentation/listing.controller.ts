import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';
import { CreateListingCommand } from '../application/commands/create-listing.command';
import { CreateListingDto } from '../application/dtos/create-listing.dto';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard, Roles, Public } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Listings')
@Controller('listings')
export class ListingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Get all categories', description: 'Tüm kategorileri ağaç yapısında veya düz liste olarak döner.' })
  @ApiQuery({ name: 'all', required: false, type: Boolean })
  @ApiQuery({ name: 'includeChildren', required: false, type: Boolean })
  @Get('categories')
  async getCategories(
    @Query('all') all: string = 'true',
    @Query('includeChildren') includeChildren: string = 'true'
  ) {
    const categories = await this.prisma.category.findMany({
      where: all === 'true' ? {} : { parentId: null },
      include: includeChildren === 'true' ? { children: { include: { children: true } } } : undefined,
      orderBy: { order: 'asc' }
    });
    return { success: true, data: categories };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List products/listings', description: 'İlanları listeler. Satıcı ise sadece kendi ilanlarını görür.' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async list(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('limit') limit: string = '50',
    @Query('page') page: string = '1'
  ) {
    const limitNum = parseInt(limit, 10) || 50;
    const pageNum = parseInt(page, 10) || 1;
    const skip = (pageNum - 1) * limitNum;

    // Determine vendor scope
    let where: any = {};
    
    if (user.role === 'VENDOR') {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId: user.id }
      });
      if (vendor) {
        where.vendorId = vendor.id;
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          catalogProduct: {
            include: {
              media: { take: 1, orderBy: { sortOrder: 'asc' } },
              category: true
            }
          },
          vendor: { include: { company: true } }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.listing.count({ where })
    ]);

    // Map to frontend-friendly format
    const mappedItems = items.map(l => ({
      id: l.id,
      name: l.title,
      price: l.price ? Number(l.price) : 0,
      stock: l.stock,
      sku: (l as any).sku || '',
      status: l.status,
      images: (l as any).catalogProduct?.media?.map((m: any) => m.url) || [],
      category: (l as any).catalogProduct?.category?.name,
      vendorName: (l as any).vendor?.company?.name || 'Bilinmeyen Satıcı'
    }));

    return {
      success: true,
      data: {
        items: mappedItems
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product listing', description: 'Satıcı için yeni bir ürün ilanı oluşturur.' })
  @ApiBody({ type: CreateListingDto })
  @ApiResponse({ status: 201, description: 'İlan başarıyla oluşturuldu.' })
  @ApiResponse({ status: 403, description: 'Sadece satıcılar ilan oluşturabilir.' })
  @Post()
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@CurrentUser() user: any, @Body() dto: CreateListingDto) {
    return this.commandBus.execute(new CreateListingCommand(user.vendorId || user.id, dto));
  }

  @Public()
  @ApiOperation({ summary: 'Get listing by slug', description: 'URL slug bilgisi verilen ilanın detaylarını döner.' })
  @ApiParam({ name: 'slug', description: 'İlan slug (örn: iphone-15-pro-max)' })
  @ApiResponse({ status: 200, description: 'İlan detayları.' })
  @ApiResponse({ status: 404, description: 'İlan bulunamadı.' })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { slug },
      include: {
        catalogProduct: {
          include: {
            media: true,
            category: true,
            brands: true
          }
        },
        vendor: { include: { company: true, profile: true } }
      }
    });

    return { success: !!listing, data: listing };
  }
}
