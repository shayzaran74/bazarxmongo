import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IVerificationToken, IVerificationTokenRepository } from '../../domain/repositories/verification-token.repository.interface';
import { Optional } from '@barterborsa/shared-core';
import { randomBytes } from 'crypto';

@Injectable()
export class PrismaVerificationTokenRepository implements IVerificationTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, type: string, expiresAt: Date): Promise<string> {
    const token = randomBytes(32).toString('hex');
    
    await this.prisma.verificationToken.create({
      data: {
        userId,
        token,
        type,
        expiresAt,
      },
    });

    return token;
  }

  async findByToken(token: string): Promise<Optional<IVerificationToken>> {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) return null;

    return {
      id: record.id,
      userId: record.userId,
      token: record.token,
      type: record.type as any,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.verificationToken.delete({
      where: { id },
    });
  }

  async deleteByUserIdAndType(userId: string, type: string): Promise<void> {
    await this.prisma.verificationToken.deleteMany({
      where: { userId, type },
    });
  }
}
