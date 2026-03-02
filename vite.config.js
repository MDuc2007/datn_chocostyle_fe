import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Quản Lý ChocoStyle',
        short_name: 'ChocoStyle',
        description: 'Hệ thống quản lý nhân viên và bán hàng',
        theme_color: '#63391f', // Màu nâu chủ đạo của team bạn
        background_color: '#ffffff',
        display: 'standalone', // Lệnh này giúp ẩn thanh địa chỉ trình duyệt, trông y hệt App thật
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  define: {
    // Định nghĩa global là window để fix lỗi của sockjs-client
    global: "window",
  },
});