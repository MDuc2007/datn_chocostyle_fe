<template>
  <div class="add-employee-page">
    <div class="main-card form-page-animation">
      <div class="header-bar">
        <h2 class="title">THÊM MỚI KHÁCH HÀNG</h2>
        <button class="btn-back" @click="$router.push('/admin/customer')">
          Quay lại
        </button>
      </div>

      <div class="form-content">
        <div class="form-layout">
          <div class="left-col">
            <div class="section-header">Ảnh đại diện</div>
            <div class="avatar-wrapper">
              <label class="avatar-circle" title="Chọn ảnh đại diện">
                <img v-if="previewImage" :src="previewImage" alt="Avatar" />
                <div v-else class="placeholder-text">Chọn ảnh</div>
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
                :class="{ 'red-border': errors.tenTaiKhoan }"
                @input="clearError('tenTaiKhoan')"
              />
              <span v-if="errors.tenTaiKhoan" class="error-msg">{{
                errors.tenTaiKhoan
              }}</span>
            </div>

            <div class="form-group">
              <label>Mật khẩu <span class="req">*</span></label>
              <input
                type="password"
                v-model="newCustomer.matKhau"
                placeholder="******"
                :class="{ 'red-border': errors.matKhau }"
                @input="clearError('matKhau')"
              />
              <span v-if="errors.matKhau" class="error-msg">{{
                errors.matKhau
              }}</span>
            </div>

            <div class="form-group">
              <label>Xác nhận mật khẩu <span class="req">*</span></label>
              <input
                type="password"
                v-model="newCustomer.confirmPassword"
                placeholder="******"
                :class="{ 'red-border': errors.confirmPassword }"
                @input="clearError('confirmPassword')"
              />
              <span v-if="errors.confirmPassword" class="error-msg">{{
                errors.confirmPassword
              }}</span>
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
                :class="{ 'red-border': errors.tenKhachHang }"
                @input="clearError('tenKhachHang')"
              />
              <span v-if="errors.tenKhachHang" class="error-msg">{{
                errors.tenKhachHang
              }}</span>
            </div>

            <div class="grid-row">
              <div class="form-group">
                <label>Số điện thoại <span class="req">*</span></label>
                <input
                  v-model="newCustomer.soDienThoai"
                  placeholder="09xxxxxxxx"
                  :class="{ 'red-border': errors.soDienThoai }"
                  @input="clearError('soDienThoai')"
                />
                <span v-if="errors.soDienThoai" class="error-msg">{{
                  errors.soDienThoai
                }}</span>
              </div>
              <div class="form-group">
                <label>Giới tính</label>
                <div class="radio-group">
                  <label class="radio-item"
                    ><input
                      type="radio"
                      :value="true"
                      v-model="newCustomer.gioiTinh"
                    />
                    Nam</label
                  >
                  <label class="radio-item"
                    ><input
                      type="radio"
                      :value="false"
                      v-model="newCustomer.gioiTinh"
                    />
                    Nữ</label
                  >
                </div>
              </div>
            </div>

            <div class="grid-row">
              <div class="form-group">
                <label>Ngày sinh <span class="req">*</span></label>
                <input
                  type="date"
                  v-model="newCustomer.ngaySinh"
                  :class="{ 'red-border': errors.ngaySinh }"
                  @change="clearError('ngaySinh')"
                />
                <span v-if="errors.ngaySinh" class="error-msg">{{
                  errors.ngaySinh
                }}</span>
              </div>
              <div class="form-group">
                <label>Email liên hệ <span class="req">*</span></label>
                <input
                  v-model="newCustomer.email"
                  placeholder="example@gmail.com"
                  :class="{ 'red-border': errors.email }"
                  @input="clearError('email')"
                />
                <span v-if="errors.email" class="error-msg">{{
                  errors.email
                }}</span>
              </div>
            </div>

            <div class="address-section-wrapper">
              <div class="section-header-row">
                <h3 class="section-label-v3">Địa chỉ nhận hàng</h3>
                <button class="btn-add-address-dashed" @click="addAddressField">
                  + Thêm địa chỉ mới
                </button>
              </div>

              <div class="address-list-container">
                <div
                  v-for="(addr, index) in newCustomer.listDiaChi"
                  :key="index"
                  class="address-card-v3"
                >
                  <div class="address-main-row">
                    <select
                      v-model="addr.provinceId"
                      @change="onProvinceChange(addr)"
                      class="addr-select"
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
                      class="addr-select"
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
                      class="addr-select"
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
                      class="addr-input-detail"
                      placeholder="Số nhà, đường..."
                      @input="clearError('address')"
                    />

                    <button
                      v-if="newCustomer.listDiaChi.length > 1"
                      class="btn-remove-circle"
                      @click="removeAddressField(index)"
                    >
                      ✕
                    </button>
                  </div>

                  <div class="address-footer-row">
                    <button
                      @click="setAsDefault(index)"
                      class="btn-default-pill"
                      :class="{ 'is-active': addr.macDinh }"
                      :disabled="addr.macDinh"
                    >
                      <span v-if="addr.macDinh">✓ Mặc định</span>
                      <span v-else>Đặt mặc định</span>
                    </button>
                  </div>
                </div>
              </div>
              <span
                v-if="errors.address"
                class="error-msg"
                style="display: block; margin-top: 5px"
                >{{ errors.address }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="footer-actions">
        <button
          class="btn-cancel-clean"
          @click="$router.push('/admin/customer')"
        >
          Hủy bỏ
        </button>
        <button class="btn-orange" @click="saveCustomer">
          Lưu Thông Tin Khách Hàng
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
import { useRouter } from "vue-router";
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
    errors.value.tenKhachHang = "Trống tên";
    isValid = false;
  }
  if (!form.tenTaiKhoan?.trim()) {
    errors.value.tenTaiKhoan = "Trống tên tài khoản";
    isValid = false;
  }
  if (!form.soDienThoai) {
    errors.value.soDienThoai = "Trống SĐT";
    isValid = false;
  }
  if (!form.email?.trim()) {
    errors.value.email = "Trống Email";
    isValid = false;
  }
  if (!form.ngaySinh) {
    errors.value.ngaySinh = "Trống ngày sinh";
    isValid = false;
  }
  if (!form.matKhau) {
    errors.value.matKhau = "Trống mật khẩu";
    isValid = false;
  }
  if (form.matKhau !== form.confirmPassword) {
    errors.value.confirmPassword = "Mật khẩu không khớp";
    isValid = false;
  }

  const hasValidAddr = form.listDiaChi.some(
    (a) => a.provinceId && a.detail?.trim(),
  );
  if (!hasValidAddr) {
    errors.value.address = "Cần ít nhất 1 địa chỉ";
    isValid = false;
  }

  return isValid;
};

