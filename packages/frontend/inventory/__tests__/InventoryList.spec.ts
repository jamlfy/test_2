import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import InventoryList from '../InventoryList.vue';

function mountInventoryList(options?: { storeOverrides?: Record<string, any> }) {
  const pinia = createTestingPinia({
    initialState: {
      inventory: {
        materials: [],
        loading: false,
        error: null,
        ...options?.storeOverrides,
      },
    },
    stubActions: false,
  });

  return mount(InventoryList, {
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

describe('InventoryList.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state', () => {
    const wrapper = mountInventoryList({
      storeOverrides: { loading: true, materials: [] },
    });

    expect(wrapper.find('s-spinner').exists()).toBe(true);
    expect(wrapper.find('s-spinner').attributes('accessibility-label')).toBe('Cargando inventario');
  });

  it('should show error state', () => {
    const wrapper = mountInventoryList({
      storeOverrides: { error: 'Error al cargar', materials: [] },
    });

    expect(wrapper.text()).toContain('Error al cargar');
  });

  it('should render materials in the table', () => {
    const materials = [
      { code: 'BOX_SMALL', name: 'Caja pequeña', stock: 100 },
      { code: 'BOX_LARGE', name: 'Caja grande', stock: 5 },
      { code: 'LABEL', name: 'Etiqueta', stock: 500 },
    ];

    const wrapper = mountInventoryList({
      storeOverrides: { materials, loading: false, error: null },
    });

    expect(wrapper.text()).toContain('BOX_SMALL');
    expect(wrapper.text()).toContain('Caja pequeña');
    expect(wrapper.text()).toContain('100');
    expect(wrapper.text()).toContain('BOX_LARGE');
    expect(wrapper.text()).toContain('Caja grande');
    expect(wrapper.text()).toContain('5');
    expect(wrapper.text()).toContain('LABEL');
  });

  it('should show low stock badge for materials with stock < 10', () => {
    const materials = [{ code: 'BOX_LARGE', name: 'Caja grande', stock: 5 }];

    const wrapper = mountInventoryList({
      storeOverrides: { materials, loading: false, error: null },
    });

    expect(wrapper.text()).toContain('Bajo stock');
  });

  it('should show available badge for materials with stock >= 10', () => {
    const materials = [{ code: 'LABEL', name: 'Etiqueta', stock: 500 }];

    const wrapper = mountInventoryList({
      storeOverrides: { materials, loading: false, error: null },
    });

    expect(wrapper.text()).toContain('Disponible');
  });
});
