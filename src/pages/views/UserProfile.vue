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
        <span class="current">Hồ sơ của tôi</span>
      </div>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="main-card fade-in-up">
          <div class="address-header">
            <div>
              <h3 class="page-title">Hồ sơ của tôi</h3>
              <p class="page-subtitle">Quản lý thông tin cá nhân để bảo mật tài khoản</p>
            </div>
            <button v-if="!isEditing" class="btn-brand hover-scale flex-center" @click="toggleEdit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Sửa hồ sơ
            </button>
          </div>

          <div class="card-body">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Đang tải thông tin...</p>
            </div>

            <div v-else class="profile-content">
              
              <div class="profile-avatar-section">
                <div class="avatar-wrapper">
                  <img 
                    v-if="avatarPreview || currentUser?.avatar" 
                    :src="avatarPreview || getFullImageUrl(currentUser.avatar)" 
                    alt="Avatar"
                    @error="handleAvatarError"
                  >
                  <span v-else class="avatar-placeholder">{{ getUserInitial(form.tenKhachHang) }}</span>
                </div>
                <div class="avatar-actions" v-if="isEditing">
                  <label class="btn-upload">
                    <input type="file" accept="image/jpeg, image/png, image/jpg" @change="onFileChange" hidden />
                    Chọn Ảnh
                  </label>
                  <p class="upload-note">Dung lượng file tối đa 2 MB<br>Định dạng: .JPEG, .PNG</p>
                </div>
              </div>

              <form class="profile-info-section" @submit.prevent="submitUpdate">
                
                <div class="info-row">
                  <div class="info-label">Họ và tên</div>
                  <div class="info-value">
                    <input 
                      v-if="isEditing" 
                      type="text" 
                      v-model="form.tenKhachHang" 
                      class="form-input"
                      :class="{ 'input-error': errors.tenKhachHang }"
                      @input="clearError('tenKhachHang')"
                      placeholder="Nhập họ và tên"
                    />
                    <span v-else class="text-bold">{{ form.tenKhachHang || 'Chưa cập nhật' }}</span>
                    <span v-if="errors.tenKhachHang" class="error-msg">{{ errors.tenKhachHang }}</span>
                  </div>
                </div>

                <div class="info-row">
                  <div class="info-label">Email</div>
                  <div class="info-value">
                    <input 
                      type="text" 
                      v-model="form.email" 
                      class="form-input bg-disabled" 
                      disabled
                    />
                    <span class="lock-hint" v-if="isEditing">Email được dùng làm tài khoản, không thể thay đổi</span>
                  </div>
                </div>

                <div class="info-row">
                  <div class="info-label">Số điện thoại</div>
                  <div class="info-value">
                    <input 
                      v-if="isEditing" 
                      type="text" 
                      v-model="form.soDienThoai" 
                      class="form-input"
                      :class="{ 'input-error': errors.soDienThoai }"
                      @input="clearError('soDienThoai')"
                      placeholder="Nhập số điện thoại"
                    />
                    <span v-else>{{ maskPhone(form.soDienThoai) }}</span>
                    <span v-if="errors.soDienThoai" class="error-msg">{{ errors.soDienThoai }}</span>
                  </div>
                </div>

                <div class="info-row">
                  <div class="info-label">Ngày sinh</div>
                  <div class="info-value">
                    <input 
                      v-if="isEditing" 
                      type="date" 
                      v-model="form.ngaySinh" 
                      class="form-input"
                      :class="{ 'input-error': errors.ngaySinh }"
                      @change="clearError('ngaySinh')"
                    />
                    <span v-else>{{ formatDate(form.ngaySinh) }}</span>
                    <span v-if="errors.ngaySinh" class="error-msg">{{ errors.ngaySinh }}</span>
                  </div>
                </div>

                <div class="info-row">
                  <div class="info-label">Giới tính</div>
                  <div class="info-value">
                    <div v-if="isEditing" class="radio-group">
                      <label class="radio-label">
                        <input type="radio" v-model="form.gioiTinh" :value="true" name="gender">
                        <span class="radio-custom"></span> Nam
                      </label>
                      <label class="radio-label">
                        <input type="radio" v-model="form.gioiTinh" :value="false" name="gender">
                        <span class="radio-custom"></span> Nữ
                      </label>
                    </div>
                    <span v-else>{{ form.gioiTinh === true ? 'Nam' : (form.gioiTinh === false ? 'Nữ' : 'Chưa cập nhật') }}</span>
                  </div>
                </div>

                <div class="info-row" v-if="!isEditing && defaultAddress">
                  <div class="info-label">Địa chỉ mặc định</div>
                  <div class="info-value address-box">
                    <svg class="icon-location" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>{{ formatAddress(defaultAddress) }}</span>
                  </div>
                </div>

                <div class="form-actions" v-if="isEditing">
                  <button type="button" class="btn-cancel" @click="cancelEdit">Hủy</button>
                  <button type="submit" class="btn-brand" :disabled="isSubmitting">
                    <i v-if="isSubmitting" class="fa fa-spinner fa-spin mr-2"></i> Lưu Thay Đổi
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer></Footer>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import ClientSidebar from "../../pages/views/ClientSidebar.vue";

