<template>
  <div class="add-employee-page">
    <div class="main-card form-page-animation">
      <div class="header-simple">
        <button
          class="btn-back hover-effect"
          @click="$router.push('/admin/customer')"
        >
          <i class="fa fa-arrow-left"></i> Quay lại danh sách
        </button>
      </div>

      <div v-if="loadingData" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu khách hàng...</p>
      </div>

      <div v-else class="body-layout-split">
        <div class="left-panel">
          <h3 class="panel-heading">Thông tin khách hàng</h3>

          <div class="avatar-section">
            <div class="avatar-wrapper">
              <label
                class="avatar-circle hover-scale"
                title="Thay đổi ảnh đại diện"
              >
                <img v-if="previewImage" :src="previewImage" alt="Avatar" />
                <div v-else class="placeholder-text">
                  <i class="fa fa-camera"></i><br />Tải ảnh
                </div>
                <div class="avatar-overlay-edit">
                  <span>Thay đổi</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  @change="handleFileUpload"
                  class="file-input-hidden"
                />
              </label>
              <span class="hint">Định dạng: JPG, PNG (Max 5MB)</span>
            </div>
          </div>

          <div class="form-group name-group">
            <label>Họ và tên <span class="req">*</span></label>
            <input
              type="text"
              v-model="editForm.tenKhachHang"
              placeholder="Nhập họ tên khách hàng"
              class="form-input"
              :class="{ 'red-border': errors.tenKhachHang }"
              @input="clearError('tenKhachHang')"
            />
            <span v-if="errors.tenKhachHang" class="error-msg slide-down">
              {{ errors.tenKhachHang }}
            </span>
          </div>
        </div>

        <div class="right-panel">
          <div class="right-header">
            <h3 class="panel-heading">Thông tin chi tiết</h3>
          </div>

          <div class="form-grid-container">
            <div class="row-duo">
              <div class="form-group">
                <label>Email <span class="req">*</span></label>
                <input
                  v-model="editForm.email"
                  placeholder="example@mail.com"
                  class="form-input"
                  :class="{ 'red-border': errors.email }"
                  @input="clearError('email')"
                />
                <span v-if="errors.email" class="error-msg slide-down">{{
                  errors.email
                }}</span>
              </div>

              <div class="form-group">
                <label>Ngày sinh <span class="req">*</span></label>
                <input
                  type="date"
                  v-model="editForm.ngaySinh"
                  class="form-input"
                  :class="{ 'red-border': errors.ngaySinh }"
                  @change="clearError('ngaySinh')"
                />
                <span v-if="errors.ngaySinh" class="error-msg slide-down">{{
                  errors.ngaySinh
                }}</span>
              </div>
            </div>

            <div class="row-duo">
              <div class="form-group">
                <label>Số điện thoại <span class="req">*</span></label>
                <input
                  v-model="editForm.soDienThoai"
                  placeholder="09xxxxxxxx"
                  class="form-input"
                  :class="{ 'red-border': errors.soDienThoai }"
                  @input="clearError('soDienThoai')"
                />
                <span v-if="errors.soDienThoai" class="error-msg slide-down">{{
                  errors.soDienThoai
                }}</span>
              </div>

              <div class="form-group">
                <label>Giới tính</label>
                <div class="radio-group">
                  <label class="radio-item">
                    <input
                      type="radio"
                      :value="true"
                      v-model="editForm.gioiTinh"
                    />
                    <span>Nam</span>
                  </label>
                  <label class="radio-item">
                    <input
                      type="radio"
                      :value="false"
                      v-model="editForm.gioiTinh"
                    />
                    <span>Nữ</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="address-section-wrapper">
              <div class="section-header-row">
                <h3 class="section-label-v3">Địa chỉ nhận hàng</h3>
                <button
                  class="btn-add-address-dashed hover-effect"
                  @click="addAddressField"
                >
                  + Thêm địa chỉ mới
                </button>
              </div>

              <div class="address-list-container">
                <transition-group name="list-anim">
                  <div
                    v-for="(addr, index) in editForm.listDiaChi"
                    :key="'addr-'+index"
                    class="address-card-v3"
                  >
                    <div class="address-main-row">
                      
                      <div class="addr-col">
                        <select
                          v-model="addr.provinceId"
                          @change="onProvinceChange(addr)"
                          class="form-input custom-select"
                        >
                          <option :value="null">Chọn Tỉnh/Thành phố</option>
                          <option
                            v-for="p in listProvinces"
                            :key="p.code"
                            :value="p.code"
                          >
                            {{ p.name }}
                          </option>
                        </select>
                      </div>

                      <div class="addr-col">
                        <select
                          v-model="addr.districtId"
                          @change="onDistrictChange(addr)"
                          class="form-input custom-select"
                          :disabled="!addr.provinceId"
                        >
                          <option :value="null">Chọn Quận/Huyện</option>
                          <option
                            v-for="d in addr.districtOptions"
                            :key="d.code"
                            :value="d.code"
                          >
                            {{ d.name }}
                          </option>
                        </select>
                      </div>

                      <div class="addr-col">
                        <select
                          v-model="addr.wardCode"
                          @change="onWardChange(addr)"
                          class="form-input custom-select"
                          :disabled="!addr.districtId"
                        >
                          <option :value="null">Chọn Phường/Xã</option>
                          <option
                            v-for="w in addr.wardOptions"
                            :key="w.code"
                            :value="w.code"
                          >
                            {{ w.name }}
                          </option>
                        </select>
                      </div>

                      <div class="addr-col addr-detail-input">
                        <input
                          v-model="addr.detail"
                          class="form-input"
                          placeholder="Nhập địa chỉ chi tiết..."
                          @input="clearError('address')"
                        />
                      </div>

                      <div class="addr-action-col">
                        <button
                          v-if="editForm.listDiaChi.length > 1"
                          class="btn-remove-circle hover-effect"
                          @click="removeAddressField(index)"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div class="address-footer-row">
                      <button
                        @click="setAsDefault(index)"
                        class="btn-default-pill hover-effect"
                        :class="{ 'is-active': addr.macDinh }"
                        :disabled="addr.macDinh"
                      >
                        <span v-if="addr.macDinh">Đang mặc định</span>
                        <span v-else>Đặt mặc định</span>
                      </button>
                    </div>
                  </div>
                </transition-group>
              </div>
              <span
                v-if="errors.address"
                class="error-msg slide-down"
                style="display: block; margin-top: 5px"
              >
                {{ errors.address }}
              </span>
            </div>
          </div>

          <div class="footer-actions">
            <button
              class="btn-cancel-clean hover-effect"
              @click="$router.push('/admin/customer')"
            >
              Hủy bỏ
            </button>
            <button
              class="btn-orange hover-effect"
              @click="handleUpdateClick"
              :disabled="isLoading"
              :class="{ 'btn-loading': isLoading }"
            >
              <span v-if="isLoading"
                ><i class="fa fa-spinner fa-spin"></i> Đang xử lý...</span
              >
              <span v-else>Lưu Khách Hàng</span>
            </button>
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

    <transition name="fade-modal">
      <div v-if="modal.show" class="modal-overlay" @click.self="closeModal">
        <div class="confirm-box">
          <div class="confirm-icon-wrapper">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="#f59e0b">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h3 class="confirm-title">{{ modal.title }}</h3>
          <p class="confirm-desc">{{ modal.message }}</p>
          <div class="confirm-actions">
            <button class="btn-cancel hover-effect" @click="closeModal">
              Hủy
            </button>
            <button
              class="btn-confirm hover-effect"
              @click="confirmUpdateAction"
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { customerService } from "../../../services/customerService";

