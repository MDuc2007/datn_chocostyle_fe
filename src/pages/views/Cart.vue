<template>
  <div class="app-container">
    <Header></Header>

    <main class="cart-page">
      <div class="cart-container">
        <div class="breadcrumb">
          <span @click="$router.push('/')">Trang chủ</span>
          <span class="separator">/</span>
          <span class="current">Giỏ hàng</span>
        </div>

        <div class="cart-header-title">
          <h2 class="cart-title">Giỏ hàng của bạn</h2>
        </div>

        <div v-if="cartItems.length === 0" class="empty-cart fade-in">
          <div class="empty-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" class="empty-svg">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
          <button class="btn-continue" @click="$router.push('/')">
            Mua sắm ngay
          </button>
        </div>

        <div v-else class="cart-content fade-in">
          <div class="cart-left">
            <div class="cart-actions-top">
              <label class="select-all-label">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="custom-checkbox" />
                <span>Chọn tất cả</span>
              </label>
              <button class="btn-text-danger" @click="confirmClearCart">
                Xóa tất cả
              </button>
            </div>

            <div class="cart-list-body">
              <transition-group name="list" tag="div">
                <div v-for="(item, index) in cartItems" :key="item.variantId + '-' + index" class="cart-item">
                  <div class="item-checkbox">
                    <input type="checkbox" v-model="item.checked" class="custom-checkbox" />
                  </div>

                  <div class="item-info">
                    <div class="img-wrapper" @click="goToDetail(item.productId)">
                      <img :src="item.hinhAnh" :alt="item.tenSp" class="item-img" @error="handleImageError" />
                      <span v-if="item.discountPercent > 0" class="discount-badge">-{{ item.discountPercent }}%</span>
                    </div>
                    <div class="item-details">
                      <h3 class="item-name" @click="goToDetail(item.productId)">
                        {{ item.tenSp }}
                      </h3>
                      <div class="item-variant">
                        <span>{{ item.kichCo }}</span>
                        <span class="divider">•</span>
                        <span class="color-text">{{
                          item.mauSac?.tenMauSac || "Mặc định"
                        }}</span>
                      </div>
                      <div class="item-price-mobile">
                        <span class="current-price">{{
                          formatPrice(getDiscountedPrice(item))
                        }}</span>
                        <span v-if="item.discountPercent > 0" class="old-price">{{ formatPrice(item.giaBan) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="item-price desktop-only">
                    <span class="current-price">{{
                      formatPrice(getDiscountedPrice(item))
                    }}</span>
                    <div v-if="item.discountPercent > 0" class="old-price">
                      {{ formatPrice(item.giaBan) }}
                    </div>
                  </div>

                  <div class="item-qty">
                    <div class="qty-control">
                      <button @click="decreaseQty(index)" :disabled="item.soLuong <= 1" class="qty-btn">
                        −
                      </button>
                      <input type="number" v-model.number="item.soLuong" @change="validateQty(index)"
                        class="qty-input" />
                      <button @click="increaseQty(index)" :disabled="item.soLuong >= item.tonKho" class="qty-btn">
                        +
                      </button>
                    </div>
                    <span v-if="item.soLuong >= item.tonKho" class="stock-warning">Đạt giới hạn kho</span>
                  </div>

                  <div class="item-total desktop-only">
                    {{ formatPrice(getDiscountedPrice(item) * item.soLuong) }}
                  </div>

                  <div class="item-action">
                    <button class="btn-remove" @click="openConfirmModal(index)" title="Xóa">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon-trash">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </transition-group>
            </div>
          </div>

          <div class="cart-summary">
            <h3 class="summary-title">Thông tin đơn hàng</h3>

            <div class="summary-row">
              <span class="text-muted">Tổng tiền ({{ selectedItemsCount }} sản phẩm)</span>
              <span class="summary-val">{{
                formatPrice(totalOriginalPriceSelected)
              }}</span>
            </div>

            <div class="summary-row" v-if="totalDiscountSelected > 0">
              <span class="text-muted">Giảm giá</span>
              <span class="summary-val text-success">- {{ formatPrice(totalDiscountSelected) }}</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row total-row">
              <span>Tạm tính</span>
              <span class="final-price">{{
                formatPrice(totalPriceSelected)
              }}</span>
            </div>
            <p class="vat-note">
              Phí vận chuyển sẽ được tính ở trang thanh toán
            </p>

            <button class="btn-checkout" @click="proceedToCheckout" :disabled="selectedItemsCount === 0">
              Thanh toán ngay
            </button>
            <button class="btn-continue-shopping" @click="$router.push('/')">
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer></Footer>

    <transition name="fade-modal">
      <div v-if="modal.show" class="modal-confirm" @click.self="closeModalConfirm">
        <div class="confirm-box">
          <div class="confirm-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="8" x2="16" y2="16"></line>
              <line x1="16" y1="8" x2="8" y2="16"></line>
            </svg>
          </div>

          <h3 class="confirm-title">{{ modal.title }}</h3>
          <p class="confirm-desc">{{ modal.message }}</p>

          <div class="confirm-actions">
            <button class="btn-cancel hover-effect" @click="closeModalConfirm">
              Hủy
            </button>
            <button class="btn-confirm hover-effect" @click="handleModalConfirm">
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";

const router = useRouter();
const cartItems = ref([]);
const promotions = ref([]);
const toast = ref({ show: false, message: "", type: "success" });

const modal = ref({
  show: false,
  title: "",
  message: "",
  type: "", // remove-one | clear-all
  index: null,
});

const fetchPromotions = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/promotions");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    promotions.value = res.data.filter((p) => {
      if (Number(p.trangThai) !== 1) return false;
      const start = new Date(p.ngayBatDau);
      const end = new Date(p.ngayKetThuc);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return today >= start && today <= end;
    });

    applyPromotionsToCart();
  } catch (err) {
    console.error("Lỗi tải khuyến mãi:", err);
  }
};

