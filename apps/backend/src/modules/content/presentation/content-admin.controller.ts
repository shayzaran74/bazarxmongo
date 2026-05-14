// apps/backend/src/modules/content/presentation/content-admin.controller.ts
// POST /admin/content/banners kaldırıldı — frontend /admin/banners kullanıyor (BannersAdminController)
// GET/PUT/DELETE endpoint'leri eklendi

import {
  Controller, Post, Get, Put, Delete,
  Body, Param, UseGuards, NotFoundException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiBody, ApiParam,
} from '@nestjs/swagger';
import { Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateQuadCardCommand } from '../application/commands/create-quad-card.command';
import { CreateHelpCategoryCommand } from '../application/commands/create-help-category.command';
import { CreateHelpArticleCommand } from '../application/commands/create-help-article.command';
import { CreateAnnouncementCommand } from '../application/commands/create-announcement.command';
import { CreatePolicyCommand } from '../application/commands/create-policy.command';
import { CreateDynamicContentCommand } from '../application/commands/create-dynamic-content.command';
import { UpsertSeoMetadataCommand } from '../application/commands/upsert-seo-metadata.command';
import { CreateQuadCardDto } from '../application/dtos/create-quad-card.dto';
import { UpdateQuadCardsDto } from '../application/dtos/update-quad-cards.dto';
import { CreateHelpCategoryDto, CreateHelpArticleDto } from '../application/dtos/create-help.dtos';
import {
  CreateAnnouncementDto, CreatePolicyDto,
  CreateDynamicContentDto, UpsertSeoMetadataDto,
} from '../application/dtos/content-misc.dtos';

