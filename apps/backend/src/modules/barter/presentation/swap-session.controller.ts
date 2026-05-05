// apps/backend/src/modules/barter/presentation/swap-session.controller.ts

import {
  Controller, Get, Post, Body, Param,
  UseGuards, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { SubmitShippingCommand } from '../application/commands/submit-shipping.command';
import { ConfirmReceiptCommand } from '../application/commands/confirm-receipt.command';
import { FinalizeSwapCommand } from '../application/commands/finalize-swap.command';
import { OpenDisputeCommand } from '../application/commands/open-dispute.command';
import { ResolveDisputeCommand } from '../application/commands/resolve-dispute.command';
import { SwapShippingDto } from './dto/swap-shipping.dto';
import { SwapDisputeDto } from './dto/swap-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { Patch } from '@nestjs/common';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
}

@ApiTags('Swap Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('barter/swap')
export class SwapSessionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Swap session detayını getir' })
  @ApiParam({ name: 'id', description: 'SwapSession ID' })
  @Get(':id')
  async getSession(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const vendorId = await this.resolveVendorId(user);

    const session = await this.prisma.swapSession.findUnique({
      where: { id },
      include: {
        parts: true,
        tradeOffer: {
          include: {
            fromCompany: { select: { id: true, name: true, logo: true } },
            toCompany:   { select: { id: true, name: true, logo: true } },
            offeredItems:   true,
            requestedItems: true,
          },
        },
      },
    });

    if (!session) throw new NotFoundException('Swap session bulunamadı.');

    // Sadece session'a dahil olan vendor görebilir
    if (session.initiatorId !== vendorId && session.receiverId !== vendorId) {
      throw new ForbiddenException('Bu swap session\'a erişim yetkiniz yok.');
    }

    return { success: true, data: session };
  }

  @ApiOperation({ summary: 'Kargo bilgisi gönder' })
  @ApiParam({ name: 'id' })
  @Post(':id/ship')
  async submitShipping(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SwapShippingDto,
  ) {
    const vendorId = await this.resolveVendorId(user);
    return this.commandBus.execute(
      new SubmitShippingCommand(id, user.id, vendorId, dto.trackingCode, dto.carrier),
    );
  }

  @ApiOperation({ summary: 'Teslimat al — ürünü teslim aldım' })
  @ApiParam({ name: 'id' })
  @Post(':id/confirm')
  async confirmReceipt(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const vendorId = await this.resolveVendorId(user);
    return this.commandBus.execute(new ConfirmReceiptCommand(id, user.id, vendorId));
  }

  @ApiOperation({ summary: 'Swap\'ı sonlandır ve teminatları serbest bırak' })
  @ApiParam({ name: 'id' })
  @Post(':id/finalize')
  async finalizeSwap(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const vendorId = await this.resolveVendorId(user);
    return this.commandBus.execute(new FinalizeSwapCommand(id, user.id, vendorId));
  }

  @ApiOperation({ summary: 'Anlaşmazlık bildir' })
  @ApiParam({ name: 'id' })
  @Post(':id/dispute')
  async openDispute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SwapDisputeDto,
  ) {
    const vendorId = await this.resolveVendorId(user);
    return this.commandBus.execute(new OpenDisputeCommand(id, user.id, vendorId, dto.reason));
  }

  @ApiOperation({ summary: 'Anlaşmazlığı çözümle (Sadece Admin)' })
  @ApiParam({ name: 'id' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  @Patch(':id/resolve')
  async resolveDispute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.commandBus.execute(
      new ResolveDisputeCommand(id, user.id, dto.result, dto.adminNote),
    );
  }

  // ─── Yardımcı ─────────────────────────────────────────────────────────────

  private async resolveVendorId(user: AuthenticatedUser): Promise<string> {
    if (user.vendorId) return user.vendorId;

    const vendor = await this.prisma.vendor.findFirst({ where: { userId: user.id } });
    if (!vendor) throw new ForbiddenException('Satıcı profiliniz bulunamadı.');
    return vendor.id;
  }
}
