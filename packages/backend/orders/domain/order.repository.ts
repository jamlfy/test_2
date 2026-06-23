import { OrderStatus } from '@test_2/share-types';
import { OrderItemProps } from './order.entity';

export interface OrderRecord {
  id: string;
  shopifyOrderId: number;
  storeName: string;
  status: OrderStatus;
  customerName: string | null;
  customerEmail: string | null;
  totalProducts: number;
  hasFragile: boolean;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItemRecord[];
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  isFragile: boolean;
}

export interface OrderFilter {
  status?: OrderStatus;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedOrders {
  data: OrderRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderEventRecord {
  id: string;
  type: string;
  payload: Record<string, unknown> | null;
  createdAt: Date;
}

export interface OrderMaterialRecord {
  materialCode: string;
  materialName: string;
  quantity: number;
}

export abstract class OrderRepository {
  abstract create(
    shopifyOrderId: number,
    storeName: string,
    items: OrderItemProps[],
    customerName?: string | null,
    customerEmail?: string | null,
  ): Promise<OrderRecord>;

  abstract findById(id: string): Promise<(OrderRecord & { items: OrderItemRecord[] }) | null>;
  abstract findByShopifyId(shopifyOrderId: number): Promise<OrderRecord | null>;
  abstract findAll(filter: OrderFilter): Promise<PaginatedOrders>;

  abstract updateStatus(
    id: string,
    status: OrderStatus,
    errorMessage?: string | null,
  ): Promise<void>;

  abstract addEvent(
    orderId: string,
    type: string,
    payload?: Record<string, unknown> | null,
  ): Promise<void>;

  abstract getMaterials(orderId: string): Promise<OrderMaterialRecord[]>;
  abstract getEvents(orderId: string): Promise<OrderEventRecord[]>;
  abstract getSummary(): Promise<{
    totalOrders: number;
    completedOrders: number;
    failedOrders: number;
    pendingOrders: number;
    processingOrders: number;
  }>;
}
