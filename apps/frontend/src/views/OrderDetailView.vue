<template>
  <Page
    :title="`Orden #${orderId}`"
    breadcrumbs={[{ content: 'Órdenes', url: '/orders' }]}
  >
    <OrderDetail :order-id="orderId" />
  </Page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Page } from '@shopify/polaris';
import { OrderDetail } from '@test_2/frontend-order';

const route = useRoute();
const orderId = computed(() => route.params.id as string);
</script>
