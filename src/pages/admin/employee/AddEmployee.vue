<template>
  <div class="add-employee-page">
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
      <h2 class="title">Nhân viên / Thêm nhân viên</h2>
      <button class="btn-back" @click="goBack">Quay lại</button>
    </div>

    <div class="main-card">
      <button class="btn-scan-qr" @click="openScanModal" title="Quét QR CCCD">
        📷 Quét CCCD
      </button>

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
            <p class="hint">Nhấn vào hình để tải ảnh</p>
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
              placeholder="Nhập họ tên nhân viên"
            />
          </div>
        </div>

        <div class="right-col">
          <h3 class="section-header">Thông tin chi tiết</h3>
          <div class="grid-row">
            <div class="form-group">
              <div class="label-flex">
                <label>Email <span class="req">*</span></label
                ><span v-if="errors.email" class="error-msg">{{
                  errors.email
                }}</span>
              </div>
              <input
                v-model="form.email"
                :class="{ 'red-border': errors.email }"
                placeholder="example@mail.com"
              />
            </div>
            <div class="form-group">
              <div class="label-flex">
                <label>Ngày sinh <span class="req">*</span></label
                ><span v-if="errors.ngaySinh" class="error-msg">{{
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
                <label>Số Điện Thoại <span class="req">*</span></label
                ><span v-if="errors.sdt" class="error-msg">{{
                  errors.sdt
                }}</span>
              </div>
              <input
                v-model="form.sdt"
                :class="{ 'red-border': errors.sdt }"
                placeholder="09xxxxxxxx"
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
            </div>
          </div>
          <div class="form-group full-width">
            <div class="label-flex">
              <label
                >Địa chỉ cụ thể (Số nhà, đường)
                <span class="req">*</span></label
              ><span v-if="errors.diaChiCuThe" class="error-msg">{{
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
              Thêm Nhân Viên
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showScanModal"
      class="scan-modal-overlay"
      @click.self="closeScanModal"
    >
      <div class="scan-modal-content">
        <div class="scan-header">
          <div class="header-title">
            <span class="icon-qr">📷</span>
            <h3>Quét CCCD Gắn Chip</h3>
          </div>
          <button class="close-btn" @click="closeScanModal" title="Đóng">
            ×
          </button>
        </div>

        <div class="scan-body">
          <div class="camera-section">
            <qrcode-stream
              v-if="cameraActive"
              @detect="onDetect"
              @error="onError"
              :formats="['qr_code']"
              :track="paintBoundingBox"
            >
              <div class="scan-frame">
                <div class="corner topleft"></div>
                <div class="corner topright"></div>
                <div class="corner bottomleft"></div>
                <div class="corner bottomright"></div>
                <p class="scan-text">Di chuyển CCCD vào khung hình</p>
                <div v-if="loadingCamera" class="loading-text">
                  Đang khởi động camera...
                </div>
              </div>
            </qrcode-stream>

            <div v-else class="camera-placeholder">
              <div class="placeholder-icon">📷</div>
              <p v-if="!scanError">Bấm nút bên dưới để bắt đầu quét</p>
              <p v-else style="color: #e74c3c">{{ scanError }}</p>
              <button class="btn-primary-brown" @click="startCamera">
                Bật Camera Ngay
              </button>
            </div>
          </div>

          <div class="divider">
            <span>HOẶC TẢI ẢNH</span>
          </div>

          <div class="upload-section">
            <label class="upload-box">
              <qrcode-capture
                @detect="onDetect"
                :formats="['qr_code']"
                class="hidden-capture-input"
              />

              <span class="upload-icon">📂</span>
              <span class="upload-text">Chọn ảnh QR từ máy tính</span>
              <span class="upload-subtext">(Hỗ trợ tốt mọi định dạng ảnh)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { QrcodeStream, QrcodeCapture } from "vue-qrcode-reader";

const router = useRouter();
const fileInput = ref(null);

// --- DATA ---
const listCity = ref([]);
const listDistrict = ref([]);
const listWard = ref([]);
const selectedCity = ref(null);
const selectedDistrict = ref(null);
const selectedWard = ref(null);

const form = ref({
  hoTen: "",
  gioiTinh: true,
  ngaySinh: "",
  email: "",
  sdt: "",
  diaChiCuThe: "",
  avatar: "",
});
const errors = ref({});

// Scanner State
const showScanModal = ref(false);
const scanError = ref("");
const cameraActive = ref(false);
const loadingCamera = ref(false);

// Toast
const notifications = ref([]);
const showNotification = (message, type = "success") => {
  const id = Date.now() + Math.random();
  notifications.value.push({ message, type, id });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 4000);
};

onMounted(async () => {
  try {
    const res = await axios.get("https://provinces.open-api.vn/api/?depth=3");
    listCity.value = res.data;
  } catch (e) {
    console.error("Lỗi API địa chỉ", e);
  }
});

// --- HELPERS VALIDATE ---

// 1. Tính tuổi chính xác
function getAge(dateString) {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// 2. Validate Form (Client Side)
function validateForm() {
  errors.value = {};
  let isValid = true;

  // 1. Validate Họ Tên
  if (!form.value.hoTen?.trim()) {
    errors.value.hoTen = "Họ tên không được để trống";
    isValid = false;
  } else if (form.value.hoTen.length < 5) {
    errors.value.hoTen = "Họ tên quá ngắn (tối thiểu 5 ký tự)";
    isValid = false;
  } else {
    // LOGIC MỚI: Chỉ báo lỗi nếu tên chứa Số hoặc Ký tự đặc biệt
    // Regex này tìm: Số (0-9) HOẶC Ký tự đặc biệt (!@#...)
    const invalidChars = /[0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]/;

    if (invalidChars.test(form.value.hoTen)) {
      errors.value.hoTen =
        "Họ tên không hợp lệ (không chứa số hoặc ký tự đặc biệt)";
      isValid = false;
    }
  }

  // 2. Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.value.email?.trim()) {
    errors.value.email = "Email không được để trống";
    isValid = false;
  } else if (!emailRegex.test(form.value.email)) {
    errors.value.email = "Định dạng email không đúng";
    isValid = false;
  }

  // 3. Validate SĐT
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!form.value.sdt?.trim()) {
    errors.value.sdt = "SĐT không được để trống";
    isValid = false;
  } else if (!phoneRegex.test(form.value.sdt) || form.value.sdt.length !== 10) {
    errors.value.sdt = "SĐT không hợp lệ (10 số, đầu VN)";
    isValid = false;
  }

  // 4. Validate Địa chỉ
  if (!form.value.diaChiCuThe?.trim()) {
    errors.value.diaChiCuThe = "Địa chỉ cụ thể không được để trống";
    isValid = false;
  }

  // Validate Select Box (Tỉnh/Huyện/Xã)
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

  // 5. Validate Ngày sinh
  if (!form.value.ngaySinh) {
    errors.value.ngaySinh = "Vui lòng chọn ngày sinh";
    isValid = false;
  } else {
    // Tính tuổi
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
// --- SUBMIT FORM ---
async function submitForm() {
  // 1. Validate Client Local
  if (!validateForm()) {
    showNotification("Dữ liệu không hợp lệ, vui lòng kiểm tra lại!", "warning");
    return;
  }

  // 2. Validate Server (Check trùng Email/SĐT)
  // Lưu ý: Nếu Backend chưa có API check riêng, lỗi này sẽ được bắt ở catch axios.post bên dưới
  //    const isDuplicate = await checkDuplicate(form.value.email, form.value.sdt);
  //   if (isDuplicate) {
  //       showNotification("Thông tin Email hoặc SĐT đã tồn tại!", "error");
  //       return;
  //   }

  const payload = {
    ...form.value,
    hoTen: form.value.hoTen.trim(), // Xóa khoảng trắng thừa
    email: form.value.email.trim(),
    diaChiCuThe: form.value.diaChiCuThe.trim(),
    tinhThanhId: selectedCity.value?.code,
    tinhThanh: selectedCity.value?.name,
    quanHuyenId: selectedDistrict.value?.code,
    quanHuyen: selectedDistrict.value?.name,
    xaPhuongId: selectedWard.value?.code,
    xaPhuong: selectedWard.value?.name,
  };

  try {
    await axios.post("http://localhost:8080/api/nhan-vien", payload);

    showNotification("Thêm nhân viên thành công!", "success");

    setTimeout(() => {
      router.push("/admin/employee");
    }, 1500);
  } catch (error) {
    console.error(error);

    // Xử lý lỗi trả về từ Backend (nếu Backend có validate trùng)
    if (error.response && error.response.data) {
      const msg = error.response.data.message || "Lỗi thêm mới!";
      // Map lỗi từ backend vào form nếu có
      if (msg.includes("Email")) errors.value.email = "Email đã tồn tại";
      if (msg.includes("Phone") || msg.includes("SĐT"))
        errors.value.sdt = "SĐT đã tồn tại";

      showNotification(msg, "error");
    } else {
      showNotification("Lỗi hệ thống! Vui lòng thử lại sau.", "error");
    }
  }
}

// --- LOGIC KHÁC (SCAN QR, ĐỊA CHỈ...) ---
// (Giữ nguyên các hàm openScanModal, onDetect, onCityChange, handleFileUpload...)

function openScanModal() {
  showScanModal.value = true;
  scanError.value = "";
  cameraActive.value = false;
}
function closeScanModal() {
  cameraActive.value = false;
  showScanModal.value = false;
}
function startCamera() {
  scanError.value = "";
  cameraActive.value = true;
  loadingCamera.value = true;
}
function onDetect(detectedCodes) {
  const result = detectedCodes[0];
  if (result && result.rawValue) {
    cameraActive.value = false;
    loadingCamera.value = false;
    parseCCCDData(result.rawValue);
  } else {
    if (!cameraActive.value)
      showNotification("Không tìm thấy mã QR", "warning");
  }
}
function onError(err) {
  loadingCamera.value = false;
  scanError.value = "Lỗi Camera: " + err.message;
  cameraActive.value = false;
}
function parseCCCDData(decodedText) {
  const parts = decodedText.split("|");
  if (parts.length >= 6) {
    form.value.hoTen = parts[2];
    const d = parts[3];
    if (d.length === 8)
      form.value.ngaySinh = `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`;
    form.value.gioiTinh = parts[4] === "Nam";
    autoFillAddress(parts[5]);
    showScanModal.value = false;
    showNotification("Quét CCCD thành công!", "success");
  } else {
    showNotification("QR không đúng định dạng CCCD", "error");
  }
}
function paintBoundingBox(detectedCodes, ctx) {
  for (const detectedCode of detectedCodes) {
    const {
      boundingBox: { x, y, width, height },
    } = detectedCode;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#2ecc71";
    ctx.strokeRect(x, y, width, height);
  }
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
function autoFillAddress(fullStr) {
  const arr = fullStr.split(",").map((s) => s.trim());
  if (arr.length < 3) return;
  const strCity = arr[arr.length - 1];
  const strDistrict = arr[arr.length - 2];
  const strWard = arr[arr.length - 3];
  form.value.diaChiCuThe = arr.slice(0, arr.length - 3).join(", ");
  const foundCity = listCity.value.find((c) => compareStr(c.name, strCity));
  if (foundCity) {
    selectedCity.value = foundCity;
    listDistrict.value = foundCity.districts;
    const foundDistrict = listDistrict.value.find((d) =>
      compareStr(d.name, strDistrict),
    );
    if (foundDistrict) {
      selectedDistrict.value = foundDistrict;
      listWard.value = foundDistrict.wards;
      const foundWard = listWard.value.find((w) => compareStr(w.name, strWard));
      if (foundWard) selectedWard.value = foundWard;
    }
  }
}
function compareStr(api, qr) {
  const clean = (s) =>
    s
      .toLowerCase()
      .replace(
        /(thành phố|tỉnh|quận|huyện|thị xã|xã|phường|thị trấn|tp\.)/g,
        "",
      )
      .trim();
  return clean(api).includes(clean(qr)) || clean(qr).includes(clean(api));
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
    // Validate ảnh ở đây
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      showNotification("Chỉ chấp nhận file ảnh (JPG, PNG)", "error");
      return;
    }
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
/* CSS CHUNG */
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
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* NÚT MỞ MODAL */
.btn-scan-qr {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #63391f;
  border: 1px solid #63391f;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: 0.2s;
}
.btn-scan-qr:hover {
  background-color: #8b4513;
  transform: translateY(-1px);
}

/* FORM LAYOUT */
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
}
.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.file-input-hidden {
  display: none;
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
  transition: 0.2s;
}
input:focus,
select:focus {
  border-color: #63391f;
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

/* TOAST */
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

/* ===== MODERN SCAN MODAL STYLES ===== */
.scan-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 28, 20, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}
.scan-modal-content {
  background: #fff;
  width: 550px;
  max-width: 95%;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.scan-header {
  background: #fdf8f5;
  padding: 16px 24px;
  border-bottom: 1px solid #efe6e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #63391f;
}
.header-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}
.icon-qr {
  font-size: 20px;
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 28px;
  color: #a89288;
  cursor: pointer;
  line-height: 1;
}
.close-btn:hover {
  color: #63391f;
}
.scan-body {
  padding: 24px;
}

/* CAMERA SECTION */
.camera-section {
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  text-align: center;
  gap: 15px;
  padding: 20px;
  z-index: 3;
}
.placeholder-icon {
  font-size: 48px;
  opacity: 0.5;
}
.btn-primary-brown {
  background: #63391f;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 57, 31, 0.4);
}
.btn-primary-brown:hover {
  background: #7d4a2b;
}

/* SCAN FRAME (Đè lên camera) */
.scan-frame {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 10px;
  pointer-events: none;
  z-index: 5;
}
.scan-text {
  color: #fff;
  margin-bottom: 5px;
  font-size: 14px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}
.loading-text {
  color: #f39c12;
  font-size: 13px;
  margin-top: 5px;
}
.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 4px solid #4caf50;
}
.topleft {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
  border-radius: 12px 0 0 0;
}
.topright {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 12px 0 0;
}
.bottomleft {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 12px;
}
.bottomright {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 12px 0;
}

/* DIVIDER */
.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #a89288;
  font-size: 12px;
  font-weight: 600;
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #eee;
}
.divider span {
  padding: 0 10px;
}

/* UPLOAD SECTION (Custom UI cho input file) */
.upload-box {
  border: 2px dashed #d6c3b4;
  background: #faf6f4;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  color: #63391f;
  position: relative;
}
.upload-box:hover {
  border-color: #63391f;
  background: #fdf1e8;
}
.upload-icon {
  font-size: 24px;
  margin-bottom: 5px;
}
.upload-text {
  font-weight: 600;
  font-size: 14px;
}
.upload-subtext {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.hidden-capture-input {
  display: none;
} /* Ẩn input mặc định của qrcode-capture */
.error-alert {
  margin-top: 15px;
  padding: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
  text-align: center;
}
</style>
