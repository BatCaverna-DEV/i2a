import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// Estilização padrão do projeto — a ordem importa:
//   1. Bootstrap 5 compilado com o tema do I2A (src/styles/main.scss)
//   2. ajustes da bootstrap-vue-next, que dependem das classes do Bootstrap
//   3. ícones
// O JS do Bootstrap NÃO é importado: a bootstrap-vue-next implementa todo o
// comportamento em Vue, e carregar os dois causa dupla inicialização.
import './styles/main.scss';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
