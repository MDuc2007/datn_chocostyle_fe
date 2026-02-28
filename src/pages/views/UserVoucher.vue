<template>
  <div class="app-container">
    <Header></Header>

    <div class="breadcrumb">
      <span @click="$router.push('/')">Trang chủ</span>
      <span class="separator">/</span>
      <span class="current">Kho Voucher</span>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="card">
          <div class="card-header">
            <h3>Kho Voucher</h3>
            <div class="voucher-input-group">
              <input type="text" placeholder="Nhập mã voucher..." />
              <button>Lưu</button>
            </div>
          </div>

          <div class="card-body">
            <div v-if="loading" class="text-center">Đang tải...</div>

            <div v-else-if="vouchers.length === 0" class="empty-state">
              <p>Bạn chưa có mã giảm giá nào.</p>
            </div>

            <div v-else class="voucher-grid">
              <div v-for="v in vouchers" :key="v.id" class="voucher-ticket">
                <div class="ticket-left">
                  <div class="brand-logo">CHOCO</div>
                  <div class="ticket-name">
                    {{
                      v.loaiGiam === "PERCENT" ? "Voucher %" : "Voucher Tiền"
                    }}
                  </div>
                </div>

                <div class="ticket-right">
                  <div class="top-info">
                    <div class="voucher-title">{{ v.tenPgg }}</div>
                    <div class="voucher-code-badge">Mã: {{ v.maPgg }}</div>
                    <div class="voucher-desc">
                      Giảm
                      <span class="highlight">
                        {{
                          v.loaiGiam === "PERCENT"
                            ? v.giaTri + "%"
                            : formatCurrency(v.giaTri)
                        }}
                      </span>
                    </div>
                    <div class="min-spend">
                      Đơn tối thiểu: {{ formatCurrency(v.dieuKienDonHang) }}
                    </div>
                    <div
                      class="max-reduce"
                      v-if="v.loaiGiam === 'PERCENT' && v.giaTriToiDa"
                    >
                      Giảm tối đa: {{ formatCurrency(v.giaTriToiDa) }}
                    </div>
                  </div>

                  <div class="bottom-info">
                    <div class="expiry">
                      HSD: {{ formatDate(v.ngayKetThuc) }}
                    </div>
                    <button class="btn-use" @click="copyCode(v.maPgg)">
                      Sao chép
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer></Footer>

    <div class="toast-container">
      <transition-group name="toast">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="toast"
          :class="notif.type"
        >
          <span class="toast-icon">
            {{
              notif.type === "success"
                ? "✓"
                : notif.type === "error"
                  ? "✕"
                  : "!"
            }}
          </span>
          <span class="toast-message">{{ notif.message }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import ClientSidebar from "../../pages/views/ClientSidebar.vue";

const vouchers = ref([]);
const loading = ref(false);
const notifications = ref([]); // State cho Toast

const fetchVouchers = async () => {
  loading.value = true;
  try {
    const userStr = localStorage.getItem("user");
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const userId = currentUser ? currentUser.id : null;

    const res = await axios.get(
      `http://localhost:8080/admin/voucher/public/my-vouchers`,
      {
        params: { khachHangId: userId },
      },
    );

    vouchers.value = res.data;
  } catch (e) {
    console.error("Lỗi tải voucher:", e);
    showToast("Không thể tải danh sách voucher", "error");
  } finally {
    loading.value = false;
  }
};

// Hàm hiển thị Toast
const showToast = (message, type = "success") => {
  const id = Date.now();
  notifications.value.push({ id, message, type });

  // Tự động tắt sau 3 giây
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 3000);
};

