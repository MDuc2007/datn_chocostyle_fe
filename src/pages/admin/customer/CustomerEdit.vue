<template>
  <div class="page-container">
    <div class="main-card form-page-animation">
      
      <div class="form-header">
        <div class="header-left">
          <h2 class="form-title">CẬP NHẬT THÔNG TIN KHÁCH HÀNG</h2>
        </div>
        
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img v-if="previewImage" :src="previewImage" alt="Avatar" />
            <div v-else class="avatar-initials">KH</div>
            <label class="edit-badge" title="Thay đổi ảnh đại diện">
              <input type="file" accept="image/*" @change="handleFileUpload" hidden />
              <span class="icon-camera">📷</span>
            </label>
          </div>
        </div>
      </div>

      <div class="form-content" v-if="!loadingData">
        <div class="grid-layout">
          
          <div class="form-section">
            <h3 class="section-title">Thông tin cá nhân</h3>
            
            <div class="form-group">
              <label>Họ và tên <span class="required">*</span></label>
              <input 
                type="text" 
                v-model="editForm.tenKhachHang" 
                placeholder="Nhập họ tên khách hàng" 
                class="custom-input"
                :class="{ 'is-invalid': errors.tenKhachHang }"
                @input="clearError('tenKhachHang')"
              />
              <span v-if="errors.tenKhachHang" class="error-msg">{{ errors.tenKhachHang }}</span>
            </div>

            <div class="form-group-row">
              <div class="form-group">
                <label>Số điện thoại <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="editForm.soDienThoai" 
                  placeholder="09xxxxxxxx" 
                  class="custom-input"
                  :class="{ 'is-invalid': errors.soDienThoai }"
                  @input="clearError('soDienThoai')"
                />
                <span v-if="errors.soDienThoai" class="error-msg">{{ errors.soDienThoai }}</span>
              </div>

              <div class="form-group">
                <label>Giới tính</label>
                <div class="gender-toggle">
                  <label :class="{ active: editForm.gioiTinh === true }">
                    <input type="radio" :value="true" v-model="editForm.gioiTinh" hidden /> Nam
                  </label>
                  <label :class="{ active: editForm.gioiTinh === false }">
                    <input type="radio" :value="false" v-model="editForm.gioiTinh" hidden /> Nữ
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Ngày sinh <span class="required">*</span></label>
              <input 
                type="date" 
                v-model="editForm.ngaySinh" 
                class="custom-input"
                :class="{ 'is-invalid': errors.ngaySinh }"
                @change="clearError('ngaySinh')"
              />
              <span v-if="errors.ngaySinh" class="error-msg">{{ errors.ngaySinh }}</span>
            </div>

            <div class="form-group">
              <label>Email liên hệ <span class="required">*</span></label>
              <input 
                type="email" 
                v-model="editForm.email" 
                placeholder="example@gmail.com" 
                class="custom-input"
                :class="{ 'is-invalid': errors.email }"
                @input="clearError('email')"
              />
              <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
            </div>
          </div>

          <div class="form-section">
            <div class="form-group">
              <label>Mã khách hàng</label>
              <input :value="editForm.maKhachHang" readonly class="custom-input readonly-field" />
            </div>

            <div class="form-group">
              <label>Tên tài khoản</label>
              <input v-model="editForm.tenTaiKhoan" readonly class="custom-input readonly-field" />
            </div>

            <div class="form-group-row">
              <div class="form-group">
                <label>Số lượng đơn hàng</label>
                <input 
                  :value="(editForm.soLuongDonHang || 0) + ' đơn hàng'" 
                  readonly 
                  class="custom-input readonly-field" 
                  style="font-weight: 600; color: #2c3e50;"
                />
              </div>
              <div class="form-group">
                <label>Tổng chi tiêu tích lũy</label>
                <input 
                  :value="formatCurrency(editForm.tongChiTieu)" 
                  readonly 
                  class="custom-input readonly-field" 
                  style="font-weight: 600; color: #e74c3c;"
                />
              </div>
            </div>

            <div class="form-group-row full-width">
              <div class="form-group">
                <label>Ngày tạo</label>
                <div class="time-box">
                  <span class="time-value">{{ editForm.ngayTao }}</span>
                </div>
              </div>

              <div class="form-group">
                <label>Ngày chỉnh sửa</label>
                <div class="time-box">
                  <span class="time-value">{{ editForm.ngayCapNhat }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section full-width address-section-wrapper">
            <div class="section-header">
              <h3 class="section-label">Địa chỉ nhận hàng</h3>
              <button class="btn-add-address-dashed" @click="addAddressField">
                + Thêm địa chỉ mới
              </button>
            </div>

            <div class="address-list-container">
              <div
                v-for="(addr, index) in editForm.listDiaChi"
                :key="index"
                class="address-card-v2"
              >
                <button
                  v-if="editForm.listDiaChi.length > 1"
                  class="btn-remove-v2"
                  @click="removeAddressField(index)"
                >
                  Xóa
                </button>

                <div class="address-row-layout">
                  <select v-model="addr.provinceId" @change="onProvinceChange(addr)" class="custom-control select-box">
                    <option :value="null">-- Tỉnh/TP --</option>
                    <option v-for="p in listProvinces" :key="p.code" :value="p.code">{{ p.name }}</option>
                  </select>

                  <select v-model="addr.districtId" @change="onDistrictChange(addr)" class="custom-control select-box" :disabled="!addr.provinceId">
                    <option :value="null">-- Quận/Huyện --</option>
                    <option v-for="d in addr.districtOptions" :key="d.code" :value="d.code">{{ d.name }}</option>
                  </select>

                  <select v-model="addr.wardCode" @change="onWardChange(addr)" class="custom-control select-box" :disabled="!addr.districtId">
                    <option :value="null">-- Phường/Xã --</option>
                    <option v-for="w in addr.wardOptions" :key="w.code" :value="w.code">{{ w.name }}</option>
                  </select>

                  <input v-model="addr.detail" class="custom-control input-detail" placeholder="Số nhà, đường..." @input="clearError('address')" />
                </div>

                <div class="address-footer-v2">
                  <button
                    @click="setAsDefault(index)"
                    class="btn-default-pill"
                    :class="{ active: addr.macDinh }"
                    :disabled="addr.macDinh"
                  >
                    <span v-if="addr.macDinh">✓ Mặc định</span>
                    <span v-else>Đặt làm mặc định</span>
                  </button>
                </div>
              </div>
            </div>
            <span v-if="errors.address" class="error-msg" style="display:block; margin-top:10px; text-align:right;">{{ errors.address }}</span>
          </div>
        </div>
      </div>

      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>Đang đồng bộ dữ liệu khách hàng...</p>
      </div>

      <div class="form-footer">
        <button class="btn-back" @click="$router.push('/admin/customer')">Quay lại</button>
        <button class="btn-submit" @click="handleUpdate" :disabled="loadingData">Cập Nhật Thông Tin</button>
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
import { useRouter, useRoute } from 'vue-router';
import axios from "axios";
import { customerService } from "../../../services/customerService";

const router = useRouter();
const route = useRoute();
const customerId = route.params.id;

// --- STATE ---
const loadingData = ref(true);
const listProvinces = ref([]);
const previewImage = ref(null);
const selectedFile = ref(null);
const editForm = ref({});
const errors = ref({}); // Lưu lỗi validate
const toast = ref({ show: false, message: "", type: "success" }); // Toast thông báo

onMounted(async () => {
  const pRes = await axios.get("https://provinces.open-api.vn/api/?depth=1");
  listProvinces.value = pRes.data;

  try {
    const data = await customerService.getByIdForEdit(customerId);
    editForm.value = data;
    if (data.avatarFullUrl) previewImage.value = data.avatarFullUrl;
  } catch (e) {
    console.error("Lỗi tải khách hàng");
    showToast("Không thể tải thông tin khách hàng", "error");
  } finally {
    loadingData.value = false;
  }
});

// --- HELPER ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value || 0);
};

