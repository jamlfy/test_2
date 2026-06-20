<template>
  <Card>
    <div style="padding: 1rem;">
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;">
        <TextField
          label=""
          placeholder="Buscar..."
          prefix="search"
          :value="searchQuery"
          @change="searchQuery = $event"
        />
        <Select
          label="Estado"
          :options="statusOptions"
          :value="selectedStatus"
          @change="onStatusChange"
        />
      </div>

      <div v-if="store.loading" class="loading-state">
        <Spinner size="large" />
        <p>Cargando órdenes...</p>
      </div>

      <div v-else-if="store.error" class="error-state">
        <Banner status="critical">
          <p>{{ store.error }}</p>
          <Button @click="store.fetchOrders()">Reintentar</Button>
        </Banner>
      </div>

      <div v-else-if="store.orders.length === 0" class="empty-state">
        <EmptyState heading="No hay órdenes" :action="{ content: 'Recargar', onAction: () => store.fetchOrders() }">
          <p>No se encontraron órdenes con los filtros actuales.</p>
        </EmptyState>
      </div>

      <table v-else class="order-table">
        <thead>
          <tr>
            <th>ID Shopify</th>
            <th>Cliente</th>
            <th>Productos</th>
            <th>Frágil</th>
            <th>Estado</th>
            <th>Creada</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in store.orders" :key="order.id">
            <td>{{ order.shopifyOrderId }}</td>
            <td>{{ order.customerName || '—' }}</td>
            <td>{{ order.totalProducts }}</td>
            <td>{{ order.hasFragile ? 'Sí' : 'No' }}</td>
            <td><StatusBadge :status="order.status" /></td>
            <td>{{ new Date(order.createdAt).toLocaleDateString() }}</td>
            <td>
              <Button variant="plain" @click="viewOrder(order.id)">Ver</Button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="store.totalPages > 1" class="pagination">
        <Button
          :disabled="store.page <= 1"
          @click="goToPage(store.page - 1)"
        >
          Anterior
        </Button>
        <span>Página {{ store.page }} de {{ store.totalPages }}</span>
        <Button
          :disabled="store.page >= store.totalPages"
          @click="goToPage(store.page + 1)"
        >
          Siguiente
        </Button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Card, TextField, Select, Spinner, Banner, Button, EmptyState } from '@shopify/polaris';
import { useOrderStore } from './store';
import StatusBadge from './StatusBadge.vue';

const props = defineProps<{ limit?: number }>();
const router = useRouter();
const store = useOrderStore();
const searchQuery = ref('');
const selectedStatus = ref('');

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Procesando', value: 'PROCESSING' },
  { label: 'Completadas', value: 'COMPLETED' },
  { label: 'Fallidas', value: 'FAILED' },
];

onMounted(() => {
  store.fetchOrders({ limit: props.limit || 20 });
});

function onStatusChange(value: string) {
  selectedStatus.value = value;
  store.setFilter(value || null);
}

function goToPage(page: number) {
  store.fetchOrders({ page });
}

function viewOrder(id: string) {
  router.push(`/orders/${id}`);
}
</script>

<style scoped>
.loading-state, .error-state, .empty-state {
  padding: 2rem;
  text-align: center;
}
.order-table {
  width: 100%;
  border-collapse: collapse;
}
.order-table th, .order-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e1e3e5;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}
</style>
