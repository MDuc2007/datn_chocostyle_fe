<template>
  <div class="login-wrapper">
    <div class="bg-pattern"></div>

    <div class="login-card">
      <div class="login-header">
        <h1 class="brand-title">CHOCOSTYLE</h1>
        <p class="subtitle">Chào mừng bạn quay trở lại</p>
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
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

        <button type="submit" :disabled="loading" class="btn-login">
          <span v-if="loading" class="spinner"></span>
          <span v-else>ĐĂNG NHẬP</span>
        </button>

        <div class="divider">
          <span>HOẶC ĐĂNG NHẬP VỚI</span>
        </div>

        <div class="social-buttons">
          <a
            href="http://localhost:8080/oauth2/authorization/google"
            class="btn-social btn-google"
          >
            <img
              src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
              alt="Google"
            />
            <span>Google</span>
          </a>

          <a
            href="http://localhost:8080/oauth2/authorization/facebook"
            class="btn-social btn-facebook"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
              alt="Facebook"
            />
            <span>Facebook</span>
          </a>
        </div>

        <div class="login-footer">
          <p>
            Chưa có tài khoản?
            <router-link to="/register" class="register-link">
              Đăng ký ngay
            </router-link>
          </p>
        </div>
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
const isError = ref(false); // Dùng để highlight đỏ ô input khi lỗi
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  message.value = "";
  isError.value = false;

  try {
    await AuthService.loginCustomer({
      username: username.value,
      password: password.value,
    });

    router.push("/"); // về trang chủ khách hàng
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
    rgba(99, 57, 31, 0.04) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background-color: var(--white-color);
  padding: 45px 40px;
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  animation: slideUp 0.5s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.brand-title {
  color: var(--primary-color);
  font-size: 30px;
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.5px;
}

.subtitle {
  color: var(--text-light);
  font-size: 15px;
  margin-top: 6px;
  font-weight: 600;
}

/* --- INPUTS --- */
.form-group {
  margin-bottom: 20px;
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
  padding: 14px 14px 14px 48px; /* Chừa chỗ cho Icon */
  border: 2px solid transparent;
  background-color: #f9f9f9;
  border-radius: var(--radius);
  font-size: 15px;
  color: #333;
  transition: all 0.3s ease;
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

/* Trạng thái lỗi */
.input-wrapper.has-error input {
  border-color: #ffcdd2;
  background-color: #fff8f8;
}
.input-wrapper.has-error .input-icon {
  color: var(--error-color);
}

.forgot-wrapper {
  text-align: right;
  margin-top: 8px;
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

/* --- BUTTONS --- */
.btn-login {
  width: 100%;
  padding: 15px;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-hover)
  );
  color: #ffffff;
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

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 57, 31, 0.3);
}

.btn-login:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* --- SOCIAL --- */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 25px 0 20px;
  color: #aaa;
  font-size: 12px;
  font-weight: 600;
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #eee;
}
.divider span {
  padding: 0 15px;
}

.social-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.btn-social {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  gap: 8px;
}

.btn-social img {
  width: 20px;
  height: 20px;
}

.btn-google {
  background-color: #fff;
  color: #333;
  border: 1px solid #e0e0e0;
}
.btn-google:hover {
  background-color: #f7f7f7;
  border-color: #d0d0d0;
}

.btn-facebook {
  background-color: #1877f2;
  color: #fff;
  border: 1px solid #1877f2;
}
.btn-facebook:hover {
  background-color: #156ad6;
  box-shadow: 0 4px 12px rgba(24, 119, 242, 0.2);
}

/* --- FOOTER --- */
.login-footer {
  text-align: center;
  font-size: 14px;
  color: var(--text-light);
}

.register-link {
  color: var(--primary-color);
  font-weight: 700;
  text-decoration: none;
  margin-left: 5px;
}
.register-link:hover {
  text-decoration: underline;
}

/* --- NOTIFICATIONS --- */
.msg-box {
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  justify-content: center;
}

.error-msg {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

/* --- ANIMATIONS --- */
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Vue Transition */
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
