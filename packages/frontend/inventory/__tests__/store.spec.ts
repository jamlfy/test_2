import { setActivePinia, createPinia } from 'pinia';
import { useInventoryStore } from '../store';

describe('InventoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with empty state', () => {
    const store = useInventoryStore();
    expect(store.materials).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });
});
