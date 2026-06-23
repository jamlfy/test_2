<template>
  <s-page :heading="heading">
    <s-link href="/orders">Órdenes</s-link>

    <OrderDetail :order-id="orderId" />
  </s-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { OrderDetail } from '@test_2/frontend-order';

const route = useRoute();
const orderId = computed(() => route.params.id as string);
const heading = computed(() => `Orden #${orderId.value}`);
</script>
