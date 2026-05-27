// apps/backend/src/modules/content/presentation/content-admin.controller.ts

import {
  Controller, Post, Get, Put, Delete,
  Body, Param, UseGuards, NotFoundException,
} from '@nestjs/common';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import {
  IAnnouncement, IPolicy, IDynamicContent, ISeoMetadata,
  IHelpCategory, IHelpArticle, IHomeQuadCard, IHomeQuadCardItem,
} from '@barterborsa/shared-persistence';
import { CreateQuadCardCommand }       from '../application/commands/create-quad-card.command';
import { CreateHelpCategoryCommand }   from '../application/commands/create-help-category.command';
import { CreateHelpArticleCommand }    from '../application/commands/create-help-article.command';
import { CreateAnnouncementCommand }   from '../application/commands/create-announcement.command';
import { CreatePolicyCommand }         from '../application/commands/create-policy.command';
import { CreateDynamicContentCommand } from '../application/commands/create-dynamic-content.command';
import { UpsertSeoMetadataCommand }    from '../application/commands/upsert-seo-metadata.command';
class UpdateHelpCategoryDto {
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsString() @MaxLength(200) slug?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
class UpdateHelpArticleDto {
  @IsOptional() @IsString() @MaxLength(500) title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
class UpdateAnnouncementDto {
  @IsOptional() @IsString() @MaxLength(300) title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() endDate?: string;
}
class UpdatePolicyDto {
  @IsOptional() @IsString() @MaxLength(300) title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
class UpdateDynamicContentDto {
  @IsOptional() @IsString() @MaxLength(300) title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

import { CreateQuadCardDto }           from '../application/dtos/create-quad-card.dto';
import { UpdateQuadCardsDto }          from '../application/dtos/update-quad-cards.dto';
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
    @InjectModel('HomeQuadCard')     private readonly quadCardModel:    Model<IHomeQuadCard>,
    @InjectModel('HomeQuadCardItem') private readonly quadCardItemModel:Model<IHomeQuadCardItem>,
    @InjectModel('HelpCategory')     private readonly helpCategoryModel:Model<IHelpCategory>,
    @InjectModel('HelpArticle')      private readonly helpArticleModel: Model<IHelpArticle>,
    @InjectModel('Announcement')     private readonly announcementModel:Model<IAnnouncement>,
    @InjectModel('Policy')           private readonly policyModel:      Model<IPolicy>,
    @InjectModel('DynamicContent')   private readonly dynamicModel:     Model<IDynamicContent>,
    @InjectModel('SeoMetadata')      private readonly seoModel:         Model<ISeoMetadata>,
    @InjectConnection()              private readonly connection:        Connection,
  ) {}

  @ApiOperation({ summary: 'Quad card listesi' })
  @Get('quad-cards')
  async getQuadCards() {
    const cards = await this.quadCardModel.find().sort({ order: 1 }).lean();
    const cardIds = cards.map(c => c.id);
    const items = await this.quadCardItemModel.find({ quadCardId: { $in: cardIds } }).lean();
    const itemsByCard = new Map<string, typeof items>(cardIds.map(id => [id, []]));
    items.forEach(i => itemsByCard.get(i.quadCardId)?.push(i));
    const data = cards.map(c => ({ ...c, items: itemsByCard.get(c.id) ?? [] }));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Quad cardları toplu güncelle/oluştur' })
  @Post('quad-cards')
  async updateQuadCards(@Body() dto: UpdateQuadCardsDto) {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.quadCardItemModel.deleteMany({}, { session });
        await this.quadCardModel.deleteMany({}, { session });
        for (const card of dto.cards) {
          const cardId = new Types.ObjectId().toString();
          await this.quadCardModel.create(
            [{ _id: cardId, id: cardId, title: card.title, link: card.link, order: card.order, isActive: card.isActive, platform: card.platform }],
            { session },
          );
          if (card.items?.length) {
            const itemDocs = (card.items as unknown as Record<string, unknown>[]).map((item: Record<string, unknown>, idx: number) => {
              const itemId = new Types.ObjectId().toString();
              return { _id: itemId, id: itemId, quadCardId: cardId, title: item.title, image: item.image, link: item.link, productId: item.productId, order: idx };
            });
            await this.quadCardItemModel.insertMany(itemDocs, { session });
          }
        }
      });
    } finally {
      await session.endSession();
    }
    return { success: true };
  }

  @Delete('quad-cards/:id')
  async deleteQuadCard(@Param('id') id: string) {
    await this.quadCardModel.deleteOne({ id });
    return { success: true };
  }

  @Post('help/categories')
  async createHelpCategory(@Body() dto: CreateHelpCategoryDto) {
    return this.commandBus.execute(new CreateHelpCategoryCommand(dto));
  }

  @Put('help/categories/:id')
  async updateHelpCategory(@Param('id') id: string, @Body() body: UpdateHelpCategoryDto) {
    const upd: Record<string, unknown> = {};
    if (body.title    !== undefined) upd.title    = body.title;
    if (body.slug     !== undefined) upd.slug     = body.slug;
    if (body.isActive !== undefined) upd.isActive = body.isActive;
    const updated = await this.helpCategoryModel.findOneAndUpdate({ id }, { $set: upd }, { new: true }).lean();
    return { success: true, data: updated };
  }

