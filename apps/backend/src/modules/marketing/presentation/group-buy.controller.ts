import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';

@ApiTags('Marketing')
@Controller('group-buy')
export class GroupBuyController {
  @Public()
  @ApiOperation({ summary: 'List active group buy deals', description: 'Aktif grup satın alma kampanyalarını döner.' })
  @ApiResponse({ status: 200, description: 'Grup satın alma listesi.' })
  @Get('active')
  async getActiveDeals() {
    return {
      success: true,
      data: [] // Mock for now to prevent 404
    };
  }
}
