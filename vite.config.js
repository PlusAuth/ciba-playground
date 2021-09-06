import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'


export default defineConfig({
  root: __dirname,
  server: {
    port: Number(process.env.SERVER_PORT || 8801)
  },
  plugins: [vue()]
})
