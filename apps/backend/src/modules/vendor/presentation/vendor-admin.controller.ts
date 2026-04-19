import { Controller, Get, Post, Body, Param, Query, UseGuards, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Vendor Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/vendors')
export class VendorAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all vendors for admin' })
  @Get()
  async getVendors(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('q') search?: string,
    @Query('status') status?: string
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;
    
    console.log('🔍 Fetching vendors for admin...', { pageNum, limitNum, search, status });

    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { company: { name: { contains: search, mode: 'insensitive' } } },
          { profile: { storeName: { contains: search, mode: 'insensitive' } } }
        ];
      }
      if (status) {
        where.status = status;
      }

      const [items, total] = await Promise.all([
        this.prisma.vendor.findMany({
          where,
          include: { 
            company: { 
              select: { name: true, email: true, phone: true } 
            },
            profile: true,
            categories: {
              include: { category: { select: { id: true, name: true, slug: true } } }
            },
            _count: {
              select: { listings: true }
            }
          },
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.vendor.count({ where })
      ]);

      const mappedItems = items.map(v => ({
        ...v,
        vendorCategories: (v as any).categories
      }));

      return {
        success: true,
        data: mappedItems,
        total,
        page: pageNum,
        limit: limitNum
      };
    } catch (error) {
      console.error('❌ Error fetching vendors:', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Approve vendor' })
  @Put(':id/approve')
  async approveVendor(@Param('id') id: string) {
    // Get vendor with userId
    const vendorData = await this.prisma.vendor.findUnique({
      where: { id },
      select: { userId: true }
    });

    const vendor = await this.prisma.vendor.update({
      where: { id },
      data: { 
        status: 'APPROVED',
        verifiedAt: new Date(),
        isVerified: true
      }
    });

    // Update user role to VENDOR
    if (vendorData?.userId) {
      await this.prisma.user.update({
        where: { id: vendorData.userId },
        data: { role: 'VENDOR' }
      });
      console.log(`✅ User ${vendorData.userId} role updated to VENDOR`);
    }

    return { success: true, data: vendor };
  }

  @ApiOperation({ summary: 'Reject vendor' })
  @Put(':id/reject')
  @ApiBody({ schema: { type: 'object', properties: { rejectionReason: { type: 'string' } } } })
  async rejectVendor(@Param('id') id: string, @Body('rejectionReason') rejectionReason: string) {
    const vendor = await this.prisma.vendor.update({
      where: { id },
      data: { 
        status: 'REJECTED',
        rejectionReason
      }
    });
    return { success: true, data: vendor };
  }

  @ApiOperation({ summary: 'Update vendor (Featured, B2B, etc)' })
  @Put(':id')
  async updateVendor(@Param('id') id: string, @Body() data: any) {
    // Separate vendor fields and profile fields if necessary
    const { isFeatured, ...rest } = data;
    
    const updateData: any = { ...rest };
    
    // If updating profile fields directly via vendor update
    const profileFields = ['storeName', 'description', 'city', 'district'];
    const profileUpdate: any = {};
    
    Object.keys(updateData).forEach(key => {
      if (profileFields.includes(key)) {
        profileUpdate[key] = updateData[key];
        delete updateData[key];
      }
    });

    if (isFeatured !== undefined) {
       await this.prisma.vendorProfile.update({
         where: { vendorId: id },
         data: { isFeatured }
       });
    }

    if (Object.keys(profileUpdate).length > 0) {
      await this.prisma.vendorProfile.update({
        where: { vendorId: id },
        data: profileUpdate
      });
    }

    const vendor = await this.prisma.vendor.update({
      where: { id },
      data: updateData,
      include: { profile: true }
    });

    return { success: true, data: vendor };
  }

  @ApiOperation({ summary: 'Add category to vendor' })
  @Post(':id/categories')
  async addCategory(@Param('id') id: string, @Body('categoryId') categoryId: string) {
    const vc = await this.prisma.vendorCategory.create({
      data: {
        vendorId: id,
        categoryId: categoryId
      }
    });
    return { success: true, data: vc };
  }

  @ApiOperation({ summary: 'Remove category from vendor' })
  @Delete(':id/categories/:categoryId')
  async removeCategory(@Param('id') id: string, @Param('categoryId') categoryId: string) {
    await this.prisma.vendorCategory.delete({
      where: {
        vendorId_categoryId: {
          vendorId: id,
          categoryId: categoryId
        }
      }
    });
    return { success: true };
  }
}

