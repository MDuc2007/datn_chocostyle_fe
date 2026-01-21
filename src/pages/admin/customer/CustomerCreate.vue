<template>
  <div class="page-container">
    <div class="main-card form-page-animation">
      <div class="new-form-container">
        
        <div class="form-compact-header">
          <h2 class="new-form-title">THÊM KHÁCH HÀNG</h2>
          <div class="avatar-upload-compact">
            <div class="avatar-preview-circle">
              <img v-if="previewImage" :src="previewImage" alt="Avatar" />
              <span v-else class="avatar-placeholder">Ảnh</span>
            </div>
            <label class="btn-upload-text">
              Chọn ảnh
              <input type="file" accept="image/*" @change="handleFileUpload" hidden />
            </label>
          </div>
        </div>

        <div class="form-body-full">
          <div class="form-2-col-grid">
            
            <div class="col-inputs">
              <div class="form-group">
                <label>Họ và tên <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="newCustomer.tenKhachHang" 
                  placeholder="Nhập tên khách hàng" 
                  :class="{ 'is-invalid': errors.tenKhachHang }" 
                  @input="clearError('tenKhachHang')" 
                />
                <span v-if="errors.tenKhachHang" class="error-msg">{{ errors.tenKhachHang }}</span>
              </div>

              <div class="form-group">
                <label>Tên tài khoản <span class="required">*</span></label>
                <input 
                  v-model="newCustomer.tenTaiKhoan" 
                  placeholder="Nhập username (không dấu, không cách)" 
                  :class="{ 'is-invalid': errors.tenTaiKhoan }" 
                  @input="clearError('tenTaiKhoan')"
                />
                <span v-if="errors.tenTaiKhoan" class="error-msg">{{ errors.tenTaiKhoan }}</span>
              </div>

              <div class="form-group">
                <label>Số điện thoại <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="newCustomer.soDienThoai" 
                  placeholder="09xxxxxxxx" 
                  :class="{ 'is-invalid': errors.soDienThoai }" 
                  @input="clearError('soDienThoai')" 
                />
                <span v-if="errors.soDienThoai" class="error-msg">{{ errors.soDienThoai }}</span>
              </div>

              <div class="form-group">
                <label>Email <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="newCustomer.email" 
                  placeholder="Nhập email" 
                  :class="{ 'is-invalid': errors.email }" 
                  @input="clearError('email')" 
                />
                <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
              </div>
            </div>

            <div class="col-inputs">
              <div class="form-group">
                <label>Giới tính</label>
                <div class="radio-group-row fix-height">
                  <label class="radio-label"><input type="radio" :value="true" v-model="newCustomer.gioiTinh" /> Nam</label>
                  <label class="radio-label"><input type="radio" :value="false" v-model="newCustomer.gioiTinh" /> Nữ</label>
                </div>
              </div>

              <div class="form-group">
                <label>Ngày sinh <span class="required">*</span></label>
                <input 
                  type="date" 
                  v-model="newCustomer.ngaySinh" 
                  style="font-family: inherit" 
                  :class="{ 'is-invalid': errors.ngaySinh }"
                  @change="clearError('ngaySinh')"
                />
                <span v-if="errors.ngaySinh" class="error-msg">{{ errors.ngaySinh }}</span>
              </div>

              <div class="form-group">
                <label>Mật khẩu <span class="required">*</span></label>
                <input 
                  type="password" 
                  v-model="newCustomer.matKhau" 
                  :class="{ 'is-invalid': errors.matKhau }" 
                  @input="clearError('matKhau')" 
                />
                <span v-if="errors.matKhau" class="error-msg">{{ errors.matKhau }}</span>
              </div>

              <div class="form-group">
                <label>Nhập lại mật khẩu <span class="required">*</span></label>
                <input 
                  type="password" 
                  v-model="newCustomer.confirmPassword" 
                  :class="{ 'is-invalid': errors.confirmPassword }" 
                  @input="clearError('confirmPassword')" 
                />
                <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
              </div>
            </div>

            <div class="form-group form-group-address" style="grid-column: span 2;">
              <div class="address-header-row">
                <label>Địa chỉ nhận hàng</label>
                <button class="btn-add-mini" @click="addAddressField">
                  + Thêm địa chỉ mới
                </button>
              </div>
              
              <div class="address-list-container">
                <div v-for="(addr, index) in newCustomer.listDiaChi" :key="index" class="address-row-wrapper">
                  <div class="address-row-inputs">
                    <select class="addr-input-small" v-model="addr.provinceId" @change="onProvinceChange(addr)">
                      <option :value="null">-- Tỉnh/TP --</option>
                      <option v-for="p in listProvinces" :key="p.code" :value="p.code">{{ p.name }}</option>
                    </select>
                    
                    <select class="addr-input-small" v-model="addr.districtId" @change="onDistrictChange(addr)" :disabled="!addr.provinceId">
                      <option :value="null">-- Quận/Huyện --</option>
                      <option v-for="d in addr.districtOptions" :key="d.code" :value="d.code">{{ d.name }}</option>
                    </select>

                    <select class="addr-input-small" v-model="addr.wardCode" @change="onWardChange(addr)" :disabled="!addr.districtId">
                      <option :value="null">-- Phường/Xã --</option>
                      <option v-for="w in addr.wardOptions" :key="w.code" :value="w.code">{{ w.name }}</option>
                    </select>

                    <input class="addr-input-detail" v-model="addr.detail" placeholder="Số nhà, đường..." @input="clearError('address')" />

                    <button v-if="newCustomer.listDiaChi.length > 1" class="btn-icon-remove" title="Xóa" @click="removeAddressField(index)">✕</button>
                  </div>

                  <div class="address-row-footer">
                    <div v-if="addr.macDinh" class="default-badge active">
                      <span class="icon-check">✔</span> Mặc định
                    </div>
                    <div v-else class="default-badge inactive clickable" @click="setAsDefault(index)">
                      <span class="icon-circle"></span> Đặt mặc định
                    </div>
                  </div>
                </div>
              </div>
              <span v-if="errors.address" class="error-msg" style="display:block; margin-top: 5px;">{{ errors.address }}</span>
            </div>
          </div>
        </div>

        <div class="new-form-footer">
          <button class="btn-cancel-clean" @click="$router.push('/admin/customer')">Hủy bỏ</button>
          <button class="btn-save-brown" @click="saveCustomer">Lưu thông tin</button>
        </div>
      </div>
    </div>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-content">{{ toast.message }}</div>
        <button class="toast-close" @click="toast.show = false">×</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import axios from "axios";
