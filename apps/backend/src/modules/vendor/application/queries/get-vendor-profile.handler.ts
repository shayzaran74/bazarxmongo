import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetVendorProfileQuery } from './get-vendor-profile.query';

@QueryHandler(GetVendorProfileQuery)
export class GetVendorProfileHandler implements IQueryHandler<GetVendorProfileQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetVendorProfileQuery) {
    // IDOR FIX: userId parametresi doğrudan token'dan gelen userId'ye (query.userId) bağlanmış durumda
    return this.prisma.vendorProfile.findFirst({
      where: { 
        vendor: { 
          userId: query.userId 
        } 
      }
    });
  }
}
