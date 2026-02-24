<template>
  <div v-if="show && isReady" class="modal-overlay">
    <div class="modal-content">
      
      <div class="modal-header">
        <h3>MỞ CA LÀM VIỆC</h3>
        <p>Hệ thống quản lý bán hàng ChocoStyle Shop</p>
      </div>

      <div class="modal-body">
        
        <div class="staff-info">
          <p class="staff-code">Nhân viên : {{ tenNv }} • {{ currentTime }}</p>
        </div>

        <div v-if="!ca || !ca.caLamViec" class="alert-box error">
          <span class="alert-icon">⚠️</span>
          <p>Hôm nay bạn không có lịch phân công ca làm việc.</p>
        </div>

        <div v-else>
          <div class="form-group">
            <label>Ca làm việc được phân công</label>
            <input 
              type="text" 
              class="form-control disabled-input" 
              disabled 
              :value="`${ca.caLamViec.tenCa} (${ca.caLamViec.gioBatDau} - ${ca.caLamViec.gioKetThuc})`" 
            />
          </div>

          <div v-if="!chamCong">
            <div class="form-group">
              <label>Tiền mặt đầu ca</label>
              <div class="input-wrapper">
                <input type="number" v-model="form.tienMat" class="form-control" placeholder="0" />
                <span class="currency-unit">VNĐ</span>
              </div>
            </div>
            
            <div class="form-group">
              <label>Tiền tài khoản đầu ca</label>
              <div class="input-wrapper">
                <input type="number" v-model="form.tienTaiKhoan" class="form-control" placeholder="0" />
                <span class="currency-unit">VNĐ</span>
              </div>
            </div>
            
            <p class="previous-balance">Số dự kiến từ ca trước: <strong>0 VNĐ</strong></p>
          </div>

          <div v-else-if="chamCong && !chamCong.gioCheckOut" class="alert-box success">
            <div class="status-header">
              <span class="alert-icon">✅</span>
              <p class="status-title">Đang trong ca làm việc</p>
            </div>
            <p class="status-time">Check-in lúc: <strong>{{ chamCong.gioCheckIn }}</strong></p>
            <p class="status-note">Hãy bấm kết thúc ca khi bạn làm xong nhé!</p>
          </div>
          
          <div v-else class="alert-box disabled-box">
            <span class="alert-icon">🔒</span>
            <p>Ca làm việc hôm nay của bạn đã hoàn thành.</p>
          </div>
        </div>

      </div>

      <div class="modal-footer">
        
        <template v-if="!ca || !ca.caLamViec || (chamCong && chamCong.gioCheckOut)">
          <button class="btn btn-outline" style="width: 100%" @click="close">Đóng lại</button>
        </template>

        <template v-else-if="ca && ca.caLamViec && !chamCong">
          <button class="btn btn-outline" @click="close">Hủy bỏ</button>
          <button 
            class="btn btn-primary" 
            @click="checkIn" 
            :disabled="isLoading"
          >
            {{ isLoading ? 'Đang xử lý...' : 'Xác nhận vào ca' }}
          </button>
        </template>

        <template v-else-if="chamCong && !chamCong.gioCheckOut">
          <button class="btn btn-outline" @click="close">Vào ca</button>
          
          <button 
            class="btn btn-primary btn-danger-custom" 
            @click="checkOut" 
            :disabled="isLoading || isChuaHetCa"
          >
            {{ isLoading ? 'Đang xử lý...' : (isChuaHetCa ? 'Chưa tới giờ nghỉ' : 'Kết thúc ca') }}
          </button>
        </template>

      </div>

    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, onUnmounted, computed } from "vue"; 
import Swal from 'sweetalert2';

const props = defineProps(["ca", "idNv", "tenNv", "token"]);
const emit = defineEmits(["close"]);

const show = ref(true);
const isReady = ref(false); 
const isLoading = ref(false);

const form = ref({
  tienMat: 0,
  tienTaiKhoan: 0
});

const chamCong = ref(null); 
const currentDateObj = ref(new Date()); 
const currentTime = ref('');
let timer;

const updateTime = () => {
  currentDateObj.value = new Date(); 
  currentTime.value = currentDateObj.value.toLocaleTimeString('vi-VN') + ' ' + currentDateObj.value.toLocaleDateString('vi-VN');
};