import { customerService } from "../../../services/customerService"; 

const router = useRouter();

// --- STATE ---
const previewImage = ref(null);
const selectedFile = ref(null);
const listProvinces = ref([]);
const errors = ref({});
const toast = ref({ show: false, message: "", type: "success" });

const newCustomer = ref({
  tenKhachHang: "",
  tenTaiKhoan: "",
  soDienThoai: "",
  email: "",
  gioiTinh: true,
  ngaySinh: "",
  matKhau: "",
  confirmPassword: "",
  trangThai: 1,
  listDiaChi: [
    { 
      provinceId: null, districtId: null, wardCode: null,
      provinceName: "", districtName: "", wardName: "",
      detail: "", 
      districtOptions: [], wardOptions: [],
      macDinh: true 
    }
  ]
});

onMounted(() => { fetchProvinces(); });

// --- API TỈNH THÀNH ---
const fetchProvinces = async () => {
  try {
    const res = await axios.get("https://provinces.open-api.vn/api/?depth=1");
    listProvinces.value = res.data;
  } catch (e) { console.error("Lỗi load tỉnh:", e); }
};

const onProvinceChange = async (addr) => {
  addr.districtId = null; addr.wardCode = null; addr.districtOptions = []; addr.wardOptions = [];
  addr.provinceName = listProvinces.value.find(p => p.code === addr.provinceId)?.name || "";
  if (addr.provinceId) {
    try {
      const res = await axios.get(`https://provinces.open-api.vn/api/p/${addr.provinceId}?depth=2`);
      addr.districtOptions = res.data.districts;
    } catch (e) { console.error(e); }
  }
};

