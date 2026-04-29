import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3000,
    host: true,           // 允许外部访问
    strictPort: true,
    allowedHosts: true,   // 允许所有 host（解决 ngrok 403 问题）
    // 开发时代理 API 请求到后端，解决跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
