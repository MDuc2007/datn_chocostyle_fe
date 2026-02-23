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
          class="btn-primary" 
          @click="handleCheckIn"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Đang xử lý...' : 'Xác nhận vào ca' }}
        </button>

        <button 
          v-else
          class="btn-primary" 
          @click="handleCheckout"
          :disabled="isViewOnly || isLoading"
        >
          {{ isLoading ? 'Đang xử lý...' : 'Xác nhận đóng ca' }}
        </button>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2' 

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
    
    await Swal.fire({
      title: 'Thành công!',
      text: 'Đã xác nhận mở ca làm việc!',
      icon: 'success',
      confirmButtonColor: '#63391F'
    });
    
    location.reload(); 
  } catch (error: any) {
    console.error("Lỗi mở ca:", error);
    Swal.fire({
      title: 'Thất bại!',
      text: error.response?.data || "Có lỗi xảy ra khi mở ca.",
      icon: 'error',
      confirmButtonColor: '#63391F'
    });
  } finally {
    isLoading.value = false;
  }
}

// HÀM: Xử lý KẾT TOÁN (Check-out)
const handleCheckout = async () => {
  if (isViewOnly.value) return;

  if (cashAmount.value === 0 && transferAmount.value === 0) {
    const result = await Swal.fire({
      title: 'Chưa nhập tiền!',
      text: "Bạn chưa nhập số tiền kết toán. Bạn có chắc chắn muốn kết thúc ca không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#63391F', 
      cancelButtonColor: '#d33',    
      confirmButtonText: 'Đồng ý đóng ca',
      cancelButtonText: 'Hủy bỏ'
    });
    
    if (!result.isConfirmed) return;
  }

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

    await Swal.fire({
      title: 'Thành công!',
      text: 'Kết toán và đóng ca thành công!',
      icon: 'success',
      confirmButtonColor: '#63391F'
    });
    
    location.reload(); 

  } catch (error: any) {
    console.error("Lỗi đóng ca:", error);
    Swal.fire({
      title: 'Thất bại!',
      text: error.response?.data || "Chưa đến giờ kết thúc ca!",
      icon: 'error',
      confirmButtonColor: '#63391F'
    });
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
<style scoped>
/* Tổng thể trang */
.shift-page {
  background-color: #F7F7F7;
  padding: 25px;
  min-height: 100%;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #333333;
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
  color: #63391F;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #63391F;
  margin: 0;
  letter-spacing: 0.5px;
}

.btn-outline {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #666666;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background-color: #F9FAFB;
  border-color: #D1D5DB;
  color: #333333;
}

/* Card chính */
.main-card {
  background-color: #FFFFFF;
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
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 25px;
}

.box-title {
  font-size: 16px;
  font-weight: 700;
  color: #63391F;
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
  color: #666666;
}

.info-content .value {
  font-weight: 500;
  color: #333333;
}

.info-content .highlight {
  color: #63391F;
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
  color: #333333;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.custom-input {
  width: 100%;
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  padding: 12px 45px 12px 15px; 
  border-radius: 8px;
  font-size: 15px;
  color: #333333;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.custom-input:focus:not(:disabled) {
  outline: none;
  border-color: #63391F;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1); 
}

.custom-input:disabled {
  background-color: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
  border-color: #D1D5DB;
}

.currency {
  position: absolute;
  right: 15px;
  font-size: 14px;
  color: #9CA3AF;
  font-weight: 500;
  pointer-events: none;
}

.warning-text {
  font-size: 13px;
  color: #D97706;
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
  border-top: 1px solid #E2E8F0;
  padding-top: 20px;
}

.btn-primary {
  background-color: #63391F;
  color: #FFFFFF;
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

<style>
  div.swal2-container {
    z-index: 10000 !important;
  }
</style>