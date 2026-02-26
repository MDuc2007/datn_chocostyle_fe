<template>
  <Teleport to="body">
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
            <p>Hôm nay bạn không có lịch phân công ca làm việc. Bạn chỉ có thể xem hệ thống.</p>
            
            <div class="custom-swal-actions" style="margin-top: 20px;">
              <button @click="handleLogout" class="custom-swal-confirm-btn" style="background-color: #c53030 !important;">
                Đăng xuất
              </button>
              <button @click="closeModal" class="custom-swal-confirm-btn" style="background-color: #718096 !important;">
                Chỉ xem
              </button>
            </div>
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
                <input
                  type="number"
                  v-model="form.tienMat"
                  class="form-control"
                  placeholder="0"
                />
                <span class="currency-unit">VNĐ</span>
              </div>
            </div>

            <div class="form-group">
              <label>Tiền tài khoản đầu ca</label>
              <div class="input-wrapper">
                <input
                  type="number"
                  v-model="form.tienTaiKhoan"
                  class="form-control"
                  placeholder="0"
                />
                <span class="currency-unit">VNĐ</span>
              </div>
            </div>

            <p class="previous-balance">
              Số dự kiến từ ca trước: <strong>0 VNĐ</strong>
            </p>
          </div>

          <div
            v-else-if="chamCong && !chamCong.gioCheckOut"
            class="alert-box success"
          >
            <div class="status-header">
              <span class="alert-icon">✅</span>
              <p class="status-title">Đang trong ca làm việc</p>
            </div>
            <p class="status-time">
              Check-in lúc: <strong>{{ chamCong.gioCheckIn }}</strong>
            </p>
            <p class="status-note">Hãy bấm kết thúc ca khi bạn làm xong nhé!</p>
          </div>

          <div v-else class="alert-box disabled-box">
            <span class="alert-icon">🔒</span>
            <p>Ca làm việc hôm nay của bạn đã hoàn thành. Bạn hiện đang ở chế độ chỉ xem.</p>
            
            <div class="custom-swal-actions" style="margin-top: 20px;">
              <button @click="handleLogout" class="custom-swal-confirm-btn" style="background-color: #c53030 !important;">
                Đăng xuất
              </button>
              <button @click="closeModal" class="custom-swal-confirm-btn" style="background-color: #718096 !important;">
                Chỉ xem
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <template
          v-if="!ca || !ca.caLamViec || (chamCong && chamCong.gioCheckOut)"
        >
        </template>

        <template v-else-if="ca && ca.caLamViec && !chamCong">
          <button class="btn btn-outline" @click="close">Hủy bỏ</button>
          <button
            class="btn btn-primary"
            @click="checkIn"
            :disabled="isLoading"
          >
            {{ isLoading ? "Đang xử lý..." : "Xác nhận vào ca" }}
          </button>
        </template>

        <template v-else-if="chamCong && !chamCong.gioCheckOut">
          <button class="btn btn-outline" @click="close">Vào ca</button>

          <button
            class="btn btn-primary btn-danger-custom"
            @click="checkOut"
            :disabled="isLoading || isChuaHetCa"
          >
            {{
              isLoading
                ? "Đang xử lý..."
                : isChuaHetCa
                  ? "Chưa tới giờ nghỉ"
                  : "Kết thúc ca"
            }}
          </button>
        </template>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, onUnmounted, computed } from "vue";
import Swal from "sweetalert2";

const props = defineProps(["ca", "idNv", "tenNv", "token"]);
const emit = defineEmits(["close"]);

const show = ref(true);
const isReady = ref(false);
const isLoading = ref(false);

const form = ref({
  tienMat: 0,
  tienTaiKhoan: 0,
});
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("idNv");
  // Chuyển hướng về login (nhớ import router nếu chưa có)
  window.location.href = "/login"; 
};

const closeModal = () => {
  show.value = false;
  emit('update:show', false);
};
const chamCong = ref(null);
const currentDateObj = ref(new Date());
const currentTime = ref("");
let timer;

const updateTime = () => {
  currentDateObj.value = new Date();
  currentTime.value =
    currentDateObj.value.toLocaleTimeString("vi-VN") +
    " " +
    currentDateObj.value.toLocaleDateString("vi-VN");
};

const isChuaHetCa = computed(() => {
  if (!props.ca || !props.ca.caLamViec || !props.ca.caLamViec.gioKetThuc)
    return false;

  const endTimeStr = props.ca.caLamViec.gioKetThuc;
  const [hours, minutes] = endTimeStr.split(":");

  const endTime = new Date();
  endTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  return currentDateObj.value.getTime() < endTime.getTime();
});

const headers = {
  Authorization: `Bearer ${props.token}`,
};

