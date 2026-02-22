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
            <button
              v-if="invoice.trangThai === 5 && daThanhToan > 0"
              class="btn-outline-red"
              @click="openRefundModal"
            >
              💸 Xác nhận hoàn tiền
            </button>

            <button
              v-if="invoice.trangThai !== 5"
              class="btn-orange"
              @click="handlePrint"
            >
              <i class="icon-print">🖨️</i> In hóa đơn
            </button>
            <button class="btn-orange" @click="openHistoryModal">
              <i class="icon-history">📜</i> Lịch sử hóa đơn
            </button>
          </div>
        </div>
      </div>

      <div class="dashboard-stats-grid no-print">
        <div class="stat-card">
          <div class="stat-icon" :class="getStatusIconClass(invoice.trangThai)">
            <span>{{ getStatusIconChar(invoice.trangThai) }}</span>
          </div>
          <div class="stat-info">
            <div class="stat-label">Trạng thái hiện tại</div>
            <div class="stat-value" :class="getStatusColor(invoice.trangThai)">
              {{ getStatusName(invoice.trangThai) }}
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-green">
            <span>💵</span>
          </div>
          <div class="stat-info">
            <div class="stat-label">Tổng tiền</div>
            <div class="stat-value text-money-big">
              {{ formatCurrency(invoice.tongThanhToan) }}
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-purple">
            <span>📦</span>
          </div>
          <div class="stat-info">
            <div class="stat-label">Số lượng sản phẩm</div>
            <div class="stat-value">{{ totalProductQuantity }} sản phẩm</div>
          </div>
        </div>
      </div>

      <div class="dashboard-info-grid no-print">
        <div class="detail-card">
          <div class="card-header-clean">
            <div class="header-icon">👤</div>
            <h3>Thông tin khách hàng</h3>
          </div>
          <div class="card-body-clean">
            <div class="customer-profile">
              <div class="avatar-placeholder">
                {{ invoice.tenKhachHang.charAt(0).toUpperCase() }}
              </div>
              <div class="profile-text">
                <div class="profile-name">{{ invoice.tenKhachHang }}</div>
                <div class="profile-sub">{{ invoice.soDienThoai }}</div>
                <div class="profile-sub email-text">
                  {{ invoice.diaChi || "Mua tại quầy" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <div class="card-header-clean">
            <div class="header-icon">🧾</div>
            <h3>Tóm tắt đơn hàng</h3>
          </div>
          <div class="card-body-clean summary-body">
            <div class="summary-item">
              <div class="sum-label">Tổng dòng sản phẩm</div>
              <div class="sum-val">{{ invoice.sanPhamList.length }} loại</div>
            </div>
            <div class="summary-item">
              <div class="sum-label">Tổng số lượng</div>
              <div class="sum-val">{{ totalProductQuantity }} cái</div>
            </div>
            <div class="summary-item" v-if="invoice.giamGia > 0">
              <div class="sum-label">Voucher giảm</div>
              <div class="sum-val text-red">
                -{{ formatCurrency(invoice.giamGia) }}
              </div>
            </div>
            <div class="summary-item">
              <div class="sum-label">Phí vận chuyển</div>
              <div class="sum-val">
                {{ formatCurrency(invoice.phiShip) }}
              </div>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <div class="card-header-clean">
            <div class="header-icon">💳</div>
            <h3>Thông tin thanh toán</h3>
          </div>
          <div class="card-body-clean">
            <div class="payment-clean-info">
              <div class="pay-method-row">
                <div class="pay-icon-small">🏧</div>
                <div class="pay-text">
                  <div class="pay-title">{{ getPaymentMethodName() }}</div>
                  <div class="pay-sub">Phương thức</div>
                </div>
                <div class="pay-status-badge" :class="getPaymentBadgeClass()">
                  {{ getPaymentStatusLabel() }}
                </div>
              </div>
              <div class="pay-total-row">
                <span>Tổng tiền thanh toán:</span>
                <span class="pay-total-val">{{
                  formatCurrency(invoice.tongThanhToan)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card payment-history-section no-print">
        <h3 class="card-title">Lịch sử thanh toán</h3>
        <div class="table-responsive">
          <table class="payment-table text-center-table">
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
                <td>
                  <span v-if="pay.loaiGiaoDich === 2" class="badge-soft-red"
                    >Hoàn tiền</span
                  >
                  <span v-else class="badge-type">Thanh toán</span>
                </td>
                <td>
                  <span class="badge-method">{{ pay.phuongThuc }}</span>
                </td>
                <td>
                  <span
                    class="badge-status-payment"
                    :class="pay.trangThai === 1 ? 'completed' : 'pending'"
                  >
                    {{ pay.trangThai === 1 ? "Thành công" : "Chờ xử lý" }}
                  </span>
                </td>
                <td>{{ formatDate(pay.thoiGian) }}</td>
                <td class="font-bold">
                  <span v-if="pay.loaiGiaoDich === 2" class="text-danger">
                    -{{ formatCurrency(pay.soTien) }}
                  </span>
                  <span v-else class="text-money">
                    {{ formatCurrency(pay.soTien) }}
                  </span>
                </td>
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

      <div class="card product-card no-print">
        <h3 class="card-title">🛒 Danh sách sản phẩm</h3>
        <div class="table-responsive">
          <table class="modern-table text-center-table">
            <thead>
              <tr>
                <th style="width: 60px">STT</th>
                <th class="text-left-force">Sản phẩm</th>
                <th>Phân loại hàng</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th class="text-right-force">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, index) in invoice.sanPhamList" :key="index">
                <td class="index-cell">{{ index + 1 }}</td>
                <td class="text-left-force">
                  <div class="product-cell">
                    <div class="product-thumb">👕</div>
                    <div class="product-info-text">
                      <div class="product-name">{{ p.tenSanPham }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="variant-tags">
                    <span class="variant-badge color-badge">{{
                      p.mauSac
                    }}</span>
                    <span class="variant-badge size-badge">{{ p.kichCo }}</span>
                  </div>
                </td>
                <td class="light-text">{{ formatCurrency(p.donGia) }}</td>
                <td class="quantity-text">x{{ p.soLuong }}</td>
                <td class="text-right-force">
                  <span class="total-price-text">{{
                    formatCurrency(p.thanhTien)
                  }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="modal.show" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header-icon" :class="getModalTypeClass(modal.type)">
          <span v-if="modal.type === 'cancel'">✕</span>
          <span v-else-if="modal.type === 'refund'">💸</span>
          <span v-else-if="modal.type === 'prev'">↩️</span>
          <span v-else>➜</span>
        </div>

        <h3 class="modal-title-modern">{{ modal.title }}</h3>

        <div class="modal-body-modern">
          <p class="modal-message-modern">{{ modal.message }}</p>

          <div v-if="modal.type === 'refund'" class="refund-alert-box">
            Số tiền cần hoàn: <strong>{{ formatCurrency(daThanhToan) }}</strong>
          </div>

          <div class="modal-input-wrapper">
            <label class="input-label">Ghi chú xác nhận:</label>
            <textarea
              v-model="modal.note"
              rows="3"
              :placeholder="
                modal.type === 'cancel'
                  ? 'Vui lòng nhập lý do hủy đơn...'
                  : 'Nhập ghi chú cho hệ thống (tùy chọn)...'
              "
              class="modern-textarea"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer-modern">
          <button class="btn-modern btn-secondary" @click="closeModal">
            Đóng
          </button>
          <button
            class="btn-modern"
            :class="getConfirmButtonClass(modal.type)"
            @click="handleConfirm"
          >
            {{ modal.type === "refund" ? "Hoàn tiền ngay" : "Xác nhận" }}
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
  loaiGiaoDich?: number; // 1: Thanh toán, 2: Hoàn tiền
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

const orderedHistory = computed(() => {
  if (!invoice.value || !invoice.value.lichSuList) return [];
  return [...invoice.value.lichSuList].reverse();
});

const totalProductQuantity = computed(() => {
  if (!invoice.value || !invoice.value.sanPhamList) return 0;
  return invoice.value.sanPhamList.reduce(
    (sum, item) => sum + item.soLuong,
    0
  );
});

// [LOGIC MỚI] Tính tổng tiền ĐÃ TỪNG THU (Chưa trừ hoàn tiền)
const tongTienDaThu = computed(() => {
  if (!invoice.value?.thanhToanList) return 0;
  return invoice.value.thanhToanList
    .filter((item) => item.loaiGiaoDich !== 2) // Chỉ cộng các giao dịch thanh toán
    .reduce((sum, item) => sum + item.soTien, 0);
});

// Tính tổng tiền ĐÃ THANH TOÁN THỰC TẾ (Thu - Hoàn)
// Biến này dùng để biết Shop đang giữ bao nhiêu tiền của khách
const daThanhToan = computed(() => {
  if (!invoice.value?.thanhToanList) return 0;
  return invoice.value.thanhToanList.reduce((sum, item) => {
    return item.loaiGiaoDich === 2 ? sum - item.soTien : sum + item.soTien;
  }, 0);
});

// Kiểm tra xem đơn đã thanh toán đủ chưa (đối với đơn thường)
const isPaid = computed(() => {
  if (!invoice.value) return false;
  return daThanhToan.value >= invoice.value.tongThanhToan;
});

// --- HELPER FUNCTIONS ---

// [LOGIC MỚI] Hiển thị Badge Text trạng thái thanh toán
const getPaymentStatusLabel = () => {
  if (!invoice.value) return "";

  // Nếu đơn hàng ĐÃ HỦY
  if (invoice.value.trangThai === 5) {
    // Nếu tiền shop đang giữ = 0 NHƯNG khách đã từng đóng tiền > 0
    // => Nghĩa là ĐÃ HOÀN TIỀN
    if (daThanhToan.value === 0 && tongTienDaThu.value > 0) {
      return "Đã hoàn tiền";
    }
    // Nếu tiền shop đang giữ > 0 => Chưa hoàn tiền
    if (daThanhToan.value > 0) {
      return "Chờ hoàn tiền";
    }
    // Chưa từng đóng tiền
    return "Hủy bỏ";
  }

  // Các trạng thái đơn hàng khác
  return isPaid.value ? "Đã thanh toán" : "Chưa thanh toán";
};

// [LOGIC MỚI] Hiển thị Badge Color
const getPaymentBadgeClass = () => {
  if (!invoice.value) return "";

  if (invoice.value.trangThai === 5) {
    if (daThanhToan.value === 0 && tongTienDaThu.value > 0) {
      return "badge-refunded"; // Màu tím
    }
    if (daThanhToan.value > 0) {
      return "badge-warning"; // Màu vàng
    }
    return "badge-cancelled"; // Màu xám
  }

  return isPaid.value ? "badge-paid" : "badge-unpaid";
};

const getStatusIconChar = (status: number) => {
  if (status === 5) return "✕";
  return "✓";
};
const getStatusIconClass = (status: number) => {
  if (status === 5) return "icon-red";
  if (status === 4) return "icon-green";
  return "icon-blue";
};

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
const getPaymentMethodName = () => {
  if (
    invoice.value &&
    invoice.value.thanhToanList &&
    invoice.value.thanhToanList.length > 0
  ) {
    return invoice.value.thanhToanList[0].phuongThuc;
  }
  return invoice.value?.loaiDon === 1
    ? "Tiền mặt"
    : "Thanh toán khi nhận hàng";
};

// [NEW HELPER FUNCTIONS FOR MODAL]
const getModalTypeClass = (type: string) => {
  if (type === "cancel" || type === "refund") return "icon-danger";
  if (type === "prev") return "icon-warning";
  return "icon-primary";
};

const getConfirmButtonClass = (type: string) => {
  if (type === "cancel" || type === "refund") return "btn-danger-modern";
  return "btn-primary-modern";
};

// [NEW HELPER FUNCTIONS FOR MODAL]
const getModalTypeClass = (type: string) => {
  if (type === "cancel" || type === "refund") return "icon-danger";
  if (type === "prev") return "icon-warning";
  return "icon-primary";
};

const getConfirmButtonClass = (type: string) => {
  if (type === "cancel" || type === "refund") return "btn-danger-modern";
  return "btn-primary-modern";
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
    modal.message = `${actionText} trạng thái: "${getStatusName(
      nextStatus
    )}"?`;
  }
};

const openRefundModal = () => {
  modal.type = "refund";
  modal.title = "Xác nhận hoàn tiền";
  modal.message =
    "Bạn xác nhận hoàn lại tiền cho khách hàng do đơn hàng bị hủy?";
  modal.note = "";
  modal.show = true;
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

  if (modal.type === "refund") {
    await executeRefund(modal.note);
  } else {
    let noteToSend = modal.note;
    if (!noteToSend) {
      if (modal.type === "next")
        noteToSend = `Chuyển trạng thái sang ${getStatusName(
          modal.targetStatus
        )}`;
      if (modal.type === "prev")
        noteToSend = `Quay lại trạng thái ${getStatusName(
          modal.targetStatus
        )}`;
    }
    await executeUpdate(modal.targetStatus, noteToSend);
  }
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
      }
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

const executeRefund = async (note: string) => {
  if (!invoice.value) return;
  try {
    await axios.post(`http://localhost:8080/api/hoa-don/hoan-tien`, {
      idHoaDon: invoice.value.id,
      soTien: daThanhToan.value,
      ghiChu: note || "Hoàn tiền do hủy đơn",
    });
    showToast("Hoàn tiền thành công!");
    await fetchDetail();
  } catch (e: any) {
    console.error(e);
    alert(e.response?.data || "Lỗi hoàn tiền");
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
/* GLOBAL & FONTS */
.invoice-detail-wrapper {
  background: #f8f9fa;
  padding: 24px;
  min-height: 100vh;
  font-family: "Inter", "Segoe UI", sans-serif;
  color: #333;
}
.card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}
.card-title {
  font-size: 18px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
  margin-bottom: 16px;
  font-weight: 700;
  color: #2c3e50;
}

/* HEADER */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.main-title {
  color: #333;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.subtitle {
  color: #666;
  font-size: 14px;
  margin-top: 4px;
}
.btn-back {
  background: #e9ecef;
  color: #495057;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-back:hover {
  background: #dee2e6;
}

/* DASHBOARD STATS */
.dashboard-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f1f1;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 16px;
  flex-shrink: 0;
}
.icon-blue {
  background: #e0f2fe;
  color: #0284c7;
}
.icon-green {
  background: #dcfce7;
  color: #16a34a;
}
.icon-purple {
  background: #f3e8ff;
  color: #9333ea;
}
.icon-red {
  background: #fee2e2;
  color: #dc2626;
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}
.text-money-big {
  color: #d93025;
  font-size: 18px;
}

/* DASHBOARD INFO GRID */
.dashboard-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}
.detail-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f1f1;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.card-header-clean {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-icon {
  font-size: 16px;
  color: #475569;
}
.card-header-clean h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}
.card-body-clean {
  padding: 20px;
  flex: 1;
}

.customer-profile {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}
.avatar-placeholder {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}
.profile-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.profile-name {
  font-weight: 700;
  font-size: 15px;
  color: #1e293b;
}
.profile-sub {
  font-size: 13px;
  color: #64748b;
}
.email-text {
  font-size: 12px;
  color: #94a3b8;
  word-break: break-all;
}

.summary-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sum-label {
  font-size: 14px;
  color: #64748b;
}
.sum-val {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.text-red {
  color: #ef4444;
}

.payment-clean-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: space-between;
  height: 100%;
}
.pay-method-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
}
.pay-icon-small {
  width: 36px;
  height: 36px;
  background: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 1px solid #e2e8f0;
}
.pay-text {
  flex: 1;
}
.pay-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.pay-sub {
  font-size: 12px;
  color: #64748b;
}

.pay-status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}
.badge-paid {
  background: #dcfce7;
  color: #16a34a;
}
.badge-unpaid {
  background: #fee2e2;
  color: #dc2626;
}

/* NEW BADGES FOR REFUND LOGIC */
.badge-refunded {
  background: #f3e8ff;
  color: #7e22ce;
  border: 1px solid #d8b4fe;
}
.badge-warning {
  background: #fef9c3;
  color: #a16207;
  border: 1px solid #fde047;
}
.badge-cancelled {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.pay-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed #e2e8f0;
  padding-top: 12px;
  font-size: 14px;
  color: #475569;
}
.pay-total-val {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
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
  border-radius: 6px;
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

/* RED OUTLINE BUTTON FOR REFUND */
.btn-outline-red {
  background-color: white;
  color: #dc2626;
  border: 1px solid #dc2626;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-outline-red:hover {
  background-color: #fef2f2;
}

.btn-outline-orange {
  background-color: white;
  color: #f57224;
  border: 1px solid #f57224;
  padding: 10px 20px;
  border-radius: 6px;
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
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}
.btn-white-border:hover {
  background-color: #f8f9fa;
  border-color: #ccc;
  color: #333;
}

/* Timeline Stepper */
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

.text-center-table th,
.text-center-table td {
  text-align: center !important;
}
.text-left-force {
  text-align: left !important;
}
.text-right-force {
  text-align: right !important;
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

/* REFUND BADGES */
.badge-soft-red {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.text-danger {
  color: #dc2626;
  font-weight: 700;
}
.text-money {
  color: #d93025;
  font-weight: 600;
}

/* Product Table */
.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.modern-table th {
  background-color: #f8f9fa;
  color: #64748b;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  padding: 16px;
  border-bottom: 2px solid #e2e8f0;
  letter-spacing: 0.5px;
}
.modern-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  color: #334155;
  font-size: 14px;
}
.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.product-thumb {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 1px solid #e2e8f0;
}
.product-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}
.variant-tags {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.variant-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.color-badge,
.size-badge {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}
.light-text {
  color: #64748b;
}
.quantity-text {
  font-weight: 600;
  color: #334155;
}
.total-price-text {
  color: #d93025;
  font-weight: 700;
  font-size: 15px;
}

/* MODERN MODAL STYLES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  background: #ffffff;
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  text-align: center;
  transform: translateY(0);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.modal-header-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.icon-primary {
  background: #e0f2fe;
  color: #0284c7;
}
.icon-danger {
  background: #fee2e2;
  color: #dc2626;
}
.icon-warning {
  background: #fef3c7;
  color: #d97706;
}

.modal-title-modern {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.modal-message-modern {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
  line-height: 1.5;
}

.refund-alert-box {
  background: #fff1f2;
  border: 1px dashed #fda4af;
  color: #be123c;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 15px;
}

.modal-input-wrapper {
  text-align: left;
  margin-bottom: 20px;
}
.input-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  display: block;
}
.modern-textarea {
  width: 100%;
  padding: 12px 15px;
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;
  resize: none;
  background: #f9fafb;
}
.modern-textarea:focus {
  outline: none;
  border-color: #0d6efd;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.modal-footer-modern {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-modern {
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
}
.btn-secondary:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-primary-modern {
  background: #0f172a;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.2);
}
.btn-primary-modern:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.btn-danger-modern {
  background: #dc2626;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);
}
.btn-danger-modern:hover {
  background: #b91c1c;
  transform: translateY(-1px);
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
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* History Log Modal */
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
.badge-status-log {
  background: #e2e8f0;
  color: #475569;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
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

/* RESPONSIVE */
@media (max-width: 1024px) {
  .dashboard-stats-grid,
  .dashboard-info-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .stepper-wrapper {
    min-width: 600px;
  }
}
</style>