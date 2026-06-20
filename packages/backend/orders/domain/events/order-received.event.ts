import { OrderItemProps } from '../order.entity';

export class OrderReceivedEvent {
  constructor(
    public readonly orderId: string,
    public readonly shopifyOrderId: number,
    public readonly items: OrderItemProps[],
  ) {}
}
