<template>
  <div class="auth-wrapper">
    <div class="bg-pattern"></div>

    <div class="auth-card">
      <div class="auth-header">
        <h1 class="brand-title">CHOCOSTYLE</h1>
        <p class="subtitle">Khôi phục mật khẩu</p>
      </div>

      <div class="account-selector">
        <div
          class="selector-item"
          :class="{ active: accountType === 'KHACH_HANG' }"
          @click="accountType = 'KHACH_HANG'"
        >
          Khách hàng
        </div>
        <div
          class="selector-item"
          :class="{ active: accountType === 'NHAN_VIEN' }"
          @click="accountType = 'NHAN_VIEN'"
        >
          Nhân viên
        </div>
      </div>

      <transition name="fade" mode="out-in">
        <form
          v-if="step === 1"
          key="step1"
          @submit.prevent="handleSendOtp"
          class="auth-form"
        >
          <div class="form-group">
            <label>Email liên kết</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  ></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                v-model="email"
                type="email"
                placeholder="vidu@gmail.com"
                required
              />
            </div>
          </div>

          <button type="submit" :disabled="loading" class="btn-auth">
            <span v-if="loading" class="spinner"></span>
            <span v-else>GỬI MÃ XÁC THỰC</span>
          </button>
        </form>

        <form
          v-else
          key="step2"
          @submit.prevent="handleResetPassword"
          class="auth-form"
        >
          <div class="info-box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              ></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span
              >Mã xác thực đã gửi tới: <b>{{ email }}</b></span
            >
          </div>

          <div class="form-group">
            <label>Mã OTP</label>
            <div class="input-wrapper">
              <input
                v-model="otp"
                type="text"
                maxlength="6"
                placeholder="******"
                required
                class="otp-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Mật khẩu mới</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                v-model="newPassword"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label>Xác nhận mật khẩu</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </span>
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn-auth" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>XÁC NHẬN ĐỔI MẬT KHẨU</span>
          </button>

          <div class="retry-link">
            Chưa nhận được mã? <span @click="step = 1">Gửi lại</span>
          </div>
        </form>
      </transition>

      <transition name="slide-up">
        <div
          v-if="message"
          :class="['msg-box', isError ? 'error-msg' : 'success-msg']"
        >
          <span class="msg-icon" v-if="isError">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </span>
          <span class="msg-icon" v-else>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </span>
          <span>{{ message }}</span>
        </div>
      </transition>

      <div class="auth-footer">
        <router-link to="/login" class="back-link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Quay lại đăng nhập
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AuthService from "../services/authService.js";

const accountType = ref("KHACH_HANG");
const step = ref(1);

const email = ref("");
const otp = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const loading = ref(false);
const message = ref("");
const isError = ref(false);

const router = useRouter();

// ===== GỬI OTP =====
const handleSendOtp = async () => {
  loading.value = true;
  message.value = "";
  isError.value = false;

  try {
    await AuthService.forgotPassword(email.value, accountType.value);
    step.value = 2;
    // Tự động xoá thông báo cũ khi qua bước mới
    message.value = "";
  } catch (err) {
    isError.value = true;
    message.value =
      err.response?.data?.message || "Không tìm thấy email hoặc lỗi hệ thống.";
  } finally {
    loading.value = false;
  }
};

// ===== ĐỔI MẬT KHẨU =====
const handleResetPassword = async () => {
  if (newPassword.value.length < 6) {
    message.value = "Mật khẩu phải tối thiểu 6 ký tự";
    isError.value = true;
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = "Mật khẩu xác nhận không khớp";
    isError.value = true;
    return;
  }

  loading.value = true;
  message.value = "";
  isError.value = false;

  try {
    await AuthService.resetPassword(
      email.value,
      otp.value,
      newPassword.value,
      accountType.value,
    );

    message.value = "Đổi mật khẩu thành công! Đang chuyển hướng...";
    setTimeout(() => router.push("/login"), 2000);
  } catch (err) {
    isError.value = true;
    message.value =
      err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.";
  } finally {
    loading.value = false;
  }
};
</script>

