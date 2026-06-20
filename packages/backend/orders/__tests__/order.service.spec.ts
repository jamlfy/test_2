import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderService } from '../application/order.service';
import { OrderRepository, OrderRecord, OrderItemRecord } from '../domain/order.repository';
import { QueueService } from '../infrastructure/queue.service';
import { OrderStatus, ShopifyWebhookPayload } from '@test_2/share-types';

describe('OrderService', () => {
  let service: OrderService;
  let repo: jest.Mocked<OrderRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let queueService: jest.Mocked<QueueService>;

  const mockOrder: OrderRecord & { items: OrderItemRecord[] } = {
    id: 'order-1',
    shopifyOrderId: 12345,
    storeName: 'test-store',
    status: OrderStatus.PENDING,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    totalProducts: 2,
    hasFragile: false,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        productId: 'prod-1',
        sku: 'SKU001',
        name: 'Widget',
        quantity: 2,
        isFragile: false,
      },
    ],
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockResolvedValue(mockOrder),
      findById: jest.fn().mockResolvedValue(mockOrder),
      findByShopifyId: jest.fn().mockResolvedValue(null),
      findAll: jest.fn().mockResolvedValue({
        data: [mockOrder],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
      updateStatus: jest.fn(),
      addEvent: jest.fn(),
      getMaterials: jest.fn().mockResolvedValue([
        { materialCode: 'BOX_SMALL', materialName: 'Caja pequeña', quantity: 1 },
        { materialCode: 'LABEL', materialName: 'Etiqueta', quantity: 1 },
      ]),
      getEvents: jest.fn().mockResolvedValue([
        { id: 'evt-1', type: 'RECEIVED', payload: null, createdAt: new Date() },
      ]),
      getSummary: jest.fn().mockResolvedValue({
        totalOrders: 10,
        completedOrders: 7,
        failedOrders: 1,
        pendingOrders: 1,
        processingOrders: 1,
      }),
    } as any;

    eventEmitter = {
      emit: jest.fn(),
    } as any;

    queueService = {
      addOrderJob: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: 'OrderRepository', useValue: repo },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: QueueService, useValue: queueService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('processWebhook', () => {
    const webhookPayload: ShopifyWebhookPayload = {
      id: 12345,
      email: 'john@example.com',
      contact_email: null,
      customer: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      },
      line_items: [
        {
          id: 1,
          product_id: 100,
          sku: 'SKU001',
          name: 'Widget',
          quantity: 2,
          properties: [],
        },
      ],
      created_at: '2024-01-01T00:00:00Z',
      name: '#1001',
      note: null,
    };

    it('should create a new order and enqueue it', async () => {
      repo.findByShopifyId.mockResolvedValue(null);

      const result = await service.processWebhook(webhookPayload, 'test-store');

      expect(repo.create).toHaveBeenCalledWith(
        12345, 'test-store',
        [{ productId: '100', sku: 'SKU001', name: 'Widget', quantity: 2, isFragile: false }],
        'John Doe', 'john@example.com',
      );
      expect(repo.addEvent).toHaveBeenCalledWith('order-1', 'RECEIVED', {
        shopifyOrderId: 12345,
        storeName: 'test-store',
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'order.received',
        expect.objectContaining({ orderId: 'order-1', shopifyOrderId: 12345 }),
      );
      expect(queueService.addOrderJob).toHaveBeenCalledWith('order-1');
      expect(result).toEqual({ id: 'order-1', duplicate: false });
    });

    it('should return duplicate if order already exists', async () => {
      repo.findByShopifyId.mockResolvedValue(mockOrder);

      const result = await service.processWebhook(webhookPayload, 'test-store');

      expect(repo.create).not.toHaveBeenCalled();
      expect(queueService.addOrderJob).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'order-1', duplicate: true });
    });

    it('should handle fragile items from properties', async () => {
      const fragilePayload: ShopifyWebhookPayload = {
        ...webhookPayload,
        line_items: [{
          ...webhookPayload.line_items[0],
          properties: [{ name: 'fragile', value: 'true' }],
        }],
      };

      await service.processWebhook(fragilePayload, 'test-store');

      expect(repo.create).toHaveBeenCalledWith(
        12345, 'test-store',
        [{ productId: '100', sku: 'SKU001', name: 'Widget', quantity: 2, isFragile: true }],
        'John Doe', 'john@example.com',
      );
    });
  });

  describe('findById', () => {
    it('should return order with materials and events', async () => {
      repo.findById.mockResolvedValue(mockOrder);

      const result = await service.findById('order-1');
      expect(result).toEqual({
        ...mockOrder,
        materials: [
          { materialCode: 'BOX_SMALL', materialName: 'Caja pequeña', quantity: 1 },
          { materialCode: 'LABEL', materialName: 'Etiqueta', quantity: 1 },
        ],
        events: [{ id: 'evt-1', type: 'RECEIVED', payload: null, createdAt: expect.any(Date) }],
      });
    });

    it('should return null if order not found', async () => {
      repo.findById.mockResolvedValue(null);
      const result = await service.findById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getSummary', () => {
    it('should return dashboard summary', async () => {
      const result = await service.getSummary();
      expect(result).toEqual({
        totalOrders: 10,
        completedOrders: 7,
        failedOrders: 1,
        pendingOrders: 1,
        processingOrders: 1,
      });
    });
  });
});