const currentUser = ref(null);
const loading = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);

const selectedFile = ref(null);
const avatarPreview = ref(null);

const errors = ref({});
const toast = ref({ show: false, message: "", type: "success" });

const form = reactive({
  tenKhachHang: "",
  email: "",
  soDienThoai: "",
  ngaySinh: "",
  gioiTinh: null,
});

// --- HELPER DỮ LIỆU ---
const getUserInitial = (name) => {
  if (!name) return "U";
  const words = String(name).trim().split(" ");
  return words[words.length - 1].charAt(0).toUpperCase();
};

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `http://localhost:8080/images/${imagePath}`;
};

const handleAvatarError = (e) => {
  e.target.style.display = "none";
};

const maskPhone = (phone) => {
  if (!phone) return "Chưa cập nhật";
  if (phone.length < 8) return phone;
  return "******" + phone.substring(phone.length - 4);
};

const formatDate = (dateString) => {
  if (!dateString) return "Chưa cập nhật";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

const formatAddress = (addr) => {
  if (!addr) return "";
  return `${addr.diaChiCuThe}, ${addr.phuong}, ${addr.quan}, ${addr.thanhPho}`;
};

const defaultAddress = computed(() => {
  if (!currentUser.value || !currentUser.value.listDiaChi) return null;
  return (
    currentUser.value.listDiaChi.find((d) => d.macDinh) ||
    currentUser.value.listDiaChi[0]
  );
});

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => (toast.value.show = false), 3000);
};

const clearError = (field) => {
  if (errors.value[field]) delete errors.value[field];
};

