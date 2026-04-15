import { Controller, Get, Post, Body, UseGuards, Req, Query, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { 
  GetUserQuery, 
  ListUsersQuery, 
  SetTransactionPinCommand 
} from '@barterborsa/domain-identity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get('me')
  async getMe(@Req() req: any) {
    return this.queryBus.execute(new GetUserQuery(req.user.id));
  }

  @Post('transaction-pin')
  async setPin(@Req() req: any, @Body('pin') pin: string) {
    return this.commandBus.execute(new SetTransactionPinCommand(req.user.id, pin));
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  async listUsers(@Query() query: any) {
    return this.queryBus.execute(new ListUsersQuery(query, query));
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  async getUser(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }
}
