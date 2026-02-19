<template>
  <div class="register-wrapper">
    <div class="bg-pattern"></div>

    <div class="register-card">
      <div class="register-header">
        <h1 class="brand-title">CHOCOSTYLE</h1>
        <p class="subtitle">Đăng ký thành viên mới</p>
      </div>

      <form @submit.prevent="handleRegister" autocomplete="off">
        <div class="form-group">
          <label for="fullname">Họ và tên</label>
          <div class="input-wrapper" :class="{ 'has-error': errors.fullname }">
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
              id="fullname"
              v-model="fullname"
              type="text"
              placeholder="Nguyễn Văn A"
              @input="errors.fullname = ''"
            />
          </div>
          <span v-if="errors.fullname" class="error-text">{{
            errors.fullname
          }}</span>
        </div>

        <div class="form-group">
          <label for="phone">Số điện thoại</label>
          <div class="input-wrapper" :class="{ 'has-error': errors.phone }">
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
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.28-2.28a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                ></path>
              </svg>
            </span>
            <input
              id="phone"
              v-model="phone"
              type="text"
              placeholder="0987xxxxxx"
              @input="errors.phone = ''"
            />
          </div>
          <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper" :class="{ 'has-error': errors.email }">
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
              id="email"
              v-model="email"
              type="text"
              placeholder="example@gmail.com"
              @input="errors.email = ''"
            />
          </div>
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="row-group">
          <div class="form-group half">
            <label for="password">Mật khẩu</label>
            <div
              class="input-wrapper"
              :class="{ 'has-error': errors.password }"
            >
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
                id="password"
                v-model="password"
                type="password"
                placeholder="******"
                @input="errors.password = ''"
              />
            </div>
          </div>

          <div class="form-group half">
            <label for="confirmPassword">Nhập lại</label>
            <div
              class="input-wrapper"
              :class="{ 'has-error': errors.confirmPassword }"
            >
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
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                placeholder="******"
                @input="errors.confirmPassword = ''"
              />
            </div>
          </div>
        </div>

        <span
          v-if="errors.password || errors.confirmPassword"
          class="error-text block-center"
        >
          {{ errors.password || errors.confirmPassword }}
        </span>

        <transition name="slide-up">
          <div
            v-if="message"
            :class="['msg-box', isError ? 'error-msg' : 'success-msg']"
          >
            <span class="msg-icon">{{ isError ? "⚠️" : "✅" }}</span>
            <span>{{ message }}</span>
          </div>
        </transition>

        <button type="submit" :disabled="loading" class="btn-register">
          <span v-if="loading" class="spinner"></span>
          <span v-else>ĐĂNG KÝ NGAY</span>
        </button>

        <div class="divider">
          <span>HOẶC TIẾP TỤC VỚI</span>
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

        <div class="auth-footer">
          <p>
            Đã có tài khoản?
            <router-link to="/login" class="login-link"
              >Đăng nhập ngay</router-link
            >
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

const fullname = ref("");
const phone = ref(""); // Biến mới
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const errors = ref({});
const loading = ref(false);
const message = ref("");
const isError = ref(false);

const router = useRouter();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /(84|0[3|5|7|8|9])+([0-9]{8})\b/g.test(phone); // Regex SĐT Việt Nam

const validateForm = () => {
  let isValid = true;
  errors.value = {};

  if (!fullname.value.trim()) {
    errors.value.fullname = "Vui lòng nhập họ tên";
    isValid = false;
  }

  if (!phone.value.trim()) {
    errors.value.phone = "Vui lòng nhập số điện thoại";
    isValid = false;
  } else if (!isValidPhone(phone.value)) {
    errors.value.phone = "Số điện thoại không đúng định dạng";
    isValid = false;
  }

  if (!email.value.trim()) {
    errors.value.email = "Vui lòng nhập email";
    isValid = false;
  } else if (!isValidEmail(email.value)) {
    errors.value.email = "Email không hợp lệ";
    isValid = false;
  }

  if (!password.value) {
    errors.value.password = "Vui lòng nhập mật khẩu";
    isValid = false;
  } else if (password.value.length < 6) {
    errors.value.password = "Mật khẩu tối thiểu 6 ký tự";
    isValid = false;
  }

  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = "Mật khẩu nhập lại không khớp";
    isValid = false;
  }

  return isValid;
};

const handleRegister = async () => {
  message.value = "";
  isError.value = false;

  if (!validateForm()) return;

  loading.value = true;

  try {
    // Gửi đúng field Backend yêu cầu (theo Entity KhachHang)
    // Thay đổi 'tenKhachHang' thành 'hoTen'
    // RegisterView.vue (Sửa lại cho khớp với authService.js)
    await AuthService.register({
      fullname: fullname.value, // Đổi thành 'fullname'
      phone: phone.value, // Đổi thành 'phone'
      email: email.value, // Giữ nguyên
      password: password.value, // Đổi thành 'password'
    });

    isError.value = false;
    message.value = "Đăng ký thành công! Đang chuyển hướng...";

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (error) {
    isError.value = true;
    message.value =
      error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
  } finally {
    loading.value = false;
  }
};
</script>

<style>
/* Toàn bộ CSS giữ nguyên từ file gốc của bạn */
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

.register-wrapper {
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

.register-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  background-color: var(--white-color);
  padding: 40px;
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  animation: slideUp 0.5s ease-out;
}

.register-header {
  text-align: center;
  margin-bottom: 25px;
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
  margin-top: 5px;
}

.form-group {
  margin-bottom: 18px;
}

.row-group {
  display: flex;
  gap: 15px;
}
.half {
  flex: 1;
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
  padding: 13px 14px 13px 48px;
  border: 2px solid transparent;
  background-color: #f9f9f9;
  border-radius: var(--radius);
  font-size: 14px;
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

.input-wrapper.has-error input {
  border-color: #ffcdd2;
  background-color: #fff8f8;
}
.input-wrapper.has-error .input-icon {
  color: var(--error-color);
}

.error-text {
  color: var(--error-color);
  font-size: 12px;
  margin-top: 5px;
  display: block;
  margin-left: 4px;
}
.block-center {
  text-align: center;
  margin-top: -10px;
  margin-bottom: 15px;
}

.btn-register {
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
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 57, 31, 0.3);
}

.btn-register:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  gap: 10px;
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

.auth-footer {
  margin-top: 25px;
  text-align: center;
  font-size: 14px;
  color: var(--text-light);
}

.login-link {
  color: var(--primary-color);
  font-weight: 700;
  text-decoration: none;
  margin-left: 5px;
}
.login-link:hover {
  text-decoration: underline;
}

.msg-box {
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
  animation: slideIn 0.3s ease;
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

@media (max-width: 480px) {
  .register-card {
    padding: 30px 20px;
  }
  .row-group {
    flex-direction: column;
    gap: 0;
  }
  .social-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