// --- LOGIC ĐỊA CHỈ ---
const onProvinceChange = async (addr) => {
  addr.districtId = null; addr.wardCode = null; addr.districtOptions = []; addr.wardOptions = [];
  const res = await axios.get(`https://provinces.open-api.vn/api/p/${addr.provinceId}?depth=2`);
  addr.districtOptions = res.data.districts;
  addr.provinceName = listProvinces.value.find(p => p.code === addr.provinceId)?.name || "";
};

const onDistrictChange = async (addr) => {
  addr.wardCode = null; addr.wardOptions = [];
  const res = await axios.get(`https://provinces.open-api.vn/api/d/${addr.districtId}?depth=2`);
  addr.wardOptions = res.data.wards;
  addr.districtName = addr.districtOptions.find(d => d.code === addr.districtId)?.name || "";
};

const onWardChange = (addr) => {
  addr.wardName = addr.wardOptions.find(w => w.code === addr.wardCode)?.name || "";
};

const addAddressField = () => editForm.value.listDiaChi.push({ provinceId: null, macDinh: false, districtOptions: [], wardOptions: [] });

const removeAddressField = (i) => {
    const list = editForm.value.listDiaChi;
    if (list.length > 1) {
        const wasDefault = list[i].macDinh;
        list.splice(i, 1);
        if (wasDefault) list[0].macDinh = true;
    }
};

