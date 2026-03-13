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
          
          <div class="card-header-custom">
            
            <div class="header-left">
              <div class="avatar-section">
                <div class="avatar-wrapper" :class="{ 'is-editing': isEditing }">
                  <img 
                    v-if="avatarPreview || currentUser?.avatar" 
                    :src="avatarPreview ? avatarPreview : getFullImageUrl(currentUser?.avatar)" 
                    alt="Avatar"
                    @error="handleAvatarError"
                    class="avatar-img"
                  >
                  <span v-else class="avatar-placeholder">{{ getUserInitial(form.tenKhachHang) }}</span>
                  
                  <label v-if="isEditing" class="avatar-edit-overlay">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    <span>Thay đổi</span>
                    <input type="file" accept="image/jpeg, image/png, image/jpg" @change="onFileChange" hidden />
                  </label>
                </div>
              </div>

              <div class="header-text">
                <h3 class="page-title">Hồ sơ của tôi</h3>
                <p class="page-subtitle">Quản lý thông tin cá nhân để bảo mật tài khoản</p>
                <p v-if="isEditing" class="upload-note">Hỗ trợ JPG, PNG (Tối đa 2MB)</p>
              </div>
            </div>

            <div class="header-right">
              <button v-if="!isEditing" class="btn-brand hover-scale" @click="toggleEdit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Chỉnh sửa hồ sơ
              </button>
            </div>

          </div>

          <div class="card-body">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Đang tải thông tin...</p>
            </div>

            <div v-else class="profile-content">
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
                    <span v-else class="text-display text-bold">{{ form.tenKhachHang || 'Chưa cập nhật' }}</span>
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
                    <span class="lock-hint" v-if="isEditing">Email đăng nhập không thể thay đổi</span>
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
                    <span v-else class="text-display">{{ maskPhone(form.soDienThoai) }}</span>
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
                      class="form-input date-input"
                      :class="{ 'input-error': errors.ngaySinh }"
                      @change="clearError('ngaySinh')"
                    />
                    <span v-else class="text-display">{{ formatDate(form.ngaySinh) }}</span>
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
                    <span v-else class="text-display">{{ form.gioiTinh === true ? 'Nam' : (form.gioiTinh === false ? 'Nữ' : 'Chưa cập nhật') }}</span>
                  </div>
                </div>

                <div class="info-row" v-if="!isEditing && defaultAddress">
                  <div class="info-label">Địa chỉ mặc định</div>
                  <div class="info-value">
                    <div class="address-box">
                      <svg class="icon-location" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span>{{ formatAddress(defaultAddress) }}</span>
                    </div>
                  </div>
                </div>

                <div class="form-actions" v-if="isEditing">
                  <button type="button" class="btn-cancel" @click="cancelEdit">Hủy thay đổi</button>
                  <button type="submit" class="btn-save" :disabled="isSubmitting">
                    <i v-if="isSubmitting" class="fa fa-spinner fa-spin mr-2"></i> 
                    <span v-else>Lưu cập nhật</span>
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
const imageCacheBuster = ref(new Date().getTime()); 

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

// 👉 ĐÃ SỬA LỖI TRẮNG ẢNH: Xử lý thông minh mọi loại link
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "";
  
  // 1. Nếu là chuỗi Base64 (Ảnh tự up)
  if (imagePath.startsWith("data:image")) {
    return imagePath;
  }
  
  // 2. Nếu là link Google Login
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // 3. Fallback (Nếu bạn lưu file cứng vào server)
  return `http://localhost:8080/images/${imagePath}?t=${imageCacheBuster.value}`;
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

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    showToast('Chỉ chấp nhận file JPEG, PNG, JPG', 'warning');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast('Dung lượng ảnh tối đa 5MB', 'warning');
    return;
  }

  selectedFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
};

