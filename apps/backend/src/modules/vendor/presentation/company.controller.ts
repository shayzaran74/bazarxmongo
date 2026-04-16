import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiParam 
} from '@nestjs/swagger';
import { CreateCompanyCommand } from '../application/commands/create-company.command';
import { CreateCompanyDto } from '../application/dtos/create-company.dto';
import { GetCompanyQuery } from '../application/queries/get-company.query';

@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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
    return this.queryBus.execute(new GetCompanyQuery(id));
  }
}