const onDistrictChange = async (addr) => {
  addr.wardCode = null; addr.wardOptions = [];
  addr.districtName = addr.districtOptions.find(d => d.code === addr.districtId)?.name || "";
  if (addr.districtId) {
    try {
      const res = await axios.get(`https://provinces.open-api.vn/api/d/${addr.districtId}?depth=2`);
      addr.wardOptions = res.data.wards;
    } catch (e) { console.error(e); }
  }
};

const onWardChange = (addr) => {
  addr.wardName = addr.wardOptions.find(w => w.code === addr.wardCode)?.name || "";
};

// --- LOGIC UI ---
const addAddressField = () => {
  newCustomer.value.listDiaChi.push({ 
    provinceId: null, districtId: null, wardCode: null, 
    provinceName: "", districtName: "", wardName: "",
    detail: "", districtOptions: [], wardOptions: [], macDinh: false 
  });
};

const removeAddressField = (index) => {
  const list = newCustomer.value.listDiaChi;
  if (list.length > 1) {
    const wasDefault = list[index].macDinh;
    list.splice(index, 1);
    if (wasDefault) list[0].macDinh = true;
  }
};

const setAsDefault = (selectedIndex) => {
  newCustomer.value.listDiaChi.forEach((addr, index) => {
    addr.macDinh = index === selectedIndex;
  });
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
        showToast("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB", "error");
        return;
    }
    selectedFile.value = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

// --- VALIDATION CORE (ĐÃ CẬP NHẬT ĐẦY ĐỦ) ---
const validateForm = () => {
  errors.value = {}; 
  let isValid = true;
  const form = newCustomer.value;

  // 1. Tên Khách Hàng
  if (!form.tenKhachHang || !form.tenKhachHang.trim()) {
    errors.value.tenKhachHang = "Họ và tên không được để trống";
    isValid = false;
  } else if (form.tenKhachHang.length < 2 || form.tenKhachHang.length > 50) {
    errors.value.tenKhachHang = "Họ tên phải từ 2 đến 50 ký tự";
    isValid = false;
  }

  // 2. Tên Tài Khoản
  if (!form.tenTaiKhoan || !form.tenTaiKhoan.trim()) {
      errors.value.tenTaiKhoan = "Tên tài khoản không được để trống";
      isValid = false;
  } else {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(form.tenTaiKhoan)) {
          errors.value.tenTaiKhoan = "Tên tài khoản không chứa dấu cách hoặc ký tự đặc biệt";
          isValid = false;
      }
  }

  // 3. Số Điện Thoại
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!form.soDienThoai) {
    errors.value.soDienThoai = "Số điện thoại là bắt buộc";
    isValid = false;
  } else if (!phoneRegex.test(form.soDienThoai)) {
    errors.value.soDienThoai = "Số điện thoại không đúng định dạng (VD: 0912345678)";
    isValid = false;
  }

  // 4. Email
  if (!form.email || !form.email.trim()) {
    errors.value.email = "Email là bắt buộc";
    isValid = false;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      errors.value.email = "Email không hợp lệ";
      isValid = false;
    }
  }

  // 5. Ngày sinh (CẬP NHẬT: Bắt buộc chọn)
  if (!form.ngaySinh) {
      errors.value.ngaySinh = "Vui lòng chọn ngày sinh";
      isValid = false;
  } else {
      const today = new Date();
      const birthDate = new Date(form.ngaySinh);
      if (birthDate > today) {
           errors.value.ngaySinh = "Ngày sinh không được lớn hơn ngày hiện tại"; 
           isValid = false;
      }
  }

  // 6. Mật khẩu
  if (!form.matKhau) {
      errors.value.matKhau = "Vui lòng nhập mật khẩu";
      isValid = false;
  } else if (form.matKhau.length < 6) {
      errors.value.matKhau = "Mật khẩu tối thiểu 6 ký tự";
      isValid = false;
  }

  // 7. Nhập lại mật khẩu (CẬP NHẬT: Bắt buộc nhập)
  if (!form.confirmPassword) {
      errors.value.confirmPassword = "Vui lòng nhập lại mật khẩu";
      isValid = false;
  } else if (form.matKhau !== form.confirmPassword) {
    errors.value.confirmPassword = "Mật khẩu không khớp";
    isValid = false;
  }
  
  // 8. Địa chỉ
  const hasValidAddr = form.listDiaChi.some(a => a.provinceId && a.districtId && a.wardCode && a.detail && a.detail.trim());
  if (!hasValidAddr) {
    errors.value.address = "Vui lòng hoàn thiện ít nhất một địa chỉ";
    isValid = false;
  } else {
    form.listDiaChi.forEach((a, index) => {
        if(a.provinceId && (!a.detail || !a.detail.trim())) {
             errors.value.address = `Dòng địa chỉ số ${index + 1} chưa nhập số nhà/đường`;
             isValid = false;
        }
    });
  }
  
  return isValid;
};