const isChuaHetCa = computed(() => {
  if (!props.ca || !props.ca.caLamViec || !props.ca.caLamViec.gioKetThuc) return false;

  const endTimeStr = props.ca.caLamViec.gioKetThuc; 
  const [hours, minutes] = endTimeStr.split(':');
  
  const endTime = new Date();
  endTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  return currentDateObj.value.getTime() < endTime.getTime(); 
});

const headers = {
  Authorization: `Bearer ${props.token}`
};

// ==========================================
// CẤU HÌNH THIẾT KẾ CHUNG CHO SWEETALERT2
// ==========================================
const customSwalConfig = {
  customClass: {
    popup: 'custom-swal-popup',
    title: 'custom-swal-title',
    htmlContainer: 'custom-swal-text',
    confirmButton: 'custom-swal-confirm-btn',
    cancelButton: 'custom-swal-cancel-btn',
    actions: 'custom-swal-actions'
  },
  buttonsStyling: false, // Tắt style mặc định để dùng CSS tự viết
};

const checkIn = async () => {
  isLoading.value = true;
  try {
    await axios.post(
      `http://localhost:8080/api/cham-cong/check-in/${props.idNv}`,
      {
        tienMatDauCa: form.value.tienMat,
        tienTaiKhoanDauCa: form.value.tienTaiKhoan
      },
      { headers }
    );
    
    await Swal.fire({
      ...customSwalConfig,
      title: 'Thành công!',
      text: 'Mở ca làm việc thành công!',
      icon: 'success',
      confirmButtonText: 'Đồng ý',
    });
    
    location.reload(); 
  } catch (error) {
    console.error("Lỗi check-in:", error);
    Swal.fire({
      ...customSwalConfig,
      title: 'Thất bại!',
      text: error.response?.data || "Có lỗi xảy ra khi mở ca.",
      icon: 'error',
      confirmButtonText: 'Đóng',
    });
  } finally {
    isLoading.value = false;
  }
};