const validateForm = () => {
  errors.value = {};
  let isValid = true;
  
  if (!form.tenKhachHang || !form.tenKhachHang.trim()) {
    errors.value.tenKhachHang = "Họ tên không được để trống";
    isValid = false;
  } else if (form.tenKhachHang.trim().length < 2) {
    errors.value.tenKhachHang = "Họ tên quá ngắn";
    isValid = false;
  }
  
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  if (!form.soDienThoai || !form.soDienThoai.trim()) {
    errors.value.soDienThoai = "Số điện thoại không được để trống";
    isValid = false;
  } else if (!phoneRegex.test(form.soDienThoai.trim())) {
    errors.value.soDienThoai = "SĐT không hợp lệ (VD: 0912345678)";
    isValid = false;
  }

  if (!form.ngaySinh) {
    errors.value.ngaySinh = "Vui lòng chọn ngày sinh";
    isValid = false;
  } else {
    const selectedDate = new Date(form.ngaySinh);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate >= today) {
      errors.value.ngaySinh = "Ngày sinh phải nhỏ hơn ngày hiện tại";
      isValid = false;
    }
  }

  return isValid;
};

// GỘP CHUNG FILE VÀ JSON GỬI 1 LẦN
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
    const formData = new FormData();
    
    const payloadInfo = {
      ...currentUser.value,
      tenKhachHang: form.tenKhachHang.trim(),
      soDienThoai: form.soDienThoai.trim(),
      ngaySinh: form.ngaySinh,
      gioiTinh: form.gioiTinh
    };
    
    formData.append("data", new Blob([JSON.stringify(payloadInfo)], { type: "application/json" }));

    if (selectedFile.value) {
      formData.append("avatarFile", selectedFile.value);
    }

    await axios.put(`http://localhost:8080/api/khach-hang/${currentUser.value.id}`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data" 
      }
    });

    showToast("Cập nhật hồ sơ thành công!", "success");
    
    isEditing.value = false;
    selectedFile.value = null;
    avatarPreview.value = null;
    imageCacheBuster.value = new Date().getTime(); 
    
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

/* --- HEADER: AVATAR GÓC TRÁI + NÚT SỬA GÓC PHẢI --- */
.card-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Ép avatar và chữ nhảy lên trên cùng */
  padding: 30px 40px;
  border-bottom: 1px solid #f1f5f9;
  background-color: #fafafa; /* Làm nổi bật nhẹ phần header */
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

/* Khung Avatar nhỏ xinh */
.avatar-wrapper {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #f1f5f9;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.avatar-wrapper.is-editing {
  box-shadow: 0 6px 20px rgba(99, 57, 31, 0.15);
  border-color: #fdf8f6;
}

.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { font-size: 32px; font-weight: 800; color: #63391F; }

/* Overlay nút đổi ảnh */
.avatar-edit-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.3s ease;
}
.avatar-edit-overlay svg { width: 22px; height: 22px; margin-bottom: 2px; }
.avatar-edit-overlay span { font-size: 11px; font-weight: 600; }
.avatar-wrapper:hover .avatar-edit-overlay { opacity: 1; }

