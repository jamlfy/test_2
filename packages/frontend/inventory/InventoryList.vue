<template>
  <Card>
    <div style="padding: 1rem;">
      <Text variant="headingMd" as="h3">Inventario de Materiales</Text>

      <div v-if="store.loading" class="loading-state">
        <Spinner size="large" />
      </div>

      <div v-else-if="store.error">
        <Banner status="critical">
          <p>{{ store.error }}</p>
          <Button @click="store.fetchInventory()">Reintentar</Button>
        </Banner>
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
          <tr
            v-for="mat in store.materials"
            :key="mat.code"
            :class="{ 'low-stock': mat.stock < 10 }"
          >
            <td>{{ mat.code }}</td>
            <td>{{ mat.name }}</td>
            <td>{{ mat.stock }}</td>
            <td>
              <Badge :status="mat.stock < 10 ? 'critical' : 'success'">
                {{ mat.stock < 10 ? 'Bajo stock' : 'Disponible' }}
              </Badge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Card, Text, Spinner, Banner, Button, Badge } from '@shopify/polaris';
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
.inventory-table th, .inventory-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e1e3e5;
}
.inventory-table tr.low-stock {
  background: #fff4f4;
}
</style>
