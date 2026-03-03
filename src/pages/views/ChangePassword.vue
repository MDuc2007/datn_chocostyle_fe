<template>
  <div class="app-container">
    <Header></Header>

    <div class="breadcrumb">
      <span @click="$router.push('/')">Trang chủ</span>
      <span class="separator">/</span>
      <span @click="$router.push('/profile')">Hồ sơ</span>
      <span class="separator">/</span>
      <span class="current">Đổi mật khẩu</span>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="main-card form-page-animation">
          <div class="header-simple">
            <div>
              <h2 class="page-title">Đổi mật khẩu</h2>
              <p class="page-subtitle">Thiết lập mật khẩu mới cho tài khoản của bạn</p>
            </div>
          </div>

          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>

          <div v-else class="card-body">
            <div class="security-desc">
              <div class="desc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div class="desc-text">
                Mã xác nhận (OTP) gồm 6 số sẽ được gửi đến email: <strong>{{ maskedEmail }}</strong>
              </div>
            </div>

            <div class="form-grid-container" style="max-width: 500px;">
              <div class="form-group">
                <label>Mật khẩu mới <span class="req">*</span></label>
                <input 
                  type="password" 
                  v-model="passForm.newPassword" 
                  class="form-input" 
                  placeholder="Nhập mật khẩu mới" 
                  :class="{'red-border': errors.newPassword}" 
                  @input="clearError('newPassword')" 
                />
                <span v-if="errors.newPassword" class="error-msg slide-down">{{ errors.newPassword }}</span>
              </div>

              <div class="form-group">
                <label>Xác nhận mật khẩu mới <span class="req">*</span></label>
                <input 
                  type="password" 
                  v-model="passForm.confirmPassword" 
                  class="form-input" 
                  placeholder="Nhập lại mật khẩu mới" 
                  :class="{'red-border': errors.confirmPassword}" 
                  @input="clearError('confirmPassword')" 
                />
                <span v-if="errors.confirmPassword" class="error-msg slide-down">{{ errors.confirmPassword }}</span>
              </div>

              <div class="form-group">
                <label>Mã xác nhận OTP <span class="req">*</span></label>
                <div class="otp-input-group">
                  <input 
                    type="text" 
                    v-model="passForm.otp" 
                    class="form-input otp-input" 
                    placeholder="6 số" 
                    maxlength="6" 
                    :class="{'red-border': errors.otp}" 
                    @input="clearError('otp')" 
                  />
                  <button class="btn-send-otp hover-effect" @click="sendOtpToEmail" :disabled="isSendingOtp || countdown > 0">
                    <span v-if="isSendingOtp"><i class="fa fa-spinner fa-spin"></i></span>
                    <span v-else-if="countdown > 0">Gửi lại {{ countdown }}s</span>
                    <span v-else>Gửi mã</span>
                  </button>
                </div>
                <span v-if="errors.otp" class="error-msg slide-down">{{ errors.otp }}</span>
              </div>

              <div class="footer-actions mt-4">
                <button class="btn-orange hover-effect" @click="handleChangePassword" :disabled="isSubmitting">
                  <span v-if="isSubmitting"><i class="fa fa-spinner fa-spin"></i> Đang xử lý...</span>
                  <span v-else>Xác nhận đổi mật khẩu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer></Footer>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-indicator"></div>
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import ClientSidebar from "../../pages/views/ClientSidebar.vue";
import authService from '../../services/AuthService'; 

const router = useRouter();
const loading = ref(true);
const isSendingOtp = ref(false);
const isSubmitting = ref(false);
const countdown = ref(0);
let timer = null;

const currentUser = ref(null);
const passForm = ref({ newPassword: '', confirmPassword: '', otp: '' });
const errors = ref({});
const toast = ref({ show: false, message: "", type: "success" });

const maskedEmail = computed(() => {
  const email = currentUser.value?.email;
  if (!email) return "Chưa cập nhật email";
  const [name, domain] = email.split('@');
  return name.length > 3 ? name.substring(0, 3) + '***@' + domain : email;
});

onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
  }
  loading.value = false;
});

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => (toast.value.show = false), 3000);
};

const sendOtpToEmail = async () => {
  if (!currentUser.value?.email) return showToast("Tài khoản chưa có email!", "error");
  isSendingOtp.value = true;
  try {
    await authService.forgotPassword(currentUser.value.email, 'customer');
    showToast("Mã OTP đã được gửi đến email!", "success");
    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) clearInterval(timer);
    }, 1000);
  } catch (e) { showToast("Lỗi gửi email!", "error"); }
  finally { isSendingOtp.value = false; }
};

const validatePasswordForm = () => {
  errors.value = {};
  if (!passForm.value.newPassword) errors.value.newPassword = "Nhập mật khẩu mới";
  else if (passForm.value.newPassword.length < 6) errors.value.newPassword = "Tối thiểu 6 ký tự";
  if (passForm.value.newPassword !== passForm.value.confirmPassword) errors.value.confirmPassword = "Mật khẩu không khớp";
  if (!passForm.value.otp) errors.value.otp = "Nhập mã OTP";
  return Object.keys(errors.value).length === 0;
};

const clearError = (field) => delete errors.value[field];

const handleChangePassword = async () => {
  if (!validatePasswordForm()) return;
  isSubmitting.value = true;
  try {
    await authService.resetPassword(currentUser.value.email, passForm.value.otp, passForm.value.newPassword, 'customer');
    showToast("Đổi mật khẩu thành công!", "success");
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push('/login');
    }, 2000);
  } catch (e) { showToast("Mã OTP không hợp lệ!", "error"); }
  finally { isSubmitting.value = false; }
};
</script>

<style scoped>
/* CSS đồng bộ với các trang trước */
.main-card { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); }
.security-desc { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: #f9fafb; border-left: 4px solid #6b3f1e; margin-bottom: 25px; font-size: 14px; }
.desc-icon svg { width: 20px; height: 20px; color: #6b3f1e; }
.otp-input-group { display: flex; gap: 10px; }
.otp-input { text-align: center; letter-spacing: 5px; font-weight: 700; }
.btn-send-otp { height: 45px; min-width: 120px; border: 1px solid #6b3f1e; color: #6b3f1e; background: #fff; border-radius: 8px; cursor: pointer; }
.btn-send-otp:hover:not(:disabled) { background: #fdf8f6; }
.btn-send-otp:disabled { border-color: #d1d5db; color: #9ca3af; }
.mt-4 { margin-top: 20px; }
/* ... [Thêm các class CSS khác như .form-input, .btn-orange từ trang trước] ... */
</style>