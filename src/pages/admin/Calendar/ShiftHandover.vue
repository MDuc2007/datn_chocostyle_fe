<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';

// --- STATE ---
const loading = ref(false);

// Bộ lọc giống trong ShiftManager/ScheduleManager
const filters = reactive({
  keyword: '',
  fromDate: '',
  toDate: ''
});

// Toast notifications
const notifications = ref<{ id: number; message: string; type: string }[]>([]);
const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
  const id = Date.now();
  notifications.value.push({ id, message, type });
  setTimeout(() => notifications.value = notifications.value.filter(n => n.id !== id), 3000);
};

// Dữ liệu mẫu (Mock data)
// Sau này sẽ thay bằng axios.get('/api/giao-ca')
const handovers = ref([
  {
    id: 3,
    nhanVien: 'Văn Nhân',
    ca: '-',
    thoiGianMo: '18:34:54 12/2/2026',
    thoiGianDong: '-',
    tienMat: 0,
    tienChuyenKhoan: 0,
    tongDoanhThu: 0,
    tienChenh: 0,
    trangThai: 2 // 2: Đang mở
  },
  {
    id: 2,
    nhanVien: 'Thắng Nguyễn Như',
    ca: 'Ca Tối',
    thoiGianMo: '18:32:26 12/2/2026',
    thoiGianDong: '19:27:42 12/2/2026',
    tienMat: 0,
    tienChuyenKhoan: 0,
    tongDoanhThu: 0,
    tienChenh: 0,
    trangThai: 1 // 1: Đã đóng
  },
  {
    id: 1,
    nhanVien: 'Nguyễn Quốc Khánh',
    ca: '-',
    thoiGianMo: '17:49:50 12/2/2026',
    thoiGianDong: '-',
    tienMat: 0,
    tienChuyenKhoan: 0,
    tongDoanhThu: 0,
    tienChenh: 0,
    trangThai: 2 // 2: Đang mở
  }
]);

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('₫', 'đ');
};

const getStatusText = (status: number) => {
  return status === 2 ? 'Đang mở' : 'Đã đóng';
};

const getStatusClass = (status: number) => {
  return status === 2 ? 'active' : 'inactive';
};

// --- API CALLS ---
const fetchHandovers = async () => {
  loading.value = true;
  try {
    // TODO: Gọi API Backend tại đây
    // const res = await axios.get('/api/giao-ca/search', { params: filters });
    // handovers.value = res.data;
    
    // Giả lập load API
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error("Lỗi lấy danh sách giao ca:", error);
    showToast('Lỗi kết nối server', 'error');
  } finally {
    loading.value = false;
  }
};

const applyFilter = () => {
  fetchHandovers();
};

const resetFilters = () => {
  filters.keyword = '';
  filters.fromDate = '';
  filters.toDate = '';
  fetchHandovers();
};

onMounted(() => {
  fetchHandovers();
});
</script>

