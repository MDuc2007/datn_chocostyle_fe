<template>
  <div class="app-container">
    <Header></Header>

    <main class="tracking-page">
      <div class="breadcrumb-wrapper">
        <div class="breadcrumb">
          <span @click="$router.push('/')">Trang chủ</span>
          <span class="separator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
          <span class="current">Tra cứu đơn hàng</span>
        </div>
      </div>

      <div class="tracking-container">
        <div class="search-card">
          <div class="icon-wrapper">
            <div class="icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                <line x1="1" y1="10" x2="6" y2="10"></line>
              </svg>
            </div>
          </div>

          <h2 class="title">Tra Cứu Đơn Hàng</h2>
          <p class="subtitle">
            Vui lòng nhập mã đơn hàng của bạn để theo dõi tình trạng vận chuyển mới nhất.
          </p>

          <div class="search-wrapper">
            <div class="input-group" :class="{ 'focused': isFocusedCode }">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" v-model="searchCode" placeholder="Mã đơn hàng (HD...)" @focus="isFocusedCode = true"
                @blur="isFocusedCode = false" />
            </div>

            <div v-if="!isLoggedIn" class="input-group" :class="{ 'focused': isFocusedPhone }">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
                </path>
              </svg>
              <input type="text" v-model="searchPhone" placeholder="Số điện thoại mua hàng..."
                @focus="isFocusedPhone = true" @blur="isFocusedPhone = false" @keyup.enter="handleSearch" />
            </div>
          </div>
          <button class="btn-search" @click="handleSearch" :disabled="isLoading">
            <span v-if="!isLoading">Tra cứu ngay</span>
            <div v-else class="spinner-small"></div>
          </button>

          <div class="help-text">
            * Mã đơn hàng được gửi trong Email xác nhận hoặc xem tại mục "Đơn mua của tôi".
          </div>
        </div>
      </div>
    </main>

    <Footer></Footer>

    <transition name="toast-slide">
      <div v-if="toast.show" class="modern-toast" :class="'toast-' + toast.type">
        <div class="toast-icon-wrap">
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="toast-text">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";

const searchCode = ref("");
const isLoading = ref(false);
const isFocused = ref(false);
const router = useRouter();
const route = useRoute();
const searchPhone = ref(""); // Thêm ref mới
const isLoggedIn = ref(false);

const handleSearch = async () => {
  // Logic kiểm tra validation linh hoạt
  if (!searchCode.value.trim()) {
    showToast("Vui lòng nhập mã đơn hàng!", "warning");
    return;
  }

  // Nếu chưa đăng nhập thì bắt buộc phải có số điện thoại
  if (!isLoggedIn.value && !searchPhone.value.trim()) {
    showToast("Vui lòng nhập số điện thoại để xác thực!", "warning");
    return;
  }

  isLoading.value = true;
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  try {
    // Nếu đã đăng nhập, tham số sdt sẽ để trống (Backend sẽ tự lấy từ Token)
    const sdtParam = isLoggedIn.value ? "" : searchPhone.value.trim();
    const url = `http://localhost:8080/api/hoa-don/tra-cuu?maDonHang=${searchCode.value.trim()}&sdt=${sdtParam}`;

    const headers = { "Content-Type": "application/json" };
    if (user?.accessToken) {
      headers["Authorization"] = `Bearer ${user.accessToken}`;
    }

    const response = await fetch(url, { method: "GET", headers });

    if (response.ok) {
      const data = await response.json();
      showToast("Đã tìm thấy đơn hàng!", "success");
      setTimeout(() => {
        router.push({ name: "ClientOrderDetail", params: { id: data.id } });
      }, 800);
    } else {
      const errorText = await response.text();
      showToast(errorText || "Thông tin không chính xác!", "error");
    }
  } catch (error) {
    showToast("Lỗi kết nối server!", "error");
  } finally {
    isLoading.value = false;
  }
};

