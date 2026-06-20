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

export const useSummaryStore = defineStore('summary', {
  state: () => ({
    totalOrders: 0,
    completedOrders: 0,
    failedOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    lowStockMaterials: 0,
    loading: false,
    error: null as string | null,
    intervalId: null as ReturnType<typeof setInterval> | null,
  }),

  actions: {
    async fetchSummary() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/dashboard/summary');
        this.totalOrders = response.data.totalOrders;
        this.completedOrders = response.data.completedOrders;
        this.failedOrders = response.data.failedOrders;
        this.pendingOrders = response.data.pendingOrders;
        this.processingOrders = response.data.processingOrders;
        this.lowStockMaterials = response.data.lowStockMaterials;
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message || 'Error al cargar resumen';
      } finally {
        this.loading = false;
      }
    },

    startPolling(interval = 15000) {
      this.fetchSummary();
      this.intervalId = setInterval(() => {
        this.fetchSummary();
      }, interval);
    },

    stopPolling() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },
  },
});
