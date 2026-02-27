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
            <span class="order-code">- {{ o.maHoaDon }}</span>
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
              <div class="text-right">Thành tiền</div>
              <div></div>
            </div>
            <div
              v-for="(item, index) in currentOrder.cart"
              :key="index"
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
                  <div class="meta">
                    Màu: {{ item.color }} | Size: {{ item.size || "L" }}
                  </div>
                </div>
              </div>

              <div class="price text-center">
                <del v-if="item.discountPercent > 0">{{
                  formatPrice(item.oldPrice || item.price)
                }}</del>
                <span class="sale">{{ formatPrice(item.price) }}</span>
              </div>

              <div class="qty text-center">
                <button
                  @click="decreaseQty(item)"
                  :disabled="item.quantity <= 1"
                >
                  −
                </button>
                <input type="text" readonly :value="item.quantity" />
                <button @click="increaseQty(item)">+</button>
              </div>

              <div class="total text-right">
                {{ formatPrice(item.price * item.quantity) }}
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
                    <select v-model="currentOrder.customer.province">
                      <option value="">Tỉnh/Thành phố *</option>
                      <option
                        v-for="p in provinces"
                        :key="p.code"
                        :value="p.code"
                      >
                        {{ p.name }}
                      </option>
                    </select>
                    <div v-if="customerErrors.province" class="field-error">
                      {{ customerErrors.province }}
                    </div>
                  </div>
                  <div class="form-item">
                    <select v-model="currentOrder.customer.district">
                      <option value="">Quận/Huyện *</option>
                      <option
                        v-for="d in districts"
                        :key="d.code"
                        :value="d.code"
                      >
                        {{ d.name }}
                      </option>
                    </select>
                    <div v-if="customerErrors.district" class="field-error">
                      {{ customerErrors.district }}
                    </div>
                  </div>
                </div>
                <div class="form-row mt-2">
                  <div class="form-item">
                    <select v-model="currentOrder.customer.ward">
                      <option value="">Xã/Phường *</option>
                      <option v-for="w in wards" :key="w.code" :value="w.code">
                        {{ w.name }}
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
              <div v-if="bestVoucherSuggestion" class="voucher-suggestion">
                Voucher tốt nhất:
              <div v-if="bestVoucherSuggestion" class="voucher-suggestion">
                Voucher tốt nhất:
                <strong>{{ bestVoucherSuggestion.maPgg }}</strong>
                - Giảm
                <span class="text-red">
                  {{ formatPrice(bestVoucherSuggestion.discountValue) }}
                </span>
              </div>
            </div>
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
                  Phí vận chuyển
                  <img :src="ghnLogo" class="ghn-icon" />
                </span>

                <span class="fw-600">{{ formatPrice(shippingFee) }}</span>
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
              <span>Tiền thừa</span>
              <span>{{ formatPrice(changeMoney) }}</span>
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
                      <del v-if="p.discountPercent > 0">{{
                        formatPrice(p.oldPrice)
                      }}</del>
                      <span class="sale">{{ formatPrice(p.price) }}</span>
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
            </div>

            <div v-if="paymentMethod === 'CASH'" class="cash-input-box mt-3">
              <label class="input-label">Số tiền khách đưa:</label>
              <div class="money-input-wrapper">
                <input
                  type="number"
                  v-model.number="cashInput"
                  placeholder="0"
                  class="input-money-lg"
                />
                <span class="currency-unit">₫</span>
              </div>
              <div class="quick-money mt-2">
                <button class="btn-quick-money" @click="cashInput = total">
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
          <div class="confirm-icon-wrapper">⚠️</div>
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
import InvoicePrintTemplate from "../invoice/InvoicePrintTemplate.vue";
import { Html5Qrcode } from "html5-qrcode";

const showProductPopup = ref(false);
const showCustomerPopup = ref(false);
const orders = ref([]);
const activeOrderIndex = ref(-1);
const MAX_ORDER = 10;
const MAX_ORDER = 10;

const invoiceToPrint = ref(null);

