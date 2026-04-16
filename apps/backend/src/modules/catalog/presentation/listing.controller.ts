import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';
import { CreateListingCommand } from '../application/commands/create-listing.command';
import { CreateListingDto } from '../application/dtos/create-listing.dto';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard, Roles, Public } from '@barterborsa/shared-security';

@ApiTags('Listings')
@Controller('listings')
export class ListingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product listing', description: 'Satıcı için yeni bir ürün ilanı oluşturur.' })
  @ApiBody({ type: CreateListingDto })
  @ApiResponse({ status: 201, description: 'İlan başarıyla oluşturuldu.' })
  @ApiResponse({ status: 403, description: 'Sadece satıcılar ilan oluşturabilir.' })
  @Post()
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@CurrentUser() user: any, @Body() dto: CreateListingDto) {
    // Note: This assumes the user's vendorId is linked or they are the vendor
    // In a real scenario, we'd fetch the vendorId associated with this userId
    return this.commandBus.execute(new CreateListingCommand(user.vendorId || user.id, dto));
  }

  @Public()
  @ApiOperation({ summary: 'Get listing by slug', description: 'URL slug bilgisi verilen ilanın detaylarını döner.' })
  @ApiParam({ name: 'slug', description: 'İlan slug (örn: iphone-15-pro-max)' })
  @ApiResponse({ status: 200, description: 'İlan detayları.' })
  @ApiResponse({ status: 404, description: 'İlan bulunamadı.' })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    // Query implementation would follow
    return { slug };
  }
}
