<template>
  <div class="invoice-detail-wrapper">
    <div v-if="!invoice" class="loading-container">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu hóa đơn...</p>
    </div>

    <div v-else>
      <div class="detail-header no-print">
        <div class="header-left">
          <h1 class="main-title">Chi tiết đơn hàng #{{ invoice.maHoaDon }}</h1>
        </div>

        <div class="header-actions">
          <div v-if="invoice.trangThai < 4 && invoice.trangThai !== 5" class="status-actions">
            <select v-model="newStatus" class="status-select">
              <option :value="0">Chờ xác nhận</option>
              <option :value="1">Xác nhận đơn</option>
              <option :value="2">Giao vận chuyển</option>
              <option :value="3">Đang giao</option>
              <option :value="4">Hoàn thành</option>
              <option :value="5">Hủy đơn</option>
            </select>
            <button class="btn-update" @click="updateStatus">Cập nhật</button>
          </div>
          <button class="btn-back" @click="$router.back()">← Quay lại</button>
        </div>
      </div>

      <div class="card timeline-section no-print">
        <h3 class="card-title">Theo dõi trạng thái</h3>
        
        <div class="timeline-horizontal-container">
          <div 
            class="timeline-item" 
            v-for="(history, index) in orderedHistory" 
            :key="index"
          >
            <div class="line" v-if="index < orderedHistory.length - 1"></div>

            <div class="icon-container">
               <div class="icon-circle" :class="{ 'icon-cancelled': history.trangThai === 5 }">
                 {{ getStatusIcon(history.trangThai) }}
               </div>
            </div>

            <div class="content">
              <div class="status-label">{{ history.hanhDong }}</div>
              <div class="status-time">{{ formatDate(history.thoiGian) }}</div>
              <div class="status-note" v-if="history.ghiChu">({{ history.ghiChu }})</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card cancelled-section no-print" v-if="invoice.trangThai === 5">
        <h3>❌ Đơn hàng đã bị hủy</h3>
        <p>Lý do: {{ invoice.ghiChu || 'Không có lý do cụ thể' }}</p>
      </div>

      <div class="layout-grid">
        <div class="content-left">
          <div class="print-only-header">
            <h2 class="shop-name">CHOCOSTYLE STORE</h2>
            <p>Hóa đơn bán hàng: {{ invoice.maHoaDon }}</p>
            <p>Ngày tạo: {{ formatDate(invoice.ngayTao) }}</p>
          </div>

          <div class="info-grid">
            <div class="card info-card">
              <h3 class="card-title">👤 Thông tin khách hàng</h3>
              <div class="data-row"><span>Tên khách:</span> <strong>{{ invoice.tenKhachHang }}</strong></div>
              <div class="data-row"><span>SĐT:</span> {{ invoice.soDienThoai }}</div>
              <div class="data-row"><span>Địa chỉ:</span> {{ invoice.diaChi || 'Mua tại quầy' }}</div>
            </div>
            
            <div class="card info-card">
              <h3 class="card-title">📦 Thông tin vận chuyển</h3>
              <div class="data-row"><span>Nhân viên:</span> {{ invoice.tenNhanVien || '---' }}</div>
              <div class="data-row"><span>Loại đơn:</span> {{ invoice.loaiDon === 1 ? 'Tại quầy' : 'Online' }}</div>
              <div class="data-row"><span>Trạng thái hiện tại:</span> 
                <span class="status-badge" :class="getStatusColor(invoice.trangThai)">
                  {{ getStatusName(invoice.trangThai) }}
                </span>
              </div>
            </div>
          </div>

          <div class="card product-card">
            <h3 class="card-title">🛒 Danh sách sản phẩm</h3>
            <table class="bagi-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Sản phẩm</th>
                  <th>Màu sắc</th>
                  <th>Kích cỡ</th> 
                  <th>Đơn giá</th>
                  <th class="text-left">SL</th>
                  <th class="text-left">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, index) in invoice.sanPhamList" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ p.tenSanPham }}</td>
                  
                  <td><span class="badge-color">{{ p.mauSac }}</span></td>
                  <td><span class="badge-size">{{ p.kichCo }}</span></td>
                  <td>{{ formatCurrency(p.donGia) }}</td>
                  <td class="text-left">{{ p.soLuong }}</td>
                  <td class="text-left">{{ formatCurrency(p.thanhTien) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="content-right">
          <div class="card summary-card">
            <h3 class="card-title">💰 Thanh toán</h3>
            <div class="summary-row"><span>Tổng tiền hàng:</span> <span>{{ formatCurrency(invoice.tongTienHang) }}</span></div>
            <div class="summary-row"><span>Phí vận chuyển:</span> <span>{{ formatCurrency(invoice.phiShip) }}</span></div>
            <div class="summary-row discount"><span>Giảm giá:</span> <span>-{{ formatCurrency(invoice.giamGia) }}</span></div>
            <hr>
            <div class="summary-total">
              <span>TỔNG CỘNG:</span>
              <span class="total-price">{{ formatCurrency(invoice.tongThanhToan) }}</span>
            </div>
          </div>
          <button class="btn-print-invoice no-print" @click="handlePrint">🖨️ In hóa đơn</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
// import invoiceService from '../../../services/invoiceService'; 
// Lưu ý: Đảm bảo import đúng đường dẫn service của bạn
import axios from 'axios'; // Dùng tạm axios nếu chưa có service wrapper

// --- Interfaces ---
interface InvoiceProduct {
  tenSanPham: string;
  mauSac: string;
  kichCo: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
}

interface InvoiceHistory {
  trangThai: number;
  hanhDong: string;
  ghiChu: string;
  thoiGian: string;
  nguoiThucHien: string;
}

interface InvoiceDetail {
  id: number;
  maHoaDon: string;
  tenKhachHang: string;
  soDienThoai: string;
  diaChi: string;
  tenNhanVien: string;
  trangThai: number;
  loaiDon: number;
  ngayTao: string;
  ghiChu: string;
  tongTienHang: number;
  phiShip: number;
  giamGia: number;
  tongThanhToan: number;
  sanPhamList: InvoiceProduct[];
  lichSuList: InvoiceHistory[];
}

const route = useRoute();
const invoice = ref<InvoiceDetail | null>(null);
const newStatus = ref(0);

// --- Computed: Sắp xếp lịch sử (Cũ -> Mới) ---
const orderedHistory = computed(() => {
  if (!invoice.value || !invoice.value.lichSuList) return [];
  return [...invoice.value.lichSuList].reverse();
});

// --- Hàm lấy Icon theo trạng thái ---
const getStatusIcon = (status: number) => {
  switch (status) {
    case 0: return '🕒'; // Chờ xác nhận
    case 1: return '☑️'; // Xác nhận đơn
    case 2: return '📦'; // Giao vận chuyển
    case 3: return '🚚'; // Đang giao
    case 4: return '🎉'; // Hoàn thành
    case 5: return '❌'; // Hủy đơn
    default: return '📄'; // Mặc định
  }
};

// --- Helper Functions ---
const formatCurrency = (val: number) => {
  if (val === undefined || val === null) return '0 đ';
  return val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', { hour12: false }); 
  } catch (e) {
    return dateStr;
  }
};

const getStatusName = (status: number) => {
  const map: Record<number, string> = {
    0: 'Chờ xác nhận',
    1: 'Đã xác nhận',
    2: 'Giao cho vận chuyển',
    3: 'Đang giao hàng',
    4: 'Hoàn thành',
    5: 'Đã hủy'
  };
  return map[status] || 'Không xác định';
};

const getStatusColor = (status: number) => {
  if (status === 4) return 'text-success';
  if (status === 5) return 'text-danger';
  return 'text-primary';
};

// --- API Calls ---
const fetchDetail = async () => {
  try {
    const id = Number(route.params.id);
    if (!id) return;
    
    // Sửa lại URL API cho phù hợp với backend của bạn
    const res = await axios.get(`http://localhost:8080/api/hoa-don/${id}`);
    
    invoice.value = res.data;
    newStatus.value = res.data.trangThai;
  } catch (e) {
    console.error(e);
    alert("Lỗi tải dữ liệu hóa đơn!");
  }
};

const updateStatus = async () => {
  if (!invoice.value) return;
  const actionName = getStatusName(newStatus.value);
  if (!confirm(`Bạn có chắc chắn muốn chuyển sang trạng thái: "${actionName}"?`)) return;
  
  try {
    await axios.put(`http://localhost:8080/api/hoa-don/${invoice.value.id}/trang-thai`, {
        trangThaiMoi: newStatus.value,
        ghiChu: `Cập nhật sang ${actionName}`
    });
    alert("Cập nhật thành công!");
    await fetchDetail(); 
  } catch (e: any) {
    console.error(e);
    alert(e.response?.data || "Lỗi cập nhật trạng thái");
  }
};

const handlePrint = () => {
  window.print();
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped>
.invoice-detail-wrapper {
  background: #f4f7f6;
  padding: 20px;
  min-height: 100vh;
  font-family: 'Times New Roman', Times, serif;
}

/* --- BADGE CSS MỚI THÊM --- */
.badge-color {
    background-color: #f0f0f0;
    color: #333;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
    border: 1px solid #ddd;
    display: inline-block;
}

.badge-size {
    background-color: #e3f2fd;
    color: #0d47a1;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 14px;
    display: inline-block;
    min-width: 30px;
    text-align: center;
}
/* -------------------------- */

/* --- TIMELINE CSS --- */
.timeline-section {
  padding: 30px;
  overflow-x: auto;
}

.timeline-horizontal-container {
  display: flex;
  align-items: flex-start;
  padding-top: 10px;
  min-width: 100%;
}

.timeline-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 140px;
}

/* Đường nối */
.line {
  position: absolute;
  top: 25px;
  left: 50%;
  width: 100%;
  height: 4px;
  background-color: #28a745;
  z-index: 1;
}

/* Icon Container */
.icon-container {
  position: relative;
  z-index: 2;
  background: #fff;
  padding: 0 5px;
}

/* Vòng tròn Icon (Mặc định Xanh lá) */
.icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #28a745;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 4px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

/* Nếu là Trạng thái Hủy (5) -> Đổi màu đỏ */
.icon-cancelled {
  background-color: #dc3545 !important;
  border-color: #fff;
}

.content {
  margin-top: 10px;
  text-align: center;
}

.status-label {
  font-weight: bold;
  color: #333;
  font-size: 16px;
  margin-bottom: 4px;
}

.status-time {
  font-size: 14px;
  color: #666;
}

.status-note {
  font-size: 13px;
  font-style: italic;
  color: #888;
  margin-top: 2px;
}

/* --- COMMON CSS --- */
.card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
}

