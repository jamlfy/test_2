<template>
  <div v-if="store.loading && !store.totalOrders" class="loading-state">
    <Spinner size="large" />
  </div>

  <div v-else-if="store.error && !store.totalOrders">
    <Banner status="critical">
      <p>{{ store.error }}</p>
      <Button @click="store.fetchSummary()">Reintentar</Button>
    </Banner>
  </div>

  <div v-else class="summary-grid">
    <Card>
      <div class="summary-card">
        <Text variant="headingXl" as="p" alignment="center">{{ store.totalOrders }}</Text>
        <Text variant="bodyMd" as="p" alignment="center" color="subdued">Total Órdenes</Text>
      </div>
    </Card>
    <Card>
      <div class="summary-card">
        <Text variant="headingXl" as="p" alignment="center" color="success">{{ store.completedOrders }}</Text>
        <Text variant="bodyMd" as="p" alignment="center" color="subdued">Completadas</Text>
      </div>
    </Card>
    <Card>
      <div class="summary-card">
        <Text variant="headingXl" as="p" alignment="center" color="critical">{{ store.failedOrders }}</Text>
        <Text variant="bodyMd" as="p" alignment="center" color="subdued">Fallidas</Text>
      </div>
    </Card>
    <Card>
      <div class="summary-card">
        <Text variant="headingXl" as="p" alignment="center">{{ store.pendingOrders }}</Text>
        <Text variant="bodyMd" as="p" alignment="center" color="subdued">Pendientes</Text>
      </div>
    </Card>
    <Card>
      <div class="summary-card">
        <Text variant="headingXl" as="p" alignment="center" color="attention">{{ store.processingOrders }}</Text>
        <Text variant="bodyMd" as="p" alignment="center" color="subdued">Procesando</Text>
      </div>
    </Card>
    <Card>
      <div class="summary-card">
        <Text variant="headingXl" as="p" alignment="center" :color="store.lowStockMaterials > 0 ? 'critical' : 'success'">
          {{ store.lowStockMaterials }}
        </Text>
        <Text variant="bodyMd" as="p" alignment="center" color="subdued">Materiales Críticos</Text>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { Card, Text, Spinner, Banner, Button } from '@shopify/polaris';
import { useSummaryStore } from './store';

const store = useSummaryStore();

onMounted(() => {
  store.startPolling(15000);
});

onUnmounted(() => {
  store.stopPolling();
});
</script>

<style scoped>
.loading-state {
  padding: 3rem;
  text-align: center;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}
.summary-card {
  padding: 1.5rem;
  text-align: center;
}
</style>
