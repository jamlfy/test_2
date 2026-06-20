<template>
  <Page title="404">
    <EmptyState
      heading="Página no encontrada"
      action={{ content: 'Volver al dashboard', url: '/' }}
    >
      <p>La página que buscas no existe.</p>
    </EmptyState>
  </Page>
</template>

<script setup lang="ts">
import { Page, EmptyState } from '@shopify/polaris';
</script>
