import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CalculatedMaterial } from '@test_2/share-types';
import { InventoryRepository } from '../domain/inventory.repository';

export class InventoryConsumedEvent {
  constructor(
    public readonly orderId: string,
    public readonly materials: CalculatedMaterial[],
  ) {}
}

export class InventoryInsufficientEvent {
  constructor(
    public readonly orderId: string,
    public readonly materialCode: string,
    public readonly requested: number,
    public readonly available: number,
  ) {}
}

@Injectable()
export class InventoryService {
  constructor(
    @Inject('InventoryRepository')
    private readonly repo: InventoryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async consumeMaterials(orderId: string, materials: CalculatedMaterial[]): Promise<void> {
    const result = await this.repo.consumeMaterials(orderId, materials);

    if (!result.success) {
      this.eventEmitter.emit(
        'inventory.insufficient',
        new InventoryInsufficientEvent(
          orderId,
          result.failedMaterial!,
          materials.find((m) => m.materialCode === result.failedMaterial)?.quantity || 0,
          0,
        ),
      );
      throw new InventoryError(result.failedReason || 'Stock insuficiente');
    }

    this.eventEmitter.emit('inventory.consumed', new InventoryConsumedEvent(orderId, materials));
  }

  async getAll() {
    return this.repo.getAll();
  }

  async getLowStock(threshold = 10) {
    return this.repo.getLowStock(threshold);
  }
}

export class InventoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InventoryError';
  }
}
