// apps/backend/src/modules/vendor/presentation/company.controller.ts
import { Controller, Post, Body, Get, Patch,
         Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse,
         ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateCompanyCommand }
  from '../application/commands/create-company.command';
import { UpdateCompanyStatusCommand }
  from '../application/commands/update-company-status.command';
import { CreateCompanyDto }
  from '../application/dtos/create-company.dto';
import { UpdateCompanyStatusDto }
  from '../application/dtos/update-company-status.dto';
import { GetCompanyQuery }
  from '../application/queries/get-company.query';
import { GetMyCompanyQuery }
  from '../application/queries/get-my-company.query';
import { GetPendingCompaniesQuery }
  from '../application/queries/get-pending-companies.query';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';

interface AuthenticatedUser {
  id: string;
  role: string;
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
  async getMe(@CurrentUser() user: any) {
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
    if (result.isVendor) {
      const company = result.companyId ? await this.queryBus.execute(new GetCompanyQuery(result.companyId)) : null;
      
      return { 
        success: true, 
        company: {
          id: result.companyId || result.vendorId || 'v-' + result.id,
          name: company?.name || result.businessName || result.name || 'Satıcı Hesabı',
          status: 'APPROVED',
          isVendorAutoApproved: true
        },
        data: company || { name: result.businessName || 'Satıcı Hesabı' }
      };
    }

    if (!result.companyId) {
      return { success: false, message: 'Şirket kaydı bulunamadı.' };
    }

    const company = await this.queryBus.execute(
      new GetCompanyQuery(result.companyId)
    );
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

  @ApiOperation({ summary: 'Get pending companies' })
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('pending')
  async getPending() {
    const items = await this.queryBus.execute(
      new GetPendingCompaniesQuery()
    );
    return { success: true, companies: items, data: items };
  }

  @ApiOperation({ summary: 'Update company status (Admin)' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiBody({ type: UpdateCompanyStatusDto })
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyStatusDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    const data = await this.commandBus.execute(
      new UpdateCompanyStatusCommand(id, dto.status, admin.id, dto.rejectionReason),
    );
    return { success: true, data };
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
