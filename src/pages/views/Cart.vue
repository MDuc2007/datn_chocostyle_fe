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
          <h2 class="cart-title styled-title">GIỎ HÀNG CỦA BẠN</h2>
          <span class="cart-count" v-if="cartItems.length > 0">
            ({{ totalItems }} sản phẩm)
          </span>
        </div>

        <div v-if="cartItems.length === 0" class="empty-cart fade-in">
          <div class="empty-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="empty-svg">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
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

            <div class="cart-items">
              <div class="cart-list-header">
                <div class="col-product">Sản phẩm</div>
                <div class="col-price">Đơn giá</div>
                <div class="col-qty">Số lượng</div>
                <div class="col-total">Thành tiền</div>
                <div class="col-action"></div>
              </div>

              <transition-group name="list" tag="div" class="cart-list-body">
                <div v-for="(item, index) in cartItems" :key="item.variantId + '-' + index" class="cart-item">
                  
                  <div class="col-product item-info">
                    <div class="img-wrapper" @click="goToDetail(item.productId)">
                      <img :src="item.hinhAnh" :alt="item.tenSp" class="item-img" @error="handleImageError" />
                      <span v-if="item.discountPercent > 0" class="discount-badge">-{{ item.discountPercent }}%</span>
                    </div>
                    <div class="item-details">
                      <h3 class="item-name" @click="goToDetail(item.productId)">
                        {{ item.tenSp }}
                      </h3>
                      <div class="item-variant">
                        <span class="variant-label">Màu: </span>
                        <span class="color-circle" :style="{ backgroundColor: item.mauSac?.rgb }" :title="item.mauSac?.tenMau"></span>
                        <span class="variant-divider">|</span>
                        <span class="variant-label">Size: </span>
                        <span class="size-text">{{ item.kichCo }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="col-price item-price">
                    {{ formatPrice(item.giaBan) }}
                  </div>

                  <div class="item-qty">
                    <div class="qty-control">
                      <button @click="decreaseQty(index)" :disabled="item.soLuong <= 1" class="qty-btn">-</button>
                      <input type="number" v-model.number="item.soLuong" @change="validateQty(index)" class="qty-input" />
                      <button @click="increaseQty(index)" :disabled="item.soLuong >= item.tonKho" class="qty-btn">+</button>
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
            <h3 class="summary-title">TỔNG ĐƠN HÀNG</h3>
            <div class="summary-row">
              <span class="text-muted">Tổng số lượng:</span>
              <span class="summary-val font-weight-bold">{{ totalItems }} sản phẩm</span>
            </div>

            <div class="summary-row" v-if="totalDiscountSelected > 0">
              <span class="text-muted">Giảm giá</span>
              <span class="summary-val text-success">- {{ formatPrice(totalDiscountSelected) }}</span>
            </div>

            <div class="summary-divider"></div>
            <div class="summary-row total-row">
              <span>Thành tiền:</span>
              <span class="summary-val final-price">{{ formatPrice(totalPrice) }}</span>
            </div>
            <p class="vat-note">(Chưa bao gồm phí vận chuyển)</p>
            <button class="btn-checkout hover-effect" @click="proceedToCheckout">
              TIẾN HÀNH THANH TOÁN <i class="fa fa-chevron-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer></Footer>

    <transition name="fade-modal">
      <div v-if="modal.show" class="modal-confirm" @click.self="closeModalConfirm">
        <div class="confirm-box">
          <div class="confirm-icon-wrapper danger-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-svg">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h3 class="confirm-title">{{ confirmModal.isClearAll ? 'Xóa toàn bộ giỏ hàng' : 'Xóa sản phẩm' }}</h3>
          <p class="confirm-desc">
            {{ confirmModal.isClearAll ? 'Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng không?' : 'Bạn có chắc chắn muốn bỏ sản phẩm này khỏi giỏ hàng không?' }}
          </p>
          <div class="confirm-actions">
            <button class="btn-cancel hover-effect" @click="closeConfirmModal">Hủy</button>
            <button class="btn-confirm btn-danger hover-effect" @click="executeRemove">Xóa ngay</button>
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
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";

const router = useRouter();
const cartItems = ref([]);
const toast = ref({ show: false, message: "", type: "success" });

// State cho Modal Xác nhận xóa
const confirmModal = ref({
  show: false,
  indexToRemove: null,
  isClearAll: false
});

// Khởi tạo lấy dữ liệu từ localStorage
onMounted(() => {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cartItems.value = JSON.parse(savedCart);
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

// Tính tổng tiền & Số lượng
const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.giaBan * item.soLuong), 0);
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
  router.push("/payment");
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
  background-color: #f8f9fa;
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
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}
.breadcrumb span { cursor: pointer; transition: 0.2s; }
.breadcrumb span:hover { color: #6b3f1e; }
.breadcrumb .separator { margin: 0 10px; cursor: default; }
.breadcrumb .current { font-weight: 600; color: #6b3f1e; cursor: default; }

.cart-header-title {
  display: flex;
  align-items: baseline;
  gap: 15px;
  margin-bottom: 30px;
  border-bottom: 2px solid #6b3f1e;
  padding-bottom: 10px;
  width: fit-content;
}

.styled-title {
  font-size: 28px;
  font-weight: bold;
  color: #6b3f1e;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  letter-spacing: -0.5px;
}

.cart-count {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}

.empty-icon-wrapper {
  width: 100px;
  height: 100px;
  background: #fdf8f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}
.empty-svg {
  width: 48px;
  height: 48px;
}

.empty-cart p {
  font-size: 18px;
  color: #555;
  margin-bottom: 30px;
  font-weight: 500;
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
.btn-continue:hover { background: #4a2a17; transform: translateY(-3px); box-shadow: 0 6px 15px rgba(107, 63, 30, 0.2); }

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
  justify-content: flex-end;
  margin-bottom: 15px;
}
.btn-clear-cart {
  background: none;
  border: none;
  color: #EF4444;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-clear-cart:hover { text-decoration: underline; color: #b91c1c; }

/* List Items */
.cart-list-body {
  position: relative;
}
.cart-item {
  display: flex;
  align-items: center;
  transition: all 0.4s ease;
  background: #fff;
}
.cart-item:last-child { border-bottom: none; }
.cart-item:hover { background: #fafafa; }

/* Chia cột */
.col-product { flex: 2.5; min-width: 250px; }
.col-price { flex: 1; text-align: center; font-weight: 600; color: #444;}
.col-qty { flex: 1.2; display: flex; flex-direction: column; align-items: center; }
.col-total { flex: 1; text-align: right; font-weight: 700; color: #d0021b; font-size: 16px;}
.col-action { flex: 0 0 50px; text-align: right; }

/* Item details */
.item-info {
  display: flex;
  flex: 2;
  gap: 16px;
}

.img-wrapper {
  width: 80px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.3s;
}
.img-wrapper:hover .item-img { transform: scale(1.05); }

.item-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px 0;
  cursor: pointer;
  color: #111827;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.item-name:hover { color: #6b3f1e; }

.item-variant {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #777;
  background: #f9f9f9;
  padding: 4px 10px;
  border-radius: 6px;
  width: fit-content;
}
.color-circle {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid #ddd;
  margin: 0 5px;
}
.variant-divider { margin: 0 10px; color: #ddd; }
.size-text { font-weight: 600; color: #333; margin-left: 5px;}

/* Bộ điều khiển số lượng */
.qty-control {
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  height: 36px;
  width: 110px;
  background: #fff;
}
.qty-btn {
  width: 30px;
  background: transparent;
  border: none;
  background: #f8f8f8;
  cursor: pointer;
  font-size: 16px;
  color: #555;
  transition: 0.2s;
}
.qty-btn:hover:not(:disabled) { background: #eee; color: #000; }
.qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.qty-input {
  flex: 1;
  text-align: center;
  border: none;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  outline: none;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
/* Ẩn mũi tên của input type number */
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.stock-hint { font-size: 12px; color: #888; margin-top: 6px; }
.text-danger { color: #ef4444; font-weight: 500;}

/* Nút xóa */
.btn-remove {
  background: #fffefb;
  border: 1px solid #fce7e7;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
}
.trash-icon { width: 18px; height: 18px; }
.btn-remove:hover { background: #fee2e2; border-color: #fca5a5; transform: scale(1.05); }

/* Animation Xóa Item */
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-leave-active { position: absolute; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(50px); }

/* Summary Card */
.cart-summary {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  padding: 30px;
  position: sticky;
  top: 24px;
}
.summary-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin-bottom: 25px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
}
.text-muted { color: #666; }
.font-weight-bold { font-weight: 600; color: #222;}

.summary-divider {
  height: 1px;
  background: #eee;
  margin: 20px 0;
}
.total-row {
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #222;
}
.final-price {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}
.vat-note {
  font-size: 12px;
  color: #888;
  text-align: right;
  margin-bottom: 24px;
}

.btn-checkout {
  width: 100%;
  padding: 16px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-checkout:hover { background: #6b3f1e; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(107, 63, 30, 0.2); }

/* ============ MODAL XÁC NHẬN ============ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.confirm-box {
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.confirm-icon-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.danger-icon { background: #fee2e2; color: #ef4444; }
.alert-svg { width: 35px; height: 35px; }

.confirm-title { color: #222; margin-bottom: 10px; font-size: 20px; font-weight: 700; }
.confirm-desc { color: #666; margin-bottom: 25px; font-size: 15px; line-height: 1.5;}
.confirm-actions { display: flex; gap: 15px; }
.confirm-actions button { flex: 1; height: 45px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; font-size: 15px; transition: 0.2s;}
.btn-cancel { background: #f1f5f9; color: #475569; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:hover { background: #dc2626; }

.fade-modal-enter-active, .fade-modal-leave-active { transition: opacity 0.3s; }
.fade-modal-enter-from, .fade-modal-leave-to { opacity: 0; }

/* ============ TOAST ============ */
.toast-notification {
  position: fixed;
  top: 25px;
  right: 25px;
  z-index: 10001;
  min-width: 280px;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  background: #fff; 
  border-left: 6px solid #22C55E;
}
.toast-notification.error { border-left-color: #ef4444; }
.toast-notification.warning { border-left-color: #f59e0b; }
.toast-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
}
.success .toast-icon { background: #22C55E; }
.error .toast-icon { background: #ef4444; }
.warning .toast-icon { background: #f59e0b; }
.toast-content { margin-left: 12px; font-weight: 500; color: #333; font-size: 15px;}
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }

/* ============ RESPONSIVE ============ */
@media (max-width: 1024px) {
  .cart-content { grid-template-columns: 1.5fr 1fr; }
}

@media (max-width: 768px) {
  .cart-content { grid-template-columns: 1fr; }
  .cart-list-header { display: none; }
  .cart-item { flex-wrap: wrap; position: relative; padding: 20px 15px; }
  .col-product { flex: 100%; margin-bottom: 20px; }
  .col-price { display: none; /* Ẩn bớt cột đơn giá trên mobile cho gọn */ }
  .col-qty { flex: 1; align-items: flex-start; }
  .col-total { flex: 1; text-align: right; }
  .col-action { position: absolute; top: 15px; right: 15px; }
  .item-total::before { content: "Thành tiền: "; font-weight: normal; color: #666; font-size: 13px; display: block; margin-bottom: 5px;}
  .img-wrapper { width: 80px; height: 90px; }
}
</style>
