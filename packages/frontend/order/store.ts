import { defineStore } from 'pinia';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [] as any[],
    currentOrder: null as any | null,
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    filterStatus: null as string | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchOrders(params?: { status?: string; page?: number; limit?: number }) {
      this.loading = true;
      this.error = null;

      try {
        const query: Record<string, any> = {
          page: params?.page || this.page,
          limit: params?.limit || this.limit,
        };
        if (params?.status || this.filterStatus) {
          query.status = params?.status || this.filterStatus;
        }

        const response = await api.get('/orders', { params: query });
        this.orders = response.data.data;
        this.total = response.data.total;
        this.page = response.data.page;
        this.limit = response.data.limit;
        this.totalPages = response.data.totalPages;
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message || 'Error al cargar órdenes';
      } finally {
        this.loading = false;
      }
    },

    async fetchOrder(id: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/orders/${id}`);
        this.currentOrder = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message || 'Error al cargar orden';
      } finally {
        this.loading = false;
      }
    },

    setFilter(status: string | null) {
      this.filterStatus = status;
      this.page = 1;
      this.fetchOrders();
    },
  },
});
