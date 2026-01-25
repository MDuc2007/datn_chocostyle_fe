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
          <div
            v-if="invoice.trangThai < 4 && invoice.trangThai !== 5"
            class="status-actions"
          >
            <button
              v-if="invoice.trangThai > 0"
              class="btn-action btn-prev"
              @click="confirmAction('prev')"
            >
              ⏪ Quay lại: {{ getStatusName(invoice.trangThai - 1) }}
            </button>

            <button
              v-if="invoice.trangThai < 4"
              class="btn-action btn-next"
              @click="confirmAction('next')"
            >
              Tiếp: {{ getStatusName(invoice.trangThai + 1) }} ⏩
            </button>

            <button
              class="btn-action btn-cancel"
              @click="confirmAction('cancel')"
            >
              🚫 Hủy đơn
            </button>
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
              <div
                class="icon-circle"
                :class="{ 'icon-cancelled': history.trangThai === 5 }"
              >
                {{ getStatusIcon(history.trangThai) }}
              </div>
            </div>
            <div class="content">
              <div class="status-label">{{ history.hanhDong }}</div>
              <div class="status-time">{{ formatDate(history.thoiGian) }}</div>
              <div class="status-note" v-if="history.ghiChu">
                ({{ history.ghiChu }})
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="card cancelled-section no-print"
        v-if="invoice.trangThai === 5"
      >
        <h3>❌ Đơn hàng đã bị hủy</h3>
        <p>Lý do: {{ invoice.ghiChu || "Không có lý do cụ thể" }}</p>
      </div>

      <div class="layout-grid no-print">
        <div class="content-left">
          <div class="info-grid">
            <div class="card info-card">
              <h3 class="card-title">👤 Thông tin khách hàng</h3>
              <div class="data-row">
                <span>Tên khách:</span>
                <strong>{{ invoice.tenKhachHang }}</strong>
              </div>
              <div class="data-row">
                <span>SĐT:</span> {{ invoice.soDienThoai }}
              </div>
              <div class="data-row">
                <span>Địa chỉ:</span> {{ invoice.diaChi || "Mua tại quầy" }}
              </div>
            </div>

            <div class="card info-card">
              <h3 class="card-title">📦 Thông tin vận chuyển</h3>
              <div class="data-row">
                <span>Nhân viên:</span> {{ invoice.tenNhanVien || "---" }}
              </div>
              <div class="data-row">
                <span>Loại đơn:</span>
                {{ invoice.loaiDon === 1 ? "Tại quầy" : "Online" }}
              </div>
              <div class="data-row">
                <span>Trạng thái:</span>
                <span
                  class="status-badge"
                  :class="getStatusColor(invoice.trangThai)"
                >
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
                  <td>
                    <span class="badge-color">{{ p.mauSac }}</span>
                  </td>
                  <td>
                    <span class="badge-size">{{ p.kichCo }}</span>
                  </td>
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
            <div class="summary-row">
              <span>Tổng tiền hàng:</span>
              <span>{{ formatCurrency(invoice.tongTienHang) }}</span>
            </div>
            <div class="summary-row">
              <span>Phí vận chuyển:</span>
              <span>{{ formatCurrency(invoice.phiShip) }}</span>
            </div>
            <div class="summary-row discount">
              <span>Giảm giá:</span>
              <span>-{{ formatCurrency(invoice.giamGia) }}</span>
            </div>
            <hr />
            <div class="summary-total">
              <span>TỔNG CỘNG:</span>
              <span class="total-price">{{
                formatCurrency(invoice.tongThanhToan)
              }}</span>
            </div>
          </div>

          <div class="card payment-history">
            <h3 class="card-title">💸 Lịch sử thanh toán</h3>

            <div
              v-if="invoice.thanhToanList && invoice.thanhToanList.length > 0"
            >
              <div class="payment-list">
                <div
                  class="payment-item"
                  v-for="(pay, index) in invoice.thanhToanList"
                  :key="index"
                >
                  <div class="pay-icon">
                    <span
                      v-if="pay.phuongThuc.toLowerCase().includes('tiền mặt')"
                      >💵</span
                    >
                    <span v-else>🏦</span>
                  </div>
                  <div class="pay-info">
                    <div class="pay-method">{{ pay.phuongThuc }}</div>
                    <div class="pay-time">{{ formatDate(pay.thoiGian) }}</div>
                    <div class="pay-code" v-if="pay.maGiaoDich">
                      Mã: {{ pay.maGiaoDich }}
                    </div>
                  </div>
                  <div class="pay-amount-group">
                    <div class="pay-amount">
                      {{ formatCurrency(pay.soTien) }}
                    </div>
                    <span
                      class="badge-status success"
                      v-if="pay.trangThai === 1"
                      >Thành công</span
                    >
                    <span class="badge-status pending" v-else>Đang xử lý</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-payment">
              <img
                src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png"
                alt="No Data"
                class="empty-img"
              />
              <p>Chưa có lịch sử thanh toán</p>
            </div>
          </div>

          <button class="btn-print-invoice" @click="handlePrint">
            🖨️ In hóa đơn
          </button>
        </div>
      </div>
    </div>

    <div v-if="modal.show" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">{{ modal.title }}</h3>
        <p class="modal-message">{{ modal.message }}</p>

        <div v-if="modal.type === 'cancel'" class="modal-input-group">
          <textarea
            v-model="modal.note"
            placeholder="Nhập lý do hủy đơn hàng..."
            class="modal-textarea"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn-modal-cancel" @click="closeModal">Huỷ</button>
          <button class="btn-modal-confirm" @click="handleConfirm">
            Xác nhận
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast-notification">
      <div class="toast-icon">✓</div>
      <div class="toast-message">{{ toast.message }}</div>
    </div>

    <Teleport to="body">
      <InvoicePrintTemplate v-if="invoice" :invoice="invoice" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import InvoicePrintTemplate from "./InvoicePrintTemplate.vue";