  @Delete('help/categories/:id')
  async deleteHelpCategory(@Param('id') id: string) {
    await this.helpCategoryModel.deleteOne({ id });
    return { success: true };
  }

  @Post('help/articles')
  async createHelpArticle(@Body() dto: CreateHelpArticleDto) {
    return this.commandBus.execute(new CreateHelpArticleCommand(dto));
  }

  @Put('help/articles/:id')
  async updateHelpArticle(@Param('id') id: string, @Body() body: UpdateHelpArticleDto) {
    const article = await this.helpArticleModel.findOne({ id }).lean();
    if (!article) throw new NotFoundException('Makale bulunamadı');
    const upd: Record<string, unknown> = {};
    if (body.title    !== undefined) upd.title    = body.title;
    if (body.content  !== undefined) upd.content  = body.content;
    if (body.isActive !== undefined) upd.isActive = body.isActive;
    const updated = await this.helpArticleModel.findOneAndUpdate({ id }, { $set: upd }, { new: true }).lean();
    return { success: true, data: updated };
  }

  @Delete('help/articles/:id')
  async deleteHelpArticle(@Param('id') id: string) {
    await this.helpArticleModel.deleteOne({ id });
    return { success: true };
  }

  @Post('announcements')
  async createAnnouncement(@Body() dto: CreateAnnouncementDto) {
    return this.commandBus.execute(new CreateAnnouncementCommand(dto));
  }

  @Put('announcements/:id')
  async updateAnnouncement(@Param('id') id: string, @Body() body: UpdateAnnouncementDto) {
    const upd: Record<string, unknown> = {};
    if (body.title    !== undefined) upd.title    = body.title;
    if (body.content  !== undefined) upd.content  = body.content;
    if (body.isActive !== undefined) upd.isActive = body.isActive;
    if (body.endDate  !== undefined) upd.endDate  = body.endDate ? new Date(String(body.endDate)) : null;
    const updated = await this.announcementModel.findOneAndUpdate({ id }, { $set: upd }, { new: true }).lean();
    return { success: true, data: updated };
  }

  @Delete('announcements/:id')
  async deleteAnnouncement(@Param('id') id: string) {
    await this.announcementModel.deleteOne({ id });
    return { success: true };
  }

  @Post('policies')
  async createPolicy(@Body() dto: CreatePolicyDto) {
    return this.commandBus.execute(new CreatePolicyCommand(dto));
  }

  @Put('policies/:id')
  async updatePolicy(@Param('id') id: string, @Body() body: UpdatePolicyDto) {
    const upd: Record<string, unknown> = {};
    if (body.title    !== undefined) upd.title    = body.title;
    if (body.content  !== undefined) upd.content  = body.content;
    if (body.isActive !== undefined) upd.isActive = body.isActive;
    const updated = await this.policyModel.findOneAndUpdate({ id }, { $set: upd }, { new: true }).lean();
    return { success: true, data: updated };
  }

  @Delete('policies/:id')
  async deletePolicy(@Param('id') id: string) {
    await this.policyModel.deleteOne({ id });
    return { success: true };
  }

  @Post('dynamic')
  async createDynamicContent(@Body() dto: CreateDynamicContentDto) {
    return this.commandBus.execute(new CreateDynamicContentCommand(dto));
  }

  @Put('dynamic/:id')
  async updateDynamicContent(@Param('id') id: string, @Body() body: UpdateDynamicContentDto) {
    const upd: Record<string, unknown> = {};
    if (body.title    !== undefined) upd.title    = body.title;
    if (body.content  !== undefined) upd.content  = body.content;
    if (body.isActive !== undefined) upd.isActive = body.isActive;
    const updated = await this.dynamicModel.findOneAndUpdate({ id }, { $set: upd }, { new: true }).lean();
    return { success: true, data: updated };
  }

  @Delete('dynamic/:id')
  async deleteDynamicContent(@Param('id') id: string) {
    await this.dynamicModel.deleteOne({ id });
    return { success: true };
  }

  @Get('announcements')
  async getAnnouncements() {
    const data = await this.announcementModel.find().sort({ createdAt: -1 }).lean();
    return { success: true, data };
  }

  @Get('policies')
  async getPolicies() {
    const data = await this.policyModel.find().sort({ createdAt: -1 }).lean();
    return { success: true, data };
  }

  @Get('dynamic')
  async getDynamicContents() {
    const data = await this.dynamicModel.find().sort({ createdAt: -1 }).lean();
    return { success: true, data };
  }

  @Post('seo')
  async upsertSeo(@Body() dto: UpsertSeoMetadataDto) {
    return this.commandBus.execute(new UpsertSeoMetadataCommand(dto));
  }

  @Delete('seo/:id')
  async deleteSeo(@Param('id') id: string) {
    await this.seoModel.deleteOne({ id });
    return { success: true };
  }
}
