<template>
  <div class="d-flex flex-column min-vh-100">
    <BNavbar variant="dark" class="px-3">
      <BNavbarBrand :to="{ name: 'admin-dashboard' }" class="fw-semibold">
        <i class="bi bi-cpu me-2" />I2A · Administração
      </BNavbarBrand>

      <BNavbarNav class="ms-auto flex-row align-items-center gap-3">
        <BNavItem :to="{ name: 'home' }" target="_blank">
          <i class="bi bi-box-arrow-up-right me-1" />Ver site
        </BNavItem>

        <BDropdown :text="auth.usuario?.username ?? 'Conta'" variant="outline-light" size="sm" end>
          <BDropdownItem :to="{ name: 'admin-perfil' }">
            <i class="bi bi-person-gear me-2" />Meu perfil
          </BDropdownItem>
          <BDropdownDivider />
          <BDropdownItem @click="sair">
            <i class="bi bi-box-arrow-right me-2" />Sair
          </BDropdownItem>
        </BDropdown>
      </BNavbarNav>
    </BNavbar>

    <div class="d-flex flex-grow-1">
      <AdminSidebar class="d-none d-lg-block" style="width: 260px" />

      <main class="flex-grow-1 p-3 p-lg-4 bg-body-tertiary">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import {
  BNavbar,
  BNavbarBrand,
  BNavbarNav,
  BNavItem,
  BDropdown,
  BDropdownItem,
  BDropdownDivider
} from 'bootstrap-vue-next';

import AdminSidebar from '@/components/admin/AdminSidebar.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

function sair() {
  auth.sair();
  router.push({ name: 'admin-login' });
}
</script>
