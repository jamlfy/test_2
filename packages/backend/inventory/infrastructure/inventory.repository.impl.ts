import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@test_2/prisma';
import { CalculatedMaterial } from '@test_2/share-types';
import { InventoryRepository, ConsumeResult } from '../domain/inventory.repository';

class MaterialError extends Error {
  constructor(
    public readonly materialCode: string,
    public readonly quantity: number,
  ) {
    super(`Stock insuficiente para ${materialCode}`);
    this.name = 'MaterialError';
  }
}

@Injectable()
export class InventoryRepositoryImpl extends InventoryRepository {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {
    super();
  }

  async consumeMaterials(orderId: string, materials: CalculatedMaterial[]): Promise<ConsumeResult> {
    try {
      await this.prisma.$transaction(async (tx) => {
        for (const mat of materials) {
          const result = await tx.$executeRawUnsafe(
            'UPDATE materials SET stock = stock - $1, "updatedAt" = NOW() WHERE code = $2 AND stock >= $1',
            mat.quantity,
            mat.materialCode,
          );

          if (result === 0) {
            throw new MaterialError(mat.materialCode, mat.quantity);
          }

          await tx.$executeRawUnsafe(
            'INSERT INTO order_materials (id, "orderId", "materialCode", quantity) VALUES (gen_random_uuid(), $1, $2, $3)',
            orderId,
            mat.materialCode,
            mat.quantity,
          );
        }
      });
      return { success: true };
    } catch (error) {
      if (error instanceof MaterialError) {
        return {
          success: false,
          failedMaterial: error.materialCode,
          failedReason: `Stock insuficiente para ${error.materialCode}. Requerido: ${error.quantity}`,
        };
      }
      return {
        success: false,
        failedReason: `Error de base de datos: ${(error as Error).message}`,
      };
    }
  }

  async getAll() {
    return this.prisma.$queryRawUnsafe<Array<{ code: string; name: string; stock: number }>>(
      'SELECT code, name, stock FROM materials ORDER BY code',
    );
  }

  async getLowStock(threshold: number) {
    return this.prisma.$queryRawUnsafe<Array<{ code: string; stock: number }>>(
      'SELECT code, stock FROM materials WHERE stock < $1 ORDER BY stock ASC',
      threshold,
    );
  }
}
