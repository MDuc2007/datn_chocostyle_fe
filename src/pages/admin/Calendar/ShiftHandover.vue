<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';

// --- STATE ---
const loading = ref(false);
const filters = reactive({ keyword: '', fromDate: '', toDate: '' });
const notifications = ref<{ id: number; message: string; type: string }[]>([]);
const handovers = ref<any[]>([]);

// State cho Modal Chi tiết
const selectedShift = ref<any>(null);

const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
  const id = Date.now();
  notifications.value.push({ id, message, type });
  setTimeout(() => notifications.value = notifications.value.filter(n => n.id !== id), 3000);
};

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => {
  if (value === null || value === undefined) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('₫', 'đ');
};

const getStatusText = (status: number) => {
  if (status === 1) return 'Đã đóng';
  if (status === 2) return 'Đang mở';
  if (status === 3) return 'Đang làm';
  return 'Không xác định';
};

const getStatusClass = (status: number) => {
  if (status === 1) return 'status-badge closed'; 
  if (status === 2) return 'status-badge open';   
  if (status === 3) return 'status-badge active'; 
  return 'status-badge';
};

const getDiffClass = (value: number) => {
  if (value < 0) return 'text-red-600 font-bold';
  if (value > 0) return 'text-yellow-600 font-bold';
  return 'text-green-600 font-bold';
};

// --- MODAL ACTIONS ---
const viewDetails = (item: any) => {
  selectedShift.value = item;
};

const closeModal = () => {
  selectedShift.value = null;
};

// --- API CALLS ---
const fetchHandovers = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;

    const res = await axios.get('http://localhost:8080/api/cham-cong/giao-ca', { params });
    handovers.value = res.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách giao ca:", error);
    showToast('Lỗi kết nối server', 'error');
  } finally {
    loading.value = false;
  }
};

const applyFilter = () => fetchHandovers();
const resetFilters = () => {
  filters.keyword = ''; filters.fromDate = ''; filters.toDate = '';
  fetchHandovers();
};

onMounted(() => fetchHandovers());
</script>

