<template>
  <div class="edit-employee-page">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="toast"
          :class="notif.type"
        >
          <span v-if="notif.type === 'success'" style="font-size: 18px"></span>
          <span v-if="notif.type === 'error'" style="font-size: 18px"></span>
          <span v-if="notif.type === 'warning'" style="font-size: 18px"></span>

          <span class="toast-msg">{{ notif.message }}</span>
        </div>
      </TransitionGroup>
    </div>

    <div class="header-bar">
      <h2 class="title">Nhân viên / Cập nhật nhân viên</h2>
      <button class="btn-back" @click="goBack">Quay lại</button>
    </div>

    <div class="main-card">
      <div class="form-layout">
        <div class="left-col">
          <h3 class="section-header">Thông tin nhân viên</h3>

          <div class="avatar-wrapper">
            <div class="avatar-circle" @click="triggerFileInput">
              <img v-if="form.avatar" :src="form.avatar" alt="Avatar Preview" />
              <span v-else class="placeholder-text">Chọn ảnh</span>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload"
                accept="image/*"
                class="file-input-hidden"
              />
            </div>
            <p class="hint">Nhấn vào hình để thay đổi ảnh</p>
          </div>

          <div class="form-group">
            <label>Mã nhân viên</label>
            <input v-model="form.maNv" disabled class="input-disabled" />
          </div>

          <div class="form-group">
            <div class="label-flex">
              <label>Họ Và Tên <span class="req">*</span></label>
              <span v-if="errors.hoTen" class="error-msg">{{
                errors.hoTen
              }}</span>
            </div>
            <input
              v-model="form.hoTen"
              :class="{ 'red-border': errors.hoTen }"
            />

            <div class="timestamp-info">
              <p>
                📅 Ngày tạo: <span>{{ formatDate(form.ngayTao) }}</span>
              </p>
              <p>
                🔄 Cập nhật lần cuối:
                <span>{{
                  form.ngayCapNhat
                    ? formatDate(form.ngayCapNhat)
                    : "Chưa cập nhật"
                }}</span>
              </p>
              <p>
                💼 Ngày vào làm:
                <span style="color: #2980b9">{{
                  formatDateVN(form.ngayVaoLam)
                }}</span>
              </p>
            </div>
          </div>
        </div>

        <div class="right-col">
          <h3 class="section-header">Thông tin chi tiết</h3>

          <div class="grid-row">
            <div class="form-group">
              <div class="label-flex">
                <label>Email <span class="req">*</span></label>
                <span v-if="errors.email" class="error-msg">{{
                  errors.email
                }}</span>
              </div>
              <input
                v-model="form.email"
                :class="{ 'red-border': errors.email }"
              />
            </div>

            <div class="form-group">
              <div class="label-flex">
                <label>Ngày sinh <span class="req">*</span></label>
                <span v-if="errors.ngaySinh" class="error-msg">{{
                  errors.ngaySinh
                }}</span>
              </div>
              <input
                type="date"
                v-model="form.ngaySinh"
                :class="{ 'red-border': errors.ngaySinh }"
              />
            </div>
          </div>

          <div class="grid-row">
            <div class="form-group">
              <div class="label-flex">
                <label>Số Điện Thoại <span class="req">*</span></label>
                <span v-if="errors.sdt" class="error-msg">{{
                  errors.sdt
                }}</span>
              </div>
              <input v-model="form.sdt" :class="{ 'red-border': errors.sdt }" />
            </div>

            <div class="form-group">
              <label>Giới tính <span class="req">*</span></label>
              <div class="radio-group">
                <label class="radio-item"
                  ><input type="radio" :value="true" v-model="form.gioiTinh" />
                  Nam</label
                >
                <label class="radio-item"
                  ><input type="radio" :value="false" v-model="form.gioiTinh" />
                  Nữ</label
                >
              </div>
            </div>
          </div>

          <div class="grid-row">
            <!-- <div class="form-group">
              <label>Chức vụ</label>
              <select v-model="form.vaiTro">
                <option value="Nhân viên">Nhân viên</option>
                <option value="Nhân viên bán hàng">Nhân viên bán hàng</option>
                <option value="Quản lý">Quản lý</option>
                <option value="Thủ kho">Thủ kho</option>
              </select>
            </div> -->
