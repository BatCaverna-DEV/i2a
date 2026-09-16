<template>
  <div class="d-flex flex-column min-vh-100">
    <TheNavbar />

    <main class="flex-grow-1">
      <RouterView />
    </main>

    <TheFooter />
  </div>
</template>

<script setup>
import TheNavbar from '@/components/publico/TheNavbar.vue';
import TheFooter from '@/components/publico/TheFooter.vue';
</script>
