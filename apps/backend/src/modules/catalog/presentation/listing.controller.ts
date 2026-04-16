// apps/backend/src/modules/catalog/presentation/listing.controller.ts

import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateListingCommand } from '../application/commands/create-listing.command';
import { CreateListingDto } from '../application/dtos/create-listing.dto';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard, Roles, Public } from '@barterborsa/shared-security';

@Controller('listings')
export class ListingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@CurrentUser() user: any, @Body() dto: CreateListingDto) {
    // Note: This assumes the user's vendorId is linked or they are the vendor
    // In a real scenario, we'd fetch the vendorId associated with this userId
    return this.commandBus.execute(new CreateListingCommand(user.vendorId || user.id, dto));
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    // Query implementation would follow
    return { slug };
  }
}
