<template>
  <div class="app-container">
    <Header></Header>

    <div class="breadcrumb">
      <span @click="$router.push('/')">Trang chủ</span>
      <span class="separator">/</span>
      <span @click="$router.push('/my-orders')">Đơn mua</span>
      <span class="separator">/</span>
      <span class="current">Chi tiết đơn hàng</span>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="invoice-detail-wrapper">
          <div v-if="!invoice" class="loading-container">
            <div class="spinner"></div>
            <p>Đang tải dữ liệu hóa đơn...</p>
          </div>

          <div v-else>
            <div class="detail-header no-print">
              <div class="header-left">
                <h1 class="main-title">
                  Chi tiết đơn hàng #{{ invoice.maHoaDon }}
                </h1>
                <p class="subtitle">
                  Ngày tạo: {{ formatDate(invoice.ngayTao) }}
                </p>
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

              <div class="action-bar-bottom" v-if="isLoggedIn">
                <div class="action-left">
                  <button
                    v-if="invoice.trangThai === 0"
                    class="btn-white-border"
                    @click="confirmAction('cancel')"
                  >
                    Xác nhận hủy đơn
                  </button>
                </div>
              </div>
            </div>

            <div class="dashboard-stats-grid no-print">
              <div class="stat-card">
                <div
                  class="stat-icon"
                  :class="getStatusIconClass(invoice.trangThai)"
                >
                  <img
                    :src="getStatusIcon(invoice.trangThai)"
                    alt="status icon"
                  />
                </div>
                <div class="stat-info">
                  <div class="stat-label">Trạng thái hiện tại</div>
                  <div
                    class="stat-value"
                    :class="getStatusColor(invoice.trangThai)"
                  >
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
                  <div class="stat-value">
                    {{ totalProductQuantity }} sản phẩm
                  </div>
                </div>
              </div>
            </div>

            <div class="dashboard-info-grid no-print">
              <div class="detail-card">
                <div
                  class="card-header-clean"
                  style="justify-content: space-between; display: flex"
                >
                  <div style="display: flex; align-items: center; gap: 10px">
                    <div class="header-icon">
                      <img
                        src="/src/assets/icon/user.svg"
                        style="width: 24px; height: 24px"
                        alt=""
                      />
                    </div>
                    <h3 style="margin: 0">Thông tin khách hàng</h3>
                  </div>

                  <button
                    v-if="canEditCustomerInfo && isLoggedIn"
                    @click="openEditCustomerModal"
                    class="text-primary-btn"
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
                    <div class="sum-val">
                      {{ invoice.sanPhamList.length }} loại
                    </div>
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
                        <div class="pay-title">
                          {{ getPaymentMethodName() }}
                        </div>
                        <div class="pay-sub">Phương thức</div>
                      </div>
                      <div
                        class="pay-status-badge"
                        :class="getPaymentBadgeClass()"
                      >
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
              </div>
              <div class="table-responsive">
                <table class="payment-table text-center-table">
                  <thead>
                    <tr>
                      <th style="width: 60px">STT</th>
                      <th style="width: 140px">Mã giao dịch</th>
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
                        !invoice.thanhToanList ||
                        invoice.thanhToanList.length === 0
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
                        <span
                          v-if="pay.loaiGiaoDich === 2"
                          class="badge-soft-red"
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

                      <th
                        style="text-align: left !important; padding-left: 16px"
                      >
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

                      <td
                        style="text-align: left !important; padding-left: 16px"
                      >
                        <div class="product-info-cell">
                          <img
                            v-if="p.hinhAnh"
                            :src="p.hinhAnh"
                            alt="Ảnh SP"
                            class="product-img-thumb"
                          />
                          <div v-else class="product-img-placeholder">
                            No image
                          </div>
                          <span class="product-name">{{ p.tenSanPham }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="variant-tags">
                          <span class="variant-badge color-badge">{{
                            p.mauSac
                          }}</span>
                          <span class="variant-badge size-badge">{{
                            p.kichCo
                          }}</span>
                        </div>
                      </td>
                      <td class="light-text" style="vertical-align: middle">
                        <div
                          style="
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                          "
                        >
                          <div
                            v-if="getPriceChangeInfo(p.idSpct, p.donGia)"
                            class="price-changed-wrapper"
                          >
                            <div class="current-price-red">
                              {{ formatCurrency(p.donGia) }}
                            </div>

                            <div class="price-warning-box">
                              <div class="box-title">Giá gốc đã thay đổi:</div>
                              <div class="box-compare">
                                <span class="old-price-strike">{{
                                  formatCurrency(
                                    getPriceChangeInfo(p.idSpct, p.donGia)
                                      .oldPrice,
                                  )
                                }}</span>
                                →
                                <span>{{ formatCurrency(p.donGia) }}</span>
                              </div>
                            </div>
                          </div>

                          <div v-else>
                            <span>{{ formatCurrency(p.donGia) }}</span>
                          </div>
                        </div>
                      </td>
                      <td class="quantity-text">
                        <div
                          v-if="canEditProducts && isLoggedIn"
                          class="qty-control-wrapper"
                        >
                          <button
                            class="btn-qty"
                            @click="updateProductQuantity(p, p.soLuong - 1)"
                            :disabled="p.soLuong <= 1"
                          >
                            -
                          </button>
                          <span class="qty-val">{{ p.soLuong }}</span>
                          <button
                            class="btn-qty"
                            @click="updateProductQuantity(p, p.soLuong + 1)"
                          >
                            +
                          </button>
                        </div>
                        <span v-else>x{{ p.soLuong }}</span>
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
        </div>
      </div>
    </div>

    <div
      v-if="showCustomerModal"
      class="modal-overlay"
      @click.self="showCustomerModal = false"
    >
      <div class="modal-card modal-lg-custom">
        <h3 class="modal-title-modern">Sửa thông tin nhận hàng</h3>

        <div class="form-row-custom">
          <div class="modal-input-wrapper">
            <label class="input-label">Tên khách hàng</label>
            <input
              type="text"
              v-model="customerForm.ten"
              class="modern-input"
            />
          </div>
          <div class="modal-input-wrapper">
            <label class="input-label">Số điện thoại</label>
            <input
              type="text"
              v-model="customerForm.sdt"
              class="modern-input"
            />
          </div>
        </div>

        <div class="form-row-custom">
          <div class="modal-input-wrapper">
            <label class="input-label">Tỉnh/Thành phố</label>
            <select
              v-model="selectedProvince"
              @change="handleProvinceChange"
              class="modern-input"
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              <option
                v-for="p in provinces"
                :key="p.ProvinceID"
                :value="p.ProvinceID"
              >
                {{ p.ProvinceName }}
              </option>
            </select>
          </div>
          <div class="modal-input-wrapper">
            <label class="input-label">Quận/Huyện</label>
            <select
              v-model="selectedDistrict"
              @change="handleDistrictChange"
              :disabled="!selectedProvince"
              class="modern-input"
            >
              <option value="">Chọn Quận/Huyện</option>
              <option
                v-for="d in districts"
                :key="d.DistrictID"
                :value="d.DistrictID"
              >
                {{ d.DistrictName }}
              </option>
            </select>
          </div>
          <div class="modal-input-wrapper">
            <label class="input-label">Phường/Xã</label>
            <select
              v-model="selectedWard"
              @change="handleWardChange"
              :disabled="!selectedDistrict"
              class="modern-input"
            >
              <option value="">Chọn Phường/Xã</option>
              <option v-for="w in wards" :key="w.WardCode" :value="w.WardCode">
                {{ w.WardName }}
              </option>
            </select>
          </div>
        </div>

        <div class="modal-input-wrapper">
          <label class="input-label">Địa chỉ chi tiết (Số nhà, đường...)</label>
          <textarea
            v-model="customerForm.diaChiCuThe"
            class="modern-textarea"
            rows="2"
            placeholder="Ví dụ: Số 10, Ngõ 12..."
          ></textarea>
        </div>

        <div class="modal-footer-modern mt-3">
          <button
            class="btn-modern btn-secondary"
            @click="showCustomerModal = false"
          >
            Hủy
          </button>
          <button
            class="btn-modern btn-primary-modern"
            @click="saveCustomerInfo"
          >
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
          <span v-else-if="modal.type === 'prev'">↩️</span>
          <span v-else>➜</span>
        </div>

        <h3 class="modal-title-modern">{{ modal.title }}</h3>

        <p class="modal-message-modern">
          {{ modal.message }}
        </p>

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
                    >{{ log.nguoiThucHien || "Hệ thống" }}
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

    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import ClientSidebar from "../../pages/views/ClientSidebar.vue";

// --- INTERFACES ---
interface InvoiceProduct {
  idSpct: number;
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

// 👉 BIẾN ĐIỀU KHIỂN NÚT HỦY ĐƠN (Kiểm tra đăng nhập)
const isLoggedIn = ref(false);

const lyDoHuy = computed(() => {
  if (!invoice.value || invoice.value.trangThai !== 5)
    return "Không có lý do cụ thể";

  const logHuy = invoice.value.lichSuList?.find((log) => log.trangThai === 5);

  if (logHuy && logHuy.ghiChu && logHuy.ghiChu.trim() !== "") {
    return logHuy.ghiChu;
  }

  return "Không có lý do cụ thể";
});

// ===============================================
// AUTH HEADER (Phục vụ gọi API Cập nhật)
// ===============================================
const getAuthHeaders = () => {
  const userStr = localStorage.getItem("user");
  const token = userStr
    ? JSON.parse(userStr).accessToken
    : localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ===============================================
// KIỂM TRA ĐIỀU KIỆN CHUNG CHO SỬA & HỦY
// ===============================================
const canEditOrder = computed(() => {
  if (!invoice.value) return false;
  const paymentMethod = getPaymentMethodName().toLowerCase();
  const isCash =
    invoice.value.loaiDon === 1 ||
    paymentMethod.includes("tiền mặt") ||
    paymentMethod.includes("cod") ||
    paymentMethod.includes("khi nhận hàng");

  return invoice.value.trangThai === 0 && isCash;
});

// ===============================================
// LOGIC SỬA THÔNG TIN KHÁCH HÀNG (TÍCH HỢP GHN)
// ===============================================
const GHN_TOKEN = "31476b34-15db-11f1-9cf9-9efb715b9957";
const GHN_API_BASE = "https://online-gateway.ghn.vn/shiip/public-api";

const provinces = ref<any[]>([]);
const districts = ref<any[]>([]);
const wards = ref<any[]>([]);

const selectedProvince = ref<string | number>("");
const selectedDistrict = ref<string | number>("");
const selectedWard = ref<string>("");

const customerForm = reactive({
  ten: "",
  sdt: "",
  diaChiCuThe: "",
  thanhPho: "",
  quan: "",
  phuong: "",
});
const showCustomerModal = ref(false);

const getProvinces = async () => {
  try {
    const res = await axios.get(`${GHN_API_BASE}/master-data/province`, {
      headers: { token: GHN_TOKEN },
    });
    provinces.value = res.data.data;
  } catch (error) {
    console.error("Lỗi lấy tỉnh:", error);
  }
};

const getDistricts = async (provinceId: any) => {
  try {
    const res = await axios.get(`${GHN_API_BASE}/master-data/district`, {
      headers: { token: GHN_TOKEN },
      params: { province_id: provinceId },
    });
    districts.value = res.data.data;
  } catch (error) {
    console.error("Lỗi lấy quận:", error);
  }
};

const getWards = async (districtId: any) => {
  try {
    const res = await axios.get(`${GHN_API_BASE}/master-data/ward`, {
      headers: { token: GHN_TOKEN },
      params: { district_id: districtId },
    });
    wards.value = res.data.data;
  } catch (error) {
    console.error("Lỗi lấy phường:", error);
  }
};

const handleProvinceChange = async () => {
  districts.value = [];
  wards.value = [];
  selectedDistrict.value = "";
  selectedWard.value = "";
  const p = provinces.value.find(
    (x) => x.ProvinceID === selectedProvince.value,
  );
  if (p) {
    customerForm.thanhPho = p.ProvinceName;
    await getDistricts(selectedProvince.value);
  }
};

const handleDistrictChange = async () => {
  wards.value = [];
  selectedWard.value = "";
  const d = districts.value.find(
    (x) => x.DistrictID === selectedDistrict.value,
  );
  if (d) {
    customerForm.quan = d.DistrictName;
    await getWards(selectedDistrict.value);
  }
};

const handleWardChange = () => {
  const w = wards.value.find((x) => x.WardCode === selectedWard.value);
  if (w) customerForm.phuong = w.WardName;
};

const mapAddressFromText = async (
  cityName: string,
  districtName: string,
  wardName: string,
) => {
  try {
    if (provinces.value.length === 0) await getProvinces();
    const foundProvince = provinces.value.find(
      (p) =>
        p.ProvinceName.toLowerCase().trim() === cityName.toLowerCase().trim() ||
        p.NameExtension?.some(
          (ext: string) => ext.toLowerCase() === cityName.toLowerCase().trim(),
        ),
    );

    if (foundProvince) {
      selectedProvince.value = foundProvince.ProvinceID;
      customerForm.thanhPho = foundProvince.ProvinceName;
      await getDistricts(foundProvince.ProvinceID);

      const foundDistrict = districts.value.find(
        (d) =>
          d.DistrictName.toLowerCase().trim() ===
            districtName.toLowerCase().trim() ||
          d.NameExtension?.some(
            (ext: string) =>
              ext.toLowerCase() === districtName.toLowerCase().trim(),
          ),
      );
      if (foundDistrict) {
        selectedDistrict.value = foundDistrict.DistrictID;
        customerForm.quan = foundDistrict.DistrictName;
        await getWards(foundDistrict.DistrictID);

        const foundWard = wards.value.find(
          (w) =>
            w.WardName.toLowerCase().trim() === wardName.toLowerCase().trim() ||
            w.NameExtension?.some(
              (ext: string) =>
                ext.toLowerCase() === wardName.toLowerCase().trim(),
            ),
        );
        if (foundWard) {
          selectedWard.value = foundWard.WardCode;
          customerForm.phuong = foundWard.WardName;
        }
      }
    }
  } catch (e) {
    console.error("Lỗi map địa chỉ:", e);
  }
};

const openEditCustomerModal = async () => {
  if (!invoice.value) return;
  customerForm.ten = invoice.value.tenKhachHang;
  customerForm.sdt = invoice.value.soDienThoai;

  if (invoice.value.diaChi) {
    const parts = invoice.value.diaChi.split(",").map((s) => s.trim());
    if (parts.length >= 4) {
      customerForm.diaChiCuThe = parts[0];
      customerForm.phuong = parts[1];
      customerForm.quan = parts[2];
      customerForm.thanhPho = parts[3];
      await mapAddressFromText(
        customerForm.thanhPho,
        customerForm.quan,
        customerForm.phuong,
      );
    } else {
      customerForm.diaChiCuThe = invoice.value.diaChi;
    }
  }

  if (provinces.value.length === 0) await getProvinces();
  showCustomerModal.value = true;
};

const saveCustomerInfo = async () => {
  if (
    !customerForm.ten ||
    !customerForm.sdt ||
    !customerForm.diaChiCuThe ||
    !customerForm.phuong
  ) {
    return showToast("Vui lòng điền đầy đủ thông tin địa chỉ!", "error");
  }
  const fullAddress = `${customerForm.diaChiCuThe}, ${customerForm.phuong}, ${customerForm.quan}, ${customerForm.thanhPho}`;
  try {
    await axios.put(
      `http://localhost:8080/api/hoa-don/${invoice.value?.id}/thong-tin-nhan-hang`,
      null,
      {
        params: {
          ten: customerForm.ten,
          sdt: customerForm.sdt,
          diaChi: fullAddress,
        },
        headers: getAuthHeaders(),
      },
    );
    showToast("Cập nhật thông tin khách hàng thành công!", "success");
    showCustomerModal.value = false;
    fetchDetail();
  } catch (e: any) {
    showToast(e.response?.data || "Lỗi khi cập nhật thông tin!", "error");
  }
};

// ===============================================
// LOGIC SỬA SỐ LƯỢNG SP
// ===============================================
const updateProductQuantity = async (item: InvoiceProduct, newQty: number) => {
  if (newQty < 1) return;
  try {
    await axios.put(
      `http://localhost:8080/api/hoa-don/${invoice.value?.id}/so-luong-san-pham`,
      null,
      {
        // THÊM donGia VÀO ĐÂY ĐỂ BACKEND NHẬN DIỆN DÒNG
        params: {
          idSpct: item.idSpct,
          soLuongMoi: newQty,
          donGia: item.donGia,
        },
        headers: getAuthHeaders(),
      },
    );
    fetchDetail();
  } catch (e: any) {
    showToast(e.response?.data || "Lỗi khi cập nhật số lượng!", "error");
  }
};
// ===============================================
// LẤY CẢNH BÁO GIÁ ĐÃ BỊ ADMIN THAY ĐỔI
// ===============================================
const getPriceChangeInfo = (idSpct, currentPrice) => {
  if (!invoice.value?.lichSuList) return null;
  // Tìm các lịch sử liên quan đến thay đổi giá của idSpct này
  const logs = [...invoice.value.lichSuList].filter((l) =>
    l.ghiChu.includes(`[PRICE_CHANGE] ID ${idSpct}:`),
  );

  if (logs.length > 0) {
    const match = logs[0].ghiChu.match(/Từ ([\d.]+) thành ([\d.]+)/);
    if (match) {
      const oldPrice = parseFloat(match[1]);
      const newPrice = parseFloat(match[2]);

      // SỬA Ở ĐÂY: Chỉ trả về info nếu dòng sản phẩm này đang mang mức GIÁ CŨ (giá gốc)
      if (currentPrice === oldPrice) {
        return { oldPrice, newPrice };
      }
    }
  }
  return null;
};

// ===============================================
// CÁC LOGIC CHUNG
// ===============================================
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

const getPaymentStatusLabel = () => {
  if (!invoice.value) return "";

  if (invoice.value.trangThai === 5) {
    if (daThanhToan.value === 0 && tongTienDaThu.value > 0) {
      return "Đã hoàn tiền";
    }
    if (daThanhToan.value > 0) {
      return "Chờ hoàn tiền";
    }
    return "Hủy bỏ";
  }

  return isPaid.value ? "Đã thanh toán" : "Chưa thanh toán";
};

const getPaymentBadgeClass = () => {
  if (!invoice.value) return "";

  if (invoice.value.trangThai === 5) {
    if (daThanhToan.value === 0 && tongTienDaThu.value > 0) {
      return "badge-refunded";
    }
    if (daThanhToan.value > 0) {
      return "badge-warning";
    }
    return "badge-cancelled";
  }

  return isPaid.value ? "badge-paid" : "badge-unpaid";
};

const getStatusIcon = (status: number) => {
  if (status === 5) return "/src/assets/icon/cancel-svgrepo-com.svg";
  return "/src/assets/icon/check.svg";
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
        icon: "/src/assets/icon/check-svgrepo-com.svg",
        time: invoice.value?.ngayTao,
      },
    ];
  }

  const sortedHistory = [...invoice.value.lichSuList].sort(
    (a, b) => new Date(a.thoiGian).getTime() - new Date(b.thoiGian).getTime(),
  );

  const uniqueSteps = [];
  const seenStatuses = new Set();

  for (const log of sortedHistory) {
    if (!seenStatuses.has(log.trangThai)) {
      seenStatuses.add(log.trangThai);
      uniqueSteps.push({
        status: log.trangThai,
        label: getStatusName(log.trangThai),
        icon:
          log.trangThai === 5
            ? "/src/assets/icon/cancel-svgrepo-com.svg"
            : "/src/assets/icon/check-svgrepo-com.svg",
        time: log.thoiGian,
      });
    }
  }

  return uniqueSteps;
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
  if (type === "prev") return "icon-warning";
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
    const validStatuses =
      invoice.value.loaiDon === 1 ? [0, 4] : [0, 1, 2, 3, 4];
    const currentIndex = validStatuses.indexOf(invoice.value.trangThai);

    let nextStatus = invoice.value.trangThai;

    if (actionType === "next" && currentIndex < validStatuses.length - 1) {
      nextStatus = validStatuses[currentIndex + 1];
    }
    if (actionType === "prev" && currentIndex > 0) {
      nextStatus = validStatuses[currentIndex - 1];
    }

    modal.targetStatus = nextStatus;
    const actionText = actionType === "next" ? "Chuyển sang" : "Quay lại";
    modal.title = `Xác nhận ${actionText.toLowerCase()} trạng thái`;
    modal.message = `${actionText} trạng thái: "${getStatusName(nextStatus)}"?`;
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
  } else {
    let noteToSend = modal.note;
    if (!noteToSend) {
      if (modal.type === "next")
        noteToSend = `Chuyển trạng thái sang ${getStatusName(
          modal.targetStatus,
        )}`;
      if (modal.type === "prev")
        noteToSend = `Quay lại trạng thái ${getStatusName(modal.targetStatus)}`;
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
      { headers: getAuthHeaders() },
    );
    showToast("Cập nhật thành công!", "success");
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
    await axios.post(
      `http://localhost:8080/api/hoa-don/hoan-tien`,
      {
        idHoaDon: invoice.value.id,
        soTien: daThanhToan.value,
        ghiChu: note || "Hoàn tiền do hủy đơn",
      },
      { headers: getAuthHeaders() },
    );
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

// ===============================================
// KIỂM TRA PHƯƠNG THỨC THANH TOÁN
// ===============================================
const isChuyenKhoan = computed(() => {
  if (!invoice.value) return false;
  const paymentMethod = getPaymentMethodName().toLowerCase();
  return (
    paymentMethod.includes("chuyển khoản") ||
    paymentMethod.includes("vnpay") ||
    paymentMethod.includes("bank")
  );
});

// ===============================================
// ĐIỀU KIỆN SỬA SẢN PHẨM: Tiền mặt + Chờ xác nhận + ĐÃ ĐĂNG NHẬP
// ===============================================
const canEditProducts = computed(() => {
  if (!invoice.value) return false;

  // Lấy tên phương thức thanh toán
  const paymentMethod = getPaymentMethodName().toLowerCase();

  // Kiểm tra xem có phải là tiền mặt hoặc COD không
  const isCashOrCOD =
    invoice.value.loaiDon === 1 ||
    paymentMethod.includes("khi nhận hàng");

  // Chỉ cho phép sửa nếu là trạng thái Chờ xác nhận (0) VÀ là Tiền mặt/COD
  return invoice.value.trangThai === 0 && isCashOrCOD;
});
// ===============================================
// ĐIỀU KIỆN SỬA ĐỊA CHỈ: Chờ xác nhận (Cả CK và Tiền mặt đều sửa được)
// ===============================================
// Tìm đến hàm canEditCustomerInfo và cập nhật lại:
const canEditCustomerInfo = computed(() => {
  if (!invoice.value) return false;

  const paymentMethod = getPaymentMethodName().toLowerCase();
  const isCashOrCOD =
    invoice.value.loaiDon === 1 ||
    paymentMethod.includes("khi nhận hàng");

  // Chỉ cho phép sửa địa chỉ ở trạng thái 0 và phải là Tiền mặt/COD
  return invoice.value.trangThai === 0 && isCashOrCOD;
});

onMounted(() => {
  // KIỂM TRA ĐĂNG NHẬP ĐỂ HIỆN/ẨN NÚT HỦY ĐƠN & NÚT SỬA
  const token = localStorage.getItem("token");
  if (token) {
    isLoggedIn.value = true;
  } else {
    isLoggedIn.value = false;
  }

  fetchDetail();
});
</script>

<style scoped>
/* ================== CSS CHO LAYOUT CLIENT ================== */
.app-container {
  background: #f7f9fa;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
}

.breadcrumb {
  max-width: 1536px;
  margin: 20px auto;
  padding: 0 4%;
  font-size: 14px;
  color: #666;
}

.breadcrumb span {
  cursor: pointer;
  transition: 0.2s;
}

.breadcrumb span:hover {
  color: #6b3f1e;
}

.breadcrumb .separator {
  margin: 0 10px;
  cursor: default;
}

.breadcrumb .current {
  font-weight: 600;
  color: #6b3f1e;
  cursor: default;
}

.main-layout {
  max-width: 1536px;
  margin: 0 auto 40px auto;
  padding: 0 4%;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.content-section {
  flex: 1;
  min-width: 0;
}

/* ================== CSS CHO SELECT ĐỊA CHỈ & SẢN PHẨM ================== */
.modal-lg-custom {
  max-width: 600px;
}

.form-row-custom {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.mt-3 {
  margin-top: 15px;
}

.text-primary-btn {
  color: #0284c7;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.text-primary-btn:hover {
  background: #e0f2fe;
}

.qty-control-wrapper {
  display: inline-flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.btn-qty {
  background: #f1f5f9;
  border: none;
  padding: 4px 10px;
  font-size: 16px;
  color: #334155;
  cursor: pointer;
  font-weight: bold;
}

.btn-qty:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-qty:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.qty-val {
  padding: 0 12px;
  font-weight: 600;
  color: #0f172a;
  min-width: 20px;
  text-align: center;
}

.price-warning-badge {
  color: #d97706;
  font-size: 11px;
  background: #fef3c7;
  padding: 3px 6px;
  border-radius: 4px;
  margin-top: 5px;
  font-weight: 500;
  border: 1px solid #fde68a;
  white-space: nowrap;
}

/* ================== CSS GIAO DIỆN CHÍNH (ĐỒNG BỘ THEO FILE GỐC) ================== */
.invoice-detail-wrapper {
  background: #fff;
  padding: 24px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
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
.m-0 {
  margin: 0 !important;
}

/* HEADER CŨ */
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
  background: #fef2f2;
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
  background: #fff5f0;
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
  background: #f8f9fa;
  border-color: #ccc;
  color: #333;
}

/* TIMELINE */
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

/* TABLES */
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

/* BADGES */
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

/* PRODUCT TABLE */
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

/* MODAL CHUNG */
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
.modern-input {
  width: 100%;
  padding: 10px 14px;
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  height: 42px;
  font-family: inherit;
}
.modern-input:focus {
  outline: none;
  border-color: #8b5e34;
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
  background: #1e293b;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);
}
.btn-danger-modern:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

/* LỊCH SỬ LOG MODAL */
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
  transform: rotate(90deg);
}
.modal-body-scroll {
  max-height: 55vh;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 8px;
}
.modal-body-scroll::-webkit-scrollbar {
  width: 6px;
}
.modal-body-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.modal-body-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.modal-body-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
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
.user-icon {
  font-size: 12px;
  opacity: 0.7;
}

/* CUSTOM TOAST YÊU CẦU */
.custom-toast {
  position: fixed;
  top: 30px;
  right: 30px;
  padding: 12px 20px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 99999;
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
  .main-layout {
    flex-direction: column;
  }
}

/* =========================================
   UPDATE CHÍNH CHO BẢNG SẢN PHẨM Ở CLIENT 
   ========================================= */
.product-info-cell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  width: 100%;
}

.product-img-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
  display: block;
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
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.product-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/* Giao diện thay đổi giá giống y hệt hình ảnh */
.price-changed-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.current-price-red {
  color: red;
  font-weight: bold;
  font-size: 16px;
}

.price-warning-box {
  background: #fff8eb; /* Màu nền be nhạt */
  border-radius: 6px;
  padding: 6px 10px;
  text-align: center;
  white-space: nowrap;
}

.price-warning-box .box-title {
  color: #d97706; /* Màu cam chữ */
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 2px;
}

.price-warning-box .box-compare {
  color: #d97706; /* Màu cam chữ */
  font-size: 13px;
  font-weight: 600;
}

.old-price-strike {
  text-decoration: none; /* Trong hình của bạn gạch dưới hoặc gạch ngang, tôi set gạch dưới cho giống hình, có thể đổi thành line-through */
  opacity: 0.9;
}
</style>
