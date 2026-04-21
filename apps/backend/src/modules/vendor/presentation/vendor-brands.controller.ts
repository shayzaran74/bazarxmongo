import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';

@ApiTags('Vendor Catalog')
@Controller('vendor-brands')
export class VendorBrandsController {
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return { success: true, data: [] };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('apply')
  async apply(@Body() body: any) {
    return { success: true, data: { id: Date.now().toString(), status: 'PENDING', ...body } };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload-logo')
  async uploadLogo(@Body() body: any) {
    return { success: true, url: 'https://placehold.co/150x150?text=Logo' };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload-document')
  async uploadDocument(@Body() body: any) {
    return { success: true, url: 'https://placehold.co/400x300?text=Document' };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return { success: true, data: { id, ...body } };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return { success: true };
  }
}