const router = useRouter();
const route = useRoute();
const customerId = route.params.id;

// Dùng API v1 chuẩn để chống giật lag
const PROVINCE_API_URL = "https://provinces.open-api.vn/api/v1";

// --- STATE ---
const loadingData = ref(true);
const isLoading = ref(false);
const listProvinces = ref([]);
const previewImage = ref(null);
const selectedFile = ref(null);

const editForm = ref({
  maKhachHang: "",
  tenTaiKhoan: "",
  tenKhachHang: "",
  soDienThoai: "",
  email: "",
  gioiTinh: true,
  ngaySinh: "",
  matKhau: "",
  confirmPassword: "",
  listDiaChi: [],
});

const originalData = ref({});
const errors = ref({});
const toast = ref({ show: false, message: "", type: "success" });
const modal = ref({ show: false, title: "", message: "" });


// --- LIFECYCLE ---
onMounted(async () => {
  await fetchProvinces();
  if (customerId) {
    await fetchCustomerDetail();
  } else {
    loadingData.value = false;
    addAddressField(); 
  }
});

// --- FETCH DATA ---
const fetchProvinces = async () => {
  try {
    const res = await axios.get(`${PROVINCE_API_URL}/p/`);
    listProvinces.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const fetchCustomerDetail = async () => {
  try {
    const data = await customerService.getByIdForEdit(customerId);
    editForm.value = { ...data, matKhau: "", confirmPassword: "" };

    if (data.avatarFullUrl) previewImage.value = data.avatarFullUrl;

    originalData.value = {
      email: data.email,
      soDienThoai: data.soDienThoai,
    };
  } catch (e) {
    showToast("Không thể tải thông tin khách hàng", "error");
  } finally {
    loadingData.value = false;
  }
};

// --- ADDRESS LOGIC (DÙNG CHUẨN VUE) ---
const onProvinceChange = async (addr) => {
  addr.districtId = null;
  addr.wardCode = null;
  addr.districtOptions = [];
  addr.wardOptions = [];
  
  if (addr.provinceId) {
    addr.provinceName = listProvinces.value.find((p) => String(p.code) === String(addr.provinceId))?.name || "";
    try {
      const res = await axios.get(`${PROVINCE_API_URL}/p/${addr.provinceId}?depth=2`);
      addr.districtOptions = res.data.districts;
    } catch (error) {
      console.error(error);
    }
  } else {
    addr.provinceName = "";
  }
};

const onDistrictChange = async (addr) => {
  addr.wardCode = null;
  addr.wardOptions = [];
  
  if (addr.districtId) {
    addr.districtName = addr.districtOptions.find((d) => String(d.code) === String(addr.districtId))?.name || "";
    try {
      const res = await axios.get(`${PROVINCE_API_URL}/d/${addr.districtId}?depth=2`);
      addr.wardOptions = res.data.wards;
    } catch (error) {
       console.error(error);
    }
  } else {
    addr.districtName = "";
  }
};

const onWardChange = (addr) => {
  if (addr.wardCode) {
     addr.wardName = addr.wardOptions.find((w) => String(w.code) === String(addr.wardCode))?.name || "";
  } else {
     addr.wardName = "";
  }
};

const addAddressField = () => {
  editForm.value.listDiaChi.push({
    provinceId: null,
    districtId: null,
    wardCode: null,
    provinceName: "",
    districtName: "",
    wardName: "",
    detail: "",
    districtOptions: [],
    wardOptions: [],
    macDinh: editForm.value.listDiaChi.length === 0, 
  });
};

const removeAddressField = (i) => {
  if (editForm.value.listDiaChi.length > 1) {
    const wasDefault = editForm.value.listDiaChi[i].macDinh;
    editForm.value.listDiaChi.splice(i, 1);
    if (wasDefault) editForm.value.listDiaChi[0].macDinh = true;
  }
};

const setAsDefault = (i) => {
  editForm.value.listDiaChi.forEach((a, idx) => (a.macDinh = idx === i));
};

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showToast("Ảnh quá lớn (< 5MB)", "error");
      return;
    }
    selectedFile.value = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

// --- VALIDATION ---
const validateForm = () => {
  errors.value = {};
  let isValid = true;
  const form = editForm.value;

  if (!form.tenKhachHang?.trim()) {
    errors.value.tenKhachHang = "Vui lòng nhập họ và tên";
    isValid = false;
  }

  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!form.soDienThoai) {
    errors.value.soDienThoai = "Vui lòng nhập số điện thoại";
    isValid = false;
  } else if (!phoneRegex.test(form.soDienThoai)) {
    errors.value.soDienThoai = "Số điện thoại không hợp lệ";
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email?.trim()) {
    errors.value.email = "Vui lòng nhập Email";
    isValid = false;
  } else if (!emailRegex.test(form.email)) {
    errors.value.email = "Email sai định dạng";
    isValid = false;
  }

  if (!form.ngaySinh) {
    errors.value.ngaySinh = "Vui lòng chọn ngày sinh";
    isValid = false;
  } else {
    const today = new Date();
    const birthDate = new Date(form.ngaySinh);
    if (birthDate >= today) {
      errors.value.ngaySinh = "Ngày sinh không hợp lệ";
      isValid = false;
    }
  }

  const hasValidAddr = form.listDiaChi.some(
    (a) => a.provinceId && a.districtId && a.wardCode && a.detail?.trim(),
  );
  if (form.listDiaChi.length === 0 || !hasValidAddr) {
    errors.value.address = "Vui lòng nhập đầy đủ ít nhất 1 địa chỉ";
    isValid = false;
  }

  return isValid;
};

