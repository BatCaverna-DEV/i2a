import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { BootstrapVueNextResolver } from 'bootstrap-vue-next/resolvers';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      // auto-importa os componentes <B...> da bootstrap-vue-next.
      // Os imports explícitos nos .vue continuam valendo — este plugin só
      // evita que um componente novo precise ser importado à mão.
      Components({ resolvers: [BootstrapVueNextResolver()] })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          // compilador moderno do Dart Sass (o legado será removido no Sass 2.0)
          api: 'modern-compiler',
          // o Bootstrap 5.3 ainda usa @import e funções antigas internamente;
          // silencia o ruído dele sem esconder avisos do nosso próprio SCSS
          silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function']
        }
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
