import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Review Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/reviews')
export class ReviewAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getReviews(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Prisma might use 'Review' or 'ProductReview'
    // Checking schema via prisma service might be needed, but assuming 'review' based on previous context
    const [items, total] = await Promise.all([
      (this.prisma as any).review.findMany({
        include: { 
          user: { select: { email: true, firstName: true, lastName: true } },
          listing: { select: { title: true } }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      (this.prisma as any).review.count()
    ]);

    return {
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum
      }
    };
  }
}
