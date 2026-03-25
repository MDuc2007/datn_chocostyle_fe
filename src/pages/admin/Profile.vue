<template>
  <div class="profile-page">
    <div class="main-card form-page-animation">
      <div class="header-simple">
        <h2 class="page-title">Thông tin tài khoản</h2>
      </div>

      <div class="body-layout-split">
        <div class="left-panel">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <label class="avatar-circle" :class="{'is-uploading': isUploadingAvatar}" title="Thay đổi ảnh đại diện">
                
                <img 
                  v-if="userInfo.avatar && !imageError" 
                  :src="userInfo.avatar" 
                  alt="Avatar" 
                  @error="imageError = true" 
                />
                
                <div v-else class="avatar-placeholder">
                  {{ getInitialName(userInfo.fullName) }}
                </div>
                
                <div class="avatar-overlay-edit" v-if="!isUploadingAvatar">
                  <span>Thay đổi</span>
                </div>
                
                <div class="avatar-loading" v-if="isUploadingAvatar">
                  <i class="fa fa-spinner fa-spin fa-2x"></i>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  @change="handleAvatarUpload"
                  class="file-input-hidden"
                  :disabled="isUploadingAvatar"
                />
              </label>

              <h3 class="user-name">{{ userInfo.fullName || 'Tên người dùng' }}</h3>
              <span class="user-role badge-role" :class="{'badge-admin': isAdmin}">
                {{ userInfo.role }}
              </span>
            </div>
          </div>
          
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ userInfo.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">SĐT:</span>
              <span class="info-value">{{ userInfo.phone }}</span>
            </div>
          </div>
        </div>

        <div class="right-panel">
          <div class="custom-tabs">
            <button 
              class="tab-btn hover-effect" 
              :class="{ active: activeTab === 'info' }"
              @click="activeTab = 'info'"
            >
              Hồ sơ cá nhân
            </button>
            <button 
              class="tab-btn hover-effect" 
              :class="{ active: activeTab === 'security' }"
              @click="activeTab = 'security'"
            >
              Đổi mật khẩu
            </button>
          </div>

          <div v-if="activeTab === 'info'" class="tab-content fade-in">
            <h3 class="panel-heading">Chi tiết thông tin</h3>
            <form @submit.prevent="handleUpdateProfile" class="form-grid-container">
              <div class="row-duo">
                <div class="form-group">
                  <label>Họ và tên <span class="req">*</span></label>
                  <input 
                    type="text" 
                    v-model="userInfo.fullName" 
                    class="form-input" 
                    :class="{'red-border': profileErrors.fullName}"
                    @input="clearProfileError('fullName')" 
                    placeholder="Nhập họ và tên"
                  />
                  <span v-if="profileErrors.fullName" class="error-msg slide-down">{{ profileErrors.fullName }}</span>
                </div>
                <div class="form-group">
                  <label>Giới tính <span class="req">*</span></label>
                  <select v-model="userInfo.gender" class="form-input">
                    <option :value="true">Nam</option>
                    <option :value="false">Nữ</option>
                  </select>
                </div>
              </div>
              <div class="row-duo">
                <div class="form-group">
                  <label>Email</label>
                  <input type="text" :value="userInfo.email" class="form-input disabled-input" readonly disabled />
                </div>
                <div class="form-group">
                  <label>Số điện thoại <span class="req">*</span></label>
                  <input 
                    type="text" 
                    v-model="userInfo.phone" 
                    class="form-input" 
                    :class="{'red-border': profileErrors.phone}"
                    @input="clearProfileError('phone')" 
                    placeholder="Ví dụ: 0912345678"
                  />
                  <span v-if="profileErrors.phone" class="error-msg slide-down">{{ profileErrors.phone }}</span>
                </div>
              </div>
              <div class="form-group">
                <label>Ngày sinh <span class="req">*</span></label>
                <input 
                  type="date" 
                  v-model="userInfo.dob" 
                  class="form-input" 
                  :class="{'red-border': profileErrors.dob}"
                  @input="clearProfileError('dob')"
                />
                <span v-if="profileErrors.dob" class="error-msg slide-down">{{ profileErrors.dob }}</span>
              </div>

              <div class="footer-actions" style="margin-top: 20px;">
                <button type="submit" class="btn-orange hover-effect" :disabled="isSavingProfile">
                  <span v-if="isSavingProfile"><i class="fa fa-spinner fa-spin"></i> Đang lưu...</span>
                  <span v-else>Cập nhật hồ sơ</span>
                </button>
              </div>
            </form>
          </div>

          <div v-if="activeTab === 'security'" class="tab-content fade-in">
            <h3 class="panel-heading">Bảo mật tài khoản</h3>
            
            <div class="auth-card-inner">
              <transition name="fade" mode="out-in">
                <form
                  v-if="step === 1"
                  key="step1"
                  @submit.prevent="sendOtpToEmail"
                  class="auth-form"
                >
                  <div class="info-box-brown">
                    <span>Mã xác thực (OTP) sẽ được gửi đến email để xác minh danh tính của bạn.</span>
                  </div>

                  <div class="form-group">
                    <label>Email liên kết của bạn</label>
                    <div class="input-wrapper">
                      <span class="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </span>
                      <input
                        :value="userInfo.email"
                        type="email"
                        disabled
                        class="disabled-input with-icon"
                      />
                    </div>
                  </div>

                  <button type="submit" :disabled="isSendingOtp" class="btn-auth">
                    <span v-if="isSendingOtp" class="spinner"></span>
                    <span v-else>GỬI MÃ XÁC THỰC</span>
                  </button>
                </form>

                <form
                  v-else
                  key="step2"
                  @submit.prevent="handleChangePassword"
                  class="auth-form"
                >
                  <div class="info-box-brown">
                    <span>Mã xác thực đã gửi tới: <b>{{ maskedEmail }}</b></span>
                  </div>

                  <div class="form-group">
                    <label>Nhập mã OTP <span class="req">*</span></label>
                    <div class="input-wrapper">
                      <input
                        v-model="passForm.otp"
                        type="text"
                        maxlength="6"
                        placeholder="******"
                        required
                        class="form-input otp-input"
                        :class="{'red-border': errors.otp}"
                        @input="clearError('otp')"
                      />
                    </div>
                    <span v-if="errors.otp" class="error-msg slide-down">{{ errors.otp }}</span>
                  </div>

                  <div class="form-group">
                    <label>Mật khẩu mới <span class="req">*</span></label>
                    <div class="input-wrapper">
                      <span class="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </span>
                      <input
                        v-model="passForm.newPassword"
                        type="password"
                        placeholder="Tối thiểu 6 ký tự"
                        required
                        class="form-input with-icon"
                        :class="{'red-border': errors.newPassword}"
                        @input="clearError('newPassword')"
                      />
                    </div>
                    <span v-if="errors.newPassword" class="error-msg slide-down">{{ errors.newPassword }}</span>
                  </div>

                  <div class="form-group">
                    <label>Xác nhận mật khẩu <span class="req">*</span></label>
                    <div class="input-wrapper">
                      <span class="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </span>
                      <input
                        v-model="passForm.confirmPassword"
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        required
                        class="form-input with-icon"
                        :class="{'red-border': errors.confirmPassword}"
                        @input="clearError('confirmPassword')"
                      />
                    </div>
                    <span v-if="errors.confirmPassword" class="error-msg slide-down">{{ errors.confirmPassword }}</span>
                  </div>

                  <button type="submit" class="btn-auth mt-4" :disabled="isSubmitting">
                    <span v-if="isSubmitting" class="spinner"></span>
                    <span v-else>XÁC NHẬN ĐỔI MẬT KHẨU</span>
                  </button>

                  <div class="retry-link">
                    Chưa nhận được mã hoặc mã hết hạn? <span @click="step = 1">Gửi lại</span>
                  </div>
                </form>
              </transition>
            </div>
            
          </div>
        </div>
      </div>
    </div>

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
import axios from 'axios';
import authService from '../../services/AuthService'; 

