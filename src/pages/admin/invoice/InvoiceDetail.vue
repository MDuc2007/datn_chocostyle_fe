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
            v-for="(step, index) in timelineSteps"
            :key="index"
            :class="{
              active: index < timelineSteps.length - 1,
              current: index === timelineSteps.length - 1,
              cancelled: step.status === 5,
            }"
          >
            <div class="step-icon-circle">
              <img :src="step.icon" class="step-icon-img" />
            </div>
            <div
              v-if="index < timelineSteps.length - 1"
              class="step-line"
            ></div>
            <div class="step-content">
              <div class="step-label">{{ step.label }}</div>
              <div class="step-time">{{ formatDate(step.time) }}</div>
            </div>
          </div>
        </div>

        <div class="action-bar-bottom">
          <div
            class="action-left"
            v-if="invoice.trangThai < 4 && invoice.trangThai !== 5"
          >
            <button class="btn-orange" @click="confirmAction('next')">
              {{ getNextActionName(invoice.trangThai) }}
              <i class="icon-arrow-right">➡</i>
            </button>

            <button
              v-if="invoice.trangThai === 0"
              class="btn-white-border"
              @click="confirmAction('cancel')"
            >
              Xác nhận hủy đơn
            </button>
          </div>

          <div class="action-right">
            <button
              v-if="invoice.trangThai === 5 && daThanhToan > 0"
              class="btn-outline-red"
              @click="openRefundModal"
            >
              Xác nhận hoàn tiền
            </button>

            <button
              v-if="invoice.trangThai !== 5"
              class="btn-orange"
              @click="handlePrint"
            >
              <i class="icon-print">
                <img
                  src="/src/assets/icon/print-svgrepo-com.svg"
                  style="width: 24px; height: 24px"
                  alt=""
                />
              </i>
              In hóa đơn
            </button>
            <button class="btn-orange" @click="openHistoryModal">
              <i class="icon-history">
                <img
                  src="/src/assets/icon/file-clock-svgrepo-com.svg"
                  style="width: 24px; height: 24px"
                  alt=""
                />
              </i>
              Lịch sử hóa đơn
            </button>
          </div>
        </div>
      </div>

      <div class="dashboard-stats-grid no-print">
        <div class="stat-card">
          <div class="stat-icon" :class="getStatusIconClass(invoice.trangThai)">
            <img :src="getStatusIcon(invoice.trangThai)" alt="status icon" />
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
            <span>
              <img
                src="/src/assets/icon/money-dollar-svgrepo-com.svg"
                style="width: 24px; height: 24px"
                alt=""
              />
            </span>
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
            <span>
              <img
                src="/src/assets/icon/shipping-box-svgrepo-com.svg"
                style="width: 24px; height: 24px"
                alt=""
              />
            </span>
          </div>
          <div class="stat-info">
            <div class="stat-label">Số lượng sản phẩm</div>
            <div class="stat-value">{{ totalProductQuantity }} sản phẩm</div>
          </div>
        </div>
      </div>

      <div class="dashboard-info-grid no-print">
        <div class="detail-card">
          <div class="card-header-clean" style="justify-content: space-between">
            <div style="display: flex; align-items: center; gap: 10px">
              <div class="header-icon">
                <img
                  src="/src/assets/icon/user.svg"
                  style="width: 24px; height: 24px"
                  alt=""
                />
              </div>
              <h3>Thông tin khách hàng</h3>
            </div>
            <button
              v-if="invoice.trangThai === 0"
              class="btn-text-edit"
              @click="openAddressModal"
            >
              Sửa
            </button>
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
            <div class="header-icon">
              <img
                src="/src/assets/icon/shopping-cart-svgrepo-com.svg"
                style="width: 24px; height: 24px"
                alt=""
              />
            </div>
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
              <div class="sum-val">{{ formatCurrency(invoice.phiShip) }}</div>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <div class="card-header-clean">
            <div class="header-icon">
              <img
                src="/src/assets/icon/credit-card-svgrepo-com.svg"
                style="width: 24px; height: 24px"
                alt=""
              />
            </div>
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
        <div class="card-header-flex">
          <h3 class="card-title m-0">Lịch sử thanh toán</h3>
          <button
            v-if="
              !isPaid &&
              [0, 3].includes(invoice.loaiDon) &&
              invoice.trangThai !== 5
            "
            class="btn-orange btn-small"
            @click="openPaymentModal"
          >
            💳 Xác nhận thanh toán
          </button>
        </div>

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
                  <span v-if="pay.loaiGiaoDich === 2" class="text-danger"
                    >-{{ formatCurrency(pay.soTien) }}</span
                  >
                  <span v-else class="text-money">{{
                    formatCurrency(pay.soTien)
                  }}</span>
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
        <p>Lý do: {{ lyDoHuy }}</p>
      </div>

      <div class="card product-card no-print">
        <h3 class="card-title">
          <img
            src="/src/assets/icon/shopping-cart-svgrepo-com.svg"
            style="width: 24px; height: 24px"
            alt=""
          />
          Danh sách sản phẩm
        </h3>
        <div class="table-responsive">
          <table class="modern-table text-center-table">
            <thead>
              <tr>
                <th style="width: 60px">STT</th>
                <th style="width: 120px">Mã CTSP</th>
                <th style="text-align: left !important; padding-left: 16px">
                  Sản phẩm
                </th>
                <th>Phân loại hàng</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th class="text-right-force">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, index) in invoice.sanPhamList" :key="index">
                <td class="index-cell">{{ index + 1 }}</td>
                <td style="font-weight: bold; color: #475569">
                  {{ p.maSpct }}
                </td>
                <td style="text-align: left !important; padding-left: 16px">
                  <div class="product-info-cell">
                    <img
                      v-if="p.hinhAnh"
                      :src="p.hinhAnh"
                      alt="Ảnh SP"
                      class="product-img-thumb"
                    />
                    <div v-else class="product-img-placeholder">No image</div>
                    <span class="product-name">{{ p.tenSanPham }}</span>
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

                <td>
                  <div class="quantity-control" v-if="invoice.trangThai === 0">
                    <button
                      class="qty-btn"
                      :disabled="p.soLuong <= 1"
                      @click="changeQuantity(p, p.soLuong - 1)"
                    >
                      -
                    </button>
                    <span class="qty-val">{{ p.soLuong }}</span>
                    <button
                      class="qty-btn"
                      @click="changeQuantity(p, p.soLuong + 1)"
                    >
                      +
                    </button>
                  </div>
                  <div v-else class="quantity-text">x{{ p.soLuong }}</div>
                </td>

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

    <div
      v-if="showAddressModal"
      class="modal-overlay"
      @click.self="showAddressModal = false"
    >
      <div class="modal-card">
        <h3 class="modal-title-modern">Sửa thông tin nhận hàng</h3>
        <p class="modal-message-modern text-left">
          Chỉ có thể thay đổi khi đơn hàng chờ xác nhận.
        </p>

        <div class="modal-input-wrapper">
          <label class="input-label">Tên khách hàng</label>
          <input
            v-model="editForm.ten"
            type="text"
            class="modern-input"
            placeholder="Nhập tên người nhận"
          />
        </div>
        <div class="modal-input-wrapper">
          <label class="input-label">Số điện thoại</label>
          <input
            v-model="editForm.sdt"
            type="text"
            class="modern-input"
            placeholder="Nhập số điện thoại"
          />
        </div>
        <div class="modal-input-wrapper">
          <label class="input-label">Địa chỉ chi tiết</label>
          <textarea
            v-model="editForm.diaChi"
            rows="3"
            class="modern-textarea"
            placeholder="Số nhà, đường, xã/phường, quận/huyện..."
          ></textarea>
        </div>

        <div class="modal-footer-modern" style="margin-top: 20px">
          <button
            class="btn-modern btn-secondary"
            @click="showAddressModal = false"
          >
            Hủy
          </button>
          <button class="btn-modern btn-primary-modern" @click="saveAddress">
            Lưu thông tin
          </button>
        </div>
      </div>
    </div>

    <div v-if="modal.show" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header-icon" :class="getModalTypeClass(modal.type)">
          <span v-if="modal.type === 'cancel'">✕</span>
          <span v-else-if="modal.type === 'refund'">💸</span>
          <span v-else-if="modal.type === 'payment'">💳</span>
          <span v-else>➜</span>
        </div>

        <h3 class="modal-title-modern">{{ modal.title }}</h3>

        <p v-if="modal.type !== 'payment'" class="modal-message-modern">
          {{ modal.message }}
        </p>

        <div v-if="modal.type === 'payment'" class="payment-ui-container">
          <label class="input-label">Số tiền khách đưa:</label>
          <div class="currency-input-box">
            <input
              type="text"
              v-model="displayPaymentAmount"
              @input="formatPaymentInput"
              class="modern-input currency-input"
            />
            <span class="currency-unit">đ</span>
          </div>
          <button class="btn-exact-money" @click="fillExactAmount">
            Đúng số tiền
          </button>
        </div>

        <div v-if="modal.type === 'refund'" class="refund-alert-box">
          Số tiền cần hoàn: <strong>{{ formatCurrency(daThanhToan) }}</strong>
        </div>

        <div class="modal-input-wrapper" v-if="modal.type !== 'payment'">
          <label class="input-label">Ghi chú xác nhận:</label>
          <textarea
            v-model="modal.note"
            rows="3"
            :placeholder="
              modal.type === 'cancel'
                ? 'Vui lòng nhập lý do hủy đơn...'
                : 'Nhập ghi chú cho hệ thống...'
            "
            class="modern-textarea"
          ></textarea>
        </div>

        <div v-if="modal.type === 'payment'" style="margin-top: 20px">
          <div
            style="
              display: flex;
              justify-content: flex-end;
              margin-bottom: 10px;
            "
          >
            <span
              style="font-size: 12px; color: #999; cursor: pointer"
              @click="closeModal"
              >Đóng [x]</span
            >
          </div>
          <button class="btn-brown-full" @click="handleConfirm">
            XÁC NHẬN
          </button>
        </div>

        <div v-else class="modal-footer-modern">
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

    <div
      v-if="showHistoryLog"
      class="modal-overlay"
      @click.self="showHistoryLog = false"
    >
      <div class="modal-card modal-large">
        <div class="modal-header-flex">
          <h3 class="modal-title-modern">📜 Lịch sử cập nhật trạng thái</h3>
          <button
            class="close-icon-btn"
            @click="showHistoryLog = false"
            title="Đóng"
          >
            ✕
          </button>
        </div>
        <div class="modal-body-scroll">
          <table class="modern-table text-left-table">
            <thead>
              <tr>
                <th style="width: 150px">Thời gian</th>
                <th>Hành động</th>
                <th style="width: 140px">Trạng thái mới</th>
                <th style="width: 160px">Người thực hiện</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="orderedHistory.length === 0">
                <td colspan="5" class="text-center light-text py-4">
                  Chưa có lịch sử cập nhật nào.
                </td>
              </tr>
              <tr v-for="(log, idx) in orderedHistory" :key="idx">
                <td class="light-text font-13">
                  {{ formatDate(log.thoiGian) }}
                </td>
                <td class="font-bold text-dark">{{ log.hanhDong }}</td>
                <td>
                  <span class="badge-status-modern">{{
                    getStatusName(log.trangThai)
                  }}</span>
                </td>
                <td>
                  <div class="user-badge">
                    <span class="user-icon">👤</span
                    >{{ log.nguoiThucHien || "Admin" }}
                  </div>
                </td>
                <td class="light-text font-13">{{ log.ghiChu || "---" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer-right">
          <button
            class="btn-modern btn-secondary"
            @click="showHistoryLog = false"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="toast.show"
      :class="[
        'custom-toast',
        toast.type === 'success' ? 'toast-success' : 'toast-error',
      ]"
    >
      <div class="toast-text">{{ toast.message }}</div>
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
import checkIcon from "../../../assets/icon/check.svg";
import cancelIcon from "../../../assets/icon/cancel-svgrepo-com.svg";

// --- INTERFACES ---
interface InvoiceProduct {
  idSpct?: number; // Cần thiết để gọi API cập nhật số lượng
  tenSanPham: string;
  mauSac: string;
  kichCo: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  hinhAnh?: string;
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
  loaiGiaoDich?: number;
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

const lyDoHuy = computed(() => {
  if (!invoice.value || invoice.value.trangThai !== 5)
    return "Không có lý do cụ thể";
  const logHuy = invoice.value.lichSuList?.find((log) => log.trangThai === 5);
  if (logHuy && logHuy.ghiChu && logHuy.ghiChu.trim() !== "") {
    return logHuy.ghiChu;
  }
  return "Không có lý do cụ thể";
});

const modal = reactive({
  show: false,
  title: "",
  message: "",
  type: "",
  targetStatus: 0,
  note: "",
});

const toast = reactive({ show: false, message: "", type: "success" });
const showHistoryLog = ref(false);

const rawPaymentAmount = ref(0);
const displayPaymentAmount = ref("");

// --- CÁC STATE CHO POPUP SỬA ĐỊA CHỈ ---
const showAddressModal = ref(false);
const editForm = reactive({
  ten: "",
  sdt: "",
  diaChi: "",
});

const orderedHistory = computed(() => {
  if (!invoice.value || !invoice.value.lichSuList) return [];
  return [...invoice.value.lichSuList].reverse();
});

const totalProductQuantity = computed(() => {
  if (!invoice.value || !invoice.value.sanPhamList) return 0;
  return invoice.value.sanPhamList.reduce((sum, item) => sum + item.soLuong, 0);
});

const tongTienDaThu = computed(() => {
  if (!invoice.value?.thanhToanList) return 0;
  return invoice.value.thanhToanList
    .filter((item) => item.loaiGiaoDich !== 2)
    .reduce((sum, item) => sum + item.soTien, 0);
});

const daThanhToan = computed(() => {
  if (!invoice.value?.thanhToanList) return 0;
  return invoice.value.thanhToanList.reduce((sum, item) => {
    return item.loaiGiaoDich === 2 ? sum - item.soTien : sum + item.soTien;
  }, 0);
});

const isPaid = computed(() => {
  if (!invoice.value) return false;
  return daThanhToan.value >= invoice.value.tongThanhToan;
});

// --- HELPER FUNCTIONS ---
const getPaymentStatusLabel = () => {
  if (!invoice.value) return "";
  if (invoice.value.trangThai === 5) {
    if (daThanhToan.value === 0 && tongTienDaThu.value > 0)
      return "Đã hoàn tiền";
    if (daThanhToan.value > 0) return "Chờ hoàn tiền";
    return "Hủy bỏ";
  }
  return isPaid.value ? "Đã thanh toán" : "Chưa thanh toán";
};

const getPaymentBadgeClass = () => {
  if (!invoice.value) return "";
  if (invoice.value.trangThai === 5) {
    if (daThanhToan.value === 0 && tongTienDaThu.value > 0)
      return "badge-refunded";
    if (daThanhToan.value > 0) return "badge-warning";
    return "badge-cancelled";
  }
  return isPaid.value ? "badge-paid" : "badge-unpaid";
};

const getStatusIcon = (status: number) => {
  return status === 5 ? cancelIcon : checkIcon;
};
const getStatusIconClass = (status: number) => {
  if (status === 5) return "icon-red";
  if (status === 4) return "icon-green";
  return "icon-blue";
};

const getNextActionName = (currentStatus: number) => {
  if (invoice.value?.loaiDon === 1) {
    if (currentStatus === 0) return "Xác nhận hoàn thành";
  } else {
    switch (currentStatus) {
      case 0:
        return "Xác nhận đơn hàng";
      case 1:
        return "Chuyển vận chuyển";
      case 2:
        return "Xác nhận đang giao";
      case 3:
        return "Xác nhận hoàn thành";
    }
  }
  return "Cập nhật trạng thái";
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

const timelineSteps = computed(() => {
  if (!invoice.value?.lichSuList || invoice.value.lichSuList.length === 0) {
    return [
      {
        status: 0,
        label: "Chờ xác nhận",
        icon: checkIcon,
        time: invoice.value?.ngayTao,
      },
    ];
  }
  const sortedLog = [...invoice.value.lichSuList].sort(
    (a, b) => new Date(a.thoiGian).getTime() - new Date(b.thoiGian).getTime(),
  );
  const uniqueStepsMap = new Map();
  sortedLog.forEach((log) => {
    uniqueStepsMap.set(log.trangThai, log);
  });

  return Array.from(uniqueStepsMap.values())
    .sort(
      (a, b) => new Date(a.thoiGian).getTime() - new Date(b.thoiGian).getTime(),
    )
    .map((log) => ({
      status: log.trangThai,
      label: getStatusName(log.trangThai),
      icon: log.trangThai === 5 ? cancelIcon : checkIcon,
      time: log.thoiGian,
    }));
});

const getPaymentMethodName = () => {
  if (
    invoice.value &&
    invoice.value.thanhToanList &&
    invoice.value.thanhToanList.length > 0
  ) {
    return invoice.value.thanhToanList[0].phuongThuc;
  }
  return invoice.value?.loaiDon === 1 ? "Tiền mặt" : "Thanh toán khi nhận hàng";
};

const getModalTypeClass = (type: string) => {
  if (type === "cancel" || type === "refund") return "icon-danger";
  if (type === "payment") return "icon-green";
  return "icon-primary";
};

const getConfirmButtonClass = (type: string) => {
  if (type === "cancel" || type === "refund") return "btn-danger-modern";
  return "btn-primary-modern";
};

const showToast = (message: string, type: "success" | "error" = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

// --- CHỨC NĂNG SỬA ĐỊA CHỈ & SỐ LƯỢNG ---

// 1. Hàm mở Modal và đổ dữ liệu cũ vào
const openAddressModal = () => {
  if (!invoice.value) return;
  editForm.ten = invoice.value.tenKhachHang || "";
  editForm.sdt = invoice.value.soDienThoai || "";
  editForm.diaChi = invoice.value.diaChi || "";
  showAddressModal.value = true;
};

// 2. Hàm Gọi API Lưu thông tin địa chỉ
const saveAddress = async () => {
  if (!editForm.ten || !editForm.sdt || !editForm.diaChi) {
    showToast("Vui lòng điền đầy đủ thông tin!", "error");
    return;
  }
  try {
    await axios.put(
      `http://localhost:8080/api/hoa-don/${invoice.value?.id}/thong-tin-nhan-hang`,
      null,
      {
        params: {
          ten: editForm.ten,
          sdt: editForm.sdt,
          diaChi: editForm.diaChi,
        },
      },
    );

    await fetchDetail();
    showAddressModal.value = false;
    showToast("Cập nhật thông tin nhận hàng thành công!", "success");
  } catch (error: any) {
    showToast(error.response?.data || "Lỗi cập nhật địa chỉ", "error");
  }
};

// 3. Hàm Gọi API Tăng / Giảm số lượng
const changeQuantity = async (product: any, newQuantity: number) => {
  if (newQuantity < 1) return;
  if (!invoice.value || !product.idSpct) return;

  try {
    await axios.put(
      `http://localhost:8080/api/hoa-don/${invoice.value.id}/so-luong-san-pham`,
      null,
      {
        params: {
          idSpct: product.idSpct,
          soLuongMoi: newQuantity,
        },
      },
    );

    await fetchDetail();
    showToast("Đã cập nhật số lượng!", "success");
  } catch (error: any) {
    showToast(
      error.response?.data ||
        "Lỗi cập nhật số lượng. Có thể do hết hàng hoặc lỗi mạng.",
      "error",
    );
  }
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
    showToast("Lỗi tải dữ liệu hóa đơn!", "error");
  }
};

const confirmAction = (actionType: "next" | "cancel") => {
  if (!invoice.value) return;
  modal.type = actionType;
  modal.note = "";

  if (actionType === "cancel") {
    modal.title = "Xác nhận hủy đơn hàng";
    modal.message = "Bạn có chắc chắn muốn hủy đơn hàng này không?";
    modal.targetStatus = 5;
    modal.show = true;
  } else if (actionType === "next") {
    const validStatuses =
      invoice.value.loaiDon === 1 ? [0, 4] : [0, 1, 2, 3, 4];
    const currentIndex = validStatuses.indexOf(invoice.value.trangThai);
    let nextStatus = invoice.value.trangThai;

    if (currentIndex < validStatuses.length - 1) {
      nextStatus = validStatuses[currentIndex + 1];
    }

    if (
      nextStatus === 4 &&
      !isPaid.value &&
      [0, 3].includes(invoice.value.loaiDon)
    ) {
      showToast(
        "Đơn hàng chưa thanh toán đủ! Vui lòng 'Xác nhận thanh toán' trước.",
        "error",
      );
      return;
    }

    modal.targetStatus = nextStatus;
    modal.title = `Xác nhận chuyển trạng thái`;
    modal.message = `Chuyển trạng thái sang: "${getStatusName(nextStatus)}"?`;
    modal.show = true;
  }
};

const openPaymentModal = () => {
  if (!invoice.value) return;
  modal.type = "payment";
  modal.title = "Xác nhận thanh toán";
  rawPaymentAmount.value = 0;
  displayPaymentAmount.value = "";
  modal.show = true;
};

const formatPaymentInput = (e: any) => {
  let value = e.target.value.replace(/\D/g, "");
  if (!value) {
    rawPaymentAmount.value = 0;
    displayPaymentAmount.value = "";
    return;
  }
  rawPaymentAmount.value = parseInt(value, 10);
  displayPaymentAmount.value = rawPaymentAmount.value.toLocaleString("vi-VN");
};

const fillExactAmount = () => {
  if (!invoice.value) return;
  const remaining = invoice.value.tongThanhToan - daThanhToan.value;
  rawPaymentAmount.value = remaining > 0 ? remaining : 0;
  displayPaymentAmount.value = rawPaymentAmount.value.toLocaleString("vi-VN");
};

const executePayment = async () => {
  const remaining = invoice.value!.tongThanhToan - daThanhToan.value;
  if (rawPaymentAmount.value < remaining) {
    showToast(
      `Vui lòng thu đủ số tiền còn thiếu là: ${formatCurrency(remaining)}!`,
      "error",
    );
    return;
  }

  try {
    await axios.post(
      `http://localhost:8080/api/hoa-don/${invoice.value!.id}/thanh-toan-thu-cong`,
      {
        ghiChu: `Khách thanh toán tiền mặt: ${formatCurrency(rawPaymentAmount.value)}`,
      },
    );
    showToast("Xác nhận thanh toán thành công!", "success");
    await fetchDetail();
  } catch (e: any) {
    console.error(e);
    showToast(e.response?.data || "Lỗi cập nhật thanh toán", "error");
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
    showToast("Vui lòng nhập lý do hủy đơn!", "error");
    return;
  }

  if (modal.type === "refund") {
    await executeRefund(modal.note);
  } else if (modal.type === "payment") {
    await executePayment();
  } else {
    let noteToSend = modal.note;
    if (!noteToSend && modal.type === "next") {
      noteToSend = `Chuyển trạng thái sang ${getStatusName(modal.targetStatus)}`;
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
      },
    );

    let successMsg = "Cập nhật trạng thái thành công!";
    if (status === 5) {
      successMsg = "Đã hủy đơn hàng thành công!";
    } else if (status === 4) {
      successMsg = "Giao hàng thành công!";
    }
    showToast(successMsg, "success");

    await fetchDetail();
    if (status === 1 || status === 4) {
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  } catch (e: any) {
    console.error(e);
    showToast(e.response?.data || "Lỗi cập nhật", "error");
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
    showToast("Hoàn tiền thành công!", "success");
    await fetchDetail();
  } catch (e: any) {
    console.error(e);
    showToast(e.response?.data || "Lỗi hoàn tiền", "error");
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

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}
.card-header-flex .card-title {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.btn-small {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
}
.m-0 {
  margin: 0 !important;
}

.payment-ui-container {
  margin-bottom: 20px;
  text-align: left;
}
.currency-input-box {
  position: relative;
  margin-bottom: 10px;
}
.currency-input {
  width: 100%;
  padding: 12px 35px 12px 15px;
  border: 1px solid #d1c4b2;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  text-align: right;
  box-sizing: border-box;
  color: #333;
  background-color: #fff;
}
.currency-input:focus {
  outline: none;
  border-color: #8b5e34;
  box-shadow: 0 0 0 2px rgba(139, 94, 52, 0.1);
}
.currency-unit {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-weight: bold;
  font-size: 16px;
}
.btn-exact-money {
  background-color: #f7f3ee;
  color: #6b4c3a;
  border: 1px solid #d1c4b2;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-exact-money:hover {
  background-color: #eaddce;
}
.btn-brown-full {
  background-color: #7b533f;
  color: white;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 6px rgba(123, 83, 63, 0.2);
}
.btn-brown-full:hover {
  background-color: #63402e;
}

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
.stat-icon img {
  width: 24px;
  height: 24px;
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
  background: linear-gradient(90deg, #c79a63, #8b5e34);
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
}
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
  color: #63391f;
  border: 1px solid #63391f;
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

.timeline-section {
  padding: 40px 20px;
  background: #fff;
  overflow: visible;
}
.stepper-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  width: 100%;
}
.stepper-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.step-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #fff;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.3s ease;
}
.step-icon-img {
  width: 18px;
  height: 18px;
  filter: grayscale(1);
  opacity: 0.5;
}
.stepper-item.current .step-icon-img {
  filter: brightness(0) invert(1);
  opacity: 1;
}
.stepper-item.current .step-label {
  color: #8b5e34;
  font-weight: 700;
}
.step-content {
  margin-top: 12px;
  text-align: center;
}
.step-label {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
}
.step-time {
  font-size: 12px;
  color: #94a3b8;
}
.stepper-item.active .step-icon-circle {
  border-color: #c79a63;
  background-color: #fff;
}
.stepper-item.active .step-label {
  font-weight: 700;
}
.stepper-item.current .step-icon-circle {
  background: linear-gradient(135deg, #c79a63, #8b5e34);
  border-color: transparent;
  transform: scale(1.15);
  box-shadow: 0 0 15px rgba(199, 154, 99, 0.4);
}
.stepper-item.cancelled .step-icon-circle {
  border-color: #ef4444;
  background-color: #fee2e2;
}
.stepper-item.active .step-line {
  background-color: #c79a63;
}
.stepper-item.active .step-icon-img {
  filter: none;
  opacity: 1;
}
.step-line {
  position: absolute;
  top: 18px;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: #e2e8f0;
  z-index: 1;
}

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
.icon-green {
  background: #dcfce7;
  color: #16a34a;
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
  font-size: 13px;
  font-weight: 600;
  color: #6b4c3a;
  margin-bottom: 8px;
  display: block;
}

/* INPUT VÀ NÚT MỚI THÊM */
.modern-input {
  width: 100%;
  padding: 12px 15px;
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;
  background: #f9fafb;
}
.modern-input:focus {
  outline: none;
  border-color: #8b5e34;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(139, 94, 52, 0.1);
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
  border-color: #8b5e34;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(139, 94, 52, 0.1);
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
  background: #323335;
  color: #d5d8db;
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

/* THÊM CSS MỚI CHO NÚT SỬA VÀ TĂNG GIẢM SỐ LƯỢNG */
.btn-text-edit {
  background: none;
  border: none;
  color: #0284c7;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}
.btn-text-edit:hover {
  color: #0369a1;
  text-decoration: underline;
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  margin: 0 auto;
}
.qty-btn {
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border: none;
  font-weight: bold;
  font-size: 16px;
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.qty-btn:hover:not(:disabled) {
  background: #e2e8f0;
}
.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.qty-val {
  width: 40px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  border-left: 1px solid #cbd5e1;
  border-right: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
}

.modal-large {
  max-width: 850px;
  padding: 24px;
}
.modal-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 16px;
  margin-bottom: 16px;
}
.close-icon-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-icon-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}
.modal-body-scroll {
  max-height: 55vh;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 8px;
}
.modal-footer-right {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
}
.badge-status-modern {
  background: #f8fafc;
  color: #475569;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  display: inline-block;
}
.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.custom-toast {
  position: fixed;
  top: 30px;
  right: 30px;
  padding: 12px 20px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  animation: slideInRight 0.3s ease forwards;
}

.toast-success {
  background-color: #d1e7dd;
  color: #0f5132;
  border-left: 4px solid #198754;
}

.toast-error {
  background-color: #f8d7da;
  color: #842029;
  border-left: 4px solid #dc3545;
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

.text-left {
  text-align: left !important;
}

.product-info-cell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
}

.product-img-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.product-img-placeholder {
  width: 60px;
  height: 60px;
  background-color: #f4f4f4;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 10px;
  border: 1px solid #e0e0e0;
  flex-shrink: 0;
}
</style>
