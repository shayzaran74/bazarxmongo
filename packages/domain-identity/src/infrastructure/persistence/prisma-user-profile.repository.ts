import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { UserProfileMapper } from './mappers/user-profile.mapper';

@Injectable()
export class PrismaUserProfileRepository implements IUserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const record = await this.prisma.userProfile.findUnique({
      where: { userId }
    });
    return record ? UserProfileMapper.toDomain(record) : null;
  }

  async save(profile: UserProfile): Promise<void> {
    const data = UserProfileMapper.toPersistence(profile);
    await this.prisma.userProfile.create({ data });
  }

  async update(profile: UserProfile): Promise<void> {
    const data = UserProfileMapper.toPersistence(profile);
    const { id, ...updateData } = data;
    await this.prisma.userProfile.update({
      where: { id },
      data: updateData
    });
  }
}