<template>
  <div class="page-container">
    
    <!-- Toast Container -->
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="notif in notifications" :key="notif.id" class="toast" :class="notif.type">
          <span class="toast-msg">{{ notif.message }}</span>
        </div>
      </TransitionGroup>
    </div>

    <!-- Filter Card -->
    <div class="card-section filter-card form-page-animation">
      <div class="filter-card-header">
        <h2 class="card-title">GIAO CA & KẾT TOÁN</h2>
      </div>

      <div class="filter-controls">
        <div class="left-controls">
          <!-- Search Input -->
          <div class="filter-group search-group">
            <div class="search-box">
              <i class="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </i>
              <input 
                type="text" 
                class="form-input ps-icon" 
                v-model="filters.keyword"
                placeholder="Tìm theo nhân viên / mã ca..."
              />
            </div>
          </div>

          <!-- Date Range -->
          <div class="filter-group">
            <label class="filter-label">Từ ngày:</label>
            <input 
              type="date" 
              class="form-input mini-input" 
              v-model="filters.fromDate"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">Đến ngày:</label>
            <input 
              type="date" 
              class="form-input mini-input" 
              v-model="filters.toDate"
            />
          </div>
        </div>

        <div class="right-controls">
          <button class="btn btn-outline hover-effect" @click="resetFilters">Đặt lại</button>
          <button class="btn btn-primary hover-effect" @click="applyFilter">
            Lọc
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card-section table-card form-page-animation">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th width="5%" class="text-center">#</th>
              <th width="15%">Nhân viên</th>
              <th width="10%">Ca</th>
              <th width="15%">Mở</th>
              <th width="15%">Đóng</th>
              <th width="10%" class="text-right">DT Tiền mặt</th>
              <th width="10%" class="text-right">DT CK/Thẻ</th>
              <th width="10%" class="text-right">Tổng DT</th>
              <th width="10%" class="text-right">Chênh</th>
              <th width="10%" class="text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="10" class="text-center py-4">Đang tải dữ liệu...</td>
            </tr>
            <tr v-else-if="handovers.length === 0">
              <td colspan="10" class="text-center py-4 text-muted">Không có dữ liệu giao ca</td>
            </tr>
            <tr v-else v-for="(item, index) in handovers" :key="item.id">
              <td class="text-center font-bold text-gray-500">{{ index + 1 }}</td>
              <td>
                <span class="name-text">{{ item.nhanVien }}</span>
              </td>
              <td>
                <span class="shift-badge">{{ item.ca }}</span>
              </td>
              <td>
                <span class="time-text">{{ item.thoiGianMo }}</span>
              </td>
              <td>
                <span class="time-text">{{ item.thoiGianDong }}</span>
              </td>
              <td class="text-right">{{ formatCurrency(item.tienMat) }}</td>
              <td class="text-right">{{ formatCurrency(item.tienChuyenKhoan) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(item.tongDoanhThu) }}</td>
              <td class="text-right">{{ formatCurrency(item.tienChenh) }}</td>
              <td class="text-center">
                <span class="status-badge" :class="getStatusClass(item.trangThai)">
                  {{ getStatusText(item.trangThai) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* =========================================
   1. GLOBAL VARIABLES & ANIMATIONS
   ========================================= */
.page-container {
  --primary-brown: #63391f;
  --primary-light: #fdf8f6;
  --text-main: #484848;
  --border-color: #e0e0e0;
  --success-green: #27ae60;
  --danger-red: #e74c3c;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 5px 15px rgba(0, 0, 0, 0.08);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-page-animation {
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* =========================================
   2. LAYOUT & CARDS
   ========================================= */
.card-section {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
  overflow: hidden;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.card-section:hover {
  box-shadow: var(--shadow-md);
}

.filter-card {
  padding: 24px;
}

.table-card {
  padding: 10px;
}

.filter-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #63391f;
  margin: 0;
}

/* =========================================
   FILTER CONTROLS (MATCH ShiftManager/ScheduleManager)
   ========================================= */
.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 10px;
}

.left-controls {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex: 1;
}

.right-controls {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group.search-group {
  justify-content: flex-end;
}

.filter-label {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin-left: 2px;
}

/* Search Box */
.search-box {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  pointer-events: none;
  z-index: 1;
}

/* Form Inputs & Selects */
.form-input,
.form-select {
  height: 42px;
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input {
  width: 100%;
  border: 1px solid #d1d5db;
  padding: 0 12px;
  outline: none;
  background-color: #fff;
  transition: all 0.2s;
}

.form-input.ps-icon {
  padding-left: 40px;
}

.mini-input {
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  background-color: #fff;
}

.form-input:focus,
.mini-input:focus {
  border-color: #63391f;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}

/* =========================================
   BUTTONS (Gradient Style)
   ========================================= */
.btn {
  height: 42px;
  padding: 0 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: #fff;
  border-color: #6b3f23;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a3420, #b8895d);
  box-shadow: 0 4px 10px rgba(78, 44, 23, 0.3);
}

.btn-outline {
  background-color: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  border-color: #63391f;
  color: #63391f;
  background-color: #fdf8f6;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.hover-effect:active {
  transform: scale(0.96);
}

/* =========================================
   TABLE STYLES
   ========================================= */
.table-container {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1000px;
  table-layout: fixed;
}

.custom-table th {
  font-weight: 700;
  padding: 16px 12px;
  text-align: left;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #edf2f7;
  color: #374151;
  background: transparent;
}

.custom-table td {
  padding: 14px 12px;
  font-size: 15px;
  color: #000000;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}

.custom-table tbody tr:hover td {
  background-color: var(--primary-light);
}

.text-center {
  text-align: center !important;
}

.text-right {
  text-align: right !important;
}

.font-bold {
  font-weight: 700;
}

.text-gray-500 {
  color: #6b7280;
}

.text-muted {
  color: #9ca3af;
}

.py-4 {
  padding-top: 20px;
  padding-bottom: 20px;
}

/* Table-specific elements */
.name-text {
  font-weight: 600;
  color: #000000;
  font-size: 14px;
}

.shift-badge {
  background: #e0e7ff;
  color: #000000;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  display: inline-block;
}

.time-text {
  font-family: monospace;
  font-weight: 500;
  color: #000000;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

/* Status Badges */
.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
  min-width: 90px;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #22c55e;
}

.status-badge.inactive {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #ef4444;
}

/* =========================================
   TOAST STYLES
   ========================================= */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  min-width: 250px;
  max-width: 350px;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background: #fff;
  animation: slideInRight 0.3s forwards;
}

.toast.success {
  background-color: #f0f9eb;
  border-left: 5px solid #67c23a;
  color: #67c23a;
}

.toast.error {
  background-color: #fef0f0;
  border-left: 5px solid #f56c6c;
  color: #f56c6c;
}

.toast.warning {
  background-color: #fdf6ec;
  border-left: 5px solid #e6a23c;
  color: #e6a23c;
}

.toast-msg {
  color: #333;
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
