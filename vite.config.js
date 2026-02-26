import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  define: {
    // Định nghĩa global là window để fix lỗi của sockjs-client
    global: "window",
  },
});
