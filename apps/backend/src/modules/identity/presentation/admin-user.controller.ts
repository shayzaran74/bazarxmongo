import { Controller, Get, Query, UseGuards,
         Param, Patch, Delete, Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { ListAdminUsersQuery }
  from '../application/queries/list-admin-users.query';
import { UpdateUserStatusCommand }
  from '../application/commands/update-user-status.command';
import { UpdateUserRoleCommand }
  from '../application/commands/update-user-role.command';
import { DeleteAdminUserCommand }
  from '../application/commands/delete-admin-user.command';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class AdminUserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'List all users for admin' })
  @Get()
  async listUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('role') role?: string
  ) {
    const result = await this.queryBus.execute(
      new ListAdminUsersQuery({
        search,
        status,
        role,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10
      })
    );
    return { success: true, ...result };
  }

  @ApiOperation({ summary: 'Update user status' })
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.commandBus.execute(
      new UpdateUserStatusCommand(id, status)
    );
  }

  @ApiOperation({ summary: 'Update user role' })
  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: string
  ) {
    return this.commandBus.execute(
      new UpdateUserRoleCommand(id, role)
    );
  }

  @ApiOperation({ summary: 'Delete user' })
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteAdminUserCommand(id)
    );
  }
}
