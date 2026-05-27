// apps/backend/src/modules/identity/profile.controller.ts

import { Controller, Get, Post, Put, Patch, Body, UseGuards, Req, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { IOrder } from '@barterborsa/shared-persistence';
import {
  UpdateProfileDto,
  UpdateProfileCommand,
  GetProfileQuery,
  ChangePasswordDto,
  ChangePasswordCommand,
} from '@barterborsa/domain-identity';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('user/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @InjectModel('Order') private readonly orderModel: Model<IOrder>,
  ) {}

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profil bilgileri.' })
  @Get()
  async getProfile(@Req() req: { user: { id: string } }) {
    const result = await this.queryBus.execute(new GetProfileQuery(req.user.id));
    if (!result.success) {
      throw new HttpException(result.error?.message || 'Profil bilgileri alınamadı', HttpStatus.NOT_FOUND);
    }
    return { success: true, data: result.data };
  }

  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'İstatistik verileri.' })
  @Get('stats')
  async getStats(@Req() req: { user: { id: string } }) {
    const userId = req.user.id;
    this.logger.debug('İstatistik sorgusu başlatıldı', { userId });

    try {
      const [orderCount, completedOrders] = await Promise.all([
        this.orderModel.countDocuments({ userId }),
        this.orderModel.find({ userId, status: 'COMPLETED' }, { totalAmount: 1 }).lean(),
      ]);
      this.logger.debug('İstatistik sorgusu tamamlandı', { userId, orderCount, completedCount: completedOrders.length });

      const totalSpent = completedOrders.reduce(
        (sum, o) => sum + parseFloat(o.totalAmount.toString()),
        0,
      );

      return {
        success: true,
        data: { stats: { orderCount, totalSpent } },
      };
    } catch (error: unknown) {
      this.logger.error('İstatistik sorgusu başarısız', { userId, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profil başarıyla güncellendi.' })
  @Put()
  @Patch()
  async updateProfile(@Req() req: { user: { id: string } }, @Body() dto: UpdateProfileDto) {
    const result = await this.commandBus.execute(new UpdateProfileCommand(req.user.id, dto));
    if (!result.success) {
      throw new HttpException(result.error?.message || 'Profil güncellenirken bir hata oluştu', HttpStatus.BAD_REQUEST);
    }
    return { success: true, data: result.data };
  }

  @ApiOperation({ summary: 'Change password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Şifre başarıyla değiştirildi.' })
  @ApiResponse({ status: 400, description: 'Mevcut şifre hatalı.' })
  @Post('change-password')
  async changePassword(@Req() req: { user: { id: string } }, @Body() dto: ChangePasswordDto) {
    const result = await this.commandBus.execute(new ChangePasswordCommand(req.user.id, dto));
    if (!result.success) {
      throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
    }
    return { success: true, message: 'Şifreniz başarıyla değiştirildi.' };
  }
}
