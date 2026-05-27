import { Test, TestingModule } from '@nestjs/testing';
import { CatalogProductController } from './catalog-product.controller';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCatalogProductDto } from '../application/dtos/create-catalog-product.dto';

describe('CatalogProductController', () => {
  let controller: CatalogProductController;
  let commandBus: CommandBus;

  const mockCommandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogProductController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
      ],
    }).compile();

    controller = module.get<CatalogProductController>(CatalogProductController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should call commandBus.execute with CreateCatalogProductCommand', async () => {
    const dto: CreateCatalogProductDto = {
      name: 'Test Product',
      brand: 'Test Brand',
      description: 'Test Description',
    };

    await controller.create(dto);

    expect(commandBus.execute).toHaveBeenCalled();
  });
});
