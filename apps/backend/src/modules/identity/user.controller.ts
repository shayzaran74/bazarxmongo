import { Controller, Get, Post, Body, UseGuards, Req, Query, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { 
  GetUserQuery, 
  ListUsersQuery, 
  SetTransactionPinCommand 
} from '@barterborsa/domain-identity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: 'Get current user profile', description: 'Oturum açmış kullanıcının bilgilerini döner.' })
  @ApiResponse({ status: 200, description: 'Kullanıcı bilgileri.' })
  @ApiResponse({ status: 401, description: 'Yetkilendirme gerekli.' })
  @Get('me')
  async getMe(@Req() req: any) {
    return this.queryBus.execute(new GetUserQuery(req.user.id));
  }

  @ApiOperation({ summary: 'Set transaction PIN', description: 'Finansal işlemler için ikincil güvenlik şifresi (PIN) belirler.' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        pin: { type: 'string', minLength: 4, maxLength: 6, example: '1234' }
      },
      required: ['pin']
    }
  })
  @ApiResponse({ status: 200, description: 'PIN başarıyla belirlendi.' })
  @Post('transaction-pin')
  async setPin(@Req() req: any, @Body('pin') pin: string) {
    return this.commandBus.execute(new SetTransactionPinCommand(req.user.id, pin));
  }

  @ApiOperation({ summary: 'List all users (Admin)', description: 'Sistemdeki tüm kullanıcıları listeler. Sayfalama ve filtreleme destekler.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Kullanıcı listesi.' })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim.' })
  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  async listUsers(@Query() query: any) {
    return this.queryBus.execute(new ListUsersQuery(query, query));
  }

  @ApiOperation({ summary: 'Get user by ID (Admin)', description: 'ID bilgisi verilen kullanıcının detaylarını döner.' })
  @ApiParam({ name: 'id', description: 'Kullanıcı ID' })
  @ApiResponse({ status: 200, description: 'Kullanıcı detayları.' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı.' })
  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  async getUser(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }
}
