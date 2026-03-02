<template>
  <div class="profile-page">
    <div class="main-card form-page-animation">
      <div class="header-simple">
        <button
          class="btn-back hover-effect"
          @click="$router.push('/')"
        >
          <i class="fa fa-arrow-left"></i> Quay lại trang chủ
        </button>
        <h2 class="page-title" style="margin-top: 15px;">Tài khoản của tôi</h2>
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

              <h3 class="user-name">{{ userInfo.tenKhachHang || 'Khách hàng' }}</h3>
              <span class="user-role badge-role">Khách hàng</span>
            </div>
          </div>
          
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ userInfo.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">SĐT:</span>
              <span class="info-value">{{ userInfo.soDienThoai }}</span>
            </div>
            </div>
        </div>

        <div class="right-panel">
          <div class="custom-tabs">
            <button class="tab-btn hover-effect" :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">
              Hồ sơ cá nhân
            </button>
            <button class="tab-btn hover-effect" :class="{ active: activeTab === 'address' }" @click="activeTab = 'address'">
              Sổ địa chỉ
            </button>
            <button class="tab-btn hover-effect" :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'">
              Đổi mật khẩu
            </button>
          </div>

          <div v-if="activeTab === 'info'" class="tab-content fade-in">
            <div class="right-header-row">
              <h3 class="panel-heading">Chi tiết thông tin</h3>
            </div>
            
            <div class="form-grid-container">
              <div class="row-duo">
                <div class="form-group">
                  <label>Họ và tên <span class="req">*</span></label>
                  <input type="text" v-model="editInfo.tenKhachHang" class="form-input" :class="{'red-border': errors.tenKhachHang}" @input="clearError('tenKhachHang')" />
                  <span v-if="errors.tenKhachHang" class="error-msg slide-down">{{ errors.tenKhachHang }}</span>
                </div>
                <div class="form-group">
                  <label>Giới tính</label>
                   <select v-model="editInfo.gioiTinh" class="form-input custom-select">
                    <option :value="true">Nam</option>
                    <option :value="false">Nữ</option>
                    <option :value="null">Khác</option>
                  </select>
                </div>
              </div>
              
              <div class="row-duo">
                <div class="form-group">
                  <label>Email</label>
                  <input type="text" :value="userInfo.email" class="form-input" readonly title="Không thể thay đổi Email" />
                </div>
                <div class="form-group">
                  <label>Số điện thoại <span class="req">*</span></label>
                  <input type="text" v-model="editInfo.soDienThoai" class="form-input" :class="{'red-border': errors.soDienThoai}" @input="clearError('soDienThoai')" />
                  <span v-if="errors.soDienThoai" class="error-msg slide-down">{{ errors.soDienThoai }}</span>
                </div>
              </div>
              
              <div class="form-group">
                <label>Ngày sinh <span class="req">*</span></label>
                <input type="date" v-model="editInfo.ngaySinh" class="form-input" :class="{'red-border': errors.ngaySinh}" @change="clearError('ngaySinh')" />
                <span v-if="errors.ngaySinh" class="error-msg slide-down">{{ errors.ngaySinh }}</span>
              </div>
              
              <div class="footer-actions" style="margin-top: 15px;">
                <button class="btn-orange hover-effect" @click="updateProfile" :disabled="isSubmittingProfile">
                  <span v-if="isSubmittingProfile"><i class="fa fa-spinner fa-spin"></i> Đang lưu...</span>
                  <span v-else>Cập nhật hồ sơ</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'address'" class="tab-content fade-in">
            <div class="right-header-row">
              <h3 class="panel-heading">Danh sách địa chỉ nhận hàng</h3>
              <button class="btn-add-address-dashed" @click="showAddressForm = true" v-if="!showAddressForm">
                <i class="fa fa-plus"></i> Thêm địa chỉ mới
              </button>
            </div>

            <transition name="slide-down">
              <div v-if="showAddressForm" class="address-form-box">
                <h4>Thêm địa chỉ mới</h4>
                
                <div class="form-grid-container">
                  <div class="row-duo">
                    <div class="form-group">
                      <label>Tỉnh/Thành phố <span class="req">*</span></label>
                      <select v-model="newAddress.provinceId" @change="onProvinceChange" class="form-input custom-select" :class="{'red-border': errors.addrProvince}">
                        <option :value="null">Chọn Tỉnh/Thành phố</option>
                        <option v-for="p in listProvinces" :key="p.code" :value="p.code">{{ p.name }}</option>
                      </select>
                      <span v-if="errors.addrProvince" class="error-msg slide-down">{{ errors.addrProvince }}</span>
                    </div>
                    
                    <div class="form-group">
                      <label>Quận/Huyện <span class="req">*</span></label>
                      <select v-model="newAddress.districtId" @change="onDistrictChange" class="form-input custom-select" :disabled="!newAddress.provinceId" :class="{'red-border': errors.addrDistrict}">
                        <option :value="null">Chọn Quận/Huyện</option>
                        <option v-for="d in newAddress.districtOptions" :key="d.code" :value="d.code">{{ d.name }}</option>
                      </select>
                      <span v-if="errors.addrDistrict" class="error-msg slide-down">{{ errors.addrDistrict }}</span>
                    </div>
                  </div>

                  <div class="row-duo">
                    <div class="form-group">
                      <label>Phường/Xã <span class="req">*</span></label>
                      <select v-model="newAddress.wardCode" @change="onWardChange" class="form-input custom-select" :disabled="!newAddress.districtId" :class="{'red-border': errors.addrWard}">
                        <option :value="null">Chọn Phường/Xã</option>
                        <option v-for="w in newAddress.wardOptions" :key="w.code" :value="w.code">{{ w.name }}</option>
                      </select>
                      <span v-if="errors.addrWard" class="error-msg slide-down">{{ errors.addrWard }}</span>
                    </div>
                    
                    <div class="form-group">
                      <label>Địa chỉ cụ thể (Số nhà, đường) <span class="req">*</span></label>
                      <input type="text" v-model="newAddress.diaChiCuThe" class="form-input" placeholder="Nhập địa chỉ chi tiết" :class="{'red-border': errors.addrDetail}" @input="clearError('addrDetail')" />
                      <span v-if="errors.addrDetail" class="error-msg slide-down">{{ errors.addrDetail }}</span>
                    </div>
                  </div>
                </div>

                <div class="address-form-actions">
                  <button class="btn-cancel-clean" @click="cancelAddAddress">Hủy</button>
                  <button class="btn-orange" @click="saveNewAddress" :disabled="isSavingAddress" style="padding: 10px 20px;">
                     <span v-if="isSavingAddress"><i class="fa fa-spinner fa-spin"></i> Đang lưu...</span>
                     <span v-else>Lưu địa chỉ</span>
                  </button>
                </div>
              </div>
            </transition>

            <div v-if="userInfo.listDiaChi.length === 0 && !showAddressForm" class="empty-state">
              <i class="fa fa-map-marker-alt fa-3x empty-icon"></i>
              <p>Bạn chưa có địa chỉ nhận hàng nào.</p>
            </div>

            <div v-else class="address-list">
              <div v-for="(addr, index) in userInfo.listDiaChi" :key="index" class="address-card" :class="{'is-default': addr.macDinh}">
                <div class="address-card-header">
                  <span class="addr-title">Địa chỉ {{ index + 1 }}</span>
                  <div class="addr-actions">
                    <span v-if="addr.macDinh" class="default-badge">✓ Mặc định</span>
                    <button v-else class="btn-set-default" @click="setAsDefault(addr.id)">Đặt làm mặc định</button>
                  </div>
                </div>
                <div class="address-card-body">
                  <div class="addr-row">
                    <i class="fa fa-user"></i> <strong>{{ userInfo.tenKhachHang }}</strong> | {{ userInfo.soDienThoai }}
                  </div>
                  <div class="addr-row">
                    <i class="fa fa-map-marker-alt"></i> 
                    <span>
                      {{ addr.diaChiCuThe || addr.detail }}<span v-if="addr.phuong || addr.wardName">, {{ addr.phuong || addr.wardName }}</span><span v-if="addr.quan || addr.districtName">, {{ addr.quan || addr.districtName }}</span><span v-if="addr.thanhPho || addr.provinceName">, {{ addr.thanhPho || addr.provinceName }}</span>
                    </span>
                  </div>
                </div>
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
                <input type="password" v-model="passForm.newPassword" class="form-input" placeholder="Nhập mật khẩu mới" :class="{'red-border': errors.newPassword}" @input="clearError('newPassword')" />
                <span v-if="errors.newPassword" class="error-msg slide-down">{{ errors.newPassword }}</span>
              </div>

              <div class="form-group">
                <label>Xác nhận mật khẩu mới <span class="req">*</span></label>
                <input type="password" v-model="passForm.confirmPassword" class="form-input" placeholder="Nhập lại mật khẩu mới" :class="{'red-border': errors.confirmPassword}" @input="clearError('confirmPassword')" />
                <span v-if="errors.confirmPassword" class="error-msg slide-down">{{ errors.confirmPassword }}</span>
              </div>

              <div class="form-group">
                <label>Mã xác nhận Email (OTP) <span class="req">*</span></label>
                <div class="otp-input-group">
                  <input type="text" v-model="passForm.otp" class="form-input otp-input" placeholder="Nhập 6 số OTP" maxlength="6" :class="{'red-border': errors.otp}" @input="clearError('otp')" />
                  <button class="btn-send-otp hover-effect" @click="sendOtpToEmail" :disabled="isSendingOtp || countdown > 0">
                    <span v-if="isSendingOtp"><i class="fa fa-spinner fa-spin"></i> Đang gửi...</span>
                    <span v-else-if="countdown > 0">Gửi lại sau {{ countdown }}s</span>
                    <span v-else>Gửi mã</span>
                  </button>
                </div>
                <span v-if="errors.otp" class="error-msg slide-down">{{ errors.otp }}</span>
              </div>

              <div class="footer-actions" style="margin-top: 20px;">
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
// Import AuthService (Điều chỉnh đường dẫn nếu cần)
import authService from '../../services/AuthService'; 

