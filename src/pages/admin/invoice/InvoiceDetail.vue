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
          <p class="subtitle">Ngày tạo: {{ formatDate(invoice.ngayTao) }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-back" @click="$router.back()">
            ← Quay lại danh sách
          </button>
        </div>
      </div>

      <div class="card timeline-section no-print">
        <div class="stepper-wrapper">
          <div
            class="stepper-item"
            v-for="(step, index) in fixedSteps"
            :key="index"
            :class="{
              active: isStepActive(step.status),
              cancelled:
                invoice.trangThai === 5 && index === fixedSteps.length - 1,
            }"
          >
            <div class="step-icon-circle">
              <span>{{ step.icon }}</span>
            </div>
            <div class="step-bar"></div>
            <div class="step-content">
              <div class="step-label">{{ step.label }}</div>
              <div class="step-time">{{ getLogTime(step.status) }}</div>
            </div>
          </div>
        </div>

        <div class="action-bar-bottom">
          <div
            class="action-left"
            v-if="invoice.trangThai < 4 && invoice.trangThai !== 5"
          >
            <button
              v-if="invoice.trangThai > 0"
              class="btn-outline-orange"
              @click="confirmAction('prev')"
            >
              <i class="icon-arrow-left">⬅</i> Quay lại
            </button>

            <button class="btn-orange" @click="confirmAction('next')">
              {{ getNextActionName(invoice.trangThai) }}
              <i class="icon-arrow-right">➡</i>
            </button>

            <button class="btn-white-border" @click="confirmAction('cancel')">
              Xác nhận hủy đơn
            </button>
          </div>

          <div class="action-right">
            <button class="btn-orange" @click="handlePrint">
              <i class="icon-print">🖨️</i> In hóa đơn
            </button>
            <button class="btn-orange" @click="openHistoryModal">
              <i class="icon-history">📜</i> Lịch sử hóa đơn
            </button>
          </div>
        </div>
      </div>

      <div class="card payment-history-section no-print">
        <h3 class="card-title">Lịch sử thanh toán</h3>
        <div class="table-responsive">
          <table class="payment-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã giao dịch</th>
                <th>Loại giao dịch</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th>Tổng tiền</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-if="
                  !invoice.thanhToanList || invoice.thanhToanList.length === 0
                "
              >
                <td colspan="8" class="text-center empty-cell">
                  Chưa có lịch sử thanh toán
                </td>
              </tr>
              <tr
                v-else
                v-for="(pay, index) in invoice.thanhToanList"
                :key="index"
              >
                <td>{{ index + 1 }}</td>
                <td class="font-bold">{{ pay.maGiaoDich || "---" }}</td>
                <td><span class="badge-type">Thanh toán</span></td>
                <td>
                  <span class="badge-method">{{ pay.phuongThuc }}</span>
                </td>
                <td>
                  <span
                    class="badge-status-payment"
                    :class="pay.trangThai === 1 ? 'completed' : 'pending'"
                  >
                    {{ pay.trangThai === 1 ? "Đã thanh toán" : "Chờ xử lý" }}
                  </span>
                </td>
                <td>{{ formatDate(pay.thoiGian) }}</td>
                <td class="text-money">{{ formatCurrency(pay.soTien) }}</td>
                <td>{{ pay.ghiChu || "" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        class="card cancelled-section no-print"
        v-if="invoice.trangThai === 5"
      >
        <h3>❌ Đơn hàng đã bị hủy</h3>
        <p>Lý do: {{ invoice.ghiChu || "Không có lý do cụ thể" }}</p>
      </div>

      <div class="info-summary-grid no-print">
        <div class="card info-card">
          <h3 class="card-title">👤 Thông tin khách hàng</h3>
          <div class="data-row">
            <span>Tên khách:</span> <strong>{{ invoice.tenKhachHang }}</strong>
          </div>
          <div class="data-row">
            <span>SĐT:</span> {{ invoice.soDienThoai }}
          </div>
          <div class="data-row">
            <span>Địa chỉ:</span>
            <span class="text-right-address">{{
              invoice.diaChi || "Mua tại quầy"
            }}</span>
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

      <div class="card shopee-summary-section no-print">
        <div class="shopee-summary-wrapper">
          <div class="bill-calculation">
            <div class="bill-row">
              <span class="bill-label">Tổng tiền hàng</span>
              <span class="bill-value">{{
                formatCurrency(invoice.tongTienHang)
              }}</span>
            </div>
            <div class="bill-row">
              <span class="bill-label">Phí vận chuyển</span>
              <span class="bill-value">{{
                formatCurrency(invoice.phiShip)
              }}</span>
            </div>
            <div class="bill-row" v-if="invoice.giamGia > 0">
              <span class="bill-label">Giảm giá voucher</span>
              <span class="bill-value"
                >-{{ formatCurrency(invoice.giamGia) }}</span
              >
            </div>
            <div class="bill-row total-row">
              <span class="bill-label">Thành tiền</span>
              <span class="bill-value big-orange">{{
                formatCurrency(invoice.tongThanhToan)
              }}</span>
            </div>
          </div>
        </div>

        <div class="payment-notification-box">
          <span class="icon-bell">🔔</span>
          Vui lòng thanh toán
          <span class="highlight-money">{{
            formatCurrency(invoice.tongThanhToan)
          }}</span>
          khi nhận hàng.
        </div>

        <div class="payment-method-footer">
          <div class="method-label">Phương thức Thanh toán</div>
          <div class="method-value">{{ getPaymentMethodName() }}</div>
        </div>
      </div>
      <div class="card product-card no-print">
        <h3 class="card-title">🛒 Danh sách sản phẩm</h3>
        <table class="bagi-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 50px">STT</th>
              <th class="text-center">Sản phẩm</th>
              <th class="text-center">Màu sắc</th>
              <th class="text-center">Kích cỡ</th>
              <th class="text-center">Đơn giá</th>
              <th class="text-center">Số lượng</th>
              <th class="text-center">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, index) in invoice.sanPhamList" :key="index">
              <td class="text-center">{{ index + 1 }}</td>
              <td class="text-center">
                <span class="product-name">{{ p.tenSanPham }}</span>
              </td>
              <td class="text-center">
                <span class="badge-color">{{ p.mauSac }}</span>
              </td>
              <td class="text-center">
                <span class="badge-size">{{ p.kichCo }}</span>
              </td>
              <td class="text-center">{{ formatCurrency(p.donGia) }}</td>
              <td class="text-center">{{ p.soLuong }}</td>
              <td class="text-center font-bold text-money">
                {{ formatCurrency(p.thanhTien) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal.show" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">{{ modal.title }}</h3>
        <p class="modal-message">{{ modal.message }}</p>

        <div class="modal-input-group">
          <label class="modal-label">Ghi chú (Tùy chọn):</label>
          <textarea
            v-model="modal.note"
            :placeholder="
              modal.type === 'cancel'
                ? 'Nhập lý do hủy đơn...'
                : 'Nhập ghi chú cập nhật trạng thái...'
            "
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

    <div v-if="showHistoryLog" class="modal-overlay">
      <div class="modal-content modal-lg">
        <div class="modal-header-custom">
          <h3 class="modal-title">📜 Lịch sử cập nhật trạng thái</h3>
          <button class="close-btn" @click="showHistoryLog = false">×</button>
        </div>
        <div class="modal-body-custom">
          <table class="history-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Hành động</th>
                <th>Trạng thái mới</th>
                <th>Người thực hiện</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, idx) in orderedHistory" :key="idx">
                <td>{{ formatDate(log.thoiGian) }}</td>
                <td>{{ log.hanhDong }}</td>
                <td>
                  <span class="badge-status-log">{{
                    getStatusName(log.trangThai)
                  }}</span>
                </td>
                <td>{{ log.nguoiThucHien || "Admin" }}</td>
                <td>{{ log.ghiChu }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer-custom">
          <button class="btn-modal-cancel" @click="showHistoryLog = false">
            Đóng
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

// --- INTERFACES ---
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
  ghiChu?: string;
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

// --- TIMELINE STEPS ---
const fixedSteps = [
  { status: 0, label: "Chờ xác nhận", icon: "📝" },
  { status: 1, label: "Đã xác nhận", icon: "✅" },
  { status: 2, label: "Chờ vận chuyển", icon: "📦" },
  { status: 3, label: "Đang vận chuyển", icon: "🚚" },
  { status: 4, label: "Hoàn thành", icon: "🎉" },
];

// --- STATES ---
const modal = reactive({
  show: false,
  title: "",
  message: "",
  type: "",
  targetStatus: 0,
  note: "",
});
const toast = reactive({ show: false, message: "" });
const showHistoryLog = ref(false);

// --- COMPUTED ---
const orderedHistory = computed(() => {
  if (!invoice.value || !invoice.value.lichSuList) return [];
  return [...invoice.value.lichSuList].reverse();
});

// --- HELPER FUNCTIONS ---
const getNextActionName = (currentStatus: number) => {
  switch (currentStatus) {
    case 0:
      return "Xác nhận đơn hàng";
    case 1:
      return "Chuyển vận chuyển";
    case 2:
      return "Xác nhận đang giao";
    case 3:
      return "Xác nhận hoàn thành";
    default:
      return "Cập nhật trạng thái";
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

const isStepActive = (stepStatus: number) => {
  if (!invoice.value) return false;
  if (invoice.value.trangThai === 5) return false;
  return stepStatus <= invoice.value.trangThai;
};

const getLogTime = (stepStatus: number) => {
  if (!invoice.value || !invoice.value.lichSuList) return "";
  const log = invoice.value.lichSuList.find((x) => x.trangThai === stepStatus);
  return log ? formatDate(log.thoiGian) : "";
};

// [NEW] Helper lấy tên phương thức thanh toán
const getPaymentMethodName = () => {
  if (
    invoice.value &&
    invoice.value.thanhToanList &&
    invoice.value.thanhToanList.length > 0
  ) {
    // Lấy phương thức đầu tiên tìm thấy
    return invoice.value.thanhToanList[0].phuongThuc;
  }
  // Nếu chưa có lịch sử thanh toán, hiển thị mặc định hoặc theo loại đơn
  return invoice.value?.loaiDon === 1 ? "Tiền mặt" : "Thanh toán khi nhận hàng";
};

// --- ACTION HANDLERS ---
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

const confirmAction = (actionType: "next" | "prev" | "cancel") => {
  if (!invoice.value) return;

  modal.type = actionType;
  modal.note = "";
  modal.show = true;

  if (actionType === "cancel") {
    modal.title = "Xác nhận hủy đơn hàng";
    modal.message = "Bạn có chắc chắn muốn hủy đơn hàng này không?";
    modal.targetStatus = 5;
  } else {
    const step = actionType === "next" ? 1 : -1;
    const nextStatus = invoice.value.trangThai + step;
    modal.targetStatus = nextStatus;
    const actionText = actionType === "next" ? "Chuyển sang" : "Quay lại";
    modal.title = `Xác nhận ${actionText.toLowerCase()} trạng thái`;
    modal.message = `${actionText} trạng thái: "${getStatusName(nextStatus)}"?`;
  }
};

const closeModal = () => {
  modal.show = false;
};
const openHistoryModal = () => {
  showHistoryLog.value = true;
};

const handleConfirm = async () => {
  if (!invoice.value) return;
  if (modal.type === "cancel" && !modal.note.trim()) {
    alert("Vui lòng nhập lý do hủy đơn!");
    return;
  }
  let noteToSend = modal.note;
  if (!noteToSend) {
    if (modal.type === "next")
      noteToSend = `Chuyển trạng thái sang ${getStatusName(modal.targetStatus)}`;
    if (modal.type === "prev")
      noteToSend = `Quay lại trạng thái ${getStatusName(modal.targetStatus)}`;
  }
  await executeUpdate(modal.targetStatus, noteToSend);
  closeModal();
};

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
    showToast("Cập nhật thành công!");
    await fetchDetail();
    if (status === 1) {
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  } catch (e: any) {
    console.error(e);
    alert(e.response?.data || "Lỗi cập nhật");
  }
};

const showToast = (message: string) => {
  toast.message = message;
  toast.show = true;
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
/* GLOBAL */
.invoice-detail-wrapper {
  background: #f4f7f6;
  padding: 20px;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
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

/* HEADER */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.main-title {
  color: #603b2c;
  font-size: 28px;
  font-weight: 800;
  margin: 0;
}
.subtitle {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
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

/* GRID 2 CỘT (Sửa lại từ 3 thành 2 vì đã bỏ cột Summary) */
.info-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}
@media (max-width: 1024px) {
  .info-summary-grid {
    grid-template-columns: 1fr;
  }
}

/* --- [NEW] SHOPEE STYLE SUMMARY SECTION --- */
.shopee-summary-section {
  background: #fff;
  padding: 0; /* padding xử lý bên trong */
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.shopee-summary-wrapper {
  padding: 20px;
  display: flex;
  justify-content: flex-end; /* Đẩy nội dung sang phải */
}

.bill-calculation {
  width: 100%;
  max-width: 400px; /* Giới hạn chiều rộng khu vực tính tiền */
}

.bill-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #555;
}

.bill-label {
  text-align: left;
}

.bill-value {
  text-align: right;
  font-weight: 500;
}

.total-row {
  margin-top: 15px;
  align-items: center;
}

.big-orange {
  font-size: 24px;
  color: #ee4d2d; /* Màu cam Shopee */
  font-weight: 700;
}

/* Notification Box (Màu vàng) */
.payment-notification-box {
  background-color: #fffefb;
  border: 1px solid #ffdb99; /* Viền vàng */
  padding: 15px 25px;
  font-size: 14px;
  color: #444;
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: none;
  border-right: none;
}

.icon-bell {
  font-size: 16px;
}

.highlight-money {
  color: #ee4d2d;
  font-weight: 700;
  font-size: 15px;
}

/* Footer (Phương thức thanh toán) */
.payment-method-footer {
  padding: 20px 25px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  background: #fff;
  border-top: 1px dashed #eee;
}

.method-label {
  font-size: 14px;
  color: #555;
}

.method-value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* ------------------------------------------ */

/* PRODUCT TABLE FULL WIDTH */
.product-card {
  width: 100%;
}
.bagi-table {
  width: 100%;
  border-collapse: collapse;
}
.bagi-table th {
  background-color: #603b2c;
  color: white;
  padding: 15px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  border-bottom: none;
  text-align: center; /* Căn giữa tiêu đề */
}
.bagi-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #444;
  vertical-align: middle;
  text-align: center; /* Căn giữa nội dung */
}
.bagi-table tr:hover td {
  background-color: #fcfcfc;
}
.product-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}
.text-center {
  text-align: center !important;
}

/* Info Card Data */
.data-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  border-bottom: 1px dashed #f0f0f0;
  padding-bottom: 8px;
}
.data-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}
.text-right-address {
  text-align: right;
  max-width: 60%;
}

/* BUTTONS & TIMELINE */
.action-bar-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #eee;
}
.action-left,
.action-right {
  display: flex;
  gap: 15px;
}
.btn-orange {
  background-color: #f57224;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(245, 114, 36, 0.2);
}
.btn-orange:hover {
  background-color: #d65b13;
}
.btn-outline-orange {
  background-color: white;
  color: #f57224;
  border: 1px solid #f57224;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-outline-orange:hover {
  background-color: #fff5f0;
}
.btn-white-border {
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}
.btn-white-border:hover {
  background-color: #f8f9fa;
  border-color: #ccc;
  color: #333;
}

.timeline-section {
  padding: 30px 20px 20px;
  overflow-x: auto;
}
.stepper-wrapper {
  display: flex;
  justify-content: space-between;
  width: 100%;
  min-width: 800px;
}
.stepper-item {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.step-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  z-index: 2;
  border: 3px solid #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: -20px;
}
.step-bar {
  width: 100%;
  height: 36px;
  background-color: #e9ecef;
  clip-path: polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%);
}
.step-content {
  text-align: center;
  margin-top: 10px;
  padding: 0 5px;
}
.step-label {
  font-weight: 600;
  font-size: 13px;
  color: #6c757d;
  text-transform: capitalize;
}
.step-time {
  font-size: 11px;
  color: #adb5bd;
  margin-top: 2px;
}
.stepper-item.active .step-icon-circle {
  background-color: #0d6efd;
  color: #fff;
  border-color: #fff;
}
.stepper-item.active .step-bar {
  background-color: #0d6efd;
}
.stepper-item.active .step-label {
  color: #0d6efd;
  font-weight: 700;
}
.stepper-item.active .step-time {
  color: #0d6efd;
}
.stepper-item:first-child .step-bar {
  clip-path: polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%);
}
.stepper-item:last-child .step-bar {
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%);
}
.stepper-item:last-child.active .step-bar {
  background-color: #0d6efd;
}

