// apps/backend/src/modules/menu/presentation/menu-redeem.controller.ts
// Restoran personeli QR tarama endpoint'i

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { RedeemMenuCommand } from '../application/commands/redeem-menu.command';

interface AuthenticatedUser { id: string; role: string; }

@ApiTags('Menu Redeem')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
@Controller('menu/redeem')
export class MenuRedeemController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'QR kodu tarama (restoran personeli)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { qrCode: { type: 'string', example: 'MENU-ABC123' } },
      required: ['qrCode'],
    },
  })
  @Post()
  async redeemQr(
    @Body('qrCode') qrCode: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commandBus.execute(new RedeemMenuCommand(qrCode, user.id));
  }
}