const setAsDefault = (i) => editForm.value.listDiaChi.forEach((a, idx) => a.macDinh = idx === i);

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) { 
      // Validate ảnh < 5MB
      if (file.size > 5 * 1024 * 1024) {
          showToast("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB", "error");
          return;
      }
      selectedFile.value = file; 
      previewImage.value = URL.createObjectURL(file); 
  }
};

// --- VALIDATION CORE ---
const validateForm = () => {
    errors.value = {};
    let isValid = true;
    const form = editForm.value;

    // 1. Họ tên
    if (!form.tenKhachHang || !form.tenKhachHang.trim()) {
        errors.value.tenKhachHang = "Họ và tên không được để trống";
        isValid = false;
    } else if (form.tenKhachHang.length < 2 || form.tenKhachHang.length > 50) {
        errors.value.tenKhachHang = "Họ tên phải từ 2 đến 50 ký tự";
        isValid = false;
    }

    // 2. Số điện thoại
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!form.soDienThoai) {
        errors.value.soDienThoai = "Số điện thoại là bắt buộc";
        isValid = false;
    } else if (!phoneRegex.test(form.soDienThoai)) {
        errors.value.soDienThoai = "SĐT không hợp lệ (VD: 0912345678)";
        isValid = false;
    }

    // 3. Email
    if (!form.email || !form.email.trim()) {
        errors.value.email = "Email là bắt buộc";
        isValid = false;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            errors.value.email = "Email không đúng định dạng";
            isValid = false;
        }
    }

    // 4. Ngày sinh
    if (!form.ngaySinh) {
        errors.value.ngaySinh = "Vui lòng chọn ngày sinh";
        isValid = false;
    } else {
        const today = new Date();
        const birthDate = new Date(form.ngaySinh);
        if (birthDate > today) {
             errors.value.ngaySinh = "Ngày sinh không được ở tương lai"; 
             isValid = false;
        }
    }

    // 5. Địa chỉ (Check kỹ xem đã chọn đủ Tỉnh/Huyện/Xã/Chi tiết chưa)
    const hasValidAddr = form.listDiaChi.some(a => a.provinceId && a.districtId && a.wardCode && a.detail && a.detail.trim());
    if (!hasValidAddr) {
        errors.value.address = "Vui lòng hoàn thiện ít nhất một địa chỉ";
        isValid = false;
    } else {
        form.listDiaChi.forEach((a, index) => {
            if(a.provinceId && (!a.detail || !a.detail.trim())) {
                 errors.value.address = `Địa chỉ số ${index + 1} thiếu thông tin chi tiết`;
                 isValid = false;
            }
        });
    }

    return isValid;
};

const clearError = (field) => {
    if (errors.value[field]) delete errors.value[field];
    if (field === 'address') delete errors.value.address;
};

// --- SUBMIT ---
const handleUpdate = async () => {
  if (!validateForm()) {
      showToast("Vui lòng kiểm tra lại các trường báo lỗi", "error");
      return;
  }

  try {
    const payload = { ...editForm.value };
    
    // Mapping lại dữ liệu địa chỉ cho đúng định dạng BE cần
    payload.listDiaChi = payload.listDiaChi.map(a => ({
      id: a.id, 
      thanhPho: a.provinceName, 
      quan: a.districtName, 
      phuong: a.wardName,
      diaChiCuThe: a.detail, 
      macDinh: a.macDinh
    }));

    await customerService.update(customerId, payload, selectedFile.value);
    showToast("Cập nhật thành công!", "success");
    setTimeout(() => router.push('/admin/customer'), 1500);

  } catch (error) {
    console.error("Update Error:", error);
    // Xử lý lỗi từ Server (Trùng Email, SĐT, v.v...)
    if (error.response) {
        const { status, data } = error.response;
        if (status === 400 && typeof data === 'object' && !Array.isArray(data)) {
            errors.value = { ...errors.value, ...data };
            showToast("Dữ liệu không hợp lệ, vui lòng kiểm tra lại", "error");
        } else if (typeof data === 'string') {
             showToast(data, "error");
        } else {
             showToast("Lỗi khi cập nhật dữ liệu", "error");
        }
    } else {
        showToast("Lỗi kết nối máy chủ", "error");
    }
  }
};

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => toast.value.show = false, 3000);
};
</script>
<style scoped>
/* --- 1. TỔNG THỂ & LAYOUT --- */
.page-container {
  padding: 20px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.main-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header đồng bộ màu nâu */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid #f1f5f9;
}

