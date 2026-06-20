import { OrderStatus } from './order-status';

export interface OrderItemDto {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  isFragile: boolean;
}

export interface OrderDto {
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
  items: OrderItemDto[];
}

export interface OrderDetailDto extends OrderDto {
  materials: MaterialConsumptionDto[];
  events: OrderEventDto[];
}

export interface MaterialConsumptionDto {
  materialCode: string;
  materialName: string;
  quantity: number;
}

export interface OrderEventDto {
  id: string;
  type: string;
  payload: Record<string, unknown> | null;
  createdAt: Date;
}

export interface OrderFilterDto {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
