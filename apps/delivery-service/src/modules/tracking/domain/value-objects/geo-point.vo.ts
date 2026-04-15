import { ValueObject } from '@barterborsa/shared-core';

interface GeoPointProps {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export class GeoPoint extends ValueObject<GeoPointProps> {
  private constructor(props: GeoPointProps) {
    super(props);
  }

  public static create(longitude: number, latitude: number): GeoPoint {
    return new GeoPoint({
      type: 'Point',
      coordinates: [longitude, latitude],
    });
  }

  get longitude(): number {
    return this.props.coordinates[0];
  }

  get latitude(): number {
    return this.props.coordinates[1];
  }

  get coordinates(): [number, number] {
    return this.props.coordinates;
  }
}
