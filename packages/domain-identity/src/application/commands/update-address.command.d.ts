import { Command } from '@barterborsa/shared-core';
import { UpdateAddressDto } from '../dtos/update-address.dto';
export declare class UpdateAddressCommand extends Command {
    readonly userId: string;
    readonly addressId: string;
    readonly dto: UpdateAddressDto;
    constructor(userId: string, addressId: string, dto: UpdateAddressDto);
}
