import { Command } from '@barterborsa/shared-core';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
export declare class UpdateProfileCommand extends Command {
    readonly userId: string;
    readonly dto: UpdateProfileDto;
    constructor(userId: string, dto: UpdateProfileDto);
}
