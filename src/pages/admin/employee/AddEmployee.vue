<template>
  <div class="add-employee-page">
    <div class="toast-container">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="toast"
        :class="notif.type"
      >
        <span v-if="notif.type === 'success'">✅</span>
          <span v-if="notif.type === 'error'">❌</span>
          <span v-if="notif.type === 'warning'">⚠️</span>
          
          <span style="margin-left: 8px">{{ notif.message }}</span>
      </div>
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
              <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" class="file-input-hidden" />
            </div>
            <p class="hint">Nhấn vào hình để tải ảnh</p>
          </div>

          <div class="form-group">
            <label>Mã nhân viên (Tự động)</label>
            <input value="Tự sinh sau khi lưu" disabled class="input-disabled" />
          </div>

          <div class="form-group">
            <div class="label-flex">
                <label>Họ Và Tên <span class="req">*</span></label>
                <span v-if="errors.hoTen" class="error-msg">{{ errors.hoTen }}</span>
            </div>
            <input v-model="form.hoTen" :class="{ 'red-border': errors.hoTen }" placeholder="Nhập họ tên nhân viên" />
          </div>
        </div>

        <div class="right-col">
          <h3 class="section-header">Thông tin chi tiết</h3>

          <div class="grid-row">
            <div class="form-group">
              <div class="label-flex">
                  <label>Số CCCD <span class="req">*</span></label>
                  <span v-if="errors.cccd" class="error-msg">{{ errors.cccd }}</span>
              </div>
              <input v-model="form.cccd" :class="{ 'red-border': errors.cccd }" placeholder="Nhập số căn cước" />
            </div>

            <div class="form-group">
              <label>Giới tính <span class="req">*</span></label>
              <div class="radio-group">
                <label class="radio-item"><input type="radio" :value="true" v-model="form.gioiTinh"> Nam</label>
                <label class="radio-item"><input type="radio" :value="false" v-model="form.gioiTinh"> Nữ</label>
              </div>
            </div>
          </div>

          <div class="grid-row">
            <div class="form-group">
              <div class="label-flex">
                  <label>Ngày sinh <span class="req">*</span></label>
                  <span v-if="errors.ngaySinh" class="error-msg">{{ errors.ngaySinh }}</span>
              </div>
              <input type="date" v-model="form.ngaySinh" :class="{ 'red-border': errors.ngaySinh }" />
            </div>

            <div class="form-group">
              <div class="label-flex">
                  <label>Email <span class="req">*</span></label>
                  <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
              </div>
              <input v-model="form.email" :class="{ 'red-border': errors.email }" placeholder="example@mail.com" />
            </div>
          </div>

          <div class="grid-row-3">
              <div class="form-group">
                  <label>Tỉnh/Thành phố <span class="req">*</span></label>
                  <select v-model="selectedCity" @change="onCityChange" :class="{ 'red-border': errors.tinhThanh }">
                      <option :value="null">Chọn Tỉnh/TP</option>
                      <option v-for="c in listCity" :key="c.code" :value="c">{{ c.name }}</option>
                  </select>
                   <span v-if="errors.tinhThanh" class="error-msg">{{ errors.tinhThanh }}</span>
              </div>
              <div class="form-group">
                  <label>Quận/Huyện <span class="req">*</span></label>
                  <select v-model="selectedDistrict" @change="onDistrictChange" :class="{ 'red-border': errors.quanHuyen }">
                      <option :value="null">Chọn Quận/Huyện</option>
                      <option v-for="d in listDistrict" :key="d.code" :value="d">{{ d.name }}</option>
                  </select>
              </div>
              <div class="form-group">
                  <label>Xã/Phường <span class="req">*</span></label>
                  <select v-model="selectedWard" :class="{ 'red-border': errors.xaPhuong }">
                      <option :value="null">Chọn Xã/Phường</option>
                      <option v-for="w in listWard" :key="w.code" :value="w">{{ w.name }}</option>
                  </select>
              </div>
          </div>

          <div class="form-group full-width">
             <div class="label-flex">
                 <label>Địa chỉ cụ thể (Số nhà, đường) <span class="req">*</span></label>
                 <span v-if="errors.diaChiCuThe" class="error-msg">{{ errors.diaChiCuThe }}</span>
             </div>
             <input v-model="form.diaChiCuThe" :class="{ 'red-border': errors.diaChiCuThe }" placeholder="VD: Số 10, Ngõ 5..." />
          </div>

          <div class="grid-row">
            <div class="form-group">
              <div class="label-flex">
                  <label>Số Điện Thoại <span class="req">*</span></label>
                  <span v-if="errors.sdt" class="error-msg">{{ errors.sdt }}</span>
              </div>
              <input v-model="form.sdt" :class="{ 'red-border': errors.sdt }" placeholder="09xxxxxxxx" />
            </div>

            <div class="form-group">
                <label>Chức vụ / Vai trò</label>
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
                <div class="label-flex">
                    <label>Ngày vào làm <span class="req">*</span></label>
                    <span v-if="errors.ngayVaoLam" class="error-msg">{{ errors.ngayVaoLam }}</span>
                </div>
                <input type="date" v-model="form.ngayVaoLam" :class="{ 'red-border': errors.ngayVaoLam }" />
             </div>
             <div class="form-group"></div>
          </div>

          <div class="footer-actions">
             <button class="btn btn-orange" @click="submitForm">Thêm Nhân Viên</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showScanModal" class="scan-modal-overlay">
        <div class="scan-modal-content">
            <div class="scan-header">
                <h3>Quét QR CCCD</h3>
                <button class="close-btn" @click="closeScanModal">×</button>
            </div>
            <div class="scan-body">
                <div id="reader"></div>
                <div class="scan-options">
                    <p>Hoặc tải ảnh lên từ máy:</p>
                    <input type="file" @change="handleQrImageUpload" accept="image/*" />
                </div>
                <p class="scan-note" v-if="scanError">{{ scanError }}</p>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Html5Qrcode } from "html5-qrcode"

