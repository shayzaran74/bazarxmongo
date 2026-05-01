import { Controller, Get, Post, Put, Patch, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { 
  UpdateProfileDto, 
  UpdateProfileCommand, 
  GetProfileQuery, 
  ChangePasswordDto, 
  ChangePasswordCommand 
} from '@barterborsa/domain-identity';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('user/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: 'Get user profile', description: 'Kullanıcının detaylı profil bilgilerini döner.' })
  @ApiResponse({ status: 200, description: 'Profil bilgileri.' })
  @Get()
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    return this.queryBus.execute(new GetProfileQuery(userId));
  }

  @ApiOperation({ summary: 'Update user profile', description: 'Kullanıcının profil bilgilerini günceller.' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profil başarıyla güncellendi.' })
  @Put()
  @Patch()
  @Post()
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.commandBus.execute(new UpdateProfileCommand(userId, dto));
  }

  @ApiOperation({ summary: 'Change password', description: 'Kullanıcının mevcut şifresini yenisiyle değiştirir.' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Şifre başarıyla değiştirildi.' })
  @ApiResponse({ status: 400, description: 'Mevcut şifre hatalı veya yeni şifre kriterlere uymuyor.' })
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user.id;
    const result = await this.commandBus.execute(new ChangePasswordCommand(userId, dto));
    if (!result.success) {
      throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
    }
    return {
      success: true,
      message: 'Şifreniz başarıyla değiştirildi.',
    };
  }
}