const applyPromotionsToCart = () => {
  cartItems.value.forEach((item) => {
    const validPromos = promotions.value.filter((p) =>
      p.chiTietSanPhamIds?.some((id) => Number(id) === Number(item.variantId)),
    );

    if (validPromos.length > 0) {
      const bestPromo = validPromos.reduce((max, cur) =>
        Number(cur.giaTriGiam) > Number(max.giaTriGiam) ? cur : max,
      );
      item.discountPercent = Number(bestPromo.giaTriGiam);
    } else {
      item.discountPercent = 0;
    }
  });
};

const getDiscountedPrice = (item) => {
  if (!item.discountPercent) return item.giaBan;
  return Math.round(item.giaBan * (1 - item.discountPercent / 100));
};

onMounted(async () => {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cartItems.value = JSON.parse(savedCart).map((item) => ({
      ...item,
      checked: false,
      discountPercent: 0,
    }));
  }
  await fetchPromotions();
});

const formatPrice = (v) => {
  if (v == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN").format(v) + " ₫";
};

const handleImageError = (event) => {
  event.target.src = "/src/assets/logo/no-image-placeholder.png";
};

const isAllSelected = computed(() => {
  return (
    cartItems.value.length > 0 && cartItems.value.every((item) => item.checked)
  );
});

const toggleSelectAll = (e) => {
  const isChecked = e.target.checked;
  cartItems.value.forEach((item) => (item.checked = isChecked));
};

const selectedItemsCount = computed(() => {
  return cartItems.value
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.soLuong, 0);
});

const totalPriceSelected = computed(() => {
  return cartItems.value
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + getDiscountedPrice(item) * item.soLuong, 0);
});

const totalOriginalPriceSelected = computed(() => {
  return cartItems.value
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.giaBan * item.soLuong, 0);
});

const totalDiscountSelected = computed(() => {
  return totalOriginalPriceSelected.value - totalPriceSelected.value;
});

const totalItems = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.soLuong, 0);
});

const saveCart = () => {
  const cartToSave = cartItems.value.map(
    ({ discountPercent, checked, ...rest }) => rest,
  );
  localStorage.setItem("cart", JSON.stringify(cartToSave));
  window.dispatchEvent(new Event("cartUpdated"));
};