// --- DEFINITIONS ---
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

interface InvoicePayment {
  phuongThuc: string;
  soTien: number;
  trangThai: number;
  thoiGian: string;
  maGiaoDich?: string;
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
  thanhToanList: InvoicePayment[];
}

const route = useRoute();
const invoice = ref<InvoiceDetail | null>(null);

// --- STATE QUẢN LÝ MODAL VÀ TOAST ---
const modal = reactive({
  show: false,
  title: "",
  message: "",
  type: "", // 'next', 'prev', 'cancel'
  targetStatus: 0,
  note: "",
});

const toast = reactive({
  show: false,
  message: "",
});

// --- COMPUTED ---
const orderedHistory = computed(() => {
  if (!invoice.value || !invoice.value.lichSuList) return [];
  return [...invoice.value.lichSuList].reverse();
});

// --- HELPER FUNCTIONS ---
const getStatusIcon = (status: number) => {
  switch (status) {
    case 0:
      return "🕒";
    case 1:
      return "☑️";
    case 2:
      return "📦";
    case 3:
      return "🚚";
    case 4:
      return "🎉";
    case 5:
      return "❌";
    default:
      return "📄";
  }
};

const formatCurrency = (val: number) => {
  if (val === undefined || val === null) return "0 đ";
  return val.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleString("vi-VN", { hour12: false });
  } catch (e) {
    return dateStr;
  }
};

const getStatusName = (status: number) => {
  const map: Record<number, string> = {
    0: "Chờ xác nhận",
    1: "Đã xác nhận",
    2: "Giao cho vận chuyển",
    3: "Đang giao hàng",
    4: "Hoàn thành",
    5: "Đã hủy",
  };
  return map[status] || "Không xác định";
};

const getStatusColor = (status: number) => {
  if (status === 4) return "text-success";
  if (status === 5) return "text-danger";
  return "text-primary";
};

