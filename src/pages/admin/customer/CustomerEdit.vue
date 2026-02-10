<template>
  <div class="add-employee-page">
    <div class="main-card form-page-animation">
      <div class="header-bar">
        <h2 class="title">CẬP NHẬT THÔNG TIN KHÁCH HÀNG</h2>
        <button
          class="btn-back hover-effect"
          @click="$router.push('/admin/customer')"
        >
          <i class="fa fa-arrow-left"></i> Quay lại
        </button>
      </div>

      <div v-if="loadingData" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div class="form-content" v-else>
        <div class="form-layout">
          <div class="left-col">
            <div class="section-header">Ảnh đại diện</div>
            <div class="avatar-wrapper">
              <label
                class="avatar-circle hover-scale"
                title="Thay đổi ảnh đại diện"
              >
                <img v-if="previewImage" :src="previewImage" alt="Avatar" />
                <div v-else class="placeholder-text">Chọn ảnh</div>

                <div class="avatar-overlay">
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

            <div class="form-group">
              <label>Mã khách hàng</label>
              <input
                :value="editForm.maKhachHang"
                readonly
                class="input-disabled"
              />
            </div>
            <div class="form-group">
              <label>Tên tài khoản</label>
              <input
                v-model="editForm.tenTaiKhoan"
                readonly
                class="input-disabled"
              />
            </div>

            <div class="form-group">
              <label
                >Mật khẩu mới
                <span class="sub-label">(Bỏ trống nếu không đổi)</span></label
              >
              <input
                type="password"
                v-model="editForm.matKhau"
                placeholder="******"
                class="form-input"
                :class="{ 'red-border': errors.matKhau }"
                @input="clearError('matKhau')"
              />
              <span v-if="errors.matKhau" class="error-msg slide-down">{{
                errors.matKhau
              }}</span>
            </div>

            <div class="form-group" v-if="editForm.matKhau">
              <label>Xác nhận mật khẩu mới <span class="req">*</span></label>
              <input
                type="password"
                v-model="editForm.confirmPassword"
                placeholder="******"
                class="form-input"
                :class="{ 'red-border': errors.confirmPassword }"
                @input="clearError('confirmPassword')"
              />
              <span
                v-if="errors.confirmPassword"
                class="error-msg slide-down"
                >{{ errors.confirmPassword }}</span
              >
            </div>
          </div>

          <div class="right-col">
            <div class="section-header">Thông tin cá nhân</div>

            <div class="form-group">
              <label>Họ và tên <span class="req">*</span></label>
              <input
                type="text"
                v-model="editForm.tenKhachHang"
                placeholder="Nhập họ tên khách hàng"
                class="form-input"
                :class="{ 'red-border': errors.tenKhachHang }"
                @input="clearError('tenKhachHang')"
              />
              <span v-if="errors.tenKhachHang" class="error-msg slide-down">{{
                errors.tenKhachHang
              }}</span>
            </div>

            <div class="grid-row">
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
                    Nam
                  </label>
                  <label class="radio-item">
                    <input
                      type="radio"
                      :value="false"
                      v-model="editForm.gioiTinh"
                    />
                    Nữ
                  </label>
                </div>
              </div>
            </div>

            <div class="grid-row">
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
              <div class="form-group">
                <label>Email liên hệ <span class="req">*</span></label>
                <input
                  v-model="editForm.email"
                  placeholder="example@gmail.com"
                  class="form-input"
                  :class="{ 'red-border': errors.email }"
                  @input="clearError('email')"
                />
                <span v-if="errors.email" class="error-msg slide-down">{{
                  errors.email
                }}</span>
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
          @click="handleUpdate"
          :disabled="isLoading || loadingData"
          :class="{ 'btn-loading': isLoading }"
        >
          <span v-if="isLoading"
            ><i class="fa fa-spinner fa-spin"></i> Đang xử lý...</span
          >
          <span v-else>Cập Nhật Thông Tin</span>
        </button>
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
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { customerService } from "../../../services/customerService";

const router = useRouter();
const route = useRoute();
const customerId = route.params.id;

// --- STATE ---
const loadingData = ref(true);
const isLoading = ref(false); // Loading khi bấm nút Lưu
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
  matKhau: "", // Mật khẩu mới (optional)
  confirmPassword: "",
  listDiaChi: [],
});

// Dùng để so sánh sự thay đổi khi check trùng
const originalData = ref({});

