import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@test_2/share-types';

export class OrderItemResponseDto {
  @ApiProperty() productId: string;
  @ApiProperty() sku: string;
  @ApiProperty() name: string;
  @ApiProperty() quantity: number;
  @ApiProperty() isFragile: boolean;
}

export class OrderResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() shopifyOrderId: number;
  @ApiProperty() storeName: string;
  @ApiProperty({ enum: OrderStatus }) status: OrderStatus;
  @ApiProperty() customerName: string | null;
  @ApiProperty() customerEmail: string | null;
  @ApiProperty() totalProducts: number;
  @ApiProperty() hasFragile: boolean;
  @ApiProperty() errorMessage: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [OrderItemResponseDto] }) items: OrderItemResponseDto[];
}

export class MaterialConsumptionDto {
  @ApiProperty() materialCode: string;
  @ApiProperty() materialName: string;
  @ApiProperty() quantity: number;
}

export class OrderEventDto {
  @ApiProperty() id: string;
  @ApiProperty() type: string;
  @ApiProperty() payload: Record<string, unknown> | null;
  @ApiProperty() createdAt: Date;
}

export class OrderDetailResponseDto extends OrderResponseDto {
  @ApiProperty({ type: [MaterialConsumptionDto] }) materials: MaterialConsumptionDto[];
  @ApiProperty({ type: [OrderEventDto] }) events: OrderEventDto[];
}

export class PaginatedOrdersDto {
  @ApiProperty({ type: [OrderResponseDto] }) data: OrderResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}

export class OrderFilterDto {
  @ApiProperty({ enum: OrderStatus, required: false }) status?: OrderStatus;
  @ApiProperty({ required: false, default: 1 }) page?: number;
  @ApiProperty({ required: false, default: 20 }) limit?: number;
  @ApiProperty({ required: false, default: 'createdAt' }) sortBy?: string;
  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' }) sortOrder?: 'asc' | 'desc';
}

export class DashboardSummaryDto {
  @ApiProperty() totalOrders: number;
  @ApiProperty() completedOrders: number;
  @ApiProperty() failedOrders: number;
  @ApiProperty() pendingOrders: number;
  @ApiProperty() processingOrders: number;
  @ApiProperty() lowStockMaterials: number;
}

export class LowStockMaterialDto {
  @ApiProperty() material: string;
  @ApiProperty() stock: number;
}
