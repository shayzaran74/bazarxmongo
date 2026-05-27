import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { QueryBus } from '@nestjs/cqrs';
import { GetPoliciesQuery } from '../application/queries/get-policies.query';
import { GetPolicyBySlugQuery } from '../application/queries/get-policy-by-slug.query';

@ApiTags('Legal')
@Controller('legal')
export class LegalController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @ApiOperation({ summary: 'List legal policies', description: 'Kullanım koşulları, gizlilik politikası vb. yasal metinleri döner.' })
  @ApiResponse({ status: 200, description: 'Yasal metin listesi.' })
  @Get()
  async getLegalList() {
    const data = await this.queryBus.execute(new GetPoliciesQuery());
    return { success: true, data };
  }

  @Public()
  @ApiOperation({ summary: 'Get legal policy by slug', description: 'Slug bilgisi verilen yasal metni döner.' })
  @Get(':slug')
  async getLegalBySlug(@Param('slug') slug: string) {
    const data = await this.queryBus.execute(new GetPolicyBySlugQuery(slug));
    return { success: true, data };
  }
}
