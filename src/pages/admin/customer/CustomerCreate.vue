<template>
  <div class="add-employee-page">
    <div class="main-card form-page-animation">
      <div class="header-bar">
        <h2 class="title">THÊM MỚI KHÁCH HÀNG</h2>
        <button
          class="btn-back hover-effect"
          @click="$router.push('/admin/customer')"
        >
          <i class="fa fa-arrow-left"></i> Quay lại
        </button>
      </div>

      <div class="form-content">
        <div class="form-layout">
          <div class="left-col">
            <div class="section-header">Ảnh đại diện</div>
            <div class="avatar-wrapper">
              <label
                class="avatar-circle hover-scale"
                title="Chọn ảnh đại diện"
              >
                <img v-if="previewImage" :src="previewImage" alt="Avatar" />
                <div v-else class="placeholder-text">
                  <i class="fa fa-camera"></i><br />Chọn ảnh
                </div>

                <div class="avatar-overlay">
                  <span>Tải ảnh</span>
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
              <label>Tên tài khoản <span class="req">*</span></label>
              <input
                v-model="newCustomer.tenTaiKhoan"
                placeholder="Username..."
                class="form-input"
                :class="{ 'red-border': errors.tenTaiKhoan }"
                @input="clearError('tenTaiKhoan')"
              />
              <span v-if="errors.tenTaiKhoan" class="error-msg slide-down">{{
                errors.tenTaiKhoan
              }}</span>
            </div>

            <div class="form-group">
              <label>Mật khẩu <span class="req">*</span></label>
              <input
                type="password"
                v-model="newCustomer.matKhau"
                placeholder="******"
                class="form-input"
                :class="{ 'red-border': errors.matKhau }"
                @input="clearError('matKhau')"
              />
              <span v-if="errors.matKhau" class="error-msg slide-down">{{
                errors.matKhau
              }}</span>
            </div>

            <div class="form-group">
              <label>Xác nhận mật khẩu <span class="req">*</span></label>
              <input
                type="password"
                v-model="newCustomer.confirmPassword"
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
                v-model="newCustomer.tenKhachHang"
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
                  v-model="newCustomer.soDienThoai"
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
                      v-model="newCustomer.gioiTinh"
                    />
                    <span>Nam</span>
                  </label>
                  <label class="radio-item">
                    <input
                      type="radio"
                      :value="false"
                      v-model="newCustomer.gioiTinh"
                    />
                    <span>Nữ</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="grid-row">
              <div class="form-group">
                <label>Ngày sinh <span class="req">*</span></label>
                <input
                  type="date"
                  v-model="newCustomer.ngaySinh"
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
                  v-model="newCustomer.email"
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
                    v-for="(addr, index) in newCustomer.listDiaChi"
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
                        v-if="newCustomer.listDiaChi.length > 1"
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
          @click="handleSaveClick"
          :disabled="isLoading"
          :class="{ 'btn-loading': isLoading }"
        >
          <span v-if="isLoading"
            ><i class="fa fa-spinner fa-spin"></i> Đang xử lý...</span
          >
          <span v-else>Lưu Thông Tin Khách Hàng</span>
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
          <button class="btn-confirm hover-effect" @click="confirmSaveAction">
            Xác nhận lưu
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { customerService } from "../../../services/customerService";

const router = useRouter();

// --- 1. Thêm biến modal vào phần khai báo STATE (dưới dòng const toast = ...) ---
const modal = ref({ show: false, title: "", message: "" });

// --- 2. Thêm hàm mới: Xử lý khi ấn nút "Lưu" (Thay thế việc gọi saveCustomer trực tiếp) ---
const handleSaveClick = () => {
  // Validate trước, nếu sai thì báo lỗi và dừng luôn, không hiện modal
  if (!validateForm()) {
    showToast("Vui lòng kiểm tra lại thông tin nhập", "error");
    return;
  }

  // Nếu dữ liệu ok, thì hiện modal xác nhận
  modal.value = {
    show: true,
    title: "Xác nhận thêm mới",
    message: `Bạn có chắc chắn muốn thêm khách hàng "${newCustomer.value.tenKhachHang}" vào hệ thống?`,
  };
};

// --- 3. Sửa hàm saveCustomer cũ thành hàm xử lý sau khi đã Đồng Ý ---
// (Đổi tên hàm cũ saveCustomer -> confirmSaveAction hoặc giữ nguyên logic bên trong nhưng bỏ đoạn validate đi vì đã làm ở bước trên)
const confirmSaveAction = async () => {
  // Đóng modal trước
  modal.value.show = false;

  isLoading.value = true;

  try {
    await customerService.create(newCustomer.value, selectedFile.value);
    showToast("Thêm khách hàng thành công!", "success");
    setTimeout(() => router.push("/admin/customer"), 1500);
  } catch (error) {
    console.error("Lỗi lưu:", error);
    // ... (Giữ nguyên phần xử lý lỗi cũ của bạn) ...
    if (error.response && error.response.data) {
      // logic lỗi cũ
      showToast("Có lỗi xảy ra", "error");
    }
  } finally {
    isLoading.value = false;
  }
};

