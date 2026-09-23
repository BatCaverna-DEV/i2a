<template>
  <div class="d-flex flex-column min-vh-100">
    <BarraDemo />

    <header class="i2a-navbar sticky-top">
      <div class="container-fluid px-3">
        <nav class="navbar p-0 py-2">
          <RouterLink :to="{ name: 'admin-dashboard' }" class="navbar-brand d-flex gap-2 align-items-center">
            <span class="i2a-logo">{{ APP.sigla }}</span>
            <span class="i2a-navbar-sub">Administração</span>
          </RouterLink>

          <div class="d-flex align-items-center gap-3">
            <RouterLink :to="{ name: 'home' }" class="i2a-navbar-sub text-decoration-none d-none d-sm-inline">
              Ver site <i class="bi bi-box-arrow-up-right ms-1" />
            </RouterLink>

            <BDropdown
              :text="auth.usuario?.username ?? 'Conta'"
              variant="outline-light"
              size="sm"
              end
            >
              <BDropdownItem :to="{ name: 'admin-perfil' }">Meu perfil</BDropdownItem>
              <BDropdownDivider />
              <BDropdownItem @click="sair">Sair</BDropdownItem>
            </BDropdown>
          </div>
        </nav>
      </div>
    </header>

    <div class="d-flex flex-grow-1">
      <AdminSidebar class="d-none d-lg-block flex-shrink-0" style="width: 240px" />

      <main class="i2a-admin-main flex-grow-1 p-3 p-lg-4" style="min-width: 0">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { BDropdown, BDropdownItem, BDropdownDivider } from 'bootstrap-vue-next';

import AdminSidebar from '@/components/admin/AdminSidebar.vue';
import BarraDemo from '@/components/comum/BarraDemo.vue';
import { useAuthStore } from '@/stores/auth';
import { APP } from '@/config';

const auth = useAuthStore();
const router = useRouter();

function sair() {
  auth.sair();
  router.push({ name: 'admin-login' });
}
</script>
