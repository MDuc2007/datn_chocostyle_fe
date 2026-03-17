<template>
  <div class="pos-page">
    <div class="top-header">
      <h3 class="page-title">BÁN HÀNG TẠI QUẦY</h3>
      <button class="btn-create" @click="createOrder">+ Tạo đơn hàng</button>
    </div>
    <div v-if="orders.length" class="pos-card">
      <div class="order-tabs">
        <div
          v-for="(o, index) in orders"
          :key="o.id"
          class="order-tab"
          :class="{ active: index === activeOrderIndex }"
          @click="activeOrderIndex = index"
        >
          <span>
            Đơn {{ index + 1 }}
            <span class="order-code">
              - {{ o.maHoaDon }}
              <span class="sp-count">({{ o.cart.length }} SP)</span>
            </span>
          </span>
          <span class="tab-close" @click.stop="removeOrder(index)">✕</span>
        </div>
      </div>
      <div
        v-if="currentOrder"
        class="main-layout"
        :class="{ 'full-product': !currentOrder.cart.length }"
      >
        <div class="product-section">
          <div class="section-header">
            <span class="section-title">SẢN PHẨM</span>
            <div class="actions">
              <button class="btn-outline" @click="openQrScanner">
                Quét QR
              </button>
              <button class="btn-primary" @click="openProductPopup">
                + Chọn sản phẩm
              </button>
            </div>
          </div>
          <div v-if="!currentOrder.cart.length" class="empty-cart">
            <div class="empty-icon">📦</div>
            <p>Chưa có sản phẩm nào trong đơn hàng</p>
            <button class="btn-outline mt-2" @click="openProductPopup">
              Thêm sản phẩm ngay
            </button>
          </div>
          <div v-else class="product-list">
            <div class="product-header">
              <div>Sản phẩm</div>
              <div class="text-center">Đơn giá</div>
              <div class="text-center">Số lượng</div>
              <div class="th-total">Thành tiền</div>
              <div></div>
            </div>
            <div
              v-for="(item, index) in currentOrder.cart"
              :key="item.id + '-' + item.price"
              class="product-row"
            >
              <div class="product-cell-info">
                <div class="img-wrap">
                  <img :src="item.image" class="product-img" />
                  <span v-if="item.discountPercent > 0" class="sale-badge">
                    -{{ item.discountPercent }}%
                  </span>
                </div>
                <div class="product-info">
                  <div class="name" :title="item.name">{{ item.name }}</div>
                  <div class="meta">Mã: {{ item.code }}</div>
                  <div class="meta">
                    Màu: {{ item.color }} | Size: {{ item.size || "L" }}
                  </div>
                </div>
              </div>
              <div class="price-cell">
                <template v-if="item.discountPercent > 0">
                  <div class="old-price">{{ formatPrice(item.oldPrice) }}</div>
                  <div class="new-price">{{ formatPrice(item.price) }}</div>
                </template>
                <template v-else>
                  <div class="normal-price">{{ formatPrice(item.price) }}</div>
                </template>
              </div>
              <div class="qty text-center">
                <button
                  @click="decreaseQty(item)"
                  :disabled="item.quantity <= 1"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  step="1"
                  oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                  v-model.number="item.quantity"
                  @focus="item.oldQty = item.quantity"
                  @keyup.enter="checkQuantity(item)"
                  @blur="checkQuantity(item)"
                  :disabled="item.priceChanged"
                />
                <button
                  @click="increaseQty(item)"
                  :disabled="item.priceChanged"
                >
                  +
                </button>
              </div>
              <div class="product-total">
                <div>{{ formatPrice(item.price * item.quantity) }}</div>

                <div v-if="item.priceChanged" class="price-change-note">
                  Giá gốc đã thay đổi:
                  <div>
                    {{ formatPrice(item.oldPriceBeforeChange) }} →
                    {{ formatPrice(item.newPriceAfterChange) }}
                  </div>
                </div>
              </div>
              <div class="action-delete">
                <button
                  class="btn-danger"
                  @click="removeItem(index)"
                  title="Xóa"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="currentOrder.cart.length" class="right-panel">
          <div class="info-box">
            <div class="section-header column">
              <span class="section-title center"> THÔNG TIN KHÁCH HÀNG </span>
              <div
                class="customer-actions-row"
                :class="{ 'single-btn': !currentOrder.customer.id }"
              >
                <button class="btn-outline" @click="openCustomerPopup">
                  Chọn khách hàng
                </button>
                <button
                  v-if="currentOrder.customer.id"
                  class="btn-outline"
                  @click="resetToGuest"
                >
                  Khách lẻ
                </button>
              </div>
            </div>
            <div class="customer-form">
              <div class="form-row">
                <div class="form-item">
                  <input
                    v-model="currentOrder.customer.name"
                    placeholder="Tên khách hàng *"
                  />
                  <div v-if="customerErrors.name" class="field-error">
                    {{ customerErrors.name }}
                  </div>
                </div>
                <div class="form-item">
                  <input
                    v-model="currentOrder.customer.phone"
                    placeholder="Số điện thoại *"
                  />
                  <div v-if="customerErrors.phone" class="field-error">
                    {{ customerErrors.phone }}
                  </div>
                </div>
              </div>
              <div class="delivery-toggle-wrap mt-2">
                <span
                  class="toggle-label"
                  :class="{
                    'active-brown': currentOrder.deliveryType === 'DELIVERY',
                  }"
                  >Giao hàng tận nơi</span
                >
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="currentOrder.deliveryType === 'DELIVERY'"
                    @change="toggleDelivery"
                  />
                  <span class="slider"></span>
                </label>
              </div>
              <div
                v-if="currentOrder.deliveryType === 'DELIVERY'"
                class="delivery-form"
              >
                <div class="form-item mt-2">
                  <input
                    v-model="currentOrder.customer.email"
                    placeholder="Email (Tùy chọn)"
                  />
                  <div v-if="customerErrors.email" class="field-error">
                    {{ customerErrors.email }}
                  </div>
                </div>
                <div class="form-item mt-2">
                  <input
                    v-model="currentOrder.customer.address"
                    placeholder="Địa chỉ cụ thể (Số nhà, đường) *"
                  />
                  <div v-if="customerErrors.address" class="field-error">
                    {{ customerErrors.address }}
                  </div>
                </div>
                <div class="form-row mt-2">
                  <div class="form-item">
                    <select id="select-province" class="form-control">
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      <option
                        v-for="p in provinces"
                        :key="p.ProvinceID"
                        :value="p.ProvinceID"
                      >
                        {{ p.ProvinceName }}
                      </option>
                    </select>
                    <div v-if="customerErrors.province" class="field-error">
                      {{ customerErrors.province }}
                    </div>
                  </div>
                  <div class="form-item">
                    <select
                      id="select-district"
                      class="form-control"
                      :disabled="!currentOrder.customer.province"
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
                    <div v-if="customerErrors.district" class="field-error">
                      {{ customerErrors.district }}
                    </div>
                  </div>
                </div>
                <div class="form-row mt-2">
                  <div class="form-item">
                    <select
                      id="select-ward"
                      class="form-control"
                      :disabled="!currentOrder.customer.district"
                    >
                      <option value="">Chọn Phường/Xã</option>
                      <option
                        v-for="w in wards"
                        :key="w.WardCode"
                        :value="w.WardCode"
                      >
                        {{ w.WardName }}
                      </option>
                    </select>
                    <div v-if="customerErrors.ward" class="field-error">
                      {{ customerErrors.ward }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="info-box payment-box">
            <div class="section-header">
              <span class="section-title">THÔNG TIN THANH TOÁN</span>
            </div>
            <div class="voucher-row">
              <input
                v-model="currentOrder.voucherCode"
                placeholder="Mã giảm giá..."
              />
              <button class="btn-outline" @click="applyVoucher">Áp dụng</button>
              <div v-if="currentOrder?.appliedVoucher" class="voucher-success">
                <span v-if="voucherMode === 'AUTO'">
                  Áp dụng phiếu giảm giá thành công
                  {{ currentOrder.appliedVoucher.code }} - Giảm
                  {{ formatPrice(discount) }}
                </span>
                <span v-else>
                  Đã áp dụng phiếu giảm giá
                  {{ currentOrder.appliedVoucher.code }} - Giảm
                  {{ formatPrice(discount) }}
                </span>
              </div>
              <div v-if="voucherSuggestion" class="voucher-suggestion">
                Mua thêm
                <strong>{{ formatPrice(voucherSuggestion.needMore) }}</strong>
                để áp mã <strong>{{ voucherSuggestion.code }}</strong> giảm
                <span class="text-red">
                  {{ formatPrice(voucherSuggestion.discountValue) }}
                </span>
              </div>
            </div>
            <div v-if="voucherError" class="voucher-errors">
              {{ voucherError }}
            </div>
            <div class="payment-summary">
              <div class="payment-row">
                <span class="text-muted">Tổng tiền hàng</span>
                <span class="fw-600">{{ formatPrice(subTotal) }}</span>
              </div>
              <div
                class="payment-row shipping-row"
                v-if="currentOrder.deliveryType === 'DELIVERY'"
              >
                <span class="text-muted shipping-label">
                  Phí vận chuyển <img :src="ghnLogo" class="ghn-icon" />
                </span>
                <span
                  class="fw-600"
                  style="display: flex; align-items: center"
                  >{{ formatPrice(shippingFee) }}</span
                >
              </div>
              <div class="payment-row" v-if="discount > 0">
                <span class="text-muted">Giảm giá voucher</span>
                <span class="text-red fw-600">
                  - {{ formatPrice(discount) }}
                </span>
              </div>
            </div>
            <div class="payment-total-wrap">
              <div class="payment-row total">
                <span>Tổng số tiền</span>
                <span class="total-amount">{{ formatPrice(total) }}</span>
              </div>
            </div>
            <div class="payment-method-row">
              <span>Khách thanh toán</span>
              <div class="pay-action-right">
                <span class="money fw-600">
                  {{ formatPrice(currentOrder.paidAmount || 0) }}
                </span>
              </div>
            </div>
            <div
              v-if="currentOrder.paymentMethod === 'CASH'"
              class="payment-row mt-2 text-red fw-600"
            >
              <span>Tiền thừa</span> <span>{{ formatPrice(changeMoney) }}</span>
            </div>
            <button
              class="btn-submit big mt-4"
              @click="confirmSubmitOrder"
              :disabled="!currentOrder.cart.length"
            >
              XÁC NHẬN ĐẶT HÀNG
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state-global">
        <p>Vui lòng tạo đơn hàng mới để bắt đầu.</p>
      </div>
      <div class="modal-overlay" v-if="showCustomerPopup">
        <div class="modal">
          <div class="modal-header">
            <h4>CHỌN KHÁCH HÀNG</h4>
            <button class="btn-close" @click="showCustomerPopup = false">
              ✕
            </button>
          </div>
          <div class="modal-body">
            <input
              v-model="customerSearch"
              class="search-input"
              placeholder="Tìm theo tên, email, số điện thoại..."
            />
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Khách hàng</th>
                    <th>Liên hệ</th>
                    <th>Địa chỉ</th>
                    <th width="80"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(c, index) in filteredCustomers" :key="c.id">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td class="fw-600">{{ c.tenKhachHang }}</td>
                    <td>
                      <div>{{ c.soDienThoai }}</div>
                      <div class="text-muted text-sm">{{ c.email }}</div>
                    </td>
                    <td class="text-wrap">{{ c.diaChiChinh }}</td>
                    <td>
                      <button class="btn-primary" @click="selectCustomer(c)">
                        Chọn
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-overlay" v-if="showProductPopup">
        <div class="modal large">
          <div class="modal-header">
            <h4>CHỌN SẢN PHẨM</h4>
            <button class="btn-close" @click="showProductPopup = false">
              ✕
            </button>
          </div>
          <div class="modal-body">
            <div class="filter-row">
              <input
                v-model="searchText"
                placeholder=" Tìm mã, tên sản phẩm..."
              />
              <select v-model="filterColor">
                <option value="">Tất cả màu</option>
                <option v-for="c in colors" :key="c" :value="c">{{ c }}</option>
              </select>
              <select v-model="filterSize">
                <option value="">Tất cả size</option>
                <option v-for="s in sizes" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="table-responsive product-scroll">
              <table class="table">
                <thead>
                  <tr>
                    <th width="50">STT</th>
                    <th width="80">Ảnh</th>
                    <th>Sản phẩm</th>
                    <th>Phân loại</th>
                    <th>Kho</th>
                    <th>Giá bán</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, index) in filteredProducts" :key="p.id">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td>
                      <div class="img-wrap small">
                        <img :src="p.image" class="thumb" />
                        <span
                          v-if="p.discountPercent > 0"
                          class="sale-badge small"
                          >-{{ p.discountPercent }}%</span
                        >
                      </div>
                    </td>
                    <td>
                      <div class="fw-600">{{ p.name }}</div>
                      <div class="text-muted text-sm">{{ p.code }}</div>
                    </td>
                    <td>{{ p.color }} - {{ p.size }}</td>
                    <td class="text-center">
                      <span
                        class="badge-stock"
                        :class="{ 'out-of-stock': p.stock <= 0 }"
                        >{{ p.stock }}</span
                      >
                    </td>
                    <td class="price-cell">
                      <template v-if="p.discountPercent > 0">
                        <div class="old-price">
                          {{ formatPrice(p.oldPrice) }}
                        </div>
                        <div class="new-price">{{ formatPrice(p.price) }}</div>
                      </template>
                      <template v-else>
                        <div class="normal-price">
                          {{ formatPrice(p.price) }}
                        </div>
                      </template>
                    </td>
                    <td>
                      <button
                        class="btn-primary"
                        :disabled="p.stock <= 0"
                        @click="addToCart(p)"
                      >
                        Chọn
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-overlay" v-if="showPaymentPopup">
        <div class="modal small">
          <div class="modal-header">
            <h4>XÁC NHẬN THANH TOÁN</h4>
            <button class="btn-close" @click="showPaymentPopup = false">
              ✕
            </button>
          </div>
          <div class="modal-body payment-popup">
            <div class="pay-type-tabs">
              <button
                :class="{ active: paymentMethod === 'CASH' }"
                @click="paymentMethod = 'CASH'"
              >
                💵 Tiền mặt
              </button>
              <button
                :class="{ active: paymentMethod === 'BANK' }"
                @click="paymentMethod = 'BANK'"
              >
                🏦 Chuyển khoản
              </button>
              <button
                v-if="currentOrder.deliveryType === 'DELIVERY'"
                :class="{ active: paymentMethod === 'COD' }"
                @click="paymentMethod = 'COD'"
              >
                🚚 Trả sau (COD)
              </button>
            </div>
            <div v-if="paymentMethod === 'CASH'" class="cash-input-box mt-3">
              <label class="input-label">Số tiền khách đưa:</label>
              <div class="money-input-wrapper">
                <input
                  type="text"
                  :value="cashDisplay"
                  @input="handleCashInput"
                  @focus="cashDisplay = ''"
                  placeholder="0"
                  class="input-money-lg"
                />
                <span class="currency-unit">₫</span>
              </div>
              <div class="quick-money mt-2">
                <button
                  class="btn-quick-money"
                  @click="
                    () => {
                      cashInput = total;
                      cashDisplay = formatCurrencyInput(total);
                    }
                  "
                >
                  Đúng số tiền
                </button>
              </div>
            </div>
            <div v-if="paymentMethod === 'BANK'" class="bank-box mt-3">
              <img :src="bankQR" class="qr-img" />
              <div class="bank-info mt-2">
                <p class="text-muted m-0">Số tiền cần chuyển</p>
                <p class="bank-money text-red">{{ formatPrice(total) }}</p>
                <p class="m-0"><strong>TPBank</strong> - 00000674626</p>
              </div>
            </div>
            <div
              v-if="paymentMethod === 'COD'"
              class="mt-3 text-center text-muted"
            >
              <p>
                Khách hàng sẽ thanh toán
                <strong class="text-red">{{ formatPrice(total) }}</strong> khi
                nhận hàng.
              </p>
            </div>
            <button class="btn-submit big mt-4" @click="confirmPayment">
              XÁC NHẬN
            </button>
          </div>
        </div>
      </div>
    </div>
    <transition name="fade-modal">
      <div
        v-if="modal.show"
        class="modal-confirm"
        @click.self="closeConfirmModal"
      >
        <div class="confirm-box">
          <div class="confirm-icon-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12l3 3 5-5"></path>
            </svg>
          </div>
          <h3 class="confirm-title">{{ modal.title }}</h3>
          <p class="confirm-desc">{{ modal.message }}</p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="closeConfirmModal">
              Hủy bỏ
            </button>
            <button class="btn-confirm" @click="handleModalConfirm">
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </transition>
    <div class="toast-container">
      <transition name="toast-slide">
        <div v-if="toast.show" :class="['toast', toast.type]">
          {{ toast.message }}
        </div>
      </transition>
    </div>
    <Teleport to="body">
      <InvoicePrintTemplate v-if="invoiceToPrint" :invoice="invoiceToPrint" />
    </Teleport>
    <div class="modal-overlay" v-if="showQrPopup">
      <div class="modal small">
        <div class="modal-header">
          <h4>QUÉT MÃ QR SẢN PHẨM</h4>
          <button class="btn-close" @click="closeQrScanner">✕</button>
        </div>
        <div class="modal-body">
          <div id="qr-reader" style="width: 100%"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, watchEffect, nextTick } from "vue";
