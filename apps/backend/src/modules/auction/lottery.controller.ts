import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';

@ApiTags('Lotteries')
@Controller('lotteries')
export class LotteryController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get active lotteries' })
  async getActiveLotteries(@Query() query: any) {
    return { success: true, data: [], total: 0 }
  }
}
