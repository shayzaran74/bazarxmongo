import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { 
  AddAddressDto, 
  UpdateAddressDto, 
  AddAddressCommand, 
  UpdateAddressCommand, 
  DeleteAddressCommand, 
  GetAddressesQuery 
} from '@barterborsa/domain-identity';

@Controller('identity/addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get()
  async getAddresses(@Req() req: any) {
    return this.queryBus.execute(new GetAddressesQuery(req.user.id));
  }

  @Post()
  async addAddress(@Req() req: any, @Body() dto: AddAddressDto) {
    return this.commandBus.execute(new AddAddressCommand(req.user.id, dto));
  }

  @Put(':id')
  async updateAddress(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.commandBus.execute(new UpdateAddressCommand(req.user.id, id, dto));
  }

  @Delete(':id')
  async deleteAddress(@Req() req: any, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteAddressCommand(req.user.id, id));
  }
}
