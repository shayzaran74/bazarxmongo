import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { FinancialGatewayService } from '../../financial-gateway/financial-gateway.service';

@ApiTags('Gift Card Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/gift-cards')
export class GiftCardAdminController {
  constructor(private readonly financialGateway: FinancialGatewayService) {}

  @ApiOperation({ summary: 'Get gift card details' })
  @Get(':id')
  async getGiftCard(@Param('id') id: string) {
    const data: any = await this.financialGateway.getGiftCard(id);
    return {
      success: true,
      data: {
        ...data,
        initialValue: Number(data.initialValue || 0),
        currentValue: Number(data.currentValue || 0),
      }
    };
  }

  @ApiOperation({ summary: 'List gift cards' })
  @Get()
  async listGiftCards(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('user') customerId?: string,
  ) {
    const data: any = await this.financialGateway.listGiftCards({
      customerId,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    
    // Convert string amounts to numbers for frontend safety (toFixed etc.)
    const items = (data.items || []).map((item: any) => ({
      ...item,
      initialValue: Number(item.initialValue || 0),
      currentValue: Number(item.currentValue || 0),
    }));

    return { success: true, data: items, total: data.total };
  }

  @ApiOperation({ summary: 'Create gift card' })
  @Post()
  async createGiftCard(
    @Body() dto: {
      code: string;
      initialValue: number;
      expiresAt?: string;
      customerId?: string;
      note?: string;
    }
  ) {
    const result = await this.financialGateway.createGiftCard({
      code: dto.code,
      amount: dto.initialValue.toString(),
      expiresAt: dto.expiresAt,
      customerId: dto.customerId,
      note: dto.note,
    });

    return { success: true, data: result };
  }
}
