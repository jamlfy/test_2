<template>
  <div v-if="!isLoading" style="height: 100vh;">
    <AppProvider i18n={}>
      <Frame
        :showMobileNavigation="showMobileNav"
        :navigation="renderNavigation()"
        :topBar="renderTopBar()"
        @toggleMobileNavigation="showMobileNav = !showMobileNav"
      >
        <router-view />
      </Frame>
    </AppProvider>
  </div>
  <div v-else class="loading-screen">
    <Spinner size="large" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import {
  AppProvider,
  Frame,
  TopBar,
  Navigation,
  Spinner,
  Icon,
} from '@shopify/polaris';
import {
  HomeMajor,
  OrdersMajor,
  InventoryMajor,
} from '@shopify/polaris-icons';

const router = useRouter();
const route = useRoute();
const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0();
const showMobileNav = ref(false);

const navigationItems = computed(() => [
  {
    label: 'Dashboard',
    icon: HomeMajor,
    url: '/',
    selected: route.path === '/',
  },
  {
    label: 'Órdenes',
    icon: OrdersMajor,
    url: '/orders',
    selected: route.path.startsWith('/orders'),
  },
]);

function renderNavigation() {
  return (
    <Navigation location="/">
      <Navigation.Section items={navigationItems.value} />
    </Navigation>
  );
}

function renderTopBar() {
  return (
    <TopBar
      showNavigationToggle
      onToggleMobileNavigation={() => (showMobileNav.value = !showMobileNav.value)}
      userMenu={
        isAuthenticated.value ? (
          <TopBar.UserMenu
            name={user.value?.name || ''}
            detail={user.value?.email || ''}
            actions={[
              {
                items: [{ content: 'Cerrar sesión', onAction: () => logout() }],
              },
            ]}
          />
        ) : (
          <TopBar.UserMenu
            name="Invitado"
            actions={[
              {
                items: [{ content: 'Iniciar sesión', onAction: () => loginWithRedirect() }],
              },
            ]}
          />
        )
      }
    />
  );
}
</script>

<style>
.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