.card-title {
  font-size: 18px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
  font-weight: 700;
  color: #444;
}

.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-actions { display: flex; gap: 10px; align-items: center; }
.status-actions { display: flex; gap: 10px; }
.status-select { 
  padding: 8px; border-radius: 4px; border: 1px solid #ddd; outline: none;
  font-family: 'Times New Roman', Times, serif; font-size: 15px;
}

.layout-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.data-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; border-bottom: 1px dashed #f0f0f0; padding-bottom: 5px; }

.status-badge { font-weight: bold; }
.text-success { color: #28a745; }
.text-danger { color: #dc3545; }
.text-primary { color: #007bff; }

.bagi-table { width: 100%; border-collapse: collapse; }
.bagi-table th { background: #f8f9fa; padding: 10px; text-align: left; font-size: 15px; font-weight: 600; }
.bagi-table td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 15px; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.btn-update { background: #007bff; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 15px; font-family: 'Times New Roman'; }
.btn-back { background: #6c757d; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 15px; font-family: 'Times New Roman'; }
.btn-print-invoice { width: 100%; padding: 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 18px; font-weight: bold; font-family: 'Times New Roman'; }

.cancelled-section { background: #fff5f5; border: 1px solid #efb8b8; color: #c0392b; }

.summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; }
.discount span:last-child { color: #dc3545; }
.summary-total { display: flex; justify-content: space-between; font-weight: bold; font-size: 20px; margin-top: 10px; color: #d93025; }

/* In ấn */
.print-only-header { display: none; }
@media print {
  .no-print { display: none !important; }
  .layout-grid { display: block; }
  .print-only-header { display: block; text-align: center; border-bottom: 2px solid #000; margin-bottom: 20px; }
  .card { box-shadow: none; border: 1px solid #ddd; }
}
</style>