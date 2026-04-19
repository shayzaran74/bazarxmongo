import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { QueryBus } from '@nestjs/cqrs';
import { GetPoliciesQuery } from '../application/queries/content.queries';

@ApiTags('Legal')
@Controller('legal')
export class LegalController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @ApiOperation({ summary: 'List legal policies', description: 'Kullanım koşulları, gizlilik politikası vb. yasal metinleri döner.' })
  @ApiResponse({ status: 200, description: 'Yasal metin listesi.' })
  @Get()
  async getLegalList() {
    return this.queryBus.execute(new GetPoliciesQuery());
  }
}
