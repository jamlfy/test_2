<template>
  <s-page :heading="`Orden #${orderId}`">
    <template #breadcrumb-actions>
      <s-link href="/orders">Órdenes</s-link>
    </template>
    <OrderDetail :order-id="orderId" />
  </s-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { OrderDetail } from '@test_2/frontend-order';

const route = useRoute();
const orderId = computed(() => route.params.id as string);
</script>