// --- STATE QUẢN LÝ GIAO DIỆN ---
const activeTab = ref('info');
const isSendingOtp = ref(false);
const isSubmitting = ref(false);
const isUploadingAvatar = ref(false);
const isSavingProfile = ref(false); // Trạng thái lưu hồ sơ
const countdown = ref(0);
const step = ref(1); // Quản lý bước Đổi mật khẩu
const toast = ref({ show: false, message: "", type: "success" });
let timer = null;

const imageError = ref(false);

// --- STATE DỮ LIỆU ---
const userInfo = ref({
  id: null,
  fullName: "",
  email: "",
  phone: "",
  gender: true,
  dob: "",
  avatar: null,
  role: "" 
});

const passForm = ref({
  newPassword: '',
  confirmPassword: '',
  otp: ''
});
const errors = ref({});
const profileErrors = ref({}); // Bắt lỗi riêng cho Form Hồ Sơ

// --- HELPERS ---
const getInitialName = (name) => {
  if (!name) return "A";
  const words = String(name).trim().split(" ");
  return words[words.length - 1].charAt(0).toUpperCase();
};

const isAdmin = computed(() => {
  if (!userInfo.value.role) return false;
  const roleLower = userInfo.value.role.toLowerCase();
  return roleLower.includes('admin') || roleLower.includes('quản trị');
});

