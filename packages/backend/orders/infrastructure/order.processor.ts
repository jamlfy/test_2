import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { OrderRepository } from '../domain/order.repository';
import { OrderService } from '../application/order.service';
import { InventoryService } from '@test_2/backend-inventory';
import { PackagingService } from '@test_2/backend-packaging';
import { OrderStatus } from '@test_2/share-types';

import { QUEUE_NAMES } from '@test_2/share-utils';

@Processor(QUEUE_NAMES.ORDERS)
export class OrderProcessor extends WorkerHost {
  constructor(
    @Inject('OrderRepository')
    private readonly orderRepo: OrderRepository,
    private readonly orderService: OrderService,
    private readonly inventoryService: InventoryService,
    private readonly packagingService: PackagingService,
  ) {
    super();
  }

  async process(job: Job<{ orderId: string }>): Promise<void> {
    const { orderId } = job.data;

    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new Error(`Orden no encontrada: ${orderId}`);
    }

    if (order.status !== OrderStatus.PENDING) {
      return;
    }

    await this.orderService.updateOrderStatus(orderId, OrderStatus.PROCESSING);
    await this.orderRepo.addEvent(orderId, 'PROCESSING');

    try {
      const items = order.items.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        isFragile: item.isFragile,
      }));

      const materiales = this.packagingService.calcularMateriales(items);

      await this.inventoryService.consumeMaterials(orderId, materiales);

      await this.orderService.updateOrderStatus(orderId, OrderStatus.COMPLETED);
      await this.orderRepo.addEvent(orderId, 'COMPLETED', { materiales });
    } catch (error) {
      const message = (error as Error).message;
      await this.orderService.updateOrderStatus(orderId, OrderStatus.FAILED, message);
      await this.orderRepo.addEvent(orderId, 'FAILED', { error: message });

      if (job.attemptsMade < (job.opts?.attempts || 3)) {
        throw error;
      }
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<{ orderId: string }>, error: Error) {
    await this.orderRepo.addEvent(job.data.orderId, 'RETRY', {
      attempt: job.attemptsMade,
      error: error.message,
    });
  }
}
