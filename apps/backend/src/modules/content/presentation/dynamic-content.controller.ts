import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { GetAnnouncementsQuery } from '../application/queries/content.queries';

@ApiTags('Dynamic Content')
@Controller('dynamic')
export class DynamicContentController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @ApiOperation({ summary: 'List announcements', description: 'Duyuruları döner.' })
  @ApiResponse({ status: 200, description: 'Duyuru listesi.' })
  @Get('announcements')
  async getAnnouncements() {
    return this.queryBus.execute(new GetAnnouncementsQuery());
  }

  @Public()
  @ApiOperation({ summary: 'List dynamic contents by category', description: 'Kategori bazlı dinamik içerikleri döner.' })
  @Get('contents')
  async getContents(@Query('category') category: string) {
    // Şimdilik boş liste döner
    return { success: true, data: [] };
  }
}
