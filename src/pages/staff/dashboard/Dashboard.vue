<template>
  <div class="dashboard-page">
    
    <div class="dashboard-header">
      <div class="welcome-section">
        <h2>Xin chào, {{ staffName || 'Nhân viên' }}! 👋</h2>
        <p class="current-date">{{ currentTime }}</p>
      </div>
      
      <div class="shift-summary">
        <div class="shift-info">
          <span class="shift-name">Ca làm việc: <strong>{{ shiftInfo.shiftName }}</strong></span>
          <span class="shift-time">{{ shiftInfo.startTime }} - {{ shiftInfo.endTime }}</span>
        </div>
        <div class="shift-revenue">
          <span class="label">Tiền mặt trong két:</span>
          <span class="amount">{{ formatCurrency(shiftInfo.currentCash) }}</span>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <router-link to="/staff/sales" class="action-btn primary">
        <span class="icon">🛒</span>
        <div class="text">
          <strong>Bán hàng ngay</strong>
          <span>Mở màn hình POS</span>
        </div>
      </router-link>

      <router-link to="/staff/invoice" class="action-btn secondary">
        <span class="icon">🧾</span>
        <div class="text">
          <strong>Quản lý Hóa đơn</strong>
          <span>Tra cứu & Đổi trả</span>
        </div>
      </router-link>

      <router-link to="/staff/customer" class="action-btn outline">
        <span class="icon">👥</span>
        <div class="text">
          <strong>Khách hàng</strong>
          <span>Thêm/Sửa thông tin</span>
        </div>
      </router-link>
    </div>

    <div class="dashboard-grid">
      
      <div class="dashboard-card orders-card">
        <div class="card-header">
          <h3>Trạng thái đơn(Hôm nay)</h3>
          <router-link to="/staff/online-orders" class="view-all">Xem tất cả</router-link>
        </div>
        <div class="status-grid">
          <div class="status-box pending">
            <div class="status-info"><span class="icon">⏳</span> <span class="label">Chờ xác nhận</span></div>
            <span class="value">{{ orderStats.pending }}</span>
          </div>
          <div class="status-box delivering">
            <div class="status-info"><span class="icon">🚚</span> <span class="label">Đang giao</span></div>
            <span class="value">{{ orderStats.delivering }}</span>
          </div>
          <div class="status-box completed">
            <div class="status-info"><span class="icon">✅</span> <span class="label">Hoàn thành</span></div>
            <span class="value">{{ orderStats.completed }}</span>
          </div>
          <div class="status-box cancelled">
            <div class="status-info"><span class="icon">❌</span> <span class="label">Đã hủy</span></div>
            <span class="value">{{ orderStats.cancelled }}</span>
          </div>
        </div>
      </div>

      <div class="dashboard-card recent-card">
        <div class="card-header">
          <h3>Giao dịch gần nhất</h3>
        </div>
        <div class="recent-list">
          <div 
            v-for="(hd, index) in recentInvoices" 
            :key="index" 
            class="recent-item hover-item" 
            @click="goToInvoiceDetail(hd.id)"
          >
            <div class="item-left">
              <span class="hd-code">{{ hd.maHoaDon }}</span>
              <span class="hd-time">{{ formatTimeOnly(hd.ngayTao) }}</span>
            </div>
            <div class="item-right">
              <span class="hd-total">{{ formatCurrency(hd.tongTienThanhToan) }}</span>
              <span class="hd-type" :class="hd.pttt === 'Tiền mặt' ? 'cash' : 'bank'">
                {{ hd.pttt || 'Tiền mặt' }}
              </span>
            </div>
          </div>
          <div v-if="recentInvoices.length === 0" class="empty-state">
            Chưa có giao dịch nào...
          </div>
        </div>
      </div>

    </div>

    <ModalChamCong
      v-if="showModal"
      :ca="ca"
      :idNv="idNv"
      :tenNv="staffName" 
      :token="token"
      @close="showModal = false"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";
import ModalChamCong from "../components/ModalChamCong.vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

// --- AUTH & USER INFO ---
const idNv = localStorage.getItem("idNv") || JSON.parse(localStorage.getItem("user") || "{}").id;
const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user") || "{}").accessToken;

// --- TÊN NHÂN VIÊN VỚI XỬ LÝ AN TOÀN ---
const staffName = ref("");

// Hàm lấy tên nhân viên an toàn (cùng logic với ModalChamCong)
const getStaffName = () => {
  // Ưu tiên lấy từ localStorage tenNv
  let nameRaw = localStorage.getItem("tenNv");
  
  // Nếu không có hoặc là giá trị không hợp lệ, thử parse từ object user
  if (!nameRaw || nameRaw === "undefined" || nameRaw === "null") {
    try {
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      nameRaw = userObj.hoTen || userObj.fullName || userObj.tenNv || "";
    } catch (e) {
      nameRaw = "";
    }
  }
  
  return nameRaw || "";
};

const headers = { Authorization: `Bearer ${token}` };

// --- MODAL & CA LÀM VIỆC ---
const ca = ref(null);
const showModal = ref(false);

