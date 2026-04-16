// apps/backend/src/modules/vendor/presentation/vendor.controller.ts

import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterVendorCommand } from '../application/commands/register-vendor.command';
import { RegisterVendorDto } from '../application/dtos/register-vendor.dto';
import { ListVendorsQuery } from '../application/queries/list-vendors.query';
import { GetVendorBySlugQuery } from '../application/queries/get-vendor-by-slug.query';
import { CurrentUser } from '@barterborsa/shared-nest';
import { Public } from '@barterborsa/shared-security';

@Controller('vendors')
export class VendorController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('apply')
  async apply(@CurrentUser() user: any, @Body() dto: RegisterVendorDto) {
    return this.commandBus.execute(new RegisterVendorCommand(user.id, dto));
  }

  @Public()
  @Get()
  async list(@Query() query: any) {
    return this.queryBus.execute(new ListVendorsQuery(query));
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.queryBus.execute(new GetVendorBySlugQuery(slug));
  }
}