// --- LOGIC API ---
const fetchUserProfile = async () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;

  const localUser = JSON.parse(userStr);
  const token = localUser?.accessToken || localUser?.token || localStorage.getItem("token");
  const userId = localUser.id;

  if (!userId || !token) {
    showToast("Vui lòng đăng nhập lại!", "warning");
    return;
  }

  loading.value = true;
  try {
    const res = await axios.get(
      `http://localhost:8080/api/khach-hang/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    currentUser.value = res.data;
    
    // Đổ dữ liệu vào Form
    syncForm(res.data);

    // Cập nhật lại localStorage để đồng bộ Header
    const updatedLocalUser = {
      ...localUser,
      tenKhachHang: res.data.tenKhachHang,
      avatar: res.data.avatar,
      email: res.data.email,
    };
    localStorage.setItem("user", JSON.stringify(updatedLocalUser));
    window.dispatchEvent(new Event("userUpdated")); 
  } catch (error) {
    console.error("Lỗi tải thông tin profile:", error);
    showToast("Không thể tải thông tin", "error");
  } finally {
    loading.value = false;
  }
};

const syncForm = (data) => {
  form.tenKhachHang = data.tenKhachHang || "";
  form.email = data.email || "";
  form.soDienThoai = data.soDienThoai || "";
  form.ngaySinh = data.ngaySinh || "";
  form.gioiTinh = data.gioiTinh;
};

const toggleEdit = () => {
  isEditing.value = true;
  syncForm(currentUser.value); 
  errors.value = {};
  selectedFile.value = null;
  avatarPreview.value = null;
};

const cancelEdit = () => {
  isEditing.value = false;
  syncForm(currentUser.value); 
  errors.value = {};
  selectedFile.value = null;
  avatarPreview.value = null;
};

// Xử lý chọn ảnh
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    showToast('Chỉ chấp nhận file JPEG, PNG, JPG', 'warning');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast('Dung lượng ảnh tối đa 2MB', 'warning');
    return;
  }

  selectedFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
};

// Validate nâng cao
const validateForm = () => {
  errors.value = {};
  let isValid = true;
  
  // Validate Họ Tên
  if (!form.tenKhachHang || !form.tenKhachHang.trim()) {
    errors.value.tenKhachHang = "Họ tên không được để trống";
    isValid = false;
  } else if (form.tenKhachHang.trim().length < 2) {
    errors.value.tenKhachHang = "Họ tên quá ngắn";
    isValid = false;
  }
  
  // Validate SĐT
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  if (!form.soDienThoai || !form.soDienThoai.trim()) {
    errors.value.soDienThoai = "Số điện thoại không được để trống";
    isValid = false;
  } else if (!phoneRegex.test(form.soDienThoai.trim())) {
    errors.value.soDienThoai = "Số điện thoại không hợp lệ (VD: 0912345678)";
    isValid = false;
  }

  // Validate Ngày Sinh
  if (!form.ngaySinh) {
    errors.value.ngaySinh = "Vui lòng chọn ngày sinh";
    isValid = false;
  } else {
    const selectedDate = new Date(form.ngaySinh);
    const today = new Date();
    // Bỏ thời gian để so sánh chính xác theo ngày
    today.setHours(0, 0, 0, 0);
    if (selectedDate >= today) {
      errors.value.ngaySinh = "Ngày sinh phải nhỏ hơn ngày hiện tại";
      isValid = false;
    }
  }

  return isValid;
};
// 👉 THAY THẾ TOÀN BỘ HÀM submitUpdate BẰNG ĐOẠN NÀY
const submitUpdate = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  const userStr = localStorage.getItem("user");
  const localUser = JSON.parse(userStr);
  const token = localUser?.accessToken || localUser?.token || localStorage.getItem("token");

  if (!token) {
    showToast("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", "warning");
    isEditing.value = false;
    return;
  }

  try {
    // 1. Tạo FormData để gói cả thông tin chữ và file ảnh
    const formData = new FormData();
    
    // Gộp thông tin sửa vào data cũ
    const payloadInfo = {
      ...currentUser.value,
      tenKhachHang: form.tenKhachHang.trim(),
      soDienThoai: form.soDienThoai.trim(),
      ngaySinh: form.ngaySinh,
      gioiTinh: form.gioiTinh
    };

    // Đính kèm cục JSON (chữ) vào FormData
    formData.append("data", new Blob([JSON.stringify(payloadInfo)], { type: "application/json" }));

    // 2. Đính kèm File ảnh (nếu người dùng có chọn ảnh mới)
    if (selectedFile.value) {
      formData.append("file", selectedFile.value);
    }

    // 3. Gửi gọi 1 API PUT duy nhất lên Backend
    await axios.put(`http://localhost:8080/api/khach-hang/${currentUser.value.id}`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data" 
      }
    });

    showToast("Cập nhật hồ sơ và ảnh thành công!", "success");
    isEditing.value = false;
    
    // Gọi lại để load ảnh mới lên giao diện
    await fetchUserProfile(); 

  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    if (error.response?.status === 401) {
      showToast("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", "error");
    } else {
      const msg = error.response?.data?.message || error.response?.data || "Có lỗi xảy ra khi cập nhật!";
      showToast(typeof msg === 'string' ? msg : "Vui lòng kiểm tra lại thông tin", "error");
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchUserProfile();
});
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
  border-bottom: 1px solid #f3f4f6;
  padding: 15px 0;
  margin-bottom: 30px;
}