const clearError = (field) => { 
    if (errors.value[field]) delete errors.value[field]; 
    if (field === 'address' && errors.value.address) delete errors.value.address;
};

// --- SAVE CUSTOMER ---
const saveCustomer = async () => {
  if (!validateForm()) {
      showToast("Vui lòng nhập đầy đủ thông tin bắt buộc", "error");
      return;
  }
  
  try {
    await customerService.create(newCustomer.value, selectedFile.value);
    showToast("Thêm mới khách hàng thành công!", "success");
    setTimeout(() => router.push('/admin/customer'), 1500);

  } catch (error) {
    console.error("Save Error:", error);
    if (error.response) {
        const { status, data } = error.response;
        if (status === 400 && typeof data === 'object' && !Array.isArray(data)) {
            errors.value = { ...errors.value, ...data };
            showToast("Dữ liệu không hợp lệ, vui lòng kiểm tra lại", "error");
        } else if (typeof data === 'string') {
             showToast(data, "error");
        } else {
             showToast("Có lỗi xảy ra khi lưu dữ liệu", "error");
        }
    } else {
        showToast("Không thể kết nối đến máy chủ", "error");
    }
  }
};

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => toast.value.show = false, 3000);
};
</script>
<style scoped>
/* --- 1. SỬA ĐỂ BỎ SCROLL BAR & CĂN CHỈNH --- */
.form-body-full {
  padding: 30px;
  background: #fff;
}

/* Căn chỉnh chiều cao input và radio bằng nhau để 2 cột song song đẹp mắt */
.form-group input, 
.form-group select,
.radio-group-row.fix-height {
  height: 42px; /* Chiều cao cố định chuẩn */
  box-sizing: border-box;
}

.radio-group-row.fix-height {
  display: flex;
  align-items: center; /* Căn giữa chiều dọc cho radio */
  border: 1px solid transparent; /* Giữ layout giống input */
}

/* ------------------------------------------- */

