<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="brand-title">CHOCOSTYLE</h1>
        <p class="subtitle">Khôi phục mật khẩu</p>
      </div>

      <form v-if="step === 1" @submit.prevent="handleSendOtp">
        <div class="form-group">
          <label>Nhập email của bạn</label>
          <div class="input-wrapper">
            <input
              v-model="email"
              type="email"
              placeholder="example@gmail.com"
              required
            />
          </div>
        </div>
        <button type="submit" :disabled="loading" class="btn-auth">
          <span v-if="loading" class="spinner"></span>
          <span v-else>GỬI MÃ XÁC THỰC</span>
        </button>
      </form>

      <form v-else @submit.prevent="handleResetPassword">
        <p class="info-text">
          Mã xác thực đã gửi tới: <b>{{ email }}</b>
        </p>

        <div class="form-group">
          <label>Mã xác thực (6 số)</label>
          <div class="input-wrapper">
            <input
              v-model="otp"
              type="text"
              placeholder="123456"
              maxlength="6"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label>Mật khẩu mới</label>
          <div class="input-wrapper">
            <input
              v-model="newPassword"
              type="password"
              placeholder="Mật khẩu mới"
              required
            />
          </div>
        </div>

        <button type="submit" :disabled="loading" class="btn-auth">
          <span v-if="loading" class="spinner"></span>
          <span v-else>XÁC NHẬN ĐỔI MẬT KHẨU</span>
        </button>

        <div class="retry-link" @click="step = 1">Gửi lại mã?</div>
      </form>

      <div
        v-if="message"
        :class="['msg-box', isError ? 'error-msg' : 'success-msg']"
      >
        {{ message }}
      </div>

      <div class="auth-footer">
        <router-link to="/login" class="back-link"
          >&larr; Quay lại đăng nhập</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AuthService from "../services/authService.js";

const step = ref(1); // 1: Nhập Email, 2: Nhập OTP
const email = ref("");
const otp = ref("");
const newPassword = ref("");
const loading = ref(false);
const message = ref("");
const isError = ref(false);
const router = useRouter();

// Xử lý gửi mã OTP
const handleSendOtp = async () => {
  loading.value = true;
  message.value = "";
  isError.value = false;

  try {
    await AuthService.forgotPassword(email.value);
    step.value = 2; // Chuyển sang bước 2
    message.value = "Đã gửi mã! Vui lòng kiểm tra email.";
  } catch (err) {
    isError.value = true;
    message.value = err.response?.data?.message || "Lỗi gửi mã.";
  } finally {
    loading.value = false;
  }
};

// Xử lý đổi mật khẩu
const handleResetPassword = async () => {
  loading.value = true;
  message.value = "";
  isError.value = false;

  try {
    // Gọi API reset (truyền email + otp + pass mới)
    // Lưu ý: AuthService.resetPassword cần sửa lại chút ở dưới
    await AuthService.resetPassword(email.value, otp.value, newPassword.value);

    isError.value = false;
    message.value = "Đổi mật khẩu thành công! Đang chuyển hướng...";
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (err) {
    isError.value = true;
    message.value =
      err.response?.data?.message || "Mã xác thực không đúng hoặc hết hạn.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Bạn giữ nguyên style cũ, thêm 2 class nhỏ này */
.info-text {
  font-size: 13px;
  color: #666;
  margin-bottom: 15px;
  text-align: center;
}
.retry-link {
  margin-top: 15px;
  text-align: center;
  font-size: 13px;
  color: #63391f;
  cursor: pointer;
  text-decoration: underline;
}
/* ... (Copy lại style cũ vào đây) ... */
@import "../assets/css/auth-style.css"; /* Nếu bạn đã tách file CSS */
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
.auth-footer {
  margin-top: 20px;
  text-align: center;
}
.back-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}
.back-link:hover {
  color: #63391f;
  text-decoration: underline;
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
.error-msg {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
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
