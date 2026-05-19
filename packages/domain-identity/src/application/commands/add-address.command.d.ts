import { Command } from '@barterborsa/shared-core';
import { AddAddressDto } from '../dtos/add-address.dto';
export declare class AddAddressCommand extends Command {
    readonly userId: string;
    readonly dto: AddAddressDto;
    constructor(userId: string, dto: AddAddressDto);
}
