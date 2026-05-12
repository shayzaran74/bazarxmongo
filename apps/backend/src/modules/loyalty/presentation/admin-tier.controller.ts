import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Admin Tier Management')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/tiers')
export class AdminTierController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all membership tiers' })
  @Get()
  async listTiers() {
    const items = await this.prisma.membershipTier.findMany({
      orderBy: { minXp: 'asc' }
    });
    
    // Flatten metadata for frontend consistency
    const data = items.map(item => ({
      id: item.id,
      tier: item.name,
      minXp: item.minXp,
      description: item.description,
      xpMultiplier: item.rewardMultiplier,
      ...(item.benefitMetadata as any || {})
    }));

    return { success: true, data };
  }

  @ApiOperation({ summary: 'Create or update tier rule' })
  @Post()
  async upsertTier(@Body() body: any) {
    const { id, tier, minXp, description, xpMultiplier, ...metadata } = body;

    const data: any = {
      name: tier,
      minXp: parseInt(minXp) || 0,
      description: description || '',
      rewardMultiplier: parseFloat(xpMultiplier) || 1.0,
      benefitMetadata: metadata
    };

    if (id && id !== '') {
      await this.prisma.membershipTier.update({
        where: { id },
        data
      });
    } else {
      await this.prisma.membershipTier.upsert({
        where: { name: tier },
        update: data,
        create: data
      });
    }

    return { success: true };
  }
}
