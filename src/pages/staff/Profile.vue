<template>
  <div class="profile-page">
    <div class="main-card form-page-animation">
      <div class="header-simple">
        <button
          class="btn-back hover-effect"
          @click="$router.push('/admin/dashboard')"
        >
          <i class="fa fa-arrow-left"></i> Quay lại
        </button>
        <h2 class="page-title" style="margin-top: 15px;">Hồ sơ của tôi</h2>
      </div>

      <div v-if="loadingData" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>

      <div v-else class="body-layout-split">
        <div class="left-panel">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <label class="avatar-circle" :class="{'is-uploading': isUploadingAvatar}" title="Thay đổi ảnh đại diện">
                <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="Avatar" />
                <div v-else class="placeholder-text">
                  <i class="fa fa-user fa-2x"></i>
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
              <span class="info-label">Trạng thái:</span>
              <span class="info-value">
                <span class="status-badge" :class="userInfo.status === 1 ? 'status-active' : 'status-inactive'">
                  {{ userInfo.status === 1 ? 'Đang làm việc' : 'Đã nghỉ việc' }}
                </span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Mã Nhân viên:</span>
              <span class="info-value">{{ userInfo.maNv || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ngày vào làm:</span>
              <span class="info-value">{{ formatDate(userInfo.ngayVaoLam) || 'N/A' }}</span>
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
            <div class="right-header-row">
              <h3 class="panel-heading">Chi tiết thông tin</h3>
              <button class="btn-edit-link" @click="goToEdit">
                <i class="fa fa-pencil"></i> Chỉnh sửa
              </button>
            </div>
            
            <div class="form-grid-container">
              <div class="row-duo">
                <div class="form-group">
                  <label>Họ và tên</label>
                  <input type="text" :value="userInfo.fullName" class="form-input" readonly />
                </div>
                <div class="form-group">
                  <label>Giới tính</label>
                  <input type="text" :value="userInfo.gender ? 'Nam' : 'Nữ'" class="form-input" readonly />
                </div>
              </div>
              <div class="row-duo">
                <div class="form-group">
                  <label>Email</label>
                  <input type="text" :value="userInfo.email" class="form-input" readonly />
                </div>
                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input type="text" :value="userInfo.phone" class="form-input" readonly />
                </div>
              </div>
              <div class="row-duo">
                <div class="form-group">
                  <label>Ngày sinh</label>
                  <input type="text" :value="formatDate(userInfo.dob)" class="form-input" readonly />
                </div>
                 <div class="form-group">
                  <label>Căn cước công dân</label>
                  <input type="text" :value="userInfo.cccd || 'Không có'" class="form-input" readonly />
                </div>
              </div>
              
              <div class="form-group" style="margin-top: 10px;">
                <label>Địa chỉ thường trú</label>
                <textarea class="form-input text-area" readonly rows="3" :value="userInfo.address || 'Không có thông tin địa chỉ'"></textarea>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'security'" class="tab-content fade-in">
            <h3 class="panel-heading">Bảo mật tài khoản</h3>
            <div class="security-desc">
              Hệ thống sẽ gửi một mã xác nhận (OTP) gồm 6 số vào địa chỉ email <b>{{ maskedEmail }}</b> của bạn.
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
                <label>Mã xác nhận Email (OTP) <span class="req">*</span></label>
                <div class="otp-input-group">
                  <input 
                    type="text" 
                    v-model="passForm.otp" 
                    class="form-input otp-input" 
                    placeholder="Nhập 6 số OTP"
                    maxlength="6"
                    :class="{'red-border': errors.otp}"
                    @input="clearError('otp')"
                  />
                  <button 
                    class="btn-send-otp hover-effect" 
                    @click="sendOtpToEmail"
                    :disabled="isSendingOtp || countdown > 0"
                  >
                    <span v-if="isSendingOtp"><i class="fa fa-spinner fa-spin"></i> Đang gửi...</span>
                    <span v-else-if="countdown > 0">Gửi lại sau {{ countdown }}s</span>
                    <span v-else>Gửi mã</span>
                  </button>
                </div>
                <span v-if="errors.otp" class="error-msg slide-down">{{ errors.otp }}</span>
              </div>

              <div class="footer-actions" style="margin-top: 20px;">
                <button 
                  class="btn-orange hover-effect" 
                  @click="handleChangePassword"
                  :disabled="isSubmitting"
                >
                  <span v-if="isSubmitting"><i class="fa fa-spinner fa-spin"></i> Đang xử lý...</span>
                  <span v-else>Xác nhận đổi mật khẩu</span>
                </button>
              </div>

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
import { useRouter } from 'vue-router';
// 👉 Chú ý: Đảm bảo đường dẫn tới authService là đúng so với cấu trúc thư mục của bạn
import authService from '../../services/AuthService'; 

const router = useRouter();
const loadingData = ref(true);
const toast = ref({ show: false, message: "", type: "success" });

// Các state cho tab Bảo mật và Upload
const activeTab = ref('info');
const isSendingOtp = ref(false);
const isSubmitting = ref(false);
const isUploadingAvatar = ref(false);
const countdown = ref(0);
let timer = null;

let currentUserId = null; 

const userInfo = ref({
  id: null,
  maNv: "",
  fullName: "",
  email: "",
  phone: "",
  gender: true,
  dob: "",
  avatar: null,
  role: "",
  status: 1,
  ngayVaoLam: "",
  address: "",
  cccd: ""
});

const passForm = ref({
  newPassword: '',
  confirmPassword: '',
  otp: ''
});
const errors = ref({});

// Hàm kiểm tra Admin
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

// Format hiển thị ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "";
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`; 
  }
  return dateString;
};

// --- LIFECYCLE: LẤY THÔNG TIN NGƯỜI ĐANG ĐĂNG NHẬP ---
onMounted(async () => {
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      currentUserId = userData.id;
    } catch (e) {
      console.error("Lỗi đọc dữ liệu người dùng:", e);
    }
  }

  if (!currentUserId || !token) {
    showToast("Không tìm thấy thông tin đăng nhập!", "error");
    loadingData.value = false;
    return;
  }

  try {
    const res = await axios.get(`http://localhost:8080/api/nhan-vien/${currentUserId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = res.data;
    
    // Xử lý Role thông minh
    let determinedRole = "Nhân viên";
    const possibleAdminStrings = [data.vaiTro, data.role, data.hoTen, data.tenNhanVien];
    for (const str of possibleAdminStrings) {
      if (str && typeof str === 'string') {
        const lowerStr = str.toLowerCase();
        if (lowerStr.includes('admin') || lowerStr.includes('quản trị')) {
          determinedRole = "Quản trị hệ thống";
          break;
        } else if (lowerStr.includes('nhân viên') || lowerStr.includes('staff')) {
           determinedRole = data.vaiTro || "Nhân viên";
        }
      }
    }

    userInfo.value = {
      id: data.id,
      maNv: data.maNv,
      fullName: data.tenNhanVien || data.hoTen,
      email: data.email,
      phone: data.soDienThoai || data.sdt,
      gender: data.gioiTinh,
      dob: data.ngaySinh,
      avatar: data.avatar, 
      role: determinedRole,
      status: data.trangThai,
      ngayVaoLam: data.ngayVaoLam,
      address: data.diaChi || data.diaChiCuThe, 
      cccd: data.cccd
    };

  } catch (error) {
    console.error("Lỗi tải thông tin:", error);
    showToast("Không thể tải thông tin cá nhân!", "error");
  } finally {
    loadingData.value = false;
  }
});

