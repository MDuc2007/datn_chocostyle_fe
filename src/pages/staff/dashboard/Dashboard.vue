<template>
  <div class="dashboard-page">
    
    <div class="dashboard-card slider-section">
      <div class="slider-header">
        <h2 class="title">Dashboard</h2>
        <div class="slider-dots">
          <span class="dot active"></span>
          <span class="dot"></span>
        </div>
      </div>

      <div class="slider-container">
        <button class="nav-btn prev">‹</button>
        <div class="image-grid">
          <div class="img-wrapper"><img src="#" alt="" /></div>
          <div class="img-wrapper"><img src="" alt="" /></div>
          <div class="img-wrapper"><img src="" alt="" /></div>
        </div>
        <button class="nav-btn next">›</button>
      </div>
    </div>

    <div class="dashboard-card status-section">
      <h3 class="title">Trạng thái đơn hàng</h3>
      <div class="status-grid">
        <div class="status-box pending">
          <div class="status-info"><span class="icon">⏳</span> <span class="label">Chờ xử lý</span></div>
          <span class="value">{{ orderStats.pending }}</span>
        </div>
        <div class="status-box delivering">
          <div class="status-info"><span class="icon">🚚</span> <span class="label">Đang giao</span></div>
          <span class="value">{{ orderStats.delivering }}</span>
        </div>
        <div class="status-box completed">
          <div class="status-info"><span class="icon">✅</span> <span class="label">Đã hoàn thành</span></div>
          <span class="value">{{ orderStats.completed }}</span>
        </div>
        <div class="status-box cancelled">
          <div class="status-info"><span class="icon">❌</span> <span class="label">Đã hủy</span></div>
          <span class="value">{{ orderStats.cancelled }}</span>
        </div>
      </div>
    </div>

    <div class="info-grid">
      <div class="dashboard-card info-box">
        <div class="info-header"><span class="icon">👔</span><h4>ChocoStyle Shop</h4></div>
        <p class="desc">Chuyên âu phục, vest cưới/tiệc, đo may & chỉnh sửa theo form. Trải nghiệm mua sắm chuyên nghiệp và nhanh gọn.</p>
      </div>
      <div class="dashboard-card info-box">
        <div class="info-header"><span class="icon">📦</span><h4>Quy trình làm việc</h4></div>
        <ul class="info-list">
          <li>Tạo đơn → Xác nhận thông tin</li>
          <li>Chuẩn bị hàng → Bàn giao ship</li>
          <li>Hoàn thành → Lưu lịch sử</li>
        </ul>
      </div>
      <div class="dashboard-card info-box">
        <div class="info-header"><span class="icon">🛡️</span><h4>Chính sách</h4></div>
        <ul class="info-list">
          <li>Đổi size nhanh trong 7 ngày</li>
          <li>Hỗ trợ chỉnh sửa form</li>
          <li>CSKH & bảo hành đường may</li>
        </ul>
      </div>
    </div>

    <ModalChamCong
      v-if="showModal"
      :ca="ca"
      :idNv="idNv"
      :tenNv="tenNv" 
      :token="token"
      @close="showModal = false"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import ModalChamCong from "../components/ModalChamCong.vue";

const orderStats = ref({
  pending: 12,
  delivering: 8,
  completed: 25,
  cancelled: 2
});

const idNv = localStorage.getItem("idNv");
const token = localStorage.getItem("token");
const tenNv = localStorage.getItem("tenNv");

const ca = ref(null);
const showModal = ref(false);

const headers = {
  Authorization: `Bearer ${token}`
};

