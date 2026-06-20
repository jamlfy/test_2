<template>
  <Button @click="loginWithRedirect()">Iniciar sesión</Button>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { Button } from '@shopify/polaris';

const { loginWithRedirect } = useAuth0();
</script>
