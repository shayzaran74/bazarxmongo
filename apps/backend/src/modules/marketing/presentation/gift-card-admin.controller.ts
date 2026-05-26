import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { FinancialGatewayService } from '../../financial-gateway/financial-gateway.service';

interface GiftCardResponse {
  id: string;
  code: string;
  initialValue: number;
  currentValue: number;
  currency?: string;
  expiresAt?: string;
  status?: string;
  createdAt?: string;
}

interface GiftCardListItem {
  id: string;
  code: string;
  initialValue: number;
  currentValue: number;
  currency?: string;
  status?: string;
}

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
    const data = await this.financialGateway.getGiftCard(id) as Record<string, unknown> | null;
    if (!data) return { success: false, message: 'Gift card not found' };
    return {
      success: true,
      data: {
        id: data.id as string,
        code: data.code as string,
        initialValue: Number(data.initialValue || 0),
        currentValue: Number(data.currentValue || 0),
        currency: data.currency as string | undefined,
        expiresAt: data.expiresAt as string | undefined,
        status: data.status as string | undefined,
        createdAt: data.createdAt as string | undefined,
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
    const data = await this.financialGateway.listGiftCards({
      customerId: customerId?.trim() || undefined,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    }) as { items: GiftCardListItem[]; total: number };

    const items: GiftCardResponse[] = (data.items || []).map((item: GiftCardListItem) => ({
      id: item.id || '',
      code: item.code || '',
      initialValue: Number(item.initialValue || 0),
      currentValue: Number(item.currentValue || 0),
      currency: item.currency,
      status: item.status,
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
