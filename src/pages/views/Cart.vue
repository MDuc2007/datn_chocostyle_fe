<template>
  <div class="app-container">
    <Header></Header>

    <main class="cart-page">
      <div class="cart-container">
        <div class="breadcrumb">
          <span @click="$router.push('/')">Trang chủ</span>
          <span class="separator">/</span>
          <span class="current">Giỏ hàng của bạn</span>
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
          <p>Giỏ hàng của bạn đang trống</p>
          <button class="btn-continue hover-effect" @click="$router.push('/')">
            <i class="fa fa-arrow-left"></i> TIẾP TỤC MUA SẮM
          </button>
        </div>

        <div v-else class="cart-content fade-in">
          <div class="cart-left">
            <div class="cart-actions-top">
               <button class="btn-clear-cart" @click="confirmClearCart">
                 <i class="fa fa-trash"></i> Xóa tất cả
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
                    </div>
                    <div class="item-details">
                      <h3 class="item-name" @click="goToDetail(item.productId)">{{ item.tenSp }}</h3>
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

                  <div class="col-qty item-qty">
                    <div class="qty-control">
                      <button @click="decreaseQty(index)" :disabled="item.soLuong <= 1" class="qty-btn">-</button>
                      <input type="number" v-model.number="item.soLuong" @change="validateQty(index)" class="qty-input" />
                      <button @click="increaseQty(index)" :disabled="item.soLuong >= item.tonKho" class="qty-btn">+</button>
                    </div>
                    <div class="stock-hint" :class="{'text-danger': item.soLuong >= item.tonKho}">
                      Kho: {{ item.tonKho }}
                    </div>
                  </div>

                  <div class="col-total item-total">
                    {{ formatPrice(item.giaBan * item.soLuong) }}
                  </div>

                  <div class="col-action item-action">
                    <button class="btn-remove" @click="openConfirmModal(index)" title="Xóa sản phẩm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="trash-icon">
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
            <div class="summary-row">
              <span class="text-muted">Tạm tính:</span>
              <span class="summary-val">{{ formatPrice(totalPrice) }}</span>
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
      <div v-if="confirmModal.show" class="modal-overlay" @click.self="closeConfirmModal">
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
        <div class="toast-icon">
          <span v-if="toast.type === 'success'">✓</span>
          <span v-else-if="toast.type === 'error'">✕</span>
          <span v-else>!</span>
        </div>
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
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
});

// Format tiền tệ
const formatPrice = (v) => {
  if (v == null) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(v) + " đ";
};

// Xử lý lỗi ảnh
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

// Hàm lưu giỏ hàng & bắn sự kiện update Header
const saveCart = () => {
  localStorage.setItem("cart", JSON.stringify(cartItems.value));
  window.dispatchEvent(new Event("cartUpdated"));
};

// Điều khiển số lượng
const increaseQty = (index) => {
  if (cartItems.value[index].soLuong < cartItems.value[index].tonKho) {
    cartItems.value[index].soLuong++;
    saveCart();
  } else {
    showToast("Đã đạt số lượng tồn kho tối đa!", "warning");
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
    showToast(`Kho chỉ còn ${item.tonKho} sản phẩm!`, "error");
  }
  saveCart();
};

// MODAL LỌGIC XÓA
const openConfirmModal = (index) => {
  confirmModal.value = { show: true, indexToRemove: index, isClearAll: false };
};

const confirmClearCart = () => {
  confirmModal.value = { show: true, indexToRemove: null, isClearAll: true };
};

const closeConfirmModal = () => {
  confirmModal.value.show = false;
};

const executeRemove = () => {
  if (confirmModal.value.isClearAll) {
    cartItems.value = [];
    showToast("Đã xóa toàn bộ giỏ hàng.");
  } else {
    cartItems.value.splice(confirmModal.value.indexToRemove, 1);
    showToast("Đã xóa sản phẩm khỏi giỏ hàng.");
  }
  saveCart();
  closeConfirmModal();
};

// Điều hướng
const goToDetail = (productId) => {
  router.push(`/home/product/${productId}`);
};

const proceedToCheckout = () => {
  router.push("/payment");
};

// Hiển thị thông báo
const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 3000);
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.cart-page {
  padding: 30px 4%;
  flex-grow: 1;
}

.cart-container {
  max-width: 1250px;
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
}

.cart-count {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

/* ============ TRỐNG GIỎ HÀNG ============ */
.empty-cart {
  text-align: center;
  padding: 100px 20px;
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
  width: 50px;
  height: 50px;
  color: #a88164;
}
.empty-cart p {
  font-size: 18px;
  color: #555;
  margin-bottom: 30px;
  font-weight: 500;
}
.btn-continue {
  background: #6b3f1e;
  color: #fff;
  border: none;
  padding: 14px 35px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn-continue:hover { background: #4a2a17; transform: translateY(-3px); box-shadow: 0 6px 15px rgba(107, 63, 30, 0.2); }

/* ============ LAYOUT GIỎ HÀNG ============ */
.cart-content {
  display: grid;
  grid-template-columns: 2.2fr 1fr;
  gap: 30px;
  align-items: start;
}

.cart-actions-top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}
.btn-clear-cart {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-clear-cart:hover { text-decoration: underline; color: #b91c1c; }

/* Bảng danh sách sản phẩm */
.cart-items {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  overflow: hidden;
}

.cart-list-header {
  display: flex;
  padding: 18px 25px;
  background: #fcfcfc;
  border-bottom: 1px solid #eee;
  font-weight: 700;
  color: #444;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.cart-list-body {
  position: relative;
}

.cart-item {
  display: flex;
  padding: 25px;
  border-bottom: 1px solid #f5f5f5;
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

/* Thông tin sản phẩm */
.item-info {
  display: flex;
  gap: 20px;
  align-items: center;
}
.img-wrapper {
  width: 90px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
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
  color: #222;
  transition: 0.2s;
  line-height: 1.4;
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
  width: 35px;
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
  width: 40px;
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

/* ============ CỘT TỔNG KẾT ============ */
.cart-summary {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  padding: 30px;
  position: sticky;
  top: 90px;
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
  margin-bottom: 15px;
  font-size: 15px;
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
  font-size: 26px;
  font-weight: 800;
  color: #d0021b;
}

.vat-note {
  font-size: 12px;
  color: #888;
  text-align: right;
  margin-bottom: 30px;
  font-style: italic;
}

.btn-checkout {
  width: 100%;
  padding: 16px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
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