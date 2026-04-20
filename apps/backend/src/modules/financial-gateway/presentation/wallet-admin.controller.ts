import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';

@ApiTags('Wallet Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/wallet')
export class WalletAdminController {
  @ApiOperation({ summary: 'Get all wallet requests' })
  @Get('requests')
  async getRequests(
    @Query('page') _page: string = '1',
    @Query('limit') _limit: string = '10',
    @Query('status') _status?: string,
    @Query('user') _user?: string,
    @Query('minAmount') _minAmount?: string
  ) {
    return {
      success: true,
      data: {
        items: [],
        total: 0
      }
    };
  }

  @ApiOperation({ summary: 'Get all withdrawals' })
  @Get('withdrawals')
  async getWithdrawals(
    @Query('page') _page: string = '1',
    @Query('limit') _limit: string = '10',
    @Query('status') _status?: string,
    @Query('user') _user?: string,
    @Query('minAmount') _minAmount?: string
  ) {
    return {
      success: true,
      data: {
        items: [],
        total: 0
      }
    };
  }

  @ApiOperation({ summary: 'Get all transactions' })
  @Get('transactions')
  async getTransactions(
    @Query('page') _page: string = '1',
    @Query('limit') _limit: string = '20'
  ) {
    return {
      success: true,
      data: {
        items: [],
        total: 0
      }
    };
  }
}
