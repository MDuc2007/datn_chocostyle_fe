<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="brand-title">CHOCOSTYLE</h1>
        <p class="subtitle">Đặt lại mật khẩu mới</p>
      </div>

      <form @submit.prevent="handleResetPassword">
        <div class="form-group">
          <label>Mật khẩu mới</label>
          <div class="input-wrapper">
            <input
              v-model="password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label>Xác nhận mật khẩu</label>
          <div class="input-wrapper">
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>
          <span v-if="error" class="error-text">{{ error }}</span>
        </div>

        <div v-if="message" class="msg-box success-msg">
          {{ message }}
        </div>

        <button type="submit" :disabled="loading" class="btn-auth">
          <span v-if="loading" class="spinner"></span>
          <span v-else>ĐỔI MẬT KHẨU</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthService from "../services/authService.js";

const password = ref("");
const confirmPassword = ref("");
const token = ref("");
const loading = ref(false);
const message = ref("");
const error = ref("");

const route = useRoute();
const router = useRouter();

onMounted(() => {
  // Lấy token từ URL (ví dụ: /reset-password?token=ABC...)
  token.value = route.query.token;
  if (!token.value) {
    error.value = "Link không hợp lệ hoặc đã hết hạn!";
  }
});

const handleResetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = "Mật khẩu không khớp!";
    return;
  }
  if (password.value.length < 6) {
    error.value = "Mật khẩu phải từ 6 ký tự trở lên.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    // Gọi API đổi mật khẩu
    await AuthService.resetPassword(token.value, password.value);
    message.value =
      "Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...";
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (err) {
    error.value =
      err.response && err.response.data.message
        ? err.response.data.message
        : "Lỗi đổi mật khẩu. Link có thể đã hết hạn.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Copy CSS từ ForgotPasswordView.vue sang đây để giống hệt nhau */
/* @import "../assets/css/auth-style.css"; Hoặc copy lại đoạn style scoped ở trên */
/* (Để ngắn gọn, bạn hãy copy toàn bộ phần <style scoped> của file ForgotPasswordView vào đây nhé) */
:root {
  --primary-color: #63391f;
  --bg-color: #f7f7f7;
  --white-color: #ffffff;
}
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7f7f7;
  font-family: "Segoe UI", sans-serif;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(99, 57, 31, 0.1);
}
.auth-header {
  text-align: center;
  margin-bottom: 30px;
}
.brand-title {
  color: #63391f;
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
}
.subtitle {
  color: #666;
  font-size: 14px;
  margin-top: 8px;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 14px;
}
.input-wrapper input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  background-color: #f7f7f7;
  transition: all 0.3s ease;
  box-sizing: border-box;
}
.input-wrapper input:focus {
  border-color: #63391f;
  background-color: #ffffff;
  outline: none;
}
.error-text {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}
.btn-auth {
  width: 100%;
  padding: 14px;
  background-color: #63391f;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-auth:hover {
  background-color: #4e2c17;
}
.btn-auth:disabled {
  background-color: #a8a8a8;
  cursor: not-allowed;
}
.msg-box {
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  margin-bottom: 20px;
}
.success-msg {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
