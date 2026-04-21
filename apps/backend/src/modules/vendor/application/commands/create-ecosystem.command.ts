export class CreateEcosystemCommand {
  constructor(
    public readonly userId: string,
    public readonly body: {
      name: string;
      description?: string;
    }
  ) {}
}
