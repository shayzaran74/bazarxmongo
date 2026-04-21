import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListAdminUsersQuery } from './list-admin-users.query';

@QueryHandler(ListAdminUsersQuery)
export class ListAdminUsersHandler
  implements IQueryHandler<ListAdminUsersQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListAdminUsersQuery) {
    const { search, status, role, page = 1, limit = 10 } = query.filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } }
      ];
    }
    if (status) where.status = status.toUpperCase();
    if (role) where.role = role.toUpperCase();

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
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where })
    ]);

    const mappedItems = items.map(u => {
      const vendor: any = u.vendor ? {
        ...u.vendor,
        businessName: u.vendor.profile?.storeName
          || u.vendor.company?.name
          || 'İsimsiz İşletme'
      } : null;

      return {
        ...u,
        vendor,
        userName: u.profile
          ? `${u.profile.firstName || ''} ${u.profile.lastName || ''}`.trim()
          : u.email
      };
    });

    return {
      items: mappedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