const maskedEmail = computed(() => {
  const email = userInfo.value.email;
  if (!email) return "";
  const [name, domain] = email.split('@');
  if (name.length <= 3) return email;
  return name.substring(0, 3) + '***@' + domain;
});

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => (toast.value.show = false), 3000);
};

// --- LIFECYCLE: LẤY THÔNG TIN NHÂN VIÊN ---
onMounted(async () => {
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (userStr && token) {
    try {
      const userData = JSON.parse(userStr);
      
      const res = await axios.get(`http://localhost:8080/api/nhan-vien/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = res.data;
      
      let determinedRole = "Nhân viên";
      const possibleAdminStrings = [
        data.vaiTro, data.role, userData.vaiTro, userData.role, data.hoTen, data.tenNhanVien
      ];

      for (const str of possibleAdminStrings) {
        if (str && typeof str === 'string') {
          const lowerStr = str.toLowerCase();
          if (lowerStr.includes('admin') || lowerStr.includes('quản trị')) {
            determinedRole = "Quản trị hệ thống";
            break;
          }
        }
      }

      let avatarUrl = data.avatar;
      if (avatarUrl && !avatarUrl.startsWith("http")) {
        avatarUrl = `http://localhost:8080/images/${avatarUrl}`;
      }

      userInfo.value = {
        id: data.id,
        fullName: data.tenNhanVien || data.hoTen,
        email: data.email,
        phone: data.soDienThoai || data.sdt,
        gender: data.gioiTinh,
        dob: data.ngaySinh,
        avatar: avatarUrl, 
        role: determinedRole 
      };

      imageError.value = false;
    } catch (error) {
      console.error("Lỗi tải thông tin:", error);
      showToast("Không thể tải thông tin tài khoản!", "error");
    }
  }
});

// ================= CẬP NHẬT HỒ SƠ =================
const clearProfileError = (field) => {
  if (profileErrors.value[field]) delete profileErrors.value[field];
};

const validateProfile = () => {
  profileErrors.value = {};
  let valid = true;

  if (!userInfo.value.fullName || !userInfo.value.fullName.trim()) {
    profileErrors.value.fullName = "Họ và tên không được để trống";
    valid = false;
  }
  
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  if (!userInfo.value.phone || !userInfo.value.phone.trim()) {
    profileErrors.value.phone = "Số điện thoại không được để trống";
    valid = false;
  } else if (!phoneRegex.test(userInfo.value.phone)) {
    profileErrors.value.phone = "Số điện thoại không hợp lệ (Gồm 10 số, bắt đầu bằng 03,05,07,08,09)";
    valid = false;
  }

  if (!userInfo.value.dob) {
    profileErrors.value.dob = "Vui lòng chọn ngày sinh";
    valid = false;
  }

  return valid;
};

