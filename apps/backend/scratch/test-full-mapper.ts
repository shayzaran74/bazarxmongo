// apps/backend/scratch/test-full-mapper.ts
import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SurplusCreateDto } from '../src/modules/barter/application/dtos/surplus.dto';

async function run() {
  // Construct a realistic payload from useSurplusForm.ts
  const payload = {
    title:            'test title',
    description:      'test desc',
    categoryId:       'some-cat-id',
    category:         'some-cat',
    quantity:         10,
    unit:             'KG',
    unitPrice:        100,
    images:           [],
    city:             'İSTANBUL',
    materialType:     'some-material',
    location:         'Istanbul / Kadikoy',
    technicalSpecs:   {},
    tradeModes:       ['barter'],
    wantedCategories: ['some-wanted'],
  };

  console.log('Testing payload:', payload);
  const dto = plainToInstance(SurplusCreateDto, payload);
  const errors = await validate(dto);
  console.log('Validation errors count:', errors.length);
  if (errors.length > 0) {
    console.log('Validation errors details:', JSON.stringify(errors, null, 2));
  } else {
    console.log('Validation passed!');
  }
}

run().catch(console.error);
