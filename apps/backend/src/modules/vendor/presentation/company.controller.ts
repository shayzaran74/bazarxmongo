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
import { GetPendingCompaniesQuery }
  from '../application/queries/get-pending-companies.query';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';

@ApiTags('Companies')
@Controller('companies')
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
      return { success: false, message: 'Satıcı kaydı bulunamadı.' };
    }

    if (result.isSystemAdmin) {
      return { success: true, data: null, isSystemAdmin: true };
    }

    if (!result.companyId) {
      return { success: false, message: 'Şirket kaydı bulunamadı.' };
    }

    const company = await this.queryBus.execute(
      new GetCompanyQuery(result.companyId)
    );
    return { success: true, data: company };
  }

  @ApiOperation({ summary: 'Register a company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 201 })
  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    return this.commandBus.execute(new CreateCompanyCommand(dto));
  }

  @ApiOperation({ summary: 'Get pending companies' })
  @Get('pending')
  async getPending() {
    const items = await this.queryBus.execute(
      new GetPendingCompaniesQuery()
    );
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (id === 'pending') return this.getPending();
    const result = await this.queryBus.execute(new GetCompanyQuery(id));
    if (!result) return { success: false, message: 'Şirket bulunamadı.' };
    return { success: true, data: result };
  }
}
