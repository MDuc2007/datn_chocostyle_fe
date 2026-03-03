<template>
  <div class="app-container">
    <Header></Header>

    <div class="breadcrumb">
      <span @click="$router.push('/')">Trang chủ</span>
      <span class="separator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </span>
      <span @click="$router.push('/profile')">Hồ sơ</span>
      <span class="separator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </span>
      <span class="current">Đổi mật khẩu</span>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="main-card form-page-animation">
          <div class="header-simple">
            <div>
              <h2 class="page-title">Đổi mật khẩu</h2>
              <p class="page-subtitle">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
            </div>
          </div>

          <div class="card-body">
            <div v-if="loadingData" class="loading-state">
              <div class="spinner"></div>
              <p>Đang tải thông tin...</p>
            </div>

            <div v-else class="security-form-container">
              
              <div class="security-desc">
                <div class="desc-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div class="desc-text">
                  Mật khẩu của bạn phải có tối thiểu 6 ký tự. Vui lòng tạo mật khẩu mạnh bao gồm cả chữ và số để bảo vệ tài khoản tốt nhất.
                </div>
              </div>

              <div class="form-grid-container" style="max-width: 500px;">
                
                <div class="form-group">
                  <label>Mật khẩu hiện tại <span class="req">*</span></label>
                  <input 
                    type="password" 
                    v-model="passForm.oldPassword" 
                    class="form-input" 
                    placeholder="Nhập mật khẩu đang sử dụng" 
                    :class="{'red-border': errors.oldPassword}" 
                    @input="clearError('oldPassword')" 
                  />
                  <span v-if="errors.oldPassword" class="error-msg slide-down">{{ errors.oldPassword }}</span>
                </div>

                <div class="form-group mt-2">
                  <label>Mật khẩu mới <span class="req">*</span></label>
                  <input 
                    type="password" 
                    v-model="passForm.newPassword" 
                    class="form-input" 
                    placeholder="Tối thiểu 6 ký tự" 
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

                <div class="footer-actions mt-4">
                  <button 
                    class="btn-orange hover-effect" 
                    @click="handleChangePassword" 
                    :disabled="isSubmitting"
                  >
                    <span v-if="isSubmitting"><i class="fa fa-spinner fa-spin"></i> Đang xử lý...</span>
                    <span v-else>Xác nhận thay đổi</span>
                  </button>
                </div>

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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import ClientSidebar from "../../pages/views/ClientSidebar.vue";

const router = useRouter();

// --- STATE ---
const loadingData = ref(true);
const isSubmitting = ref(false);
const currentUser = ref(null);

const passForm = ref({ 
  oldPassword: '',
  newPassword: '', 
  confirmPassword: ''
});

const errors = ref({});
const toast = ref({ show: false, message: "", type: "success" });

// --- LIFECYCLE ---
onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
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

const clearError = (field) => {
  if (errors.value[field]) delete errors.value[field];
};

// --- VALIDATION ---
const validatePasswordForm = () => {
  errors.value = {};
  let isValid = true;

  if (!passForm.value.oldPassword) { 
    errors.value.oldPassword = "Vui lòng nhập mật khẩu hiện tại"; 
    isValid = false; 
  }

  if (!passForm.value.newPassword) { 
    errors.value.newPassword = "Vui lòng nhập mật khẩu mới"; 
    isValid = false; 
  } else if (passForm.value.newPassword.length < 6) { 
    errors.value.newPassword = "Mật khẩu phải từ 6 ký tự trở lên"; 
    isValid = false; 
  }
  
  if (passForm.value.newPassword !== passForm.value.confirmPassword) { 
    errors.value.confirmPassword = "Mật khẩu xác nhận không khớp"; 
    isValid = false; 
  }
  
  if (passForm.value.oldPassword && passForm.value.newPassword && passForm.value.oldPassword === passForm.value.newPassword) {
    errors.value.newPassword = "Mật khẩu mới không được trùng với mật khẩu cũ";
    isValid = false;
  }

  return isValid;
};