import axios from "axios";
import { onBeforeUnmount } from "vue";
import InvoicePrintTemplate from "../invoice/InvoicePrintTemplate.vue";
import { Html5Qrcode } from "html5-qrcode";
import ghnLogo from "../../../assets/logo/ghn.png";

const GHN_TOKEN = "31476b34-15db-11f1-9cf9-9efb715b9957";
const GHN_SHOP_ID = 6296816;
const SHOP_DISTRICT_ID = 1488;
const GHN_API_BASE = "https://online-gateway.ghn.vn/shiip/public-api";

const showProductPopup = ref(false);
const showCustomerPopup = ref(false);
const orders = ref([]);
const activeOrderIndex = ref(-1);
const MAX_ORDER = 10;
const invoiceToPrint = ref(null);
const customers = ref([]);
const showQrPopup = ref(false);
let qrScanner = null;
const STORAGE_KEY = "POS_COUNTER_ORDERS";
let autoRevalidateInterval = null;
let lastSuggestedVoucherCode = null;
let hasAutoAppliedOnce = false;

// Trạng thái địa chỉ của Giao Hàng Nhanh
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

const fetchCustomers = async () => {
  const res = await axios.get("http://localhost:8080/api/khach-hang");
  customers.value = res.data.content;
};

const openCustomerPopup = async () => {
  await fetchCustomers();
  showCustomerPopup.value = true;
};

const products = ref([]);
const promotions = ref([]);

const fetchProducts = async () => {
  try {
    const res = await axios.get(
      "http://localhost:8080/api/chi-tiet-san-pham?page=0&size=1000",
    );

    const rawData = res.data?.content || [];

    const today = new Date().toISOString().split("T")[0];

    products.value = rawData.map((p) => {
      const validPromos = promotions.value.filter(
        (promo) =>
          promo.ngayBatDau <= today &&
          (!promo.ngayKetThuc || promo.ngayKetThuc >= today) &&
          promo.chiTietSanPhamIds?.includes(p.id),
      );

      const activePromotion = validPromos.sort(
        (a, b) => b.giaTriGiam - a.giaTriGiam,
      )[0];

      let oldPrice = p.giaBan;
      let newPrice = p.giaBan;
      let discountPercent = 0;

      if (activePromotion) {
        discountPercent = activePromotion.giaTriGiam || 0;
        newPrice = oldPrice - (oldPrice * discountPercent) / 100;
      }

      return {
        id: p.id,
        maCtsp: p.maChiTietSanPham,
        code: `${p.maSanPham}-${p.maChiTietSanPham}`,
        name: p.tenSanPham,
        image: Array.isArray(p.hinhAnh) ? p.hinhAnh[0] : p.hinhAnh,
        stock: p.soLuongTon,
        color: p.tenMauSac,
        size: p.tenKichCo,
        oldPrice,
        price: Math.round(newPrice),
        discountPercent,
        trangThai: p.trangThai,
      };
    });
  } catch (err) {
    console.error("Lỗi fetchProducts:", err);
    products.value = [];
  }
};

