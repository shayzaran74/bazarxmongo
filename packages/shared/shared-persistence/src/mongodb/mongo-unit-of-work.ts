// packages/shared/shared-persistence/src/mongodb/mongo-unit-of-work.ts
// MongoDB transaction sarmalayıcı — session.withTransaction() helper

import { Connection } from 'mongoose';

export interface UnitOfWorkOptions {
  readPreference?: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred';
  readConcern?: 'local' | 'majority' | 'linearizable';
  writeConcern?: { w: 'majority' | '1' | '2' } | { w: 'majority'; j: boolean };
}

export async function withTransaction<T>(
  connection: Connection,
  fn: (session: import('mongoose').ClientSession) => Promise<T>,
  options: UnitOfWorkOptions = {}
): Promise<T> {
  const session = await connection.startSession();
  try {
    return await session.withTransaction(async () => {
      return fn(session);
    }, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readPreference: options.readPreference as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readConcern: options.readConcern as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      writeConcern: options.writeConcern as any,
    });
  } finally {
    await session.endSession();
  }
}

export async function withTransactionSimple<T>(
  connection: Connection,
  fn: (session: import('mongoose').ClientSession) => Promise<T>
): Promise<T> {
  return withTransaction(connection, fn, { writeConcern: { w: 'majority' } });
}