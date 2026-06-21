<template>
  <div v-if="!isLoading" class="app-shell">
    <header class="topbar">
      <div class="topbar-left">
        <s-icon type="shopify" />
        <span class="topbar-title">Order Management</span>
      </div>
      <div class="topbar-right">
        <template v-if="isAuthenticated">
          <s-popover id="user-menu-popover">
            <s-stack direction="block" gap="base" padding="base">
              <s-text color="subdued">{{ user?.email }}</s-text>
              <s-button variant="tertiary" @click="logout()">Cerrar sesión</s-button>
            </s-stack>
          </s-popover>
          <s-button commandFor="user-menu-popover">
            {{ user?.name || 'Usuario' }}
          </s-button>
        </template>
        <s-button v-else @click="loginWithRedirect()">Iniciar sesión</s-button>
      </div>
      <button v-if="isAuthenticated" class="mobile-nav-toggle" @click="showMobileNav = !showMobileNav" aria-label="Toggle navigation">
        ☰
      </button>
    </header>

    <div class="app-layout" v-if="isAuthenticated">
      <nav class="sidebar" :class="{ open: showMobileNav }">
        <s-stack direction="block" gap="small-200" padding="base">
          <s-button
            v-for="item in navigationItems"
            :key="item.label"
            variant="tertiary"
            :tone="item.selected ? 'auto' : 'neutral'"
            @click="navigate(item.url)"
            style="justify-content: flex-start; width: 100%;"
          >
            <s-icon
              :type="item.label === 'Dashboard' ? 'home' : 'order'"
              size="small"
            />
            {{ item.label }}
          </s-button>
        </s-stack>
      </nav>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
  <div v-else class="loading-screen">
    <s-spinner accessibility-label="Cargando aplicación" size="large" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const router = useRouter();
const route = useRoute();
const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0();
const showMobileNav = ref(false);

const navigationItems = computed(() => [
  { label: 'Dashboard', url: '/', selected: route.path === '/' },
  { label: 'Órdenes', url: '/orders', selected: route.path.startsWith('/orders') },
]);

function navigate(url: string) {
  router.push(url);
  showMobileNav.value = false;
}
</script>

<style>
.app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e1e3e5;
  flex-shrink: 0;
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.topbar-title {
  font-weight: 600;
  font-size: 1rem;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.app-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.sidebar {
  width: 240px;
  background: #f6f6f7;
  border-right: 1px solid #e1e3e5;
  flex-shrink: 0;
  overflow-y: auto;
}
.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f1f2f3;
}
.mobile-nav-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
}
.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 56px;
    left: -240px;
    bottom: 0;
    z-index: 100;
    transition: left 0.2s;
  }
  .sidebar.open {
    left: 0;
  }
  .mobile-nav-toggle {
    display: block;
  }
}
</style>