const handleUpdateProfile = async () => {
  if (!validateProfile()) {
    showToast("Vui lòng kiểm tra lại thông tin nhập!", "warning");
    return;
  }

  isSavingProfile.value = true;
  try {
    const token = localStorage.getItem('token');
    
    // Đóng gói data theo Entity NhanVien của Backend
    const payload = {
      tenNhanVien: userInfo.value.fullName,
      hoTen: userInfo.value.fullName,
      soDienThoai: userInfo.value.phone,
      sdt: userInfo.value.phone,
      gioiTinh: userInfo.value.gender,
      ngaySinh: userInfo.value.dob
    };

    await axios.put(`http://localhost:8080/api/nhan-vien/${userInfo.value.id}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    showToast("Cập nhật hồ sơ thành công!", "success");

    // Cập nhật lại LocalStorage để Navbar đồng bộ tên
    const userStr = localStorage.getItem("user");
    if (userStr) {
      let ud = JSON.parse(userStr);
      ud.tenNhanVien = userInfo.value.fullName;
      ud.hoTen = userInfo.value.fullName;
      localStorage.setItem("user", JSON.stringify(ud));
    }

  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ:", error);
    showToast("Đã xảy ra lỗi khi lưu hồ sơ!", "error");
  } finally {
    isSavingProfile.value = false;
  }
};

// ================= THAY ĐỔI AVATAR =================
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.", "error");
    event.target.value = '';
    return;
  }

  const oldAvatar = userInfo.value.avatar;
  userInfo.value.avatar = URL.createObjectURL(file);
  isUploadingAvatar.value = true;
  imageError.value = false;

  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatarFile", file);

    const res = await axios.post(`http://localhost:8080/api/nhan-vien/${userInfo.value.id}/avatar`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.data && res.data.avatar) {
      let newAvatarUrl = res.data.avatar;
      if (!newAvatarUrl.startsWith("http")) {
        newAvatarUrl = `http://localhost:8080/images/${newAvatarUrl}`;
      }
      userInfo.value.avatar = newAvatarUrl;
    }

    showToast("Cập nhật ảnh đại diện thành công!", "success");

    setTimeout(() => {
      window.location.reload();
    }, 1000);

  } catch (error) {
    console.error("Lỗi Upload:", error);
    userInfo.value.avatar = oldAvatar; 
    showToast("Không thể lưu ảnh đại diện. Vui lòng thử lại!", "error");
  } finally {
    isUploadingAvatar.value = false;
    event.target.value = ''; 
  }
};
// ================= GỬI OTP (BƯỚC 1) =================
const sendOtpToEmail = async () => {
  if (!userInfo.value.email) {
    showToast("Không tìm thấy email của tài khoản này!", "error");
    return;
  }
  isSendingOtp.value = true;
  try {
    // 👉 ĐÃ ĐỒNG BỘ: Sửa 'staff' thành 'NHAN_VIEN'
    await authService.forgotPassword(userInfo.value.email, 'NHAN_VIEN');
    showToast("Mã OTP đã được gửi đến email của bạn!", "success");
    step.value = 2; 
  } catch (error) {
    showToast(error.response?.data?.message || "Lỗi khi gửi email. Vui lòng thử lại!", "error");
  } finally {
    isSendingOtp.value = false;
  }
};

// ================= ĐỔI MẬT KHẨU (BƯỚC 2) =================
const validatePasswordForm = () => {
  errors.value = {};
  let isValid = true;
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
  if (!passForm.value.otp) {
    errors.value.otp = "Vui lòng nhập mã OTP";
    isValid = false;
  } else if (passForm.value.otp.length !== 6) {
    errors.value.otp = "Mã OTP phải gồm 6 chữ số";
    isValid = false;
  }
  return isValid;
};

const clearError = (field) => {
  if (errors.value[field]) delete errors.value[field];
};

