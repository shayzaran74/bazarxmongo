// apps/backend/src/modules/loyalty/domain/value-objects/loyalty.vos.ts

import { ValueObject, Result, Ok, Err, DomainException } from '@barterborsa/shared-core';

interface XpAmountProps {
  value: number;
}

export class XpAmount extends ValueObject<XpAmountProps> {
  get value(): number { return this.props.value; }
  private constructor(props: XpAmountProps) { super(props); }
  public static create(value: number): Result<XpAmount, DomainException> {
    if (value < 0 && Math.abs(value) > 1000000) return Err(new DomainException('Invalid XP amount'));
    return Ok(new XpAmount({ value }));
  }
}

interface MissionProgressProps {
  current: number;
  target: number;
}

export class MissionProgress extends ValueObject<MissionProgressProps> {
  get current(): number { return this.props.current; }
  get target(): number { return this.props.target; }
  get percentage(): number { return Math.min(100, (this.props.current / this.props.target) * 100); }
  
  private constructor(props: MissionProgressProps) { super(props); }
  public static create(current: number, target: number): Result<MissionProgress, DomainException> {
    if (target <= 0) return Err(new DomainException('Target must be positive'));
    return Ok(new MissionProgress({ current: Math.max(0, current), target }));
  }
}
