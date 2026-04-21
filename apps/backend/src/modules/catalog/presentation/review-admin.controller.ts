import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { ListAdminReviewsQuery }
  from '../application/queries/list-admin-reviews/list-admin-reviews.query';

@ApiTags('Review Admin')
@ApiBearerAuth()
@Roles('ADMIN')
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
}