<style>
/* Import font chữ hiện đại (Optional) */
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap");

:root {
  /* Bảng màu */
  --primary-color: #63391f; /* Màu chủ đạo Chocolate */
  --primary-hover: #4e2c17; /* Màu khi hover */
  --primary-light: #fdf8f5; /* Nền nhạt */
  --text-main: #2d3436;
  --text-light: #636e72;
  --bg-color: #f4f6f8;
  --white-color: #ffffff;

  /* Cấu hình Shadow & Border */
  --shadow-card: 0 15px 35px rgba(99, 57, 31, 0.1);
  --radius: 12px;
}

.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7f7f7;
  font-family: "Nunito", "Segoe UI", sans-serif;
  position: relative;
  overflow: hidden;
}

/* Họa tiết nền mờ phía sau */
.bg-pattern {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(99, 57, 31, 0.04) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background-color: var(--white-color);
  padding: 45px 40px;
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
}

/* --- HEADER --- */
.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.brand-title {
  color: #63391f; /* Hardcode fallback nếu biến css không nhận */
  color: var(--primary-color);
  font-size: 30px;
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.5px;
}

.subtitle {
  color: #888;
  font-size: 15px;
  margin-top: 6px;
  font-weight: 600;
}

/* --- ACCOUNT SELECTOR (Segmented Control) --- */
.account-selector {
  display: flex;
  background: #f1f1f1;
  padding: 5px;
  border-radius: 12px;
  margin-bottom: 25px;
}

.selector-item {
  flex: 1;
  text-align: center;
  padding: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #888;
  cursor: pointer;
  border-radius: 9px;
  transition: all 0.3s ease;
  user-select: none;
}

.selector-item.active {
  background-color: #fff;
  color: var(--primary-color);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* --- FORM & INPUTS --- */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-main);
  font-weight: 700;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #b0b0b0;
  display: flex;
  align-items: center;
  transition: color 0.3s;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 14px 14px 48px; /* Để trống chỗ cho icon */
  border: 2px solid transparent;
  background-color: #f9f9f9;
  border-radius: var(--radius);
  font-size: 15px;
  color: #333;
  transition: all 0.25s ease;
  box-sizing: border-box;
}

.input-wrapper input:focus {
  background-color: #fff;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(99, 57, 31, 0.1);
  outline: none;
}

.input-wrapper input:focus + .input-icon,
.input-wrapper:focus-within .input-icon {
  color: var(--primary-color);
}

/* Style riêng cho ô OTP */
.otp-input {
  text-align: center;
  padding-left: 14px !important; /* Reset padding vì không có icon */
  letter-spacing: 5px;
  font-weight: 700;
  font-size: 18px !important;
}

/* --- BUTTON --- */
.btn-auth {
  width: 100%;
  padding: 15px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 15px rgba(99, 57, 31, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-auth:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 57, 31, 0.3);
}

.btn-auth:active {
  transform: translateY(1px);
}

.btn-auth:disabled {
  background-color: #bdc3c7;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

/* --- INFO TEXT --- */
.info-box {
  background-color: #fff8f3;
  color: var(--primary-color);
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  border: 1px dashed rgba(99, 57, 31, 0.3);
}

.retry-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #888;
}

.retry-link span {
  color: var(--primary-color);
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}
.retry-link span:hover {
  text-decoration: underline;
}

/* --- NOTIFICATIONS --- */
.msg-box {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideUp 0.3s ease;
}

.success-msg {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.error-msg {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.msg-icon {
  display: flex;
  align-items: center;
}

/* --- FOOTER --- */
.auth-footer {
  margin-top: 30px;
  text-align: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #888;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.3s;
}

.back-link:hover {
  color: var(--primary-color);
}

/* --- ANIMATIONS & SPINNER --- */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Vue Transition Fade */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
