// packages/shared/shared-core/src/domain/value-object.base.ts

import { isEqual } from 'lodash';

export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    return isEqual(this.props, vo.props);
  }
}