const router = useRouter();
const PROVINCE_API_URL = "https://provinces.open-api.vn/api/v1";

const loadingData = ref(true);
const toast = ref({ show: false, message: "", type: "success" });

// Các state quản lý UI
const activeTab = ref('info');
const isSendingOtp = ref(false);
const isSubmitting = ref(false);
const isSubmittingProfile = ref(false);
const isUploadingAvatar = ref(false);
const showAddressForm = ref(false);
const isSavingAddress = ref(false);
const countdown = ref(0);
let timer = null;
let currentUserId = null; 

// --- DỮ LIỆU ĐỂ HIỂN THỊ CHUNG ---
const userInfo = ref({
  id: null,
  maKhachHang: "",
  tenKhachHang: "",
  email: "",
  soDienThoai: "",
  gioiTinh: true,
  ngaySinh: "",
  avatar: null,
  listDiaChi: []
});

// --- DỮ LIỆU DÙNG CHO FORM CẬP NHẬT THÔNG TIN ---
const editInfo = ref({
  tenKhachHang: "",
  soDienThoai: "",
  gioiTinh: true,
  ngaySinh: ""
});

// --- DỮ LIỆU DÙNG CHO FORM THÊM ĐỊA CHỈ ---
const listProvinces = ref([]);
const newAddress = ref({
  provinceId: null,
  districtId: null,
  wardCode: null,
  provinceName: "",
  districtName: "",
  wardName: "",
  diaChiCuThe: "",
  districtOptions: [],
  wardOptions: []
});