/* Text Tiêu đề kế bên Avatar */
.header-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.page-title { margin: 0 0 6px 0; font-size: 22px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px;}
.page-subtitle { margin: 0; font-size: 14px; color: #64748b; }
.upload-note { margin: 6px 0 0 0; font-size: 12px; color: #94a3b8; font-style: italic;}

.btn-brand { 
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #63391F 0%, #8b5a33 100%); 
  color: #fff; 
  border: none; 
  padding: 0 20px; 
  height: 42px;
  border-radius: 8px; 
  font-size: 14px;
  font-weight: 600; 
  cursor: pointer; 
  transition: all 0.3s; 
  margin-top: 10px; /* Đẩy nút sửa xuống xíu cho cân với Avatar */
}
.btn-brand:hover { 
  box-shadow: 0 4px 12px rgba(99, 57, 31, 0.25); 
  transform: translateY(-1px);
}
.icon-edit { width: 16px; height: 16px; }

/* ================== BODY FORM THÔNG TIN TRẢI RỘNG ================== */
.card-body { padding: 40px; }

.profile-info-section {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.info-row { 
  display: grid; 
  grid-template-columns: 200px 1fr; /* Tăng độ rộng nhãn lên một chút để cân đối form */
  align-items: center; 
  min-height: 60px;
  padding: 12px 0;
  border-bottom: 1px dashed #f1f5f9;
}
.info-row:last-of-type { border-bottom: none; }

.info-label { font-size: 15px; color: #64748b; font-weight: 600; flex-shrink: 0;}
.info-value { flex: 1; font-size: 15px; color: #1e293b; display: flex; flex-direction: column; justify-content: center;}

.text-display { padding: 8px 0; display: inline-block; color: #334155; }
.text-bold { font-weight: 700; font-size: 16px; color: #0f172a;}

/* Các Input Form (Chiều dài lớn để trải đều form) */
.form-input {
  width: 100%;
  max-width: 600px; /* Đã tăng chiều dài Input để hài hòa với form rộng */
  height: 44px;
  padding: 0 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 15px;
  color: #1e293b;
  transition: all 0.2s;
  background: #fff;
  box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: #63391F; box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1); }
.date-input { font-family: 'Inter', sans-serif; color: #475569; }

.bg-disabled { background-color: #f8fafc; cursor: not-allowed; color: #94a3b8; border-color: #e2e8f0;}
.lock-hint { font-size: 13px; color: #94a3b8; margin-top: 6px; font-style: italic;}
.input-error { border-color: #ef4444 !important; background-color: #fef2f2; }
.error-msg { color: #ef4444; font-size: 13px; font-weight: 500; margin-top: 6px; }

/* Radio Button Custom */
.radio-group { display: flex; gap: 30px; align-items: center; height: 44px;}
.radio-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 15px; font-weight: 500; color: #334155;}
.radio-label input { display: none; }
.radio-custom { width: 22px; height: 22px; border: 2px solid #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s;}
.radio-label input:checked + .radio-custom { border-color: #63391F; }
.radio-label input:checked + .radio-custom::after { content: ''; width: 12px; height: 12px; background: #63391F; border-radius: 50%; }

.address-box {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  padding: 12px 18px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  line-height: 1.5;
  max-width: 600px;
  color: #475569;
  font-weight: 500;
  font-size: 14px;
}
.icon-location { width: 20px; height: 20px; color: #63391F; flex-shrink: 0; }

.form-actions { 
  display: flex; 
  justify-content: flex-start; /* Đẩy sát lề form */
  padding-left: 200px; /* Thụt vào bằng với nhãn info-label */
  gap: 16px; 
  margin-top: 30px; 
  padding-top: 30px; 
  border-top: 1px solid #f1f5f9;
}
.btn-cancel { 
  padding: 0 24px; height: 46px; 
  border: 1px solid transparent; background: #f1f5f9; color: #475569; 
  border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; transition: 0.2s; 
}
.btn-cancel:hover { background: #e2e8f0; color: #0f172a;}

.btn-save { 
  padding: 0 32px; height: 46px; 
  border: none; background: #63391F; color: #fff; 
  border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; transition: 0.2s; 
}
.btn-save:hover:not(:disabled) { background: #4e2c17; box-shadow: 0 4px 12px rgba(99, 57, 31, 0.2); }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

/* ================== TRẠNG THÁI LOADING ================== */
.loading-state { text-align: center; padding: 80px 0; color: #64748b; }
.spinner { border: 3px solid #f1f5f9; border-top: 3px solid #63391F; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* ================= TOAST MỚI ================= */
.toast-notification {
  position: fixed; top: 30px; right: 30px; z-index: 10001; min-width: 300px; padding: 16px 24px; border-radius: 8px; display: flex; align-items: center; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;
}
.toast-notification.success { background: #d4edda; color: #155724; border-left: 4px solid #28a745; }
.toast-notification.error { background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
.toast-notification.warning { background: #ffc107; color: #333; border-left: 4px solid #ff9800; }
.toast-content { font-weight: 600; color: inherit; font-size: 15px; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }

/* ================== RESPONSIVE ================== */
@media (max-width: 992px) {
  .info-row { grid-template-columns: 150px 1fr; }
  .form-actions { padding-left: 150px; }
}
@media (max-width: 768px) {
  .main-layout { flex-direction: column; }
  .card-header-custom { flex-direction: column; align-items: center; gap: 20px; padding: 24px;}
  .header-left { flex-direction: column; text-align: center; width: 100%;}
  .card-body { padding: 24px; }
  .info-row { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 16px 0; min-height: auto;}
  .form-input, .address-box { max-width: 100%; }
  .form-actions { padding-left: 0; flex-direction: column; }
  .btn-brand, .btn-cancel, .btn-save { width: 100%; justify-content: center; margin-top: 0;}
}
</style>