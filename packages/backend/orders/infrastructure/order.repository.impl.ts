import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient, OrderStatus, Prisma } from '@test_2/prisma';
import { OrderItemProps } from '../domain/order.entity';
import {
  OrderRepository,
  OrderRecord,
  OrderItemRecord,
  OrderFilter,
  PaginatedOrders,
  OrderEventRecord,
  OrderMaterialRecord,
} from '../domain/order.repository';

const SORTABLE_FIELDS = new Set(['createdAt', 'updatedAt', 'status', 'storeName', 'totalProducts']);

function toOrderRecord(o: any): any {
  return { ...o, shopifyOrderId: Number(o.shopifyOrderId) };
}

@Injectable()
export class OrderRepositoryImpl extends OrderRepository {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {
    super();
  }

  async create(
    shopifyOrderId: number,
    storeName: string,
    items: OrderItemProps[],
    customerName?: string | null,
    customerEmail?: string | null,
  ): Promise<OrderRecord> {
    const totalProducts = items.reduce((sum, i) => sum + i.quantity, 0);
    const hasFragile = items.some((i) => i.isFragile);

    const order = await this.prisma.order.create({
      data: {
        shopifyOrderId,
        storeName,
        status: OrderStatus.PENDING,
        customerName: customerName ?? null,
        customerEmail: customerEmail ?? null,
        totalProducts,
        hasFragile,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            sku: item.sku,
            name: item.name,
            quantity: item.quantity,
            isFragile: item.isFragile,
          })),
        },
      },
      include: { items: true },
    });

    return toOrderRecord(order);
  }

  async findById(id: string): Promise<(OrderRecord & { items: OrderItemRecord[] }) | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return null;
    return toOrderRecord(order);
  }

  async findByShopifyId(shopifyOrderId: number): Promise<OrderRecord | null> {
    const order = await this.prisma.order.findUnique({
      where: { shopifyOrderId },
    });
    if (!order) return null;
    return toOrderRecord(order);
  }

  async findAll(filter: OrderFilter): Promise<PaginatedOrders> {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { id: { contains: search, mode: 'insensitive' } },
              { storeName: { contains: search, mode: 'insensitive' } },
              { customerName: { contains: search, mode: 'insensitive' } },
              { customerEmail: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderField = SORTABLE_FIELDS.has(sortBy) ? sortBy : 'createdAt';

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { [orderField]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: data.map((o) => toOrderRecord(o)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, status: OrderStatus, errorMessage?: string | null): Promise<void> {
    await this.prisma.order.update({
      where: { id },
      data: {
        status,
        errorMessage: errorMessage ?? null,
      },
    });
  }

  async addEvent(
    orderId: string,
    type: string,
    payload?: Record<string, unknown> | null,
  ): Promise<void> {
    await this.prisma.orderEvent.create({
      data: {
        orderId,
        type,
        payload: payload as any,
      },
    });
  }

  async getMaterials(orderId: string): Promise<OrderMaterialRecord[]> {
    const materials = await this.prisma.orderMaterial.findMany({
      where: { orderId },
      include: { material: true },
    });

    return materials.map((m) => ({
      materialCode: m.materialCode,
      materialName: m.material.name,
      quantity: m.quantity,
    }));
  }

  async getEvents(orderId: string): Promise<OrderEventRecord[]> {
    return this.prisma.orderEvent.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, type: true, payload: true, createdAt: true },
    }) as any;
  }

  async getSummary(): Promise<{
    totalOrders: number;
    completedOrders: number;
    failedOrders: number;
    pendingOrders: number;
    processingOrders: number;
  }> {
    const groups = await this.prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    const summary = {
      totalOrders: 0,
      completedOrders: 0,
      failedOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
    };

    for (const group of groups) {
      const count = group._count;
      summary.totalOrders += count;
      switch (group.status) {
        case OrderStatus.COMPLETED:
          summary.completedOrders = count;
          break;
        case OrderStatus.FAILED:
          summary.failedOrders = count;
          break;
        case OrderStatus.PENDING:
          summary.pendingOrders = count;
          break;
        case OrderStatus.PROCESSING:
          summary.processingOrders = count;
          break;
      }
    }

    return summary;
  }
}
