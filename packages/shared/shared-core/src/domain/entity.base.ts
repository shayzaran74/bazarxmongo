// packages/shared/shared-core/src/domain/entity.base.ts

import { v4 as uuidv4 } from 'uuid';

export abstract class Entity<T> {
  protected readonly _id: string;
  protected readonly props: T;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;
  protected _version: number;

  constructor(props: T, id?: string) {
    this._id = id ?? uuidv4();
    this.props = props;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._version = 1;
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get version(): number {
    return this._version;
  }

  public equals(object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    return this._id === object._id;
  }
}