<!-- 
            <div class="form-group">
              <label>Trạng thái</label>
              <select v-model="form.trangThai" class="status-select">
                <option :value="1">Đang làm việc</option>
                <option :value="0">Đã nghỉ việc</option>
                <option :value="2">Đã khóa</option>
              </select>
            </div> -->
          </div>

          <div class="grid-row-3">
            <div class="form-group">
              <label>Tỉnh/Thành phố <span class="req">*</span></label>
              <select
                v-model="selectedCity"
                @change="onCityChange"
                :class="{ 'red-border': errors.tinhThanh }"
              >
                <option :value="null">Chọn Tỉnh/TP</option>
                <option v-for="c in listCity" :key="c.code" :value="c">
                  {{ c.name }}
                </option>
              </select>
              <span v-if="errors.tinhThanh" class="error-msg">{{
                errors.tinhThanh
              }}</span>
            </div>
            <div class="form-group">
              <label>Quận/Huyện <span class="req">*</span></label>
              <select
                v-model="selectedDistrict"
                @change="onDistrictChange"
                :class="{ 'red-border': errors.quanHuyen }"
              >
                <option :value="null">Chọn Quận/Huyện</option>
                <option v-for="d in listDistrict" :key="d.code" :value="d">
                  {{ d.name }}
                </option>
              </select>
              <span v-if="errors.quanHuyen" class="error-msg">{{
                errors.quanHuyen
              }}</span>
            </div>
            <div class="form-group">
              <label>Xã/Phường <span class="req">*</span></label>
              <select
                v-model="selectedWard"
                :class="{ 'red-border': errors.xaPhuong }"
              >
                <option :value="null">Chọn Xã/Phường</option>
                <option v-for="w in listWard" :key="w.code" :value="w">
                  {{ w.name }}
                </option>
              </select>
              <span v-if="errors.xaPhuong" class="error-msg">{{
                errors.xaPhuong
              }}</span>
            </div>
          </div>

          <div class="form-group full-width">
            <div class="label-flex">
              <label
                >Địa chỉ cụ thể (Số nhà, đường)
                <span class="req">*</span></label
              >
              <span v-if="errors.diaChiCuThe" class="error-msg">{{
                errors.diaChiCuThe
              }}</span>
            </div>
            <input
              v-model="form.diaChiCuThe"
              :class="{ 'red-border': errors.diaChiCuThe }"
              placeholder="VD: Số 10, Ngõ 5..."
            />
          </div>

          <div class="footer-actions">
            <button class="btn btn-orange" @click="submitForm">
              Lưu Thay Đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const router = useRouter();
const route = useRoute();
const fileInput = ref(null);

// --- DATA ---
const listCity = ref([]);
const listDistrict = ref([]);
const listWard = ref([]);
const selectedCity = ref(null);
const selectedDistrict = ref(null);
const selectedWard = ref(null);

const form = ref({
  id: null, // Quan trọng để update
  maNv: "",
  hoTen: "",
  gioiTinh: true,
  ngaySinh: "",
  email: "",
  sdt: "",
  diaChiCuThe: "",
  vaiTro: "Nhân viên",
  ngayVaoLam: "",
  avatar: "",
  trangThai: 1,
  ngayTao: "",
  ngayCapNhat: "",
});
const errors = ref({});

// --- TOAST NOTIFICATION ---
const notifications = ref([]);
const showNotification = (message, type = "success") => {
  const id = Date.now() + Math.random();
  notifications.value.push({ message, type, id });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 4000);
};

// --- 1. LOAD DATA ---
onMounted(async () => {
  try {
    // Load địa chỉ
    const resAddr = await axios.get(
      "https://provinces.open-api.vn/api/?depth=3",
    );
    listCity.value = resAddr.data;

    // Load thông tin nhân viên
    const empId = route.params.id;
    if (empId) await fetchEmployeeDetail(empId);
  } catch (e) {
    console.error("Lỗi khởi tạo:", e);
  }
});