const passForm = ref({
  newPassword: '',
  confirmPassword: '',
  otp: ''
});
const errors = ref({});

// Hàm che giấu email
const maskedEmail = computed(() => {
  const email = userInfo.value.email;
  if (!email) return "";
  const [name, domain] = email.split('@');
  if (name.length <= 3) return email;
  return name.substring(0, 3) + '***@' + domain;
});

// Format Date chuẩn yyyy-mm-dd cho input type="date"
const formatDate = (dateString) => {
  if (!dateString) return "";
  return dateString.split('T')[0];
};

// --- LIFECYCLE ---
onMounted(async () => {
  fetchProvinces();
  fetchCustomerData();
});

const fetchProvinces = async () => {
  try {
    const res = await axios.get(`${PROVINCE_API_URL}/p/`);
    listProvinces.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const fetchCustomerData = async () => {
  loadingData.value = true;
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      currentUserId = userData.id;
    } catch (e) {
      console.error(e);
    }
  }

  if (!currentUserId || !token) {
    showToast("Vui lòng đăng nhập lại!", "error");
    router.push('/login'); 
    return;
  }

  try {
    const res = await axios.get(`http://localhost:8080/api/khach-hang/${currentUserId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = res.data;

    userInfo.value = {
      id: data.id,
      maKhachHang: data.maKhachHang,
      tenKhachHang: data.tenKhachHang || data.hoTen,
      email: data.email,
      soDienThoai: data.soDienThoai || data.sdt,
      gioiTinh: data.gioiTinh,
      ngaySinh: formatDate(data.ngaySinh),
      avatar: data.avatarFullUrl || data.avatar, 
      listDiaChi: data.listDiaChi || []
    };

    // Đổ dữ liệu vào state Edit
    editInfo.value = {
      tenKhachHang: userInfo.value.tenKhachHang,
      soDienThoai: userInfo.value.soDienThoai,
      gioiTinh: userInfo.value.gioiTinh,
      ngaySinh: userInfo.value.ngaySinh
    };

  } catch (error) {
    console.error(error);
    showToast("Không thể tải thông tin cá nhân!", "error");
  } finally {
    loadingData.value = false;
  }
};

// --- VALIDATE & CẬP NHẬT HỒ SƠ ---
const validateProfile = () => {
  errors.value = {};
  let isValid = true;
  
  if (!editInfo.value.tenKhachHang?.trim()) {
    errors.value.tenKhachHang = "Vui lòng nhập họ và tên";
    isValid = false;
  }

  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!editInfo.value.soDienThoai) {
    errors.value.soDienThoai = "Vui lòng nhập số điện thoại";
    isValid = false;
  } else if (!phoneRegex.test(editInfo.value.soDienThoai)) {
    errors.value.soDienThoai = "Số điện thoại không hợp lệ";
    isValid = false;
  }

  if (!editInfo.value.ngaySinh) {
    errors.value.ngaySinh = "Vui lòng chọn ngày sinh";
    isValid = false;
  } else {
    const today = new Date();
    const birthDate = new Date(editInfo.value.ngaySinh);
    if (birthDate >= today) {
      errors.value.ngaySinh = "Ngày sinh không được lớn hơn hôm nay";
      isValid = false;
    }
  }

  return isValid;
};

const updateProfile = async () => {
  if (!validateProfile()) return;

  isSubmittingProfile.value = true;
  const token = localStorage.getItem("token");

  const payload = {
    tenKhachHang: editInfo.value.tenKhachHang,
    soDienThoai: editInfo.value.soDienThoai,
    gioiTinh: editInfo.value.gioiTinh,
    ngaySinh: editInfo.value.ngaySinh,
    email: userInfo.value.email, // Giữ nguyên
    trangThai: 1, 
    listDiaChi: userInfo.value.listDiaChi // Giữ nguyên list địa chỉ hiện tại
  };

  try {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    
    await axios.put(`http://localhost:8080/api/khach-hang/${currentUserId}`, formData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
    });

    showToast("Cập nhật thông tin thành công!", "success");
    await fetchCustomerData();

  } catch (error) {
    console.error(error);
    showToast(error.response?.data || "Cập nhật thất bại!", "error");
  } finally {
    isSubmittingProfile.value = false;
  }
};


