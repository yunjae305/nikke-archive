import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/nikke-archive/' : '/',
  plugins: [vue(), vueJsx()],
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // The below values point to local addresses: this is correct, because TTS models can be run locally.
  // This is still manually configurable from within the UI.
  server: {
    host: '127.0.0.1',
    port: 3000,
    proxy: {
      '/alltalk': {
        target: 'http://127.0.0.1:7851',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/alltalk/, '')
      },
      '/gptsovits': {
        target: 'http://127.0.0.1:9880',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gptsovits/, '')
      },
      '/chatterbox': {
        target: 'http://127.0.0.1:4123',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chatterbox/, '')
      },
      '/opencode-go': {
        target: 'https://opencode.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opencode-go/, '')
      }
    }
  }
})
