import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuadCardDto } from './create-quad-card.dto';

export class UpdateQuadCardsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuadCardDto)
  cards!: CreateQuadCardDto[];
}
