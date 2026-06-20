<template>
  <Badge :status="badgeStatus">{{ label }}</Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Badge } from '@shopify/polaris';

const props = defineProps<{ status: string }>();

const badgeStatus = computed(() => {
  switch (props.status) {
    case 'COMPLETED': return 'success';
    case 'FAILED': return 'critical';
    case 'PROCESSING': return 'attention';
    case 'PENDING': return 'info';
    default: return 'new';
  }
});

const label = computed(() => {
  switch (props.status) {
    case 'COMPLETED': return 'Completada';
    case 'FAILED': return 'Fallida';
    case 'PROCESSING': return 'Procesando';
    case 'PENDING': return 'Pendiente';
    default: return props.status;
  }
});
</script>
