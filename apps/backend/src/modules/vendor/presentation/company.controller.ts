// apps/backend/src/modules/vendor/presentation/company.controller.ts

import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCompanyCommand } from '../application/commands/create-company.command';
import { CreateCompanyDto } from '../application/dtos/create-company.dto';
import { GetCompanyQuery } from '../application/queries/get-company.query';
import { Roles } from '@barterborsa/shared-security';

@Controller('companies')
export class CompanyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    return this.commandBus.execute(new CreateCompanyCommand(dto));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetCompanyQuery(id));
  }
}
