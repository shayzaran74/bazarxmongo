import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import * as qry from '../application/queries/loyalty.queries';
import * as cmd from '../application/commands/loyalty.commands';

@ApiTags('XP & Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('missions')
export class MissionController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List all missions', description: 'Sistemde tanımlı tüm aktif görevleri listeler.' })
  @ApiResponse({ status: 200, description: 'Görev listesi.' })
  @Get()
  async getAll() { return this.queryBus.execute(new qry.GetMissionsQuery()); }

  @ApiOperation({ summary: 'Get my missions', description: 'Kullanıcının aktif görevlerini ve ilerleme durumlarını döner.' })
  @ApiResponse({ status: 200, description: 'Kullanıcı görev listesi.' })
  @Get('my')
  async getMy(@CurrentUser() user: any) { return this.queryBus.execute(new qry.GetUserMissionsQuery(user.id)); }
}

@ApiTags('XP & Loyalty')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/loyalty')
export class LoyaltyAdminController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List spending rules (Admin)', description: 'XP harcama kurallarını ve limitlerini listeler.' })
  @ApiResponse({ status: 200, description: 'Harcama kuralları listesi.' })
  @Get('spending-rules')
  async getSpendingRules() { return []; } 

  @ApiOperation({ summary: 'Grant XP to user (Admin)', description: 'Yönetici tarafından bir kullanıcıya manuel XP ödülü verir.' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        amount: { type: 'number' },
        type: { type: 'string' }
      },
      required: ['userId', 'amount', 'type']
    }
  })
  @ApiResponse({ status: 201, description: 'XP başarıyla verildi.' })
  @Post('grant-xp')
  async grantXp(@Body() dto: any) { return this.commandBus.execute(new cmd.EarnXpCommand(dto.userId, dto.amount, dto.type)); }

  @ApiOperation({ summary: 'Expire old XP batches (Admin)', description: 'Süresi dolmuş XP paketlerini sistemden temizler (Yıllık/Dönemsel).' })
  @ApiResponse({ status: 201, description: 'İşlem başlatıldı.' })
  @Post('expire-batches')
  async expireBatches() { return this.commandBus.execute(new cmd.ExpireXpBatchesCommand()); }
}
