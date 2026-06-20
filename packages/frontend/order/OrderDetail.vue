<template>
  <Layout>
    <div v-if="store.loading" class="loading-state">
      <Spinner size="large" />
    </div>

    <div v-else-if="store.error">
      <Banner status="critical">
        <p>{{ store.error }}</p>
        <Button @click="store.fetchOrder(orderId)">Reintentar</Button>
      </Banner>
    </div>

    <template v-else-if="store.currentOrder">
      <Layout.Section>
        <Card>
          <div style="padding: 1rem;">
            <Text variant="headingMd" as="h3">Información de la Orden</Text>
            <div class="info-grid">
              <div><strong>ID Shopify:</strong> {{ store.currentOrder.shopifyOrderId }}</div>
              <div><strong>Cliente:</strong> {{ store.currentOrder.customerName || '—' }}</div>
              <div><strong>Email:</strong> {{ store.currentOrder.customerEmail || '—' }}</div>
              <div><strong>Total productos:</strong> {{ store.currentOrder.totalProducts }}</div>
              <div><strong>Contiene frágiles:</strong> {{ store.currentOrder.hasFragile ? 'Sí' : 'No' }}</div>
              <div>
                <strong>Estado:</strong>
                <StatusBadge :status="store.currentOrder.status" />
              </div>
              <div v-if="store.currentOrder.errorMessage">
                <strong>Error:</strong> {{ store.currentOrder.errorMessage }}
              </div>
            </div>
          </div>
        </Card>
      </Layout.Section>

      <Layout.Section>
        <Card>
          <div style="padding: 1rem;">
            <Text variant="headingMd" as="h3">Productos</Text>
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
          </div>
        </Card>
      </Layout.Section>

      <Layout.Section>
        <Card>
          <div style="padding: 1rem;">
            <Text variant="headingMd" as="h3">Materiales Utilizados</Text>
            <table class="detail-table" v-if="store.currentOrder.materials?.length">
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
          </div>
        </Card>
      </Layout.Section>

      <Layout.Section>
        <Card>
          <div style="padding: 1rem;">
            <Text variant="headingMd" as="h3">Línea de Tiempo</Text>
            <div class="timeline">
              <div v-for="event in store.currentOrder.events" :key="event.id" class="timeline-item">
                <div class="timeline-dot" :class="event.type.toLowerCase()"></div>
                <div class="timeline-content">
                  <Text variant="bodyMd" as="p" fontWeight="bold">{{ event.type }}</Text>
                  <Text variant="bodySm" as="p" color="subdued">
                    {{ new Date(event.createdAt).toLocaleString() }}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Layout.Section>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Layout, Card, Spinner, Banner, Button, Text } from '@shopify/polaris';
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
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1rem;
}
.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;
}
.detail-table th, .detail-table td {
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
.timeline-dot.completed { background: #3ea754; }
.timeline-dot.failed { background: #d82c0d; }
.timeline-dot.processing { background: #ffc107; }
.timeline-dot.received { background: #5c6ac4; }
</style>
