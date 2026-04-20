import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, Public, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { VendorTier } from '@prisma/client';

@ApiTags('Ecosystem')
@ApiBearerAuth()
@Controller('ecosystem')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EcosystemController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Get my ecosystem status' })
  @Get('my')
  async getMyEcosystem(@CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id },
      include: {
        brandEcosystem: {
          include: {
            members: true
          }
        },
        memberOfEcosystem: {
          include: {
            owner: { include: { profile: true } }
          }
        }
      }
    });

    if (!vendor) return { success: false, message: 'Vendor not found' };

    const isOwner = !!vendor.brandEcosystem;
    const ecosystem = vendor.brandEcosystem || vendor.memberOfEcosystem;

    return {
      success: true,
      isOwner,
      ecosystem,
      isApexPlus: vendor.tier === VendorTier.ELITE
    };
  }

  @ApiOperation({ summary: 'Create new ecosystem' })
  @Post('create')
  @Roles('VENDOR', 'ADMIN')
  async createEcosystem(@Body() body: any, @CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) return { success: false, message: 'Vendor not found' };
    
    // Simple slugify
    const slug = body.name.toLowerCase().replace(/ /g, '-');

    const ecosystem = await this.prisma.brandEcosystem.create({
      data: {
        name: body.name,
        slug: slug + '-' + Math.random().toString(36).substring(7),
        description: body.description,
        ownerId: vendor.id
      }
    });

    return { success: true, data: ecosystem };
  }

  @ApiOperation({ summary: 'Get ecosystem audit logs' })
  @Get('audit')
  async getAuditLogs(@CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id },
      include: { brandEcosystem: true }
    });

    if (!vendor?.brandEcosystem) return { success: true, data: [] };

    const logs = await this.prisma.ecosystemAuditLog.findMany({
      where: { ecosystemId: vendor.brandEcosystem.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return { success: true, data: logs };
  }

  @ApiOperation({ summary: 'Add member to ecosystem' })
  @Post('members')
  async addMember(@Body() body: { memberVendorId: string }, @CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id },
      include: { brandEcosystem: true }
    });

    if (!vendor?.brandEcosystem) return { success: false, message: 'No ecosystem owned' };

    await this.prisma.vendor.update({
      where: { id: body.memberVendorId },
      data: { ecosystemId: vendor.brandEcosystem.id }
    });

    return { success: true };
  }
}

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  @Public()
  @Post('track')
  async track() {
    return { success: true };
  }
}
@ApiTags('Vendor Content')
@Controller('vendor-banners')
export class VendorBannersController {
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return { success: true, data: [] };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any) {
    return { success: true, data: { id: Date.now().toString(), ...body } };
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

@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return { success: true, data: [] };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('dashboard/summary')
  async getSummary(@Query('period') period?: string) {
    return {
      success: true,
      data: {
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        ctr: 0,
        chartData: []
      }
    };
  }
}

@ApiTags('Vendor Ads')
@Controller('vendor-ads')
export class VendorAdsController {
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('ad-swap')
  async adSwap() {
    return { success: true, data: { id: Date.now().toString(), status: 'PENDING' } };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/activate')
  async activate(@Param('id') id: string) {
    return { success: true, data: { id, status: 'ACTIVE' } };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/report')
  async report(@Param('id') id: string) {
    return { success: true, data: [] };
  }
}