// --- 2. FETCH & MAP DATA ---
async function fetchEmployeeDetail(id) {
  try {
    const res = await axios.get(`http://localhost:8080/api/nhan-vien/${id}`);
    const data = res.data;

    // Map dữ liệu vào Form
    form.value = {
      ...data,
      ngaySinh: formatDateForInput(data.ngaySinh),
      ngayVaoLam: formatDateForInput(data.ngayVaoLam),
      vaiTro: data.chucVu || "Nhân viên", // Map chucVu -> vaiTro
      diaChiCuThe: data.diaChiCuThe,
    };

    // Fill lại Combobox Địa chỉ
    if (data.tinhThanhId) {
      selectedCity.value = listCity.value.find(
        (c) => c.code == data.tinhThanhId,
      );
      if (selectedCity.value) {
        listDistrict.value = selectedCity.value.districts;
        if (data.quanHuyenId) {
          selectedDistrict.value = listDistrict.value.find(
            (d) => d.code == data.quanHuyenId,
          );
          if (selectedDistrict.value) {
            listWard.value = selectedDistrict.value.wards;
            if (data.xaPhuongId) {
              selectedWard.value = listWard.value.find(
                (w) => w.code == data.xaPhuongId,
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Lỗi tải nhân viên:", error);
    showNotification("Không tìm thấy dữ liệu nhân viên", "error");
  }
}

// --- 3. VALIDATE FORM (LOGIC MỚI - KHẮC PHỤC LỖI TÊN) ---
function validateForm() {
  errors.value = {};
  let isValid = true;

  // A. Validate Họ Tên (Phương pháp chặn ký tự cấm)
  // Regex tìm số hoặc ký tự đặc biệt
  const invalidChars = /[0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]/;

  if (!form.value.hoTen?.trim()) {
    errors.value.hoTen = "Họ tên không được để trống";
    isValid = false;
  } else if (form.value.hoTen.length < 5) {
    errors.value.hoTen = "Họ tên quá ngắn (tối thiểu 5 ký tự)";
    isValid = false;
  } else if (invalidChars.test(form.value.hoTen)) {
    // Nếu tìm thấy ký tự cấm -> Báo lỗi
    errors.value.hoTen =
      "Họ tên không hợp lệ (không được chứa số hoặc ký tự đặc biệt)";
    isValid = false;
  }

  // B. Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.value.email?.trim()) {
    errors.value.email = "Email không được để trống";
    isValid = false;
  } else if (!emailRegex.test(form.value.email)) {
    errors.value.email = "Định dạng email không đúng";
    isValid = false;
  }

  // C. Validate SĐT
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!form.value.sdt?.trim()) {
    errors.value.sdt = "SĐT không được để trống";
    isValid = false;
  } else if (!phoneRegex.test(form.value.sdt) || form.value.sdt.length !== 10) {
    errors.value.sdt = "SĐT không hợp lệ (10 số, đầu 03,05,07,08,09)";
    isValid = false;
  }

  // D. Validate Địa chỉ
  if (!form.value.diaChiCuThe?.trim()) {
    errors.value.diaChiCuThe = "Nhập địa chỉ cụ thể";
    isValid = false;
  }
  if (!selectedCity.value) {
    errors.value.tinhThanh = "Chưa chọn Tỉnh/TP";
    isValid = false;
  }
  if (!selectedDistrict.value && selectedCity.value) {
    errors.value.quanHuyen = "Chưa chọn Quận/Huyện";
    isValid = false;
  }
  if (!selectedWard.value && selectedDistrict.value) {
    errors.value.xaPhuong = "Chưa chọn Xã/Phường";
    isValid = false;
  }

  // E. Validate Ngày sinh (18 - 65 tuổi)
  if (!form.value.ngaySinh) {
    errors.value.ngaySinh = "Vui lòng chọn ngày sinh";
    isValid = false;
  } else {
    const today = new Date();
    const birthDate = new Date(form.value.ngaySinh);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      errors.value.ngaySinh = `Nhân viên chưa đủ 18 tuổi (Hiện tại: ${age})`;
      isValid = false;
    } else if (age > 65) {
      errors.value.ngaySinh = `Tuổi vượt quá quy định lao động (Hiện tại: ${age})`;
      isValid = false;
    }
  }

  return isValid;
}

// --- 4. SUBMIT FORM ---
async function submitForm() {
  // 1. Validate Client
  if (!validateForm()) {
    showNotification("Dữ liệu không hợp lệ, vui lòng kiểm tra lại!", "warning");
    return;
  }

  // 2. Prepare Payload
  const payload = {
    ...form.value,
    // Trim dữ liệu string để tránh lỗi khoảng trắng thừa
    hoTen: form.value.hoTen.trim(),
    email: form.value.email.trim(),
    diaChiCuThe: form.value.diaChiCuThe.trim(),

    // Map lại ID địa chỉ từ Combobox
    tinhThanhId: selectedCity.value?.code,
    tinhThanh: selectedCity.value?.name,
    quanHuyenId: selectedDistrict.value?.code,
    quanHuyen: selectedDistrict.value?.name,
    xaPhuongId: selectedWard.value?.code,
    xaPhuong: selectedWard.value?.name,

    chucVu: form.value.vaiTro, // Backend dùng field chucVu
  };

  try {
    // 3. Call API Update
    await axios.put(
      `http://localhost:8080/api/nhan-vien/${form.value.id}`,
      payload,
    );

    showNotification("Cập nhật nhân viên thành công!", "success");

    // 4. Redirect sau khi thành công
    setTimeout(() => {
      router.push("/admin/employee");
    }, 1500);
  } catch (error) {
    console.error(error);
    // 5. Bắt lỗi từ Backend (Ví dụ: Email trùng với nhân viên KHÁC)
    if (error.response && error.response.data && error.response.data.message) {
      const msg = error.response.data.message;
      showNotification(msg, "error");

      // Map lỗi vào field cụ thể nếu có
      if (msg.includes("Email")) errors.value.email = msg;
      if (msg.includes("SĐT") || msg.includes("Phone")) errors.value.sdt = msg;
    } else {
      showNotification("Lỗi cập nhật! Vui lòng thử lại sau.", "error");
    }
  }
}

// --- 5. UTILS & HELPERS ---
function formatDateForInput(dateStr) {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
}
function formatDateVN(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("vi-VN");
}
function onCityChange() {
  listDistrict.value = selectedCity.value ? selectedCity.value.districts : [];
  selectedDistrict.value = null;
  listWard.value = [];
  selectedWard.value = null;
}
function onDistrictChange() {
  listWard.value = selectedDistrict.value ? selectedDistrict.value.wards : [];
  selectedWard.value = null;
}
function goBack() {
  router.push("/admin/employee");
}
function triggerFileInput() {
  fileInput.value.click();
}
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Ảnh quá lớn (<5MB)", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.avatar = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}
</script>

<style scoped>
/* Copy Style giống AddEmployee */
.edit-employee-page {
  font-family: "Segoe UI", sans-serif;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title {
  font-size: 20px;
  color: #555;
  font-weight: 600;
}
.btn-back {
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  text-decoration: underline;
}

.main-card {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
  color: #333;
}

/* Avatar */
.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
}
.avatar-circle {
  width: 140px;
  height: 140px;
  border: 2px dashed #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: #fafafa;
  transition: 0.2s;
}
.avatar-circle:hover {
  border-color: #8b4513;
}
.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.file-input-hidden {
  display: none;
}
.hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* Form Elements */
.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #444;
}
.req {
  color: red;
  margin-left: 3px;
}
input,
select {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
}
input:focus,
select:focus {
  border-color: #63391f;
}
.input-disabled {
  background-color: #f0f0f0;
  color: #888;
  cursor: not-allowed;
}

.grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.grid-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}
.full-width {
  grid-column: 1 / -1;
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
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

/* Error & Validation */
.label-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.error-msg {
  color: #e74c3c;
  font-size: 12px;
  font-style: italic;
  font-weight: 600;
}
.red-border {
  border-color: #e74c3c !important;
  background-color: #fff5f5;
}

/* Timestamp Box */
.timestamp-info {
  margin-top: 15px;
  font-size: 13px;
  color: #666;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border: 1px dashed #ddd;
}
.timestamp-info p {
  margin: 6px 0;
  display: flex;
  align-items: center;
  gap: 5px;
}
.timestamp-info span {
  font-weight: 600;
  color: #333;
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 20px;
  align-items: center;
  height: 42px;
}
.radio-item {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

/* Toast Notification */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.toast {
  pointer-events: auto;
  min-width: 250px;
  max-width: 350px;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background: #fff;
  animation: slideInRight 0.3s forwards;
}
.toast.success {
  background-color: #f0f9eb;
  border-left: 5px solid #67c23a;
  color: #67c23a;
}
.toast.error {
  background-color: #fef0f0;
  border-left: 5px solid #f56c6c;
  color: #f56c6c;
}
.toast.warning {
  background-color: #fdf6ec;
  border-left: 5px solid #e6a23c;
  color: #e6a23c;
}
.toast-msg {
  color: #333;
}
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
