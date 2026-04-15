import { Controller, Get, Post, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { UpdateProfileDto, UpdateProfileCommand, GetProfileQuery, ChangePasswordDto, ChangePasswordCommand } from '@barterborsa/domain-identity';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get()
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    return this.queryBus.execute(new GetProfileQuery(userId));
  }

  @Post()
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.commandBus.execute(new UpdateProfileCommand(userId, dto));
  }

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
