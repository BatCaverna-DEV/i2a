<template>
  <!--
    <BApp> fornece o registry, o gerenciador de modais e o orquestrador de toasts
    exigidos pelos composables useModal/useToast. Nunca chame esses composables
    aqui dentro — apenas nos componentes filhos.
  -->
  <BApp>
    <RouterView />
  </BApp>
</template>

<script setup>
import { onMounted } from 'vue';
import { BApp } from 'bootstrap-vue-next';

import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

// restaura a sessão a partir do token guardado no navegador
onMounted(() => auth.restaurarSessao());
</script>
