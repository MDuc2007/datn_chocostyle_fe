<template>
  <div class="add-employee-page">
    <div class="main-card form-page-animation">
      <div class="header-bar">
        <h2 class="title">CẬP NHẬT THÔNG TIN KHÁCH HÀNG</h2>
        <button class="btn-back" @click="$router.push('/admin/customer')">
          Quay lại
        </button>
      </div>
      <div class="form-content" v-if="!loadingData">
        <div class="form-layout">
          <div class="left-col">
            <div class="section-header">Ảnh đại diện</div>
            <div class="avatar-wrapper">
              <label class="avatar-circle" title="Thay đổi ảnh đại diện">
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
          </div>

          <div class="right-col">
            <div class="section-header">Thông tin cá nhân</div>

            <div class="form-group">
              <div class="label-flex">
                <label>Họ và tên <span class="req">*</span></label>
                <span v-if="errors.tenKhachHang" class="error-msg">{{
                  errors.tenKhachHang
                }}</span>
              </div>
              <input
                type="text"
                v-model="editForm.tenKhachHang"
                placeholder="Nhập họ tên khách hàng"
                :class="{ 'red-border': errors.tenKhachHang }"
                @input="clearError('tenKhachHang')"
              />
            </div>

            <div class="grid-row">
              <div class="form-group">
                <div class="label-flex">
                  <label>Số điện thoại <span class="req">*</span></label>
                  <span v-if="errors.soDienThoai" class="error-msg">{{
                    errors.soDienThoai
                  }}</span>
                </div>
                <input
                  type="text"
                  v-model="editForm.soDienThoai"
                  placeholder="09xxxxxxxx"
                  :class="{ 'red-border': errors.soDienThoai }"
                  @input="clearError('soDienThoai')"
                />
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
                <div class="label-flex">
                  <label>Ngày sinh <span class="req">*</span></label>
                  <span v-if="errors.ngaySinh" class="error-msg">{{
                    errors.ngaySinh
                  }}</span>
                </div>
                <input
                  type="date"
                  v-model="editForm.ngaySinh"
                  :class="{ 'red-border': errors.ngaySinh }"
                  @change="clearError('ngaySinh')"
                />
              </div>
              <div class="form-group">
                <div class="label-flex">
                  <label>Email liên hệ <span class="req">*</span></label>
                  <span v-if="errors.email" class="error-msg">{{
                    errors.email
                  }}</span>
                </div>
                <input
                  type="email"
                  v-model="editForm.email"
                  placeholder="example@gmail.com"
                  :class="{ 'red-border': errors.email }"
                  @input="clearError('email')"
                />
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
                  v-for="(addr, index) in editForm.listDiaChi"
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
                      v-if="editForm.listDiaChi.length > 1"
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

      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu khách hàng...</p>
      </div>

      <div class="footer-actions">
        <button
          class="btn-orange"
          @click="handleUpdate"
          :disabled="loadingData"
        >
          Cập Nhật Thông Tin
        </button>
      </div>
    </div>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        {{ toast.message }}
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

const loadingData = ref(true);
const listProvinces = ref([]);
const previewImage = ref(null);
const selectedFile = ref(null);
const editForm = ref({ listDiaChi: [] });
const errors = ref({});
const toast = ref({ show: false, message: "", type: "success" });

