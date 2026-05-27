// apps/backend/src/modules/content/presentation/help-admin.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { IHelpArticle, IHelpCategory } from '@barterborsa/shared-persistence';

@ApiTags('Help Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/help')
export class HelpAdminController {
  constructor(
    @InjectModel('HelpArticle')  private readonly articleModel:  Model<IHelpArticle>,
    @InjectModel('HelpCategory') private readonly categoryModel: Model<IHelpCategory>,
  ) {}

  @Get('articles')
  async getArticles() {
    const items = await this.articleModel.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: items };
  }

  @Get('categories')
  async getCategories() {
    const items = await this.categoryModel.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: items };
  }
}
