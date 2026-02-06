<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h1 class="brand-title">CHOCOSTYLE</h1>
        <p class="subtitle">Chào mừng bạn quay trở lại</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Tài khoản</label>
          <div class="input-wrapper">
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Nhập tên tài khoản hoặc email"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
        </div>

        <div v-if="message" class="error-msg">
          {{ message }}
        </div>

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
              width="20"
            />
            <span>Facebook</span>
          </a>
        </div>
        <div class="login-footer">
          <router-link to="/forgot-password" class="forgot-pass"
            >Quên mật khẩu?</router-link
          >
          <p>
            Chưa có tài khoản?
            <router-link to="/register" class="register-link"
              >Đăng ký ngay</router-link
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

const username = ref("");
const password = ref("");
const loading = ref(false);
const message = ref("");
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  message.value = "";

  try {
    await AuthService.login({
      username: username.value,
      password: password.value,
    });

    router.push("/admin/product");
  } catch (error) {
    console.error(error);
    message.value = "Tài khoản hoặc mật khẩu không chính xác!";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* --- 1. CẤU HÌNH MÀU SẮC --- */
:root {
  --primary-color: #63391f; /* Nâu Choco */
  --bg-color: #f7f7f7; /* Xám nhạt nền */
  --white-color: #ffffff; /* Trắng */
  --text-color: #333333; /* Màu chữ đậm */
  --text-light: #666666; /* Màu chữ nhạt */
  --error-color: #d32f2f; /* Màu đỏ lỗi */
}

/* --- 2. LAYOUT TỔNG --- */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7f7f7;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* --- 3. THẺ CARD LOGIN --- */
.login-card {
  width: 100%;
  max-width: 420px;
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(99, 57, 31, 0.1);
  transition: transform 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
}

/* --- 4. HEADER --- */
.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.brand-title {
  color: #63391f;
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.subtitle {
  color: #666666;
  font-size: 14px;
  margin-top: 8px;
}

/* --- 5. FORM INPUT --- */
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
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}

/* --- 6. NÚT BẤM LOGIN --- */
.btn-login {
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
  margin-top: 10px;
  letter-spacing: 1px;
}

.btn-login:hover {
  background-color: #4e2c17;
}

.btn-login:disabled {
  background-color: #a8a8a8;
  cursor: not-allowed;
}

/* --- 7. CSS CHO KHỐI MẠNG XÃ HỘI (CẬP NHẬT) --- */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 25px 0 15px;
  color: #999;
  font-size: 12px;
  font-weight: 600;
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #ddd;
}
.divider span {
  padding: 0 10px;
}

.social-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.btn-social {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Tinh chỉnh ảnh icon */
.btn-social img {
  margin-right: 8px;
  width: 20px;
  height: 20px;
  object-fit: contain; /* Giữ icon không bị méo */
}

/* Style riêng nút Google */
.btn-google {
  background-color: #ffffff;
  color: #333;
  border: 1px solid #ddd;
}
.btn-google:hover {
  background-color: #f7f7f7;
  border-color: #ccc;
}

/* Style riêng nút Facebook */
.btn-facebook {
  background-color: #1877f2;
  color: #ffffff;
  border: 1px solid #1877f2;
}
.btn-facebook:hover {
  background-color: #166fe5;
  box-shadow: 0 2px 8px rgba(24, 119, 242, 0.2);
}

/* --- 8. FOOTER & LINKS --- */
.login-footer {
  margin-top: 25px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.forgot-pass {
  display: block;
  margin-bottom: 15px;
  color: #63391f;
  text-decoration: none;
  font-weight: 500;
}

.register-link {
  color: #63391f;
  font-weight: 700;
  text-decoration: none;
}

.register-link:hover,
.forgot-pass:hover {
  text-decoration: underline;
}

/* --- 9. THÔNG BÁO LỖI --- */
.error-msg {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  margin-bottom: 20px;
  border: 1px solid #ef9a9a;
}

/* --- 10. SPINNER --- */
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 25px;
    margin: 20px;
  }
}
</style>
