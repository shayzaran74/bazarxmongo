// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-user.repository.ts
// User repository — Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User as UserModel, IUser } from '@barterborsa/shared-persistence/schemas/backend/user.schema';

export interface UserDocument extends IUser {
  _id?: string;
}

@Injectable()
export class MongoUserRepository {
  private readonly model: Model<UserDocument>;

  constructor() {
    this.model = UserModel as Model<UserDocument>;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.model.findOne({ id }).exec();
  }

  async update(id: string, data: Partial<{ role: string; status: string }>): Promise<UserDocument | null> {
    return this.model.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true }
    ).exec();
  }
}