<template>
  <Page title="Dashboard">
    <Layout>
      <Layout.Section>
        <SummaryCards />
      </Layout.Section>
      <Layout.Section>
        <InventoryList />
      </Layout.Section>
      <Layout.Section>
        <OrderList :limit="10" />
      </Layout.Section>
    </Layout>
  </Page>
</template>

<script setup lang="ts">
import { Page, Layout } from '@shopify/polaris';
import { SummaryCards } from '@test_2/frontend-summary';
import { InventoryList } from '@test_2/frontend-inventory';
import { OrderList } from '@test_2/frontend-order';
</script>
