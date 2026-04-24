import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';
import { Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import * as cmd from '../application/commands/create-content.commands';
import { CreateHomeBannerDto } from '../application/dtos/create-home-banner.dto';
import { CreateQuadCardDto } from '../application/dtos/create-quad-card.dto';
import { CreateHelpCategoryDto, CreateHelpArticleDto } from '../application/dtos/create-help.dtos';
import { 
  CreateAnnouncementDto, 
  CreatePolicyDto, 
  CreateDynamicContentDto, 
  UpsertSeoMetadataDto 
} from '../application/dtos/content-misc.dtos';

@ApiTags('Content Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/content')
export class ContentAdminController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Create home banner (Admin)', description: 'Ana sayfada gösterilecek yeni bir banner ekler.' })
  @ApiBody({ type: CreateHomeBannerDto })
  @ApiResponse({ status: 201, description: 'Banner oluşturuldu.' })
  @Post('banners')
  async createBanner(@Body() dto: CreateHomeBannerDto) { return this.commandBus.execute(new cmd.CreateHomeBannerCommand(dto)); }

  @ApiOperation({ summary: 'Create quad card (Admin)', description: 'Ana sayfadaki 4\'lü kart grubuna yeni bir kart ekler.' })
  @ApiBody({ type: CreateQuadCardDto })
  @ApiResponse({ status: 201, description: 'Kart oluşturuldu.' })
  @Post('quad-cards')
  async createQuadCard(@Body() dto: CreateQuadCardDto) { return this.commandBus.execute(new cmd.CreateQuadCardCommand(dto)); }

  @ApiOperation({ summary: 'Create help category (Admin)', description: 'Yardım merkezine yeni bir kategori ekler.' })
  @ApiBody({ type: CreateHelpCategoryDto })
  @ApiResponse({ status: 201, description: 'Kategori oluşturuldu.' })
  @Post('help/categories')
  async createHelpCategory(@Body() dto: CreateHelpCategoryDto) { return this.commandBus.execute(new cmd.CreateHelpCategoryCommand(dto)); }

  @ApiOperation({ summary: 'Create help article (Admin)', description: 'Yardım merkezine yeni bir makale ekler.' })
  @ApiBody({ type: CreateHelpArticleDto })
  @ApiResponse({ status: 201, description: 'Makale oluşturuldu.' })
  @Post('help/articles')
  async createHelpArticle(@Body() dto: CreateHelpArticleDto) { return this.commandBus.execute(new cmd.CreateHelpArticleCommand(dto)); }

  @ApiOperation({ summary: 'Create announcement (Admin)', description: 'Sistem genelinde duyuru yayınlar.' })
  @ApiBody({ type: CreateAnnouncementDto })
  @ApiResponse({ status: 201, description: 'Duyuru oluşturuldu.' })
  @Post('announcements')
  async createAnnouncement(@Body() dto: CreateAnnouncementDto) { return this.commandBus.execute(new cmd.CreateAnnouncementCommand(dto)); }

  @ApiOperation({ summary: 'Create policy (Admin)', description: 'KVKK, Kullanım Koşulları gibi yasal metin ekler.' })
  @ApiBody({ type: CreatePolicyDto })
  @ApiResponse({ status: 201, description: 'Politika oluşturuldu.' })
  @Post('policies')
  async createPolicy(@Body() dto: CreatePolicyDto) { return this.commandBus.execute(new cmd.CreatePolicyCommand(dto)); }

  @ApiOperation({ summary: 'Create dynamic content (Admin)', description: 'Özel sayfalar için dinamik içerik bloğu oluşturur.' })
  @ApiBody({ type: CreateDynamicContentDto })
  @ApiResponse({ status: 201, description: 'İçerik oluşturuldu.' })
  @Post('dynamic')
  async createDynamicContent(@Body() dto: CreateDynamicContentDto) { return this.commandBus.execute(new cmd.CreateDynamicContentCommand(dto)); }

  @ApiOperation({ summary: 'Upsert SEO metadata (Admin)', description: 'Belirli bir URL yolu için SEO meta verilerini ekler veya günceller.' })
  @ApiBody({ type: UpsertSeoMetadataDto })
  @ApiResponse({ status: 200, description: 'SEO verisi güncellendi.' })
  @Post('seo')
  async upsertSeo(@Body() dto: UpsertSeoMetadataDto) { return this.commandBus.execute(new cmd.UpsertSeoMetadataCommand(dto)); }
}
