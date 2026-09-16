<template>
  <div class="d-flex flex-column min-vh-100">
    <BarraDemo />
    <TheNavbar />

    <main class="flex-grow-1">
      <RouterView />
    </main>

    <TheFooter />
  </div>
</template>

<script setup>
import BarraDemo from '@/components/comum/BarraDemo.vue';
import TheNavbar from '@/components/publico/TheNavbar.vue';
import TheFooter from '@/components/publico/TheFooter.vue';
</script>
