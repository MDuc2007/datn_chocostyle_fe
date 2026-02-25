<template>
  <div class="login-wrapper">
    <div class="bg-pattern"></div>

    <div class="login-card form-page-animation">
      <div class="login-header">
        <h1 class="brand-title">
          CHOCOSTYLE
          <span class="admin-badge">ADMIN</span>
        </h1>
        <p class="subtitle">Đăng nhập hệ thống quản lý</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Email</label>
          <div class="input-wrapper" :class="{ 'has-error': isError }">
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </span>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Nhập email"
              required
              @input="isError = false"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <div class="input-wrapper" :class="{ 'has-error': isError }">
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Nhập mật khẩu"
              required
              @input="isError = false"
            />
          </div>
          <div class="forgot-wrapper">
            <router-link to="/forgot-password" class="forgot-link">
              Quên mật khẩu?
            </router-link>
          </div>
        </div>

        <transition name="slide-up">
          <div v-if="message" class="msg-box error-msg">
            <span class="msg-icon">⚠️</span>
            <span>{{ message }}</span>
          </div>
        </transition>

        <button
          type="submit"
          :disabled="loading"
          class="btn-login hover-effect"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>TRUY CẬP HỆ THỐNG</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AuthService from "../services/authService.js";

const username = ref("");
const password = ref("");
const loading = ref(false);
const message = ref("");
const isError = ref(false);
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  message.value = "";
  isError.value = false;

  try {
    // Gọi API login dành cho nhân viên/admin
    const res = await AuthService.loginStaff({
      username: username.value,
      password: password.value,
    });

    // Điều hướng dựa trên role
    if (res.role === "ROLE_ADMIN") {
      router.push("/admin/dashboard");
    } else if (res.role === "ROLE_STAFF") {
      // Thay đổi đường dẫn này thành trang bạn muốn Nhân viên vào (ví dụ: /staff/pos)
      router.push('/staff/dashboard');
    } else {
      // Trường hợp dự phòng nếu có role khác hoặc lỗi
      router.push("/");
    }
  } catch (error) {
    isError.value = true;
    message.value =
      error.response?.data?.message ||
      "Tài khoản hoặc mật khẩu không chính xác!";
  } finally {
    loading.value = false;
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap");

:root {
  --primary-color: #63391f;
  --primary-hover: #4e2c17;
  --text-main: #2d3436;
  --text-light: #636e72;
  --bg-color: #f4f6f8;
  --white-color: #ffffff;
  --error-color: #d32f2f;
  --shadow-card: 0 15px 35px rgba(99, 57, 31, 0.1);
  --radius: 12px;
}

.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-color);
  font-family: "Nunito", sans-serif;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* Họa tiết nền */
.bg-pattern {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(99, 57, 31, 0.05) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px; /* Nhỏ gọn hơn một chút so với user login */
  background-color: var(--white-color);
  padding: 50px 40px;
  border-radius: 20px;
  box-shadow: var(--shadow-card);
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.brand-title {
  color: var(--primary-color);
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* Nhãn Admin */
.admin-badge {
  background-color: var(--primary-color);
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  vertical-align: middle;
  letter-spacing: 0.5px;
  transform: translateY(-2px);
}

.subtitle {
  color: var(--text-light);
  font-size: 15px;
  margin-top: 8px;
  font-weight: 600;
}

/* Inputs */
.form-group {
  margin-bottom: 25px;
}

label {
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
  pointer-events: none;
  transition: color 0.3s;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 14px 14px 48px;
  border: 2px solid transparent;
  background-color: #f9f9f9;
  border-radius: var(--radius);
  font-size: 15px;
  color: #333;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.input-wrapper input:focus {
  background-color: #fff;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(99, 57, 31, 0.1);
  outline: none;
}

.input-wrapper input:focus + .input-icon {
  color: var(--primary-color);
}

/* Error State */
.input-wrapper.has-error input {
  border-color: #ffcdd2;
  background-color: #fff8f8;
}
.input-wrapper.has-error .input-icon {
  color: var(--error-color);
}

.forgot-wrapper {
  text-align: right;
  margin-top: 10px;
}
.forgot-link {
  font-size: 13px;
  color: var(--text-light);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}
.forgot-link:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

/* Button */
.btn-login {
  width: 100%;
  padding: 16px;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-hover)
  );
  color: #ffffff;
  border: none;
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(99, 57, 31, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  letter-spacing: 0.5px;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(99, 57, 31, 0.35);
}

.btn-login:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.hover-effect:active {
  transform: scale(0.98);
}

/* Notification */
.msg-box {
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 25px;
  justify-content: center;
}

.error-msg {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

/* Animation */
.form-page-animation {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