// --- API & LOGIC ---
const fetchDetail = async () => {
  try {
    const id = Number(route.params.id);
    if (!id) return;
    const res = await axios.get(`http://localhost:8080/api/hoa-don/${id}`);
    invoice.value = res.data;
  } catch (e) {
    console.error(e);
    showToast("Lỗi tải dữ liệu hóa đơn!");
  }
};

// 1. Hàm mở Modal xác nhận
const confirmAction = (actionType: "next" | "prev" | "cancel") => {
  if (!invoice.value) return;

  modal.type = actionType;
  modal.note = ""; // Reset ghi chú
  modal.show = true;

  if (actionType === "cancel") {
    modal.title = "Xác nhận hủy đơn hàng";
    modal.message =
      "Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.";
    modal.targetStatus = 5;
  } else {
    const step = actionType === "next" ? 1 : -1;
    const nextStatus = invoice.value.trangThai + step;
    modal.targetStatus = nextStatus;

    const statusName = getStatusName(nextStatus);
    modal.title = "Xác nhận chuyển trạng thái";
    modal.message = `Bạn có chắc chắn muốn chuyển sang trạng thái: "${statusName}"?`;
  }
};

// 2. Hàm đóng Modal
const closeModal = () => {
  modal.show = false;
};

// 3. Hàm xử lý khi bấm nút "Xác nhận" trong Modal
const handleConfirm = async () => {
  if (!invoice.value) return;

  // Validate nếu là hủy đơn thì phải có lý do
  if (modal.type === "cancel" && !modal.note.trim()) {
    alert("Vui lòng nhập lý do hủy đơn!");
    return;
  }

  // Logic ghi chú
  let noteToSend = modal.note;
  if (modal.type !== "cancel") {
    noteToSend = `Cập nhật trạng thái sang ${getStatusName(
      modal.targetStatus,
    )}`;
  }

  // Gọi API
  await executeUpdate(modal.targetStatus, noteToSend);

  closeModal();
};

// 4. Gọi API Cập nhật
const executeUpdate = async (status: number, note: string) => {
  if (!invoice.value) return;
  try {
    await axios.put(
      `http://localhost:8080/api/hoa-don/${invoice.value.id}/trang-thai`,
      {
        trangThaiMoi: status,
        ghiChu: note,
      },
    );

    // Hiện Toast thành công
    showToast("Cập nhật trạng thái thành công!");

    // Reload lại data
    await fetchDetail();
  } catch (e: any) {
    console.error(e);
    alert(e.response?.data || "Lỗi cập nhật trạng thái");
  }
};