// --- LOGIC API TỈNH / HUYỆN / XÃ ---
const onProvinceChange = async () => {
  clearError('addrProvince');
  newAddress.value.districtId = null;
  newAddress.value.wardCode = null;
  newAddress.value.districtOptions = [];
  newAddress.value.wardOptions = [];
  
  if (newAddress.value.provinceId) {
    newAddress.value.provinceName = listProvinces.value.find(p => String(p.code) === String(newAddress.value.provinceId))?.name || "";
    try {
      const res = await axios.get(`${PROVINCE_API_URL}/p/${newAddress.value.provinceId}?depth=2`);
      newAddress.value.districtOptions = res.data.districts;
    } catch (e) { console.error(e); }
  } else {
    newAddress.value.provinceName = "";
  }
};

const onDistrictChange = async () => {
  clearError('addrDistrict');
  newAddress.value.wardCode = null;
  newAddress.value.wardOptions = [];
  
  if (newAddress.value.districtId) {
    newAddress.value.districtName = newAddress.value.districtOptions.find(d => String(d.code) === String(newAddress.value.districtId))?.name || "";
    try {
      const res = await axios.get(`${PROVINCE_API_URL}/d/${newAddress.value.districtId}?depth=2`);
      newAddress.value.wardOptions = res.data.wards;
    } catch (e) { console.error(e); }
  } else {
    newAddress.value.districtName = "";
  }
};