.form-title {
  color: #63391F;
  font-weight: 700;
  margin: 0;
  font-size: 20px;
}

.form-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 5px 0 0 0;
}

/* --- 2. GRID & FORM GROUPS --- */
.form-content {
  padding: 30px;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.form-section {
  display: flex;
  flex-direction: column;
}

/* Ẩn tiêu đề để hai cột song song tuyệt đối */
.section-title {
  display: none;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  height: 20px;
  display: flex;
  align-items: center;
}

.form-group-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* --- 3. INPUTS & ĐỒNG BỘ CHIỀU CAO 42PX --- */
.custom-input, 
.custom-select, 
.gender-toggle,
.mini-select,
.readonly-field,
.time-box {
  height: 42px !important;
  box-sizing: border-box;
}

.custom-input, .custom-select {
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: #fff;
  width: 100%;
}

.custom-input:focus, .custom-select:focus {
  border-color: #63391F;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
  outline: none;
}

/* Readonly fields (Mã KH, Tên TK) */
.readonly-field {
  background-color: #f1f5f9 !important;
  color: #64748b;
  cursor: not-allowed;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 14px;
  display: flex;
  align-items: center;
}

input.readonly-field[style*="color"],
.time-box {
  background-color: #fff9f6 !important;
  border: 1px solid #fcefe9 !important;
  color: #1e293b !important; /* Màu chữ đậm như ảnh */
  font-weight: 500;
}

.timeline-container-horizontal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.time-box {
  display: flex;
  align-items: center;
  padding: 0 15px;
  border-radius: 8px;
}

.time-value { 
  font-size: 14px; 
  color: #1e293b; 
  font-weight: 500; 
}

.dot, .time-label, .time-divider {
  display: none !important;
}

/* --- 5. AVATAR SECTION --- */
.avatar-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
}

.avatar-wrapper img, .avatar-initials {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-initials {
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-weight: 700;
}

.edit-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #63391F;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #fff;
}

.icon-camera { font-size: 12px; }

/* --- 6. GIỚI TÍNH --- */
.gender-toggle {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
}

.gender-toggle label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  transition: 0.2s;
  margin: 0;
  height: 100% !important;
}

