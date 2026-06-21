import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@test_2/prisma';
import { CalculatedMaterial } from '@test_2/share-types';
import { InventoryRepository, ConsumeResult } from '../domain/inventory.repository';

@Injectable()
export class InventoryRepositoryImpl extends InventoryRepository {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {
    super();
  }

  async consumeMaterials(orderId: string, materials: CalculatedMaterial[]): Promise<ConsumeResult> {
    try {
      await this.prisma.$executeRawUnsafe('BEGIN');

      for (const mat of materials) {
        const result = await this.prisma.$executeRawUnsafe(
          'UPDATE materials SET stock = stock - $1, "updatedAt" = NOW() WHERE code = $2 AND stock >= $1',
          mat.quantity,
          mat.materialCode,
        );

        if (result === 0) {
          await this.prisma.$executeRawUnsafe('ROLLBACK');
          return {
            success: false,
            failedMaterial: mat.materialCode,
            failedReason: `Stock insuficiente para ${mat.materialCode}. Requerido: ${mat.quantity}`,
          };
        }

        await this.prisma.$executeRawUnsafe(
          'INSERT INTO order_materials (id, "orderId", "materialCode", quantity) VALUES (gen_random_uuid(), $1, $2, $3)',
          orderId,
          mat.materialCode,
          mat.quantity,
        );
      }

      await this.prisma.$executeRawUnsafe('COMMIT');
      return { success: true };
    } catch (error) {
      await this.prisma.$executeRawUnsafe('ROLLBACK').catch(() => {});
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