/* Payment Table */
.table-responsive {
  overflow-x: auto;
}
.payment-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.payment-table th {
  background-color: #f8f9fa;
  color: #444;
  font-weight: 700;
  padding: 12px 15px;
  text-align: left;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}
.payment-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #f1f1f1;
  color: #555;
  vertical-align: middle;
}

/* Badges */
.badge-type {
  background: #f3e8ff;
  color: #7e22ce;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.badge-method {
  background: #e0f2fe;
  color: #0284c7;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.badge-status-payment.completed {
  background: #e6f4ff;
  color: #0958d9;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.badge-status-payment.pending {
  background: #fff7ed;
  color: #c2410c;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.badge-status-log {
  background: #e2e8f0;
  color: #475569;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
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
.font-bold {
  font-weight: 700;
  color: #333;
}
.text-money {
  color: #d93025;
  font-weight: 600;
}

/* Modal Styles */
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
}
.modal-content {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s;
}
.modal-lg {
  width: 800px;
  max-width: 90%;
}
.modal-label {
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
  color: #333;
}
.modal-textarea {
  width: 100%;
  height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  margin-bottom: 15px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn-modal-cancel {
  background: #f8f9fa;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-modal-confirm {
  background: #603b2c;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

/* Custom History Modal Styles */
.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}
.modal-body-custom {
  max-height: 400px;
  overflow-y: auto;
}
.modal-footer-custom {
  margin-top: 15px;
  text-align: right;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

/* History Table Styles */
.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.history-table th {
  background: #f8f9fa;
  padding: 10px 15px;
  text-align: left;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
  color: #555;
}
.history-table td {
  padding: 10px 15px;
  border-bottom: 1px solid #f3f4f6;
  color: #444;
}

/* Toast */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #e6fffa;
  border-left: 5px solid #28c76f;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
  align-items: center;
  z-index: 2000;
  animation: slideIn 0.4s;
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
  font-size: 14px;
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
@keyframes slideIn {
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