// --- CHỨC NĂNG THAY ĐỔI AVATAR ---
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

  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatarFile", file);

    // Sử dụng Fetch thay vì Axios để chống lỗi 401 khi up ảnh
    const response = await fetch(`http://localhost:8080/api/nhan-vien/${userInfo.value.id}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Tuyệt đối không thêm Content-Type ở đây
      },
      body: formData
    });

    if (!response.ok) throw new Error("Lỗi upload từ server");

    const responseData = await response.json();
    if (responseData && responseData.avatar) {
      userInfo.value.avatar = responseData.avatar;
    }

    showToast("Cập nhật ảnh đại diện thành công!", "success");

    setTimeout(() => {
      window.location.reload();
    }, 1500);

  } catch (error) {
    console.error("Lỗi Upload:", error);
    userInfo.value.avatar = oldAvatar; 
    showToast("Không thể lưu ảnh đại diện. Vui lòng thử lại!", "error");
  } finally {
    isUploadingAvatar.value = false;
    event.target.value = ''; 
  }
};

// --- CHỨC NĂNG GỬI OTP ---
const sendOtpToEmail = async () => {
  if (!userInfo.value.email) {
    showToast("Không tìm thấy email của tài khoản này!", "error");
    return;
  }
  isSendingOtp.value = true;
  try {
    await authService.forgotPassword(userInfo.value.email, 'staff');
    showToast("Mã OTP đã được gửi đến email của bạn!", "success");
    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) clearInterval(timer);
    }, 1000);
  } catch (error) {
    showToast("Lỗi khi gửi email. Vui lòng thử lại!", "error");
  } finally {
    isSendingOtp.value = false;
  }
};

// --- CHỨC NĂNG ĐỔI MẬT KHẨU ---
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
      'staff' 
    );
    showToast("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", "success");
    passForm.value = { newPassword: '', confirmPassword: '', otp: '' };
    setTimeout(() => {
      authService.logout();
      router.push('/login'); // Sửa lại thành router của trang đăng nhập nếu cần
    }, 2000);
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.response?.data || "Mã OTP không chính xác hoặc đã hết hạn!";
    showToast(errorMsg, "error");
    errors.value.otp = "Mã OTP không hợp lệ";
  } finally {
    isSubmitting.value = false;
  }
};

const goToEdit = () => {
  router.push(`/admin/employee/edit/${currentUserId}`);
};

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => (toast.value.show = false), 3000);
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
.btn-back { border: none; background: none; color: #666; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px; font-size: 14px; padding: 0;}
.btn-back:hover { color: var(--primary-brown); }

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

/* Thay thẻ div thành thẻ label để click được */
.avatar-circle {
  width: 120px; height: 120px; border: 3px solid #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff; margin-bottom: 15px; position: relative; cursor: pointer; transition: 0.3s;
}
.avatar-circle:hover:not(.is-uploading) {
  box-shadow: 0 5px 20px rgba(99, 57, 31, 0.3);
  border-color: var(--primary-brown);
}
.avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
.placeholder-text { color: #ccc; }
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

/* CSS cho Nhãn Vai Trò & Trạng thái */
.badge-role { 
  background: #fdf3ea; color: #b45309; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; 
}
.badge-admin { background: #fee2e2 !important; color: #dc2626 !important; }

.status-badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.status-active { background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.status-inactive { background-color: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

.info-list { width: 100%; display: flex; flex-direction: column; gap: 15px; margin-top: 10px; border-top: 1px dashed #ddd; padding-top: 20px;}
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-label { font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase; }
.info-value { font-size: 14px; color: #333; font-weight: 500; word-break: break-all; }

/* =========================================
   RIGHT PANEL 
   ========================================= */
.right-panel { flex: 1; }

.custom-tabs { display: flex; gap: 10px; margin-bottom: 25px; border-bottom: 2px solid #eee; }
.tab-btn { background: none; border: none; font-size: 15px; font-weight: 600; color: #888; padding: 10px 20px; cursor: pointer; position: relative; transition: 0.3s; }
.tab-btn::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0%; height: 2px; background: var(--primary-brown); transition: 0.3s; }
.tab-btn:hover { color: var(--primary-brown); }
.tab-btn.active { color: var(--primary-brown); }
.tab-btn.active::after { width: 100%; }

.right-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.panel-heading { font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0; }

.btn-edit-link {
  background: none; border: none; color: #3b82f6; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 14px;
}
.btn-edit-link:hover { text-decoration: underline; color: #2563eb; }

/* =========================================
   FORM ELEMENTS
   ========================================= */
.form-grid-container { display: flex; flex-direction: column; gap: 20px; }
.row-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 8px; font-weight: 600; font-size: 13px; color: var(--primary-brown); }
.req { color: #c0392b; margin-left: 3px; }

.form-input { 
  padding: 10px 15px; height: 45px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; background: #fff; color: #333; box-sizing: border-box; width: 100%; transition: all 0.2s;
}
.form-input:focus { border-color: var(--primary-brown); box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1); }
.form-input[readonly] { background: #f9fafb; color: #6b7280; border-style: dashed; cursor: default; }
.text-area { height: auto; resize: none; line-height: 1.5; }

.red-border { border-color: #c0392b !important; background-color: #fff5f5; }
.error-msg { color: #c0392b; font-size: 12px; font-style: italic; margin-top: 6px; }

/* OTP GROUP */
.security-desc { font-size: 14px; color: #666; margin-bottom: 25px; line-height: 1.6; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #b8895d; }
.otp-input-group { display: flex; gap: 10px; }
.otp-input { flex: 1; text-align: center; letter-spacing: 5px; font-weight: 700; font-size: 16px; }
.btn-send-otp { background: #fdf8f6; border: 1px solid var(--primary-brown); color: var(--primary-brown); font-weight: 600; border-radius: 8px; padding: 0 20px; cursor: pointer; transition: 0.2s; white-space: nowrap; height: 45px;}
.btn-send-otp:hover:not(:disabled) { background: var(--primary-brown); color: #fff; }
.btn-send-otp:disabled { background: #f3f4f6; border-color: #d1d5db; color: #9ca3af; cursor: not-allowed; }

/* =========================================
   FOOTER & BUTTONS
   ========================================= */
.footer-actions { display: flex; justify-content: flex-end; }
.btn-orange { background: linear-gradient(135deg, #5a3420, #b8895d); color: #fff; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; width: 100%; }
.btn-orange:hover:not(:disabled) { background-color: #4e2c17; box-shadow: 0 4px 10px rgba(99, 57, 31, 0.25); }
.btn-orange:disabled { opacity: 0.7; cursor: not-allowed; }

/* Loading & Toast */
.loading-state { text-align: center; padding: 50px; color: #666; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-brown); border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { to { transform: rotate(360deg); } }

.toast-notification { position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 250px; padding: 12px 15px; border-radius: 6px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); font-size: 14px; font-weight: 500; background: #F0FDF4; color: #374151; }
.toast-indicator { width: 6px; height: 100%; background-color: #22C55E; position: absolute; left: 0; top: 0; border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
.toast-content { margin-left: 10px; }
.toast-notification.error { background: #FEF2F2; color: #991b1b; }
.toast-notification.error .toast-indicator { background-color: #ef4444; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s; }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }
.fade-in { animation: fadeIn 0.4s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.slide-down { animation: slideDown 0.2s ease-out; }
@keyframes slideDown { from { transform: translateY(-5px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

@media (max-width: 768px) {
  .body-layout-split { flex-direction: column; gap: 20px;}
  .left-panel { width: 100%; flex: none; }
  .row-duo { grid-template-columns: 1fr; gap: 15px; }
}
</style>