const increaseQty = (index) => {
  if (cartItems.value[index].soLuong < cartItems.value[index].tonKho) {
    cartItems.value[index].soLuong++;
    saveCart();
  } else {
    showToast("Đã đạt giới hạn kho!", "warning");
  }
};

const decreaseQty = (index) => {
  if (cartItems.value[index].soLuong > 1) {
    cartItems.value[index].soLuong--;
    saveCart();
  }
};

const validateQty = (index) => {
  const item = cartItems.value[index];
  if (item.soLuong < 1 || isNaN(item.soLuong) || item.soLuong === "") {
    item.soLuong = 1;
  } else if (item.soLuong > item.tonKho) {
    item.soLuong = item.tonKho;
    showToast(`Chỉ còn ${item.tonKho} sản phẩm!`, "error");
  }
  saveCart();
};

const openConfirmModal = (index) => {
  modal.value = {
    show: true,
    title: "Xóa sản phẩm",
    message: "Sản phẩm này sẽ bị xóa khỏi giỏ hàng của bạn.",
    type: "remove-one",
    index,
  };
};

const confirmClearCart = () => {
  modal.value = {
    show: true,
    title: "Xóa toàn bộ giỏ hàng",
    message: "Bạn có chắc chắn muốn xóa toàn bộ sản phẩm?",
    type: "clear-all",
    index: null,
  };
};

const closeModalConfirm = () => {
  modal.value.show = false;
};

const handleModalConfirm = () => {
  if (modal.value.type === "clear-all") {
    cartItems.value = [];
    showToast("Đã xóa toàn bộ giỏ hàng.");
  }

  if (modal.value.type === "remove-one") {
    cartItems.value.splice(modal.value.index, 1);
    showToast("Đã xóa sản phẩm khỏi giỏ hàng.");
  }

  saveCart();
  closeModalConfirm();
};

const goToDetail = (productId) => {
  router.push(`/home/product/${productId}`);
};

// 👉 SỬA LẠI: Cho phép qua thẳng Payment, không chặn đăng nhập nữa
const proceedToCheckout = () => {
  const selectedItems = cartItems.value.filter((item) => item.checked);

  if (selectedItems.length === 0) {
    showToast("Vui lòng chọn sản phẩm để thanh toán.", "warning");
    return;
  }

  // Đẩy thẳng qua trang thanh toán
  localStorage.setItem("checkout_items", JSON.stringify(selectedItems));
  router.push({ path: "/payment", query: { fromCart: "true" } });
};

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 3000);
};
</script>

<style scoped>
/* Reset & Typography */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fafafa;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  color: #6b3f23;
}

.cart-page {
  padding: 40px 20px;
  flex-grow: 1;
}

.cart-container {
  max-width: 1140px;
  margin: 0 auto;
}

/* Breadcrumb */
.breadcrumb {
  margin-bottom: 24px;
  font-size: 13px;
  color: #6b7280;
}

.breadcrumb span {
  cursor: pointer;
}

.breadcrumb span:hover {
  color: #6b3f23;
}

.breadcrumb .separator {
  margin: 0 8px;
  cursor: default;
}

.breadcrumb .current {
  color: #6b3f23;
  font-weight: 500;
}

/* Headers */
.cart-header-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 24px;
}

.cart-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

/* Inputs & Buttons */
.custom-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #6b3f23;
  border-radius: 4px;
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.empty-icon-wrapper {
  margin-bottom: 16px;
  color: #9ca3af;
}

.empty-svg {
  width: 48px;
  height: 48px;
}

.empty-cart p {
  font-size: 16px;
  color: #4b5563;
  margin-bottom: 24px;
}

