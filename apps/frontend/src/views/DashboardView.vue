<template>
  <s-page heading="Dashboard" inline-size="large">
    <s-section>
      <SummaryCards />
    </s-section>
    <s-section>
      <InventoryList />
    </s-section>
    <s-section>
      <OrderList :limit="10" />
    </s-section>
  </s-page>
</template>

<script setup lang="ts">
import { SummaryCards } from '@test_2/frontend-summary';
import { InventoryList } from '@test_2/frontend-inventory';
import { OrderList } from '@test_2/frontend-order';
</script>
