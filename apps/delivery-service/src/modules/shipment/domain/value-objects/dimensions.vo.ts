import { ValueObject } from '@barterborsa/shared-core';

interface DimensionsProps {
  weight: number; // kg
  width: number;  // cm
  height: number; // cm
  depth: number;  // cm
}

export class Dimensions extends ValueObject<DimensionsProps> {
  private constructor(props: DimensionsProps) {
    super(props);
  }

  public static create(props: DimensionsProps): Dimensions {
    return new Dimensions(props);
  }

  get weight(): number { return this.props.weight; }
  get width(): number { return this.props.width; }
  get height(): number { return this.props.height; }
  get depth(): number { return this.props.depth; }

  get volumeWeight(): number {
    return (this.props.width * this.props.height * this.props.depth) / 3000;
  }
}
