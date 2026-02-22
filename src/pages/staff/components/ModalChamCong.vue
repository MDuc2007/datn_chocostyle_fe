<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      
      <div class="modal-header animated-gradient">
        <h3>MỞ CA LÀM VIỆC</h3>
        <p>Hệ thống quản lý bán hàng ChocoStyle Shop</p>
      </div>

      <div class="modal-body">
        
        <div class="staff-info">
          <p class="staff-code">Nhân viên : {{ tenNv }} • {{ currentTime }}</p>
        </div>

        <div v-if="!ca || !ca.caLamViec" class="alert-box error">
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
                <input type="number" v-model="form.tienMat" class="form-control" />
                <span class="currency-unit">VNĐ</span>
              </div>
            </div>
            <div class="form-group">
              <label>Tiền tài khoản đầu ca</label>
              <div class="input-wrapper">
                <input type="number" v-model="form.tienTaiKhoan" class="form-control" />
                <span class="currency-unit">VNĐ</span>
              </div>
            </div>
            <p class="previous-balance">Số dự kiến từ ca trước: <strong>0 VNĐ</strong></p>
          </div>

          <div v-else-if="chamCong && !chamCong.gioCheckOut" class="alert-box success">
            <p class="status-title">✅ Đang trong ca làm việc</p>
            <p>Check-in lúc: <strong>{{ chamCong.gioCheckIn }}</strong></p>
            <p class="status-note">Hãy bấm kết thúc ca khi bạn làm xong nhé!</p>
          </div>
          
          <div v-else class="alert-box disabled">
            <p>Ca làm việc hôm nay của bạn đã hoàn thành.</p>
          </div>
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn btn-outline" @click="close">Chế độ xem</button>

        <template v-if="ca && ca.caLamViec">
          <button 
            v-if="!chamCong" 
            class="btn btn-primary animated-gradient" 
            @click="checkIn" 
            :disabled="isLoading"
          >
            {{ isLoading ? 'Đang xử lý...' : 'Xác nhận vào ca' }}
          </button>

          <button 
            v-else-if="chamCong && !chamCong.gioCheckOut" 
            class="btn btn-danger" 
            @click="checkOut" 
            :disabled="isLoading"
          >
            {{ isLoading ? 'Đang xử lý...' : 'Kết thúc ca' }}
          </button>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, onUnmounted } from "vue";
import Swal from 'sweetalert2'; // 👉 Thêm import SweetAlert2

// Thêm tenNv vào danh sách nhận dữ liệu
const props = defineProps(["ca", "idNv", "tenNv", "token"]);
const emit = defineEmits(["close"]);

const show = ref(true);
const isLoading = ref(false);

const form = ref({
  tienMat: 0,
  tienTaiKhoan: 0
});

const chamCong = ref(null); 

const currentTime = ref('');
let timer;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('vi-VN') + ' ' + now.toLocaleDateString('vi-VN');
};

const headers = {
  Authorization: `Bearer ${props.token}`
};

// HÀM MỞ CA VỚI SWEETALERT2
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
    
    // Báo thành công
    await Swal.fire({
      title: 'Thành công!',
      text: 'Mở ca làm việc thành công!',
      icon: 'success',
      confirmButtonColor: '#63391F'
    });
    
    location.reload(); 
  } catch (error) {
    console.error("Lỗi check-in:", error);
    
    // Báo lỗi
    Swal.fire({
      title: 'Thất bại!',
      text: error.response?.data || "Có lỗi xảy ra khi mở ca.",
      icon: 'error',
      confirmButtonColor: '#63391F'
    });
  } finally {
    isLoading.value = false;
  }
};

