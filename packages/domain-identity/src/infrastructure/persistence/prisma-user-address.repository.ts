import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';
import { UserAddress } from '../../domain/entities/user-address.entity';
import { UserAddressMapper } from './mappers/user-address.mapper';

@Injectable()
export class PrismaUserAddressRepository implements IUserAddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserAddress[]> {
    const records = await this.prisma.userAddress.findMany({
      where: { userId, deletedAt: null }
    });
    return records.map((record: any) => UserAddressMapper.toDomain(record));
  }

  async findById(id: string): Promise<UserAddress | null> {
    const record = await this.prisma.userAddress.findFirst({
      where: { id, deletedAt: null }
    });
    return record ? UserAddressMapper.toDomain(record) : null;
  }

  async save(address: UserAddress): Promise<void> {
    const data = UserAddressMapper.toPersistence(address);
    await this.prisma.userAddress.create({ data });
  }

  async update(address: UserAddress): Promise<void> {
    const data = UserAddressMapper.toPersistence(address);
    const { id, ...updateData } = data;
    await this.prisma.userAddress.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userAddress.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async setDefault(id: string, userId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false }
      }),
      this.prisma.userAddress.update({
        where: { id },
        data: { isDefault: true }
      })
    ]);
  }
}
