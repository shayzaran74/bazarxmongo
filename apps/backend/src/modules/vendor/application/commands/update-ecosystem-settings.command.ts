// apps/backend/src/modules/vendor/application/commands/update-ecosystem-settings.command.ts

export class UpdateEcosystemSettingsCommand {
  constructor(
    public readonly userId: string,
    public readonly settings: {
      isBlindPool?: boolean;
      internalCommRate?: number;
    },
  ) {}
}
