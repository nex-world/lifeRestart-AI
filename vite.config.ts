import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from '@primevue/auto-import-resolver';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    }),
  ],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),

      '@api': path.resolve(__dirname, 'src', 'api'),
      '@assets': path.resolve(__dirname, 'src', 'assets'),
      '@components': path.resolve(__dirname, 'src', 'components'),
      '@config': path.resolve(__dirname, 'src', 'config'),
      '@directives': path.resolve(__dirname, 'src', 'directives'),
      '@filters': path.resolve(__dirname, 'src', 'filters'),
      '@hooks': path.resolve(__dirname, 'src', 'hooks'),
      '@layout': path.resolve(__dirname, 'src', 'layout'),
      '@layouts': path.resolve(__dirname, 'src', 'layouts'),
      '@locale': path.resolve(__dirname, 'src', 'locale'),
      '@mock': path.resolve(__dirname, 'src', 'mock'),
      '@views': path.resolve(__dirname, 'src', 'views'),
      '@router': path.resolve(__dirname, 'src', 'router'),
      '@store': path.resolve(__dirname, 'src', 'store'),
      '@stores': path.resolve(__dirname, 'src', 'stores'),
      '@types': path.resolve(__dirname, 'src', 'types'),
      '@utils': path.resolve(__dirname, 'src', 'utils'),

      '@lib': path.resolve(__dirname, 'src', 'lib'),
      '@styles': path.resolve(__dirname, 'src', 'styles'),
      '@pages': path.resolve(__dirname, 'src', 'pages'),
      '@tabs': path.resolve(__dirname, 'src', 'tabs'),
      '@panels': path.resolve(__dirname, 'src', 'panels'),
    },
  },
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        manualChunks: {
          // 'MyDemo': ['./src/lib/MyDemo'],
          // three: ['three'],
          // d3: ['d3'],

          lodash: ['lodash'],
          tools1: [
            // 'axios',
            'blueimp-md5',
            'clipboard',
            // 'dexie',
            'file-saver',
            // 'jschardet',
            'json5',
            // 'localforage',
            // 'lodash',
            'nanoid',
            'pako',
            'yaml',
            'zipson'
          ],
          tools2: [
            'axios',
            'dexie',
            'localforage',
          ],
          jschardet: ['jschardet'],

          vue: ['vue', 'vue-router', 'vue-i18n', 'pinia'],
          // vueuse: ['@vueuse/core', '@vueuse/rxjs'],
          primevue: ['primevue'],
          // transformers: ['@huggingface/transformers'],
          // icons: ['@kalimahapps/vue-icons'],
        }
      }
    }
  },
  base: '/lifeRestart-AI/',
})
