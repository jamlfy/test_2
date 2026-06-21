<template>
  <s-box
    padding="base"
    background="base"
    border-width="base"
    border-color="base"
    border-radius="base"
  >
    <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center">
      <s-text-field
        v-model="searchQuery"
        label="Buscar"
        label-accessibility-visibility="exclusive"
        placeholder="Buscar..."
        icon="search"
      />
      <s-select v-model="selectedStatus" label="Estado" label-accessibility-visibility="exclusive">
        <s-option value="">Todos</s-option>
        <s-option value="PENDING">Pendientes</s-option>
        <s-option value="PROCESSING">Procesando</s-option>
        <s-option value="COMPLETED">Completadas</s-option>
        <s-option value="FAILED">Fallidas</s-option>
      </s-select>
    </div>

    <div v-if="store.loading" class="loading-state">
      <s-spinner accessibility-label="Cargando órdenes" size="large" />
      <p>Cargando órdenes...</p>
    </div>

    <div v-else-if="store.error" class="error-state">
      <s-banner tone="critical">
        <p>{{ store.error }}</p>
        <template #secondary-actions>
          <s-button variant="secondary" @click="store.fetchOrders()"> Reintentar </s-button>
        </template>
      </s-banner>
    </div>

    <div v-else-if="store.orders.length === 0" class="empty-state">
      <s-heading>No hay órdenes</s-heading>
      <s-text>No se encontraron órdenes con los filtros actuales.</s-text>
      <s-button variant="secondary" @click="store.fetchOrders()">Recargar</s-button>
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
            <s-button variant="tertiary" @click="viewOrder(order.id)">Ver</s-button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="store.totalPages > 1" class="pagination">
      <s-button :disabled="store.page <= 1" @click="goToPage(store.page - 1)"> Anterior </s-button>
      <span>Página {{ store.page }} de {{ store.totalPages }}</span>
      <s-button :disabled="store.page >= store.totalPages" @click="goToPage(store.page + 1)">
        Siguiente
      </s-button>
    </div>
  </s-box>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useOrderStore } from './store';
import StatusBadge from './StatusBadge.vue';

const props = defineProps<{ limit?: number }>();
const router = useRouter();
const store = useOrderStore();
const searchQuery = ref('');
const selectedStatus = ref('');

onMounted(() => {
  store.fetchOrders({ limit: props.limit || 20 });
});

watch([searchQuery, selectedStatus], () => {
  store.setFilter({
    status: selectedStatus.value === 'Todo' ? null : selectedStatus.value,
    search: searchQuery.value,
  });
});

function goToPage(page: number) {
  store.fetchOrders({ page });
}

function viewOrder(id: string) {
  router.push(`/orders/${id}`);
}
</script>

<style scoped>
.loading-state,
.error-state,
.empty-state {
  padding: 2rem;
  text-align: center;
}
.order-table {
  width: 100%;
  border-collapse: collapse;
}
.order-table th,
.order-table td {
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
