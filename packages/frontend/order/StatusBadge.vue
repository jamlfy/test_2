<template>
  <s-badge :tone="badgeTone">{{ label }}</s-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ status: string }>();

const badgeTone = computed(() => {
  switch (props.status) {
    case 'COMPLETED':
      return 'success';
    case 'FAILED':
      return 'critical';
    case 'PROCESSING':
      return 'warning';
    case 'PENDING':
      return 'info';
    default:
      return 'info';
  }
});

const label = computed(() => {
  switch (props.status) {
    case 'COMPLETED':
      return 'Completada';
    case 'FAILED':
      return 'Fallida';
    case 'PROCESSING':
      return 'Procesando';
    case 'PENDING':
      return 'Pendiente';
    default:
      return props.status;
  }
});
</script>
