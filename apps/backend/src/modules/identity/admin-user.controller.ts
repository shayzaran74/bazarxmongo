import { Controller, Get, Query, UseGuards, Param, Patch, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all users for admin' })
  @Get()
  async listUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('role') role?: string
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } }
      ];
    }
    if (status) {
      where.status = status.toUpperCase();
    }
    if (role) {
      where.role = role.toUpperCase();
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          profile: true,
          vendor: {
            include: {
              company: { select: { id: true, name: true } },
              profile: { select: { id: true, storeName: true } }
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where })
    ]);

    // Handle businessName and userName mapping
    const mappedItems = items.map(u => {
      const vendor: any = u.vendor ? {
        ...u.vendor,
        businessName: u.vendor.profile?.storeName || u.vendor.company?.name || 'İsimsiz İşletme'
      } : null;

      return {
        ...u,
        vendor,
        userName: u.profile ? `${u.profile.firstName || ''} ${u.profile.lastName || ''}`.trim() : u.email
      };
    });

    return {
      success: true,
      data: mappedItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  @ApiOperation({ summary: 'Update user status' })
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    await this.prisma.user.update({
      where: { id },
      data: { status: status.toUpperCase() as any }
    });
    return { success: true };
  }

  @ApiOperation({ summary: 'Update user role' })
  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    await this.prisma.user.update({
      where: { id },
      data: { role: role.toUpperCase() as any }
    });
    return { success: true };
  }

  @ApiOperation({ summary: 'Delete user' })
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.prisma.user.delete({
      where: { id }
    });
    return { success: true };
  }
}