/* Các CSS khác giữ nguyên style màu nâu và giao diện */
.main-card { background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.form-compact-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid #f1f5f9; background: #fff; }
.avatar-upload-compact { display: flex; align-items: center; gap: 15px; }
.avatar-preview-circle { width: 48px; height: 48px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.avatar-preview-circle img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { font-size: 12px; color: #94a3b8; font-weight: 600; }

.btn-upload-text { font-size: 13px; color: #63391F; font-weight: 600; cursor: pointer; }
.btn-upload-text:hover { text-decoration: underline; }

.form-2-col-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.form-group { margin-bottom: 20px; display: flex; flex-direction: column; }
.form-group label { font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
.required { color: #ef4444; }

.form-group input, .form-group select { 
  padding: 0 14px; /* padding ngang, dọc do height lo */
  border: 1px solid #cbd5e1; 
  border-radius: 8px; 
  font-size: 14px; 
  transition: all 0.2s; 
  width: 100%;
}
.form-group input:focus, .form-group select:focus { border-color: #63391F; box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1); outline: none; }
.form-group input.is-invalid { border-color: #ef4444; background: #fef2f2; }
.error-msg { font-size: 12px; color: #ef4444; margin-top: 5px; }

.radio-group-row { display: flex; gap: 20px; }
.radio-label { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }

/* ADDRESS SECTION */
.form-group-address { grid-column: 1 / -1; margin-top: 10px; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
.address-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.btn-add-mini { background: transparent; border: 1px dashed #63391F; color: #63391F; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-add-mini:hover { background: #63391F; color: #fff; }

.address-list-container { display: flex; flex-direction: column; gap: 15px; margin-bottom: 15px; }
.address-row-wrapper { display: flex; flex-direction: column; gap: 12px; padding: 15px; background-color: #F7F7F7; border-radius: 8px; border: 1px solid #e5e7eb; }
.address-row-inputs { display: flex; gap: 10px; width: 100%; }
/* 2. Đảm bảo ô chi tiết tự giãn nở (giữ nguyên hoặc chỉnh flex) */
.addr-input-detail { 
  flex: 1; /* Tự động chiếm hết khoảng trống còn lại */
  padding: 8px 12px; 
  border: 1px solid #e2e8f0; 
  border-radius: 6px; 
  font-size: 14px; 
  background: #fff; 
  min-width: 150px; /* Đảm bảo không bị co quá bé trên màn nhỏ */
}

/* DROPDOWN ARROW */
/* 1. Giảm chiều rộng của 3 ô Select */
select.addr-input-small {
  width: 20%;  /* Cũ là 30%, sửa thành 20% hoặc 18% */
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: white;
  outline: none;
  appearance: none; 
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

/* DEFAULT BADGE */
.address-row-footer { display: flex; align-items: center; }
.default-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 20px; transition: all 0.2s ease; }
.default-badge.active { background-color: #63391F; color: #FFFFFF; border: 1px solid #63391F; cursor: default; }
.default-badge.inactive { background-color: #FFFFFF; color: #63391F; border: 1px solid #63391F; }
.default-badge.inactive.clickable { cursor: pointer; }
.default-badge.inactive:hover { background-color: #fcefe9; }
.icon-check { font-size: 12px; }
.icon-circle { width: 12px; height: 12px; border: 1px solid #63391F; border-radius: 50%; display: inline-block; }

.btn-icon-remove { width: 30px; height: 30px; border-radius: 50%; border: 1px solid #fee2e2; background: #fff; color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.btn-icon-remove:hover { background: #fecaca; }

/* FOOTER */
.new-form-footer { padding: 20px 30px; background: #fff; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 15px; }
.btn-cancel-clean { padding: 10px 24px; border: 1px solid #cbd5e1; background: #fff; color: #64748b; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-cancel-clean:hover { background: #f8fafc; color: #334155; border-color: #94a3b8; }
.btn-save-brown { padding: 10px 24px; border: none; background: #63391F; color: #fff; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(99, 57, 31, 0.3); transition: 0.2s; }
.btn-save-brown:hover { box-shadow: 0 6px 10px -2px rgba(99, 57, 31, 0.4); transform: translateY(-1px); background: #502d18; }

/* Toast */
.toast-notification { position: fixed; top: 20px; right: 20px; background: #fff; padding: 16px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); display: flex; align-items: flex-start; gap: 12px; min-width: 320px; z-index: 9999; border-left: 4px solid transparent; }
.toast-notification.success { border-left-color: #10b981; }
.toast-notification.error { border-left-color: #ef4444; }
.toast-icon-box { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; }
.success .toast-icon-box { background: #d1fae5; color: #059669; }
.error .toast-icon-box { background: #fee2e2; color: #dc2626; }
.toast-content { flex: 1; display: flex; flex-direction: column; }
.toast-title { font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 2px; }
.toast-text { font-size: 13px; color: #64748b; line-height: 1.4; }
.toast-close { background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 0; margin-top: -2px; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter, .toast-slide-leave-to { opacity: 0; transform: translateX(30px); }
</style>