const router = useRouter()
const fileInput = ref(null)

// Địa chỉ
const listCity = ref([])
const listDistrict = ref([])
const listWard = ref([])
const selectedCity = ref(null)
const selectedDistrict = ref(null)
const selectedWard = ref(null)

// Form Data (Chú ý dùng diaChiCuThe)
const form = ref({
  hoTen: '', cccd: '', gioiTinh: true, ngaySinh: '', email: '',
  sdt: '', diaChiCuThe: '', vaiTro: 'Nhân viên', ngayVaoLam: '', avatar: ''
})
const errors = ref({})

// Scanner State
const showScanModal = ref(false)
const scanError = ref('')
let html5QrCode = null;

// Toast notifications
const notifications = ref([]);
const showNotification = (message, type = "success") => {
  const id = Date.now();
  notifications.value.push({ message, type, id });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 4000);
};

onMounted(async () => {
    try {
        const res = await axios.get('https://provinces.open-api.vn/api/?depth=3')
        listCity.value = res.data
    } catch (e) { console.error("Lỗi API địa chỉ", e) }
})

onBeforeUnmount(() => {
    stopScanner();
})

// --- LOGIC ĐỊA CHỈ ---
function onCityChange() {
    listDistrict.value = selectedCity.value ? selectedCity.value.districts : []
    selectedDistrict.value = null; listWard.value = []; selectedWard.value = null;
}
function onDistrictChange() {
    listWard.value = selectedDistrict.value ? selectedDistrict.value.wards : []
    selectedWard.value = null;
}

// --- LOGIC QR SCANNER ---
function openScanModal() {
    showScanModal.value = true;
    scanError.value = '';
    nextTick(() => { startScanner(); });
}
function closeScanModal() {
    showScanModal.value = false;
    stopScanner();
}
function startScanner() {
    if (html5QrCode) html5QrCode.clear().catch(e => {}); 
    html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, () => {})
    .catch(err => {
        console.warn(err);
        scanError.value = "Không tìm thấy Camera. Vui lòng dùng tính năng tải ảnh.";
    });
}
function stopScanner() {
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(e=>{});
    }
}

