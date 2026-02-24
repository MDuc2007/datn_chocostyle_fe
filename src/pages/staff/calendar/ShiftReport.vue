<template>
  <div class="shift-page">
    <div class="page-header">
      <div class="title-group">
        <span class="icon main-icon">⇆</span> 
        <h2 class="page-title">Giao ca & Kết toán</h2>
      </div>
      
      <button class="btn-outline">
        <span class="icon">📅</span> Lịch của tôi
      </button>
    </div>

    <div class="main-card">
      <div class="content-grid">
        
        <div class="info-box">
          <h3 class="box-title">Thông tin ca</h3>
          <div class="info-content">
            <p>
              <span class="label">Ca làm việc:</span> 
              <span class="value">{{ caHomNay ? caHomNay.caLamViec.tenCa : 'Không có ca' }}</span>
            </p>
            <p>
              <span class="label">Mở lúc:</span> 
              <span class="value">
                <strong :class="{'text-danger': !chamCong}">
                  {{ chamCong ? chamCong.gioCheckIn : 'Chưa mở ca' }}
                </strong>
              </span>
            </p>
            <p>
              <span class="label">Còn lại:</span> 
              <span class="value highlight"><strong>{{ timeRemaining }}</strong></span>
            </p>
          </div>
        </div>

        <div class="input-box">
          
          <template v-if="caHomNay && !chamCong">
            <h3 class="box-title">Nhập tiền đầu ca (Mở ca)</h3>
            
            <div class="form-group">
              <label>Tiền mặt đầu ca</label>
              <div class="input-wrapper">
                <input 
                  type="number" 
                  v-model="cashInAmount" 
                  class="custom-input" 
                  placeholder="0" 
                />
                <span class="currency">VNĐ</span>
              </div>
            </div>

            <div class="form-group">
              <label>Tiền tài khoản đầu ca</label>
              <div class="input-wrapper">
                <input 
                  type="number" 
                  v-model="transferInAmount" 
                  class="custom-input" 
                  placeholder="0" 
                />
                <span class="currency">VNĐ</span>
              </div>
            </div>
            
            <p class="warning-text info-text">
              Bạn cần <strong>Xác nhận vào ca</strong> mới có thể sử dụng các chức năng bán hàng và kết toán.
            </p>
          </template>

          <template v-else>
            <h3 class="box-title">Nhập tiền thực tế (kết toán)</h3>
            
            <div class="form-group">
              <label>Tiền mặt</label>
              <div class="input-wrapper">
                <input 
                  type="number" 
                  v-model="cashAmount" 
                  class="custom-input" 
                  placeholder="0" 
                  :disabled="isViewOnly"
                />
                <span class="currency">VNĐ</span>
              </div>
            </div>

            <div class="form-group">
              <label>Chuyển khoản</label>
              <div class="input-wrapper">
                <input 
                  type="number" 
                  v-model="transferAmount" 
                  class="custom-input" 
                  placeholder="0" 
                  :disabled="isViewOnly"
                />
                <span class="currency">VNĐ</span>
              </div>
            </div>

            <p class="warning-text" v-if="isViewOnly">
              Bạn đang ở <strong>chế độ xem</strong> (Chưa mở ca hoặc đã kết thúc). Không thể thao tác.
            </p>
          </template>

        </div>

      </div>

      <div class="card-actions">
        <button 
          v-if="caHomNay && !chamCong"
          class="btn-primary hover-effect" 
          @click="handleCheckIn"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Đang xử lý...' : 'Xác nhận vào ca' }}
        </button>

        <button 
          v-else
          class="btn-primary hover-effect" 
          @click="handleCheckout"
          :disabled="isViewOnly || isLoading"
        >
          {{ isLoading ? 'Đang xử lý...' : 'Xác nhận đóng ca' }}
        </button>
      </div>
      
    </div>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-indicator"></div>
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>

    <transition name="fade-modal">
      <div v-if="modal.show" class="modal-overlay" @click.self="closeModal">
        <div class="confirm-box">
          <div class="confirm-icon-wrapper">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="#f59e0b">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h3 class="confirm-title">{{ modal.title }}</h3>
          <p class="confirm-desc">{{ modal.message }}</p>
          <div class="confirm-actions">
            <button class="btn-cancel hover-effect" @click="closeModal">
              Hủy
            </button>
            <button class="btn-confirm hover-effect" @click="executeModalAction">
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'

// --- TRẠNG THÁI GIAO DIỆN & THÔNG BÁO ---
const toast = ref({ show: false, message: '', type: 'success' })
const modal = ref({ show: false, title: '', message: '', action: '' })

// Biến lưu trữ giá trị nhập vào (MỞ CA)
const cashInAmount = ref(0)
const transferInAmount = ref(0)