const openProductPopup = async () => {
  await fetchPromotions();
  await fetchProducts();
  showProductPopup.value = true;
};
const currentOrder = computed(
  () => orders.value[activeOrderIndex.value] || null,
);
const decreaseQty = async (item) => {
  if (item.quantity > 1) {
    try {
      await axios.put(
        "http://localhost:8080/api/hoa-don/tam-thoi-ton-kho",
        null,
        {
          params: {
            idSpct: item.id,
            soLuongThayDoi: 1,
          },
        },
      );

      item.quantity--;
    } catch (err) {
      showToast("Lỗi cập nhật tồn kho", "error");
    }
  }
};
const addToCart = async (product) => {
  if (!currentOrder.value) {
    showToast("Vui lòng tạo đơn hàng trước", "error");
    return;
  }

  const cart = currentOrder.value.cart;

  const exist = cart.find(
    (i) => i.id === product.id && i.price === product.price && !i.priceChanged,
  );

  try {
    await axios.put(
      "http://localhost:8080/api/hoa-don/tam-thoi-ton-kho",
      null,
      {
        params: {
          idSpct: product.id,
          soLuongThayDoi: -1,
        },
      },
    );

    if (exist) {
      exist.quantity++;
    } else {
      cart.push({
        ...product,
        quantity: 1,
        priceChanged: false,

        originalStock: product.stock,
        oldQty: 1,

        originalPrice: product.oldPrice, // GIÁ GỐC
        originalDiscount: product.discountPercent, // % giảm lúc thêm
      });
    }
  } catch (err) {
    showToast(err.response?.data || "Không đủ tồn kho", "error");
  }

  showProductPopup.value = false;
};

const validateCustomer = () => {
  const order = currentOrder.value;
  const c = order.customer;

  customerErrors.value = {
    name: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
  };

  let isValid = true;

  c.name = c.name?.trim() || "";
  c.email = c.email?.trim() || "";
  c.phone = c.phone?.trim() || "";
  c.address = c.address?.trim() || "";

  const name = c.name;
  const email = c.email;
  const phone = c.phone;
  const address = c.address;

  const isGuest = !c.id && order.deliveryType === "COUNTER";

  if (!isGuest) {
    if (!name) {
      customerErrors.value.name = "Vui lòng nhập tên khách hàng";
      isValid = false;
    } else if (name.length < 2) {
      customerErrors.value.name = "Tên phải có ít nhất 2 ký tự";
      isValid = false;
    }

    if (phone) {
      if (!/^[0-9]+$/.test(phone)) {
        customerErrors.value.phone = "Số điện thoại chỉ được chứa số";
        isValid = false;
      } else if (!/^0[0-9]{8,10}$/.test(phone)) {
        customerErrors.value.phone = "Số điện thoại không hợp lệ";
        isValid = false;
      }
    }
  }

  if (email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email && !emailRegex.test(email)) {
      customerErrors.value.email = "Email không hợp lệ";
      isValid = false;
    }
  }

  if (order.deliveryType === "DELIVERY") {
    if (!phone) {
      customerErrors.value.phone = "Giao hàng bắt buộc nhập số điện thoại";
      isValid = false;
    }
    if (!address) {
      customerErrors.value.address = "Vui lòng nhập địa chỉ cụ thể";
      isValid = false;
    }
    if (!c.province) {
      customerErrors.value.province = "Vui lòng chọn tỉnh/thành";
      isValid = false;
    }
    if (!c.district) {
      customerErrors.value.district = "Vui lòng chọn quận/huyện";
      isValid = false;
    }
    if (!c.ward) {
      customerErrors.value.ward = "Vui lòng chọn xã/phường";
      isValid = false;
    }
  }

  return isValid;
};

const validatePayment = () => {
  const order = currentOrder.value;
  if (!order.paymentMethod) {
    showToast("Vui lòng chọn phương thức thanh toán", "error");
    return false;
  }
  if (order.paymentMethod === "CASH") {
    if (
      order.paidAmount === null ||
      order.paidAmount === undefined ||
      order.paidAmount < total.value
    ) {
      showToast("Tiền khách đưa không đủ", "error");
      return false;
    }
  }
  return true;
};

const confirmSubmitOrder = async () => {
  if (!currentOrder.value?.cart.length) {
    showToast("Vui lòng chọn sản phẩm trước khi đặt hàng", "error");
    return;
  }

  if (!validateCustomer()) return;

  openPaymentPopup();
};

const removeItem = async (index) => {
  const item = currentOrder.value.cart[index];

  try {
    await axios.put(
      "http://localhost:8080/api/hoa-don/tam-thoi-ton-kho",
      null,
      {
        params: {
          idSpct: item.id,
          soLuongThayDoi: item.quantity,
        },
      },
    );

    if (currentOrder.value && currentOrder.value.idHoaDon) {
      await axios.delete(
        `http://localhost:8080/api/hoa-don/${currentOrder.value.idHoaDon}/xoa-sp-khoi-gio/${item.id}`,
      );
    }

    currentOrder.value.cart.splice(index, 1);
  } catch (err) {
    showToast("Không thể xóa sản phẩm", "error");
  }
};

const fetchPromotions = async () => {
  const res = await axios.get("http://localhost:8080/api/promotions");
  promotions.value = res.data.filter((p) => p.trangThai === 1);
};

const customerErrors = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
  province: "",
  district: "",
  ward: "",
});
const voucherError = ref("");
const voucherSuccess = ref("");
const isSettingAddress = ref(false);

// ================== LOGIC CHỌN ĐỊA CHỈ & SELECT2 VỚI GHN ==================
const initSelect2 = () => {
  const $prov = window.$("#select-province");
  if ($prov.length) {
    $prov.select2({ width: "100%", placeholder: "Chọn Tỉnh/Thành phố" });
    $prov.off("select2:select").on("select2:select", async (e) => {
      const val = Number(e.params.data.id);
      if (currentOrder.value && currentOrder.value.customer.province !== val) {
        currentOrder.value.customer.province = val;
        await handleProvinceChange();
      }
    });
  }

  const $dist = window.$("#select-district");
  if ($dist.length) {
    $dist.select2({ width: "100%", placeholder: "Chọn Quận/Huyện" });
    $dist.off("select2:select").on("select2:select", async (e) => {
      const val = Number(e.params.data.id);
      if (currentOrder.value && currentOrder.value.customer.district !== val) {
        currentOrder.value.customer.district = val;
        await handleDistrictChange();
      }
    });
  }

  const $ward = window.$("#select-ward");
  if ($ward.length) {
    $ward.select2({ width: "100%", placeholder: "Chọn Phường/Xã" });
    $ward.off("select2:select").on("select2:select", async (e) => {
      const val = e.params.data.id;
      if (currentOrder.value && currentOrder.value.customer.ward !== val) {
        currentOrder.value.customer.ward = val;
        await handleWardChange();
      }
    });
  }
};

const setSelect2Value = (idSelector, value) => {
  const $el = window.$(idSelector);
  if ($el.length) {
    $el.val(String(value)).trigger("change");
  }
};

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

const getDistricts = async (provinceId) => {
  try {
    const res = await axios.get(`${GHN_API_BASE}/master-data/district`, {
      headers: { token: GHN_TOKEN },
      params: { province_id: provinceId },
    });
    districts.value = res.data.data;
    await nextTick();
    setSelect2Value(
      "#select-district",
      currentOrder.value?.customer.district || "",
    );
  } catch (error) {
    console.error("Lỗi lấy quận:", error);
  }
};

const getWards = async (districtId) => {
  try {
    const res = await axios.get(`${GHN_API_BASE}/master-data/ward`, {
      headers: { token: GHN_TOKEN },
      params: { district_id: districtId },
    });
    wards.value = res.data.data;
    await nextTick();
    setSelect2Value("#select-ward", currentOrder.value?.customer.ward || "");
  } catch (error) {
    console.error("Lỗi lấy phường:", error);
  }
};

const handleProvinceChange = async () => {
  districts.value = [];
  wards.value = [];
  if (currentOrder.value) {
    currentOrder.value.customer.district = "";
    currentOrder.value.customer.ward = "";
    currentOrder.value.shippingFee = 0;
    setSelect2Value("#select-district", "");
    setSelect2Value("#select-ward", "");

    if (currentOrder.value.customer.province) {
      await getDistricts(currentOrder.value.customer.province);
    }
  }
};

const handleDistrictChange = async () => {
  wards.value = [];
  if (currentOrder.value) {
    currentOrder.value.customer.ward = "";
    currentOrder.value.shippingFee = 0;
    setSelect2Value("#select-ward", "");

    if (currentOrder.value.customer.district) {
      await getWards(currentOrder.value.customer.district);
    }
  }
};

const handleWardChange = async () => {
  if (currentOrder.value && currentOrder.value.customer.ward) {
    await calculateShippingFee();
  }
};

const mapAddressFromText = async (cityName, districtName, wardName) => {
  if (!cityName || !districtName || !wardName || !currentOrder.value) return;
  try {
    if (provinces.value.length === 0) await getProvinces();

    const foundProvince = provinces.value.find(
      (p) =>
        p.ProvinceName.toLowerCase().trim() === cityName.toLowerCase().trim() ||
        p.NameExtension?.some(
          (ext) => ext.toLowerCase() === cityName.toLowerCase().trim(),
        ),
    );

    if (foundProvince) {
      currentOrder.value.customer.province = foundProvince.ProvinceID;
      setSelect2Value("#select-province", foundProvince.ProvinceID);
      await getDistricts(foundProvince.ProvinceID);

      const foundDistrict = districts.value.find(
        (d) =>
          d.DistrictName.toLowerCase().trim() ===
            districtName.toLowerCase().trim() ||
          d.NameExtension?.some(
            (ext) => ext.toLowerCase() === districtName.toLowerCase().trim(),
          ),
      );

      if (foundDistrict) {
        currentOrder.value.customer.district = foundDistrict.DistrictID;
        await nextTick();
        setSelect2Value("#select-district", foundDistrict.DistrictID);
        await getWards(foundDistrict.DistrictID);

        const foundWard = wards.value.find(
          (w) =>
            w.WardName.toLowerCase().trim() === wardName.toLowerCase().trim() ||
            w.NameExtension?.some(
              (ext) => ext.toLowerCase() === wardName.toLowerCase().trim(),
            ),
        );

        if (foundWard) {
          currentOrder.value.customer.ward = foundWard.WardCode;
          await nextTick();
          setSelect2Value("#select-ward", foundWard.WardCode);
          await calculateShippingFee();
        }
      }
    }
  } catch (e) {
    console.error("Lỗi map địa chỉ:", e);
  }
};

