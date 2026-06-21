<template>
  <s-button @click="loginWithRedirect()">Iniciar sesión</s-button>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';

const { loginWithRedirect } = useAuth0();
</script>
