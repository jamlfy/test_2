import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient, OrderStatus } from '@test_2/prisma';
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

@Injectable()
export class OrderRepositoryImpl extends OrderRepository {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {
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

    const rows = await this.prisma.$queryRawUnsafe<OrderRecord[]>(
      `INSERT INTO orders ("shopifyOrderId", "storeName", status, "customerName", "customerEmail", "totalProducts", "hasFragile")
       VALUES ($1, $2, 'PENDING', $3, $4, $5, $6)
       RETURNING *`,
      shopifyOrderId,
      storeName,
      customerName || null,
      customerEmail || null,
      totalProducts,
      hasFragile,
    );

    const order = rows[0];

    for (const item of items) {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO order_items ("orderId", "productId", sku, name, quantity, "isFragile")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        order.id,
        item.productId,
        item.sku,
        item.name,
        item.quantity,
        item.isFragile,
      );
    }

    const result = await this.findById(order.id);
    return result!;
  }

  async findById(id: string): Promise<(OrderRecord & { items: OrderItemRecord[] }) | null> {
    const orders = await this.prisma.$queryRawUnsafe<OrderRecord[]>(
      'SELECT * FROM orders WHERE id = $1',
      id,
    );

    if (orders.length === 0) return null;

    const order = orders[0];
    const items = await this.prisma.$queryRawUnsafe<OrderItemRecord[]>(
      'SELECT * FROM order_items WHERE "orderId" = $1',
      id,
    );

    return { ...order, items };
  }

  async findByShopifyId(shopifyOrderId: number): Promise<OrderRecord | null> {
    const orders = await this.prisma.$queryRawUnsafe<OrderRecord[]>(
      'SELECT * FROM orders WHERE "shopifyOrderId" = $1',
      shopifyOrderId,
    );
    return orders[0] || null;
  }

  async findAll(filter: OrderFilter): Promise<PaginatedOrders> {
    const { status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filter;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: unknown[] = [];

    if (status) {
      whereClause = 'WHERE status = $1';
      params.push(status);
    }

    const countResult = await this.prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*) FROM orders ${whereClause}`,
      ...params,
    );
    const total = Number(countResult[0].count);

    const orderBy = `"${sortBy}" ${sortOrder}`;
    const dataParams = [...params, limit, offset];
    const dataPlaceholders = params.length > 0
      ? `WHERE status = $1 ORDER BY ${orderBy} LIMIT $2 OFFSET $3`
      : `ORDER BY ${orderBy} LIMIT $1 OFFSET $2`;

    const data = await this.prisma.$queryRawUnsafe<OrderRecord[]>(
      `SELECT * FROM orders ${dataPlaceholders}`,
      ...dataParams,
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    errorMessage?: string | null,
  ): Promise<void> {
    if (errorMessage) {
      await this.prisma.$executeRawUnsafe(
        `UPDATE orders SET status = $1::"OrderStatus", "errorMessage" = $2, "updatedAt" = NOW() WHERE id = $3`,
        status,
        errorMessage,
        id,
      );
    } else {
      await this.prisma.$executeRawUnsafe(
        `UPDATE orders SET status = $1::"OrderStatus", "updatedAt" = NOW() WHERE id = $2`,
        status,
        id,
      );
    }
  }

  async addEvent(
    orderId: string,
    type: string,
    payload?: Record<string, unknown> | null,
  ): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO order_events (id, "orderId", type, payload) VALUES (gen_random_uuid(), $1, $2, $3::jsonb)`,
      orderId,
      type,
      payload ? JSON.stringify(payload) : null,
    );
  }

  async getMaterials(orderId: string): Promise<OrderMaterialRecord[]> {
    return this.prisma.$queryRawUnsafe<OrderMaterialRecord[]>(
      `SELECT om."materialCode", m.name as "materialName", om.quantity
       FROM order_materials om
       JOIN materials m ON m.code = om."materialCode"
       WHERE om."orderId" = $1`,
      orderId,
    );
  }

  async getEvents(orderId: string): Promise<OrderEventRecord[]> {
    return this.prisma.$queryRawUnsafe<OrderEventRecord[]>(
      `SELECT id, type, payload, "createdAt" FROM order_events WHERE "orderId" = $1 ORDER BY "createdAt" ASC`,
      orderId,
    );
  }

  async getSummary(): Promise<{
    totalOrders: number;
    completedOrders: number;
    failedOrders: number;
    pendingOrders: number;
    processingOrders: number;
  }> {
    const result = await this.prisma.$queryRawUnsafe<
      Array<{
        status: string;
        count: bigint;
      }>
    >('SELECT status, COUNT(*)::int as count FROM orders GROUP BY status');

    const summary = {
      totalOrders: 0,
      completedOrders: 0,
      failedOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
    };

    for (const row of result) {
      summary.totalOrders += Number(row.count);
      switch (row.status) {
        case 'COMPLETED':
          summary.completedOrders = Number(row.count);
          break;
        case 'FAILED':
          summary.failedOrders = Number(row.count);
          break;
        case 'PENDING':
          summary.pendingOrders = Number(row.count);
          break;
        case 'PROCESSING':
          summary.processingOrders = Number(row.count);
          break;
      }
    }

    return summary;
  }
}
