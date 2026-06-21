import { OrderEntity, OrderItemProps } from '../domain/order.entity';
import { OrderStatus } from '@test_2/share-types';

describe('OrderEntity', () => {
  const mockItems: OrderItemProps[] = [
    { productId: 'p1', sku: 'SKU1', name: 'Product 1', quantity: 2, isFragile: false },
  ];

  describe('create', () => {
    it('should create order with PENDING status by default', () => {
      const order = OrderEntity.create(12345, 'test-store', mockItems);

      expect(order.shopifyOrderId).toBe(12345);
      expect(order.storeName).toBe('test-store');
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.totalProducts).toBe(2);
      expect(order.hasFragile).toBe(false);
    });

    it('should detect fragile items', () => {
      const itemsWithFragile: OrderItemProps[] = [
        ...mockItems,
        { productId: 'p2', sku: 'SKU2', name: 'Glass', quantity: 1, isFragile: true },
      ];

      const order = OrderEntity.create(12346, 'test-store', itemsWithFragile);

      expect(order.hasFragile).toBe(true);
      expect(order.totalProducts).toBe(3);
    });

    it('should set customer info when provided', () => {
      const order = OrderEntity.create(
        12347,
        'test-store',
        mockItems,
        'John Doe',
        'john@example.com',
      );

      expect(order.customerName).toBe('John Doe');
      expect(order.customerEmail).toBe('john@example.com');
    });
  });

  describe('startProcessing', () => {
    it('should transition from PENDING to PROCESSING', () => {
      const order = OrderEntity.create(12345, 'test-store', mockItems);
      order.startProcessing();
      expect(order.status).toBe(OrderStatus.PROCESSING);
    });

    it('should throw if order is not PENDING', () => {
      const order = OrderEntity.create(12345, 'test-store', mockItems);
      order.startProcessing();
      expect(() => order.startProcessing()).toThrow();
    });
  });

  describe('complete', () => {
    it('should transition from PROCESSING to COMPLETED', () => {
      const order = OrderEntity.create(12345, 'test-store', mockItems);
      order.startProcessing();
      order.complete();
      expect(order.status).toBe(OrderStatus.COMPLETED);
    });

    it('should throw if order is not PROCESSING', () => {
      const order = OrderEntity.create(12345, 'test-store', mockItems);
      expect(() => order.complete()).toThrow();
    });
  });

  describe('fail', () => {
    it('should transition from PROCESSING to FAILED with message', () => {
      const order = OrderEntity.create(12345, 'test-store', mockItems);
      order.startProcessing();
      order.fail('Stock insuficiente');
      expect(order.status).toBe(OrderStatus.FAILED);
      expect(order.errorMessage).toBe('Stock insuficiente');
    });

    it('should transition from PENDING to FAILED', () => {
      const order = OrderEntity.create(12345, 'test-store', mockItems);
      order.fail('Error de validación');
      expect(order.status).toBe(OrderStatus.FAILED);
    });

    it('should throw if order is already COMPLETED', () => {
      const order = OrderEntity.create(12345, 'test-store', mockItems);
      order.startProcessing();
      order.complete();
      expect(() => order.fail('error')).toThrow();
    });
  });
});
