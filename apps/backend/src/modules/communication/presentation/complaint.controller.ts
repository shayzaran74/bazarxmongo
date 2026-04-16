import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CreateComplaintDto } from '../application/dtos/notification-complaint.dtos';
import { CreateComplaintCommand } from '../application/commands/create-complaint.command';

@ApiTags('Complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('complaints')
export class ComplaintController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Submit a new complaint', description: 'Bir kullanıcı, ürün veya ilan hakkında şikayet talebi oluşturur.' })
  @ApiBody({ type: CreateComplaintDto })
  @ApiResponse({ status: 201, description: 'Şikayet başarıyla iletildi.' })
  @Post()
  async createComplaint(@CurrentUser() user: any, @Body() dto: CreateComplaintDto) {
    return this.commandBus.execute(
      new CreateComplaintCommand(user.id, dto.subjectId, dto.reason, dto.description)
    );
  }

  @ApiOperation({ summary: 'Get my complaints', description: 'Kullanıcının geçmişte oluşturduğu şikayetleri listeler.' })
  @ApiResponse({ status: 200, description: 'Şikayet listesi.' })
  @Get()
  async getMyComplaints(@CurrentUser() user: any) {
    // Should be handled by GetComplaintsQuery
    return [];
  }
}
