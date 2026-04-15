import { Optional } from '@barterborsa/shared-core';

export interface IVerificationToken {
  id: string;
  userId: string;
  token: string;
  type: 'EMAIL' | 'PHONE' | 'PASSWORD_RESET';
  expiresAt: Date;
  createdAt: Date;
}

export interface IVerificationTokenRepository {
  create(userId: string, type: string, expiresAt: Date): Promise<string>;
  findByToken(token: string): Promise<Optional<IVerificationToken>>;
  delete(id: string): Promise<void>;
  deleteByUserIdAndType(userId: string, type: string): Promise<void>;
}
