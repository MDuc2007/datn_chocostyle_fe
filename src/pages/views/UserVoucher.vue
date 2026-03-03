<template>
  <div class="app-container">
    <Header></Header>

    <div class="breadcrumb">
      <span @click="$router.push('/')">Trang chủ</span>
      <span class="separator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </span>
      <span class="current">Kho Voucher</span>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="main-card form-page-animation">
          
          <div class="header-simple voucher-header">
            <div>
              <h2 class="page-title">Kho Voucher</h2>
              <p class="page-subtitle">Quản lý và lưu trữ các mã giảm giá của bạn</p>
            </div>
            <div class="voucher-input-group">
              <input type="text" placeholder="Nhập mã voucher..." class="form-input" />
              <button class="btn-orange hover-effect">Lưu mã</button>
            </div>
          </div>

          <div class="card-body">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Đang tải danh sách voucher...</p>
            </div>

            <div v-else-if="vouchers.length === 0" class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path d="M20 12V22H4V12"></path><path d="M22 7H2v5h20V7z"></path><path d="M12 22V7"></path><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
              <p>Bạn chưa có mã giảm giá nào.</p>
            </div>

            <div v-else class="voucher-grid">
              <div v-for="v in vouchers" :key="v.id" class="voucher-ticket">
                
                <div class="ticket-left">
                  <div class="brand-logo">CHOCO</div>
                  <div class="ticket-name">
                    {{ v.loaiGiam === "PERCENT" ? "Voucher %" : "Voucher Tiền" }}
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

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-indicator"></div>
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>
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

// State dùng cho Toast mới
const toast = ref({ show: false, message: "", type: "success" });

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
      }
    );

    vouchers.value = res.data;
  } catch (e) {
    console.error("Lỗi tải voucher:", e);
    showToast("Không thể tải danh sách voucher", "error");
  } finally {
    loading.value = false;
  }
};

// Hàm hiển thị Toast chuẩn hóa
const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => (toast.value.show = false), 3000);
};

// Hàm sao chép mã
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
/* ================== LAYOUT CHUNG ================== */
.app-container {
  background: #f4f6f8;
  min-height: 100vh;
  font-family: 'Inter', "Segoe UI", sans-serif;
  color: #333;
}

.breadcrumb {
  max-width: 1280px;
  margin: 20px auto;
  padding: 0 20px;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}
.breadcrumb span { cursor: pointer; transition: color 0.2s; }
.breadcrumb span:hover { color: #6b3f1e; }
.breadcrumb .separator svg { width: 14px; height: 14px; margin-top: 3px; }
.breadcrumb .current { font-weight: 500; color: #111827; cursor: default; }

.main-layout {
  max-width: 1280px;
  margin: 0 auto 50px auto;
  padding: 0 20px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.content-section { flex: 1; min-width: 0; }

/* ================== MAIN CARD & HEADER ================== */
.main-card {
  background: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}

.header-simple { 
  margin-bottom: 25px; 
  border-bottom: 1px solid #f3f4f6; 
  padding-bottom: 20px;
}

.voucher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #111827; }
.page-subtitle { margin: 0; font-size: 14px; color: #6b7280; }

/* ================== INPUT & BUTTONS ================== */
.voucher-input-group {
  display: flex;
  gap: 10px;
}

.form-input { 
  height: 38px; 
  border: 1px solid #d1d5db; 
  border-radius: 6px; 
  font-size: 14px; 
  outline: none; 
  background: #fff; 
  color: #111827; 
  width: 250px;
  transition: all 0.2s; 
}
.form-input:focus { border-color: #6b3f1e; box-shadow: 0 0 0 3px rgba(107, 63, 30, 0.1); }

.btn-orange { 
  background: linear-gradient(135deg, #6b3f1e, #b8895d); 
  color: #fff; 
  border: none; 
  padding: 0 20px; 
  height: 42px;
  border-radius: 6px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: 0.2s; 
}
.btn-orange:hover { box-shadow: 0 4px 10px rgba(107, 63, 30, 0.3); transform: translateY(-1px);}

/* ================== TRẠNG THÁI LOADING & EMPTY ================== */
.loading-state { text-align: center; padding: 60px 0; color: #6b7280; }
.spinner { border: 3px solid #f3f4f6; border-top: 3px solid #6b3f1e; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 60px 20px; color: #9ca3af; background: #fafafa; border-radius: 8px; border: 1px dashed #e5e7eb; }
.empty-icon { width: 48px; height: 48px; color: #d1d5db; margin-bottom: 15px; }

/* ================== VOUCHER GRID ================== */
.voucher-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  padding-top: 10px;
}

.voucher-ticket {
  display: flex;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  height: 140px;
}
.voucher-ticket:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(107, 63, 30, 0.08);
  border-color: #d6bda9;
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
  position: relative;
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
  font-weight: 800;
  font-size: 18px;
  margin-bottom: 5px;
  letter-spacing: 1px;
}
.ticket-name {
  font-size: 11px;
  opacity: 0.9;
  text-align: center;
  text-transform: uppercase;
  padding: 0 10px;
}

.ticket-right {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.top-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.voucher-title {
  font-weight: 700;
  color: #111827;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
.voucher-code-badge {
  font-size: 11px;
  background: #f3f4f6;
  color: #4b5563;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
  margin-bottom: 2px;
  font-weight: 500;
}

.voucher-desc {
  color: #dc2626;
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
  color: #6b7280;
}

.bottom-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  border-top: 1px dashed #f3f4f6;
  padding-top: 8px;
}
.expiry {
  font-size: 11px;
  color: #9ca3af;
}
.btn-use {
  border: 1px solid #6b3f1e;
  color: #6b3f1e;
  background: white;
  padding: 4px 14px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-use:hover {
  background: #6b3f1e;
  color: white;
}

/* ================== TOAST ================== */
.toast-notification { position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 250px; padding: 12px 15px; border-radius: 6px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); font-size: 14px; font-weight: 500; background: #F0FDF4; color: #111827; }
.toast-indicator { width: 6px; height: 100%; background-color: #10B981; position: absolute; left: 0; top: 0; border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
.toast-content { margin-left: 10px; }
.toast-notification.error { background: #FEF2F2; color: #991b1b; }
.toast-notification.error .toast-indicator { background-color: #EF4444; }

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s; }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }
.fade-in { animation: fadeIn 0.4s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* ================== RESPONSIVE ================== */
@media (max-width: 768px) {
  .main-layout { flex-direction: column; }
  .voucher-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .voucher-input-group { width: 100%; }
  .voucher-input-group input { flex: 1; width: 100%; }
  .voucher-grid { grid-template-columns: 1fr; }
}
</style>