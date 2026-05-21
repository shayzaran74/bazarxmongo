import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody, 
  ApiParam 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { 
  AddAddressDto, 
  UpdateAddressDto, 
  AddAddressCommand, 
  UpdateAddressCommand, 
  DeleteAddressCommand, 
  GetAddressesQuery 
} from '@barterborsa/domain-identity';

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: 'List user addresses', description: 'Kullanıcının kayıtlı tüm adreslerini listeler.' })
  @ApiResponse({ status: 200, description: 'Adres listesi.' })
  @Get()
  async getAddresses(@Req() req: Record<string, any>) {
    return this.queryBus.execute(new GetAddressesQuery(req.user.id));
  }

  @ApiOperation({ summary: 'Add new address', description: 'Kullanıcı hesabına yeni bir teslimat adresi ekler.' })
  @ApiBody({ type: AddAddressDto })
  @ApiResponse({ status: 201, description: 'Adres başarıyla eklendi.' })
  @Post()
  async addAddress(@Req() req: Record<string, any>, @Body() dto: AddAddressDto) {
    return this.commandBus.execute(new AddAddressCommand(req.user.id, dto));
  }

  @ApiOperation({ summary: 'Update address', description: 'ID bilgisi verilen adresi günceller.' })
  @ApiParam({ name: 'id', description: 'Adres ID' })
  @ApiBody({ type: UpdateAddressDto })
  @ApiResponse({ status: 200, description: 'Adres başarıyla güncellendi.' })
  @ApiResponse({ status: 404, description: 'Adres bulunamadı.' })
  @Put(':id')
  async updateAddress(@Req() req: Record<string, any>, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.commandBus.execute(new UpdateAddressCommand(req.user.id, id, dto));
  }

  @ApiOperation({ summary: 'Delete address', description: 'ID bilgisi verilen adresi hesaptan siler.' })
  @ApiParam({ name: 'id', description: 'Adres ID' })
  @ApiResponse({ status: 200, description: 'Adres başarıyla silindi.' })
  @ApiResponse({ status: 404, description: 'Adres bulunamadı.' })
  @Delete(':id')
  async deleteAddress(@Req() req: Record<string, any>, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteAddressCommand(req.user.id, id));
  }
}