.breadcrumb {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-item { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  cursor: pointer; 
  transition: color 0.2s; 
}
.nav-item:hover { color: #63391F; }
.icon-home { width: 16px; height: 16px; }
.separator svg { width: 14px; height: 14px; margin-top: 2px; color: #9ca3af; }
.current { font-weight: 600; color: #111827; }

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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid #f3f4f6;
}

.fade-in-up { animation: fadeInUp 0.5s ease forwards; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 40px;
  border-bottom: 1px solid #f3f4f6;
}

.page-title { margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #111827; }
.page-subtitle { margin: 0; font-size: 15px; color: #6b7280; }

.btn-brand { 
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #63391F 0%, #8b5a33 100%); 
  color: #fff; 
  border: none; 
  padding: 0 24px; 
  height: 44px;
  border-radius: 10px; 
  font-size: 14px;
  font-weight: 600; 
  cursor: pointer; 
  transition: all 0.3s; 
}
.btn-brand:hover:not(:disabled) { 
  box-shadow: 0 6px 15px rgba(99, 57, 31, 0.25); 
  transform: translateY(-2px);
}
.btn-brand:disabled { background: #9ca3af; cursor: not-allowed; }
.icon-edit { width: 16px; height: 16px; }

/* ================== CARD BODY & CHIA CỘT ================== */
.card-body { padding: 40px; }

.profile-content {
  display: flex;
  gap: 50px;
}

/* --- Cột Trái: Avatar --- */
.profile-avatar-section {
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #f3f4f6;
  padding-right: 30px;
}

.avatar-wrapper {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  background: #fdf3eb;
  border: 4px solid #fff;
  box-shadow: 0 8px 20px rgba(99, 57, 31, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { font-size: 48px; font-weight: 700; color: #63391F; }

.avatar-actions { text-align: center; }

.btn-upload {
  display: inline-block;
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.btn-upload:hover { background: #f9fafb; border-color: #63391F; color: #63391F;}
.upload-note { font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 0; }

/* --- Cột Phải: Thông tin --- */
.profile-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-row { display: flex; align-items: flex-start; }
.info-label { width: 160px; font-size: 15px; color: #4b5563; font-weight: 600; flex-shrink: 0; padding-top: 12px; }
.info-value { flex: 1; font-size: 15px; color: #111827; display: flex; flex-direction: column; justify-content: center; min-height: 44px;}

.text-bold { font-weight: 700; font-size: 16px; }

/* Các Input Form */
.form-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 15px;
  color: #111827;
  transition: all 0.2s;
  background: #fff;
}
.form-input:focus { outline: none; border-color: #63391F; box-shadow: 0 0 0 4px rgba(99, 57, 31, 0.1); }
.bg-disabled { background-color: #f3f4f6; cursor: not-allowed; color: #6b7280; font-weight: 500;}
.lock-hint { font-size: 13px; color: #9ca3af; margin-top: 6px; font-style: italic;}
.input-error { border-color: #ef4444 !important; background-color: #fef2f2; }
.error-msg { color: #ef4444; font-size: 13px; font-weight: 500; margin-top: 6px; }

/* Radio Button Custom */
.radio-group { display: flex; gap: 24px; align-items: center; height: 44px;}
.radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 15px; font-weight: 500;}
.radio-label input { display: none; }
.radio-custom { width: 20px; height: 20px; border: 2px solid #d1d5db; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s;}
.radio-label input:checked + .radio-custom { border-color: #63391F; }
.radio-label input:checked + .radio-custom::after { content: ''; width: 10px; height: 10px; background: #63391F; border-radius: 50%; }

.address-box {
  flex-direction: row;
  background: #f9fafb;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  line-height: 1.5;
  align-items: flex-start;
  max-width: 400px;
}
.icon-location { width: 18px; height: 18px; color: #63391F; margin-top: 2px; flex-shrink: 0; }

.form-actions { display: flex; gap: 16px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f3f4f6;}
.btn-cancel { padding: 0 24px; height: 44px; border: 1px solid transparent; background: #f3f4f6; color: #4b5563; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: 0.2s; }
.btn-cancel:hover { background: #e5e7eb; color: #111827;}

/* ================== TRẠNG THÁI LOADING ================== */
.loading-state { text-align: center; padding: 80px 0; color: #6b7280; }
.spinner { border: 3px solid #f3f4f6; border-top: 3px solid #63391F; border-radius: 50%; width: 36px; height: 36px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* ================= TOAST MỚI ================= */
.toast-notification {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 10001;
  min-width: 300px;
  padding: 16px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.toast-notification.success { background: #d4edda; color: #155724; border-left: 4px solid #28a745; }
.toast-notification.error { background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
.toast-notification.warning { background: #ffc107; color: #333; border-left: 4px solid #ff9800; }
.toast-content { font-weight: 600; color: inherit; font-size: 15px; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }

/* ================== RESPONSIVE ================== */
@media (max-width: 900px) {
  .profile-content { flex-direction: column; align-items: center; gap: 30px; }
  .profile-avatar-section { width: 100%; border-right: none; border-bottom: 1px dashed #e5e7eb; padding-right: 0; padding-bottom: 30px; }
  .info-row { flex-direction: column; gap: 4px; }
  .info-label { width: 100%; padding-top: 0;}
  .form-input { max-width: 100%; }
  .address-box { max-width: 100%; }
}
@media (max-width: 768px) {
  .main-layout { flex-direction: column; }
  .address-header { flex-direction: column; align-items: flex-start; gap: 15px; padding: 24px;}
  .card-body { padding: 24px; }
  .btn-brand, .btn-cancel { width: 100%; justify-content: center;}
  .form-actions { flex-direction: column; }
}
</style>