<template>
  <div class="edit-employee-page">
    <div class="toast-container">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="toast"
        :class="notif.type"
      >
        {{ notif.message }}
      </div>
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
              <label>Số CCCD <span class="req">*</span></label>
              <input
                v-model="form.cccd"
                :class="{ 'red-border': errors.cccd }"
              />
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
            <div class="form-group">
              <label>Ngày sinh <span class="req">*</span></label>
              <input
                type="date"
                v-model="form.ngaySinh"
                :class="{ 'red-border': errors.ngaySinh }"
              />
            </div>
            <div class="form-group">
              <label>Email <span class="req">*</span></label>
              <input
                v-model="form.email"
                :class="{ 'red-border': errors.email }"
              />
            </div>
          </div>

          <div class="grid-row-3">
            <div class="form-group">
              <label>Tỉnh/Thành phố <span class="req">*</span></label>
              <select v-model="selectedCity" @change="onCityChange">
                <option :value="null">Chọn Tỉnh/TP</option>
                <option v-for="c in listCity" :key="c.code" :value="c">
                  {{ c.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Quận/Huyện <span class="req">*</span></label>
              <select v-model="selectedDistrict" @change="onDistrictChange">
                <option :value="null">Chọn Quận/Huyện</option>
                <option v-for="d in listDistrict" :key="d.code" :value="d">
                  {{ d.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Xã/Phường <span class="req">*</span></label>
              <select v-model="selectedWard">
                <option :value="null">Chọn Xã/Phường</option>
                <option v-for="w in listWard" :key="w.code" :value="w">
                  {{ w.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group full-width">
            <label>Địa chỉ cụ thể <span class="req">*</span></label>
            <input
              v-model="form.diaChiCuThe"
              :class="{ 'red-border': errors.diaChi }"
            />
          </div>

          <div class="grid-row">
            <div class="form-group">
              <label>Số Điện Thoại <span class="req">*</span></label>
              <input v-model="form.sdt" :class="{ 'red-border': errors.sdt }" />
            </div>
            <div class="form-group">
              <label>Chức vụ</label>
              <select v-model="form.vaiTro">
                <option value="Nhân viên">Nhân viên</option>
                <option value="Nhân viên bán hàng">Nhân viên bán hàng</option>
                <option value="Quản lý">Quản lý</option>
                <option value="Thủ kho">Thủ kho</option>
              </select>
            </div>
          </div>

          <div class="grid-row">
            <div class="form-group">
              <label>Trạng thái</label>
              <select v-model="form.trangThai" class="status-select">
                <option :value="1">Đang làm việc</option>
                <option :value="0">Đã nghỉ việc</option>
                <option :value="2">Đã khóa</option>
              </select>
            </div>
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

// Địa chỉ
const listCity = ref([]);
const listDistrict = ref([]);
const listWard = ref([]);
const selectedCity = ref(null);
const selectedDistrict = ref(null);
const selectedWard = ref(null);

const form = ref({
  maNv: "",
  hoTen: "",
  cccd: "",
  gioiTinh: true,
  ngaySinh: "",
  email: "",
  sdt: "",
  diaChiCuThe: "",
  vaiTro: "Staff",
  ngayVaoLam: "",
  avatar: "",
  trangThai: 1,
  ngayTao: "",
  ngayCapNhat: "",
});
const errors = ref({});

// Toast notifications
const notifications = ref([]);
const showNotification = (message, type = "success") => {
  const id = Date.now();
  notifications.value.push({ message, type, id });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 4000);
};

// 1. Load Data khi vào trang
onMounted(async () => {
  try {
    // A. Load API Hành chính trước
    const resAddr = await axios.get(
      "https://provinces.open-api.vn/api/?depth=3",
    );
    listCity.value = resAddr.data;

    // B. Load thông tin nhân viên theo ID trên URL
    const empId = route.params.id;
    if (empId) {
      await fetchEmployeeDetail(empId);
    }
  } catch (e) {
    console.error("Lỗi khởi tạo:", e);
  }
});

// 2. Hàm lấy chi tiết và Map vào Form
// --- SỬA LOGIC MAP DỮ LIỆU ---
async function fetchEmployeeDetail(id) {
  try {
    const res = await axios.get(`http://localhost:8080/api/nhan-vien/${id}`);
    const data = res.data;

    // Map dữ liệu từ API vào Form
    form.value = {
      ...data,

      // 1. SỬA LỖI NGÀY: Cắt chuỗi để lấy yyyy-MM-dd
      ngaySinh: formatDateForInput(data.ngaySinh),
      ngayVaoLam: formatDateForInput(data.ngayVaoLam),

      // 2. SỬA LỖI CHỨC VỤ:
      // Backend trả về 'chucVu', nhưng v-model là 'vaiTro' nên phải gán thủ công
      vaiTro: data.chucVu,

      // Map địa chỉ cụ thể
      diaChiCuThe: data.diaChiCuThe,
    };

    // --- Logic Map Địa chỉ (Giữ nguyên) ---
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
  }
}

// --- HÀM MỚI: FORMAT NGÀY CHO INPUT DATE ---
function formatDateForInput(dateStr) {
  if (!dateStr) return "";
  // Nếu dateStr dạng '2026-01-18T00:00:00' -> cắt lấy 10 ký tự đầu là '2026-01-18'
  return dateStr.substring(0, 10);
}
// Hàm format riêng cho hiển thị: dd-MM-yyyy
function formatDateVN(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  const day = String(date.getDate()).padStart(2, "0"); // Lấy ngày, thêm số 0 nếu < 10
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Lấy tháng (tháng bắt đầu từ 0)
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
// 3. Logic Combobox (Giống trang Add)
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

// 4. Validate & Submit (Gần giống trang Add nhưng gọi PUT)
function validateForm() {
  errors.value = {};
  let isValid = true;
  if (!form.value.hoTen?.trim()) {
    errors.value.hoTen = "Tên trống";
    isValid = false;
  }
  // ... (Copy phần validate từ AddEmployee sang đây) ...
  return isValid;
}

async function submitForm() {
  if (!validateForm()) return;

  const payload = {
    ...form.value,
    tinhThanhId: selectedCity.value?.code,
    tinhThanh: selectedCity.value?.name,
    quanHuyenId: selectedDistrict.value?.code,
    quanHuyen: selectedDistrict.value?.name,
    xaPhuongId: selectedWard.value?.code,
    xaPhuong: selectedWard.value?.name,
    diaChiCuThe: form.value.diaChiCuThe,
  };

  try {
    await axios.put(
      `http://localhost:8080/api/nhan-vien/${form.value.id}`,
      payload,
    );
    showNotification("Cập nhật thành công!");
    setTimeout(() => {
      router.push("/admin/employee");
    }, 1500);
  } catch (error) {
    console.error(error);
    showNotification("Lỗi cập nhật!", "error");
  }
}

// Utils
function goBack() {
  router.push("/admin/employee");
}
function triggerFileInput() {
  fileInput.value.click();
}
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.avatar = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN"); // Format: 10:30:00 18/01/2026
}
</script>

<style scoped>
/* Copy toàn bộ CSS từ AddEmployee.vue sang đây */
/* Thêm CSS cho phần ngày tháng */
.timestamp-info {
  margin-top: 10px;
  font-size: 13px;
  color: #666;
  background: #f8f9fa;
  padding: 8px;
  border-radius: 6px;
  border: 1px dashed #ddd;
}
.timestamp-info p {
  margin: 4px 0;
}
.timestamp-info span {
  font-weight: 600;
  color: #333;
}

/* ... CSS cũ ... */
.add-employee-page {
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
} /* Thêm hover viền nâu */
.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
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
.file-input-hidden {
  display: none;
}

/* ===== TOAST NOTIFICATION ===== */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  min-width: 300px;
  padding: 14px 20px;
  border-radius: 4px; /* Bo góc nhẹ */
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;

  /* Đổ bóng mềm mại */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  /* Animation trượt vào */
  animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;

  /* Màu nền mặc định */
  background: #fff;
}

.toast-leave-active {
  animation: fadeOut 0.3s ease forwards;
}

/* 1. SUCCESS (Giống ảnh mẫu của bạn) */
.toast.success {
  background-color: #e8f5e9; /* Nền xanh nhạt */
  border-left: 6px solid #43a047; /* Viền trái xanh đậm */
  color: #2e7d32; /* Chữ xanh đậm */
}

/* 2. ERROR */
.toast.error {
  background-color: #ffebee; /* Nền đỏ nhạt */
  border-left: 6px solid #e53935; /* Viền trái đỏ đậm */
  color: #c62828;
}

/* 3. WARNING */
.toast.warning {
  background-color: #fff3e0; /* Nền cam nhạt */
  border-left: 6px solid #fb8c00; /* Viền trái cam đậm */
  color: #ef6c00;
}

/* KEYFRAMES */
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
@keyframes fadeOut {
  to {
    opacity: 0;
    transform: translateX(20px);
  }
}
</style>