.gender-toggle label.active {
  background: #fff;
  color: #63391F;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}



.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-add-address {
  background: transparent;
  border: 1px dashed #63391F;
  color: #63391F;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.btn-add-address:hover { background: #63391F; color: #fff; }

.address-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.address-card {
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 15px;
  background: #fdfdfd;
  transition: 0.2s;
}

.address-card.is-default { border-color: #63391F; background: #fffaf8; }

.address-card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.address-index { font-size: 12px; font-weight: 700; color: #94a3b8; }

.btn-remove {
  color: #ef4444;
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.select-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.mini-select {
  flex: 1;
  padding: 0 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12px;
}

.detail-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
}

.btn-default-toggle {
  margin-top: 12px;
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #63391F;
  background: #fff;
  color: #63391F;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-default-toggle:disabled {
  background: #63391F;
  color: #fff;
  cursor: default;
}

/* --- 8. FOOTER & BUTTONS --- */
.form-footer {
  padding: 20px 30px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn-back {
  padding: 10px 24px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #64748b;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit {
  padding: 10px 24px;
  background: #63391F;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(99, 57, 31, 0.3);
}

.btn-submit:hover { background: #502d18; }

/* --- 9. LOADING STATE --- */
.loading-state {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f1f5f9;
  border-top-color: #63391F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

/* THÊM ĐOẠN NÀY ĐỂ XỬ LÝ PHẦN ĐỊA CHỈ FULL WIDTH */
.grid-layout .full-width {
  grid-column: 1 / -1; /* Ép phần tử này trải dài hết các cột */
  width: 100%;

}
/* --- ADDRESS SECTION (GIAO DIỆN MỚI 100%) --- */

/* Khung chứa danh sách */
.address-list-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Card từng địa chỉ */
.address-card-v2 {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px 20px;
  position: relative;
  transition: all 0.2s ease;
}

/* Hiệu ứng khi là mặc định: Viền nâu + nền hồng nhạt */
.address-card-v2.is-default {
  border-color: #63391F;
  background-color: #fffbf8;
  box-shadow: 0 4px 12px rgba(99, 57, 31, 0.05);
}

/* Header nhỏ bên trong card (Số thứ tự + Nút xóa) */
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.addr-label {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

/* Nút xóa dạng text (như ảnh mẫu cũ) */
.btn-text-remove {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
.btn-text-remove:hover { color: #dc2626; }

/* LAYOUT HÀNG NGANG (QUAN TRỌNG NHẤT) */
.address-input-row {
  display: flex;
  gap: 10px; /* Khoảng cách giữa các ô */
  margin-bottom: 15px;
  align-items: center;
}

/* Container chính */
.address-section-wrapper {
  margin-top: 20px;
  width: 100%;
}

/* Header: Tiêu đề và nút thêm mới */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-label {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

/* Nút Thêm địa chỉ: Viền đứt đoạn + bo góc */
.btn-add-address-dashed {
  background: transparent;
  border: 1px dashed #63391F; /* Màu nâu chủ đạo */
  color: #63391F;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-add-address-dashed:hover {
  background-color: #fdf5e6;
}

/* Card chứa từng địa chỉ */
.address-card-v2 {
  border: 1px solid #e2e8f0; /* Viền xám nhạt */
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

/* Flexbox Layout: Xếp 4 ô nằm ngang */
.address-row-layout {
  display: flex;
  gap: 12px; /* Khoảng cách giữa các ô */
  align-items: center;
  margin-bottom: 15px;
}

/* Style chung cho Select và Input */
.custom-control {
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  color: #606266;
  outline: none;
  background-color: #fff;
  transition: border-color 0.2s;
}

.custom-control:focus {
  border-color: #63391F;
}

/* Căn chia tỷ lệ chiều rộng */
.select-box {
  flex: 1; /* Các ô select chiếm phần đều nhau */
  min-width: 120px;
}

.input-detail {
  flex: 1.5; /* Ô địa chỉ chi tiết dài gấp 1.5 lần ô select */
}

/* Nút Mặc định (Hình viên thuốc) */
.btn-default-pill {
  border: none;
  background-color: #e0e0e0; /* Màu xám khi chưa chọn */
  color: #666;
  padding: 6px 20px;
  border-radius: 50px; /* Bo tròn hoàn toàn */
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

/* Trạng thái Active (Màu nâu đậm) */
.btn-default-pill.active {
  background-color: #63391F;
  color: white;
}

/* Nút Xóa (Nhỏ, nằm góc phải) */
.btn-remove-v2 {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 13px;
  text-decoration: underline;
  z-index: 10;
}

/* --- VALIDATION CSS --- */

/* Dấu sao đỏ bắt buộc */
.required {
  color: #e74c3c;
  margin-left: 4px;
  font-weight: bold;
}

/* Viền đỏ khi input bị lỗi */
.custom-input.is-invalid,
.custom-control.is-invalid,
input.is-invalid,
select.is-invalid {
  border-color: #e74c3c !important;
  background-color: #fdf2f2; /* Màu nền đỏ nhạt */
}

/* Hiệu ứng rung nhẹ khi lỗi (Optional) */
.is-invalid {
  animation: shake 0.3s ease-in-out;
}

/* Dòng chữ thông báo lỗi bên dưới input */
.error-msg {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 5px;
  display: block;
  font-style: italic;
}

/* Animation rung */
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}
/* =========================================
   2. CSS CHO TOAST NOTIFICATION (Thông báo góc)
   ========================================= */

/* Khung thông báo chung */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999; /* Luôn nổi trên cùng */
  min-width: 320px;
  max-width: 450px;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-family: 'Segoe UI', sans-serif;
  font-size: 15px;
  line-height: 1.4;
  /* Hiệu ứng mượt mà */
  transition: all 0.3s ease;
}

/* Màu sắc cho từng loại thông báo */
.toast-notification.success {
  background-color: #2ecc71; /* Xanh lá tươi */
  border-left: 5px solid #27ae60;
}

.toast-notification.error {
  background-color: #e74c3c; /* Đỏ */
  border-left: 5px solid #c0392b;
}

/* Nội dung chữ bên trong */
.toast-content {
  flex: 1;
  font-weight: 500;
  margin-right: 12px;
}

/* Nút tắt (x) */
.toast-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #fff;
}

/* --- Hiệu ứng trượt ra/vào (Vue Transition) --- */
.toast-slide-enter-active {
  animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Hiệu ứng nảy nhẹ */
}
.toast-slide-leave-active {
  transition: all 0.4s ease;
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%); /* Trượt sang phải biến mất */
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>