const calculateShippingFee = async () => {
  const order = currentOrder.value;
  if (!order || !order.customer.district || !order.customer.ward) return;
  try {
    const insurance = subTotal.value > 5000000 ? 5000000 : subTotal.value;

    const res = await axios.post(
      `${GHN_API_BASE}/v2/shipping-order/fee`,
      {
        service_type_id: 2,
        insurance_value: insurance,
        coupon: null,
        from_district_id: SHOP_DISTRICT_ID,
        to_district_id: order.customer.district,
        to_ward_code: order.customer.ward,
        height: 15,
        length: 15,
        width: 15,
        weight: 1000,
      },
      { headers: { token: GHN_TOKEN, ShopId: GHN_SHOP_ID } },
    );
    order.shippingFee = res.data.data.total;
  } catch (error) {
    console.error("Lỗi tính phí ship GHN:", error);
    order.shippingFee = 30000; // Fallback
  }
};

// ================== CÁC LOGIC KHÁC ==================

const selectCustomer = async (c) => {
  const res = await axios.get(`http://localhost:8080/api/khach-hang/${c.id}`);
  const kh = res.data;

  currentOrder.value.customer.id = c.id;
  currentOrder.value.customer.name = kh.tenKhachHang || "";
  currentOrder.value.customer.email = kh.email || "";
  currentOrder.value.customer.phone = kh.soDienThoai || "";

  const diaChi = kh.listDiaChi?.find((d) => d.macDinh) || kh.listDiaChi?.[0];
  if (!diaChi) {
    showCustomerPopup.value = false;
    return;
  }

  isSettingAddress.value = true;
  currentOrder.value.customer.address = diaChi.diaChiCuThe;

  // if (currentOrder.value.deliveryType === "DELIVERY") {
  //   await mapAddressFromText(diaChi.thanhPho, diaChi.quan, diaChi.phuong);
  // }

  await mapAddressFromText(diaChi.thanhPho, diaChi.quan, diaChi.phuong);
  setTimeout(() => {
    isSettingAddress.value = false;
  }, 0);

  showCustomerPopup.value = false;
};

const resetToGuest = async () => {
  if (!currentOrder.value) return;

  currentOrder.value.customer = {
    id: null,
    name: "",
    email: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    province: "",
  };

  currentOrder.value.appliedVoucher = null;
  currentOrder.value.voucherCode = "";
  currentOrder.value.shippingFee = 0;

  if (currentOrder.value.deliveryType === "DELIVERY") {
    setSelect2Value("#select-province", "");
    setSelect2Value("#select-district", "");
    setSelect2Value("#select-ward", "");
  }

  voucherMode.value = "AUTO";

  await fetchVouchers();
  showToast("Đã chuyển về khách lẻ");
};

const showPaymentPopup = ref(false);
const paymentMethod = ref("CASH");
const cashInput = ref(0);
const openPaymentPopup = () => {
  paymentMethod.value = "CASH";
  cashInput.value = total.value;
  cashDisplay.value = formatCurrencyInput(total.value);
  showPaymentPopup.value = true;
};
const revalidateVoucherBeforeSubmit = async () => {
  if (!currentOrder.value?.appliedVoucher) {
    return { valid: true };
  }

  await fetchVouchers();
  await nextTick();

  const currentCode = currentOrder.value.appliedVoucher.code;

  const found = vouchers.value.find((v) => v.maPgg === currentCode);

  if (!found) {
    return { valid: false, reason: "NOT_EXIST" };
  }

  if (
    found.trangThai !== 1 ||
    (found.dieuKienDonHang && subTotal.value < found.dieuKienDonHang)
  ) {
    return { valid: false, reason: "INVALID" };
  }

  const best = bestVoucherSuggestion.value;

  if (!best || best.maPgg !== currentCode) {
    return {
      valid: false,
      reason: "NOT_BEST",
      suggested: best || null,
    };
  }

  return { valid: true };
};

const cashDisplay = ref("");

const formatCurrencyInput = (value) => {
  if (!value) return "";
  return Number(value).toLocaleString("vi-VN");
};

const handleCashInput = (e) => {
  const raw = e.target.value.replace(/\D/g, "");
  cashInput.value = Number(raw) || 0;
  cashDisplay.value = formatCurrencyInput(raw);
};

const confirmPayment = async () => {
  if (!currentOrder.value) return;

  currentOrder.value.paymentMethod = paymentMethod.value;

  if (paymentMethod.value === "CASH") {
    currentOrder.value.paidAmount = cashInput.value || 0;
  } else if (paymentMethod.value === "BANK") {
    currentOrder.value.paidAmount = total.value;
  } else if (paymentMethod.value === "COD") {
    currentOrder.value.paidAmount = 0;
  }

  if (!validatePayment()) return;

  const voucherCheck = await revalidateVoucherBeforeSubmit();

  if (!voucherCheck.valid) {
    const suggested = voucherCheck.suggested;

    let message = "Phiếu giảm giá hiện tại không còn hợp lệ.";

    if (suggested) {
      message += `\nHệ thống đề xuất: ${suggested.maPgg} - Giảm ${formatPrice(
        suggested.discountValue,
      )}`;
    }

    openConfirmModal("Phiếu giảm giá đã thay đổi", message, async () => {
      if (suggested) {
        currentOrder.value.voucherCode = suggested.maPgg;

        const isPercent =
          suggested.loaiGiam === "PERCENT" ||
          suggested.loaiGiam === "PHAN_TRAM" ||
          suggested.loaiGiam === 0;

        currentOrder.value.appliedVoucher = {
          code: suggested.maPgg,
          percent: isPercent ? Number(suggested.giaTri) : 0,
          amount: !isPercent ? Number(suggested.giaTri) : 0,
          maxValue: suggested.giaTriToiDa,
          message: suggested.tenPgg,
        };
      } else {
        currentOrder.value.appliedVoucher = null;
        currentOrder.value.voucherCode = "";
      }

      showToast("Đã cập nhật phiếu giảm giá mới nhất");
    });

    return;
  }
  showPaymentPopup.value = false;

  openConfirmModal(
    "Xác nhận thanh toán",
    `Bạn có chắc chắn muốn hoàn tất đặt hàng/thanh toán cho đơn ${currentOrder.value.maHoaDon} không?`,
    async () => {
      await submitOrder();
    },
  );
};
let isScanning = false;

const openQrScanner = async () => {
  showQrPopup.value = true;
  await nextTick();

  isScanning = false;

  qrScanner = new Html5Qrcode("qr-reader");

  await qrScanner.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: { width: 300, height: 300 },
    },
    async (decodedText) => {
      if (isScanning) return;

      isScanning = true;

      try {
        await handleQrResult(decodedText);
      } finally {
        await qrScanner.stop();
        await qrScanner.clear();
        showQrPopup.value = false;
      }
    },
    () => {},
  );
};

const closeQrScanner = async () => {
  if (qrScanner) {
    await qrScanner.stop();
    await qrScanner.clear();
  }
  showQrPopup.value = false;
};

const handleQrResult = async (decodedText) => {
  if (!currentOrder.value) {
    showToast("Vui lòng tạo đơn hàng trước", "error");
    return;
  }

  await fetchPromotions();

  let productCode = decodedText.trim();

  await fetchProducts();

  const product = products.value.find((p) =>
    p.code?.toLowerCase().includes(productCode.toLowerCase()),
  );

  if (!product) {
    showToast("Không tìm thấy sản phẩm", "error");
    return;
  }

  await addToCart(product);
};

const changeMoney = computed(() => {
  if (!currentOrder.value) return 0;
  return Math.max((currentOrder.value.paidAmount || 0) - total.value, 0);
});

const subTotal = computed(() =>
  currentOrder.value
    ? currentOrder.value.cart.reduce((s, i) => s + i.price * i.quantity, 0)
    : 0,
);

const vouchers = ref([]);

const bestVoucherSuggestion = computed(() => {
  if (!currentOrder.value) return null;

  const valid = vouchers.value.filter((v) => {
    if (v.trangThai !== 1) return false;

    if (v.dieuKienDonHang && subTotal.value < v.dieuKienDonHang) return false;

    if (v.kieuApDung === "PERSONAL") {
      if (!currentOrder.value.customer?.id) return false;
    }

    return true;
  });

  if (!valid.length) return null;

  let best = null;
  let maxDiscount = 0;

  valid.forEach((v) => {
    let discountValue = 0;

    const isPercent =
      v.loaiGiam === "PERCENT" ||
      v.loaiGiam === "PHAN_TRAM" ||
      v.loaiGiam === 0;

    if (isPercent) {
      discountValue = (subTotal.value * v.giaTri) / 100;
    } else {
      discountValue = v.giaTri;
    }

    discountValue = Math.min(discountValue, subTotal.value);

    if (discountValue > maxDiscount) {
      maxDiscount = discountValue;
      best = { ...v, discountValue };
    }
  });

  return best;
});
const voucherSuggestion = computed(() => {
  if (!currentOrder.value) return null;

  const currentTotal = subTotal.value;

  const futureVouchers = vouchers.value.filter((v) => {
    if (v.trangThai !== 1) return false;

    if (v.kieuApDung === "PERSONAL" && !currentOrder.value.customer?.id) {
      return false;
    }

    return v.dieuKienDonHang && currentTotal < v.dieuKienDonHang;
  });

  if (!futureVouchers.length) return null;

  let best = null;
  let minNeed = Infinity;

  futureVouchers.forEach((v) => {
    const needMore = v.dieuKienDonHang - currentTotal;

    const isPercent =
      v.loaiGiam === "PERCENT" ||
      v.loaiGiam === "PHAN_TRAM" ||
      v.loaiGiam === 0;

    let discountValue = 0;

    if (isPercent) {
      discountValue = (v.dieuKienDonHang * v.giaTri) / 100;
    } else {
      discountValue = v.giaTri;
    }

    if (needMore < minNeed) {
      minNeed = needMore;
      best = {
        code: v.maPgg,
        needMore,
        discountValue,
      };
    }
  });

  return best;
});
let voucherTimeout = null;

