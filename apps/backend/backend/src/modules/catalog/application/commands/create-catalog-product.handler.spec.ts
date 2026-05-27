import { Test, TestingModule } from '@nestjs/testing';
import { CreateCatalogProductHandler } from './create-catalog-product.handler';
import { ICatalogProductRepository } from '../../domain/repositories/catalog-product.repository.interface';
import { CreateCatalogProductCommand } from './create-catalog-product.command';
import { CreateCatalogProductDto } from '../dtos/create-catalog-product.dto';
import { ConflictException } from '@barterborsa/shared-core';

describe('CreateCatalogProductHandler', () => {
  let handler: CreateCatalogProductHandler;
  let repository: ICatalogProductRepository;

  const mockRepository = {
    findByGTIN: jest.fn(),
    findBySlug: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCatalogProductHandler,
        {
          provide: 'ICatalogProductRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateCatalogProductHandler>(CreateCatalogProductHandler);
    repository = module.get<ICatalogProductRepository>('ICatalogProductRepository');
  });

  it('should create a catalog product successfully', async () => {
    const dto: CreateCatalogProductDto = {
      name: 'Test Product',
      brand: 'Test Brand',
      description: 'Test Description',
      gtin: '1234567890123',
    };
    const command = new CreateCatalogProductCommand(dto);

    repository.findByGTIN = jest.fn().mockResolvedValue(null);
    repository.save = jest.fn().mockResolvedValue(undefined);

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(repository.save).toHaveBeenCalled();
  });

  it('should throw ConflictException if GTIN already exists', async () => {
    const dto: CreateCatalogProductDto = {
      name: 'Test Product',
      brand: 'Test Brand',
      description: 'Test Description',
      gtin: '1234567890123',
    };
    const command = new CreateCatalogProductCommand(dto);

    repository.findByGTIN = jest.fn().mockResolvedValue({ id: 'existing-id' });

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });
});
