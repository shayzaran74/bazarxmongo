// packages/domain-identity/src/infrastructure/persistence/mongo-verification-token.repository.ts
// VerificationToken repository — Mongoose implementation (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Optional } from '@barterborsa/shared-core';
import { VerificationToken as VerificationTokenModel } from '@barterborsa/shared-persistence';
import { IVerificationTokenRepository } from '../../domain/repositories/verification-token.repository.interface';
import { randomBytes } from 'crypto';

@Injectable()
export class MongoVerificationTokenRepository implements IVerificationTokenRepository {
  private readonly model: Model<any>;

  constructor() {
    this.model = VerificationTokenModel;
  }

  async create(userId: string, type: string, expiresAt: Date): Promise<string> {
    let token: string;

    if (type === 'EMAIL') {
      token = Math.floor(100000 + Math.random() * 900000).toString();
    } else {
      token = randomBytes(32).toString('hex');
    }

    const id = `vt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.model.create({
      _id: id,
      id,
      userId,
      token,
      type,
      expiresAt,
    });

    return token;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async findByToken(token: string) {
    const doc = await this.model.findOne({ token }).exec();
    if (!doc) return undefined;
    return {
      id: doc.id,
      userId: doc.userId,
      token: doc.token,
      type: doc.type as 'EMAIL' | 'PHONE' | 'PASSWORD_RESET',
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    };
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async deleteByUserIdAndType(userId: string, type: string): Promise<void> {
    await this.model.deleteMany({ userId, type }).exec();
  }
}