watch(
  [() => subTotal.value, () => currentOrder.value?.customer?.id],
  async () => {
    clearTimeout(voucherTimeout);

    voucherTimeout = setTimeout(async () => {
      if (!currentOrder.value) return;
      if (voucherMode.value === "MANUAL") return;

      await fetchVouchers();

      const best = bestVoucherSuggestion.value;

      if (!best) return;

      if (!currentOrder.value.appliedVoucher) {
        currentOrder.value.voucherCode = best.maPgg;

        const isPercent =
          best.loaiGiam === "PERCENT" ||
          best.loaiGiam === "PHAN_TRAM" ||
          best.loaiGiam === 0;

        currentOrder.value.appliedVoucher = {
          code: best.maPgg,
          percent: isPercent ? Number(best.giaTri) : 0,
          amount: !isPercent ? Number(best.giaTri) : 0,
          maxValue: best.giaTriToiDa,
          message: best.tenPgg,
        };

        hasAutoAppliedOnce = true;
      }
    }, 300);
  },
  { immediate: true },
);

watch(
  () => activeOrderIndex.value,
  async (newIdx) => {
    voucherMode.value = "AUTO";
    hasAutoAppliedOnce = false;
    lastSuggestedVoucherCode = null;

    if (newIdx !== -1 && currentOrder.value) {
      await fetchVouchers();

      // Load lại Select2 nếu tab này đang chọn giao hàng
      if (currentOrder.value.deliveryType === "DELIVERY") {
        await nextTick();
        initSelect2();

        // Gọi lại data quận/huyện cho tab này nếu có province
        if (currentOrder.value.customer.province) {
          await getDistricts(currentOrder.value.customer.province);
        }
        if (currentOrder.value.customer.district) {
          await getWards(currentOrder.value.customer.district);
        }

        setSelect2Value(
          "#select-province",
          currentOrder.value.customer.province,
        );
      }
    }
  },
);

const formatPrice = (v) => {
  if (v === null || v === undefined) return "0 ₫";
  return Number(v).toLocaleString("vi-VN") + " ₫";
};

const createOrder = async () => {
  if (orders.value.length >= MAX_ORDER) {
    showToast("Vui lòng chỉ thêm tối đa 10 đơn hàng", "error");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:8080/api/hoa-don/tai-quay/tao-moi",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const draftOrder = res.data;

    const newOrder = {
      idHoaDon: draftOrder.id,
      maHoaDon: draftOrder.maHoaDon,
      id: Date.now(),
      cart: [],
      customer: {
        id: null,
        name: "",
        email: "",
        phone: "",
        address: "",
        ward: "",
        district: "",
        province: "",
      },
      paidAmount: 0,
      paymentMethod: "CASH",
      voucherCode: "",
      appliedVoucher: null,
      deliveryType: "COUNTER",
      shippingFee: 0,
    };

    orders.value.push(newOrder);
    activeOrderIndex.value = orders.value.length - 1;

    showToast(`Đã tạo tab cho ${draftOrder.maHoaDon}`);
  } catch (error) {
    showToast(error.response?.data || "Lỗi tạo tab", "error");
  }
};
const increaseQty = async (item) => {
  try {
    if (item.priceChanged) {
      showToast(
        "Sản phẩm đã thay đổi giá. Vui lòng thêm lại với giá mới.",
        "error",
      );
      return;
    }

    await fetchProducts();

    const latest = products.value.find((p) => p.id === item.id);

    if (!latest) {
      showToast("Sản phẩm không còn tồn tại", "error");
      return;
    }

    if (
      latest.oldPrice !== item.originalPrice ||
      latest.discountPercent !== item.originalDiscount
    ) {
      item.priceChanged = true;

      item.oldDiscountPrice =
        item.originalPrice - (item.originalPrice * item.originalDiscount) / 100;

      item.newDiscountPrice =
        latest.oldPrice - (latest.oldPrice * latest.discountPercent) / 100;

      item.oldPriceBeforeChange = Math.round(item.oldDiscountPrice);
      item.newPriceAfterChange = Math.round(item.newDiscountPrice);

      await axios.put(
        "http://localhost:8080/api/hoa-don/tam-thoi-ton-kho",
        null,
        {
          params: {
            idSpct: latest.id,
            soLuongThayDoi: -1,
          },
        },
      );

      const existNew = currentOrder.value.cart.find(
        (i) =>
          i.id === latest.id && i.price === latest.price && !i.priceChanged,
      );

      if (existNew) {
        existNew.quantity++;
      } else {
        currentOrder.value.cart.push({
          ...latest,
          quantity: 1,
          priceChanged: false,
        });
      }

      showToast("Sản phẩm đã đổi giá. Đã thêm thành dòng mới.");
      return;
    }
    if (latest.stock <= 0) {
      showToast("Đã đạt số lượng tồn kho tối đa", "error");
      return;
    }

    await axios.put(
      "http://localhost:8080/api/hoa-don/tam-thoi-ton-kho",
      null,
      {
        params: {
          idSpct: item.id,
          soLuongThayDoi: -1,
        },
      },
    );

    item.quantity++;
  } catch (err) {
    showToast("Không đủ tồn kho", "error");
  }
};

const submitOrder = async () => {
  if (!currentOrder.value) return;
  if (subTotal.value <= 0) {
    showToast("Tổng tiền hàng phải lớn hơn 0", "error");
    return;
  }

  if (!currentOrder.value.idHoaDon) {
    showToast(
      "Tab này bị lỗi mất ID Hóa Đơn, vui lòng tắt đi tạo lại!",
      "error",
    );
    return;
  }

  try {
    const order = currentOrder.value;

    // Xây dựng địa chỉ gửi cho GHN -> Name
    const provinceName =
      provinces.value.find((p) => p.ProvinceID === order.customer.province)
        ?.ProvinceName || "";
    const districtName =
      districts.value.find((d) => d.DistrictID === order.customer.district)
        ?.DistrictName || "";
    const wardName =
      wards.value.find((w) => w.WardCode === order.customer.ward)?.WardName ||
      "";

    const fullAddress =
      order.deliveryType === "DELIVERY"
        ? [order.customer.address, wardName, districtName, provinceName]
            .filter(Boolean)
            .join(", ")
        : "";
    const payload = {
      loaiDon: order.deliveryType === "DELIVERY" ? 3 : 1,
      tongTienHang: subTotal.value,
      phiShip: currentOrder.value.shippingFee || 0,

      ghiChu:
        order.paymentMethod === "CASH"
          ? "Thanh toán tiền mặt"
          : order.paymentMethod === "BANK"
            ? "Chuyển khoản"
            : "Thanh toán khi nhận hàng (COD)",

      maVoucher: order.voucherCode || null,
      idKhachHang: order.customer.id || null,

      tenNguoiNhan: order.customer.name || null,
      emailNguoiNhan: order.customer.email || null,
      sdtNguoiNhan: order.customer.phone || null,

      diaChiGiaoHang: fullAddress,

      sanPhamChiTiet: order.cart.map((i) => ({
        idChiTietSanPham: i.id,
        soLuong: i.quantity,
        donGia: i.price,
      })),
    };

    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:8080/api/hoa-don/tai-quay/xac-nhan/${order.idHoaDon}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    showToast(`Đặt hàng/Thanh toán thành công ${order.maHoaDon}!`);
    // ==========================================
    // 👉 THÊM ĐOẠN NÀY ĐỂ BÁO CHO APP FLUTTER BIẾT
    // ==========================================
    try {
      await axios.post(
        `http://localhost:8080/api/hoa-don/sync-realtime/${order.idHoaDon}`,
        {
          maHoaDon: order.maHoaDon,
          isPaid: true, // 👈 Cờ báo hiệu Đơn hàng đã chốt xong
          sanPhamList: [],
          tongTienHang: 0,
          giamGia: 0,
          tongThanhToan: 0,
        },
      );
    } catch (syncErr) {
      console.error("Lỗi báo thanh toán sang App:", syncErr);
    }
    // ==========================================

    try {
      const resInvoice = await axios.get(
        `http://localhost:8080/api/hoa-don/${order.idHoaDon}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      invoiceToPrint.value = resInvoice.data;
      await nextTick();
      setTimeout(() => {
        window.print();
        invoiceToPrint.value = null;
      }, 500);
    } catch (printError) {
      console.error("Lỗi lấy dữ liệu in hóa đơn:", printError);
      showToast("Thanh toán xong nhưng có lỗi khi in hóa đơn!", "error");
    }
    const currentIndex = activeOrderIndex.value;
    orders.value.splice(currentIndex, 1);
    if (!orders.value.length) {
      activeOrderIndex.value = -1;
    } else {
      activeOrderIndex.value = Math.max(0, currentIndex - 1);
    }
  } catch (e) {
    showToast(e.response?.data || "Lỗi thanh toán", "error");
    console.error(e);
  }
};

const removeOrder = (index) => {
  const targetOrder = orders.value[index];

  openConfirmModal(
    "Xác nhận xóa hóa đơn",
    `Bạn có chắc chắn muốn tắt và hủy đơn ${targetOrder.maHoaDon} không?`,
    async () => {
      try {
        if (targetOrder.idHoaDon) {
          for (const item of targetOrder.cart) {
            if (!item.priceChanged) {
              await axios.put(
                "http://localhost:8080/api/hoa-don/tam-thoi-ton-kho",
                null,
                {
                  params: {
                    idSpct: item.id,
                    soLuongThayDoi: item.quantity,
                  },
                },
              );
            }
          }

          await axios.delete(
            `http://localhost:8080/api/hoa-don/xoa-don-quay/${targetOrder.idHoaDon}`,
          );
        }

        orders.value.splice(index, 1);

        if (!orders.value.length) {
          activeOrderIndex.value = -1;
        } else if (activeOrderIndex.value >= index) {
          activeOrderIndex.value = Math.max(0, activeOrderIndex.value - 1);
        }

        showToast(`Đã xóa đơn ${targetOrder.maHoaDon}`);
      } catch (error) {
        console.error("Lỗi khi xóa đơn:", error);
        showToast("Xóa đơn thất bại!", "error");
      }
    },
  );
};

const searchText = ref("");
const filterColor = ref("");
const filterSize = ref("");
const colors = computed(() => [
  ...new Set(products.value.map((p) => p.color).filter(Boolean)),
]);
const sizes = computed(() => [
  ...new Set(products.value.map((p) => p.size).filter(Boolean)),
]);
const filteredProducts = computed(() => {
  let list = products.value;
  if (searchText.value) {
    const s = searchText.value.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s),
    );
  }
  if (filterColor.value)
    list = list.filter((p) => p.color === filterColor.value);
  if (filterSize.value) list = list.filter((p) => p.size === filterSize.value);
  return list;
});

