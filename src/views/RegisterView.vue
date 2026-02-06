<template>
  <div class="register-wrapper">
    <div class="register-card">
      <div class="register-header">
        <h1 class="brand-title">CHOCOSTYLE</h1>
        <p class="subtitle">Tạo tài khoản mới</p>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="fullname">Họ và tên</label>
          <div class="input-wrapper">
            <input
              id="fullname"
              v-model="fullname"
              type="text"
              placeholder="Nhập họ và tên của bạn"
              :class="{ 'input-error': errors.fullname }"
              @input="errors.fullname = ''"
            />
          </div>
          <span v-if="errors.fullname" class="error-text">{{
            errors.fullname
          }}</span>
        </div>

        <div class="form-group">
          <label for="username">Tên đăng nhập</label>
          <div class="input-wrapper">
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Chọn tên đăng nhập"
              :class="{ 'input-error': errors.username }"
              @input="errors.username = ''"
            />
          </div>
          <span v-if="errors.username" class="error-text">{{
            errors.username
          }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <input
              id="email"
              v-model="email"
              type="text"
              placeholder="example@gmail.com"
              :class="{ 'input-error': errors.email }"
              @input="errors.email = ''"
            />
          </div>
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              :class="{ 'input-error': errors.password }"
              @input="errors.password = ''"
            />
          </div>
          <span v-if="errors.password" class="error-text">{{
            errors.password
          }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Nhập lại mật khẩu</label>
          <div class="input-wrapper">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="Xác nhận mật khẩu"
              :class="{ 'input-error': errors.confirmPassword }"
              @input="errors.confirmPassword = ''"
            />
          </div>
          <span v-if="errors.confirmPassword" class="error-text">{{
            errors.confirmPassword
          }}</span>
        </div>

        <div
          v-if="message"
          :class="['msg-box', isError ? 'error-msg' : 'success-msg']"
        >
          {{ message }}
        </div>

        <button type="submit" :disabled="loading" class="btn-register">
          <span v-if="loading" class="spinner"></span>
          <span v-else>ĐĂNG KÝ NGAY</span>
        </button>

        <div class="login-redirect">
          <p>
            Đã có tài khoản?
            <router-link to="/login" class="login-link"
              >Đăng nhập ngay</router-link
            >
          </p>
        </div>

        <div class="divider">
          <span>HOẶC ĐĂNG KÝ VỚI</span>
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
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AuthService from "../services/authService.js";

const fullname = ref("");
const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

// Đối tượng chứa lỗi của từng trường
const errors = ref({
  fullname: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const loading = ref(false);
const message = ref("");
const isError = ref(false);
const router = useRouter();

// Hàm kiểm tra định dạng email
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Hàm validate toàn bộ form
const validateForm = () => {
  let isValid = true;
  errors.value = {}; // Reset lỗi cũ

  // 1. Kiểm tra Họ tên
  if (!fullname.value.trim()) {
    errors.value.fullname = "Họ tên không được để trống";
    isValid = false;
  }

  // 2. Kiểm tra Username
  if (!username.value.trim()) {
    errors.value.username = "Tên đăng nhập không được để trống";
    isValid = false;
  } else if (username.value.length < 4) {
    errors.value.username = "Tên đăng nhập phải từ 4 ký tự trở lên";
    isValid = false;
  }

  // 3. Kiểm tra Email
  if (!email.value.trim()) {
    errors.value.email = "Email không được để trống";
    isValid = false;
  } else if (!isValidEmail(email.value)) {
    errors.value.email = "Định dạng email không hợp lệ";
    isValid = false;
  }

  // 4. Kiểm tra Password (backend yêu cầu min 6)
  if (!password.value) {
    errors.value.password = "Mật khẩu không được để trống";
    isValid = false;
  } else if (password.value.length < 6) {
    errors.value.password = "Mật khẩu phải có ít nhất 6 ký tự";
    isValid = false;
  }

  // 5. Kiểm tra Xác nhận mật khẩu
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = "Mật khẩu xác nhận không khớp";
    isValid = false;
  }

  return isValid;
};

const handleRegister = async () => {
  // Reset thông báo server
  message.value = "";
  isError.value = false;

  // Gọi hàm validate trước khi gửi
  if (!validateForm()) {
    return; // Dừng lại nếu có lỗi
  }

  loading.value = true;

  try {
    await AuthService.register({
      fullname: fullname.value,
      username: username.value,
      email: email.value,
      password: password.value,
    });

    // Thành công
    isError.value = false;
    message.value = "Đăng ký thành công! Đang chuyển hướng...";

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (error) {
    console.error(error);
    isError.value = true;
    // Lấy thông báo lỗi từ Backend
    message.value =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "Đăng ký thất bại. Vui lòng thử lại!";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* --- GIỮ NGUYÊN STYLE CŨ --- */
:root {
  --primary-color: #63391f;
  --bg-color: #f7f7f7;
  --white-color: #ffffff;
}

.register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7f7f7;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px 0;
}

.register-card {
  width: 100%;
  max-width: 450px;
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(99, 57, 31, 0.1);
  transition: transform 0.3s ease;
}

.register-header {
  text-align: center;
  margin-bottom: 25px;
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

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-weight: 600;
  font-size: 13px;
}

.input-wrapper input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
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

/* --- STYLE MỚI CHO VALIDATE --- */
.input-error {
  border-color: #d32f2f !important;
  background-color: #fff8f8 !important;
}

.error-text {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}
/* ------------------------------- */

.btn-register {
  width: 100%;
  padding: 12px;
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

.btn-register:hover {
  background-color: #4e2c17;
}

.btn-register:disabled {
  background-color: #a8a8a8;
  cursor: not-allowed;
}

.login-redirect {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link {
  color: #63391f;
  font-weight: 700;
  text-decoration: none;
}
.login-link:hover {
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0 15px;
  color: #999;
  font-size: 11px;
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
  font-size: 13px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-social img {
  margin-right: 8px;
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.btn-google {
  background-color: #ffffff;
  color: #333;
  border: 1px solid #ddd;
}
.btn-google:hover {
  background-color: #f7f7f7;
}

.btn-facebook {
  background-color: #1877f2;
  color: #ffffff;
  border: 1px solid #1877f2;
}
.btn-facebook:hover {
  background-color: #166fe5;
}

.msg-box {
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  margin-bottom: 15px;
}
.error-msg {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
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
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 25px;
    margin: 15px;
  }
}
</style>