@ApiTags('Content Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/content')
export class ContentAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Quad Cards ────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Quad card listesi' })
  @Get('quad-cards')
  async getQuadCards() {
    const data = await this.prisma.homeQuadCard.findMany({
      include: { items: true },
      orderBy: { order: 'asc' },
    });
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Quad cardları toplu güncelle/oluştur' })
  @ApiBody({ type: UpdateQuadCardsDto })
  @ApiResponse({ status: 201 })
  @Post('quad-cards')
  async updateQuadCards(@Body() dto: UpdateQuadCardsDto) {
    // Önce eskileri temizle (basit batch mantığı)
    await this.prisma.homeQuadCardItem.deleteMany({});
    await this.prisma.homeQuadCard.deleteMany({});

    // Yenileri tek tek oluştur (Transaction içinde)
    return this.prisma.$transaction(async (tx) => {
      for (const card of dto.cards) {
        await tx.homeQuadCard.create({
          data: {
            title: card.title,
            order: card.order,
            isActive: card.isActive,
            platform: card.platform as any,
            items: {
              create: card.items.map(item => ({
                title: item.title,
                image: item.image,
                link: item.link,
                productId: item.productId,
                order: item.order
              }))
            }
          }
        });
      }
      return { success: true };
    });
  }

  @ApiOperation({ summary: 'Quad card sil' })
  @ApiParam({ name: 'id' })
  @Delete('quad-cards/:id')
  async deleteQuadCard(@Param('id') id: string) {
    await this.prisma.homeQuadCard.delete({ where: { id } });
    return { success: true };
  }

  // ─── Help Kategorileri ────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Yardım kategorisi oluştur' })
  @ApiBody({ type: CreateHelpCategoryDto })
  @Post('help/categories')
  async createHelpCategory(@Body() dto: CreateHelpCategoryDto) {
    return this.commandBus.execute(new CreateHelpCategoryCommand(dto));
  }

  @ApiOperation({ summary: 'Yardım kategorisi güncelle' })
  @ApiParam({ name: 'id' })
  @Put('help/categories/:id')
  async updateHelpCategory(@Param('id') id: string, @Body() body: any) {
    const updated = await this.prisma.helpCategory.update({
      where: { id },
      data: {
        ...(body.title    !== undefined && { title: body.title }),
        ...(body.slug     !== undefined && { slug: body.slug }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return { success: true, data: updated };
  }

  @ApiOperation({ summary: 'Yardım kategorisi sil' })
  @ApiParam({ name: 'id' })
  @Delete('help/categories/:id')
  async deleteHelpCategory(@Param('id') id: string) {
    await this.prisma.helpCategory.delete({ where: { id } });
    return { success: true };
  }

  // ─── Help Makaleleri ──────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Yardım makalesi oluştur' })
  @ApiBody({ type: CreateHelpArticleDto })
  @Post('help/articles')
  async createHelpArticle(@Body() dto: CreateHelpArticleDto) {
    return this.commandBus.execute(new CreateHelpArticleCommand(dto));
  }

  @ApiOperation({ summary: 'Yardım makalesi güncelle' })
  @ApiParam({ name: 'id' })
  @Put('help/articles/:id')
  async updateHelpArticle(@Param('id') id: string, @Body() body: any) {
    const article = await this.prisma.helpArticle.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Makale bulunamadı');
    const updated = await this.prisma.helpArticle.update({
      where: { id },
      data: {
        ...(body.title    !== undefined && { title: body.title }),
        ...(body.content  !== undefined && { content: body.content }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return { success: true, data: updated };
  }

  @ApiOperation({ summary: 'Yardım makalesi sil' })
  @ApiParam({ name: 'id' })
  @Delete('help/articles/:id')
  async deleteHelpArticle(@Param('id') id: string) {
    await this.prisma.helpArticle.delete({ where: { id } });
    return { success: true };
  }

  // ─── Duyurular ────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Duyuru oluştur' })
  @ApiBody({ type: CreateAnnouncementDto })
  @Post('announcements')
  async createAnnouncement(@Body() dto: CreateAnnouncementDto) {
    return this.commandBus.execute(new CreateAnnouncementCommand(dto));
  }

  @ApiOperation({ summary: 'Duyuru güncelle' })
  @ApiParam({ name: 'id' })
  @Put('announcements/:id')
  async updateAnnouncement(@Param('id') id: string, @Body() body: any) {
    const updated = await this.prisma.announcement.update({
      where: { id },
      data: {
        ...(body.title    !== undefined && { title: body.title }),
        ...(body.content  !== undefined && { content: body.content }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.endDate  !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      },
    });
    return { success: true, data: updated };
  }

  @ApiOperation({ summary: 'Duyuru sil' })
  @ApiParam({ name: 'id' })
  @Delete('announcements/:id')
  async deleteAnnouncement(@Param('id') id: string) {
    await this.prisma.announcement.delete({ where: { id } });
    return { success: true };
  }

  // ─── Politikalar ──────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Politika oluştur' })
  @ApiBody({ type: CreatePolicyDto })
  @Post('policies')
  async createPolicy(@Body() dto: CreatePolicyDto) {
    return this.commandBus.execute(new CreatePolicyCommand(dto));
  }

  @ApiOperation({ summary: 'Politika güncelle' })
  @ApiParam({ name: 'id' })
  @Put('policies/:id')
  async updatePolicy(@Param('id') id: string, @Body() body: any) {
    const updated = await this.prisma.policy.update({
      where: { id },
      data: {
        ...(body.title    !== undefined && { title: body.title }),
        ...(body.content  !== undefined && { content: body.content }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return { success: true, data: updated };
  }

  @ApiOperation({ summary: 'Politika sil' })
  @ApiParam({ name: 'id' })
  @Delete('policies/:id')
  async deletePolicy(@Param('id') id: string) {
    await this.prisma.policy.delete({ where: { id } });
    return { success: true };
  }

  // ─── Dinamik İçerik ───────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Dinamik içerik oluştur' })
  @ApiBody({ type: CreateDynamicContentDto })
  @Post('dynamic')
  async createDynamicContent(@Body() dto: CreateDynamicContentDto) {
    return this.commandBus.execute(new CreateDynamicContentCommand(dto));
  }

  @ApiOperation({ summary: 'Dinamik içerik güncelle' })
  @ApiParam({ name: 'id' })
  @Put('dynamic/:id')
  async updateDynamicContent(@Param('id') id: string, @Body() body: any) {
    const updated = await this.prisma.dynamicContent.update({
      where: { id },
      data: {
        ...(body.title    !== undefined && { title: body.title }),
        ...(body.content  !== undefined && { content: body.content }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return { success: true, data: updated };
  }

  @ApiOperation({ summary: 'Dinamik içerik sil' })
  @ApiParam({ name: 'id' })
  @Delete('dynamic/:id')
  async deleteDynamicContent(@Param('id') id: string) {
    await this.prisma.dynamicContent.delete({ where: { id } });
    return { success: true };
  }

  // ─── SEO ──────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'SEO metadata upsert' })
  @ApiBody({ type: UpsertSeoMetadataDto })
  @Post('seo')
  async upsertSeo(@Body() dto: UpsertSeoMetadataDto) {
    return this.commandBus.execute(new UpsertSeoMetadataCommand(dto));
  }

  @ApiOperation({ summary: 'SEO metadata sil' })
  @ApiParam({ name: 'id' })
  @Delete('seo/:id')
  async deleteSeo(@Param('id') id: string) {
    await this.prisma.seoMetadata.delete({ where: { id } });
    return { success: true };
  }
}