// Biến lưu trữ giá trị nhập vào (KẾT TOÁN / ĐÓNG CA)
const cashAmount = ref(0)
const transferAmount = ref(0)

// Biến lưu dữ liệu từ API
const caHomNay = ref<any>(null)
const chamCong = ref<any>(null)
const isLoading = ref(false)

// Đếm ngược thời gian
const timeRemaining = ref('0s')
let countdownTimer: any = null

// Lấy thông tin user hiện tại (ID và Token)
const idNv = localStorage.getItem("idNv") || JSON.parse(localStorage.getItem("user") || "{}").id
const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user") || "{}").accessToken
const headers = { Authorization: `Bearer ${token}` }

// --- HÀM XỬ LÝ THÔNG BÁO ---
const showToast = (msg: string, type = 'success') => {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const closeModal = () => {
  modal.value.show = false
}

const executeModalAction = async () => {
  if (modal.value.action === 'CHECKOUT') {
    closeModal()
    await processCheckout()
  }
}

// TÍNH TOÁN: Trạng thái khóa/mở giao diện (Cho form Kết toán)
const isViewOnly = computed(() => {
  if (!caHomNay.value) return true; // Không có ca hôm nay
  if (!chamCong.value) return true; // Có ca nhưng chưa bấm Mở ca
  if (chamCong.value.gioCheckOut) return true; // Đã kết thúc ca rồi
  return false;
})

// HÀM: Đếm ngược thời gian
const updateCountdown = () => {
  if (!caHomNay.value || !caHomNay.value.caLamViec.gioKetThuc) {
    timeRemaining.value = '0s';
    return;
  }

  const now = new Date();
  const endTimeStr = caHomNay.value.caLamViec.gioKetThuc;
  const [hours, minutes] = endTimeStr.split(':');
  
  const endTime = new Date();
  endTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) {
    timeRemaining.value = 'Đã hết giờ ca';
  } else {
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    timeRemaining.value = `${h}h ${m}p ${s}s`;
  }
}

// HÀM: Xử lý MỞ CA (Check-in)
const handleCheckIn = async () => {
  isLoading.value = true;
  try {
    await axios.post(
      `http://localhost:8080/api/cham-cong/check-in/${idNv}`,
      {
        tienMatDauCa: cashInAmount.value,
        tienTaiKhoanDauCa: transferInAmount.value
      },
      { headers }
    );
    
    showToast('Đã xác nhận mở ca làm việc!', 'success');
    setTimeout(() => location.reload(), 1500);

  } catch (error: any) {
    console.error("Lỗi mở ca:", error);
    showToast(error.response?.data || "Có lỗi xảy ra khi mở ca.", 'error');
  } finally {
    isLoading.value = false;
  }
}

// HÀM: Xác nhận KẾT TOÁN (Check-out)
const handleCheckout = () => {
  if (isViewOnly.value) return;

  if (cashAmount.value === 0 && transferAmount.value === 0) {
    modal.value = {
      show: true,
      title: 'Chưa nhập tiền!',
      message: "Bạn chưa nhập số tiền kết toán. Bạn có chắc chắn muốn kết thúc ca không?",
      action: 'CHECKOUT'
    };
    return;
  }

  processCheckout();
}

// HÀM: Thực thi API KẾT TOÁN (Check-out)
const processCheckout = async () => {
  isLoading.value = true;
  try {
    await axios.post(
      `http://localhost:8080/api/cham-cong/check-out/${idNv}`,
      {
        tienMatCuoiCa: cashAmount.value,
        tienChuyenKhoanCuoiCa: transferAmount.value
      },
      { headers }
    );

    showToast('Kết toán và đóng ca thành công!', 'success');
    setTimeout(() => location.reload(), 1500);

  } catch (error: any) {
    console.error("Lỗi đóng ca:", error);
    showToast(error.response?.data || "Chưa đến giờ kết thúc ca!", 'error');
  } finally {
    isLoading.value = false;
  }
}

// KHỞI CHẠY KHI VÀO TRANG
onMounted(async () => {
  if (!idNv) return;

  try {
    // 1. Gọi API lấy thông tin ca
    const resCa = await axios.get(`http://localhost:8080/api/lich-lam-viec/check-ca-hom-nay/${idNv}`, { headers })
    caHomNay.value = resCa.data

    // 2. Gọi API lấy trạng thái chấm công
    try {
      const resChamCong = await axios.get(`http://localhost:8080/api/cham-cong/hom-nay/${idNv}`, { headers })
      chamCong.value = resChamCong.data
    } catch (err) {
      chamCong.value = null // Chưa chấm công
    }

    // 3. Chạy đồng hồ
    updateCountdown()
    countdownTimer = setInterval(updateCountdown, 1000)

  } catch (error) {
    console.log("Lỗi tải dữ liệu:", error)
  }
})