// Dùng Reactive cho Toast ổn định hơn
const toast = reactive({ show: false, message: "", type: "success" });
const showToast = (msg, type = "success") => {
  toast.message = msg;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};
onMounted(() => {
  // Kiểm tra đăng nhập
  const userStr = localStorage.getItem("user");
  isLoggedIn.value = !!userStr;

  const codeFromUrl = route.query.code;
  if (codeFromUrl) {
    searchCode.value = codeFromUrl;
    // Nếu đã đăng nhập thì tự động bấm nút tra cứu luôn
    if (isLoggedIn.value) {
      handleSearch();
    }
  }
});
</script>

<style scoped>
/* ================= THIẾT LẬP CHUNG ================= */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f4f6f8;
  font-family: 'Inter', sans-serif;
}

.tracking-page {
  flex-grow: 1;
}

/* ================= BREADCRUMB ================= */
.breadcrumb-wrapper {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.breadcrumb {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
}

.breadcrumb span {
  cursor: pointer;
  transition: color 0.2s;
}

.breadcrumb span:hover {
  color: #6b3f1e;
}

.breadcrumb .separator {
  margin: 0 8px;
  display: flex;
  align-items: center;
}

.breadcrumb .separator svg {
  width: 14px;
  height: 14px;
}

.breadcrumb .current {
  font-weight: 500;
  color: #111827;
  cursor: default;
}

/* ================= KHU VỰC TRA CỨU ================= */
.tracking-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
}

.search-card {
  background: #fff;
  border-radius: 20px;
  padding: 50px 40px;
  width: 100%;
  max-width: 650px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
}

/* Icon Container */
.icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.icon-circle {
  width: 80px;
  height: 80px;
  background: #fdf6f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b3f1e;
}

.icon-circle svg {
  width: 40px;
  height: 40px;
}

/* Text */
.title {
  font-size: 28px;
  color: #111827;
  margin: 0 0 12px 0;
  font-weight: 800;
}

.subtitle {
  color: #6b7280;
  margin: 0 0 40px 0;
  font-size: 15px;
  line-height: 1.6;
}

/* Form Input & Button */
.search-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.input-group {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.input-group.focused {
  border-color: #6b3f1e;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(107, 63, 30, 0.1);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: #9ca3af;
  flex-shrink: 0;
}

.input-group.focused .search-icon {
  color: #6b3f1e;
}

.input-group input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 16px 12px;
  font-size: 16px;
  color: #111827;
  outline: none;
}

.input-group input::placeholder {
  color: #9ca3af;
}

.btn-search {
  width: 100%;
  height: 52px;
  margin-top: 10px;
  border-radius: 14px;
  border: none;
  cursor: pointer;

  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #6b3f1e, #8b5a2b);
  color: #fff;

  transition: all 0.3s ease;
}

.btn-search:hover:not(:disabled) {
  transform: translateY(-3px);
}

.btn-search:active:not(:disabled) {
  transform: translateY(0);
}

.btn-search:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

.help-text {
  font-size: 13px;
  color: #9ca3af;
  text-align: left;
  padding-left: 5px;
  margin-top: 10px;
}

/* Loading Spinner */
.spinner-small {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ================== TOAST ================== */
.modern-toast {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 10001;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 300px;
}

.toast-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.toast-success .toast-icon-wrap {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.toast-error .toast-icon-wrap {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.toast-warning .toast-icon-wrap {
  background: #ffc107;
  color: #333;
  border-left: 4px solid #ff9800;
}

.toast-icon-wrap svg {
  width: 16px;
  height: 16px;
}

.toast-text {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}

/* ================= RESPONSIVE ================= */
@media (max-width: 768px) {
  .tracking-container {
    padding: 30px 20px;
  }

  .search-card {
    padding: 40px 20px;
  }

  .search-wrapper {
    flex-direction: column;
  }

  .btn-search {
    width: 100%;
    padding: 16px 0;
  }

  .title {
    font-size: 24px;
  }
}
</style>