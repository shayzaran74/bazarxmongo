// apps/backend/src/modules/communication/presentation/chat-admin.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { IChatRoom, ITradeOffer } from '@barterborsa/shared-persistence';

@ApiTags('Chat Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/chat')
export class ChatAdminController {
  constructor(
    @InjectModel('ChatRoom')   private readonly chatRoomModel: Model<IChatRoom>,
    @InjectModel('TradeOffer') private readonly tradeModel:    Model<ITradeOffer>,
  ) {}

  @ApiOperation({ summary: 'Tüm chat odaları (Admin)' })
  @Get('rooms')
  async getChats(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<{ success: boolean; data: unknown[]; pagination: { total: number; page: number; limit: number } }> {
    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [chats, total] = await Promise.all([
      this.chatRoomModel.find(where).skip(skip).limit(take).sort({ createdAt: -1 }).lean(),
      this.chatRoomModel.countDocuments(where),
    ]);

    const tradeOfferIds = chats.map(r => (r as Record<string, unknown>).tradeOfferId).filter(Boolean);
    const tradeOffers   = await this.tradeModel.find({ id: { $in: tradeOfferIds } }).lean();
    const tradeMap      = new Map(tradeOffers.map(t => [t.id, t]));

    const data = chats.map(room => {
      const tradeOfferId = (room as Record<string, unknown>).tradeOfferId as string | undefined;
      const tradeOffer   = tradeOfferId ? tradeMap.get(tradeOfferId) ?? { fromCompany: { name: 'Bilinmeyen' }, toCompany: { name: 'Bilinmeyen' }, status: 'unknown' } : null;
      return { ...room, tradeOffer, riskScore: 0 };
    });

    return {
      success: true,
      data,
      pagination: { page: parseInt(page, 10), limit: take, total },
    };
  }
}
