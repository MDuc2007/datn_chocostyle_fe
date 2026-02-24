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
                    :key="index"
                    class="address-card-v3 hover-lift"
                  >
                    <div class="address-main-row">
                      <select
                        v-model="addr.provinceId"
                        @change="onProvinceChange(addr)"
                        class="addr-select form-input"
                      >
                        <option :value="null">-- Tỉnh/TP --</option>
                        <option
                          v-for="p in listProvinces"
                          :key="p.code"
                          :value="p.code"
                        >
                          {{ p.name }}
                        </option>
                      </select>

                      <select
                        v-model="addr.districtId"
                        @change="onDistrictChange(addr)"
                        class="addr-select form-input"
                        :disabled="!addr.provinceId"
                      >
                        <option :value="null">-- Quận/Huyện --</option>
                        <option
                          v-for="d in addr.districtOptions"
                          :key="d.code"
                          :value="d.code"
                        >
                          {{ d.name }}
                        </option>
                      </select>

                      <select
                        v-model="addr.wardCode"
                        @change="onWardChange(addr)"
                        class="addr-select form-input"
                        :disabled="!addr.districtId"
                      >
                        <option :value="null">-- Phường/Xã --</option>
                        <option
                          v-for="w in addr.wardOptions"
                          :key="w.code"
                          :value="w.code"
                        >
                          {{ w.name }}
                        </option>
                      </select>

                      <input
                        v-model="addr.detail"
                        class="addr-input-detail form-input"
                        placeholder="Số nhà, đường..."
                        @input="clearError('address')"
                      />

                      <button
                        v-if="editForm.listDiaChi.length > 1"
                        class="btn-remove-circle hover-effect"
                        @click="removeAddressField(index)"
                      >
                        ✕
                      </button>
                    </div>

                    <div class="address-footer-row">
                      <button
                        @click="setAsDefault(index)"
                        class="btn-default-pill hover-effect"
                        :class="{ 'is-active': addr.macDinh }"
                        :disabled="addr.macDinh"
                      >
                        <span v-if="addr.macDinh">✓ Mặc định</span>
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
              <span v-else>Lưu Thay Đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-content">{{ toast.message }}</div>
        <button class="toast-close" @click="toast.show = false">×</button>
      </div>
    </transition>

    <transition name="fade-modal">
      <div v-if="modal.show" class="modal-overlay" @click.self="closeModal">
        <div class="confirm-box">
          <div class="confirm-icon-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12l3 3 5-5"></path>
            </svg>
          </div>
          <h3 class="confirm-title">{{ modal.title }}</h3>
          <p class="confirm-desc">{{ modal.message }}</p>
          <div class="confirm-actions">
            <button class="btn-cancel hover-effect" @click="closeModal">
              Xem lại
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
  await fetchCustomerDetail();
});

