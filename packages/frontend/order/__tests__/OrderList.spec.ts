import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import OrderList from '../OrderList.vue';

jest.mock('vue-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../StatusBadge.vue', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { h } = require('vue');
  return {
    default: {
      name: 'StatusBadge',
      props: { status: { type: String, default: '' } },
      render(this: Record<string, unknown>) {
        return h('span', { class: 'mock-status-badge' }, [String(this.status || '')]);
      },
    },
  };
});

function mountOrderList(options?: { storeOverrides?: Record<string, any>; limit?: number }) {
  const pinia = createTestingPinia({
    initialState: {
      order: {
        orders: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        filterStatus: null,
        loading: false,
        error: null,
        ...options?.storeOverrides,
      },
    },
    stubActions: false,
  });

  return mount(OrderList, {
    props: { limit: options?.limit || 20 },
    global: {
      plugins: [pinia],
      config: {
        compilerOptions: {
          isCustomElement: (tag: string) => tag.startsWith('s-'),
        },
      },
    },
  });
}

describe('OrderList.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state', () => {
    const wrapper = mountOrderList({
      storeOverrides: { loading: true, orders: [] },
    });

    expect(wrapper.text()).toContain('Cargando órdenes');
  });

  it('should show error state with retry button', () => {
    const wrapper = mountOrderList({
      storeOverrides: { error: 'Error de conexión', orders: [] },
    });

    expect(wrapper.text()).toContain('Error de conexión');
    expect(wrapper.text()).toContain('Reintentar');
  });

  it('should show empty state when no orders', () => {
    const wrapper = mountOrderList({
      storeOverrides: { orders: [], loading: false, error: null },
    });

    expect(wrapper.text()).toContain('No hay órdenes');
  });

  it('should render orders in the table', () => {
    const orders = [
      {
        id: '1',
        shopifyOrderId: 1001,
        customerName: 'John Doe',
        totalProducts: 3,
        hasFragile: false,
        status: 'COMPLETED',
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        shopifyOrderId: 1002,
        customerName: 'Jane Smith',
        totalProducts: 1,
        hasFragile: true,
        status: 'PENDING',
        createdAt: '2024-01-16T10:00:00Z',
      },
    ];

    const wrapper = mountOrderList({
      storeOverrides: { orders, total: 2, totalPages: 1, loading: false, error: null },
    });

    expect(wrapper.text()).toContain('1001');
    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('1002');
    expect(wrapper.text()).toContain('Jane Smith');
    expect(wrapper.text()).toContain('Sí');
    expect(wrapper.text()).toContain('No');
  });
});