const onWardChange = () => {
  clearError('addrWard');
  if (newAddress.value.wardCode) {
     newAddress.value.wardName = newAddress.value.wardOptions.find(w => String(w.code) === String(newAddress.value.wardCode))?.name || "";
  } else {
     newAddress.value.wardName = "";
  }
};

// --- VALIDATE & THÊM ĐỊA CHỈ ---
const validateAddress = () => {
  errors.value = {};
  let isValid = true;
  
  if (!newAddress.value.provinceId) { errors.value.addrProvince = "Chọn Tỉnh/TP"; isValid = false; }
  if (!newAddress.value.districtId) { errors.value.addrDistrict = "Chọn Quận/Huyện"; isValid = false; }
  if (!newAddress.value.wardCode) { errors.value.addrWard = "Chọn Phường/Xã"; isValid = false; }
  if (!newAddress.value.diaChiCuThe?.trim()) { errors.value.addrDetail = "Nhập chi tiết"; isValid = false; }

  return isValid;
}

const cancelAddAddress = () => {
  showAddressForm.value = false;
  errors.value = {};
  newAddress.value = { provinceId: null, districtId: null, wardCode: null, provinceName: "", districtName: "", wardName: "", diaChiCuThe: "", districtOptions: [], wardOptions: [] };
};

const saveNewAddress = async () => {
  if (!validateAddress()) return;

  isSavingAddress.value = true;
  const token = localStorage.getItem("token");

  // Nếu list đang trống, tự động set địa chỉ này làm mặc định
  const isDefault = userInfo.value.listDiaChi.length === 0;

  const addressObj = {
    thanhPho: newAddress.value.provinceName,
    quan: newAddress.value.districtName,
    phuong: newAddress.value.wardName,
    diaChiCuThe: newAddress.value.diaChiCuThe,
    macDinh: isDefault
  };

  const payload = {
    tenKhachHang: userInfo.value.tenKhachHang,
    soDienThoai: userInfo.value.soDienThoai,
    gioiTinh: userInfo.value.gioiTinh,
    ngaySinh: userInfo.value.ngaySinh,
    email: userInfo.value.email,
    trangThai: 1,
    listDiaChi: [...userInfo.value.listDiaChi, addressObj] 
  };

  try {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    
    await axios.put(`http://localhost:8080/api/khach-hang/${currentUserId}`, formData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
    });

    showToast("Đã thêm địa chỉ thành công!", "success");
    cancelAddAddress();
    await fetchCustomerData();
  } catch (error) {
    showToast("Không thể lưu địa chỉ!", "error");
  } finally {
    isSavingAddress.value = false;
  }
};

