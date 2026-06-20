import { CalculatedMaterial } from '@test_2/share-types';
import { Injectable } from '@nestjs/common';

export interface ConsumeResult {
  success: boolean;
  failedMaterial?: string;
  failedReason?: string;
}

@Injectable()
export abstract class InventoryRepository {
  abstract consumeMaterials(
    orderId: string,
    materials: CalculatedMaterial[],
  ): Promise<ConsumeResult>;
  abstract getAll(): Promise<Array<{ code: string; name: string; stock: number }>>;
  abstract getLowStock(threshold: number): Promise<Array<{ code: string; stock: number }>>;
}
