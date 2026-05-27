import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListingController } from './listing.controller';

@ApiTags('Surplus')
@Controller('surplus')
export class SurplusController extends ListingController {}
