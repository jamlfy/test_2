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

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    materials: [] as Array<{ code: string; name: string; stock: number }>,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchInventory() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/inventory');
        this.materials = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message || 'Error al cargar inventario';
      } finally {
        this.loading = false;
      }
    },
  },
});
