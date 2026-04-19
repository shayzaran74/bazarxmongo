import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
export class PaymentController {
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Subscribe to premium', description: 'Premium üyelik aboneliği başlatır.' })
  @Post('premium/subscribe')
  async subscribe(@CurrentUser() user: any, @Body() dto: any) {
    return {
      success: true,
      message: 'Abonelik işlemi başlatıldı.',
      data: {
        subscriptionId: 'sub_dummy_123',
        status: 'PENDING'
      }
    };
  }
}
