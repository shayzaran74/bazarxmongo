// apps/backend/src/modules/identity/presentation/admin-user.controller.ts

import { Controller, Get, Query, UseGuards, Param, Patch, Delete, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { IUser, IUserLevel, IMembershipTier } from '@barterborsa/shared-persistence';
import { ListAdminUsersQuery }    from '../application/queries/list-admin-users.query';
import { UpdateUserStatusCommand } from '../application/commands/update-user-status.command';
import { UpdateUserRoleCommand }   from '../application/commands/update-user-role.command';
import { DeleteAdminUserCommand }  from '../application/commands/delete-admin-user.command';
import { EarnXpCommand }           from '../../loyalty/application/commands/earn-xp.command';
import { XpSourceType }            from '../../loyalty/domain/enums/loyalty.enums';

interface AuthenticatedUser { id: string; role: string }

const LOYALTY_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as const;

@ApiTags('Admin Users')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class AdminUserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus:   QueryBus,
    @InjectModel('User')          private readonly userModel:         Model<IUser>,
    @InjectModel('UserLevel')     private readonly userLevelModel:    Model<IUserLevel>,
    @InjectModel('MembershipTier')private readonly membershipTierModel: Model<IMembershipTier>,
  ) {}

  @ApiOperation({ summary: 'Kullanıcı istatistikleri' })
  @Get('stats')
  async getStats() {
    const [total, active, vendors] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ status: 'ACTIVE' }),
      this.userModel.countDocuments({ role: 'VENDOR' }),
    ]);
    return { success: true, data: { total, active, vendors } };
  }

  @ApiOperation({ summary: 'Tüm kullanıcıları listele' })
  @Get()
  async listUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
  ) {
    const result = await this.queryBus.execute(
      new ListAdminUsersQuery({ search, status, role, page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 10 }),
    );
    return { success: true, data: result.items, pagination: result.pagination };
  }

  @ApiOperation({ summary: 'Kullanıcıların loyalty (XP/tier) bilgilerini listele' })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'tier',   required: false, description: 'BRONZE | SILVER | GOLD | PLATINUM | DIAMOND' })
  @ApiQuery({ name: 'search', required: false })
  @Get('loyalty')
  async getLoyaltyList(
    @Query('page')   page  = '1',
    @Query('limit')  limit = '20',
    @Query('tier')   tierFilter?: string,
    @Query('search') search?: string,
  ) {
    const pageNum  = Math.max(1, parseInt(page, 10)  || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 20);
    const skip     = (pageNum - 1) * limitNum;

    // Tüm membership tier tanımlarını al (id → tier adı eşlemesi)
    const tiers = await this.membershipTierModel.find().lean<IMembershipTier[]>();
    const tierMap = new Map(tiers.map(t => [t.id, t.tier]));

    // tier filtresi varsa tierId'yi bul
    let tierIdFilter: string | undefined;
    if (tierFilter && LOYALTY_ORDER.includes(tierFilter as typeof LOYALTY_ORDER[number])) {
      const matchedTier = tiers.find(t => t.tier === tierFilter);
      tierIdFilter = matchedTier?.id;
    }

    // user_levels'ı filtreli sorgula
    const levelFilter: Record<string, unknown> = {};
    if (tierIdFilter) levelFilter['tierId'] = tierIdFilter;

    const [levels, totalLevels] = await Promise.all([
      this.userLevelModel.find(levelFilter).skip(skip).limit(limitNum).lean<IUserLevel[]>(),
      this.userLevelModel.countDocuments(levelFilter),
    ]);

    const userIds = levels.map(l => l.userId).filter(Boolean);

    // Kullanıcı bilgilerini çek
    const userFilter: Record<string, unknown> = { $or: [{ id: { $in: userIds } }, { _id: { $in: userIds } }] };
    if (search) {
      userFilter['$or'] = [
        { email: { $regex: search, $options: 'i' } },
        { id: { $in: userIds } },
      ];
    }
    const users = await this.userModel.find(userFilter, { id: 1, _id: 1, email: 1, role: 1, status: 1 }).lean<IUser[]>();
    const userMap = new Map(users.map(u => [u.id ?? (u as unknown as { _id: string })._id?.toString(), u]));

    const data = levels.map(level => {
      const uid  = level.userId;
      const user = userMap.get(uid);
      const tierName = tierMap.get(level.tierId ?? '') ?? 'BRONZE';

      return {
        userId:     uid,
        email:      user?.email ?? '—',
        role:       user?.role  ?? '—',
        status:     user?.status ?? '—',
        tier:       tierName,
        currentXp:  level.currentXp  ?? 0,
        lifetimeXp: level.lifetimeXp ?? 0,
        level:      level.level       ?? 1,
        isFirstOrder: level.isFirstOrder,
        lastLoginBonusAt: level.lastLoginBonusAt,
      };
    });

    return {
      success: true,
      data,
      pagination: { page: pageNum, limit: limitNum, total: totalLevels },
    };
  }

  @ApiOperation({ summary: 'Kullanıcıya manuel XP ekle (admin)' })
  @Patch(':id/xp')
  async addXp(
    @Param('id') userId: string,
    @Body('amount') amount: number,
    @Body('reason') reason?: string,
    @CurrentUser() admin?: AuthenticatedUser,
  ) {
    if (!amount || amount <= 0) throw new BadRequestException('Geçerli bir XP miktarı giriniz');
    await this.commandBus.execute(
      new EarnXpCommand(userId, amount, XpSourceType.ADMIN_MANUAL, reason),
    );
    return { success: true, message: `${amount} XP eklendi` };
  }

  @ApiOperation({ summary: 'Kullanıcı statüsünü güncelle' })
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.commandBus.execute(new UpdateUserStatusCommand(id, status, admin.id));
  }

  @ApiOperation({ summary: 'Kullanıcı rolünü güncelle' })
  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.commandBus.execute(new UpdateUserRoleCommand(id, role, admin.id));
  }

  @ApiOperation({ summary: 'Kullanıcıyı sil (soft-delete)' })
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.commandBus.execute(new DeleteAdminUserCommand(id, admin.id));
  }

  // ── XP Eşik Konfigürasyonu (§4 Tasarım Notu) ─────────────────────────────

  @ApiOperation({ summary: 'Loyalty tier XP eşiklerini listele' })
  @Get('loyalty/xp-thresholds')
  async getXpThresholds() {
    const tiers = await this.membershipTierModel
      .find({}, { id: 1, tier: 1, minXp: 1, description: 1, rewardMultiplier: 1 })
      .sort({ minXp: 1 })
      .lean<IMembershipTier[]>();
    return { success: true, data: tiers };
  }

  @ApiOperation({ summary: 'Loyalty tier XP eşiğini güncelle (admin)' })
  @Patch('loyalty/xp-thresholds/:tier')
  async updateXpThreshold(
    @Param('tier') tier: string,
    @Body('minXp') minXp: number,
    @Body('description') description?: string,
  ): Promise<{ success: boolean; data: unknown; message: string }> {
    if (!minXp || minXp < 0) {
      throw new BadRequestException('Geçerli bir XP eşiği giriniz (≥0)');
    }

    const update: Record<string, unknown> = { minXp };
    if (description !== undefined) update.description = description;

    const result = await this.membershipTierModel.findOneAndUpdate(
      { tier },
      { $set: update },
      { new: true },
    ).lean();

    if (!result) {
      throw new NotFoundException(`${tier} tier bulunamadı`);
    }

    return {
      success: true,
      data: result,
      message: `${tier} tier XP eşiği ${minXp} olarak güncellendi`,
    };
  }
}