const clearError = (field) => {
  if (errors.value[field]) delete errors.value[field];
};

// --- ACTIONS ---
const handleUpdateClick = () => {
  if (!validateForm()) {
    showToast("Vui lòng kiểm tra lại thông tin", "error");
    return;
  }
  modal.value = {
    show: true,
    title: customerId ? "Xác nhận cập nhật" : "Xác nhận thêm mới", 
    message: customerId ? `Bạn có chắc chắn muốn thay đổi thông tin khách hàng này?` : `Bạn có chắc chắn muốn thêm khách hàng mới này?`, 
  };
};

const confirmUpdateAction = async () => {
  modal.value.show = false;
  isLoading.value = true;

  try {
    const isEmailChanged = editForm.value.email !== originalData.value.email;
    const isPhoneChanged = editForm.value.soDienThoai !== originalData.value.soDienThoai;

    if (isEmailChanged || isPhoneChanged) {
      const checkRes = await customerService.checkUnique({
        email: isEmailChanged ? editForm.value.email : null,
        sdt: isPhoneChanged ? editForm.value.soDienThoai : null,
      });
      const result = checkRes.data;

      if ((isEmailChanged && result.isEmailExist) || (isPhoneChanged && result.isPhoneExist)) {
        if (result.isEmailExist) errors.value.email = "Email đã tồn tại trên hệ thống!";
        if (result.isPhoneExist) errors.value.soDienThoai = "Số điện thoại đã tồn tại!";
        showToast("Thông tin bị trùng lặp!", "error");
        isLoading.value = false;
        return;
      }
    }

    const payload = { ...editForm.value };
    payload.listDiaChi = payload.listDiaChi.map((a) => ({
      id: a.id || null,
      thanhPho: a.provinceName,
      quan: a.districtName,
      phuong: a.wardName,
      diaChiCuThe: a.detail,
      macDinh: a.macDinh,
    }));

    if(customerId) {
        await customerService.update(customerId, payload, selectedFile.value);
        showToast("Cập nhật thành công!", "success");
    } else {
        await customerService.create(payload, selectedFile.value);
        showToast("Thêm mới thành công!", "success");
    }
    
    setTimeout(() => router.push("/admin/customer"), 1500);
  } catch (error) {
    console.error("Lỗi:", error);
    if (error.response && error.response.data) {
      const msg = typeof error.response.data === "string" ? error.response.data : error.response.data.message;
      showToast(msg || "Có lỗi xảy ra", "error");
    } else {
      showToast("Có lỗi xảy ra", "error");
    }
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => (modal.value.show = false);
const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => (toast.value.show = false), 3000);
};
</script>

