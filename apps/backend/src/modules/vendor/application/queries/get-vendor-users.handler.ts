import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetVendorUsersQuery } from './get-vendor-users.query';

// CompanyUser Prisma kaydı
interface CompanyUser {
  userId: string;
  role: string;
}

@QueryHandler(GetVendorUsersQuery)
export class GetVendorUsersHandler implements IQueryHandler<GetVendorUsersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetVendorUsersQuery) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: query.userId },
      include: { company: { include: { users: { include: { company: false } } } } },
    });
    if (!vendor?.company) return [];

    const companyUsers = vendor.company.users as CompanyUser[];
    const userIds = companyUsers.map((u) => u.userId);

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id:      true,
        email:   true,
        role:    true,
        profile: { select: { firstName: true, lastName: true, phone: true } },
      },
    });

    return users.map((u) => ({
      ...u,
      companyRole: companyUsers.find((cu) => cu.userId === u.id)?.role,
    }));
  }
}
