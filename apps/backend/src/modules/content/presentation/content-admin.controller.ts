// apps/backend/src/modules/content/presentation/content-admin.controller.ts

import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '@barterborsa/shared-nest';
import * as cmd from '../application/commands/create-content.commands';

@Controller('admin/content')
@Roles('ADMIN')
export class ContentAdminController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post('banners')
  async createBanner(@Body() dto: any) { return this.commandBus.execute(new cmd.CreateHomeBannerCommand(dto)); }

  @Post('quad-cards')
  async createQuadCard(@Body() dto: any) { return this.commandBus.execute(new cmd.CreateQuadCardCommand(dto)); }

  @Post('help/categories')
  async createHelpCategory(@Body() dto: any) { return this.commandBus.execute(new cmd.CreateHelpCategoryCommand(dto)); }

  @Post('help/articles')
  async createHelpArticle(@Body() dto: any) { return this.commandBus.execute(new cmd.CreateHelpArticleCommand(dto)); }

  @Post('announcements')
  async createAnnouncement(@Body() dto: any) { return this.commandBus.execute(new cmd.CreateAnnouncementCommand(dto)); }

  @Post('policies')
  async createPolicy(@Body() dto: any) { return this.commandBus.execute(new cmd.CreatePolicyCommand(dto)); }

  @Post('dynamic')
  async createDynamicContent(@Body() dto: any) { return this.commandBus.execute(new cmd.CreateDynamicContentCommand(dto)); }

  @Post('seo')
  async upsertSeo(@Body() dto: any) { return this.commandBus.execute(new cmd.UpsertSeoMetadataCommand(dto)); }
}