// --- XỬ LÝ ẢNH QR UPLOAD (Đã có fix viền trắng) ---
async function handleQrImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    scanError.value = "Đang xử lý...";
    try {
        if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");
        const processedFile = await addWhitePadding(file);
        const decodedText = await html5QrCode.scanFile(processedFile, true);
        onScanSuccess(decodedText);
    } catch (err) {
        try { // Fallback ảnh gốc
             const decodedTextOriginal = await html5QrCode.scanFile(file, true);
             onScanSuccess(decodedTextOriginal);
        } catch(e) {
            scanError.value = "Không tìm thấy mã QR.";
        }
    }
}
function addWhitePadding(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const padding = Math.max(img.width, img.height) * 0.2; 
                canvas.width = img.width + padding * 2;
                canvas.height = img.height + padding * 2;
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, padding, padding);
                canvas.toBlob((blob) => resolve(new File([blob], "padded.png", { type: "image/png" })), 'image/png');
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// --- PARSE DỮ LIỆU QR ---
function onScanSuccess(decodedText) {
    stopScanner();
    showScanModal.value = false;
    
    const parts = decodedText.split('|');
    if (parts.length >= 6) {
        form.value.cccd = parts[0];
        form.value.hoTen = parts[2];
        form.value.gioiTinh = parts[4] === 'Nam';
        const d = parts[3];
        if(d.length===8) form.value.ngaySinh = `${d.slice(4,8)}-${d.slice(2,4)}-${d.slice(0,2)}`;

        // Tự động điền địa chỉ
        autoFillAddress(parts[5]);
        showNotification("Đã quét thành công!", "success");
    } else {
        showNotification("QR không đúng định dạng CCCD", "error");
    }
}

function autoFillAddress(fullStr) {
    const arr = fullStr.split(',').map(s => s.trim());
    if (arr.length < 3) return;
    
    const strCity = arr[arr.length - 1];
    const strDistrict = arr[arr.length - 2];
    const strWard = arr[arr.length - 3];
    
    // 👇 Gán vào diaChiCuThe thay vì diaChi
    form.value.diaChiCuThe = arr.slice(0, arr.length - 3).join(', ');

    const foundCity = listCity.value.find(c => compareStr(c.name, strCity));
    if (foundCity) {
        selectedCity.value = foundCity;
        listDistrict.value = foundCity.districts;
        const foundDistrict = listDistrict.value.find(d => compareStr(d.name, strDistrict));
        if (foundDistrict) {
            selectedDistrict.value = foundDistrict;
            listWard.value = foundDistrict.wards;
            const foundWard = listWard.value.find(w => compareStr(w.name, strWard));
            if (foundWard) selectedWard.value = foundWard;
        }
    }
}
function compareStr(api, qr) {
    const clean = s => s.toLowerCase().replace(/(thành phố|tỉnh|quận|huyện|thị xã|xã|phường|thị trấn|tp\.)/g, "").trim();
    return clean(api).includes(clean(qr)) || clean(qr).includes(clean(api));
}

// --- VALIDATE & SUBMIT ---
function validateForm() {
    errors.value = {}; 
    let isValid = true;
    if (!form.value.hoTen?.trim()) { errors.value.hoTen = "Tên trống"; isValid = false; }
    if (!form.value.cccd || form.value.cccd.length < 9) { errors.value.cccd = "CCCD sai"; isValid = false; }
    if (!form.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) { errors.value.email = "Email sai"; isValid = false; }
    if (!form.value.sdt || !/^0\d{9}$/.test(form.value.sdt)) { errors.value.sdt = "SĐT sai"; isValid = false; }
    
    // 👇 Validate diaChiCuThe
    if (!form.value.diaChiCuThe) { errors.value.diaChiCuThe = "Địa chỉ cụ thể trống"; isValid = false; }
    
    if (!selectedCity.value) { errors.value.tinhThanh = "Chưa chọn Tỉnh"; isValid = false; }
    if (!selectedDistrict.value && selectedCity.value) { errors.value.quanHuyen = "Chưa chọn Huyện"; isValid = false; }
    if (!selectedWard.value && selectedDistrict.value) { errors.value.xaPhuong = "Chưa chọn Xã"; isValid = false; }
    
    if (!form.value.ngaySinh) { errors.value.ngaySinh = "Chọn ngày sinh"; isValid = false; }
    else {
        if (new Date().getFullYear() - new Date(form.value.ngaySinh).getFullYear() < 18) {
            errors.value.ngaySinh = "Chưa đủ 18 tuổi"; isValid = false;
        }
    }
    if (!form.value.ngayVaoLam) { errors.value.ngayVaoLam = "Chọn ngày vào làm"; isValid = false; }

    return isValid;
}

