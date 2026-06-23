import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatus, ShopifyWebhookPayload } from '@test_2/share-types';
import { OrderRepository, OrderFilter } from '../domain/order.repository';
import { OrderItemProps } from '../domain/order.entity';
import { OrderReceivedEvent } from '../domain/events/order-received.event';
import { OrderCompletedEvent } from '../domain/events/order-completed.event';
import { OrderFailedEvent } from '../domain/events/order-failed.event';
import { QueueService } from '../infrastructure/queue.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject('OrderRepository')
    private readonly orderRepo: OrderRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly queueService: QueueService,
  ) {}

  async processWebhook(
    payload: ShopifyWebhookPayload,
    storeName: string,
  ): Promise<{ id: string; duplicate: boolean }> {
    const existing = await this.orderRepo.findByShopifyId(payload.id);

    if (existing) {
      return { id: existing.id, duplicate: true };
    }

    const items: OrderItemProps[] = (payload.line_items || []).map((item) => ({
      productId: String(item.product_id),
      sku: item.sku || '',
      name: item.name,
      quantity: item.quantity,
      isFragile: (item.properties || []).some(
        (p) => p.name.toLowerCase() === 'fragile' && p.value.toLowerCase() === 'true',
      ),
    }));

    const order = await this.orderRepo.create(
      payload.id,
      storeName,
      items,
      payload.customer
        ? `${payload.customer.first_name} ${payload.customer.last_name}`.trim()
        : `NO_NAME`,
      payload.customer?.email || payload.contact_email || payload.email || null,
    );

    await this.orderRepo.addEvent(order.id, 'RECEIVED', {
      shopifyOrderId: payload.id,
      storeName,
    });

    this.eventEmitter.emit('order.received', new OrderReceivedEvent(order.id, payload.id, items));

    await this.queueService.addOrderJob(order.id);

    return { id: order.id, duplicate: false };
  }

  async findAll(filter: OrderFilter) {
    return this.orderRepo.findAll(filter);
  }

  async findById(id: string) {
    const order = await this.orderRepo.findById(id);
    if (!order) return null;

    const [materials, events] = await Promise.all([
      this.orderRepo.getMaterials(id),
      this.orderRepo.getEvents(id),
    ]);

    return { ...order, materials, events };
  }

  async getSummary() {
    const summary = await this.orderRepo.getSummary();
    return summary;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, errorMessage?: string | null) {
    await this.orderRepo.updateStatus(orderId, status, errorMessage);

    if (status === OrderStatus.COMPLETED) {
      const order = await this.orderRepo.findById(orderId);
      if (order) {
        const materials = await this.orderRepo.getMaterials(orderId);
        this.eventEmitter.emit(
          'order.completed',
          new OrderCompletedEvent(orderId, Number(order.shopifyOrderId), materials),
        );
      }
    }

    if (status === OrderStatus.FAILED) {
      const order = await this.orderRepo.findById(orderId);
      if (order) {
        this.eventEmitter.emit(
          'order.failed',
          new OrderFailedEvent(
            orderId,
            Number(order.shopifyOrderId),
            errorMessage || 'Error desconocido',
          ),
        );
      }
    }
  }
}