onMounted(async () => {
  const pRes = await axios.get("https://provinces.open-api.vn/api/?depth=1");
  listProvinces.value = pRes.data;

  try {
    const data = await customerService.getByIdForEdit(customerId);
    editForm.value = data;
    if (data.avatarFullUrl) previewImage.value = data.avatarFullUrl;
  } catch (e) {
    showToast("Không thể tải thông tin", "error");
  } finally {
    loadingData.value = false;
  }
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

const onProvinceChange = async (addr) => {
  addr.districtId = null;
  addr.wardCode = null;
  const res = await axios.get(
    `https://provinces.open-api.vn/api/p/${addr.provinceId}?depth=2`,
  );
  addr.districtOptions = res.data.districts;
  addr.provinceName =
    listProvinces.value.find((p) => p.code === addr.provinceId)?.name || "";
};

const onDistrictChange = async (addr) => {
  addr.wardCode = null;
  const res = await axios.get(
    `https://provinces.open-api.vn/api/d/${addr.districtId}?depth=2`,
  );
  addr.wardOptions = res.data.wards;
  addr.districtName =
    addr.districtOptions.find((d) => d.code === addr.districtId)?.name || "";
};

const onWardChange = (addr) => {
  addr.wardName =
    addr.wardOptions.find((w) => w.code === addr.wardCode)?.name || "";
};

const addAddressField = () =>
  editForm.value.listDiaChi.push({
    provinceId: null,
    macDinh: false,
    districtOptions: [],
    wardOptions: [],
  });

const removeAddressField = (i) => {
  if (editForm.value.listDiaChi.length > 1) {
    const wasDefault = editForm.value.listDiaChi[i].macDinh;
    editForm.value.listDiaChi.splice(i, 1);
    if (wasDefault) editForm.value.listDiaChi[0].macDinh = true;
  }
};

const setAsDefault = (i) =>
  editForm.value.listDiaChi.forEach((a, idx) => (a.macDinh = idx === i));

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

const validateForm = () => {
  errors.value = {};
  let isValid = true;
  const form = editForm.value;

  if (!form.tenKhachHang?.trim()) {
    errors.value.tenKhachHang = "Trống tên";
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

  const hasValidAddr = form.listDiaChi.some(
    (a) => a.provinceId && a.detail?.trim(),
  );
  if (!hasValidAddr) {
    errors.value.address = "Cần ít nhất 1 địa chỉ";
    isValid = false;
  }

  return isValid;
};

const clearError = (field) => delete errors.value[field];

const handleUpdate = async () => {
  if (!validateForm()) return;
  try {
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
    showToast("Thành công!");
    setTimeout(() => router.push("/admin/customer"), 1500);
  } catch (error) {
    showToast("Lỗi cập nhật", "error");
  }
};

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => (toast.value.show = false), 3000);
};
</script>
<style scoped>
/* THIẾT LẬP MÀU CHOCOSTYLE */
.add-employee-page {
  font-family: "Segoe UI", sans-serif;
  background-color: #f7f7f7;
  min-height: 100vh;
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
}
.title {
  font-size: 20px;
  color: #63391f;
  font-weight: 700;
}
.btn-back {
  border: none;
  background: none;
  color: #63391f;
  cursor: pointer;
  text-decoration: underline;
  font-weight: 600;
}

.form-layout {
  display: flex;
  gap: 40px;
}
.left-col {
  width: 280px;
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
  color: #63391f;
  border-left: 4px solid #63391f;
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
  width: 140px;
  height: 140px;
  border: 2px dashed #63391f;
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
  color: #63391f;
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

/* INPUT & SELECT STYLE - BO TRÒN MẠNH HƠN */
.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 13px;
  color: #63391f;
}
.req {
  color: #c0392b;
  margin-left: 3px;
}

input,
select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 10px; /* Tăng bo tròn ô nhập liệu */
  font-size: 14px;
  outline: none;
  background: #fff;
  transition: all 0.2s;
}
input:focus,
select:focus {
  border-color: #63391f;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}
.input-disabled {
  background-color: #f9f9f9;
  color: #999;
  cursor: not-allowed;
}

/* PHẦN ĐỊA CHỈ - LÀM NGẮN LẠI */
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
  color: #63391f;
  margin: 0;
}

.btn-add-address-dashed {
  background: transparent;
  border: 1.5px dashed #63391f;
  color: #63391f;
  padding: 6px 15px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.address-card-v3 {
  background: #fcfcfc;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #eee;
}

/* Điều chỉnh flex để các ô select ngắn lại và ô detail vừa vặn */
.address-main-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap; /* Cho phép rớt dòng nếu màn hình nhỏ */
}

.addr-select {
  flex: 1;
  min-width: 0;
}

.addr-input-detail {
  flex: 1;
}

.addr-input-detail {
  flex: 1; /* Ô chi tiết sẽ chiếm phần còn lại nhưng không quá dài */
  min-width: 200px;
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

.btn-default-pill {
  background: #fff;
  border: 1px solid #63391f;
  color: #63391f;
  padding: 5px 18px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn-default-pill.is-active {
  background: #63391f;
  color: #ffffff;
  border-color: #63391f;
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
  color: #63391f;
}
.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}
.btn-orange {
  background-color: #63391f;
  color: #fff;
  border: none;
  padding: 12px 40px;
  border-radius: 10px; /* Bo tròn nút bấm */
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-orange:hover {
  opacity: 0.9;
}

.error-msg {
  color: #c0392b;
  font-size: 12px;
  font-style: italic;
}
.red-border {
  border-color: #c0392b !important;
}
</style>