async function submitForm() {
  if (!validateForm()) return;

  // 👇 PAYLOAD ĐỒNG BỘ VỚI BACKEND MỚI
  const payload = {
      ...form.value,
      // Gửi diaChiCuThe (Backend sẽ tự ghép thành diaChi)
      diaChiCuThe: form.value.diaChiCuThe,
      
      // Gửi cả ID và Tên
      tinhThanhId: selectedCity.value?.code,
      tinhThanh: selectedCity.value?.name,
      
      quanHuyenId: selectedDistrict.value?.code,
      quanHuyen: selectedDistrict.value?.name,
      
      xaPhuongId: selectedWard.value?.code,
      xaPhuong: selectedWard.value?.name
  };

  try {
    await axios.post('http://localhost:8080/api/nhan-vien', payload)
    showNotification("Thêm nhân viên thành công!")
    setTimeout(() => {
        router.push('/admin/employee') 
    }, 1500)
  } catch (error) {
    console.error(error)
    showNotification("Lỗi thêm mới!", "error")
  }
}

// Utils
function goBack() { router.push('/admin/employee') }
function triggerFileInput() { fileInput.value.click() }
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.size <= 5*1024*1024) {
        const reader = new FileReader();
        reader.onload = (e) => { form.value.avatar = e.target.result; };
        reader.readAsDataURL(file);
    } else { alert("Ảnh quá lớn (<5MB)"); }
}
</script>

<style scoped>
/* CSS ĐÃ FIX MODAL */
.add-employee-page { font-family: 'Segoe UI', sans-serif; }
.header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 20px; color: #555; font-weight: 600; }
.btn-back { border: none; background: none; color: #666; cursor: pointer; text-decoration: underline; }

.main-card { position: relative; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }

.btn-scan-qr {
    position: absolute; top: 20px; right: 20px;
    background-color: #f0fdf4; border: 1px solid #16a34a; color: #16a34a;
    padding: 8px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; gap: 5px;
}
.btn-scan-qr:hover { background-color: #16a34a; color: white; }

.form-layout { display: flex; gap: 40px; }
.left-col { width: 300px; border-right: 1px solid #eee; padding-right: 30px; flex-shrink: 0; }
.right-col { flex-grow: 1; }
.section-header { margin-bottom: 20px; font-size: 16px; font-weight: 700; color: #333; }
.avatar-wrapper { display: flex; flex-direction: column; align-items: center; margin-bottom: 25px; }
.avatar-circle { width: 140px; height: 140px; border: 2px dashed #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; cursor: pointer; background: #fafafa; transition: 0.2s; }
.avatar-circle:hover { border-color: #8B4513; } /* Thêm hover viền nâu */
.avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
.file-input-hidden { display: none; } /* QUAN TRỌNG: Ẩn nút file */
.form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
.form-group label { margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #444; }
.req { color: red; margin-left: 3px; }
input, select { padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 14px; outline: none; }
.input-disabled { background-color: #f0f0f0; color: #888; cursor: not-allowed; }
.grid-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
.footer-actions { display: flex; justify-content: flex-end; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
.btn-orange { background-color: #63391F; color: white; border: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.label-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.error-msg { color: #e74c3c; font-size: 12px; font-style: italic; font-weight: 600; }
.red-border { border-color: #e74c3c !important; background-color: #fff5f5; }

/* MODAL SCANNER */
.scan-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.scan-modal-content { background: white; width: 500px; max-width: 90%; max-height: 90vh; overflow-y: auto; padding: 20px; border-radius: 12px; }
.scan-header { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.close-btn { background: #f1f1f1; border: none; font-size: 24px; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; }
#reader { width: 100%; background: #000; border-radius: 8px; overflow: hidden; margin-bottom: 15px; }
#reader video, #reader img { width: 100% !important; height: auto !important; object-fit: contain; }
.scan-options { margin-top: 10px; text-align: center; padding-top: 10px; border-top: 1px solid #eee; }
.scan-note { color: red; text-align: center; margin-top: 10px; font-size: 13px; }

/* ===== TOAST NOTIFICATION ===== */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000; /* Tăng z-index cao hơn cả Modal QR */
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  pointer-events: auto; /* Cho phép click vào thông báo (nếu cần) */
  min-width: 250px;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  /* Hiệu ứng Vue Transition Group (nếu dùng) hoặc animation thường */
  animation: slideIn 0.4s ease forwards;
}
.toast-leave-active {
  animation: slideOut 0.4s ease forwards;
}
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

.toast.success {
  background: #ffffff;
  color: #2e7d32; /* Xanh lá đậm */
  border-left: 5px solid #4caf50;
}
.toast.error {
  background: #ffffff;
  color: #c62828; /* Đỏ đậm */
  border-left: 5px solid #f44336;
}
.toast.warning {
  background: #ffffff;
  color: #ef6c00; /* Cam đậm */
  border-left: 5px solid #ff9800;
}
</style>