const errors = ref({});
const toast = ref({ show: false, message: "", type: "success" });

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
    editForm.value = { ...data, matKhau: "", confirmPassword: "" }; // Reset mật khẩu khi load
    if (data.avatarFullUrl) previewImage.value = data.avatarFullUrl;

    // Lưu lại dữ liệu gốc để so sánh khi check trùng
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

// --- LOGIC ĐỊA CHỈ (Giữ nguyên) ---
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

// --- VALIDATION (LOGIC TƯƠNG ĐỒNG CREATE) ---
const validateForm = () => {
  errors.value = {};
  let isValid = true;
  const form = editForm.value;

  // 1. Họ tên
  if (!form.tenKhachHang?.trim()) {
    errors.value.tenKhachHang = "Vui lòng nhập họ và tên";
    isValid = false;
  } else if (form.tenKhachHang.length < 2 || form.tenKhachHang.length > 50) {
    errors.value.tenKhachHang = "Họ tên phải từ 2 đến 50 ký tự";
    isValid = false;
  }

  // 2. Số điện thoại
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!form.soDienThoai) {
    errors.value.soDienThoai = "Vui lòng nhập số điện thoại";
    isValid = false;
  } else if (!phoneRegex.test(form.soDienThoai)) {
    errors.value.soDienThoai = "Số điện thoại không hợp lệ";
    isValid = false;
  }

  // 3. Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email?.trim()) {
    errors.value.email = "Vui lòng nhập Email";
    isValid = false;
  } else if (!emailRegex.test(form.email)) {
    errors.value.email = "Email không đúng định dạng";
    isValid = false;
  }

  // 4. Ngày sinh
  if (!form.ngaySinh) {
    errors.value.ngaySinh = "Vui lòng chọn ngày sinh";
    isValid = false;
  } else {
    const today = new Date();
    const birthDate = new Date(form.ngaySinh);
    if (birthDate >= today) {
      errors.value.ngaySinh = "Ngày sinh phải nhỏ hơn ngày hiện tại";
      isValid = false;
    }
  }

  // 5. Mật khẩu (LOGIC KHÁC: Chỉ check khi có nhập)
  if (form.matKhau && form.matKhau.trim() !== "") {
    if (form.matKhau.length < 6) {
      errors.value.matKhau = "Mật khẩu mới phải có ít nhất 6 ký tự";
      isValid = false;
    }
    if (form.matKhau !== form.confirmPassword) {
      errors.value.confirmPassword = "Mật khẩu xác nhận không khớp";
      isValid = false;
    }
  }

  // 6. Địa chỉ
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

