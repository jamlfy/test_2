import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  InventoryService,
  InventoryError,
  InventoryConsumedEvent,
  InventoryInsufficientEvent,
} from '../application/inventory.service';
import { InventoryRepository } from '../domain/inventory.repository';

describe('InventoryService', () => {
  let service: InventoryService;
  let repo: jest.Mocked<InventoryRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    repo = {
      consumeMaterials: jest.fn(),
      getAll: jest.fn(),
      getLowStock: jest.fn(),
    } as any;

    eventEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: 'InventoryRepository', useValue: repo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  describe('consumeMaterials', () => {
    const materials = [
      { materialCode: 'BOX_SMALL', quantity: 1 },
      { materialCode: 'LABEL', quantity: 1 },
      { materialCode: 'TAPE', quantity: 1 },
    ];

    it('should consume materials successfully and emit event', async () => {
      repo.consumeMaterials.mockResolvedValue({ success: true });

      await service.consumeMaterials('order-1', materials);

      expect(repo.consumeMaterials).toHaveBeenCalledWith('order-1', materials);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'inventory.consumed',
        new InventoryConsumedEvent('order-1', materials),
      );
    });

    it('should throw InventoryError when stock is insufficient', async () => {
      repo.consumeMaterials.mockResolvedValue({
        success: false,
        failedMaterial: 'BOX_SMALL',
        failedReason: 'Stock insuficiente para BOX_SMALL. Requerido: 1',
      });

      await expect(service.consumeMaterials('order-1', materials)).rejects.toThrow(InventoryError);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'inventory.insufficient',
        new InventoryInsufficientEvent('order-1', 'BOX_SMALL', 1, 0),
      );
    });

    it('should emit insufficient event with correct requested quantity', async () => {
      repo.consumeMaterials.mockResolvedValue({
        success: false,
        failedMaterial: 'LABEL',
        failedReason: 'Stock insuficiente',
      });

      try {
        await service.consumeMaterials('order-1', materials);
      } catch (e) {
        // expected
        console.log('Error', e);
      }

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'inventory.insufficient',
        new InventoryInsufficientEvent('order-1', 'LABEL', 1, 0),
      );
    });
  });

  describe('getAll', () => {
    it('should return all materials from repository', async () => {
      const materials = [
        { code: 'BOX_SMALL', name: 'Caja pequeña', stock: 100 },
        { code: 'LABEL', name: 'Etiqueta', stock: 500 },
      ];
      repo.getAll.mockResolvedValue(materials);

      const result = await service.getAll();

      expect(result).toEqual(materials);
      expect(repo.getAll).toHaveBeenCalled();
    });
  });

  describe('getLowStock', () => {
    it('should return low stock materials with default threshold', async () => {
      const lowStock = [{ code: 'BOX_LARGE', stock: 5 }];
      repo.getLowStock.mockResolvedValue(lowStock);

      const result = await service.getLowStock();

      expect(result).toEqual(lowStock);
      expect(repo.getLowStock).toHaveBeenCalledWith(10);
    });

    it('should use custom threshold', async () => {
      const lowStock = [{ code: 'FILLER', stock: 15 }];
      repo.getLowStock.mockResolvedValue(lowStock);

      const result = await service.getLowStock(20);

      expect(repo.getLowStock).toHaveBeenCalledWith(20);
      expect(result).toEqual(lowStock);
    });
  });
});