const customerSearch = ref("");
const filteredCustomers = computed(() => {
  if (!customerSearch.value) return customers.value;
  const s = customerSearch.value.toLowerCase();
  return customers.value.filter(
    (c) =>
      (c.tenKhachHang || "").toLowerCase().includes(s) ||
      (c.email || "").toLowerCase().includes(s) ||
      (c.soDienThoai || "").includes(s),
  );
});

const isReady = ref(false);

const validateOrdersWithServer = async () => {
  const token = localStorage.getItem("token");
  const validOrders = [];

  for (const order of orders.value) {
    try {
      await axios.get(`http://localhost:8080/api/hoa-don/${order.idHoaDon}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      validOrders.push(order);
    } catch (err) {
      console.warn("Order không còn tồn tại:", order.maHoaDon);
    }
  }

  orders.value = validOrders;

  if (!orders.value.length) {
    activeOrderIndex.value = -1;
  } else if (activeOrderIndex.value >= orders.value.length) {
    activeOrderIndex.value = orders.value.length - 1;
  }
};

const saveOrdersToStorage = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      orders: orders.value,
      activeOrderIndex: activeOrderIndex.value,
    }),
  );
};

watch(
  [orders, activeOrderIndex],
  () => {
    saveOrdersToStorage();
  },
  { deep: true },
);

onMounted(async () => {
  isSettingAddress.value = true;
  await getProvinces(); // Gọi Tỉnh/Thành từ GHN thay vì OpenAPI

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    orders.value = data.orders;
    activeOrderIndex.value = data.activeOrderIndex ?? -1;
  }

  await validateOrdersWithServer();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      orders: orders.value,
      activeOrderIndex: activeOrderIndex.value,
    }),
  );

  // Restore danh sách quận/phường từ GHN cho tab hiện tại nếu đang là DELIVERY
  if (currentOrder.value && currentOrder.value.deliveryType === "DELIVERY") {
    if (currentOrder.value.customer.province) {
      await getDistricts(currentOrder.value.customer.province);
    }
    if (currentOrder.value.customer.district) {
      await getWards(currentOrder.value.customer.district);
    }
    await nextTick();
    initSelect2();
  }

  await fetchVouchers();

  isSettingAddress.value = false;
  isReady.value = true;

  autoRevalidateInterval = setInterval(async () => {
    if (!currentOrder.value) return;
    if (!currentOrder.value.cart.length) return;

    await autoRevalidateSystem();
  }, 1000);
});

onBeforeUnmount(async () => {
  if (qrScanner) {
    await qrScanner.stop();
    await qrScanner.clear();
  }

  if (autoRevalidateInterval) {
    clearInterval(autoRevalidateInterval);
  }
});

watchEffect(() => {
  if (!isReady.value) return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      orders: orders.value,
      activeOrderIndex: activeOrderIndex.value,
    }),
  );
});

const fetchVouchers = async () => {
  if (!currentOrder.value) {
    vouchers.value = [];
    return;
  }

  try {
    const idKhach = currentOrder.value.customer?.id ?? null;

    const res = await axios.get("http://localhost:8080/admin/voucher/pos", {
      params: { idKhachHang: idKhach },
    });

    vouchers.value = res.data;
  } catch (error) {
    console.error("Lỗi fetchVouchers:", error);
    vouchers.value = [];
  }
};

const bankQR = computed(() => {
  if (!currentOrder.value) return "";
  const amount = total.value || 0;
  const bank = "tpbank";
  const account = "00000674626";
  return `https://img.vietqr.io/image/${bank}-${account}-compact.png?amount=${amount}&addInfo=POS`;
});

const voucherMode = ref("AUTO");

const applyVoucher = () => {
  if (!currentOrder.value) return;
  voucherError.value = "";
  voucherSuccess.value = "";
  voucherMode.value = "MANUAL";
  const code = currentOrder.value.voucherCode?.trim();
  if (!code) {
    voucherError.value = "Vui lòng nhập mã giảm giá";
    voucherMode.value = "AUTO";
    return;
  }
  const found = vouchers.value.find(
    (v) => v.maPgg.toLowerCase() === code.toLowerCase(),
  );
  if (!found) {
    voucherError.value = "Mã giảm giá không tồn tại";
    currentOrder.value.appliedVoucher = null;
    voucherMode.value = "AUTO";
    return;
  }
  if (found.soLuong !== undefined && found.soLuong <= 0) {
    voucherError.value = "Mã giảm giá đã hết lượt sử dụng";
    voucherMode.value = "AUTO";
    return;
  }
  if (found.trangThai === 0) {
    voucherError.value = "Mã giảm giá đã bị ngừng";
    voucherMode.value = "AUTO";
    return;
  }

  if (found.trangThai === 2) {
    voucherError.value = "Mã giảm giá chưa đến thời gian sử dụng";
    voucherMode.value = "AUTO";
    return;
  }

  if (found.trangThai === 3) {
    voucherError.value = "Mã giảm giá đã hết hạn";
    voucherMode.value = "AUTO";
    return;
  }
  if (found.dieuKienDonHang && subTotal.value < found.dieuKienDonHang) {
    voucherError.value = "Đơn hàng chưa đạt giá trị tối thiểu";
    voucherMode.value = "AUTO";
    return;
  }
  if (found.kieuApDung === "PERSONAL") {
    if (!currentOrder.value.customer?.id) {
      voucherError.value = "Voucher này chỉ áp dụng cho khách hàng cụ thể";
      voucherMode.value = "AUTO";
      return;
    }
  }

  let percent = 0;
  let amount = 0;

  if (
    found.loaiGiam === "PERCENT" ||
    found.loaiGiam === "PHAN_TRAM" ||
    found.loaiGiam === 0
  ) {
    percent = Number(found.giaTri);
  } else {
    amount = Number(found.giaTri);
  }

  currentOrder.value.appliedVoucher = {
    code: found.maPgg,
    percent,
    amount,
    maxValue: found.giaTriToiDa,
    message: found.tenPgg,
  };

  if (
    found.loaiGiam === "PERCENT" ||
    found.loaiGiam === "PHAN_TRAM" ||
    found.loaiGiam === 0
  ) {
    voucherSuccess.value = `Áp dụng thành công - Giảm ${found.giaTri}%`;
  } else {
    voucherSuccess.value = `Áp dụng thành công - Giảm ${formatPrice(found.giaTri)}`;
  }
};

const discount = computed(() => {
  const v = currentOrder.value?.appliedVoucher;
  if (!v) return 0;

  if (v.percent > 0) {
    let discountValue = (subTotal.value * v.percent) / 100;

    if (v.maxValue) {
      discountValue = Math.min(discountValue, v.maxValue);
    }

    return Math.min(discountValue, subTotal.value);
  }

  if (v.amount > 0) {
    return Math.min(v.amount, subTotal.value);
  }

  return 0;
});

const shippingFee = computed(() => {
  if (!currentOrder.value) return 0;
  return currentOrder.value.deliveryType === "DELIVERY"
    ? currentOrder.value.shippingFee
    : 0;
});

const total = computed(() =>
  Math.max(subTotal.value - discount.value + shippingFee.value, 0),
);

const updateQuantity = async (item, oldQty) => {
  const diff = item.quantity - oldQty;

  if (diff === 0) return;

  try {
    await axios.put(
      "http://localhost:8080/api/hoa-don/tam-thoi-ton-kho",
      null,
      {
        params: {
          idSpct: item.id,
          soLuongThayDoi: diff > 0 ? -diff : Math.abs(diff),
        },
      },
    );
  } catch (err) {
    showToast("Không thể cập nhật số lượng", "error");
  }
};

const checkQuantity = async (item) => {
  const oldQty = item.oldQty ?? item.quantity;
  const maxQty = item.originalStock;
  if (!item.quantity || item.quantity < 1) {
    showToast("Số lượng tối thiểu là 1", "error");
    item.quantity = 1;
  }
  if (item.quantity > maxQty) {
    item.quantity = maxQty;
    showToast(`Chỉ còn ${maxQty} sản phẩm`, "error");
  }

  await updateQuantity(item, oldQty);

  item.oldQty = item.quantity;
};

const revalidateCartPrice = async () => {
  if (!currentOrder.value) return true;

  try {
    await fetchPromotions();
    await fetchProducts();

    let hasChanged = false;

    currentOrder.value.cart.forEach((item) => {
      const latest = products.value.find((p) => p.id === item.id);

      if (!latest || latest.stock <= 0 || latest.stock < item.quantity) {
        hasChanged = true;
        return;
      }

      if (latest.trangThai !== 1) {
        hasChanged = true;
        return;
      }
      if (
        latest.oldPrice !== item.originalPrice ||
        latest.discountPercent !== item.originalDiscount
      ) {
        item.priceChanged = true;

        item.oldDiscountPrice =
          item.originalPrice -
          (item.originalPrice * item.originalDiscount) / 100;

        item.newDiscountPrice =
          latest.oldPrice - (latest.oldPrice * latest.discountPercent) / 100;

        item.oldPriceBeforeChange = Math.round(item.oldDiscountPrice);
        item.newPriceAfterChange = Math.round(item.newDiscountPrice);

        hasChanged = true;
      }
    });

    return !hasChanged;
  } catch (err) {
    console.error("Lỗi revalidateCartPrice:", err);
    return false;
  }
};

const autoRevalidateSystem = async () => {
  if (!currentOrder.value) return;

  try {
    await revalidateCartPrice();
    await fetchVouchers();

    const currentVoucher = currentOrder.value.appliedVoucher;

    // kiểm tra voucher hiện tại trước
    if (currentVoucher) {
      const found = vouchers.value.find((v) => v.maPgg === currentVoucher.code);

      if (
        !found ||
        found.trangThai !== 1 ||
        (found.dieuKienDonHang && subTotal.value < found.dieuKienDonHang)
      ) {
        openConfirmModal(
          "Voucher không còn hợp lệ",
          "Phiếu giảm giá không còn đủ điều kiện áp dụng.",
          () => {
            currentOrder.value.appliedVoucher = null;
            currentOrder.value.voucherCode = "";
          },
        );
        return;
      }
    }

    const best = bestVoucherSuggestion.value;

    if (!best) return;

    // nếu chưa áp dụng voucher nào
    if (!currentVoucher) {
      openConfirmModal(
        "Gợi ý phiếu giảm giá",
        `Có mã ${best.maPgg} giúp giảm ${formatPrice(best.discountValue)}. Áp dụng ngay?`,
        () => {
          currentOrder.value.voucherCode = best.maPgg;

          const isPercent =
            best.loaiGiam === "PERCENT" ||
            best.loaiGiam === "PHAN_TRAM" ||
            best.loaiGiam === 0;

          currentOrder.value.appliedVoucher = {
            code: best.maPgg,
            percent: isPercent ? Number(best.giaTri) : 0,
            amount: !isPercent ? Number(best.giaTri) : 0,
            maxValue: best.giaTriToiDa,
            message: best.tenPgg,
          };
        },
      );

      return;
    }

    // nếu có voucher tốt hơn
    if (
      hasAutoAppliedOnce &&
      currentVoucher.code !== best.maPgg &&
      lastSuggestedVoucherCode !== best.maPgg
    ) {
      lastSuggestedVoucherCode = best.maPgg;

      openConfirmModal(
        "Có voucher tốt hơn",
        `Hệ thống phát hiện mã ${best.maPgg} giúp giảm ${formatPrice(best.discountValue)}. Áp dụng ngay?`,
        () => {
          currentOrder.value.voucherCode = best.maPgg;

          const isPercent =
            best.loaiGiam === "PERCENT" ||
            best.loaiGiam === "PHAN_TRAM" ||
            best.loaiGiam === 0;

          currentOrder.value.appliedVoucher = {
            code: best.maPgg,
            percent: isPercent ? Number(best.giaTri) : 0,
            amount: !isPercent ? Number(best.giaTri) : 0,
            maxValue: best.giaTriToiDa,
            message: best.tenPgg,
          };

          showToast("Đã áp dụng voucher tốt nhất");
        },
      );
    }
  } catch (err) {
    console.error("Auto revalidate error:", err);
  }
};

const toggleDelivery = async (e) => {
  const isDelivery = e.target.checked;
  if (!currentOrder.value) return;

  currentOrder.value.deliveryType = isDelivery ? "DELIVERY" : "COUNTER";

  await fetchVouchers();

  if (isDelivery) {
    await nextTick();
    initSelect2();
    if (currentOrder.value.customer.province) {
      setSelect2Value("#select-province", currentOrder.value.customer.province);
      await getDistricts(currentOrder.value.customer.province);

      if (currentOrder.value.customer.district) {
        await getWards(currentOrder.value.customer.district);
      }
    }
  } else {
    currentOrder.value.shippingFee = 0;
    // currentOrder.value.customer.address = "";
    // currentOrder.value.customer.province = "";
    // currentOrder.value.customer.district = "";
    // currentOrder.value.customer.ward = "";
  }

  const currentVoucher = currentOrder.value.appliedVoucher;

  if (currentVoucher) {
    const found = vouchers.value.find((v) => v.maPgg === currentVoucher.code);

    if (!found) {
      currentOrder.value.appliedVoucher = null;
      currentOrder.value.voucherCode = "";
      voucherError.value = "Phiếu giảm giá không còn hợp lệ";
    }
  }
  await autoRevalidateSystem();
};

const modal = ref({ show: false, title: "", message: "", onConfirm: null });
const openConfirmModal = (title, message, cb) => {
  modal.value = { show: true, title, message, onConfirm: cb };
};
const closeConfirmModal = () => {
  modal.value.show = false;
};
const handleModalConfirm = () => {
  modal.value.onConfirm?.();
  closeConfirmModal();
};

const toast = ref({ show: false, message: "", type: "success" });
const showToast = (msg, type = "success") => {
  toast.value.message = msg;
  toast.value.type = type;
  toast.value.show = true;
  setTimeout(() => {
    toast.value.show = false;
  }, 2500);
};
// ==========================================
// ĐỒNG BỘ REAL-TIME SANG APP FLUTTER
// ==========================================
// ==========================================
// ĐỒNG BỘ REAL-TIME SANG APP FLUTTER
// ==========================================
const dongBoSangMobile = async () => {
  // 1. Kiểm tra xem có đơn hàng nào đang được mở không
  const order = currentOrder.value;
  if (!order || !order.idHoaDon) return;

  // 2. Đóng gói dữ liệu khớp 100% với các biến Flutter đang chờ
  const payload = {
    maHoaDon: order.maHoaDon, 
    
    // 👉 ĐÃ THÊM 3 DÒNG NÀY ĐỂ TRUYỀN THÔNG TIN KHÁCH & VOUCHER SANG APP:
    tenKhachHang: order.customer?.name || 'Khách lẻ',
    soDienThoai: order.customer?.phone || '',
    tenVoucher: order.appliedVoucher ? order.appliedVoucher.code : '',

    sanPhamList: order.cart.map(item => ({
      tenSanPham: item.name || 'Sản phẩm', 
      soLuong: item.quantity,
      donGia: item.price || 0,
      hinhAnh: item.image || '',
      maSanPham: item.code || '',
      mauSac: item.color || '',
      kichCo: item.size || ''
    })),
    tongTienHang: subTotal.value || 0,
    giamGia: discount.value || 0,
    tongThanhToan: total.value || 0,
  };

  try {
    // 3. Bắn sang trạm tiếp sóng Spring Boot
    await axios.post(
      `http://localhost:8080/api/hoa-don/sync-realtime/${order.idHoaDon}`,
      payload,
    );
  } catch (error) {
    console.error("Lỗi đồng bộ màn hình khách hàng:", error);
  }
};
watch(
  [
    () => currentOrder.value?.cart,     // Theo dõi khi thêm/xóa/sửa sản phẩm
    () => activeOrderIndex.value,       // Theo dõi khi nhân viên bấm sang Tab đơn khác
    () => total.value,                // Theo dõi khi tổng tiền thay đổi (ví dụ do voucher tự động áp dụng)
    () => currentOrder.value?.customer                   
  ],
  () => {
    dongBoSangMobile();
  },
  { deep: true }, // Bắt buộc phải có để Vue quét sâu vào bên trong mảng cart
);
</script>

<style scoped>
/* ================= GLOBAL & THEME (Nâu / Be) ================= */
.pos-page {
  background: #f7f7f7;
  min-height: 100vh;
  padding: 16px;
  font-family: "Inter", system-ui, sans-serif;
  color: #333;
}

/* Ẩn nút tăng giảm trên Chrome, Edge, Safari */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Ẩn trên Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.th-total {
  text-align: center;
  padding-right: 10px;
}

.text-muted {
  color: #666;
}

.text-red {
  color: #d32f2f;
}

.fw-600 {
  font-weight: 600;
}

.mt-2 {
  margin-top: 8px;
}

.mt-3 {
  margin-top: 16px;
}

.mt-4 {
  margin-top: 24px;
}

.m-0 {
  margin: 0;
}

/* ================= HEADER ================= */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 10px;
  padding: 14px 18px;
  border: 1px solid #e5e5e5;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

/* ================= BUTTONS ================= */
.btn-create {
  background: linear-gradient(90deg, #c89b6d, #6b3f23);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-create:hover {
  opacity: 0.9;
}

.btn-primary {
  background: linear-gradient(90deg, #c89b6d, #6b3f23);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  border: 1px solid #c89b6d;
  color: #6b3f23;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: 0.2s;
}

.btn-outline:hover {
  background: #c89b6d;
  color: #fff;
}

.btn-danger {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 14px;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-submit.big {
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  background: linear-gradient(90deg, #c89b6d, #6b3f23);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 6px -1px rgba(107, 63, 35, 0.3);
}

.btn-submit.big:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-submit.big:disabled {
  background: #d8c6b5;
  cursor: not-allowed;
  box-shadow: none;
  color: #fff;
}

.actions {
  display: flex;
  gap: 12px;
}

/* ================= TABS ================= */
.pos-card {
  background: transparent;
}

.order-code {
  font-size: 12px;
  color: #888;
  margin-left: 4px;
}

.order-tabs {
  display: flex;
  flex-wrap: wrap-reverse;
  gap: 6px;
  background: #f7f7f7;
  padding: 0 12px 1px;
}

.order-tab {
  flex: 0 0 calc((100% - 24px) / 5);
  box-sizing: border-box;
}

.order-tab:nth-child(n + 6) {
  margin-bottom: -18px;
  z-index: 1;
}

.order-tab {
  position: relative;
  z-index: 2;

  background: #ececec;
  color: #333;
  padding: 10px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;

  border: 1px solid #dcdcdc;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
}

.order-tab:hover {
  background: #ddd;
}

.order-tab.active {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-bottom: 1px solid #fff;
  font-weight: 600;
  margin-bottom: -1px;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.05);
  z-index: 3;
}

.tab-close {
  opacity: 0.5;
  cursor: pointer;
  font-size: 12px;
}

.tab-close:hover {
  opacity: 1;
}

/* ================= LAYOUT CHÍNH (65/35) ================= */
.main-layout {
  display: grid;
  grid-template-columns: minmax(0, 6.5fr) minmax(0, 3.5fr);
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 10px;
}

.main-layout.full-product {
  grid-template-columns: 1fr;
}

.main-layout.full-product .product-section {
  grid-column: 1 / -1;
}

/* BOX CHUNG */
.product-section,
.info-box {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #eee;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

/* RIGHT PANEL (Sticky) */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 16px;
}

/* ================= CỘT TRÁI: GIỎ HÀNG ================= */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #eee;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

/* Empty State */
.empty-cart {
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-global {
  text-align: center;
  padding: 60px;
  background: #fff;
  border-radius: 12px;
  color: #666;
  margin-top: 16px;
}

/* Product List */
.product-header {
  text-align: center;
  display: grid;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.product-row {
  display: grid;
  gap: 12px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f1f1f1;
}

.product-header,
.product-row {
  grid-template-columns: minmax(0, 2fr) 150px 130px 200px 50px;
}

.product-header > div:first-child,
.product-row > div:first-child {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.product-cell-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-width: 0;
}

.product-row:last-child {
  border-bottom: none;
}

.img-wrap {
  position: relative;
  flex-shrink: 0;
}

.product-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
}

.sale-badge {
  position: absolute;
  top: -6px;
  left: -6px;
  background: #e53935;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.product-info .name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-info .meta {
  font-size: 12px;
  color: #777;
  white-space: nowrap;
}

.price del {
  display: block;
  font-size: 12px;
  color: #999;
}

.price .sale {
  font-weight: 600;
  color: red;
  font-size: 14px;
}

.qty {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  width: max-content;
  margin: 0 auto;
  gap: 4px;
}

.qty button {
  background: #fff;
  border: 1px solid #c49a6c;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty button:hover {
  background: #f7f2ee;
}

.qty button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ddd;
}

.qty input {
  width: 45px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  outline: none;
  background: transparent;
}

.product-total {
  font-weight: 600;
  color: red;
  white-space: nowrap;

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

/* ================= CỘT PHẢI: KHÁCH & THANH TOÁN ================= */
.customer-form .form-item {
  margin-bottom: 12px;
  width: 100%;
}

.customer-form .form-row {
  display: flex;
  gap: 12px;
}

.customer-form .form-row .form-item {
  flex: 1;
}

input,
select {
  width: 100%;
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #e0d6cc;
  font-size: 13px;
  background: #fafafa;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;
}

input:focus,
select:focus {
  border-color: #c89b6d;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(200, 155, 109, 0.15);
}

.field-error {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 4px;
}

/* Toggle Giao hàng */
.delivery-toggle-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #faf7f4;
  padding: 10px 14px;
  border-radius: 10px;
}

.toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: 0.2s;
}

.toggle-label.active-brown {
  font-weight: 600;
  color: #6b3f23;
}

.switch {
  position: relative;
  width: 44px;
  height: 24px;
}

.switch input {
  display: none;
}

.slider {
  position: absolute;
  inset: 0;
  background: #ddd;
  border-radius: 24px;
  cursor: pointer;
  transition: 0.3s;
}

.slider::before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
}

.switch input:checked + .slider {
  background: linear-gradient(90deg, #c89b6d, #6b3f23);
}

.switch input:checked + .slider::before {
  transform: translateX(20px);
}

/* Payment Box */
.payment-box {
  background: linear-gradient(180deg, #ffffff, #fdf9f6);
  border: 1px solid #eee;
}

.voucher-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.voucher-row input {
  flex: 1;
}

.voucher-success {
  background: #e9f7ef;
  color: #2e7d32;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 16px;
}

.voucher-errors {
  background: #ffc3c3;
  color: #d32f2f;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 16px;
}

.payment-summary {
  padding-bottom: 12px;
  border-bottom: 1px dashed #ddd;
  margin-bottom: 12px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.payment-row:last-child {
  margin-bottom: 0;
}

.payment-total-wrap {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
}

.payment-row.total {
  font-size: 16px;
  font-weight: 600;
  align-items: center;
}

.total-amount {
  font-size: 20px;
  color: #d32f2f;
  font-weight: 700;
}

.payment-method-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.pay-action-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-pay-icon {
  width: 34px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #c49a6c;
  background: #fff;
  cursor: pointer;
  transition: 0.2s;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-pay-icon:hover {
  background: #c89b6d;
  color: #fff;
}

/* ================= MODAL & POPUP CHUNG ================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.modal {
  background: #fff;
  border-radius: 12px;
  width: 95%;
  max-width: 1100px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.modal.large {
  max-width: 1300px;
}

.modal.small {
  max-width: 500px;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5d6c8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #faf6f3;
  border-radius: 12px 12px 0 0;
}

.modal-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #7b4a2f;
}

.btn-close {
  background: #c8a27a;
  border: none;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: 0.2s;
}

.btn-close:hover {
  background: #b08b63;
}

/* Filter & Table Modal */
.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th {
  padding: 12px;
  background: #faf6f3;
  color: #6b4226;
  font-weight: 600;
  border-bottom: 1px solid #e3d5c8;
  white-space: nowrap;
}

.table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  height: 70px;
}

.table th,
.table td {
  text-align: center;
  vertical-align: middle;
}

.table tr:hover {
  background: #fff7f1;
}

.badge-stock {
  padding: 2px 8px;
  border-radius: 12px;
  background: #e9f7ef;
  color: #2e7d32;
  font-size: 12px;
  font-weight: 600;
}

.badge-stock.out-of-stock {
  background: #ffc3c3;
  color: #d32f2f;
}

/* ================= MODAL THANH TOÁN ================= */
.custom-payment-modal {
  padding-bottom: 10px;
}

.pay-type-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.pay-type-tabs button {
  flex: 1;
  padding: 12px;
  border: 1px solid #c49a6c;
  border-radius: 8px;
  background: #fff;
  font-weight: 600;
  color: #6b3f23;
  cursor: pointer;
  transition: 0.2s;
}

.pay-type-tabs button.active {
  background: linear-gradient(90deg, #c89b6d, #6b3f23);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 10px rgba(107, 63, 35, 0.2);
}

.input-label {
  font-size: 14px;
  color: #6b3f23;
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}

.money-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-money-lg {
  height: 50px;
  font-size: 20px;
  font-weight: 700;
  text-align: right;
  padding-right: 40px;
  border-radius: 8px;
  border: 2px solid #e0d6cc;
  color: #333;
}

.input-money-lg:focus {
  border-color: #c89b6d;
  box-shadow: 0 0 0 3px rgba(200, 155, 109, 0.15);
}

.currency-unit {
  position: absolute;
  right: 15px;
  font-size: 18px;
  color: #999;
  font-weight: 600;
  pointer-events: none;
}

.btn-quick-money {
  background: #f7f2ee;
  color: #6b3f23;
  border: 1px solid #e5d6c8;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-quick-money:hover {
  background: #e5d6c8;
}

.bank-box {
  text-align: center;
}

.qr-img {
  width: 220px;
  height: 220px;
  border: 1px solid #e5d6c8;
  border-radius: 12px;
  display: block;
  margin: 0 auto;
  padding: 10px;
  background: #fff;
}

.bank-info {
  text-align: center;
  margin-top: 15px;
}

.bank-money {
  font-size: 22px;
  font-weight: 700;
  margin: 5px 0;
  color: #d32f2f;
}

/* ================= MODAL CONFIRM & TOAST ================= */
.modal-confirm {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
}

.confirm-box {
  background: #fff;
  padding: 30px;
  border-radius: 20px;
  width: 400px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e8f5e9;
  color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto 15px;
  line-height: 1;
}

.confirm-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #63391f;
}

.confirm-desc {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 20px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 42px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: #63391f;
  color: white;
}

.btn-confirm:hover {
  background: #4e2c17;
  box-shadow: 0 4px 10px rgba(78, 44, 23, 0.3);
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  min-width: 300px;
  padding: 16px 24px;
  border-radius: 8px;
  background: #dcfce7;
  color: #166534;
  font-size: 15px;
  font-weight: 500;
  border-left: 6px solid #22c55e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast.error {
  background: #fee2e2;
  color: #991b1b;
  border-left-color: #ef4444;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.voucher-suggestion {
  width: 100%;
  margin-top: 8px;
  font-size: 13px;
  text-align: center;
  background: #fff8dc;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px dashed #e6a23c;
  word-break: break-word;
}

.btn-link {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  margin-left: 8px;
}

.img-wrap.small {
  width: 50px;
  height: 50px;
  position: relative;
}

.img-wrap.small .thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}

.product-scroll {
  max-height: 60vh;
  overflow-y: auto;
}

.price-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: 1.3;
  min-height: 60px;
}

.price-cell del {
  display: inline-block;
  color: #999;
  margin-right: 6px;
  font-size: 12px;
}

.price-cell .sale {
  color: #e53935;
  font-weight: 600;
  font-size: 14px;
}

.section-header.column {
  display: flex;
  flex-direction: column !important;
  align-items: stretch;
  gap: 12px;
}

.section-title.center {
  text-align: center;
  width: 100%;
  font-weight: 600;
}

.customer-actions-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.customer-actions-row button {
  flex: 1;
  height: 40px;
}

.customer-actions-row.single-btn {
  justify-content: center;
}

.customer-actions-row.single-btn button {
  flex: none;
  width: 100%;
}

.info-box {
  max-width: 100%;
}

.shipping-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ghn-icon {
  width: 40px;
  height: auto;
  object-fit: contain;
}

@media (max-width: 1400px) {
  .product-header,
  .product-row {
    grid-template-columns: minmax(0, 1.8fr) 100px 120px 110px 45px;
  }
}

@media (max-width: 1200px) {
  .product-header,
  .product-row {
    grid-template-columns: minmax(0, 1.5fr) 90px 110px 100px 40px;
    font-size: 12px;
  }
}

@media (max-width: 1024px) {
  .product-header,
  .product-row {
    grid-template-columns: minmax(0, 1.2fr) 80px 100px 90px 35px;
  }
}

.sp-count {
  margin-left: 40px;
}

.price-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  height: 100%;
}

.old-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.new-price {
  font-size: 15px;
  font-weight: 700;
  color: #e53935;
}

.normal-price {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

@media (max-width: 1024px) {
  .modal {
    width: 98%;
    max-height: 95vh;
  }
}

@media (max-width: 768px) {
  .modal {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }

  .modal.large,
  .modal.small {
    max-width: 100%;
  }
}

.pos-page {
  zoom: 0.9;
}

/* ================== SELECT2 CUSTOM STYLES (GHN) ================== */
:deep(.select2-container) {
  width: 100% !important;
}

:deep(.select2-container .select2-selection--single) {
  height: 40px;
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid #e0d6cc;
  border-radius: 10px;
  background-color: #fafafa;
  display: flex;
  align-items: center;
}

:deep(
  .select2-container--default
    .select2-selection--single
    .select2-selection__arrow
) {
  height: 100%;
  right: 15px;
}

:deep(
  .select2-container--default
    .select2-selection--single
    .select2-selection__rendered
) {
  padding-left: 0;
  color: #333;
  line-height: normal;
}

:deep(
  .select2-container--default
    .select2-selection--single
    .select2-selection__placeholder
) {
  color: #6c757d;
}

:deep(.select2-dropdown) {
  border: 1px solid #c89b6d;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

:deep(.select2-search__field) {
  border-radius: 6px !important;
  padding: 8px !important;
  border: 1px solid #ddd !important;
}

:deep(.select2-results__option--highlighted) {
  background-color: #c89b6d !important;
  color: white !important;
}

/* Trạng thái focus */
:deep(
  .select2-container--default.select2-container--open .select2-selection--single
) {
  border-color: #c89b6d;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(200, 155, 109, 0.15);
}

/* Trạng thái disabled */
:deep(
  .select2-container--default.select2-container--disabled
    .select2-selection--single
) {
  background-color: #e9ecef;
  border-color: #e9ecef;
  cursor: not-allowed;
}

.price-change-note {
  font-size: 12px;
  color: #d97706;
  background: #fff7ed;
  padding: 4px 8px;
  border-radius: 6px;
  line-height: 1.4;
  text-align: center;
  white-space: normal;
}
</style>
