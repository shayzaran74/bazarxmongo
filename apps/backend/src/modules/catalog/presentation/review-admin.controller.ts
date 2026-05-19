import { Controller, Get, Post, Delete, Param, NotFoundException, UseGuards, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { ListAdminReviewsQuery }
  from '../application/queries/list-admin-reviews/list-admin-reviews.query';
import { Review } from '@barterborsa/shared-persistence/schemas/backend/review.schema';

@ApiTags('Review Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/reviews')
export class ReviewAdminController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List all reviews for admin' })
  @Get()
  async getReviews(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const result = await this.queryBus.execute(
      new ListAdminReviewsQuery({
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10
      })
    );
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Approve a review' })
  @Post(':id/approve')
  async approveReview(@Param('id') id: string) {
    const review = await Review.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { isApproved: true },
      { new: true }
    );
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return { success: true, data: review };
  }

  @ApiOperation({ summary: 'Delete a review' })
  @Delete(':id')
  async deleteReview(@Param('id') id: string) {
    const review = await Review.findOneAndDelete({ $or: [{ id }, { _id: id }] });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return { success: true, data: review };
  }
}
