import { Controller, Get } from '@nestjs/common';
import { Public } from '@barterborsa/shared-security';

@Controller('campaigns')
export class CampaignController {
  @Public()
  @Get()
  async getCampaigns() {
    return {
      success: true,
      data: []
    };
  }
}