<style scoped>
/* =========================================
   1. GLOBAL & LAYOUT
   ========================================= */
.add-employee-page {
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

.header-simple { margin-bottom: 25px; }
.btn-back { border: none; background: none; color: #666; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px; font-size: 14px; }
.btn-back:hover { color: var(--primary-brown); }

.body-layout-split { display: flex; gap: 60px; }
.left-panel { flex: 0 0 300px; display: flex; flex-direction: column; }
.right-panel { flex: 1; }
.panel-heading { font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 25px; }

/* =========================================
   3. LEFT PANEL STYLES (AVATAR)
   ========================================= */
.avatar-section { display: flex; justify-content: center; margin-bottom: 30px; }
.avatar-wrapper { display: flex; flex-direction: column; align-items: center; }
.avatar-circle { width: 120px; height: 120px; border: 2px dashed var(--primary-brown); border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; background: #f7f7f7; position: relative; transition: all 0.3s ease; }
.avatar-circle:hover { box-shadow: 0 0 0 4px rgba(99, 57, 31, 0.15); transform: scale(1.02); }
.avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
.placeholder-text { color: var(--primary-brown); font-size: 13px; opacity: 0.7; text-align: center; }
.file-input-hidden { display: none; }
.hint { font-size: 11px; color: #777; margin-top: 8px; }
.name-group { width: 100%; }

.avatar-overlay-edit { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; opacity: 0; transition: 0.3s; }
.avatar-overlay-edit span { color: #fff; font-size: 12px; font-weight: 600; }
.avatar-circle:hover .avatar-overlay-edit { opacity: 1; }

/* =========================================
   4. RIGHT PANEL STYLES (FORM GRID)
   ========================================= */
.right-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.form-grid-container { display: flex; flex-direction: column; gap: 20px; }
.row-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 6px; font-weight: 600; font-size: 13px; color: var(--primary-brown); }
.req { color: #c0392b; margin-left: 3px; }

.form-input { padding: 10px 15px; height: 42px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; background: #fff; transition: all 0.2s; box-sizing: border-box; width: 100%; }
.form-input:focus { border-color: var(--primary-brown); box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1); }

/* Đã sửa CSS cho Select HTML mặc định để đẹp như Select2 */
select.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 12px top 50%;
  background-size: 10px auto;
  cursor: pointer;
  color: #484848;
}
select.custom-select:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  border-style: dashed;
  color: #9ca3af;
}

.red-border { border-color: #c0392b !important; background-color: #fff5f5; }
.error-msg { color: #c0392b; font-size: 12px; font-style: italic; margin-top: 4px; }

.radio-group { display: flex; gap: 20px; margin-top: 8px; }
.radio-item { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; color: var(--primary-brown); }
.radio-item input { accent-color: var(--primary-brown); width: 16px; height: 16px; }

/* =========================================
   5. ADDRESS SECTION 
   ========================================= */
.address-section-wrapper { margin-top: 20px; padding-top: 20px; border-top: 1px dashed #ddd; }
.section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.section-label-v3 { font-size: 16px; font-weight: 700; color: var(--primary-brown); margin: 0; }
.btn-add-address-dashed { background: transparent; border: 1.5px dashed var(--primary-brown); color: var(--primary-brown); padding: 8px 15px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 13px; }
.btn-add-address-dashed:hover { background: var(--primary-brown); color: #fff; }

.address-card-v3 { background: #fafafa; border-radius: 8px; padding: 15px; margin-bottom: 15px; border: 1px solid #e0e0e0; transition: all 0.3s ease; }
.address-card-v3:hover { border-color: #d1d5db; }

/* Cột Layout Ngang */
.address-main-row { 
  display: flex; 
  gap: 12px; 
  align-items: center; 
  margin-bottom: 10px; 
  flex-wrap: nowrap;
}
.addr-col { flex: 1; min-width: 140px; }
.addr-detail-input { flex: 1; min-width: 150px; }
.addr-action-col { flex: 0 0 35px; display: flex; justify-content: center; }

/* Nút xóa */
.btn-remove-circle { 
  width: 32px; 
  height: 32px; 
  border-radius: 50%; 
  border: 1px solid #ff4d4f; 
  color: #ff4d4f; 
  background: transparent; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: 0.2s; 
  font-size: 12px;
}
.btn-remove-circle:hover { background: #fff1f0; }

/* Nút mặc định */
.btn-default-pill { 
  background: transparent; 
  border: 1px solid #63391F; 
  color: #63391F; 
  padding: 6px 18px; 
  border-radius: 20px; 
  font-size: 12px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: 0.2s; 
}
.btn-default-pill:hover:not(:disabled) { background: #fdf8f6; }
.btn-default-pill.is-active { background: #63391F; color: #ffffff; cursor: default; }

/* =========================================
   6. FOOTER & MISC
   ========================================= */
.footer-actions { display: flex; justify-content: flex-end; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; gap: 15px; }
.btn-cancel-clean { padding: 10px 24px; border: 1px solid #cbd5e1; background: #fff; color: #64748b; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-cancel-clean:hover { background: #f1f5f9; color: #334155; }
.btn-orange { background: linear-gradient(135deg, #5a3420, #b8895d); color: #fff; border: none; padding: 12px 40px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-orange:hover:not(:disabled) { background-color: #4e2c17; box-shadow: 0 4px 10px rgba(99, 57, 31, 0.25); }
.btn-orange:disabled { opacity: 0.7; cursor: not-allowed; }

.loading-state { text-align: center; padding: 50px; color: #666; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-brown); border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 15px; }

.toast-notification { position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 250px; padding: 12px 15px; border-radius: 6px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); font-size: 14px; font-weight: 500; background: #F0FDF4; color: #374151; }
.toast-indicator { width: 6px; height: 100%; background-color: #22C55E; position: absolute; left: 0; top: 0; border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
.toast-content { margin-left: 10px; }
.toast-notification.error { background: #FEF2F2; color: #991b1b; }
.toast-notification.error .toast-indicator { background-color: #ef4444; }

.modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
.confirm-box { background: #fff; padding: 30px; border-radius: 20px; width: 400px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); animation: zoomIn 0.3s ease-out; }
.confirm-icon-wrapper { width: 80px; height: 80px; border-radius: 50%; background-color: #FEF3C7; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
.confirm-title { color: var(--primary-brown); margin-bottom: 10px; font-size: 20px; font-weight: 700; }
.confirm-desc { color: #666; margin-bottom: 25px; line-height: 1.5; font-size: 14px; }
.confirm-actions { display: flex; gap: 15px; }
.confirm-actions button { flex: 1; height: 42px; border-radius: 10px; font-weight: 600; cursor: pointer; border: none; font-size: 14px; }
.btn-confirm { background-color: #a88164; color: #fff; }
.btn-confirm:hover { background-color: var(--primary-brown); }
.btn-cancel { background: #f1f5f9; color: #475569; }

@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.slide-down { animation: slideDown 0.2s ease-out; }
@keyframes slideDown { from { transform: translateY(-5px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.form-page-animation { opacity: 0; animation: fadeInUp 0.5s forwards; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) { .body-layout-split { flex-direction: column; gap: 30px; } .left-panel { flex: none; align-items: center; width: 100%; } .name-group { max-width: 400px; margin: 0 auto; } .address-main-row { flex-wrap: wrap; } .addr-action-col { width: 100%; justify-content: flex-end;} }
</style>