.btn-continue {
  background: #111827;
  color: #fff;
  border: none;
  padding: 12px 32px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-continue:hover {
  background: #374151;
}

/* Cart Layout */
.cart-content {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
  align-items: start;
}

/* Actions Top */
.cart-actions-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-text-danger {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 14px;
  cursor: pointer;
}

.btn-text-danger:hover {
  text-decoration: underline;
}

/* List Items */
.cart-list-body {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
  gap: 24px;
}

.cart-item:last-child {
  border-bottom: none;
}

/* Item details */
.item-info {
  display: flex;
  flex: 2;
  gap: 16px;
}

.img-wrapper {
  width: 80px;
  height: 100px;
  border-radius: 4px;
  background: #f9fafb;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-bottom-right-radius: 4px;
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 8px 0;
  cursor: pointer;
  color: #111827;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.item-name:hover {
  color: #4b5563;
}

.item-variant {
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
}

.divider {
  margin: 0 8px;
  color: #d1d5db;
}

.item-price-mobile {
  display: none;
}

/* Pricing & Qty */
.item-price {
  flex: 1;
  text-align: right;
}

.current-price {
  font-weight: 600;
  font-size: 15px;
  color: #111827;
}

.old-price {
  font-size: 12px;
  text-decoration: line-through;
  color: #9ca3af;
  margin-top: 4px;
}

.item-qty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qty-control {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  height: 32px;
  width: 100px;
}

.qty-btn {
  width: 30px;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #4b5563;
}

.qty-btn:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.qty-input {
  flex: 1;
  text-align: center;
  border: none;
  font-size: 13px;
  font-weight: 500;
  padding: 0;
  width: 100%;
}

.qty-input:focus {
  outline: none;
}

.stock-warning {
  font-size: 11px;
  color: #ef4444;
  margin-top: 6px;
}

.item-total {
  flex: 1;
  text-align: right;
  font-weight: 600;
  font-size: 15px;
  color: #111827;
}

.item-action {
  width: 32px;
  text-align: right;
}

.btn-remove {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
}

.btn-remove:hover {
  color: #ef4444;
}

.icon-trash {
  width: 20px;
  height: 20px;
}

/* Summary Card */
.cart-summary {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  position: sticky;
  top: 24px;
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
}

.text-muted {
  color: #4b5563;
}

.summary-val {
  font-weight: 500;
}

.text-success {
  color: #10b981;
}

.summary-divider {
  border-top: 1px dashed #e5e7eb;
  margin: 20px 0;
}

.total-row {
  align-items: center;
  margin-bottom: 8px;
}

.total-row span:first-child {
  font-weight: 500;
  font-size: 15px;
}

.final-price {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.vat-note {
  font-size: 12px;
  color: #6b7280;
  text-align: right;
  margin-bottom: 24px;
}

.btn-checkout {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 12px;
}

.btn-checkout:hover:not(:disabled) {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
}

.btn-checkout:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.btn-continue-shopping {
  width: 100%;
  padding: 14px;
  background: #fff;
  color: #111827;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-continue-shopping:hover {
  background: #f9fafb;
}

/* Animations & Modals */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s;
}

.list-leave-active {
  position: absolute;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-confirm {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.confirm-box {
  background: #fff;
  padding: 30px;
  border-radius: 20px;
  width: 400px;
  text-align: center;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: zoomIn 0.3s ease-out;
}

.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f8d7da;
  color: #e93c3c;
  margin: 0 auto 15px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.confirm-icon-wrapper svg {
  display: block;
  margin: 0;
}

.confirm-title {
  color: #63391f;
  margin-bottom: 10px;
  font-size: 20px;
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

.btn-confirm {
  background: #63391f;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  flex: 1;
  height: 42px;
  transition: 0.2s;
}

.btn-confirm:hover {
  background: #4e2c17;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  flex: 1;
  height: 42px;
  transition: 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

/* Toast */
.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 10000;
  background: #111827;
  color: #fff;
  padding: 16px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.toast-notification.warning {
  background: #f59e0b;
  color: #fff;
}

/* Responsive */
@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 640px) {
  .desktop-only {
    display: none !important;
  }

  .item-price-mobile {
    display: block;
    margin-top: 8px;
  }

  .cart-item {
    flex-wrap: wrap;
    position: relative;
    gap: 16px;
  }

  .item-info {
    flex: 100%;
  }

  .item-qty {
    flex: 1;
    align-items: flex-start;
    padding-left: 38px;
  }

  .item-action {
    position: absolute;
    top: 24px;
    right: 24px;
  }
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>