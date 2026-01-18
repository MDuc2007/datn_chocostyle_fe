<template>
  <div class="add-employee-page">
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
                 <span v-if="errors.diaChi" class="error-msg">{{ errors.diaChi }}</span>
             </div>
             <input v-model="form.diaChi" :class="{ 'red-border': errors.diaChi }" placeholder="VD: Số 10, Ngõ 5..." />
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
                    <p style="margin-bottom: 8px; font-size: 14px; color: #666;">Hoặc tải ảnh lên từ máy:</p>
                    <input type="file" @change="handleQrImageUpload" accept="image/*" />
                </div>
                
                <p class="scan-note" v-if="scanError">{{ scanError }}</p>
            </div>
            </div>
          </div>
  </div>
</template>

<script setup>
import { nextTick } from 'vue';
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
// Import thư viện quét QR
import { Html5Qrcode } from "html5-qrcode"

const router = useRouter()
const fileInput = ref(null)

// Biến cho địa chỉ
const listCity = ref([])
const listDistrict = ref([])
const listWard = ref([])
const selectedCity = ref(null)
const selectedDistrict = ref(null)
const selectedWard = ref(null)

const form = ref({
  hoTen: '', cccd: '', gioiTinh: true, ngaySinh: '', email: '',
  sdt: '', diaChi: '', vaiTro: 'Nhân viên', ngayVaoLam: '', avatar: ''
})
const errors = ref({})

// --- BIẾN CHO SCANNER ---
const showScanModal = ref(false)
const scanError = ref('')
let html5QrCode = null;

// Load API
onMounted(async () => {
    try {
        const res = await axios.get('https://provinces.open-api.vn/api/?depth=3')
        listCity.value = res.data
    } catch (e) { console.error("Lỗi API địa chỉ", e) }
})

// Dọn dẹp scanner khi thoát trang
onBeforeUnmount(() => {
    stopScanner();
})

// --- 1. LOGIC MỞ/ĐÓNG MODAL SCAN ---
function openScanModal() {
    showScanModal.value = true;
    scanError.value = '';
    // Đợi DOM render xong mới khởi tạo Camera
    nextTick(() => {
        startScanner();
    });
}

function closeScanModal() {
    // 1. Đóng giao diện ngay lập tức để người dùng không bị kẹt
    showScanModal.value = false;
    
    // 2. Tắt camera sau (dùng try-catch để nếu lỗi cũng không sao)
    try {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
                html5QrCode.clear();
            }).catch(err => console.log("Lỗi tắt camera nhẹ: ", err));
        }
    } catch (e) {
        console.log("Lỗi dọn dẹp scanner", e);
    }
}

// --- 2. KHỞI TẠO CAMERA ---
function startScanner() {
  if (html5QrCode) {
        html5QrCode.clear().catch(e => {}); 
    }
    html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start(
        { facingMode: "environment" }, // Camera sau
        config,
        onScanSuccess,
        (errorMessage) => {
            // console.log(errorMessage); // Bỏ qua lỗi quét liên tục
        }
    ).catch(err => {
        scanError.value = "Không thể mở Camera. Hãy thử tải ảnh lên.";
    });
}

function stopScanner() {
    if (html5QrCode) {
        // Kiểm tra trạng thái trước khi stop
        if (html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
                html5QrCode.clear();
            }).catch(err => console.log("Stop failed: ", err));
        } else {
            html5QrCode.clear();
        }
    }
}

// --- 3. XỬ LÝ KHI QUÉT THÀNH CÔNG (TỪ CAM HOẶC ẢNH) ---
function onScanSuccess(decodedText, decodedResult) {
    // Dừng quét và đóng modal
    stopScanner();
    showScanModal.value = false;
    
    // Gọi hàm xử lý dữ liệu (Dùng lại logic cũ của bạn)
    parseCCCDData(decodedText);
}

