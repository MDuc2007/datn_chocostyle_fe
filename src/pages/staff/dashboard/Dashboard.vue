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
          <div class="img-wrapper">
            <img src="https://via.placeholder.com/300x400/E0E0E0/808080?text=Vest+1" alt="Vest 1" />
          </div>
          <div class="img-wrapper">
            <img src="https://via.placeholder.com/300x400/D0D0D0/808080?text=Vest+2" alt="Vest 2" />
          </div>
          <div class="img-wrapper">
            <img src="https://via.placeholder.com/300x400/C0C0C0/808080?text=Vest+3" alt="Vest 3" />
          </div>
        </div>

        <button class="nav-btn next">›</button>
      </div>
    </div>

    <div class="dashboard-card status-section">
      <h3 class="title">Trạng thái đơn hàng</h3>
      
      <div class="status-grid">
        <div class="status-box pending">
          <div class="status-info">
            <span class="icon">⏳</span> <span class="label">Chờ xử lý</span>
          </div>
          <span class="value">{{ orderStats.pending }}</span>
        </div>

        <div class="status-box delivering">
          <div class="status-info">
            <span class="icon">🚚</span>
            <span class="label">Đang giao</span>
          </div>
          <span class="value">{{ orderStats.delivering }}</span>
        </div>

        <div class="status-box completed">
          <div class="status-info">
            <span class="icon">✅</span>
            <span class="label">Đã hoàn thành</span>
          </div>
          <span class="value">{{ orderStats.completed }}</span>
        </div>

        <div class="status-box cancelled">
          <div class="status-info">
            <span class="icon">❌</span>
            <span class="label">Đã hủy</span>
          </div>
          <span class="value">{{ orderStats.cancelled }}</span>
        </div>
      </div>
    </div>

    <div class="info-grid">
      <div class="dashboard-card info-box">
        <div class="info-header">
          <span class="icon">👔</span>
          <h4>VestShop</h4>
        </div>
        <p class="desc">Chuyên vest cưới/tiệc, đo may & chỉnh sửa theo form. Trải nghiệm mua hàng nhanh gọn cho nhân viên.</p>
      </div>

      <div class="dashboard-card info-box">
        <div class="info-header">
          <span class="icon">📦</span>
          <h4>Quy trình làm việc</h4>
        </div>
        <ul class="info-list">
          <li>Tạo đơn → Xác nhận thông tin</li>
          <li>Chuẩn bị hàng → Bàn giao ship</li>
          <li>Hoàn thành → Lưu lịch sử</li>
        </ul>
      </div>

      <div class="dashboard-card info-box">
        <div class="info-header">
          <span class="icon">🛡️</span>
          <h4>Chính sách</h4>
        </div>
        <ul class="info-list">
          <li>Đổi size nhanh trong 7 ngày</li>
          <li>Hỗ trợ chỉnh sửa form</li>
          <li>CSKH & bảo hành đường may</li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Data giả lập cho trạng thái đơn hàng
const orderStats = ref({
  pending: 12,
  delivering: 8,
  completed: 25,
  cancelled: 2
});
</script>

<style scoped>
/* ================= Biến màu sắc theo yêu cầu ================= */
:root {
  --primary-color: #63391F;
  --bg-color: #F7F7F7;
  --white-color: #FFFFFF;
}

.dashboard-page {
  background-color: #F7F7F7; /* Màu nền */
  padding: 20px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-card {
  background-color: #FFFFFF; /* Màu trắng */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #eaeaea;
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
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
  background-color: #ddd;
}

.dot.active {
  background-color: #2b55cc; /* Hoặc có thể dùng #63391F nếu muốn đồng bộ */
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
}

.nav-btn {
  background-color: #FFFFFF;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  color: #666;
  z-index: 2;
}

.nav-btn:hover {
  background-color: #f0f0f0;
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
  height: 350px; /* Chỉnh chiều cao cho phù hợp */
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

/* Phối màu cho từng ô trạng thái giống ảnh */
.pending {
  background-color: #FFF8EE;
  border-color: #FFE6C7;
  color: #C05621;
}

.delivering {
  background-color: #F0F7FF;
  border-color: #D6E8FF;
  color: #2B6CB0;
}

.completed {
  background-color: #F0FFF4;
  border-color: #C6F6D5;
  color: #2F855A;
}

.cancelled {
  background-color: #FFF5F5;
  border-color: #FED7D7;
  color: #C53030;
}

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
  color: #333;
}

.info-header .icon {
  font-size: 18px;
}

.desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.info-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

/* Responsive cơ bản */
@media (max-width: 1024px) {
  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .image-grid {
    flex-direction: column;
  }
}
</style>