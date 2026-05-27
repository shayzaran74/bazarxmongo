// apps/backend/src/modules/barter/application/commands/create-surplus-item.command.ts

import { Command } from '@barterborsa/shared-core';
import { PilotCity } from '../../domain/enums/pilot-city.enum';

export class CreateSurplusItemCommand extends Command {
  constructor(
    public readonly companyId:         string,
    public readonly title:             string,
    public readonly category:          string,
    public readonly quantity:          number | string,
    public readonly unit:              string,
    public readonly city:              PilotCity,
    public readonly description?:      string,
    public readonly unitPrice?:        number | string,
    public readonly images?:           string[],
    public readonly materialType?:     string,
    public readonly location?:         string,
    public readonly wantedCategories?: string[],
    public readonly tradeModes?:       string[],
    public readonly technicalSpecs?:   Record<string, unknown>,
  ) {
    super();
  }
}
