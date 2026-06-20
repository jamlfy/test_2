import { PackagingService } from '../application/packaging.service';
import { BoxType, PackagingItem } from '../domain/packaging.types';

describe('PackagingService', () => {
  let service: PackagingService;

  beforeEach(() => {
    service = new PackagingService();
  });

  describe('calcularBoxType', () => {
    it('should return BOX_SMALL for 1 product', () => {
      expect(service.calcularBoxType(1)).toBe(BoxType.BOX_SMALL);
    });

    it('should return BOX_SMALL for 2 products', () => {
      expect(service.calcularBoxType(2)).toBe(BoxType.BOX_SMALL);
    });

    it('should return BOX_MEDIUM for 3 products', () => {
      expect(service.calcularBoxType(3)).toBe(BoxType.BOX_MEDIUM);
    });

    it('should return BOX_MEDIUM for 5 products', () => {
      expect(service.calcularBoxType(5)).toBe(BoxType.BOX_MEDIUM);
    });

    it('should return BOX_LARGE for 6 products', () => {
      expect(service.calcularBoxType(6)).toBe(BoxType.BOX_LARGE);
    });

    it('should return BOX_LARGE for 10 products', () => {
      expect(service.calcularBoxType(10)).toBe(BoxType.BOX_LARGE);
    });
  });

  describe('calcularMateriales', () => {
    it('should include BOX_SMALL, LABEL and TAPE for 1 non-fragile item', () => {
      const items: PackagingItem[] = [
        { productId: 'p1', sku: 'SKU1', name: 'Product 1', quantity: 1, isFragile: false },
      ];

      const result = service.calcularMateriales(items);

      expect(result).toEqual(
        expect.arrayContaining([
          { materialCode: 'BOX_SMALL', quantity: 1 },
          { materialCode: 'LABEL', quantity: 1 },
          { materialCode: 'TAPE', quantity: 1 },
        ]),
      );
      expect(result).toHaveLength(3);
    });

    it('should include FILLER when items contain fragile products', () => {
      const items: PackagingItem[] = [
        { productId: 'p1', sku: 'SKU1', name: 'Glass Vase', quantity: 1, isFragile: true },
      ];

      const result = service.calcularMateriales(items);

      expect(result).toContainEqual({ materialCode: 'FILLER', quantity: 1 });
      expect(result).toHaveLength(4);
    });

    it('should not include FILLER when no fragile items', () => {
      const items: PackagingItem[] = [
        { productId: 'p1', sku: 'SKU1', name: 'Product 1', quantity: 2, isFragile: false },
        { productId: 'p2', sku: 'SKU2', name: 'Product 2', quantity: 1, isFragile: false },
      ];

      const result = service.calcularMateriales(items);

      const filler = result.find((m) => m.materialCode === 'FILLER');
      expect(filler).toBeUndefined();
      expect(result).toHaveLength(3);
    });

    it('should return BOX_MEDIUM for 3-5 products total', () => {
      const items: PackagingItem[] = [
        { productId: 'p1', sku: 'SKU1', name: 'Product 1', quantity: 2, isFragile: false },
        { productId: 'p2', sku: 'SKU2', name: 'Product 2', quantity: 2, isFragile: false },
      ];

      const result = service.calcularMateriales(items);

      expect(result).toContainEqual({ materialCode: 'BOX_MEDIUM', quantity: 1 });
    });

    it('should calculate total quantity across multiple items of same product', () => {
      const items: PackagingItem[] = [
        { productId: 'p1', sku: 'SKU1', name: 'Product 1', quantity: 4, isFragile: false },
        { productId: 'p2', sku: 'SKU2', name: 'Product 2', quantity: 3, isFragile: false },
      ];

      const result = service.calcularMateriales(items);

      expect(result).toContainEqual({ materialCode: 'BOX_LARGE', quantity: 1 });
    });

    it('should include FILLER when at least one item is fragile among many', () => {
      const items: PackagingItem[] = [
        { productId: 'p1', sku: 'SKU1', name: 'Product 1', quantity: 1, isFragile: false },
        { productId: 'p2', sku: 'SKU2', name: 'Glass', quantity: 1, isFragile: true },
        { productId: 'p3', sku: 'SKU3', name: 'Product 3', quantity: 1, isFragile: false },
      ];

      const result = service.calcularMateriales(items);

      expect(result).toContainEqual({ materialCode: 'FILLER', quantity: 1 });
      expect(result).toContainEqual({ materialCode: 'BOX_MEDIUM', quantity: 1 });
    });
  });
});