<template>
  <div class="page-container">
    
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="notif in notifications" :key="notif.id" class="toast" :class="notif.type">
          <span class="toast-msg">{{ notif.message }}</span>
        </div>
      </TransitionGroup>
    </div>

    <div class="card-section filter-card form-page-animation">
      <div class="filter-card-header">
        <h2 class="card-title">GIAO CA & KẾT TOÁN</h2>
      </div>

      <div class="filter-controls">
        <div class="left-controls">
          <div class="filter-group search-group">
            <label class="filter-label">Tìm kiếm</label>
            <div class="search-box">
              <i class="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </i>
              <input type="text" class="form-input ps-icon" v-model="filters.keyword" placeholder="Tìm theo nhân viên / mã ca..." @keyup.enter="applyFilter"/>
            </div>
          </div>
          <div class="filter-group">
            <label class="filter-label">Từ ngày:</label>
            <input type="date" class="form-input mini-input" v-model="filters.fromDate" @change="applyFilter"/>
          </div>
          <div class="filter-group">
            <label class="filter-label">Đến ngày:</label>
            <input type="date" class="form-input mini-input" v-model="filters.toDate" @change="applyFilter"/>
          </div>
        </div>
        <div class="right-controls">
          <button class="btn btn-outline hover-effect" @click="resetFilters">Đặt lại</button>
        </div>
      </div>
    </div>

    <div class="card-section table-card form-page-animation">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th width="3%" class="text-center">#</th>
              <th width="12%">Nhân viên / Ca</th>
              <th width="15%">Thời gian</th>
              <th width="15%">Quỹ Tiền Mặt</th>
              <th width="15%">Quỹ Chuyển Khoản</th>
              <th width="15%">Tổng Kết</th>
              <th width="8%" class="text-center">Trạng thái</th>
              <th width="8%" class="text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-4">Đang tải dữ liệu...</td>
            </tr>
            <tr v-else-if="handovers.length === 0">
              <td colspan="8" class="text-center py-4 text-muted">Không có dữ liệu giao ca</td>
            </tr>
            <tr v-else v-for="(item, index) in handovers" :key="item.id">
              <td class="text-center" style="color: #333333">{{ index + 1 }}</td>
              <td>
                <div style="font-weight: 500; color: #333;">{{ item.nhanVien }}</div>
                <div class="shift-badge" style="margin-top: 4px;">{{ item.ca }}</div>
              </td>
              <td>
                <div style="font-size: 12px; color: #4b5563;">Mở: <span class="time-text">{{ item.thoiGianMo }}</span></div>
                <div style="font-size: 12px; color: #4b5563; margin-top: 4px;">Đóng: <span class="time-text">{{ item.thoiGianDong }}</span></div>
              </td>
              <td>
                <div style="font-size: 13px; margin-bottom: 2px;">Bán: <span style="color: #000000;">{{ formatCurrency(item.doanhThuTienMat) }}</span></div>
                <div style="font-size: 13px; margin-bottom: 2px;">Két: <span>{{ formatCurrency(item.tienMat) }}</span></div>
                <div style="font-size: 13px;">
                  Lệch: <span :class="getDiffClass(item.chenhLechTienMat)">
                    {{ item.chenhLechTienMat > 0 ? '+' : '' }}{{ formatCurrency(item.chenhLechTienMat) }}
                  </span>
                </div>
              </td>
              <td>
                <div style="font-size: 13px; margin-bottom: 2px;">Bán: <span style="color: #000000;">{{ formatCurrency(item.doanhThuCk) }}</span></div>
                <div style="font-size: 13px; margin-bottom: 2px;">Két: <span>{{ formatCurrency(item.tienChuyenKhoan) }}</span></div>
                <div style="font-size: 13px; ">
                  Lệch: <span :class="getDiffClass(item.chenhLechCk)">
                    {{ item.chenhLechCk > 0 ? '+' : '' }}{{ formatCurrency(item.chenhLechCk) }}
                  </span>
                </div>
              </td>
              <td>
                <div style="font-size: 14px; color: #000000; margin-bottom: 2px;">DT: {{ formatCurrency(item.tongDoanhThu) }}</div>
                <div style="font-size: 13px; ">
                  Lệch: <span :class="getDiffClass(item.tienChenhLech)">
                    {{ item.tienChenhLech > 0 ? '+' : '' }}{{ formatCurrency(item.tienChenhLech) }}
                  </span>
                </div>
              </td>
              <td class="text-center">
                <span class="status-badge" :class="getStatusClass(item.trangThai)">{{ getStatusText(item.trangThai) }}</span>
              </td>
              <td class="text-center">
                <button class="btn-detail hover-effect" @click="viewDetails(item)" title="Xem chi tiết đối soát">
                  👁️ Xem
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Transition name="fade-modal">
      <div v-if="selectedShift" class="modal-overlay" @click.self="closeModal">
        <div class="detail-modal">
          
          <div class="modal-header-custom">
            <div>
              <h3 style="margin:0; font-size: 18px; color: #fff;">SAO KÊ CHI TIẾT CA LÀM VIỆC</h3>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Hệ thống đối soát dòng tiền</p>
            </div>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>
          
          <div class="modal-body-custom">
            <div class="shift-info-grid">
              <div class="info-item"><span>Nhân viên:</span> <strong>{{ selectedShift.nhanVien }}</strong></div>
              <div class="info-item"><span>Ca làm việc:</span> <strong>{{ selectedShift.ca }}</strong></div>
              <div class="info-item"><span>Mở ca:</span> <strong>{{ selectedShift.thoiGianMo }}</strong></div>
              <div class="info-item"><span>Đóng ca:</span> <strong :class="{'text-red-600': selectedShift.trangThai !== 1}">{{ selectedShift.trangThai === 1 ? selectedShift.thoiGianDong : 'Chưa đóng ca' }}</strong></div>
            </div>
            
            <div class="stats-section">
              <h4 class="section-title">📊 Thống kê phát sinh (Doanh thu tăng trong ca)</h4>
              <div class="stats-cards">
                <div class="stat-card">
                  <span>Số hóa đơn bán ra</span>
                  <strong>{{ selectedShift.soLuongHoaDon || 0 }} đơn</strong>
                </div>
                <div class="stat-card">
                  <span>Tiền mặt thu thêm</span>
                  <strong class="text-blue-600">+ {{ formatCurrency(selectedShift.doanhThuTienMat) }}</strong>
                </div>
                <div class="stat-card">
                  <span>Chuyển khoản thu thêm</span>
                  <strong class="text-blue-600">+ {{ formatCurrency(selectedShift.doanhThuCk) }}</strong>
                </div>
              </div>
            </div>

            <div class="reconciliation-section">
              <h4 class="section-title">⚖️ Bảng đối soát dòng tiền</h4>
              <table class="recon-table">
                <thead>
                  <tr>
                    <th>Loại tiền</th>
                    <th>Đầu ca (A)</th>
                    <th>Bán được (B)</th>
                    <th>Lý thuyết (A + B)</th>
                    <th>Thực tế đếm (C)</th>
                    <th>Chênh lệch (C - Lý thuyết)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>💵 Tiền mặt</td>
                    <td>{{ formatCurrency(selectedShift.tienMatDauCa) }}</td>
                    <td>{{ formatCurrency(selectedShift.doanhThuTienMat) }}</td>
                    <td class="bg-gray-50 font-bold">{{ formatCurrency(selectedShift.tienMatDauCa + selectedShift.doanhThuTienMat) }}</td>
                    <td class="font-bold text-blue-600">{{ formatCurrency(selectedShift.tienMat) }}</td>
                    <td :class="getDiffClass(selectedShift.chenhLechTienMat)">
                      {{ selectedShift.chenhLechTienMat > 0 ? '+' : '' }}{{ formatCurrency(selectedShift.chenhLechTienMat) }}
                    </td>
                  </tr>
                  <tr>
                    <td>💳 Chuyển khoản</td>
                    <td>{{ formatCurrency(selectedShift.tienChuyenKhoanDauCa) }}</td>
                    <td>{{ formatCurrency(selectedShift.doanhThuCk) }}</td>
                    <td class="bg-gray-50 font-bold">{{ formatCurrency(selectedShift.tienChuyenKhoanDauCa + selectedShift.doanhThuCk) }}</td>
                    <td class="font-bold text-blue-600">{{ formatCurrency(selectedShift.tienChuyenKhoan) }}</td>
                    <td :class="getDiffClass(selectedShift.chenhLechCk)">
                      {{ selectedShift.chenhLechCk > 0 ? '+' : '' }}{{ formatCurrency(selectedShift.chenhLechCk) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="note-section" v-if="selectedShift.ghiChu">
              <strong>📝 Ghi chú lúc đóng ca:</strong>
              <p>"{{ selectedShift.ghiChu }}"</p>
            </div>

          </div>
        </div>
      </div>
    </Transition>

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

.card-section:hover { box-shadow: var(--shadow-md); }
.filter-card { padding: 24px; }
.table-card { padding: 10px; }
.filter-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.card-title { font-size: 24px; font-weight: 700; color: #63391f; margin: 0; }

/* =========================================
   FILTER CONTROLS
   ========================================= */
.filter-controls { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; padding-top: 10px; }
.left-controls { display: flex; gap: 20px; align-items: flex-end; flex: 1; }
.right-controls { display: flex; gap: 10px; align-items: flex-end; }
.filter-group { display: flex; flex-direction: column; gap: 6px; }
.filter-group.search-group { justify-content: flex-end; }
.filter-label { font-size: 14px; font-weight: 700; color: #374151; margin-left: 2px; }

.search-box { position: relative; width: 280px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); display: flex; pointer-events: none; z-index: 1; }

.form-input, .mini-input {
  height: 42px; border-radius: 10px; font-size: 14px; box-sizing: border-box; outline: none; background-color: #fff; transition: all 0.2s;
  border: 1px solid #d1d5db; padding: 0 12px;
}
.form-input { width: 100%; }
.form-input.ps-icon { padding-left: 40px; }
.form-input:focus, .mini-input:focus { border-color: #63391f; box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1); }

/* =========================================
   BUTTONS
   ========================================= */
.btn {
  height: 42px; padding: 0 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; border: 1px solid transparent;
}
.btn-outline { background-color: #fff; color: #374151; border: 1px solid #d1d5db; }
.btn-outline:hover { border-color: #63391f; color: #63391f; background-color: #fdf8f6; }
.hover-effect:active { transform: scale(0.96); }

.btn-detail {
  background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.btn-detail:hover { background: #e2e8f0; border-color: #94a3b8; color: #1e293b; }

/* =========================================
   TABLE STYLES
   ========================================= */
.table-container { width: 100%; overflow-x: auto; }
.custom-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 1000px; }
.custom-table th { font-weight: 700; padding: 16px 12px; text-align: left; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #edf2f7; color: #374151; }
.custom-table td { padding: 14px 12px; font-size: 15px; color: #000; vertical-align: middle; border-bottom: 1px solid #f1f5f9; }

.text-center { text-align: center !important; }
.font-bold { font-weight: 700; }
.text-red-600 { color: #dc2626 !important; }
.text-green-600 { color: #16a34a !important; }
.text-blue-600 { color: #2563eb !important; }
.text-yellow-600 { color: #ca8a04 !important; }
.bg-gray-50 { background-color: #f8fafc; }

.shift-badge { background: #f3f4f6; color: #333; padding: 4px 10px; border-radius: 6px; font-weight: 400; font-size: 13px; display: inline-block; }
.time-text { font-family: Arial, sans-serif; font-weight: 400; color: #333; background: #f9fafb; padding: 4px 8px; border-radius: 4px; font-size: 13px; }

/* Status Badges */
.status-badge { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; min-width: 90px; text-align: center; }
.status-badge.open { background-color: #dcfce7; color: #166534; border: 1px solid #22c55e; }
.status-badge.active { background: linear-gradient(135deg, #6b3f23, #c89b6d); color: white; border: none; font-weight: 700; }
.status-badge.closed { background-color: #fee2e2; color: #b91c1c; border: 1px solid #ef4444; }

/* =========================================
   MODAL CHI TIẾT (SAO KÊ)
   ========================================= */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(3px);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}

.detail-modal {
  background: #fff; width: 750px; border-radius: 12px; overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: zoomIn 0.3s ease-out;
}

.modal-header-custom {
  background: linear-gradient(135deg, #6b3f23, #c89b6d); padding: 16px 24px;
  display: flex; justify-content: space-between; align-items: center;
}

.close-btn { background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-weight: bold; transition: 0.2s; }
.close-btn:hover { background: rgba(255,255,255,0.4); }

.modal-body-custom { padding: 24px; max-height: 80vh; overflow-y: auto; }

.shift-info-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;
}
.info-item { font-size: 14px; display: flex; justify-content: space-between; }
.info-item span { color: #64748b; }

.section-title { font-size: 16px; font-weight: 700; color: #334155; margin: 0 0 12px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }

.stats-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card {
  background: #fff; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.stat-card span { display: block; font-size: 13px; color: #64748b; margin-bottom: 8px; }
.stat-card strong { font-size: 18px; }

.recon-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
.recon-table th, .recon-table td { padding: 12px; text-align: right; border: 1px solid #e2e8f0; font-size: 14px; }
.recon-table th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: center; }
.recon-table td:first-child { text-align: left; font-weight: 600; color: #334155; background: #f8fafc; }

.note-section { background: #fffbeb; padding: 12px 16px; border-left: 4px solid #f59e0b; border-radius: 4px; }
.note-section strong { font-size: 14px; color: #92400e; }
.note-section p { margin: 4px 0 0 0; font-size: 13px; color: #b45309; font-style: italic; }

@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

/* TOAST ANIMATION */
.toast {
  pointer-events: auto; min-width: 250px; padding: 12px 16px; border-radius: 4px; font-size: 14px; font-weight: 500;
  display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); background: #fff; animation: slideInRight 0.3s forwards;
}
.toast.success { border-left: 5px solid #67c23a; color: #67c23a; }
.toast.error { border-left: 5px solid #f56c6c; color: #f56c6c; }
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
</style>