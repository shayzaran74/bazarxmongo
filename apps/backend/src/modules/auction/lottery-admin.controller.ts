// apps/backend/src/modules/auction/lottery-admin.controller.ts

import { Controller, Get, Post, Put, Body, Param, UseGuards, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Admin/Lotteries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin/lotteries')
export class LotteryAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Tüm çekilişleri listele (Admin)' })
  @Get()
  async getLotteries(@Query() query: any) {
    const { status, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.lottery.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          listing: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.lottery.count({ where })
    ]);

    return { success: true, data: { items, total } };
  }

  @ApiOperation({ summary: 'Çekilişi sonlandır ve kazananı belirle' })
  @Post(':id/end')
  async endLottery(@Param('id') id: string) {
    // Note: In a real system, this would trigger a background job or command
    // For now, we update status and placeholder logic
    const lottery = await this.prisma.lottery.update({
      where: { id },
      data: { status: 'ENDED' }
    });
    return { success: true, data: lottery };
  }

  @ApiOperation({ summary: 'Çekilişi sil' })
  @Delete(':id')
  async deleteLottery(@Param('id') id: string) {
    await this.prisma.lottery.delete({ where: { id } });
    return { success: true };
  }
}