onMounted(async () => {
  const idNv = localStorage.getItem("idNv");
  if (!idNv) return; // Tránh lỗi gọi API với null

  try {
    const res = await axios.get(`http://localhost:8080/api/lich-lam-viec/check-ca-hom-nay/${idNv}`, { headers });
    
    // Do Backend trả về 200 OK. Nên ta check xem res.data có tồn tại không.
    if (res.data && res.data.caLamViec) {
       // CÓ CA BÌNH THƯỜNG
       ca.value = res.data;
       showModal.value = true;
       window.dispatchEvent(new CustomEvent('set-view-only', { detail: false }));
    } else {
       // HTTP 200 NHƯNG KHÔNG CÓ DATA => KHÔNG CÓ CA
       ca.value = null;
       showModal.value = true;
       window.dispatchEvent(new CustomEvent('set-view-only', { detail: true })); // Phím Layout khóa màn!
    }
  } catch (err) {
    // Nếu API sập hẳn
    console.log("Lỗi check ca:", err);
    ca.value = null;
    showModal.value = true;
    window.dispatchEvent(new CustomEvent('set-view-only', { detail: true }));
  }
});
</script>

<style scoped>
/* Tổng thể trang */
.dashboard-page {
  background-color: #F7F7F7;
  padding: 20px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative; 
}

/* Thẻ Card */
.dashboard-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #eaeaea;
}

/* Tiêu đề chung */
.title {
  font-size: 16px;
  font-weight: 700;
  color: #63391F;
  margin: 0 0 15px 0;
}

/* ================= SLIDER SECTION ================= */
.slider-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.slider-dots { 
  display: flex; 
  gap: 6px; 
}

.dot { 
  width: 8px; 
  height: 8px; 
  border-radius: 50%; 
  background-color: #D1D5DB; 
}

.dot.active { 
  background-color: #63391F; 
}

.slider-container { 
  display: flex; 
  align-items: center; 
  gap: 15px; 
  position: relative; 
}

.nav-btn { 
  background-color: #FFFFFF; 
  border: 1px solid #E2E8F0; 
  border-radius: 50%; 
  width: 40px; 
  height: 40px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 24px; 
  cursor: pointer; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.05); 
  color: #666666; 
  z-index: 2; 
  transition: all 0.2s ease;
}

.nav-btn:hover { 
  background-color: #F7F7F7; 
  color: #63391F;
  border-color: #63391F;
}

.image-grid { 
  display: flex; 
  flex: 1; 
  gap: 20px; 
  overflow: hidden; 
}

.img-wrapper { 
  flex: 1; 
  border-radius: 12px; 
  overflow: hidden; 
  height: 350px; 
  background-color: #E2E8F0; /* Màu nền chờ cho ảnh */
}

.img-wrapper img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}

/* ================= STATUS SECTION ================= */
.status-grid { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 15px; 
}

.status-box { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 15px 20px; 
  border-radius: 8px; 
  border: 1px solid transparent; 
}

.status-info { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  font-weight: 600; 
  font-size: 14px; 
}

.status-box .value { 
  font-size: 24px; 
  font-weight: 700; 
}

/* Giữ nguyên màu sắc semantic cho trạng thái đơn hàng để dễ nhận diện */
.pending { background-color: #FFF8EE; border-color: #FFE6C7; color: #C05621; }
.delivering { background-color: #F0F7FF; border-color: #D6E8FF; color: #2B6CB0; }
.completed { background-color: #F0FFF4; border-color: #C6F6D5; color: #2F855A; }
.cancelled { background-color: #FFF5F5; border-color: #FED7D7; color: #C53030; }

/* ================= INFO GRID SECTION ================= */
.info-grid { 
  display: grid; 
  grid-template-columns: repeat(3, 1fr); 
  gap: 20px; 
}

.info-box { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
}

.info-header { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
}

.info-header h4 { 
  margin: 0; 
  font-size: 15px; 
  color: #63391F; 
  font-weight: 700;
}

.info-header .icon { 
  font-size: 18px; 
}

.desc { 
  font-size: 13px; 
  color: #666666; 
  line-height: 1.5; 
  margin: 0; 
}

.info-list { 
  margin: 0; 
  padding-left: 20px; 
  font-size: 13px; 
  color: #666666; 
  line-height: 1.8; 
}

@media (max-width: 1024px) {
  .status-grid { grid-template-columns: repeat(2, 1fr); }
  .image-grid { flex-direction: column; }
}
</style>