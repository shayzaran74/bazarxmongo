export abstract class Command {
  public readonly timestamp: Date;
  constructor() {
    this.timestamp = new Date();
  }
}

export abstract class Query {
  public readonly timestamp: Date;
  constructor() {
    this.timestamp = new Date();
  }
}
