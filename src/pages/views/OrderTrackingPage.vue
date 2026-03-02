<template>
  <div class="app-container">
    <Header></Header>

    <main class="tracking-page">
      <div class="breadcrumb-wrapper">
        <div class="breadcrumb">
          <span @click="$router.push('/')">Trang chủ</span>
          <span class="separator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
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
            <div class="input-group" :class="{ 'focused': isFocused }">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                v-model="searchCode"
                placeholder="Ví dụ: DH-123456789..."
                @keyup.enter="handleSearch"
                @focus="isFocused = true"
                @blur="isFocused = false"
              />
            </div>
            
            <button
              class="btn-search"
              @click="handleSearch"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">Tra cứu ngay</span>
              <div v-else class="spinner-small"></div>
            </button>
          </div>
          
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
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="toast-text">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import { useRouter } from "vue-router";

const searchCode = ref("");
const isLoading = ref(false);
const isFocused = ref(false);
const router = useRouter();

// Dùng Reactive cho Toast ổn định hơn
const toast = reactive({ show: false, message: "", type: "success" });
const showToast = (msg, type = "success") => {
  toast.message = msg;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};

const handleSearch = async () => {
  if (!searchCode.value.trim()) {
    showToast("Vui lòng nhập mã đơn hàng!", "warning");
    return;
  }

  const userStr = localStorage.getItem("user");
  if (!userStr) {
    showToast("Vui lòng đăng nhập để tra cứu đơn hàng của bạn!", "warning");
    return;
  }

  const user = JSON.parse(userStr);
  isLoading.value = true;

  try {
    const response = await fetch(
      `http://localhost:8080/api/hoa-don/tra-cuu?maDonHang=${searchCode.value.trim()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`, 
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      if (data.id) {
        showToast("Đã tìm thấy đơn hàng! Đang chuyển hướng...", "success");
        setTimeout(() => {
          router.push({
            name: "ClientOrderDetail",
            params: { id: data.id },
          });
        }, 1000);
      } else {
        showToast("Dữ liệu đơn hàng không hợp lệ.", "error");
      }
    } else {
      const errorText = await response.text();
      showToast(errorText || "Không tìm thấy đơn hàng!", "error");
    }
  } catch (error) {
    console.error("Lỗi:", error);
    showToast("Lỗi kết nối server!", "error");
  } finally {
    isLoading.value = false;
  }
};
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
.breadcrumb span { cursor: pointer; transition: color 0.2s; }
.breadcrumb span:hover { color: #6b3f1e; }
.breadcrumb .separator { margin: 0 8px; display: flex; align-items: center; }
.breadcrumb .separator svg { width: 14px; height: 14px; }
.breadcrumb .current { font-weight: 500; color: #111827; cursor: default; }

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
  background: #6b3f1e;
  color: #fff;
  border: none;
  padding: 0 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-search:hover:not(:disabled) {
  background: #5a3218;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(107, 63, 30, 0.2);
}
.btn-search:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.help-text {
  font-size: 13px;
  color: #9ca3af;
  text-align: left;
  padding-left: 5px;
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
  to { transform: rotate(360deg); }
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
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  min-width: 300px;
}
.toast-icon-wrap {
  width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;
}
.toast-success .toast-icon-wrap { background: #10b981; }
.toast-error .toast-icon-wrap { background: #ef4444; }
.toast-warning .toast-icon-wrap { background: #f59e0b; }

.toast-icon-wrap svg { width: 16px; height: 16px; }

.toast-text { 
  font-size: 15px; 
  font-weight: 600; 
  color: #111827; 
}

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }

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