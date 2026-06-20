import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  envDir: '../../',
  plugins: [vue()],
  resolve: {
    alias: {
      '@test_2/frontend-auth': '../../packages/frontend/auth',
      '@test_2/frontend-order': '../../packages/frontend/order',
      '@test_2/frontend-inventory': '../../packages/frontend/inventory',
      '@test_2/frontend-summary': '../../packages/frontend/summary',
      '@test_2/share-types': '../../packages/share/types',
      '@test_2/share-utils': '../../packages/share/utils',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
