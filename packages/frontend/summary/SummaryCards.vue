<template>
  <div v-if="store.loading && !store.totalOrders" class="loading-state">
    <s-spinner accessibility-label="Cargando resumen" size="large" />
  </div>

  <div v-else-if="store.error && !store.totalOrders">
    <s-banner tone="critical">
      <p>{{ store.error }}</p>
      <s-button slot="secondary-actions" variant="secondary" @click="store.fetchSummary()">
        Reintentar
      </s-button>
    </s-banner>
  </div>

  <div v-else class="summary-grid">
    <s-box padding="base" background="base" border-width="base" border-color="base" border-radius="base">
      <div class="summary-card">
        <s-heading>{{ store.totalOrders }}</s-heading>
        <s-text color="subdued">Total Órdenes</s-text>
      </div>
    </s-box>
    <s-box padding="base" background="base" border-width="base" border-color="base" border-radius="base">
      <div class="summary-card">
        <s-heading>{{ store.completedOrders }}</s-heading>
        <s-text color="subdued">Completadas</s-text>
      </div>
    </s-box>
    <s-box padding="base" background="base" border-width="base" border-color="base" border-radius="base">
      <div class="summary-card">
        <s-heading>{{ store.failedOrders }}</s-heading>
        <s-text color="subdued">Fallidas</s-text>
      </div>
    </s-box>
    <s-box padding="base" background="base" border-width="base" border-color="base" border-radius="base">
      <div class="summary-card">
        <s-heading>{{ store.pendingOrders }}</s-heading>
        <s-text color="subdued">Pendientes</s-text>
      </div>
    </s-box>
    <s-box padding="base" background="base" border-width="base" border-color="base" border-radius="base">
      <div class="summary-card">
        <s-heading>{{ store.processingOrders }}</s-heading>
        <s-text color="subdued">Procesando</s-text>
      </div>
    </s-box>
    <s-box padding="base" background="base" border-width="base" border-color="base" border-radius="base">
      <div class="summary-card">
        <s-heading>{{ store.lowStockMaterials }}</s-heading>
        <s-text color="subdued">Materiales Críticos</s-text>
      </div>
    </s-box>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
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