// ==========================================
// CẤU HÌNH THIẾT KẾ CHUNG CHO SWEETALERT2
// ==========================================
const customSwalConfig = {
  customClass: {
    popup: "custom-swal-popup",
    title: "custom-swal-title",
    htmlContainer: "custom-swal-text",
    confirmButton: "custom-swal-confirm-btn",
    cancelButton: "custom-swal-cancel-btn",
    actions: "custom-swal-actions",
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
        tienTaiKhoanDauCa: form.value.tienTaiKhoan,
      },
      { headers },
    );

    await Swal.fire({
      ...customSwalConfig,
      title: "Thành công!",
      text: "Mở ca làm việc thành công!",
      icon: "success",
      confirmButtonText: "Đồng ý",
    });

    location.reload();
  } catch (error) {
    console.error("Lỗi check-in:", error);
    Swal.fire({
      ...customSwalConfig,
      title: "Thất bại!",
      text: error.response?.data || "Có lỗi xảy ra khi mở ca.",
      icon: "error",
      confirmButtonText: "Đóng",
    });
  } finally {
    isLoading.value = false;
  }
};

const checkOut = async () => {
  const confirmResult = await Swal.fire({
    ...customSwalConfig,
    title: "Xác nhận kết thúc ca",
    text: "Bạn có chắc chắn muốn kết thúc ca làm việc này không?",
    icon: "warning", // 👉 Đổi sang icon cảnh báo (dấu chấm than)
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
  });

  if (!confirmResult.isConfirmed) return;

  isLoading.value = true;
  try {
    await axios.post(
      `http://localhost:8080/api/cham-cong/check-out/${props.idNv}`,
      {},
      { headers },
    );
    window.dispatchEvent(new CustomEvent('set-view-only', { detail: true }));
    await Swal.fire({
      ...customSwalConfig,
      title: "Thành công!",
      text: "Đã kết thúc ca làm việc!",
      icon: "success",
      confirmButtonText: "Đồng ý",
    });

    location.reload();
  } catch (error) {
    console.error("Lỗi check-out:", error);
    Swal.fire({
      ...customSwalConfig,
      title: "Thất bại!",
      text: error.response?.data || "Có lỗi xảy ra khi kết thúc ca.",
      icon: "error",
      confirmButtonText: "Đóng",
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
        { headers },
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
  background-color: #ffffff;
  width: 480px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

@keyframes slideDown {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Header */
.modal-header {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: #ffffff;
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
  background-color: #f7f7f7;
}

/* Thông tin NV */
.staff-info {
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #d1d5db;
}

.staff-code {
  margin: 0;
  font-size: 14px;
  color: #666666;
  font-family: monospace;
  background: #e5e7eb;
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
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  color: #333333;
  background-color: #ffffff;
  box-sizing: border-box;
  outline: none;
  transition: all 0.2s ease;
}

.form-control:focus:not(:disabled) {
  border-color: #63391f;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}

.disabled-input {
  background-color: #e5e7eb;
  color: #6b7280;
  font-weight: 500;
  cursor: not-allowed;
}

.currency-unit {
  position: absolute;
  right: 15px;
  color: #9ca3af;
  font-size: 14px;
  font-weight: 500;
  pointer-events: none;
}

.previous-balance {
  font-size: 13px;
  color: #6b7280;
  margin-top: -5px;
  margin-bottom: 10px;
  text-align: right;
}

.previous-balance strong {
  color: #63391f;
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

.alert-box p {
  margin: 0;
  line-height: 1.5;
}
.alert-icon {
  font-size: 24px;
}

.alert-box.error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

.alert-box.success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
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

.alert-box.success .status-time {
  font-size: 14px;
}
.alert-box.success .status-note {
  font-size: 13px;
  color: #047857;
  font-style: italic;
  margin-top: 4px;
}

.alert-box.disabled-box {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

/* Nút bấm (Footer) */
.modal-footer {
  padding: 20px 25px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid #e2e8f0;
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
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  color: #666666;
}

.btn-outline:hover {
  background-color: #f9fafb;
  color: #333333;
}

.btn-primary {
  background-color: #63391f;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(99, 57, 31, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background-color: #452614;
  transform: translateY(-1px);
}

/* Tùy chỉnh nút Kết thúc ca */
.btn-danger-custom {
  background-color: #dc2626 !important;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);
}

.btn-danger-custom:hover:not(:disabled) {
  background-color: #b91c1c !important;
}

.btn:disabled {
  background-color: #d1d5db !important;
  color: #9ca3af !important;
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
}

/* Tiêu đề */
.custom-swal-title {
  color: #63391f !important;
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
  background-color: #63391f !important; /* Đậm hơn khi hover */
}

/* Nút Hủy */
.custom-swal-cancel-btn {
  flex: 1;
  background-color: #f3f4f6 !important; /* Nền xám nhạt */
  color: #4b5563 !important; /* Chữ xám đậm */
  border: none !important;
  border-radius: 8px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  font-size: 1em !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease !important;
}

.custom-swal-cancel-btn:hover {
  background-color: #e5e7eb !important;
}
</style>