// Hàm đóng modal
const closeModal = () => (modal.value.show = false);
// --- STATE ---
const previewImage = ref(null);
const selectedFile = ref(null);
const listProvinces = ref([]);
const errors = ref({});
const toast = ref({ show: false, message: "", type: "success" });
const isLoading = ref(false);

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
      provinceId: null,
      districtId: null,
      wardCode: null,
      provinceName: "",
      districtName: "",
      wardName: "",
      detail: "",
      districtOptions: [],
      wardOptions: [],
      macDinh: true,
    },
  ],
});

onMounted(() => {
  fetchProvinces();
});

const saveCustomer = async () => {
  if (!validateForm()) {
    showToast("Vui lòng kiểm tra lại thông tin nhập", "error");
    return;
  }

  isLoading.value = true;

  try {
    await customerService.create(newCustomer.value, selectedFile.value);
    showToast("Thêm khách hàng thành công!", "success");
    setTimeout(() => router.push("/admin/customer"), 1500);
  } catch (error) {
    console.error("Lỗi lưu:", error);
    if (error.response && error.response.data) {
      if (typeof error.response.data === "object") {
        errors.value = error.response.data;
        showToast("Dữ liệu không hợp lệ", "error");
      } else {
        showToast(error.response.data, "error");
      }
    } else {
      showToast("Có lỗi xảy ra khi lưu dữ liệu", "error");
    }
  } finally {
    isLoading.value = false;
  }
};

const fetchProvinces = async () => {
  try {
    const res = await axios.get("https://provinces.open-api.vn/api/?depth=1");
    listProvinces.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

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
  newCustomer.value.listDiaChi.push({
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
      showToast("Ảnh quá lớn (< 5MB)", "error");
      return;
    }
    selectedFile.value = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

const validateForm = () => {
  errors.value = {};
  let isValid = true;
  const form = newCustomer.value;

  if (!form.tenKhachHang?.trim()) {
    errors.value.tenKhachHang = "Vui lòng nhập họ và tên";
    isValid = false;
  } else if (form.tenKhachHang.length < 2 || form.tenKhachHang.length > 50) {
    errors.value.tenKhachHang = "Họ tên phải từ 2 đến 50 ký tự";
    isValid = false;
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!form.tenTaiKhoan?.trim()) {
    errors.value.tenTaiKhoan = "Vui lòng nhập tên tài khoản";
    isValid = false;
  } else if (!usernameRegex.test(form.tenTaiKhoan)) {
    errors.value.tenTaiKhoan =
      "Tài khoản không được chứa dấu hoặc khoảng trắng";
    isValid = false;
  } else if (form.tenTaiKhoan.length < 5) {
    errors.value.tenTaiKhoan = "Tên tài khoản phải từ 5 ký tự trở lên";
    isValid = false;
  }

  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!form.soDienThoai) {
    errors.value.soDienThoai = "Vui lòng nhập số điện thoại";
    isValid = false;
  } else if (!phoneRegex.test(form.soDienThoai)) {
    errors.value.soDienThoai = "Số điện thoại không hợp lệ (VD: 0912345678)";
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
      errors.value.ngaySinh = "Ngày sinh phải nhỏ hơn ngày hiện tại";
      isValid = false;
    }
  }

  if (!form.matKhau) {
    errors.value.matKhau = "Vui lòng nhập mật khẩu";
    isValid = false;
  } else if (form.matKhau.length < 6) {
    errors.value.matKhau = "Mật khẩu phải có ít nhất 6 ký tự";
    isValid = false;
  }

  if (form.matKhau && form.matKhau !== form.confirmPassword) {
    errors.value.confirmPassword = "Mật khẩu nhập lại không khớp";
    isValid = false;
  }

  const hasValidAddr = form.listDiaChi.some(
    (a) => a.provinceId && a.districtId && a.wardCode && a.detail?.trim(),
  );
  if (form.listDiaChi.length === 0 || !hasValidAddr) {
    errors.value.address =
      "Vui lòng nhập đầy đủ địa chỉ (Tỉnh, Huyện, Xã, Chi tiết)";
    isValid = false;
  }

  return isValid;
};

const clearError = (field) => {
  if (errors.value[field]) delete errors.value[field];
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
  gap: 6px;
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

.form-input,
.addr-select,
.addr-input-detail {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #fff;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.form-input:focus,
.addr-select:focus,
.addr-input-detail:focus {
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
   5. FOOTER ACTIONS
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

/* =========================================
   6. MODAL STYLES (Thêm mới)
   ========================================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4); /* Màn hình tối đi */
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
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: zoomIn 0.3s ease-out;
}

/* Icon dấu chấm hỏi màu xanh dương hoặc cam tuỳ ý */
.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e8f5e9;
  color: #22c55e;
  margin: 0 auto 20px auto;
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
  background-color: #63391f; /* <-- THÊM DÒNG NÀY (Mã màu nâu của bạn) */
  color: #fff;
}
.btn-confirm:hover {
  background-color: #4e2c17; /* Màu nâu đậm hơn khi di chuột */
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}
.btn-cancel:hover {
  background: #e2e8f0;
}

/* Animations cho Modal */
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
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.2s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
</style>
