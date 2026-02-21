<template>
  <div class="shift-page">
    <div class="page-header">
      <div class="title-group">
        <span class="icon">⇆</span> 
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
            <p>Ca làm việc</p>
            <p>Mở lúc: <strong>-</strong></p>
            <p>Còn lại: <strong>0s</strong></p>
          </div>
        </div>

        <div class="input-box">
          <h3 class="box-title">Nhập tiền thực tế (kết toán)</h3>
          
          <div class="form-group">
            <label>Tiền mặt</label>
            <input type="number" v-model="cashAmount" class="custom-input" />
          </div>

          <div class="form-group">
            <label>Chuyển khoản</label>
            <input type="number" v-model="transferAmount" class="custom-input" />
          </div>

          <p class="warning-text">
            Bạn đang ở <strong>chế độ xem</strong> / hoặc chưa tới ca. Không thể xác nhận đóng ca.
          </p>
        </div>

      </div>

      <div class="card-actions">
        <button class="btn-primary">Xác nhận</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Biến lưu trữ giá trị nhập vào
const cashAmount = ref(0);
const transferAmount = ref(0);
</script>

<style scoped>
/* Màu nền tổng thể */
.shift-page {
  background-color: #F7F7F7;
  padding: 20px;
  min-height: 100%;
  font-family: Arial, sans-serif;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.btn-outline {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #FFFFFF;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-outline:hover {
  background-color: #f9f9f9;
}

/* Card chính */
.main-card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 20px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr; /* Cột phải rộng hơn cột trái một chút */
  gap: 20px;
  margin-bottom: 20px;
}

/* Khối bên trong (Border bo góc) */
.info-box, .input-box {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 20px;
}

.box-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
}

/* CSS cho cột trái */
.info-content p {
  margin: 0 0 10px 0;
  color: #555;
  font-size: 14px;
}

.info-content p:last-child {
  margin-bottom: 0;
}

/* CSS cho cột phải */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.custom-input {
  width: 100%;
  background-color: #F3F4F6; /* Màu xám nhạt giống hình */
  border: 1px solid transparent; /* Hoặc border nhạt nếu cần */
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
}

.custom-input:focus {
  outline: none;
  border: 1px solid #4A90E2;
  background-color: #FFFFFF;
}

.warning-text {
  font-size: 12px;
  color: #6B7280;
  margin: 10px 0 0 0;
}

.warning-text strong {
  color: #333;
}

/* Phần nút bấm ở dưới cùng */
.card-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #E5E7EB;
  padding-top: 15px;
}

.btn-primary {
  background-color: #4A90E2; /* Màu xanh nước biển */
  color: #FFFFFF;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #357ABD;
}

/* Responsive cơ bản */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>