const handleChangePassword = async () => {
  if (!validatePasswordForm()) return;
  isSubmitting.value = true;
  try {
    await authService.resetPassword(
      userInfo.value.email, 
      passForm.value.otp, 
      passForm.value.newPassword, 
      'NHAN_VIEN' // 👉 ĐÃ ĐỒNG BỘ: Sửa 'staff' thành 'NHAN_VIEN'
    );
    showToast("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", "success");
    passForm.value = { newPassword: '', confirmPassword: '', otp: '' };
    step.value = 1;
    
    setTimeout(() => {
      authService.logout();
      router.push('/admin/login'); // 👉 ĐÃ SỬA: Đá về trang Đăng nhập Nhân viên
    }, 2000);
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.response?.data || "Mã OTP không chính xác hoặc đã hết hạn!";
    showToast(errorMsg, "error");
    errors.value.otp = "Mã OTP không hợp lệ";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* =========================================
   GLOBAL & LAYOUT
   ========================================= */
.profile-page {
  font-family: "Segoe UI", sans-serif;
  padding: 0;
  background-color: #f7f7f7;
  --primary-brown: #63391f;
  --primary-light: #fdf8f6;
  --text-main: #484848;
  --border-color: #e0e0e0;
  min-height: 100vh;
}

.main-card {
  position: relative;
  background: #ffffff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 0 auto;
  box-sizing: border-box;
}

.header-simple { margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 15px;}
.page-title { color: var(--primary-brown); font-size: 22px; font-weight: 700; margin: 0; }

.body-layout-split { display: flex; gap: 40px; }

/* =========================================
   LEFT PANEL (AVATAR)
   ========================================= */
.left-panel {
  flex: 0 0 280px;
  background: #fafafa;
  padding: 30px 20px;
  border-radius: 16px;
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: fit-content;
}

.avatar-section { margin-bottom: 25px; }
.avatar-wrapper { display: flex; flex-direction: column; align-items: center; }

.avatar-circle {
  width: 130px; 
  height: 130px; 
  border: 4px solid #fdf8f6; 
  box-shadow: 0 4px 15px rgba(99, 57, 31, 0.1); 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  overflow: hidden; 
  background: #f0f0f0; 
  margin-bottom: 15px; 
  position: relative; 
  cursor: pointer; 
  transition: 0.3s;
}
.avatar-circle:hover:not(.is-uploading) {
  box-shadow: 0 5px 20px rgba(99, 57, 31, 0.3);
  border-color: var(--primary-brown);
}
.avatar-circle img { width: 100%; height: 100%; object-fit: cover; }

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #63391F, #8b5328);
  color: #ffffff;
  font-size: 48px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-input-hidden { display: none; }

.avatar-overlay-edit {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: 0.3s;
}
.avatar-overlay-edit span { color: #fff; font-size: 13px; font-weight: 600; }
.avatar-circle:hover .avatar-overlay-edit { opacity: 1; }

.avatar-loading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--primary-brown);
}
.avatar-circle.is-uploading { cursor: not-allowed; opacity: 0.8; }

.user-name { font-size: 18px; font-weight: 700; color: #333; margin: 0 0 8px 0; text-align: center; }

.badge-role { 
  background: #fdf3ea; 
  color: #b45309; 
  padding: 5px 12px; 
  border-radius: 20px; 
  font-size: 12px; 
  font-weight: 600; 
}
.badge-admin { background: #fee2e2 !important; color: #dc2626 !important; }

.info-list { width: 100%; display: flex; flex-direction: column; gap: 15px; margin-top: 10px; border-top: 1px dashed #ddd; padding-top: 20px;}
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-label { font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase; }
.info-value { font-size: 14px; color: #333; font-weight: 500; word-break: break-all; }

/* =========================================
   RIGHT PANEL & TABS
   ========================================= */
.right-panel { flex: 1; }

.custom-tabs { display: flex; gap: 10px; margin-bottom: 25px; border-bottom: 2px solid #eee; }
.tab-btn { background: none; border: none; font-size: 15px; font-weight: 600; color: #888; padding: 10px 20px; cursor: pointer; position: relative; transition: 0.3s; }
.tab-btn::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0%; height: 2px; background: var(--primary-brown); transition: 0.3s; }
.tab-btn:hover { color: var(--primary-brown); }
.tab-btn.active { color: var(--primary-brown); }
.tab-btn.active::after { width: 100%; }

.panel-heading { font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 20px; }

/* =========================================
   FORM ELEMENTS (CHUNG)
   ========================================= */
.form-grid-container { display: flex; flex-direction: column; gap: 20px; }
.row-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; margin-bottom: 15px;}
.form-group label { margin-bottom: 8px; font-weight: 600; font-size: 13px; color: var(--primary-brown); }
.req { color: #c0392b; margin-left: 3px; }

.form-input { 
  padding: 10px 15px; 
  height: 45px; 
  border: 1px solid #cbd5e1; 
  border-radius: 8px; 
  font-size: 14px; 
  outline: none; 
  background: #fff; 
  transition: all 0.2s; 
  box-sizing: border-box; 
  width: 100%; 
  color: #1e293b;
}
.form-input:focus { border-color: var(--primary-brown); box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1); }
.disabled-input { background: #f8fafc !important; color: #64748b !important; border-style: dashed; cursor: not-allowed; font-weight: 600; }

.red-border { border-color: #c0392b !important; background-color: #fff5f5; }
.error-msg { color: #c0392b; font-size: 12px; font-style: italic; margin-top: 6px; }

/* =========================================
   AUTH SECTION (ĐỔI MẬT KHẨU STEP)
   ========================================= */
.auth-card-inner { max-width: 500px; }
.auth-form { display: flex; flex-direction: column; }

.info-box-brown {
  background-color: #fdf8f5;
  color: #63391F;
  padding: 14px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  border-left: 4px solid #63391F;
  line-height: 1.5;
}

.input-wrapper { position: relative; display: flex; align-items: center; }
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
.form-input.with-icon { padding-left: 48px; }
.input-wrapper:focus-within .input-icon { color: #63391F; }

.otp-input {
  text-align: center;
  letter-spacing: 6px;
  font-weight: 700;
  font-size: 20px;
}

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
.btn-auth:hover:not(:disabled) { background-color: #4e2c17; box-shadow: 0 6px 15px rgba(99, 57, 31, 0.2); transform: translateY(-2px); }
.btn-auth:disabled { background-color: #94a3b8; cursor: not-allowed; }

.retry-link { margin-top: 20px; text-align: center; font-size: 14px; color: #64748b; }
.retry-link span { color: #63391F; font-weight: 700; cursor: pointer; text-decoration: none; }
.retry-link span:hover { text-decoration: underline; }

.spinner { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: #fff; animation: spin 0.8s linear infinite; }

/* =========================================
   FOOTER & BUTTONS CHUNG
   ========================================= */
.footer-actions { display: flex; justify-content: flex-end; }
.btn-orange { background: linear-gradient(135deg, #5a3420, #b8895d); color: #fff; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; width: 100%; }
.btn-orange:hover:not(:disabled) { background-color: #4e2c17; box-shadow: 0 4px 10px rgba(99, 57, 31, 0.25); }
.btn-orange:disabled { opacity: 0.7; cursor: not-allowed; }

/* TOAST */
.toast-notification { position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 250px; padding: 12px 15px; border-radius: 6px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); font-size: 14px; font-weight: 500; background: #F0FDF4; color: #374151; }
.toast-indicator { width: 6px; height: 100%; background-color: #22C55E; position: absolute; left: 0; top: 0; border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
.toast-content { margin-left: 10px; }
.toast-notification.error { background: #FEF2F2; color: #991b1b; }
.toast-notification.error .toast-indicator { background-color: #ef4444; }
.toast-notification.warning { background: #fffbeb; color: #b45309; }
.toast-notification.warning .toast-indicator { background-color: #f59e0b; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s; }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }

/* ANIMATIONS */
.fade-in { animation: fadeIn 0.4s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.slide-down { animation: slideDown 0.2s ease-out; }
@keyframes slideDown { from { transform: translateY(-5px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.form-page-animation { opacity: 0; animation: fadeInUp 0.5s forwards; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from { opacity: 0; transform: translateX(10px); }
.fade-leave-to { opacity: 0; transform: translateX(-10px); }

@media (max-width: 768px) {
  .body-layout-split { flex-direction: column; gap: 20px;}
  .left-panel { width: 100%; flex: none; }
  .row-duo { grid-template-columns: 1fr; gap: 15px; }
}
</style>  