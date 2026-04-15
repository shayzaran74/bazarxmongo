import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateShipmentDto } from '../application/dtos/create-shipment.dto';
import { CreateShipmentCommand } from '../application/commands/create-shipment.command';
import { GetShipmentQuery } from '../application/queries/get-shipment.query';
import { Result } from '@barterborsa/shared-core';

@Controller('shipments')
export class ShipmentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateShipmentDto): Promise<Result<string>> {
    return this.commandBus.execute(new CreateShipmentCommand(dto));
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<any> {
    return this.queryBus.execute(new GetShipmentQuery(id));
  }
}
