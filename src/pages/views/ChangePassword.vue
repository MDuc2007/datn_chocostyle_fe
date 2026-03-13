<template>
  <div class="app-container">
    <Header></Header>

    <div class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <span class="nav-item" @click="$router.push('/')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Trang chủ
        </span>
        <span class="separator">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </span>
        <span class="nav-item" @click="$router.push('/profile')">Hồ sơ của tôi</span>
        <span class="separator">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </span>
        <span class="current">Đổi mật khẩu bảo mật</span>
      </div>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="main-card fade-in-up">
          
          <div class="card-header-custom">
            <div class="header-text">
              <h3 class="page-title">Đổi mật khẩu (OTP)</h3>
              <p class="page-subtitle">Xác thực qua email để bảo vệ tài khoản của bạn an toàn nhất</p>
            </div>
          </div>

          <div class="card-body auth-wrapper-inner">
            <div v-if="loadingData" class="loading-state">
              <div class="spinner-brown"></div>
              <p>Đang chuẩn bị dữ liệu...</p>
            </div>

            <div v-else class="auth-card-inner">
              
              <transition name="fade" mode="out-in">
                <form
                  v-if="step === 1"
                  key="step1"
                  @submit.prevent="handleSendOtp"
                  class="auth-form"
                >
                  <div class="info-box-brown">
                    <span>Mã xác thực (OTP) sẽ được gửi đến email đăng nhập của bạn.</span>
                  </div>

                  <div class="form-group">
                    <label>Email liên kết của bạn</label>
                    <div class="input-wrapper">
                      <span class="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </span>
                      <input
                        v-model="email"
                        type="email"
                        disabled
                        class="disabled-input"
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
                  <div class="info-box-brown">
                    <span>Mã xác thực đã gửi tới: <b>{{ email }}</b></span>
                  </div>

                  <div class="form-group">
                    <label>Nhập mã OTP</label>
                    <div class="input-wrapper">
                      <input
                        v-model="otp"
                        type="text"
                        maxlength="6"
                        placeholder="******"
                        required
                        class="otp-input"
                        @input="clearError"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Mật khẩu mới</label>
                    <div class="input-wrapper">
                      <span class="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </span>
                      <input
                        v-model="newPassword"
                        type="password"
                        placeholder="Tối thiểu 6 ký tự"
                        required
                        @input="clearError"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Xác nhận mật khẩu</label>
                    <div class="input-wrapper">
                      <span class="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </span>
                      <input
                        v-model="confirmPassword"
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        required
                        @input="clearError"
                      />
                    </div>
                  </div>

                  <transition name="slide-up">
                    <div v-if="message" :class="['msg-box', isError ? 'error-msg' : 'success-msg']">
                      <span>{{ message }}</span>
                    </div>
                  </transition>

                  <button type="submit" class="btn-auth mt-4" :disabled="loading">
                    <span v-if="loading" class="spinner"></span>
                    <span v-else>XÁC NHẬN ĐỔI MẬT KHẨU</span>
                  </button>

                  <div class="retry-link">
                    Chưa nhận được mã? <span @click="step = 1">Gửi lại</span>
                  </div>
                </form>
              </transition>
              
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer></Footer>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from "../../services/authService.js";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import ClientSidebar from "../../pages/views/ClientSidebar.vue";

const router = useRouter();

// --- STATE ---
const loadingData = ref(true);
const currentUser = ref(null);

const accountType = ref("KHACH_HANG");
const step = ref(1);

const email = ref("");
const otp = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const loading = ref(false);
const message = ref("");
const isError = ref(false);
const toast = ref({ show: false, message: "", type: "success" });

// --- LIFECYCLE ---
onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
    email.value = currentUser.value.email || currentUser.value.username;
    
    // Nếu login Google (tài khoản không có mật khẩu)
    if (!email.value) {
      showToast("Tài khoản chưa liên kết email hợp lệ!", "error");
      router.push('/profile');
    }
    loadingData.value = false;
  } else {
    showToast("Vui lòng đăng nhập lại!", "error");
    router.push('/login');
  }
});

// --- HELPERS ---
const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => (toast.value.show = false), 3000);
};

const clearError = () => {
  message.value = "";
  isError.value = false;
};

// ===== BƯỚC 1: GỬI OTP =====
const handleSendOtp = async () => {
  loading.value = true;
  clearError();

  try {
    await AuthService.forgotPassword(email.value, accountType.value);
    step.value = 2; // Chuyển sang bước nhập OTP
  } catch (err) {
    isError.value = true;
    message.value = err.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại.";
    showToast("Lỗi gửi mã OTP!", "error");
  } finally {
    loading.value = false;
  }
};

