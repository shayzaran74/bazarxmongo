import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Help Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/help')
export class HelpAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('articles')
  async getArticles() {
    const items = await this.prisma.helpArticle.findMany({ 
      include: { helpCategory: true },
      orderBy: { createdAt: 'desc' } 
    });
    return { success: true, data: items };
  }

  @Get('categories')
  async getCategories() {
    const items = await this.prisma.helpCategory.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
    return { success: true, data: items };
  }
}
