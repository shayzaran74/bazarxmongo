import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  @Public()
  @Post('track')
  async track() {
    return { success: true };
  }
}
