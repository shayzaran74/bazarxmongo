// apps/backend/src/modules/vendor/presentation/company.controller.ts
import { Controller, Post, Body, Get,
         Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse,
         ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateCompanyCommand }
  from '../application/commands/create-company.command';
import { CreateCompanyDto }
  from '../application/dtos/create-company.dto';
import { GetCompanyQuery }
  from '../application/queries/get-company.query';
import { GetMyCompanyQuery }
  from '../application/queries/get-my-company.query';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
}

@ApiTags('Companies')
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user company' })
  @Get('me')
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    if (!user?.id) {
      return { success: false, message: 'Oturum bilgisi bulunamadı.' };
    }

    const result = await this.queryBus.execute(
      new GetMyCompanyQuery(user.id, user.role)
    );

    if (!result) {
      return { success: false, message: 'Kullanıcı kaydı bulunamadı.' };
    }

    if (result.isSystemAdmin) {
      return { success: true, data: null, isSystemAdmin: true };
    }

    // Satıcı otomatik onay mantığı: Eğer satıcı ise ve şirket kaydı yoksa/onaylı değilse bile devam et
    let company: Record<string, unknown> | null = null;
    if (result.companyId) {
      try {
        company = await this.queryBus.execute(new GetCompanyQuery(result.companyId));
      } catch {
        // şirket kaydı henüz oluşturulmamış olabilir
      }
    }

    if (result.isVendor) {
      return {
        success: true,
        company: {
          id: result.companyId || result.vendorId,
          name: (company as Record<string, unknown> | null)?.['name'] || 'Satıcı Hesabı',
          status: 'APPROVED',
          isVendorAutoApproved: true,
        },
        data: company || { name: 'Satıcı Hesabı', status: 'APPROVED' },
      };
    }

    if (!result.companyId) {
      return { success: false, message: 'Şirket kaydı bulunamadı.' };
    }

    return { success: true, data: company, company };
  }

  @ApiOperation({ summary: 'Register a company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiBearerAuth()
  @ApiResponse({ status: 201 })
  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    return this.commandBus.execute(new CreateCompanyCommand(dto));
  }

  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetCompanyQuery(id));
    if (!result) return { success: false, message: 'Şirket bulunamadı.' };
    return { success: true, data: result };
  }
}
