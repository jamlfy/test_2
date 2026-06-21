<template>
  <s-stack direction="block" gap="base">
    <div v-if="store.loading" class="loading-state">
      <s-spinner accessibility-label="Cargando orden" size="large" />
    </div>

    <div v-else-if="store.error">
      <s-banner tone="critical">
        <p>{{ store.error }}</p>
        <template #secondary-actions>
          <s-button variant="secondary" @click="store.fetchOrder(orderId)"> Reintentar </s-button>
        </template>
      </s-banner>
    </div>

    <template v-else-if="store.currentOrder">
      <s-section>
        <s-box
          padding="base"
          background="base"
          border-width="base"
          border-color="base"
          border-radius="base"
        >
          <s-heading>Información de la Orden</s-heading>
          <div class="info-grid">
            <s-text type="strong">ID Shopify:</s-text>
            <s-text>{{ store.currentOrder.shopifyOrderId }}</s-text>
            <s-text type="strong">Cliente:</s-text>
            <s-text>{{ store.currentOrder.customerName || '—' }}</s-text>
            <s-text type="strong">Email:</s-text>
            <s-text>{{ store.currentOrder.customerEmail || '—' }}</s-text>
            <s-text type="strong">Total productos:</s-text>
            <s-text>{{ store.currentOrder.totalProducts }}</s-text>
            <s-text type="strong">Contiene frágiles:</s-text>
            <s-text>{{ store.currentOrder.hasFragile ? 'Sí' : 'No' }}</s-text>
            <s-text type="strong">Estado:</s-text>
            <s-text><StatusBadge :status="store.currentOrder.status" /></s-text>
            <template v-if="store.currentOrder.errorMessage">
              <s-text type="strong">Error:</s-text>
              <s-text>{{ store.currentOrder.errorMessage }}</s-text>
            </template>
          </div>
        </s-box>
      </s-section>

      <s-section>
        <s-box
          padding="base"
          background="base"
          border-width="base"
          border-color="base"
          border-radius="base"
        >
          <s-heading>Productos</s-heading>
          <table class="detail-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Cantidad</th>
                <th>Frágil</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in store.currentOrder.items" :key="item.productId">
                <td>{{ item.name }}</td>
                <td>{{ item.sku }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.isFragile ? 'Sí' : 'No' }}</td>
              </tr>
            </tbody>
          </table>
        </s-box>
      </s-section>

      <s-section>
        <s-box
          padding="base"
          background="base"
          border-width="base"
          border-color="base"
          border-radius="base"
        >
          <s-heading>Materiales Utilizados</s-heading>
          <table v-if="store.currentOrder.materials?.length" class="detail-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Código</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mat in store.currentOrder.materials" :key="mat.materialCode">
                <td>{{ mat.materialName }}</td>
                <td>{{ mat.materialCode }}</td>
                <td>{{ mat.quantity }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else>No se registraron materiales para esta orden.</p>
        </s-box>
      </s-section>

      <s-section>
        <s-box
          padding="base"
          background="base"
          border-width="base"
          border-color="base"
          border-radius="base"
        >
          <s-heading>Línea de Tiempo</s-heading>
          <div class="timeline">
            <div v-for="event in store.currentOrder.events" :key="event.id" class="timeline-item">
              <div class="timeline-dot" :class="event.type.toLowerCase()"></div>
              <div class="timeline-content">
                <s-text type="strong">{{ event.type }}</s-text>
                <s-text color="subdued">
                  {{ new Date(event.createdAt).toLocaleString() }}
                </s-text>
              </div>
            </div>
          </div>
        </s-box>
      </s-section>
    </template>
  </s-stack>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useOrderStore } from './store';
import StatusBadge from './StatusBadge.vue';

const props = defineProps<{ orderId: string }>();
const store = useOrderStore();

onMounted(() => {
  store.fetchOrder(props.orderId);
});
</script>

<style scoped>
.loading-state {
  padding: 3rem;
  text-align: center;
}
.info-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  margin-top: 1rem;
}
.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;
}
.detail-table th,
.detail-table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #e1e3e5;
}
.timeline {
  margin-top: 1rem;
}
.timeline-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-left: 2px solid #e1e3e5;
  padding-left: 1rem;
  position: relative;
}
.timeline-dot {
  position: absolute;
  left: -5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8c9196;
  top: 0.75rem;
}
.timeline-dot.completed {
  background: #3ea754;
}
.timeline-dot.failed {
  background: #d82c0d;
}
.timeline-dot.processing {
  background: #ffc107;
}
.timeline-dot.received {
  background: #5c6ac4;
}
</style>
