<template>
  <BNavbar toggleable="lg" variant="primary" sticky="top">
    <BContainer>
      <BNavbarBrand :to="{ name: 'home' }" class="fw-bold">
        <i class="bi bi-cpu me-2" />Grupo I2A
      </BNavbarBrand>

      <BNavbarToggle target="nav-publico" />

      <BCollapse id="nav-publico" is-nav>
        <BNavbarNav class="ms-auto align-items-lg-center gap-lg-1">
          <BNavItem :to="{ name: 'sobre' }">Sobre</BNavItem>
          <BNavItem :to="{ name: 'pesquisadores' }">Pesquisadores</BNavItem>
          <BNavItem :to="{ name: 'projetos' }">Projetos</BNavItem>
          <BNavItem :to="{ name: 'cursos' }">Cursos</BNavItem>
          <BNavItem :to="{ name: 'producoes' }">Produção</BNavItem>
          <BNavItem :to="{ name: 'admin-login' }" class="ms-lg-2">
            <span class="badge text-bg-light text-primary">
              <i class="bi bi-lock me-1" />Área restrita
            </span>
          </BNavItem>
        </BNavbarNav>
      </BCollapse>
    </BContainer>
  </BNavbar>
</template>

<script setup>
import {
  BNavbar,
  BNavbarBrand,
  BNavbarToggle,
  BNavbarNav,
  BNavItem,
  BCollapse,
  BContainer
} from 'bootstrap-vue-next';
</script>
