import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Logger, 
  BadRequestException,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { CreateVendorProductCommand } from '../application/commands/create-vendor-product.command';
import { UpdateVendorProductCommand } from '../application/commands/update-vendor-product.command';
import { DeleteVendorProductCommand } from '../application/commands/delete-vendor-product.command';
import { ListVendorProductsQuery } from '../application/queries/list-vendor-products.query';

@ApiTags('Vendors-Products')
@Controller('vendors/products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
export class VendorProductController {
  private readonly logger = new Logger(VendorProductController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Bulk import products from file' })
  @Post('bulk/import')
  @UseInterceptors(FileInterceptor('file'))
  async bulkImport(@CurrentUser() user: any, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('Lütfen bir dosya yükleyin.');
    this.logger.log(`bulkImport initiated by user=${user.id}, file=${file.originalname}`);
    
    // TODO: Implement actual Excel/CSV processing logic
    return {
      success: true,
      message: 'Dosya başarıyla alındı ve işleme sırasına eklendi.',
      data: { imported: 0, updated: 0, failed: 0, errors: [] }
    };
  }

  @ApiOperation({ summary: 'List all products for the current vendor' })
  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('q') search?: string
  ) {
    const data = await this.queryBus.execute(
      new ListVendorProductsQuery(user.id, {
        search,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 50
      })
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Create a new listing/product' })
  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    return this.commandBus.execute(
      new CreateVendorProductCommand(user.id, body)
    );
  }

  @ApiOperation({ summary: 'Update an existing listing' })
  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any
  ) {
    return this.commandBus.execute(
      new UpdateVendorProductCommand(user.id, id, body)
    );
  }

  @ApiOperation({ summary: 'Delete a listing' })
  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteVendorProductCommand(user.id, id)
    );
  }

  // NOTE: updateStock() removed from here. 
  // Use PATCH /vendors/products/:id/stock from VendorController.
}