// Hàm sao chép mã (Updated)
const copyCode = (code) => {
  navigator.clipboard
    .writeText(code)
    .then(() => {
      showToast(`Đã sao chép mã: ${code}`, "success");
    })
    .catch(() => {
      showToast("Lỗi khi sao chép", "error");
    });
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

onMounted(() => {
  fetchVouchers();
});
</script>

<style scoped>
/* --- GIỮ NGUYÊN CSS CŨ CỦA BẠN Ở ĐÂY --- */
.app-container {
  background: #f7f9fa;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
}
.breadcrumb {
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 4%;
  font-size: 14px;
  color: #666;
}
.breadcrumb span {
  cursor: pointer;
  transition: 0.2s;
}
.breadcrumb span:hover {
  color: #6b3f1e;
}
.breadcrumb .separator {
  margin: 0 10px;
  cursor: default;
}
.breadcrumb .current {
  font-weight: 600;
  color: #6b3f1e;
}

.main-layout {
  max-width: 1400px;
  margin: 0 auto 40px auto;
  padding: 0 4%;
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.content-section {
  flex: 1;
  min-width: 0;
}

.card {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding-bottom: 20px;
}
.card-header {
  padding: 20px 30px;
  border-bottom: 1px solid #efefef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.voucher-input-group {
  display: flex;
  gap: 10px;
}
.voucher-input-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}
.voucher-input-group button {
  background: #eee;
  border: 1px solid #ddd;
  padding: 0 15px;
  cursor: pointer;
  border-radius: 4px;
}

.card-body {
  padding: 30px;
}
.text-center {
  text-align: center;
  color: #666;
}
.empty-state {
  text-align: center;
  color: #888;
  padding: 40px;
  font-style: italic;
}

.voucher-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.voucher-ticket {
  display: flex;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  position: relative;
  transition: transform 0.2s;
  height: 147px;
}
.voucher-ticket:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ticket-left {
  background: linear-gradient(135deg, #6b3f1e 0%, #8b5a2b 100%);
  color: white;
  width: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 2px dashed #fff;
  flex-shrink: 0;
}
.ticket-left::after {
  content: "";
  position: absolute;
  right: -6px;
  top: 0;
  bottom: 0;
  width: 10px;
  background-image: radial-gradient(circle, #fff 4px, transparent 5px);
  background-size: 10px 15px;
  background-repeat: repeat-y;
}
.brand-logo {
  font-weight: 900;
  font-size: 18px;
  margin-bottom: 5px;
  letter-spacing: 1px;
}
.ticket-name {
  font-size: 11px;
  opacity: 0.9;
  text-align: center;
  text-transform: uppercase;
}

.ticket-right {
  flex: 1;
  padding: 12px 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.top-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.voucher-title {
  font-weight: 700;
  color: #333;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
.voucher-code-badge {
  font-size: 11px;
  background: #f3f3f3;
  color: #555;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
  margin-bottom: 4px;
}

.voucher-desc {
  color: #d0021b;
  font-size: 13px;
  font-weight: 500;
}
.highlight {
  font-weight: 700;
  font-size: 14px;
}

.min-spend,
.max-reduce {
  font-size: 11px;
  color: #666;
}

.bottom-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  border-top: 1px dashed #eee;
  padding-top: 8px;
}
.expiry {
  font-size: 11px;
  color: #999;
}
.btn-use {
  border: 1px solid #6b3f1e;
  color: #6b3f1e;
  background: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  font-weight: 600;
}
.btn-use:hover {
  background: #6b3f1e;
  color: white;
}

/* === TOAST CSS (MỚI & ĐÃ CHỈNH CÂN ĐỐI) === */
.toast-container {
  position: fixed;
  top: 90px; /* Hạ thấp xuống để tránh Header (Header thường cao 60-80px) */
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 350px; /* Giới hạn chiều rộng cho gọn */
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 8px; /* Bo tròn mềm mại hơn */
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background: #fff;
  transition: all 0.3s ease;
  cursor: default;
}

.toast-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

/* Các biến thể màu sắc */
.toast.warning {
  background: #fff8e1;
  color: #b76e00;
  border-left: 5px solid #ffc107;
}

.toast.error {
  background: #fdecea;
  color: #c62828;
  border-left: 5px solid #ef5350;
}

.toast.success {
  background: #e8f5e9;
  color: #2e7d32;
  border-left: 5px solid #66bb6a;
}

/* Hiệu ứng Slide In/Out */
.toast-enter-active {
  animation: slideIn 0.4s ease-out forwards;
}
.toast-leave-active {
  animation: slideOut 0.4s ease-in forwards;
  position: absolute; /* Giúp các toast bên dưới trượt lên mượt mà */
}
.toast-move {
  transition: transform 0.4s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .voucher-input-group {
    width: 100%;
  }
  .voucher-input-group input {
    flex: 1;
  }
  .voucher-grid {
    grid-template-columns: 1fr;
  }

  .toast-container {
    top: 20px;
    left: 20px; /* Trên mobile cho hiện giữa hoặc full width nếu muốn */
    right: 20px;
    max-width: none;
  }
}
</style>