const customers = ref([]);
const showQrPopup = ref(false);
let qrScanner = null;

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

    products.value = rawData.map((p) => ({
      id: p.id,
      code: `${p.maSanPham}-${p.maChiTietSanPham}`,
      maCtsp: p.maChiTietSanPham,
      name: p.tenSanPham,
      image: Array.isArray(p.hinhAnh) ? p.hinhAnh[0] : p.hinhAnh,
      stock: p.soLuongTon,
      color: p.tenMauSac,
      size: p.tenKichCo,
      oldPrice: p.giaBan,
      price: p.giaBan,
    }));
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
  const cart = currentOrder.value.cart;
  const exist = cart.find((i) => i.id === product.id);

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
      cart.push({ ...product, quantity: 1 });
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

  // ❌ Nếu là khách lẻ tại quầy → không validate name + phone
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

  // Validate email nếu có nhập
  if (email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      customerErrors.value.email = "Email không hợp lệ";
      isValid = false;
    }
  }

  // Nếu giao hàng → bắt buộc đầy đủ
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
const validateDelivery = () => {
  const order = currentOrder.value;
  const c = order.customer;
  if (order.deliveryType === "DELIVERY") {
    let isValid = true;
    if (!c.phone) {
      customerErrors.value.phone = "Giao hàng cần số điện thoại";
      isValid = false;
    }
    if (!c.address) {
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
    return isValid;
  }
  return true;
};

const validatePayment = () => {
  const order = currentOrder.value;
  if (!order.paymentMethod) {
    showToast("Vui lòng chọn phương thức thanh toán", "error");
    return false;
  }
  if (order.paymentMethod === "CASH") {
    if (!order.paidAmount || order.paidAmount < total.value) {
      showToast("Tiền khách đưa không đủ", "error");
      return false;
    }
  }
  return true;
};

const confirmSubmitOrder = () => {
  if (!currentOrder.value?.cart.length) {
    showToast("Vui lòng chọn sản phẩm trước khi đặt hàng", "error");
    return;
  }

  if (!validateCustomer()) return;
  if (!validateDelivery()) return;

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
  if (!provinces.value.length) await fetchProvinces();
  isSettingAddress.value = true;
  currentOrder.value.customer.address = diaChi.diaChiCuThe;

  const province = provinces.value.find((p) =>
    p.name.toLowerCase().includes(diaChi.thanhPho.toLowerCase()),
  );
  if (!province) {
    showCustomerPopup.value = false;
    return;
  }
  currentOrder.value.customer.province = province.code;

  const resDistrict = await axios.get(
    `https://provinces.open-api.vn/api/p/${province.code}?depth=2`,
  );
  districts.value = resDistrict.data.districts;

  const district = districts.value.find((d) =>
    d.name.toLowerCase().includes(diaChi.quan.toLowerCase()),
  );
  if (!district) {
    showCustomerPopup.value = false;
    return;
  }
  currentOrder.value.customer.district = district.code;

  const resWard = await axios.get(
    `https://provinces.open-api.vn/api/d/${district.code}?depth=2`,
  );
  wards.value = resWard.data.wards;

  const ward = wards.value.find((w) =>
    w.name.toLowerCase().includes(diaChi.phuong.toLowerCase()),
  );
  if (!ward) {
    showCustomerPopup.value = false;
    return;
  }
  currentOrder.value.customer.ward = ward.code;

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
  showPaymentPopup.value = true;
};

// ĐÃ MERGE FIX TỪ BẢN TRƯỚC: Thêm Modal xác nhận thanh toán
const confirmPayment = async () => {
  if (!currentOrder.value) return;

  currentOrder.value.paymentMethod = paymentMethod.value;

  if (paymentMethod.value === "CASH") {
    currentOrder.value.paidAmount = cashInput.value || 0;
  } else {
    currentOrder.value.paidAmount = total.value;
  }

  if (!validatePayment()) return;

  showPaymentPopup.value = false;

  openConfirmModal(
    "Xác nhận thanh toán",
    `Bạn có chắc chắn muốn hoàn tất thanh toán cho đơn ${currentOrder.value.maHoaDon} không?`,
    async () => {
      await submitOrder();
    },
  );
};


const openQrScanner = async () => {
  showQrPopup.value = true;

  await nextTick();

  qrScanner = new Html5Qrcode("qr-reader");

  await qrScanner.start(
  await qrScanner.start(
    { facingMode: "environment" },
    {
      fps: 25,
      qrbox: { width: 300, height: 300 },
      aspectRatio: 1.777,
      disableFlip: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
    },
    async (decodedText) => {
      await handleQrResult(decodedText);

      await qrScanner.stop();
      await qrScanner.clear();
      showQrPopup.value = false;
    },
    () => {},
      fps: 25,
      qrbox: { width: 300, height: 300 },
      aspectRatio: 1.777,
      disableFlip: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
    },
    async (decodedText) => {
      await handleQrResult(decodedText);

      await qrScanner.stop();
      await qrScanner.clear();
      showQrPopup.value = false;
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
  let productCode = decodedText.trim();

  // đảm bảo đã load sản phẩm
  if (!products.value.length) {
    await fetchProducts();
  }

  const product = products.value.find(
    (p) => p.maCtsp?.toLowerCase() === productCode.toLowerCase(),
  );

  if (!product) {
    showToast("Không tìm thấy sản phẩm", "error");
    return;
  }

  addToCart(product);
  showToast(`Đã thêm ${product.name}`);
  closeQrScanner();
};

const changeMoney = computed(() => {
  if (!currentOrder.value) return 0;
  return Math.max((currentOrder.value.paidAmount || 0) - total.value, 0);
});
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const fetchProvinces = async () => {
  const res = await axios.get("https://provinces.open-api.vn/api/p/");
  provinces.value = res.data;
};

watch(
  () => currentOrder.value?.customer.province,
  async (newCode) => {
    if (!currentOrder.value || isSettingAddress.value) return;
    districts.value = [];
    wards.value = [];
    currentOrder.value.customer.district = "";
    currentOrder.value.customer.ward = "";
    if (!newCode) return;
    const res = await axios.get(
      `https://provinces.open-api.vn/api/p/${newCode}?depth=2`,
    );
    districts.value = res.data.districts;
  },
);

watch(
  () => currentOrder.value?.customer.district,
  async (newCode) => {
    if (!currentOrder.value || isSettingAddress.value) return;
    wards.value = [];
    currentOrder.value.customer.ward = "";
    if (!newCode) return;
    const res = await axios.get(
      `https://provinces.open-api.vn/api/d/${newCode}?depth=2`,
    );
    wards.value = res.data.wards;
  },
);


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

watch(
  [
    () => subTotal.value,
    () => currentOrder.value?.customer?.id,
    () => activeOrderIndex.value,
    () => vouchers.value,
  ],
  () => {
    if (!currentOrder.value) return;

    if (voucherMode.value === "MANUAL") return;

    const best = bestVoucherSuggestion.value;

    if (!best) {
      currentOrder.value.appliedVoucher = null;
      currentOrder.value.voucherCode = "";
      voucherSuccess.value = "";
      voucherError.value = "";
      return;
    }

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
  { immediate: true },
);

watch(
  () => activeOrderIndex.value,
  () => {
    voucherMode.value = "AUTO";
  },
);

const formatPrice = (v) => {
  if (v === null || v === undefined) return "0 ₫";
  return Number(v).toLocaleString("vi-VN") + " ₫";
};

const createOrder = async () => {
  if (orders.value.length >= MAX_ORDER) {
    showToast("Vui lòng chỉ thêm tối đa 10 đơn hàng", "error");
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

    await fetchProvinces();

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
  if (item.quantity >= item.stock) {
    showToast("Đã đạt số lượng tồn kho tối đa", "error");
    return;
  }

  try {
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


const increaseQty = async (item) => {
  if (item.quantity >= item.stock) {
    showToast("Đã đạt số lượng tồn kho tối đa", "error");
    return;
  }

  try {
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

// ĐÃ MERGE FIX TỪ BẢN TRƯỚC: Thay vì gọi removeOrder, đóng tab trực tiếp sau khi chốt đơn thành công
const submitOrder = async () => {
  if (!currentOrder.value) return;
  if (subTotal.value <= 0) {
    showToast("Tổng tiền hàng phải lớn hơn 0", "error");
    return;
  }

  // Chặn nếu tab bị lỗi mất ID
  if (!currentOrder.value.idHoaDon) {
    showToast(
      "Tab này bị lỗi mất ID Hóa Đơn, vui lòng tắt đi tạo lại!",
      "error",
    );
    return;
  }

  try {
    const order = currentOrder.value;
    const payload = {
      loaiDon: order.deliveryType === "DELIVERY" ? 0 : 1,
      tongTienHang: subTotal.value,
      phiShip: shippingFee.value,
      ghiChu:
        order.paymentMethod === "CASH" ? "Thanh toán tiền mặt" : "Chuyển khoản",
      maVoucher: order.voucherCode || null,
      idKhachHang: order.customer.id || null,
      sanPhamChiTiet: order.cart.map((i) => ({
        idChiTietSanPham: i.id,
        soLuong: i.quantity,
        donGia: i.price,
      })),
    };

    const token = localStorage.getItem("token");

    // 1. Gửi request thanh toán
    await axios.put(
      `http://localhost:8080/api/hoa-don/tai-quay/xac-nhan/${order.idHoaDon}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    showToast(`Thanh toán thành công ${order.maHoaDon}!`);

    // 2. Tự động hiển thị cửa sổ in hóa đơn
    try {
      // Lấy chi tiết hóa đơn hoàn chỉnh từ server
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
        // 1. Hoàn tồn kho
        if (targetOrder.idHoaDon) {
          for (const item of targetOrder.cart) {
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

          // 2. Gọi API xóa BE
          await axios.delete(
            `http://localhost:8080/api/hoa-don/xoa-don-quay/${targetOrder.idHoaDon}`,
          );
        }

        // 3. Xóa UI
        orders.value.splice(index, 1);
        showToast(`Đã xóa đơn ${targetOrder.maHoaDon}`);
      } catch (error) {
        console.error("Lỗi khi xóa đơn:", error);
        showToast("Xóa đơn thất bại!");
      }
    },
  ); // 👈 THIẾU CÁI NÀY
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

const STORAGE_KEY = "pos_orders_state";
const isReady = ref(false);
onMounted(async () => {
  isSettingAddress.value = true;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    orders.value = data.orders;
    activeOrderIndex.value = data.activeOrderIndex ?? -1;
  }
  await fetchProvinces();
  for (const order of orders.value) {
    const provinceCode = order.customer.province;
    const districtCode = order.customer.district;
    if (provinceCode) {
      const resDistrict = await axios.get(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
      );
      districts.value = resDistrict.data.districts;
    }
    if (districtCode) {
      const resWard = await axios.get(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`,
      );
      wards.value = resWard.data.wards;
    }
  }
  await fetchVouchers();
  isSettingAddress.value = false;
  isReady.value = true;
  for (const order of orders.value) {
    if (order.deliveryType === "DELIVERY" && order.customer?.district) {
      const districtObj = districts.value.find(
        (d) => d.code === order.customer.district,
      );

      if (districtObj) {
        const res = await axios.get("http://localhost:8080/api/shipping", {
          params: { district: districtObj.name },
        });

        order.shippingFee = res.data;
      }
    }
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
  const idKhach = currentOrder.value?.customer?.id ?? null;

  const res = await axios.get("http://localhost:8080/admin/voucher/pos", {
    params: { idKhachHang: idKhach },
  });

  vouchers.value = res.data;
};

watch(
  () => activeOrderIndex.value,
  async () => {
    if (!currentOrder.value) return;
    await fetchVouchers();
  },
);

watch(
  () => activeOrderIndex.value,
  async () => {
    if (!currentOrder.value) return;
    await fetchVouchers();
  },
);

watch(
  () => currentOrder.value?.customer?.id,
  async () => {
    if (!currentOrder.value) return;

    currentOrder.value.appliedVoucher = null;
    currentOrder.value.voucherCode = "";
    currentOrder.value.shippingFee = 0;
    voucherMode.value = "AUTO";

    if (!currentOrder.value) return;

    currentOrder.value.appliedVoucher = null;
    currentOrder.value.voucherCode = "";
    currentOrder.value.shippingFee = 0;
    voucherMode.value = "AUTO";

    await fetchVouchers();
  },
);

const bankQR = computed(() => {
  if (!currentOrder.value) return "";
  const amount = total.value || 0;
  const bank = "tpbank";
  const account = "00000674626";
  return `https://img.vietqr.io/image/${bank}-${account}-compact.png?amount=${amount}&addInfo=POS`;
});

const voucherMode = ref("AUTO");

// ĐÃ MERGE FIX TỪ BẠN GỬI MỚI NHẤT: Xử lý VOUCHER
const applyVoucher = () => {
  if (!currentOrder.value) return;
  voucherError.value = "";
  voucherSuccess.value = "";
  voucherMode.value = "MANUAL";
  const code = currentOrder.value.voucherCode?.trim();
  if (!code) {
    voucherError.value = "Vui lòng nhập mã giảm giá";
    return;
  }
  const found = vouchers.value.find(
    (v) => v.maPgg.toLowerCase() === code.toLowerCase(),
  );
  if (!found) {
    voucherError.value = "Mã giảm giá không tồn tại";
    currentOrder.value.appliedVoucher = null;
    return;
  }
  if (found.soLuong !== undefined && found.soLuong <= 0) {
    voucherError.value = "Mã giảm giá đã hết lượt sử dụng";
  if (found.soLuong !== undefined && found.soLuong <= 0) {
    voucherError.value = "Mã giảm giá đã hết lượt sử dụng";
    return;
  }
  if (found.trangThai === 0) {
    voucherError.value = "Mã giảm giá đã bị ngừng";
    return;
  }

  if (found.trangThai === 2) {
    voucherError.value = "Mã giảm giá chưa đến thời gian sử dụng";
    return;
  }

  if (found.trangThai === 3) {
    voucherError.value = "Mã giảm giá đã hết hạn";
    return;
  }
  if (found.dieuKienDonHang && subTotal.value < found.dieuKienDonHang) {
    voucherError.value = "Đơn hàng chưa đạt giá trị tối thiểu";
    return;
  }
  if (found.kieuApDung === "PERSONAL") {
    if (!currentOrder.value.customer?.id) {
      voucherError.value = "Voucher này chỉ áp dụng cho khách hàng cụ thể";
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

// ĐÃ MERGE FIX TỪ BẠN GỬI MỚI NHẤT: TÍNH TIỀN GIẢM GIÁ
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
const total = computed(
  () => subTotal.value - discount.value + shippingFee.value,
);

const calculateShipping = async () => {
  if (!currentOrder.value) return;
  const districtCode = currentOrder.value.customer.district;
  if (!districtCode) return;
  const districtObj = districts.value.find((d) => d.code === districtCode);
  if (!districtObj) return;
  const res = await axios.get("http://localhost:8080/api/shipping", {
    params: { district: districtObj.name },
  });
  currentOrder.value.shippingFee = res.data;
};

const toggleDelivery = async (e) => {
  const isDelivery = e.target.checked;
  if (!currentOrder.value) return;
  currentOrder.value.deliveryType = isDelivery ? "DELIVERY" : "COUNTER";
  if (isDelivery) {
    await calculateShipping();
  } else {
    currentOrder.value.shippingFee = 0;
  }
};

watch(
  () => currentOrder.value?.customer?.district,
  async () => {
    if (!currentOrder.value) return;
    if (currentOrder.value.deliveryType === "DELIVERY") {
      await calculateShipping();
    }
  },
);

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

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
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

/* Đảm bảo 2 nút Quét QR và Chọn SP cách nhau */

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
  gap: 6px;
  margin-bottom: 0;
  overflow-x: auto;
  background: #f7f7f7;
  padding: 0 12px;
  overflow: hidden;
}

.order-tab {
  background: #ececec;
  color: #333;
  padding: 10px 20px;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
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
  grid-template-columns: 2fr 120px 150px 140px 50px;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.product-row {
  display: grid; /* ✅ đổi flex thành grid */
  grid-template-columns: 2fr 120px 150px 140px 50px;
  gap: 12px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f1f1f1;
}
.product-row:last-child {
  border-bottom: none;
}

.product-cell-info {
  display: flex;
  gap: 12px;
  align-items: center;
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
  border: none;
  font-size: 14px;
  font-weight: 600;
  outline: none;
  background: transparent;
}

.total {
  font-weight: 600;
  color: red;
  white-space: nowrap;
  /* Thêm dòng này để ép chữ không bao giờ xuống dòng */
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
  /* 👈 THÊM DÒNG NÀY */
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

/* Tìm đoạn này và sửa lại */
.modal {
  background: #fff;
  border-radius: 12px;
  width: 95vw;
  max-width: 1200px;
  /* height: 85vh;  <--- XÓA DÒNG NÀY ĐI */
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.modal.large {
  width: 95vw;
  max-width: 1400px;
  height: 85vh;
  /* <--- THÊM DÒNG NÀY VÀO ĐÂY (Để form Chọn SP vẫn to) */
}

.modal.small {
  width: 90vw;
  max-width: 500px;
  /* Form thanh toán dùng modal.small sẽ tự động co ngắn lại ôm vừa nội dung */
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

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
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

/* ================= MODAL THANH TOÁN (LÀM LẠI HOÀN TOÀN) ================= */
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
  background: #fff4e5;
  color: #ff9800;
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
  flex: 0 0 100%;
  margin-top: 8px;
  font-size: 13px;
  background: #fdf6ec;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px dashed #e6a23c;
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

/* ĐÃ MERGE FIX TỪ BẠN GỬI MỚI NHẤT: Cập nhật CSS height */
.product-scroll {
  max-height: 60vh;
  overflow-y: auto;
}

.price-cell {
  text-align: center;
  white-space: nowrap;
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
  position: relative;
  padding-right: 70px;
}

.ghn-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
}
</style>