// --- DASHBOARD DATA ---
const currentTime = ref('');
let timer = null;

const shiftInfo = ref({
  shiftName: 'Chưa xác định',
  startTime: '--:--',
  endTime: '--:--',
  currentCash: 0
});

const orderStats = ref({
  pending: 0,
  delivering: 0,
  completed: 0,
  cancelled: 0
});

const recentInvoices = ref([]);

// --- HELPER FUNCTIONS ---
const formatCurrency = (val) => {
  if (!val) return "0 ₫";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const formatTimeOnly = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleDateString('vi-VN', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
const goToInvoiceDetail = (id) => {
  if (!id) {
    console.error("Lỗi: Không tìm thấy ID hóa đơn!");
    return;
  }
  // Tự động nhận diện quyền Staff hoặc Admin
  const basePath = route.path.includes('/staff') ? '/staff' : '/admin';
  router.push(`${basePath}/invoice/detail/${id}`);
};
// --- API FUNCTIONS FOR REAL DATA ---
// --- API FUNCTIONS FOR REAL DATA ---
// --- API FUNCTIONS FOR REAL DATA ---
// --- API FUNCTIONS FOR REAL DATA ---
// --- API FUNCTIONS FOR REAL DATA ---
const fetchDashboardStats = async () => {
  try {
    // Gọi API lấy 50 giao dịch gần nhất
    const resInvoices = await axios.get(
      `http://localhost:8080/api/hoa-don/dashboard/recent`, 
      { headers }
    );

    if (resInvoices.data) {
      const allInvoices = resInvoices.data;

      // 1. LẤY 5 GIAO DỊCH MỚI NHẤT CHO BẢNG BÊN PHẢI
      recentInvoices.value = allInvoices.slice(0, 5);

      // 2. ĐẾM TRẠNG THÁI ĐƠN CỦA "HÔM NAY"
      // Lấy chuỗi ngày hôm nay theo định dạng YYYY-MM-DD
      const today = new Date();
      today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
      const todayStr = today.toISOString().split('T')[0];
      
      let pending = 0, delivering = 0, completed = 0, cancelled = 0;
      
      allInvoices.forEach(hd => {
         // Lấy ngày tạo của hóa đơn (YYYY-MM-DD)
         const hdDate = hd.ngayTao ? hd.ngayTao.split('T')[0] : '';
         
         // CHỈ ĐẾM CÁC ĐƠN CỦA NGÀY HÔM NAY
         if (hdDate === todayStr) {
             // 0: Chờ xác nhận, 1: Đã xác nhận
             if (hd.trangThai === 0 || hd.trangThai === 1) pending++;
             
             // 2: Chờ giao, 3: Đang giao
             else if (hd.trangThai === 2 || hd.trangThai === 3) delivering++;
             
             // 4: Hoàn thành (Bao gồm cả đơn POS bán tại quầy)
             else if (hd.trangThai === 4) completed++;
             
             // 5: Đã hủy
             else if (hd.trangThai === 5) cancelled++;
         }
      });

      // Cập nhật lên giao diện 4 ô màu
      orderStats.value = {
        pending: pending,
        delivering: delivering,
        completed: completed,
        cancelled: cancelled
      };
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu dashboard:", error);
  }
};

// --- LIFECYCLE ---
onMounted(async () => {
  updateTime();
  timer = setInterval(updateTime, 60000); // Cập nhật đồng hồ mỗi phút
  
  // Lấy tên nhân viên khi mount
  staffName.value = getStaffName();
  
  if (!idNv) return;

  try {
    // 1. Kiểm tra lịch làm việc hôm nay (GIỮ NGUYÊN LOGIC)
    const resCa = await axios.get(`http://localhost:8080/api/lich-lam-viec/check-ca-hom-nay/${idNv}`, { headers });
    
    let currentCa = null;
    if (resCa.data && Array.isArray(resCa.data) && resCa.data.length > 0) {
        currentCa = resCa.data[0];
    } else if (resCa.data && resCa.data.caLamViec) {
        currentCa = resCa.data;
    }

    if (currentCa) {
       ca.value = currentCa;
       
       // CẬP NHẬT THÔNG TIN CA LÊN GIAO DIỆN
       if (currentCa.caLamViec) {
          shiftInfo.value.shiftName = currentCa.caLamViec.tenCa;
          shiftInfo.value.startTime = currentCa.caLamViec.gioBatDau;
          shiftInfo.value.endTime = currentCa.caLamViec.gioKetThuc;
       }

       // 👉 ƯU TIÊN 1: NẾU TỔNG CA ĐÃ BỊ ĐÓNG
       if (currentCa.trangThai === 1) {
           showModal.value = true;
           window.dispatchEvent(new CustomEvent('set-view-only', { detail: true }));
           return; 
       }

       // 👉 ƯU TIÊN 2: NẾU CA ĐANG MỞ
       try {
         const resChamCong = await axios.get(`http://localhost:8080/api/cham-cong/hom-nay/${idNv}`, { headers });
         
         if (!resChamCong.data || resChamCong.data === "") {
             // Chưa mở ca
             showModal.value = true;
             window.dispatchEvent(new CustomEvent('set-view-only', { detail: true }));
         } else {
             // Đang trong ca -> Cập nhật số tiền trong két thực tế!
             showModal.value = false;
             window.dispatchEvent(new CustomEvent('set-view-only', { detail: false }));
             
             // Tiền mặt hiện tại = Tiền mặt đầu ca + Doanh thu tiền mặt bán được
             const tienDauCa = resChamCong.data.tienMatDauCa || 0;
             const doanhThuMat = resChamCong.data.doanhThuTienMat || 0;
             shiftInfo.value.currentCash = tienDauCa + doanhThuMat;
             
             // Gọi hàm tải dữ liệu hóa đơn/thống kê
             fetchDashboardStats();
         }
       } catch (err) {
           showModal.value = true;
       }

    } else {
       // TRƯỜNG HỢP KHÔNG CÓ CA LÀM VIỆC
       ca.value = null;
       showModal.value = true;
       window.dispatchEvent(new CustomEvent('set-view-only', { detail: true }));
    }

  } catch (err) {
    console.log("Lỗi check ca:", err);
    ca.value = null;
    showModal.value = true;
    window.dispatchEvent(new CustomEvent('set-view-only', { detail: true }));
  }
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100%;
}

/* HEADER CA LÀM VIỆC */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid #eaeaea;
  margin-bottom: 20px;
  border-left: 5px solid #9b7054;
}

.welcome-section h2 {
  margin: 0 0 5px 0;
  color: #63391F;
  font-size: 22px;
  font-weight: 700;
}

.current-date {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.shift-summary {
  display: flex;
  gap: 30px;
  text-align: right;
}

.shift-info, .shift-revenue {
  display: flex;
  flex-direction: column;
}

.shift-info .shift-name { font-size: 15px; color: #333; margin-bottom: 3px; }
.shift-info .shift-time { font-size: 13px; color: #666; }

.shift-revenue .label { font-size: 13px; color: #666; margin-bottom: 3px; }
.shift-revenue .amount {
  font-size: 20px;
  font-weight: 700;
  color: #2F855A;
}

/* THAO TÁC NHANH */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.action-btn .icon { font-size: 30px; }
.action-btn .text strong { display: block; font-size: 16px; margin-bottom: 3px; }
.action-btn .text span { font-size: 13px; opacity: 0.9; }

.action-btn.primary { background: #63391F; color: white; }
.action-btn.secondary { background: #fff; border: 1px solid #63391F; color: #63391F; }
.action-btn.outline { background: #fff; border: 1px solid #ddd; color: #333; }

/* LƯỚI BÊN DƯỚI */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid #eaeaea;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 { margin: 0; font-size: 16px; color: #63391F; font-weight: 700;}
.view-all { color: #63391F; text-decoration: none; font-size: 13px; font-weight: 600; }

/* TRẠNG THÁI ĐƠN HÀNG */
.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.status-box {
  padding: 20px;
  border-radius: 8px;
  border: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 14px; }
.status-box .value { font-size: 24px; font-weight: 700; }

.pending { background-color: #FFF8EE; border-color: #FFE6C7; color: #C05621; }
.delivering { background-color: #F0F7FF; border-color: #D6E8FF; color: #2B6CB0; }
.completed { background-color: #F0FFF4; border-color: #C6F6D5; color: #2F855A; }
.cancelled { background-color: #FFF5F5; border-color: #FED7D7; color: #C53030; }

/* LỊCH SỬ GIAO DỊCH */
.recent-list { display: flex; flex-direction: column; gap: 10px; }
.recent-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 10px; /* Thêm padding để không bị sát lề khi hover */
  border-bottom: 1px dashed #eee;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.recent-item:last-child { border-bottom: none; }

/* 👉 BƯỚC 3: CSS Hiệu ứng hover */
.recent-item.hover-item {
  cursor: pointer;
}
.recent-item.hover-item:hover {
  background-color: #fdf8f6; /* Nền nâu cực nhạt */
  transform: translateX(4px); /* Trượt nhẹ sang phải */
  box-shadow: 0 2px 8px rgba(99, 57, 31, 0.05); /* Đổ bóng nhẹ */
  border-bottom-color: transparent; /* Ẩn đường gạch ngang khi hover */
}
.item-left, .item-right { display: flex; flex-direction: column; }
.item-right { text-align: right; }
.hd-code { font-weight: 600; color: #333; font-size: 14px;}
.hd-time { font-size: 12px; color: #888; margin-top: 3px;}
.hd-total { font-weight: bold; color: #2F855A; font-size: 15px;}
.hd-type { font-size: 12px; margin-top: 3px; font-weight: 500;}
.hd-type.cash { color: #C05621; }
.hd-type.bank { color: #2B6CB0; }
.empty-state { text-align: center; color: #888; padding: 20px 0; font-size: 14px; font-style: italic; }

@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .quick-actions { grid-template-columns: repeat(2, 1fr); }
}
</style>