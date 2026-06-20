import { setActivePinia, createPinia } from 'pinia';
import { useOrderStore } from '../store';

describe('OrderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with empty state', () => {
    const store = useOrderStore();
    expect(store.orders).toEqual([]);
    expect(store.currentOrder).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.filterStatus).toBeNull();
    expect(store.total).toBe(0);
    expect(store.page).toBe(1);
  });

  it('should set filter and reset page to 1', () => {
    const store = useOrderStore();
    store.page = 5;
    store.setFilter('COMPLETED');
    expect(store.filterStatus).toBe('COMPLETED');
    expect(store.page).toBe(1);
  });

  it('should clear filter when setFilter(null)', () => {
    const store = useOrderStore();
    store.setFilter('FAILED');
    store.setFilter(null);
    expect(store.filterStatus).toBeNull();
  });
});