// --- 4. XỬ LÝ TẢI ẢNH QR (ĐÃ NÂNG CẤP) ---
async function handleQrImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    scanError.value = "Đang xử lý...";

    try {
        // Nếu chưa có instance (do chưa bật cam), tạo mới
        if (!html5QrCode) {
            // Cần đợi DOM có #reader. Nếu đang ở modal thì ok, nếu không thì phải tạo ẩn.
            // Ở đây ta giả sử người dùng đang mở modal để upload.
            html5QrCode = new Html5Qrcode("reader");
        }

        // 1. Xử lý thêm viền trắng (như code trước)
        const processedFile = await addWhitePadding(file);
        
        // 2. Quét
        const decodedText = await html5QrCode.scanFile(processedFile, true);
        onScanSuccess(decodedText);

    } catch (err) {
        console.error(err);
        // Fallback: Thử quét ảnh gốc
        try {
            const decodedTextOriginal = await html5QrCode.scanFile(file, true);
            onScanSuccess(decodedTextOriginal);
        } catch (err2) {
            scanError.value = "Không tìm thấy QR. Hãy thử ảnh rõ nét hơn.";
        }
    }
}
// --- HÀM MỚI 4.5: THÊM VIỀN TRẮNG CHO ẢNH ---
function addWhitePadding(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                // Tạo canvas để vẽ
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Kích thước viền (padding) = 20% kích thước ảnh
                const padding = Math.max(img.width, img.height) * 0.2; 

                // Set kích thước canvas to hơn ảnh gốc
                canvas.width = img.width + padding * 2;
                canvas.height = img.height + padding * 2;

                // 1. Tô màu trắng toàn bộ canvas
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 2. Vẽ ảnh gốc vào chính giữa
                ctx.drawImage(img, padding, padding);

                // 3. Xuất ra file mới
                canvas.toBlob((blob) => {
                    if (blob) {
                        // Tạo File object mới từ Blob
                        const newFile = new File([blob], "padded-qr.png", { type: "image/png" });
                        resolve(newFile);
                    } else {
                        reject(new Error("Canvas error"));
                    }
                }, 'image/png');
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
// --- 5. LOGIC PARSE DỮ LIỆU (TỪ CODE CŨ) ---
function parseCCCDData(raw) {
    const parts = raw.split('|');
    if (parts.length >= 6) {
        form.value.cccd = parts[0];
        form.value.hoTen = parts[2];
        form.value.gioiTinh = parts[4] === 'Nam';
        
        const d = parts[3];
        if(d.length===8) form.value.ngaySinh = `${d.slice(4,8)}-${d.slice(2,4)}-${d.slice(0,2)}`;

        // Tự động điền địa chỉ
        autoFillAddress(parts[5]);
        
        alert("Đã quét và điền thông tin thành công!");
    } else {
        alert("Mã QR không đúng định dạng CCCD!");
    }
}

// --- LOGIC ĐỊA CHỈ (GIỮ NGUYÊN) ---
function onCityChange() {
    listDistrict.value = selectedCity.value ? selectedCity.value.districts : []
    selectedDistrict.value = null; listWard.value = []; selectedWard.value = null;
}
function onDistrictChange() {
    listWard.value = selectedDistrict.value ? selectedDistrict.value.wards : []
    selectedWard.value = null;
}
function autoFillAddress(fullStr) {
    const arr = fullStr.split(',').map(s => s.trim());
    if (arr.length < 3) return;
    const strCity = arr[arr.length - 1];
    const strDistrict = arr[arr.length - 2];
    const strWard = arr[arr.length - 3];
    form.value.diaChi = arr.slice(0, arr.length - 3).join(', ');

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
function compareStr(apiName, qrName) {
    const clean = (s) => s.toLowerCase().replace(/(thành phố|tỉnh|quận|huyện|thị xã|xã|phường|thị trấn|tp\.)/g, "").trim();
    return clean(apiName).includes(clean(qrName)) || clean(qrName).includes(clean(apiName));
}

// --- CÁC HÀM VALIDATE & SUBMIT (GIỮ NGUYÊN) ---
function validateForm() {
    errors.value = {}; 
    let isValid = true;
    if (!form.value.hoTen?.trim()) { errors.value.hoTen = "Tên trống"; isValid = false; }
    if (!form.value.cccd || form.value.cccd.length < 9) { errors.value.cccd = "CCCD sai"; isValid = false; }
    if (!form.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) { errors.value.email = "Email sai"; isValid = false; }
    if (!form.value.sdt || !/^0\d{9}$/.test(form.value.sdt)) { errors.value.sdt = "SĐT sai"; isValid = false; }
    if (!form.value.diaChi) { errors.value.diaChi = "Địa chỉ cụ thể trống"; isValid = false; }
    if (!selectedCity.value) { errors.value.tinhThanh = "Chưa chọn Tỉnh"; isValid = false; }
    if (!selectedDistrict.value && selectedCity.value) { errors.value.quanHuyen = "Chưa chọn Huyện"; isValid = false; }
    if (!selectedWard.value && selectedDistrict.value) { errors.value.xaPhuong = "Chưa chọn Xã"; isValid = false; }
    if (!form.value.ngaySinh) { errors.value.ngaySinh = "Chọn ngày sinh"; isValid = false; }
    if (!form.value.ngayVaoLam) { errors.value.ngayVaoLam = "Chọn ngày vào làm"; isValid = false; }
    return isValid;
}

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

async function submitForm() {
  if (!validateForm()) return;
  const payload = {
      ...form.value,
      tinhThanhId: selectedCity.value?.code,
      tinhThanh: selectedCity.value?.name,
      quanHuyenId: selectedDistrict.value?.code,
      quanHuyen: selectedDistrict.value?.name,
      xaPhuongId: selectedWard.value?.code,
      xaPhuong: selectedWard.value?.name
  };
  try {
    await axios.post('http://localhost:8080/api/nhan-vien', payload)
    alert("Thêm nhân viên thành công!")
    router.push('/admin/employee') 
  } catch (error) {
    console.error(error)
    alert("Lỗi thêm mới!")
  }
}
</script>

<style scoped>
/* CSS CŨ GIỮ NGUYÊN */
.add-employee-page { font-family: 'Segoe UI', sans-serif; }
.header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 20px; color: #555; font-weight: 600; }
.btn-back { border: none; background: none; color: #666; cursor: pointer; text-decoration: underline; }
.form-layout { display: flex; gap: 40px; }
.left-col { width: 300px; border-right: 1px solid #eee; padding-right: 30px; flex-shrink: 0; }
.right-col { flex-grow: 1; }
.section-header { margin-bottom: 20px; font-size: 16px; font-weight: 700; color: #333; }
.avatar-wrapper { display: flex; flex-direction: column; align-items: center; margin-bottom: 25px; }
.avatar-circle { width: 140px; height: 140px; border: 2px dashed #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; cursor: pointer; background: #fafafa; transition: 0.2s; }
.avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
.placeholder-text { color: #999; font-size: 13px; }
.file-input-hidden { display: none; }
.hint { font-size: 12px; color: #888; margin-top: 8px; }
.form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
.form-group label { margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #444; }
.req { color: red; margin-left: 3px; }
input, select { padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 14px; outline: none; transition: 0.2s; }
input:focus, select:focus { border-color: #e67e22; box-shadow: 0 0 0 2px rgba(230, 126, 34, 0.1); }
.input-disabled { background-color: #f0f0f0; color: #888; cursor: not-allowed; }
.grid-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.radio-group { display: flex; gap: 20px; margin-top: 8px; }
.radio-item { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
.footer-actions { display: flex; justify-content: flex-end; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
.btn-orange { background-color: #e67e22; color: white; border: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 6px rgba(230, 126, 34, 0.3); }
.btn-orange:hover { background-color: #d35400; }
.label-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.error-msg { color: #e74c3c; font-size: 12px; font-style: italic; font-weight: 600; }
.red-border { border-color: #e74c3c !important; background-color: #fff5f5; }
.grid-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }

/* --- CSS MỚI CHO NÚT SCAN & MODAL --- */
.main-card {
    position: relative; /* Để đặt nút tuyệt đối */
    background: #fff; border-radius: 8px; padding: 30px; 
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

/* Nút Scan nhỏ ở góc phải */
.btn-scan-qr {
    position: absolute;
    top: 20px;
    right: 20px;
    background-color: #f0fdf4;
    border: 1px solid #16a34a;
    color: #16a34a;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    align-items: center;
    gap: 5px;
}
.btn-scan-qr:hover {
    background-color: #16a34a;
    color: white;
}

/* Modal Scan */
.scan-modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8); /* Tăng độ tối nền */
    display: flex; justify-content: center; align-items: center;
    z-index: 9999; /* Tăng z-index lên cao nhất */
}
.scan-modal-content {
    background: white;
    width: 500px;
    max-width: 90%;
    /* 👇 Dòng quan trọng để chống lòi màn hình */
    max-height: 90vh; 
    overflow-y: auto; 
    
    padding: 20px;
    border-radius: 12px;
    position: relative;
    display: flex;
    flex-direction: column;
}
.scan-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}
.close-btn { background: #f1f1f1; 
    border: none; 
    font-size: 24px; 
    cursor: pointer; 
    width: 32px; height: 32px; 
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: 0.2s; }
.close-btn:hover { background: #e74c3c; color: white; }
/* Định dạng vùng chứa Camera/Ảnh */
#reader {
    width: 100%;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 15px;
}

/* Fix lỗi ảnh/video trong reader quá to */
#reader video, #reader img {
    width: 100% !important;
    height: auto !important;
    object-fit: contain;
}

.scan-options { 
    margin-top: 10px; 
    text-align: center; 
    padding-top: 10px; 
    border-top: 1px solid #eee; 
}    
.scan-options { margin-top: 15px; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
.scan-note { color: red; text-align: center; margin-top: 10px; font-size: 13px; }
</style>