// --- LOGIC: ĐỔI MẬT KHẨU ---
const handleChangePassword = async () => {
  if (!validatePasswordForm()) return;

  isSubmitting.value = true;
  const token = localStorage.getItem("token") || currentUser.value.accessToken;

  try {
    const payload = {
      oldPassword: passForm.value.oldPassword,
      newPassword: passForm.value.newPassword
    };

    // ĐIỀU CHỈNH URL API NÀY CHO KHỚP VỚI BACKEND CỦA BẠN
    // Ví dụ URL: http://localhost:8080/api/khach-hang/${id}/doi-mat-khau
    await axios.put(
      `http://localhost:8080/api/khach-hang/${currentUser.value.id}/change-password`, 
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    showToast("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", "success");
    
    // Đổi mk xong thì bắt đăng nhập lại
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push('/login'); 
    }, 2000);

  } catch (error) {
    console.error(error);
    const errorMsg = error.response?.data?.message || error.response?.data || "Mật khẩu hiện tại không chính xác!";
    showToast(errorMsg, "error");
    errors.value.oldPassword = "Mật khẩu không chính xác";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* ================== LAYOUT CHUNG ================== */
.app-container {
  background: #f4f6f8;
  min-height: 100vh;
  font-family: 'Inter', "Segoe UI", sans-serif;
  color: #333;
}

.breadcrumb {
  max-width: 1280px;
  margin: 20px auto;
  padding: 0 20px;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}
.breadcrumb span { cursor: pointer; transition: color 0.2s; }
.breadcrumb span:hover { color: #6b3f1e; }
.breadcrumb .separator svg { width: 14px; height: 14px; margin-top: 3px; }
.breadcrumb .current { font-weight: 500; color: #111827; cursor: default; }

.main-layout {
  max-width: 1280px;
  margin: 0 auto 50px auto;
  padding: 0 20px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.content-section { flex: 1; min-width: 0; }

/* ================== MAIN CARD & HEADER ================== */
.main-card {
  background: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}

.header-simple { 
  margin-bottom: 25px; 
  border-bottom: 1px solid #f3f4f6; 
  padding-bottom: 20px;
}

.page-title { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #111827; }
.page-subtitle { margin: 0; font-size: 14px; color: #6b7280; }

/* ================== FORM BẢO MẬT ================== */
.security-form-container {
  padding-top: 10px;
}

.security-desc { 
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px; 
  background: #f9fafb; 
  border-left: 4px solid #6b3f1e; 
  border-radius: 8px;
  margin-bottom: 30px; 
  font-size: 14.5px; 
  color: #4b5563; 
  line-height: 1.6; 
  max-width: 500px;
}
.desc-icon svg { width: 22px; height: 22px; color: #6b3f1e; margin-top: 2px; }

.form-grid-container { display: flex; flex-direction: column; gap: 20px; }

.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 8px; font-weight: 600; font-size: 13px; color: #4b5563; }
.req { color: #dc2626; margin-left: 3px; }

.form-input { 
  padding: 10px 15px; 
  height: 45px; 
  border: 1px solid #d1d5db; 
  border-radius: 8px; 
  font-size: 14px; 
  outline: none; 
  background: #fff; 
  color: #111827; 
  transition: all 0.2s; 
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus { border-color: #6b3f1e; box-shadow: 0 0 0 3px rgba(107, 63, 30, 0.1); }
.red-border { border-color: #dc2626 !important; background-color: #fef2f2; }
.error-msg { color: #dc2626; font-size: 12px; font-style: italic; margin-top: 6px; }

.mt-2 { margin-top: 5px; }
.mt-4 { margin-top: 15px; }

.btn-orange { 
  background: linear-gradient(135deg, #6b3f1e, #b8895d); 
  color: #fff; 
  border: none; 
  padding: 12px 30px; 
  border-radius: 8px; 
  font-weight: 600; 
  font-size: 15px;
  cursor: pointer; 
  transition: 0.2s; 
  width: 100%; 
  height: 45px;
}
.btn-orange:hover:not(:disabled) { box-shadow: 0 4px 10px rgba(107, 63, 30, 0.3); transform: translateY(-1px);}
.btn-orange:disabled { opacity: 0.7; cursor: not-allowed; }

/* ================== HIỆU ỨNG VÀ TRẠNG THÁI ================== */
.loading-state { text-align: center; padding: 60px 0; color: #6b7280; }
.spinner { border: 3px solid #f3f4f6; border-top: 3px solid #6b3f1e; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* TOAST */
.toast-notification { position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 250px; padding: 12px 15px; border-radius: 6px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); font-size: 14px; font-weight: 500; background: #F0FDF4; color: #111827; }
.toast-indicator { width: 6px; height: 100%; background-color: #10B981; position: absolute; left: 0; top: 0; border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
.toast-content { margin-left: 10px; }
.toast-notification.error { background: #FEF2F2; color: #991b1b; }
.toast-notification.error .toast-indicator { background-color: #EF4444; }

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s; }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }

/* ================== RESPONSIVE ================== */
@media (max-width: 768px) {
  .main-layout { flex-direction: column; }
}
</style>