// ===== BƯỚC 2: ĐỔI MẬT KHẨU =====
const handleResetPassword = async () => {
  if (newPassword.value.length < 6) {
    message.value = "Mật khẩu phải tối thiểu 6 ký tự.";
    isError.value = true;
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = "Mật khẩu xác nhận không khớp.";
    isError.value = true;
    return;
  }

  loading.value = true;
  clearError();

  try {
    await AuthService.resetPassword(
      email.value,
      otp.value,
      newPassword.value,
      accountType.value
    );

    // THÀNH CÔNG: Hiện Toast, xóa input và quay về bước 1 (Không đăng xuất)
    showToast("Đổi mật khẩu thành công!", "success");
    otp.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    step.value = 1;

  } catch (err) {
    isError.value = true;
    message.value = err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ================== LAYOUT CHUNG ================== */
.app-container {
  background: #F7F7F7;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #333;
}

.breadcrumb-wrapper {
  background: #FFFFFF;
  border-bottom: 1px solid #f1f5f9;
  padding: 16px 0;
  margin-bottom: 30px;
}

.breadcrumb {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  font-size: 14px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-item { display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s; }
.nav-item:hover { color: #63391F; }
.icon-home { width: 16px; height: 16px; }
.separator svg { width: 14px; height: 14px; margin-top: 2px; color: #9ca3af; }
.current { font-weight: 600; color: #1e293b; }

.main-layout {
  max-width: 1280px;
  margin: 0 auto 60px auto;
  padding: 0 20px;
  display: flex;
  gap: 30px;
  align-items: flex-start;
}
.content-section { flex: 1; min-width: 0; }

/* ================== MAIN CARD ================== */
.main-card {
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.fade-in-up { animation: fadeInUp 0.5s ease forwards; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header-custom {
  padding: 30px 40px;
  border-bottom: 1px solid #f1f5f9;
  background-color: #fafafa;
}

.page-title { margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px;}
.page-subtitle { margin: 0; font-size: 15px; color: #64748b; }


/* ================== KHU VỰC ĐỔI MẬT KHẨU BÊN TRONG ================== */
.card-body { padding: 40px 40px 60px 40px; }

.auth-wrapper-inner {
  display: flex;
  justify-content: flex-start; 
}

.auth-card-inner {
  width: 100%;
  max-width: 500px; 
}

/* --- INFO BOX --- */
.info-box-brown {
  background-color: #fdf8f5;
  color: #63391F;
  padding: 14px 20px;
  border-radius: 6px; /* Bo góc thanh lịch */
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center; /* Căn giữa nội dung */
  margin-bottom: 25px;
  border-left: 4px solid #63391F; /* Thêm dải màu bên trái thay vì nét đứt */
  line-height: 1.5;
}

/* --- FORM & INPUTS --- */
.auth-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #1e293b;
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
  color: #94a3b8;
  display: flex;
  align-items: center;
  transition: color 0.3s;
  pointer-events: none;
}
.input-icon svg { width: 20px; height: 20px;}

.input-wrapper input {
  width: 100%;
  padding: 14px 14px 14px 48px;
  border: 1px solid #cbd5e1;
  background-color: #fff;
  border-radius: 8px;
  font-size: 15px;
  color: #1e293b;
  transition: all 0.25s ease;
  box-sizing: border-box;
}

.input-wrapper input:focus {
  background-color: #fff;
  border-color: #63391F;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
  outline: none;
}

.input-wrapper input:focus + .input-icon,
.input-wrapper:focus-within .input-icon {
  color: #63391F;
}

/* Trường hợp input bị disable (Email) */
.disabled-input {
  background-color: #f8fafc !important;
  color: #64748b !important;
  border-color: #e2e8f0 !important;
  cursor: not-allowed;
  font-weight: 600;
}

/* Style riêng cho ô OTP */
.otp-input {
  text-align: center;
  padding-left: 14px !important; /* Không có icon */
  letter-spacing: 6px;
  font-weight: 700;
  font-size: 20px !important;
}

/* --- BUTTON --- */
.btn-auth {
  width: 100%;
  padding: 15px;
  background: #63391F;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.btn-auth:hover:not(:disabled) {
  background-color: #4e2c17;
  box-shadow: 0 6px 15px rgba(99, 57, 31, 0.2);
  transform: translateY(-2px);
}

.btn-auth:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}
.mt-4 { margin-top: 20px; }

/* --- RETRY LINK --- */
.retry-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #64748b;
}
.retry-link span {
  color: #63391F;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}
.retry-link span:hover {
  text-decoration: underline;
}

/* --- NOTIFICATIONS BÊN TRONG FORM --- */
.msg-box {
  margin-top: 15px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}
.success-msg { background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.error-msg { background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

/* --- ANIMATIONS & SPINNER --- */
.loading-state { text-align: center; padding: 50px 0; color: #64748b; }
.spinner-brown { border: 3px solid #f1f5f9; border-top: 3px solid #63391F; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px; }

.spinner { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: #fff; animation: spin 0.8s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

/* Vue Transition Fade */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from { opacity: 0; transform: translateX(10px); }
.fade-leave-to { opacity: 0; transform: translateX(-10px); }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease;}
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(10px); }

/* ================= TOAST ĐỒNG BỘ CSS ================= */
.toast {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 10001;
  min-width: 300px;
  padding: 16px 24px;
  border-radius: 4px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
}

.toast.warning {
  background: #ffc107;
  color: #333;
  border-left: 4px solid #ff9800;
}

.toast.error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.toast.success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }

/* ================== RESPONSIVE ================== */
@media (max-width: 768px) {
  .main-layout { flex-direction: column; }
  .card-header-custom { padding: 24px;}
  .card-body { padding: 24px; }
  .auth-card-inner { max-width: 100%; }
}
</style>