// DỌN DẸP KHI RỜI TRANG
onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style>
/* ================= Biến màu sắc (Theme) ================= */
:root {
  --primary-color: #63391F;       /* Màu chủ đạo (Nâu) */
  --primary-light: #8a5735;       /* Màu nâu sáng hơn cho hover/border */
  --bg-color: #F7F7F7;            /* Màu nền trang */
  --white-color: #FFFFFF;         /* Màu nền card/input focus */
  --text-main: #333333;           /* Màu chữ chính */
  --text-muted: #666666;          /* Màu chữ phụ */
  --border-color: #E2E8F0;        /* Màu đường viền */
  --input-bg: #F3F4F6;            /* Màu nền input mặc định */
  --warning-color: #D97706;       /* Màu cảnh báo (Vàng nâu) */
}

/* Tổng thể trang */
.shift-page {
  background-color: var(--bg-color);
  padding: 25px;
  min-height: 100%;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: var(--text-main);
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-icon {
  font-size: 20px;
  color: var(--primary-color);
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
  letter-spacing: 0.5px;
}

.btn-outline {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--white-color);
  border: 1px solid var(--border-color);
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background-color: #F9FAFB;
  border-color: #D1D5DB;
  color: var(--text-main);
}

/* Card chính */
.main-card {
  background-color: var(--white-color);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 30px;
  margin-bottom: 30px;
}

/* Các khối box bên trong */
.info-box, .input-box {
  background-color: #FAFAFA; 
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 25px;
}

.box-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(99, 57, 31, 0.1); 
}

/* CSS cho cột trái (Thông tin ca) */
.info-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-content p:last-child {
  margin-bottom: 0;
}

.info-content .label {
  color: var(--text-muted);
}

.info-content .value {
  font-weight: 500;
  color: var(--text-main);
}

.info-content .highlight {
  color: var(--primary-color);
}

.text-danger {
  color: #DC2626; /* Chữ đỏ cảnh báo chưa mở ca */
}

/* CSS cho cột phải (Form nhập) */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.custom-input {
  width: 100%;
  background-color: var(--white-color);
  border: 1px solid var(--border-color);
  padding: 12px 45px 12px 15px; 
  border-radius: 8px;
  font-size: 15px;
  color: var(--text-main);
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.custom-input:focus:not(:disabled) {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1); 
}

.custom-input:disabled {
  background-color: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
}

.currency {
  position: absolute;
  right: 15px;
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
  pointer-events: none;
}

.warning-text {
  font-size: 13px;
  color: var(--warning-color);
  background-color: #FFFBEB;
  border: 1px solid #FCD34D;
  padding: 12px;
  border-radius: 8px;
  margin: 15px 0 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-text {
  color: #047857;
  background-color: #ECFDF5;
  border: 1px solid #A7F3D0;
}

.warning-text::before {
  content: '⚠️';
  font-size: 16px;
}

.info-text::before {
  content: '💡';
}

.warning-text strong {
  font-weight: 700;
}

/* Phần nút bấm ở dưới cùng */
.card-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--white-color);
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(99, 57, 31, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background-color: #452614; 
  transform: translateY(-1px);
  box-shadow: 0 6px 8px rgba(99, 57, 31, 0.25);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(99, 57, 31, 0.2);
}

.btn-primary:disabled {
  background-color: #D1D5DB;
  color: #9CA3AF;
  box-shadow: none;
  cursor: not-allowed;
}

.hover-effect:active {
  transform: scale(0.96);
}

/* =========================================
   CUSTOM TOAST & MODAL STYLES TỪ CÁC TRANG KHÁC
   ========================================= */

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  min-width: 250px;
  padding: 12px 15px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 500;
  background: #F0FDF4; 
  color: #374151; 
}

.toast-indicator {
  width: 6px;
  height: 100%;
  background-color: #22C55E; 
  position: absolute;
  left: 0;
  top: 0;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.toast-content {
  margin-left: 10px;
}

.toast-notification.error {
  background: #FEF2F2;
  color: #991b1b;
}

.toast-notification.error .toast-indicator {
  background-color: #ef4444;
}

/* Modal Confirmation */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
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
  background-color: #FEF3C7; 
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-title {
  color: var(--primary-color);
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
  transition: 0.2s;
}

.btn-confirm {
  background-color: #a88164;
  color: #fff;
}

.btn-confirm:hover {
  background-color: var(--primary-color);
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

/* Animations */
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}
@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Responsive cơ bản */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .btn-outline {
    width: 100%;
    justify-content: center;
  }

  .main-card {
    padding: 20px;
  }
}
</style>