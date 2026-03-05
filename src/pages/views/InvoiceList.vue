<template>
  <div class="app-container">
    <Header></Header>

    <div class="breadcrumb">
      <span @click="$router.push('/')">Trang chủ</span>
      <span class="separator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </span>
      <span class="current">Đơn mua của tôi</span>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="order-container">
          <div class="modern-tabs">
            <div
              v-for="status in statusTabs"
              :key="status.value"
              class="tab-item"
              :class="{ active: filters.trangThai === status.value }"
              @click="setFilterStatus(status.value)"
            >
              {{ status.label }}
            </div>
          </div>

          <div class="order-list">
            
            <div v-if="filteredInvoices.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 8h-2.4a2 2 0 0 0-1.89-1.33l-3.41-5.12A1 1 0 0 0 12.47 1h-1a1 1 0 0 0-.83.45L7.22 6.57A2 2 0 0 0 5.4 8H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM12 3.12l2.6 3.9H9.4L12 3.12zM21 21H3v-9h18v9z"></path>
                  <circle cx="12" cy="15" r="2"></circle>
                </svg>
              </div>
              
              <div v-if="!isLoggedIn">
                <p>Bạn chưa đăng nhập. Vui lòng đăng nhập để xem lịch sử mua hàng.</p>
                <button class="btn-detail mt-3" @click="$router.push('/login')">
                  Đăng nhập ngay
                </button>
                <p class="mt-3 text-sm">
                  Hoặc <span @click="$router.push('/tra-cuu')" class="link-orange">Tra cứu đơn hàng khách lẻ</span>
                </p>
              </div>
              <p v-else>Chưa có đơn hàng nào ở trạng thái này</p>

            </div>

            <div v-else class="order-card" v-for="hd in filteredInvoices" :key="hd.id">
              
              <div class="order-header">
                <div class="order-id">
                  <svg class="icon-box" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  <span>Đơn hàng: <strong>{{ hd.maHoaDon }}</strong></span>
                </div>
                <div class="order-status" :class="getStatusClass(hd.trangThai)">
                  <span class="status-dot"></span>
                  {{ getStatusName(hd.trangThai) }}
                </div>
              </div>

              <div class="order-body">
                <div class="info-row">
                  <span class="label">Ngày đặt:</span>
                  <span class="value">{{ formatDate(hd.ngayTao) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Cập nhật lần cuối:</span>
                  <span class="value">{{ hd.ngayCapNhat ? formatDate(hd.ngayCapNhat) : formatDate(hd.ngayTao) }}</span>
                </div>
              </div>

              <div class="order-footer">
                <div class="total-price-box">
                  <span class="label">Thành tiền:</span>
                  <span class="money">{{ formatCurrency(hd.tongTien) }}</span>
                </div>
                <div class="action-box">
                  <button class="btn-detail" @click="goToDetail(hd.id)">
                    Xem chi tiết
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer></Footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import ClientSidebar from "../../pages/views/ClientSidebar.vue";

const router = useRouter();
const invoices = ref([]);
const filters = ref({ trangThai: null });
const isLoggedIn = ref(false); // Thêm state kiểm tra đăng nhập

const statusTabs = [
  { label: "Tất cả", value: null },
  { label: "Chờ xác nhận", value: 0 },
  { label: "Đang giao", value: 3 },
  { label: "Hoàn thành", value: 4 },
  { label: "Đã hủy", value: 5 },
];

const fetchMyOrders = async () => {
  try {
    const userStr = localStorage.getItem("user");
    
    // ĐÃ SỬA: Nếu không có user, không đá ra trang login nữa
    if (!userStr) {
      return; 
    }

    const user = JSON.parse(userStr);
    const res = await axios.get("http://localhost:8080/api/hoa-don/my-orders", {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    });
    // Sắp xếp đơn mới nhất lên đầu
    invoices.value = res.data.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
  } catch (error) {
    console.error("Lỗi tải lịch sử đơn hàng:", error);
  }
};

const filteredInvoices = computed(() => {
  if (filters.value.trangThai === null) return invoices.value;
  if (filters.value.trangThai === 3) {
    return invoices.value.filter(
      (hd) => hd.trangThai === 2 || hd.trangThai === 3,
    );
  }
  return invoices.value.filter(
    (hd) => hd.trangThai === filters.value.trangThai,
  );
});

const setFilterStatus = (stt) => {
  filters.value.trangThai = stt;
};

const goToDetail = (id) => {
  router.push({ name: "ClientOrderDetail", params: { id } });
};

const formatCurrency = (val) => {
  if (!val) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit' });
};

const getStatusName = (stt) => {
  const map = {
    0: "Chờ xác nhận",
    1: "Đã xác nhận",
    2: "Chờ giao hàng",
    3: "Đang giao",
    4: "Hoàn thành",
    5: "Đã hủy",
  };
  return map[stt] || "Đang xử lý";
};

const getStatusClass = (stt) => {
  if (stt === 4) return "status-success";
  if (stt === 5) return "status-danger";
  if (stt === 0) return "status-warning";
  return "status-info"; // Đang giao / Đã xác nhận
};

onMounted(() => {
  // Cập nhật trạng thái đăng nhập để render giao diện tương ứng
  isLoggedIn.value = !!localStorage.getItem("user");
  fetchMyOrders();
});
</script>

<style scoped>
/* ================== LAYOUT CHUNG ================== */
.app-container {
  background: #f4f6f8;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
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

.breadcrumb span {
  cursor: pointer;
  transition: color 0.2s;
}

.breadcrumb span:hover {
  color: #6b3f1e;
}

.breadcrumb .separator svg {
  width: 14px;
  height: 14px;
  margin-top: 3px;
}

.breadcrumb .current {
  font-weight: 500;
  color: #111827;
  cursor: default;
}

.main-layout {
  max-width: 1280px;
  margin: 0 auto 50px auto;
  padding: 0 20px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.content-section {
  flex: 1;
  min-width: 0;
}

/* ================== TAB ĐIỀU HƯỚNG MỚI ================== */
.order-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modern-tabs {
  display: flex;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
}

.modern-tabs::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 18px 20px;
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
}

.tab-item:hover {
  color: #6b3f1e;
}

.tab-item.active {
  color: #6b3f1e;
  font-weight: 600;
  border-bottom: 2px solid #6b3f1e;
}

/* ================== CARD ĐƠN HÀNG ================== */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.order-card:hover {
  box-shadow: 0 8px 24px rgba(107, 63, 30, 0.08);
  transform: translateY(-2px);
}

/* Header Card */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px dashed #e5e7eb;
}

.order-id {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
}

.order-id strong {
  font-weight: 600;
  color: #111827;
  letter-spacing: 0.5px;
}

.icon-box {
  width: 18px;
  height: 18px;
  color: #6b3f1e;
}

/* Trạng thái */
.order-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-success { color: #059669; }
.status-success .status-dot { background-color: #059669; box-shadow: 0 0 0 3px #ecfdf5; }

.status-danger { color: #dc2626; }
.status-danger .status-dot { background-color: #dc2626; box-shadow: 0 0 0 3px #fef2f2; }

.status-warning { color: #d97706; }
.status-warning .status-dot { background-color: #d97706; box-shadow: 0 0 0 3px #fffbeb; }

.status-info { color: #0284c7; }
.status-info .status-dot { background-color: #0284c7; box-shadow: 0 0 0 3px #e0f2fe; }

/* Body Card */
.order-body {
  padding: 20px 24px;
}

.info-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  color: #6b7280;
  width: 130px;
}

.info-row .value {
  color: #111827;
  font-weight: 500;
}

/* Footer Card */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fdfdfd;
  border-top: 1px solid #f3f4f6;
}

.total-price-box {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.total-price-box .money {
  color: #ee4d2d; /* Màu cam đỏ chuẩn e-commerce */
  font-size: 18px;
  font-weight: 700;
}

.btn-detail {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-detail:hover {
  background: #6b3f1e;
  border-color: #6b3f1e;
  color: #fff;
}

/* TRẠNG THÁI RỖNG (Empty State) */
.empty-state {
  background: #fff;
  border-radius: 12px;
  padding: 80px 20px;
  text-align: center;
  color: #6b7280;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  margin-bottom: 20px;
  color: #d1d5db;
}

.empty-icon svg {
  width: 64px;
  height: 64px;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

.mt-3 {
  margin-top: 15px;
}

.text-sm {
  font-size: 14px;
}

.link-orange {
  color: #ee4d2d;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
}

/* ================== RESPONSIVE ================== */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  
  .tab-item {
    padding: 14px 16px;
    font-size: 14px;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .total-price-box {
    justify-content: flex-end;
  }
  
  .btn-detail {
    width: 100%;
  }
}
</style>