// apps/backend/src/modules/loyalty/presentation/mission-admin.controllers.ts

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CurrentUser, Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { GetMissionsQuery } from '../application/queries/get-missions.query';
import { GetUserMissionsQuery } from '../application/queries/get-user-missions.query';
import { EarnXpCommand } from '../application/commands/earn-xp.command';
import { ExpireXpBatchesCommand } from '../application/commands/expire-xp-batches.command';

@ApiTags('Missions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('missions')
export class MissionController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List all missions' }) @ApiResponse({ status: 200 })
  @Get()
  async getAll() { return this.queryBus.execute(new GetMissionsQuery()); }

  @ApiOperation({ summary: 'Get my missions' }) @ApiResponse({ status: 200 })
  @Get('my')
  async getMy(@CurrentUser() user: any) { return this.queryBus.execute(new GetUserMissionsQuery(user.id)); }
}

@ApiTags('Loyalty Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/loyalty')
export class LoyaltyAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'List spending rules' }) @ApiResponse({ status: 200 })
  @Get('spending-rules')
  async getSpendingRules() { 
    return this.prisma.xpSpendingLimitRule.findMany(); 
  }

  @ApiOperation({ summary: 'Grant XP to user' })
  @ApiBody({ schema: { type: 'object', properties: { userId: { type: 'string' }, amount: { type: 'number' }, type: { type: 'string' } }, required: ['userId', 'amount', 'type'] } })
  @ApiResponse({ status: 201 })
  @Post('grant-xp')
  async grantXp(@Body() dto: any) { return this.commandBus.execute(new EarnXpCommand(dto.userId, dto.amount, dto.type)); }

  @ApiOperation({ summary: 'Expire old XP batches' }) @ApiResponse({ status: 201 })
  @Post('expire-batches')
  async expireBatches() { return this.commandBus.execute(new ExpireXpBatchesCommand()); }
}
