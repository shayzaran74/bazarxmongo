import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { GetHomeQuadCardsQuery } from '../application/queries/content.queries';

@ApiTags('Home Content')
@Controller('home-quad-cards')
export class HomeQuadCardsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @ApiOperation({ summary: 'List home quad cards', description: 'Ana sayfada gösterilecek 4lü kart grubunu döner.' })
  @ApiResponse({ status: 200, description: 'Kart listesi.' })
  @Get()
  async getQuadCards(@Query('platform') platform: string = 'BAZARX') {
    return this.queryBus.execute(new GetHomeQuadCardsQuery(platform));
  }
}