// HÀM KẾT THÚC CA VỚI SWEETALERT2
const checkOut = async () => {
  // Thêm popup hỏi lại xem có chắc chắn muốn đóng ca không
  const confirmResult = await Swal.fire({
    title: 'Xác nhận kết thúc ca',
    text: "Bạn có chắc chắn muốn kết thúc ca làm việc này không?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#63391F',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy bỏ'
  });

  if (!confirmResult.isConfirmed) return;

  isLoading.value = true;
  try {
    await axios.post(
      `http://localhost:8080/api/cham-cong/check-out/${props.idNv}`,
      {},
      { headers }
    );
    
    // Báo thành công
    await Swal.fire({
      title: 'Thành công!',
      text: 'Đã kết thúc ca làm việc!',
      icon: 'success',
      confirmButtonColor: '#63391F'
    });
    
    location.reload();
  } catch (error) {
    console.error("Lỗi check-out:", error);
    
    // Báo lỗi
    Swal.fire({
      title: 'Thất bại!',
      text: error.response?.data || "Có lỗi xảy ra khi kết thúc ca.",
      icon: 'error',
      confirmButtonColor: '#63391F'
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
    } catch (err) {
      chamCong.value = null;
    }
  }
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
/* ================= Biến màu sắc ================= */
:root {
  --primary-color: #63391F;
  --primary-light: #8a5735;
  --primary-dark: #452614;
  --bg-color: #F7F7F7;
  --white-color: #FFFFFF;
  --text-main: #333333;
  --text-muted: #666666;
  --border-color: #E2E8F0;
}

/* ================= HIỆU ỨNG SÓNG GRADIENT CỦA BẠN ================= */
.animated-gradient {
  background: linear-gradient(90deg, #6b3f23 0%, #c89b6d 25%, #5a3420 50%, #c89b6d 75%, #6b3f23 100%);
  background-size: 200% 100%;
  color: white;
  animation: gradientWave 2s linear infinite;
  border: none;
}

@keyframes gradientWave { 
  0% { background-position: 100% 0; } 
  100% { background-position: 0 0; } 
}

/* Lớp phủ màn hình tối */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
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
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Header */
.modal-header {
  text-align: center;
  padding: 20px 20px;
  border-bottom: 3px solid #452614;
}

.modal-header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.modal-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.85;
}

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

.staff-name {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: #333333;
}

.staff-code {
  margin: 0;
  font-size: 14px;
  color: #666666;
  font-family: monospace;
  background: #E5E7EB;
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
}

/* Các ô Input */
.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #4B5563;
  margin-bottom: 6px;
  font-weight: 600;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-control {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 15px;
  color: #333333;
  background-color: #FFFFFF;
  box-sizing: border-box;
  outline: none;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #63391F;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.15);
}

.disabled-input {
  background-color: #E5E7EB;
  color: #6B7280;
  font-weight: 500;
  cursor: not-allowed;
  border-color: #D1D5DB;
}

.currency-unit {
  position: absolute;
  right: 14px;
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

/* Thông báo trạng thái */
.alert-box {
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  border: 1px solid transparent;
}

.alert-box p {
  margin: 0;
  line-height: 1.5;
}

.alert-box.error { 
  background: #FEF2F2; 
  border-color: #FCA5A5; 
  color: #991B1B; 
}

.alert-box.success { 
  background: #ECFDF5; 
  border-color: #A7F3D0; 
  color: #065F46; 
}

.alert-box.success .status-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 6px;
}

.alert-box.success .status-note {
  font-size: 12px;
  color: #047857;
  margin-top: 6px;
  font-style: italic;
}

.alert-box.disabled { 
  background: #F3F4F6; 
  border-color: #E5E7EB; 
  color: #4B5563; 
}

/* Nút bấm (Footer) */
.modal-footer {
  padding: 16px 25px;
  background-color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid #E5E7EB;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 14px;
  flex: 1;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-outline {
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB;
  color: #4B5563;
}

.btn-outline:hover { 
  background-color: #F3F4F6; 
  color: #111827;
}

.btn-primary {
  box-shadow: 0 2px 4px rgba(99, 57, 31, 0.2);
}

.btn-primary:hover:not(:disabled) { 
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(99, 57, 31, 0.3);
}

.btn-danger {
  background-color: #DC2626;
  color: #FFFFFF;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

.btn-danger:hover:not(:disabled) { 
  background-color: #B91C1C; 
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
  animation: none !important; /* Tắt hiệu ứng sóng khi nút bị vô hiệu hóa */
  background: #a8a29e !important;
}
</style>