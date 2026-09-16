import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { BootstrapVueNextResolver } from 'bootstrap-vue-next/resolver';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      // auto-importa os componentes <B...> da bootstrap-vue-next
      Components({ resolvers: [BootstrapVueNextResolver()] })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 5173,
      proxy: {
        // evita CORS em desenvolvimento
        '/api': {
          target: env.VITE_API_PROXY ?? 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  };
});