// --- HANDLE UPDATE (GỘP CHECK TRÙNG) ---
const handleUpdate = async () => {
  if (!validateForm()) {
    showToast("Vui lòng kiểm tra lại thông tin", "error");
    return;
  }

  isLoading.value = true;

  // 1. Check trùng (Chỉ check nếu có thay đổi)
  try {
    const isEmailChanged = editForm.value.email !== originalData.value.email;
    const isPhoneChanged =
      editForm.value.soDienThoai !== originalData.value.soDienThoai;

    // Nếu có thay đổi mới gọi API
    if (isEmailChanged || isPhoneChanged) {
      const checkRes = await customerService.checkUnique({
        email: isEmailChanged ? editForm.value.email : null,
        sdt: isPhoneChanged ? editForm.value.soDienThoai : null,
        // Không check username khi update
      });

      const result = checkRes.data;
      let hasDuplicate = false;

      if (isEmailChanged && result.isEmailExist) {
        errors.value.email = "Email này đã thuộc về người khác!";
        hasDuplicate = true;
      }
      if (isPhoneChanged && result.isPhoneExist) {
        errors.value.soDienThoai = "Số điện thoại này đã tồn tại!";
        hasDuplicate = true;
      }

      if (hasDuplicate) {
        showToast("Thông tin bị trùng lặp!", "error");
        isLoading.value = false;
        return;
      }
    }
  } catch (e) {
    console.log("Lỗi check trùng (bỏ qua):", e);
  }

  // 2. Gọi API Update
  try {
    const payload = { ...editForm.value };
    // Map lại địa chỉ cho chắc chắn
    payload.listDiaChi = payload.listDiaChi.map((a) => ({
      id: a.id, // ID cũ nếu có
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

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => (toast.value.show = false), 3000);
};
</script>

<style scoped>
/* =========================================
   1. GLOBAL & VARIABLES
   ========================================= */
.add-employee-page {
  font-family: "Segoe UI", sans-serif;
  padding: 0;
  background-color: #f7f7f7;
  --primary-brown: #63391f;
  --primary-light: #fdf8f6;
  --text-main: #484848;
  --border-color: #e0e0e0;
  --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.08);
  min-height: 100vh;
}

/* Keyframes */
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
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
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

.form-page-animation {
  opacity: 0;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.slide-down {
  animation: slideDown 0.2s ease-out;
}

/* =========================================
   2. LAYOUT
   ========================================= */
.main-card {
  position: relative;
  background: #ffffff;
  padding: 30px;
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  transition: box-shadow 0.3s ease;
}
.main-card:hover {
  box-shadow: var(--shadow-md);
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}
.title {
  font-size: 22px;
  color: var(--primary-brown);
  font-weight: 700;
  text-transform: uppercase;
}

.btn-back {
  border: none;
  background: none;
  color: var(--primary-brown);
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.form-layout {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}
.left-col {
  width: 300px;
  border-right: 1px solid #eee;
  padding-right: 30px;
  flex-shrink: 0;
}
.right-col {
  flex-grow: 1;
}

.section-header {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-brown);
  border-left: 4px solid var(--primary-brown);
  padding-left: 10px;
}

/* =========================================
   3. AVATAR & INPUTS
   ========================================= */
.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
}
.avatar-circle {
  width: 130px;
  height: 130px;
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
}
.file-input-hidden {
  display: none;
}
.hint {
  font-size: 11px;
  color: #777;
  margin-top: 8px;
}

/* Overlay Effect */
.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}
.avatar-overlay span {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.avatar-circle:hover .avatar-overlay {
  opacity: 1;
}

/* Inputs */
.form-group {
  margin-bottom: 18px;
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
.sub-label {
  font-weight: normal;
  font-size: 11px;
  color: #777;
}

.form-input,
.addr-select,
.addr-input-detail {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #fff;
}
.form-input:focus,
.addr-select:focus,
.addr-input-detail:focus {
  border-color: var(--primary-brown);
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}

.input-disabled {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  background-color: #f3f3f3;
  color: #888;
  cursor: not-allowed;
}

.error-msg {
  color: #c0392b;
  font-size: 12px;
  font-style: italic;
  margin-top: 4px;
}
.red-border {
  border-color: #c0392b !important;
  background-color: #fff5f5;
}

/* Radio & Grid */
.grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}
.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
  color: var(--primary-brown);
}

/* =========================================
   4. ADDRESS SECTION
   ========================================= */
.address-section-wrapper {
  margin-top: 30px;
}
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.section-label-v3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary-brown);
  margin: 0;
}

.btn-add-address-dashed {
  background: transparent;
  border: 1.5px dashed var(--primary-brown);
  color: var(--primary-brown);
  padding: 6px 15px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-add-address-dashed:hover {
  background: var(--primary-brown);
  color: #fff;
}

.address-card-v3 {
  background: #fcfcfc;
  border-radius: 12px;
  padding: 15px;
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
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  padding-right: 36px;
  position: relative;
}
.addr-select,
.addr-input-detail {
  flex: 1;
  min-width: 0;
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
  flex-shrink: 0;
  position: absolute;
  right: 0;
  top: 5px;
  transition: 0.2s;
}
.btn-remove-circle:hover {
  background: #ff4d4f;
  color: #fff;
  transform: scale(1.1);
}

.btn-default-pill {
  background: #fff;
  border: 1px solid var(--primary-brown);
  color: var(--primary-brown);
  padding: 5px 18px;
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
  background: var(--primary-brown);
  color: #ffffff;
  cursor: default;
}

/* =========================================
   5. FOOTER & LOADING
   ========================================= */
.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
  gap: 15px;
}

.hover-effect:active {
  transform: scale(0.96);
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
  background-color: var(--primary-brown);
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

/* Toast */
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
}
.toast-notification.success {
  background: #ecfdf5;
  color: #065f46;
  border-left: 5px solid #10b981;
}
.toast-notification.error {
  background: #fef2f2;
  color: #991b1b;
  border-left: 5px solid #ef4444;
}
.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
}

/* Transitions */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}
.list-anim-enter-active,
.list-anim-leave-active {
  transition: all 0.3s ease;
}
.list-anim-enter-from,
.list-anim-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
