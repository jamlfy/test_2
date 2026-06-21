<template>
  <s-box
    padding="base"
    background="base"
    border-width="base"
    border-color="base"
    border-radius="base"
  >
    <s-heading>Inventario de Materiales</s-heading>

    <div v-if="store.loading" class="loading-state">
      <s-spinner accessibility-label="Cargando inventario" size="large" />
    </div>

    <div v-else-if="store.error">
      <s-banner tone="critical">
        <p>{{ store.error }}</p>
        <template #secondary-actions>
          <s-button variant="secondary" @click="store.fetchInventory()"> Reintentar </s-button>
        </template>
      </s-banner>
    </div>

    <table v-else class="inventory-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Material</th>
          <th>Stock</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mat in store.materials" :key="mat.code" :class="{ 'low-stock': mat.stock < 10 }">
          <td>{{ mat.code }}</td>
          <td>{{ mat.name }}</td>
          <td>{{ mat.stock }}</td>
          <td>
            <s-badge :tone="mat.stock < 10 ? 'critical' : 'success'">
              {{ mat.stock < 10 ? 'Bajo stock' : 'Disponible' }}
            </s-badge>
          </td>
        </tr>
      </tbody>
    </table>
  </s-box>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInventoryStore } from './store';

const store = useInventoryStore();

onMounted(() => {
  store.fetchInventory();
});
</script>

<style scoped>
.loading-state {
  padding: 2rem;
  text-align: center;
}
.inventory-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;
}
.inventory-table th,
.inventory-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e1e3e5;
}
.inventory-table tr.low-stock {
  background: #fff4f4;
}
</style>