const clearError = (field) => {
  if (errors.value[field]) delete errors.value[field];
};

const saveCustomer = async () => {
  if (!validateForm()) {
    showToast("Vui lòng kiểm tra lại thông tin", "error");
    return;
  }
  try {
    await customerService.create(newCustomer.value, selectedFile.value);
    showToast("Thành công!");
    setTimeout(() => router.push("/admin/customer"), 1500);
  } catch (error) {
    showToast("Có lỗi xảy ra", "error");
  }
};

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => (toast.value.show = false), 3000);
};
</script>

<style scoped>
.add-employee-page {
  font-family: "Segoe UI", sans-serif;
  padding: 0;
  background-color: #f7f7f7;
  --primary-brown: #63391f;
}

.main-card {
  position: relative;
  background: #ffffff;
  padding: 30px;
  border-radius: 20px; /* Bo tròn khung chính */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); /* Thêm bóng đổ nhẹ cho sang */
  max-width: 1200px;
  margin: 0 auto;
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
}
.btn-back {
  border: none;
  background: none;
  color: var(--primary-brown);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 600;
}

.form-layout {
  display: flex;
  gap: 40px;
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

/* AVATAR STYLE */
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
  transition: 0.2s;
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

/* INPUT & SELECT STYLE */
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

input,
select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #fff;
  transition: 0.2s;
}
input:focus,
select:focus {
  border-color: var(--primary-brown);
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}

/* ĐỊA CHỈ NGẮN LẠI */
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
}
.address-main-row {
  position: relative; /* neo để gắn nút X */
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  padding-right: 36px; /* chừa chỗ sẵn cho nút X */
}

.addr-select {
  flex: 1;
  min-width: 0;
}

.addr-input-detail {
  flex: 1;
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
}
.btn-remove-circle:hover {
  background: #ff4d4f;
  color: #fff;
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
}
.btn-default-pill.is-active {
  background: var(--primary-brown);
  color: #ffffff;
}

/* UTILS */
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
.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
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
}
.btn-orange {
  background-color: var(--primary-brown);
  color: #fff;
  border: none;
  padding: 12px 40px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.error-msg {
  color: #c0392b;
  font-size: 12px;
  font-style: italic;
  margin-top: 4px;
}
.red-border {
  border-color: #c0392b !important;
}

/* TOAST */
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
</style>
