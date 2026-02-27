<template>
  <div class="redirect-wrapper">
    <div v-if="isProcessing" class="loading-container">
      <div class="spinner"></div>
      <p>Đang xử lý đăng nhập Google...</p>
    </div>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-icon-wrapper">
          <span v-if="toast.type === 'success'">✓</span>
          <span v-else-if="toast.type === 'error'">✕</span>
          <span v-else>!</span>
        </div>
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const isProcessing = ref(true);

// Toast System
const toast = ref({ show: false, message: "", type: "success" });

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  // Ẩn toast sau 3s
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

onMounted(() => {

  

  const token = route.query.token;
  const error = route.query.error;

  // 2. XỬ LÝ KHI CÓ LỖI TỪ BACKEND
  if (error) {
    isProcessing.value = false;
    let errorMsg = "Đăng nhập Google thất bại!";
    const errorStr = error.toLowerCase();

    // Bắt các mã lỗi phổ biến từ Backend trả về
    if (errorStr.includes("locked")) {
      errorMsg = "Tài khoản của bạn đã bị khóa do vi phạm chính sách!";
    } else if (errorStr.includes("disabled") || errorStr.includes("inactive")) {
      errorMsg = "Tài khoản của bạn chưa được kích hoạt!";
    } else if (errorStr.includes("notfound")) {
      errorMsg = "Email này chưa được đăng ký trong hệ thống!";
    } else {
      // Giải mã URL trong trường hợp Backend gửi thông báo lỗi có dấu tiếng Việt
      errorMsg = decodeURIComponent(error); 
    }

    // Hiển thị thông báo lỗi
    showToast(errorMsg, "error");
    
    // Đợi 3 giây cho người dùng đọc lỗi rồi đá về trang Login
    setTimeout(() => {
      router.push("/login");
    }, 3000);

    return; // Dừng thực thi các lệnh bên dưới
  }

  // 3. XỬ LÝ KHI THÀNH CÔNG (CÓ TOKEN)
  // 3. XỬ LÝ KHI THÀNH CÔNG (CÓ TOKEN)
if (token) {
  const userData = {
    id: route.query.id || null,
    email: route.query.email || null,
    tenKhachHang: route.query.tenKhachHang
      ? decodeURIComponent(route.query.tenKhachHang)
      : "Khách hàng",
    avatar: route.query.avatar
      ? decodeURIComponent(route.query.avatar)
      : null,
    accessToken: token,
    tokenType: "Bearer",
    role: route.query.role || "ROLE_KHACH_HANG",
  };

  // 🔥 LƯU USER + TOKEN
  localStorage.setItem("user", JSON.stringify(userData));
  localStorage.setItem("token", token);

  // 🔥 BẮN EVENT CHO HEADER UPDATE NGAY
  window.dispatchEvent(new Event("userLoggedIn"));

  showToast("Đăng nhập Google thành công!", "success");

  setTimeout(() => {
    router.push("/");
  }, 1000);
}
});
</script>

<style scoped>
.redirect-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f7f7f7;
  color: #63391f;
  font-family: "Inter", sans-serif;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-container p {
  font-weight: 600;
  margin-top: 15px;
  font-size: 16px;
}

/* Spinner xoay xoay */
.spinner {
  width: 45px;
  height: 45px;
  border: 4px solid #eaeaea;
  border-top-color: #63391f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ================= TOAST CSS ĐỒNG BỘ ================= */
.toast-notification {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 10000;
  min-width: 300px;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  background: #fff; 
  border-left: 6px solid #22C55E;
}
.toast-notification.error { border-left-color: #ef4444; }
.toast-notification.warning { border-left-color: #f59e0b; }

.toast-icon-wrapper {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
}
.success .toast-icon-wrapper { background: #22C55E; }
.error .toast-icon-wrapper { background: #ef4444; }
.warning .toast-icon-wrapper { background: #f59e0b; }

.toast-content { 
  margin-left: 12px; 
  font-weight: 500; 
  font-size: 15px; 
  color: #333;
  line-height: 1.4;
}

/* Transitions */
.toast-slide-enter-active, .toast-slide-leave-active { 
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
}
.toast-slide-enter-from, .toast-slide-leave-to { 
  transform: translateX(120%); 
  opacity: 0; 
}
</style>