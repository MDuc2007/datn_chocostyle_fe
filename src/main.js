import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "axios"; // Import thư viện axios
import { registerSW } from 'virtual:pwa-register'
// --- CẤU HÌNH TOÀN CỤC CHO AXIOS ---
const updateSW = registerSW({
  onNeedRefresh() {
    // Thông báo khi có bản cập nhật mới
    if (confirm('Có phiên bản App mới, bạn có muốn cập nhật không?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App đã sẵn sàng để chạy offline')
  },
})
// 1. Thiết lập đường dẫn gốc (Base URL)
axios.defaults.baseURL = "http://localhost:8080/api";

// 2. Cài đặt Interceptor (Người đưa thư tự động)
axios.interceptors.request.use(
  (config) => {
    // Lấy thông tin user đã lưu trong LocalStorage
    const userStr = localStorage.getItem("user");

    // --- ĐOẠN CODE MỚI QUAN TRỌNG ---
    // Kiểm tra xem URL này có phải là API bên ngoài (Tỉnh/Thành) hay không?
    const isExternalApi =
      config.url && config.url.includes("provinces.open-api.vn");
    // --------------------------------

    if (userStr) {
      const user = JSON.parse(userStr);

      // CHỈ GẮN TOKEN NẾU: Có token VÀ Không phải API bên ngoài
      if (user.accessToken && !isExternalApi) {
        config.headers["Authorization"] = "Bearer " + user.accessToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. Xử lý khi Token hết hạn (Lỗi 401)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu Backend trả về 401 (Hết hạn hoặc không có quyền)
    // Và không phải lỗi từ API tỉnh thành (để tránh đá user ra oan)
    if (error.response && error.response.status === 401) {
      // Chỉ xử lý logout nếu lỗi 401 đến từ Backend của mình (localhost)
      const isMyBackend =
        error.config.url && !error.config.url.includes("provinces.open-api.vn");

      if (isMyBackend && window.location.pathname !== "/login") {
        console.warn("Token hết hạn -> Đăng xuất!");
        localStorage.removeItem("user"); // Xóa token cũ
        window.location.href = "/login"; // Đá về trang đăng nhập
      }
    }
    return Promise.reject(error);
  },
);

createApp(App).use(router).mount("#app");
