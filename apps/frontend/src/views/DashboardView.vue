<template>
  <s-page heading="Dashboard" inline-size="large">
    <s-section>
      <SummaryCards />
    </s-section>
    <s-section>
      <InventoryList />
    </s-section>
  </s-page>
</template>

<script setup lang="ts">
import { SummaryCards } from '@test_2/frontend-summary';
import { InventoryList } from '@test_2/frontend-inventory';
</script>
