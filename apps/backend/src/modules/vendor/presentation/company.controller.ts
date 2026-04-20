import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiParam,
  ApiBearerAuth
} from '@nestjs/swagger';
import { CreateCompanyCommand } from '../application/commands/create-company.command';
import { CreateCompanyDto } from '../application/dtos/create-company.dto';
import { GetCompanyQuery } from '../application/queries/get-company.query';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user company', description: 'Giriş yapmış kullanıcının şirket bilgilerini döner.' })
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    console.log('--- GET ME CALLED BEGIN ---');
    try {
      console.log('--- USER FROM DECORATOR ---', JSON.stringify(user));
      
      if (!user?.id) {
        console.error('❌ CompanyController: No user ID');
        return { success: false, message: 'Oturum bilgisi bulunamadı.' };
      }

      console.log('--- FETCHING VENDOR ---', user.id);
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId: user.id }
      });

      if (!vendor) {
        console.warn('⚠️ CompanyController: Vendor NOT FOUND for user', user.id);
        return { success: false, message: 'Satıcı kaydı bulunamadı.' };
      }

      if (!vendor.companyId) {
        console.warn('⚠️ CompanyController: No companyId for vendor', vendor.id);
        return { success: false, message: 'Şirket kaydı bulunamadı.' };
      }

      console.log('--- EXECUTING GetCompanyQuery ---', vendor.companyId);
      const result = await this.queryBus.execute(new GetCompanyQuery(vendor.companyId));
      console.log('--- GetCompanyQuery RESULT ---', JSON.stringify(result));
      
      return { success: true, data: result };
    } catch (error: any) {
      console.error('❌ CompanyController CRASH:', error.stack || error);
      return { success: false, error: error.message };
    }
  }

  @ApiOperation({ summary: 'Register a company', description: 'Sisteme yeni bir şirket tanımlar.' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 201, description: 'Şirket başarıyla oluşturuldu.' })
  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    return this.commandBus.execute(new CreateCompanyCommand(dto));
  }

  @ApiOperation({ summary: 'Get company by ID', description: 'ID bilgisi verilen şirketin detaylarını döner.' })
  @ApiParam({ name: 'id', description: 'Şirket ID' })
  @ApiResponse({ status: 200, description: 'Şirket detayları.' })
  @ApiResponse({ status: 404, description: 'Şirket bulunamadı.' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetCompanyQuery(id));
    if (!result) return { success: false, message: 'Şirket bulunamadı.' };
    return { success: true, data: result };
  }
}
