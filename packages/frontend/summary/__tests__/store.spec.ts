import { setActivePinia, createPinia } from 'pinia';
import { useSummaryStore } from '../store';

describe('SummaryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with zeros', () => {
    const store = useSummaryStore();
    expect(store.totalOrders).toBe(0);
    expect(store.completedOrders).toBe(0);
    expect(store.failedOrders).toBe(0);
    expect(store.pendingOrders).toBe(0);
    expect(store.processingOrders).toBe(0);
    expect(store.lowStockMaterials).toBe(0);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('should stop polling on stopPolling', () => {
    const store = useSummaryStore();
    store.startPolling(500);
    expect(store.intervalId).not.toBeNull();
    store.stopPolling();
    expect(store.intervalId).toBeNull();
  });
});