// 5. Hàm hiện Toast thông báo
const showToast = (message: string) => {
  toast.message = message;
  toast.show = true;
  // Tự động ẩn sau 3 giây
  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

const handlePrint = () => {
  window.print();
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped>
/* --- CSS GIAO DIỆN CHÍNH --- */
.invoice-detail-wrapper {
  background: #f4f7f6;
  padding: 20px;
  min-height: 100vh;
  font-family: "Times New Roman", sans-serif;
  position: relative;
}
.card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.card-title {
  font-size: 18px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
  font-weight: 700;
  color: #444;
}

/* Header & Actions */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Style mới cho các nút Action */
.status-actions {
  display: flex;
  gap: 10px;
}
.btn-action {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}
.btn-prev {
  background: #ffc107;
  color: #333;
}
.btn-prev:hover {
  background: #e0a800;
}
.btn-next {
  background: #007bff;
  color: white;
}
.btn-next:hover {
  background: #0069d9;
}
.btn-cancel {
  background: #dc3545;
  color: white;
}
.btn-cancel:hover {
  background: #c82333;
}

.btn-back {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-print-invoice {
  width: 100%;
  padding: 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

/* Timeline */
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
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.line {
  position: absolute;
  top: 25px;
  left: 50%;
  width: 100%;
  height: 4px;
  background: #28a745;
  z-index: 1;
}
.icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  position: relative;
  z-index: 2;
  border: 4px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.icon-cancelled {
  background: #dc3545 !important;
}
.content {
  margin-top: 10px;
  text-align: center;
}
.status-label {
  font-weight: bold;
  margin-bottom: 4px;
}
.status-time {
  font-size: 13px;
  color: #666;
}

/* Layout Grid */
.layout-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.data-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  border-bottom: 1px dashed #eee;
  padding-bottom: 5px;
}

/* Payment History Styles */
.payment-history {
  min-height: 200px;
  display: flex;
  flex-direction: column;
}
.payment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.payment-item {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px dashed #eee;
}
.payment-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.pay-icon {
  width: 40px;
  height: 40px;
  background: #f9f9f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
  border: 1px solid #eee;
}
.pay-info {
  flex: 1;
}
.pay-method {
  font-weight: 600;
  font-size: 14px;
}
.pay-time {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}
.pay-code {
  font-size: 11px;
  color: #555;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 4px;
}
.pay-amount-group {
  text-align: right;
}
.pay-amount {
  font-weight: bold;
  color: #28a745;
  font-size: 15px;
}
.badge-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  display: inline-block;
  margin-top: 4px;
}
.badge-status.success {
  background: #d1fae5;
  color: #059669;
}
.badge-status.pending {
  background: #fef3c7;
  color: #d97706;
}

/* Empty State */
.empty-payment {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  color: #9ca3af;
}
.empty-img {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
  opacity: 0.5;
  filter: grayscale(100%);
}

/* Summary & Table */
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 18px;
  color: #d93025;
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}
.bagi-table {
  width: 100%;
  border-collapse: collapse;
}
.bagi-table th {
  background-color: #603b2c; /* Màu từ ảnh mẫu */
  color: #ffffff;
  padding: 14px 16px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: none;
  text-align: left;
}
.main-title {
  color: #603b2c; /* Màu nâu đậm */
  font-size: 45px;
  font-weight: 800;
  margin: 0;
}
.bagi-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}
.text-left {
  text-align: left;
}
.badge-color,
.badge-size {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #ddd;
  background: #f0f0f0;
  margin-right: 5px;
}
.status-badge {
  font-weight: bold;
}
.text-success {
  color: #28a745;
}
.text-danger {
  color: #dc3545;
}
.text-primary {
  color: #007bff;
}

/* ========================================= */
/* MODAL STYLES (NEW) */
/* ========================================= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-in-out;
}

.modal-title {
  font-size: 20px;
  color: #444;
  margin-bottom: 10px;
  font-weight: 700;
  font-family: "Times New Roman", serif;
}

.modal-message {
  color: #666;
  margin-bottom: 20px;
  font-size: 15px;
}

.modal-input-group {
  margin-bottom: 20px;
}

.modal-textarea {
  width: 100%;
  height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  justify-content: flex-end; /* Căn nút sang phải */
  gap: 10px;
}

.btn-modal-cancel {
  background: #f8f9fa;
  border: 1px solid #ddd;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  color: #555;
  transition: all 0.2s;
}
.btn-modal-cancel:hover {
  background: #e2e6ea;
}

.btn-modal-confirm {
  background: #603b2c; /* Màu nâu giống trong ảnh */
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  color: white;
  transition: all 0.2s;
}
.btn-modal-confirm:hover {
  background: #4a2c20;
}

/* ========================================= */
/* TOAST NOTIFICATION STYLES (NEW) */
/* ========================================= */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #e6fffa; /* Nền xanh nhạt */
  border-left: 5px solid #28c76f; /* Viền xanh đậm */
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1100;
  animation: slideInRight 0.4s ease-out;
  min-width: 300px;
}

.toast-icon {
  width: 24px;
  height: 24px;
  background: #28c76f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.toast-message {
  color: #2e4a3d;
  font-weight: 600;
  font-size: 14px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