// --- FETCH DATA ---
const fetchProvinces = async () => {
  try {
    const res = await axios.get("https://provinces.open-api.vn/api/?depth=1");
    listProvinces.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const fetchCustomerDetail = async () => {
  try {
    const data = await customerService.getByIdForEdit(customerId);
    // Reset mật khẩu khi load
    editForm.value = { ...data, matKhau: "", confirmPassword: "" };

    if (data.avatarFullUrl) previewImage.value = data.avatarFullUrl;

    // Lưu dữ liệu gốc để check trùng
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

// --- ADDRESS LOGIC ---
const onProvinceChange = async (addr) => {
  addr.districtId = null;
  addr.wardCode = null;
  addr.provinceName =
    listProvinces.value.find((p) => p.code === addr.provinceId)?.name || "";
  if (addr.provinceId) {
    const res = await axios.get(
      `https://provinces.open-api.vn/api/p/${addr.provinceId}?depth=2`,
    );
    addr.districtOptions = res.data.districts;
  }
};

const onDistrictChange = async (addr) => {
  addr.wardCode = null;
  addr.districtName =
    addr.districtOptions.find((d) => d.code === addr.districtId)?.name || "";
  if (addr.districtId) {
    const res = await axios.get(
      `https://provinces.open-api.vn/api/d/${addr.districtId}?depth=2`,
    );
    addr.wardOptions = res.data.wards;
  }
};

const onWardChange = (addr) => {
  addr.wardName =
    addr.wardOptions.find((w) => w.code === addr.wardCode)?.name || "";
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
    macDinh: false,
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
    errors.value.email = "Email không đúng định dạng";
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
    title: "Xác nhận cập nhật",
    message: `Bạn có chắc chắn muốn lưu thay đổi cho khách hàng "${editForm.value.tenKhachHang}"?`,
  };
};

const confirmUpdateAction = async () => {
  modal.value.show = false;
  isLoading.value = true;

  try {
    // 1. Check trùng
    const isEmailChanged = editForm.value.email !== originalData.value.email;
    const isPhoneChanged =
      editForm.value.soDienThoai !== originalData.value.soDienThoai;

    if (isEmailChanged || isPhoneChanged) {
      const checkRes = await customerService.checkUnique({
        email: isEmailChanged ? editForm.value.email : null,
        sdt: isPhoneChanged ? editForm.value.soDienThoai : null,
      });
      const result = checkRes.data;

      if (
        (isEmailChanged && result.isEmailExist) ||
        (isPhoneChanged && result.isPhoneExist)
      ) {
        if (result.isEmailExist) errors.value.email = "Email đã tồn tại!";
        if (result.isPhoneExist) errors.value.soDienThoai = "SĐT đã tồn tại!";
        showToast("Thông tin bị trùng lặp!", "error");
        isLoading.value = false;
        return;
      }
    }

    // 2. Map data và Update
    const payload = { ...editForm.value };
    payload.listDiaChi = payload.listDiaChi.map((a) => ({
      id: a.id,
      thanhPho: a.provinceName,
      quan: a.districtName,
      phuong: a.wardName,
      diaChiCuThe: a.detail,
      macDinh: a.macDinh,
    }));

    await customerService.update(customerId, payload, selectedFile.value);
    showToast("Cập nhật thành công!", "success");
    setTimeout(() => router.push("/admin/customer"), 1500);
  } catch (error) {
    console.error("Lỗi update:", error);
    if (error.response && error.response.data) {
      const msg =
        typeof error.response.data === "string"
          ? error.response.data
          : error.response.data.message;
      showToast(msg || "Lỗi cập nhật", "error");
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

/* Header Simple */
.header-simple {
  margin-bottom: 25px;
}
.btn-back {
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}
.btn-back:hover {
  color: var(--primary-brown);
}

/* =========================================
   2. BODY LAYOUT (2 COLUMNS)
   ========================================= */
.body-layout-split {
  display: flex;
  gap: 60px;
}

.left-panel {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 1;
}

.panel-heading {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 25px;
}

/* =========================================
   3. LEFT PANEL STYLES (AVATAR)
   ========================================= */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}
.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-circle {
  width: 120px;
  height: 120px;
  border: 2px dashed var(--primary-brown);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  background: #f7f7f7;
  position: relative;
  transition: all 0.3s ease;
}
.avatar-circle:hover {
  box-shadow: 0 0 0 4px rgba(99, 57, 31, 0.15);
  transform: scale(1.02);
}
.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder-text {
  color: var(--primary-brown);
  font-size: 13px;
  opacity: 0.7;
  text-align: center;
}
.file-input-hidden {
  display: none;
}
.hint {
  font-size: 11px;
  color: #777;
  margin-top: 8px;
}
.name-group {
  width: 100%;
}

/* Overlay Edit Specific */
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
.avatar-overlay-edit span {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.avatar-circle:hover .avatar-overlay-edit {
  opacity: 1;
}

/* =========================================
   4. RIGHT PANEL STYLES (FORM GRID)
   ========================================= */
.right-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.btn-scan-cccd {
  background-color: #8d6e63;
  color: #fff;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-grid-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.row-duo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
  color: var(--primary-brown);
}
.req {
  color: #c0392b;
  margin-left: 3px;
}

.form-input {
  padding: 10px 15px;
  height: 45px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #fff;
  transition: all 0.2s;
  box-sizing: border-box;
  width: 100%;
}
.form-input:focus {
  border-color: var(--primary-brown);
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}
.red-border {
  border-color: #c0392b !important;
  background-color: #fff5f5;
}
.error-msg {
  color: #c0392b;
  font-size: 12px;
  font-style: italic;
  margin-top: 4px;
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}
.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
  color: var(--primary-brown);
}
.radio-item input {
  accent-color: var(--primary-brown);
  width: 16px;
  height: 16px;
}

/* =========================================
   5. ADDRESS SECTION
   ========================================= */
.address-section-wrapper {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #ddd;
}
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.section-label-v3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-brown);
  margin: 0;
}
.btn-add-address-dashed {
  background: transparent;
  border: 1.5px dashed var(--primary-brown);
  color: var(--primary-brown);
  padding: 8px 15px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  font-size: 13px;
}
.btn-add-address-dashed:hover {
  background: var(--primary-brown);
  color: #fff;
}

.address-card-v3 {
  background: #fafafa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  border: 1px solid #eee;
  transition: all 0.3s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-color: #d1d5db;
}

.address-main-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  padding-right: 36px;
  position: relative;
}
.addr-select {
  flex: 1;
  min-width: 140px;
}
.addr-input-detail {
  width: 100%;
  flex-basis: 100%;
  margin-top: 10px;
}

.btn-remove-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #ffebeb;
  color: #ff4d4f;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: -10px;
  top: 8px;
  transition: 0.2s;
}
.btn-remove-circle:hover {
  background: #ff4d4f;
  color: #fff;
}

.btn-default-pill {
  background: #fff;
  border: 1px solid var(--primary-brown);
  color: var(--primary-brown);
  padding: 6px 18px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-default-pill:hover:not(:disabled) {
  background: var(--primary-light);
}
.btn-default-pill.is-active {
  background: linear-gradient(135deg, #5a3420, #b8895d);
  color: #ffffff;
  cursor: default;
}

/* =========================================
   6. FOOTER, LOADING & MISC
   ========================================= */
.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
  border-top: 1px solid #eee;
  padding-top: 20px;
  gap: 15px;
}
.btn-cancel-clean {
  padding: 10px 24px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #64748b;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-cancel-clean:hover {
  background: #f1f5f9;
  color: #334155;
}

.btn-orange {
  background: linear-gradient(135deg, #5a3420, #b8895d);
  color: #fff;
  border: none;
  padding: 12px 40px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-orange:hover:not(:disabled) {
  background-color: #4e2c17;
  box-shadow: 0 4px 10px rgba(99, 57, 31, 0.25);
}
.btn-orange:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 50px;
  color: #666;
}
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-brown);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

/* Toast, Modal, Animations */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  min-width: 300px;
  padding: 15px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 600;
  background: #fff;
}
.toast-notification.success {
  color: #065f46;
  border-left: 5px solid #10b981;
}
.toast-notification.error {
  color: #991b1b;
  border-left: 5px solid #ef4444;
}
.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.confirm-box {
  background: #fff;
  padding: 30px;
  border-radius: 20px;
  width: 400px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: zoomIn 0.3s ease-out;
}
.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e8f5e9;
  color: #22c55e;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bounce 1s infinite;
}
.confirm-title {
  color: var(--primary-brown);
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: 700;
}
.confirm-desc {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
  font-size: 14px;
}
.confirm-actions {
  display: flex;
  gap: 15px;
}
.confirm-actions button {
  flex: 1;
  height: 42px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 14px;
}
.btn-confirm {
  background-color: #63391f;
  color: #fff;
}
.btn-confirm:hover {
  background-color: #4e2c17;
}
.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}
.btn-cancel:hover {
  background: #e2e8f0;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
.slide-down {
  animation: slideDown 0.2s ease-out;
}
@keyframes slideDown {
  from {
    transform: translateY(-5px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.form-page-animation {
  opacity: 0;
  animation: fadeInUp 0.5s forwards;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 900px) {
  .body-layout-split {
    flex-direction: column;
    gap: 30px;
  }
  .left-panel {
    flex: none;
    align-items: center;
    width: 100%;
  }
  .name-group {
    max-width: 400px;
    margin: 0 auto;
  }
  .row-duo {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>
