import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { OrderProcessor } from '../infrastructure/order.processor';
import { OrderService } from '../application/order.service';
import { InventoryService } from '@test_2/backend-inventory';
import { PackagingService } from '@test_2/backend-packaging';
import { OrderRepository } from '../domain/order.repository';
import { OrderStatus } from '@test_2/share-types';

describe('OrderProcessor', () => {
  let processor: OrderProcessor;
  let orderRepo: jest.Mocked<OrderRepository>;
  let orderService: jest.Mocked<OrderService>;
  let inventoryService: jest.Mocked<InventoryService>;
  let packagingService: jest.Mocked<PackagingService>;

  const mockOrder = {
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

  const mockMaterials = [
    { materialCode: 'BOX_SMALL', quantity: 1 },
    { materialCode: 'LABEL', quantity: 1 },
    { materialCode: 'TAPE', quantity: 1 },
  ];

  beforeEach(async () => {
    orderRepo = {
      findById: jest.fn().mockResolvedValue(mockOrder),
      addEvent: jest.fn(),
    } as any;

    orderService = {
      updateOrderStatus: jest.fn(),
    } as any;

    inventoryService = {
      consumeMaterials: jest.fn(),
    } as any;

    packagingService = {
      calcularMateriales: jest.fn().mockReturnValue(mockMaterials),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderProcessor,
        { provide: 'OrderRepository', useValue: orderRepo },
        { provide: OrderService, useValue: orderService },
        { provide: InventoryService, useValue: inventoryService },
        { provide: PackagingService, useValue: packagingService },
      ],
    }).compile();

    processor = module.get<OrderProcessor>(OrderProcessor);
  });

  function createJob(data: { orderId: string }, opts?: Partial<Job['opts']>): Job {
    return {
      data,
      opts: { attempts: 3, ...opts },
      attemptsMade: 0,
    } as any;
  }

  it('should process an order successfully', async () => {
    const job = createJob({ orderId: 'order-1' });

    await processor.process(job);

    expect(orderService.updateOrderStatus).toHaveBeenCalledWith('order-1', OrderStatus.PROCESSING);
    expect(packagingService.calcularMateriales).toHaveBeenCalledWith(
      [{ productId: 'prod-1', sku: 'SKU001', name: 'Widget', quantity: 2, isFragile: false }],
    );
    expect(inventoryService.consumeMaterials).toHaveBeenCalledWith('order-1', mockMaterials);
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith('order-1', OrderStatus.COMPLETED);
  });

  it('should mark order as FAILED when inventory is insufficient', async () => {
    const job = createJob({ orderId: 'order-1' });
    inventoryService.consumeMaterials.mockRejectedValue(new Error('Stock insuficiente'));

    await expect(processor.process(job)).rejects.toThrow('Stock insuficiente');

    expect(orderService.updateOrderStatus).toHaveBeenCalledWith(
      'order-1', OrderStatus.FAILED, 'Stock insuficiente',
    );
  });

  it('should skip processing if order is not PENDING', async () => {
    orderRepo.findById.mockResolvedValue({
      ...mockOrder,
      status: OrderStatus.COMPLETED,
    });
    const job = createJob({ orderId: 'order-1' });

    await processor.process(job);

    expect(orderService.updateOrderStatus).not.toHaveBeenCalled();
    expect(packagingService.calcularMateriales).not.toHaveBeenCalled();
  });

  it('should throw error on temporary failure to trigger BullMQ retry', async () => {
    const job = createJob({ orderId: 'order-1' });
    inventoryService.consumeMaterials.mockRejectedValue(new Error('DB timeout'));

    await expect(processor.process(job)).rejects.toThrow('DB timeout');
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith(
      'order-1', OrderStatus.FAILED, 'DB timeout',
    );
  });

  it('should calculate packaging with fragile items correctly', async () => {
    orderRepo.findById.mockResolvedValue({
      ...mockOrder,
      hasFragile: true,
      items: [{ ...mockOrder.items[0], isFragile: true }],
    });

    packagingService.calcularMateriales.mockReturnValue([
      ...mockMaterials,
      { materialCode: 'FILLER', quantity: 1 },
    ]);

    const job = createJob({ orderId: 'order-1' });
    await processor.process(job);

    expect(packagingService.calcularMateriales).toHaveBeenCalled();
    expect(inventoryService.consumeMaterials).toHaveBeenCalledWith('order-1', [
      ...mockMaterials,
      { materialCode: 'FILLER', quantity: 1 },
    ]);
  });
});