// --- ĐẶT ĐỊA CHỈ MẶC ĐỊNH ---
const setAsDefault = async (diaChiId) => {
  if(!diaChiId) return;
  const token = localStorage.getItem("token");

  try {
    await axios.put(`http://localhost:8080/api/khach-hang/${currentUserId}/dia-chi/${diaChiId}/mac-dinh`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    showToast("Đã thay đổi địa chỉ mặc định!", "success");
    await fetchCustomerData(); 
  } catch(error) {
    console.error("Lỗi set default:", error);
    showToast("Chưa thể đặt làm mặc định!", "error");
  }
};


// --- UPLOAD AVATAR ---
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

    const response = await fetch(`http://localhost:8080/api/khach-hang/${userInfo.value.id}/avatar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) throw new Error("Lỗi upload từ server");

    const responseData = await response.json();
    if (responseData && responseData.avatar) {
      userInfo.value.avatar = responseData.avatar;
    }

    showToast("Cập nhật ảnh đại diện thành công!", "success");

    setTimeout(() => { window.location.reload(); }, 1500);

  } catch (error) {
    console.error(error);
    userInfo.value.avatar = oldAvatar; 
    showToast("Không thể lưu ảnh đại diện. Vui lòng thử lại!", "error");
  } finally {
    isUploadingAvatar.value = false;
    event.target.value = ''; 
  }
};

// --- ĐỔI MẬT KHẨU & OTP ---
const sendOtpToEmail = async () => {
  if (!userInfo.value.email) return;
  isSendingOtp.value = true;
  try {
    await authService.forgotPassword(userInfo.value.email, 'customer');
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

const validatePasswordForm = () => {
  errors.value = {};
  let isValid = true;
  if (!passForm.value.newPassword) { errors.value.newPassword = "Vui lòng nhập mật khẩu mới"; isValid = false; } 
  else if (passForm.value.newPassword.length < 6) { errors.value.newPassword = "Mật khẩu phải từ 6 ký tự trở lên"; isValid = false; }
  
  if (passForm.value.newPassword !== passForm.value.confirmPassword) { errors.value.confirmPassword = "Mật khẩu xác nhận không khớp"; isValid = false; }
  
  if (!passForm.value.otp) { errors.value.otp = "Vui lòng nhập mã OTP"; isValid = false; } 
  else if (passForm.value.otp.length !== 6) { errors.value.otp = "Mã OTP phải gồm 6 chữ số"; isValid = false; }
  
  return isValid;
};

const clearError = (field) => {
  if (errors.value[field]) delete errors.value[field];
};

const handleChangePassword = async () => {
  if (!validatePasswordForm()) return;
  isSubmitting.value = true;
  try {
    await authService.resetPassword( userInfo.value.email, passForm.value.otp, passForm.value.newPassword, 'customer');
    showToast("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", "success");
    passForm.value = { newPassword: '', confirmPassword: '', otp: '' };
    
    setTimeout(() => {
      authService.logout();
      router.push('/login'); 
    }, 2000);
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.response?.data || "Mã OTP không hợp lệ!";
    showToast(errorMsg, "error");
    errors.value.otp = "Mã OTP không hợp lệ";
  } finally {
    isSubmitting.value = false;
  }
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
  --text-main: #484848;
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

.avatar-circle {
  width: 120px; height: 120px; border: 3px solid #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff; margin-bottom: 15px; position: relative; cursor: pointer; transition: 0.3s;
}
.avatar-circle:hover:not(.is-uploading) {
  box-shadow: 0 5px 20px rgba(99, 57, 31, 0.3); border-color: var(--primary-brown);
}
.avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
.placeholder-text { color: #ccc; }
.file-input-hidden { display: none; }

.avatar-overlay-edit { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; opacity: 0; transition: 0.3s; }
.avatar-overlay-edit span { color: #fff; font-size: 13px; font-weight: 600; }
.avatar-circle:hover .avatar-overlay-edit { opacity: 1; }

.avatar-loading { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.7); display: flex; justify-content: center; align-items: center; color: var(--primary-brown); }
.avatar-circle.is-uploading { cursor: not-allowed; opacity: 0.8; }

.user-name { font-size: 18px; font-weight: 700; color: #333; margin: 0 0 8px 0; text-align: center; }
.badge-role { background: #fdf3ea; color: #b45309; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }

.info-list { width: 100%; display: flex; flex-direction: column; gap: 15px; margin-top: 10px; border-top: 1px dashed #ddd; padding-top: 20px;}
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-label { font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase; }
.info-value { font-size: 14px; color: #333; font-weight: 500; word-break: break-all; }

/* =========================================
   RIGHT PANEL & TABS
   ========================================= */
.right-panel { flex: 1; }
.right-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.panel-heading { font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0; }

.custom-tabs { display: flex; gap: 10px; margin-bottom: 25px; border-bottom: 2px solid #eee; }
.tab-btn { background: none; border: none; font-size: 15px; font-weight: 600; color: #888; padding: 10px 20px; cursor: pointer; position: relative; transition: 0.3s; }
.tab-btn::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0%; height: 2px; background: var(--primary-brown); transition: 0.3s; }
.tab-btn:hover { color: var(--primary-brown); }
.tab-btn.active { color: var(--primary-brown); }
.tab-btn.active::after { width: 100%; }

/* =========================================
   FORM ELEMENTS
   ========================================= */
.form-grid-container { display: flex; flex-direction: column; gap: 20px; }
.row-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 8px; font-weight: 600; font-size: 13px; color: var(--primary-brown); }

.form-input { padding: 10px 15px; height: 45px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; background: #fff; color: #333; box-sizing: border-box; width: 100%; transition: all 0.2s; }
.form-input:focus { border-color: var(--primary-brown); box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1); }
.form-input[readonly] { background: #f9fafb; color: #6b7280; border-style: dashed; cursor: not-allowed; }

select.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat; background-position: right 12px top 50%; background-size: 10px auto; cursor: pointer; color: #484848;
}
select.custom-select:disabled { background-color: #f9fafb; cursor: not-allowed; border-style: dashed; color: #9ca3af; }

.req { color: #c0392b; margin-left: 3px; }
.red-border { border-color: #c0392b !important; background-color: #fff5f5; }
.error-msg { color: #c0392b; font-size: 12px; font-style: italic; margin-top: 6px; }

/* =========================================
   SỔ ĐỊA CHỈ & THÊM ĐỊA CHỈ
   ========================================= */
.btn-add-address-dashed { background: transparent; border: 1.5px dashed var(--primary-brown); color: var(--primary-brown); padding: 8px 15px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 13px; }
.btn-add-address-dashed:hover { background: var(--primary-brown); color: #fff; }

.address-form-box { background: #fcfcfc; border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
.address-form-box h4 { margin: 0 0 15px 0; color: #333; }
.address-form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-cancel-clean { padding: 10px 24px; border: 1px solid #cbd5e1; background: #fff; color: #64748b; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-cancel-clean:hover { background: #f1f5f9; color: #334155; }

.empty-state { text-align: center; padding: 40px; color: #999; background: #fafafa; border-radius: 10px; border: 1px dashed #ddd; }
.empty-icon { color: #ddd; margin-bottom: 15px; }

.address-list { display: flex; flex-direction: column; gap: 15px; }
.address-card { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; padding: 20px; transition: 0.3s; }
.address-card.is-default { border: 1px solid #b8895d; background: #fdf8f6; }

.address-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px dashed #eee; padding-bottom: 10px; }
.addr-title { font-weight: 700; color: var(--primary-brown); font-size: 15px; }

.addr-actions { display: flex; align-items: center; gap: 10px;}
.default-badge { background: linear-gradient(135deg, #5a3420, #b8895d); color: #fff; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
.btn-set-default { background: none; border: 1px solid #ddd; font-size: 11px; padding: 4px 10px; border-radius: 20px; cursor: pointer; color: #666; font-weight: 600;}
.btn-set-default:hover { border-color: var(--primary-brown); color: var(--primary-brown); }

.address-card-body { display: flex; flex-direction: column; gap: 8px; color: #555; font-size: 14px; line-height: 1.5; }
.addr-row { display: flex; gap: 10px; align-items: flex-start; }
.addr-row i { color: #a1a1aa; margin-top: 3px; width: 14px; text-align: center;}

/* =========================================
   OTP & BUTTONS
   ========================================= */
.security-desc { font-size: 14px; color: #666; margin-bottom: 25px; line-height: 1.6; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #b8895d; }
.otp-input-group { display: flex; gap: 10px; }
.otp-input { flex: 1; text-align: center; letter-spacing: 5px; font-weight: 700; font-size: 16px; }
.btn-send-otp { background: #fdf8f6; border: 1px solid var(--primary-brown); color: var(--primary-brown); font-weight: 600; border-radius: 8px; padding: 0 20px; cursor: pointer; transition: 0.2s; white-space: nowrap; height: 45px;}
.btn-send-otp:hover:not(:disabled) { background: var(--primary-brown); color: #fff; }
.btn-send-otp:disabled { background: #f3f4f6; border-color: #d1d5db; color: #9ca3af; cursor: not-allowed; }

.footer-actions { display: flex; justify-content: flex-end; }
.btn-orange { background: linear-gradient(135deg, #5a3420, #b8895d); color: #fff; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; width: 100%; }
.btn-orange:hover:not(:disabled) { background-color: #4e2c17; box-shadow: 0 4px 10px rgba(99, 57, 31, 0.25); }
.btn-orange:disabled { opacity: 0.7; cursor: not-allowed; }

/* =========================================
   LOADING & TOAST & ANIMATION
   ========================================= */
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
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }

@media (max-width: 768px) {
  .body-layout-split { flex-direction: column; gap: 20px;}
  .left-panel { width: 100%; flex: none; }
  .row-duo { grid-template-columns: 1fr; gap: 15px; }
}
</style>