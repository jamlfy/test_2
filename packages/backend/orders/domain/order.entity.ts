import { OrderStatus } from '@test_2/share-types';

export interface OrderItemProps {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  isFragile: boolean;
}

export interface OrderProps {
  id?: string;
  shopifyOrderId: number;
  storeName: string;
  status?: OrderStatus;
  customerName?: string | null;
  customerEmail?: string | null;
  totalProducts?: number;
  hasFragile?: boolean;
  errorMessage?: string | null;
  items?: OrderItemProps[];
}

export class OrderEntity {
  public readonly id: string;
  public readonly shopifyOrderId: number;
  public readonly storeName: string;
  public status: OrderStatus;
  public customerName: string | null;
  public customerEmail: string | null;
  public totalProducts: number;
  public hasFragile: boolean;
  public errorMessage: string | null;
  public items: OrderItemProps[];

  constructor(props: OrderProps) {
    this.id = props.id || '';
    this.shopifyOrderId = props.shopifyOrderId;
    this.storeName = props.storeName;
    this.status = props.status || OrderStatus.PENDING;
    this.customerName = props.customerName || null;
    this.customerEmail = props.customerEmail || null;
    this.totalProducts = props.totalProducts || 0;
    this.hasFragile = props.hasFragile || false;
    this.errorMessage = props.errorMessage || null;
    this.items = props.items || [];
  }

  static create(
    shopifyOrderId: number,
    storeName: string,
    items: OrderItemProps[],
    customerName?: string | null,
    customerEmail?: string | null,
  ): OrderEntity {
    const totalProducts = items.reduce((sum, i) => sum + i.quantity, 0);
    const hasFragile = items.some((i) => i.isFragile);

    return new OrderEntity({
      shopifyOrderId,
      storeName,
      customerName,
      customerEmail,
      totalProducts,
      hasFragile,
      items,
    });
  }

  startProcessing(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error(`Cannot process order in status ${this.status}`);
    }
    this.status = OrderStatus.PROCESSING;
  }

  complete(): void {
    if (this.status !== OrderStatus.PROCESSING) {
      throw new Error(`Cannot complete order in status ${this.status}`);
    }
    this.status = OrderStatus.COMPLETED;
  }

  fail(errorMessage: string): void {
    if (this.status !== OrderStatus.PROCESSING && this.status !== OrderStatus.PENDING) {
      throw new Error(`Cannot fail order in status ${this.status}`);
    }
    this.status = OrderStatus.FAILED;
    this.errorMessage = errorMessage;
  }
}