const checkOut = async () => {
  const confirmResult = await Swal.fire({
    ...customSwalConfig,
    title: 'Xác nhận kết thúc ca',
    text: "Bạn có chắc chắn muốn kết thúc ca làm việc này không?",
    icon: 'warning', // 👉 Đổi sang icon cảnh báo (dấu chấm than)
    showCancelButton: true,
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy'
  });

  if (!confirmResult.isConfirmed) return;

  isLoading.value = true;
  try {
    await axios.post(
      `http://localhost:8080/api/cham-cong/check-out/${props.idNv}`,
      {},
      { headers }
    );
    
    await Swal.fire({
      ...customSwalConfig,
      title: 'Thành công!',
      text: 'Đã kết thúc ca làm việc!',
      icon: 'success',
      confirmButtonText: 'Đồng ý',
    });
    
    location.reload();
  } catch (error) {
    console.error("Lỗi check-out:", error);
    Swal.fire({
      ...customSwalConfig,
      title: 'Thất bại!',
      text: error.response?.data || "Có lỗi xảy ra khi kết thúc ca.",
      icon: 'error',
      confirmButtonText: 'Đóng',
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  updateTime();
  timer = setInterval(updateTime, 1000);

  if (props.ca && props.ca.caLamViec) {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/cham-cong/hom-nay/${props.idNv}`,
        { headers }
      );
      chamCong.value = res.data;
      
      // Đã có ca nhưng ĐÃ CHẤM CÔNG (đang làm / đã nghỉ) -> Tự đóng, không làm phiền
      if (chamCong.value) {

      }
    } catch (err) {
      chamCong.value = null; 
    }
  } else {
    // Không có ca -> Tự đóng, không làm phiền

  }

  isReady.value = true;
});

onUnmounted(() => {
  clearInterval(timer);
});

const close = () => {
  show.value = false;
  emit("close");
};

</script>

<style scoped>
/* Lớp phủ màn hình tối */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Khung nội dung Modal */
.modal-content {
  background-color: #FFFFFF;
  width: 480px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

@keyframes slideDown {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Header */
.modal-header {
  background-color: #63391F;
  color: #FFFFFF;
  text-align: center;
  padding: 24px 20px;
  border-bottom: 4px solid #452614; 
}

.modal-header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.modal-header p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

/* Body */
.modal-body {
  padding: 25px;
  background-color: #F7F7F7;
}

/* Thông tin NV */
.staff-info {
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #D1D5DB;
}

.staff-code {
  margin: 0;
  font-size: 14px;
  color: #666666;
  font-family: monospace;
  background: #E5E7EB;
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
}

/* Các ô Input */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #333333;
  margin-bottom: 8px;
  font-weight: 600;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-control {
  width: 100%;
  padding: 12px 45px 12px 15px; 
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 15px;
  color: #333333;
  background-color: #FFFFFF;
  box-sizing: border-box;
  outline: none;
  transition: all 0.2s ease;
}

.form-control:focus:not(:disabled) {
  border-color: #63391F;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}

.disabled-input {
  background-color: #E5E7EB;
  color: #6B7280;
  font-weight: 500;
  cursor: not-allowed;
}

.currency-unit {
  position: absolute;
  right: 15px;
  color: #9CA3AF;
  font-size: 14px;
  font-weight: 500;
  pointer-events: none;
}

.previous-balance {
  font-size: 13px;
  color: #6B7280;
  margin-top: -5px;
  margin-bottom: 10px;
  text-align: right;
}

.previous-balance strong {
  color: #63391F;
}

/* Thông báo trạng thái (Alert Boxes) */
.alert-box {
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.alert-box p { margin: 0; line-height: 1.5; }
.alert-icon { font-size: 24px; }

.alert-box.error { 
  background: #FEF2F2; 
  border: 1px solid #FCA5A5; 
  color: #991B1B; 
}

.alert-box.success { 
  background: #ECFDF5; 
  border: 1px solid #A7F3D0; 
  color: #065F46; 
}

.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-box.success .status-title {
  font-weight: 700;
  font-size: 16px;
}

.alert-box.success .status-time { font-size: 14px; }
.alert-box.success .status-note {
  font-size: 13px;
  color: #047857;
  font-style: italic;
  margin-top: 4px;
}

.alert-box.disabled-box { 
  background: #F3F4F6; 
  border: 1px solid #E5E7EB; 
  color: #4B5563; 
}

/* Nút bấm (Footer) */
.modal-footer {
  padding: 20px 25px;
  background-color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid #E2E8F0;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 14px;
  flex: 1;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-outline {
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB;
  color: #666666;
}

.btn-outline:hover { 
  background-color: #F9FAFB; 
  color: #333333;
}

.btn-primary {
  background-color: #63391F;
  color: #FFFFFF;
  box-shadow: 0 4px 6px rgba(99, 57, 31, 0.2);
}

.btn-primary:hover:not(:disabled) { 
  background-color: #452614; 
  transform: translateY(-1px);
}

/* Tùy chỉnh nút Kết thúc ca */
.btn-danger-custom {
  background-color: #DC2626 !important;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);
}

.btn-danger-custom:hover:not(:disabled) {
  background-color: #B91C1C !important;
}

.btn:disabled {
  background-color: #D1D5DB !important;
  color: #9CA3AF !important;
  box-shadow: none !important;
  cursor: not-allowed;
  transform: none !important;
}
</style>

<style>
  div.swal2-container {
    z-index: 10000 !important;
  }

  /* Định dạng popup */
  .custom-swal-popup {
    border-radius: 16px !important;
    padding: 2em !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
  }

  /* Tiêu đề */
  .custom-swal-title {
    color: #63391F !important;
    font-size: 1.25em !important;
    font-weight: 700 !important;
    margin-bottom: 10px !important;
  }

  /* Nội dung */
  .custom-swal-text {
    color: #666666 !important;
    font-size: 1em !important;
  }

  /* Vùng chứa nút bấm */
  .custom-swal-actions {
    display: flex !important;
    gap: 15px !important;
    margin-top: 25px !important;
    width: 100% !important;
  }

  /* Nút Đồng ý */
  .custom-swal-confirm-btn {
    flex: 1;
    background-color: #9b7054 !important; /* Màu nâu nhạt giống thiết kế */
    color: white !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 12px 24px !important;
    font-weight: 600 !important;
    font-size: 1em !important;
    cursor: pointer !important;
    transition: background-color 0.2s ease !important;
  }

  .custom-swal-confirm-btn:hover {
    background-color: #63391F !important; /* Đậm hơn khi hover */
  }

  /* Nút Hủy */
  .custom-swal-cancel-btn {
    flex: 1;
    background-color: #F3F4F6 !important; /* Nền xám nhạt */
    color: #4B5563 !important; /* Chữ xám đậm */
    border: none !important;
    border-radius: 8px !important;
    padding: 12px 24px !important;
    font-weight: 600 !important;
    font-size: 1em !important;
    cursor: pointer !important;
    transition: background-color 0.2s ease !important;
  }

  .custom-swal-cancel-btn:hover {
    background-color: #E5E7EB !important;
  }
</style>