<template>
  <div class="app-container">
    <Header></Header>

    <main class="cart-page">
      <div class="cart-container">
        <div class="breadcrumb">
          <span class="home-link" @click="$router.push('/')">Trang chủ</span>
          <span class="separator">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
          <span class="current">Giỏ hàng</span>
        </div>

        <div class="cart-header-title">
          <h2 class="cart-title">Giỏ hàng của bạn</h2>
        </div>

        <div v-if="cartItems.length === 0" class="empty-cart fade-in">
          <div class="empty-icon-wrapper">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="empty-svg"
            >
              <path
                d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
              ></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
          <button class="btn-continue hover-effect" @click="$router.push('/')">
            Mua sắm ngay
          </button>
        </div>

        <div v-else class="cart-content fade-in">
          <div class="cart-left">
            <div class="cart-actions-top">
              <label class="select-all-label">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="custom-checkbox"
                />
                <span>Chọn tất cả ({{ totalItems }} sản phẩm)</span>
              </label>
              <button class="btn-text-danger" @click="confirmClearCart">
                Xóa tất cả
              </button>
            </div>

            <div class="cart-list-body">
              <transition-group name="list" tag="div">
                <div
                  v-for="(item, index) in cartItems"
                  :key="item.variantId + '-' + index"
                  class="cart-item"
                >
                  <div class="item-checkbox">
                    <input
                      type="checkbox"
                      v-model="item.checked"
                      class="custom-checkbox"
                    />
                  </div>

                  <div class="item-info">
                    <div
                      class="img-wrapper"
                      @click="goToDetail(item.productId)"
                    >
                      <img
                        :src="item.hinhAnh"
                        :alt="item.tenSp"
                        class="item-img"
                        @error="handleImageError"
                      />
                      <span
                        v-if="item.discountPercent > 0"
                        class="discount-badge"
                        >-{{ item.discountPercent }}%</span
                      >
                    </div>

                    <div class="item-details">
                      <h3 class="item-name" @click="goToDetail(item.productId)">
                        {{ item.tenSp }}
                      </h3>
                      <div class="item-variant">
                        <span>{{ item.kichCo }}</span>
                        <span class="divider">•</span>
                        <span class="color-text">{{
                          item.mauSac?.tenMauSac ||
                          item.mauSac?.tenMau ||
                          "Mặc định"
                        }}</span>
                      </div>

                      <div class="item-price-mobile">
                        <span class="current-price">{{ formatPrice(item.giaBan) }}</span>
                        <span v-if="item.discountPercent > 0" class="old-price">{{ formatPrice(getOriginalPrice(item)) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="item-price desktop-only">
                    <span class="current-price">{{
                      formatPrice(item.giaBan)
                    }}</span>
                    <div v-if="item.discountPercent > 0" class="old-price">
                      {{ formatPrice(getOriginalPrice(item)) }}
                    </div>
                  </div>

                  <div class="item-qty">
                    <div class="qty-control">
                      <button
                        @click="decreaseQty(index)"
                        :disabled="item.soLuong <= 1"
                        class="qty-btn"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        v-model.number="item.soLuong"
                        @change="validateQty(index)"
                        class="qty-input"
                      />
                      <button
                        @click="increaseQty(index)"
                        :disabled="item.soLuong >= item.tonKho"
                        class="qty-btn"
                      >
                        +
                      </button>
                    </div>
                    <span
                      v-if="item.soLuong >= item.tonKho"
                      class="stock-warning"
                      >Đạt giới hạn kho</span
                    >
                  </div>

                  <div class="item-total desktop-only">
                    {{ formatPrice(item.giaBan * item.soLuong) }}
                  </div>

                  <div class="item-action">
                    <button
                      class="btn-remove"
                      @click="openConfirmModal(index)"
                      title="Xóa"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        class="icon-trash"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path
                          d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                        ></path>
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
              <span class="text-muted"
                >Tổng tiền gốc ({{ selectedItemsCount }} sản phẩm)</span
              >
              <span class="summary-val">{{
                formatPrice(totalOriginalPriceSelected)
              }}</span>
            </div>

            <div class="summary-row" v-if="totalDiscountSelected > 0">
              <span class="text-muted">Giỏ hàng đã giảm</span>
              <span class="summary-val text-sale">- {{ formatPrice(totalDiscountSelected) }}</span>
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

            <button
              class="btn-checkout hover-effect"
              @click="proceedToCheckout"
              :disabled="selectedItemsCount === 0"
            >
              Thanh toán ngay
            </button>
            <button
              class="btn-continue-shopping hover-effect"
              @click="$router.push('/')"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer></Footer>

    <transition name="fade-modal">
      <div
        v-if="modal.show"
        class="modal-confirm"
        @click.self="closeModalConfirm"
      >
        <div class="confirm-box">
          <div class="confirm-icon-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="8" x2="16" y2="16"></line>
              <line x1="16" y1="8" x2="8" y2="16"></line>
            </svg>
          </div>

          <h3 class="confirm-title">{{ modal.title }}</h3>
          <p class="confirm-desc">{{ modal.message }}</p>

          <div class="confirm-actions">
            <button class="btn-cancel" @click="closeModalConfirm">Hủy</button>
            <button class="btn-confirm" @click="handleModalConfirm">
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
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import SockJS from "sockjs-client/dist/sockjs";
import Stomp from "stompjs";

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

let stompClient = null;

const connectWebSocket = () => {
  const socket = new SockJS("http://localhost:8080/ws-chocostyle"); // Chú ý endpoint phải giống Backend
  stompClient = Stomp.over(socket);
  stompClient.debug = () => {}; // Tắt log console

  stompClient.connect(
    {},
    (frame) => {
      console.log("Cart: Đã kết nối WebSocket thành công!");

      // Lắng nghe kênh thông báo chung
      stompClient.subscribe("/topic/public-updates", (message) => {
        console.log("Cart: Có cập nhật mới từ Admin, đang làm mới giỏ hàng...");
        revalidateCart();
      });
    },
    (error) => {
      console.error("Lỗi kết nối WebSocket giỏ hàng:", error);
    },
  );
};

const disconnectWebSocket = () => {
  if (stompClient !== null) {
    stompClient.disconnect();
  }
};

// Hàm tự động gọi API quét lại giá, tồn kho và trạng thái
const revalidateCart = async () => {
  if (cartItems.value.length === 0) return;

  try {
    // 1. Quét thông tin mới nhất của từng sản phẩm trong giỏ
    const requests = cartItems.value.map((item) =>
      axios.get(
        `http://localhost:8080/api/chi-tiet-san-pham/${item.variantId}`,
      ),
    );
    const responses = await Promise.all(requests);
    let hasChanges = false;

    responses.forEach((res, index) => {
      const data = res.data;
      const item = cartItems.value[index];

      if (data) {
        // Nếu Giá, Tồn kho hoặc Trạng thái bị đổi -> Cập nhật vào giỏ
        if (
          item.giaBan !== data.giaBan ||
          item.tonKho !== data.soLuongTon ||
          item.trangThai !== data.trangThai
        ) {
          item.giaBan = data.giaBan;
          item.tonKho = data.soLuongTon;
          item.trangThai = data.trangThai;
          hasChanges = true;
        }
      }
    });

    // 2. Chặn và Xóa các sản phẩm đã NGỪNG BÁN hoặc HẾT HÀNG
    const oldLength = cartItems.value.length;
    cartItems.value = cartItems.value.filter(
      (item) => item.trangThai === 1 && item.tonKho > 0,
    );

    if (cartItems.value.length < oldLength) {
      showToast(
        "Một số sản phẩm đã hết hàng/ngừng bán và bị tự động xóa khỏi giỏ!",
        "error",
      );
      hasChanges = true;
    }

    // 3. Tự động ép số lượng mua xuống nếu Tồn kho Admin chỉnh nhỏ hơn Số lượng trong giỏ
    cartItems.value.forEach((item) => {
      if (item.soLuong > item.tonKho) {
        item.soLuong = item.tonKho;
        showToast(
          `Sản phẩm ${item.tenSp} chỉ còn ${item.tonKho} cái, hệ thống đã tự điều chỉnh!`,
          "warning",
        );
        hasChanges = true;
      }
    });

    // 4. Lấy lại Đợt Sale mới nhất
    await fetchPromotions();

    // 5. Nếu có bất kỳ thay đổi nào, lưu lại vào LocalStorage
    if (hasChanges) {
      saveCart();
    }
  } catch (e) {
    console.error("Lỗi cập nhật giỏ hàng:", e);
  }
};

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

// 👉 LOGIC GIÁ: Tính ngược lại giá gốc từ giá đã giảm lưu trong giỏ hàng
const getOriginalPrice = (item) => {
  if (!item.discountPercent || item.discountPercent <= 0 || item.discountPercent >= 100) {
    return item.giaBan;
  }
  // Ví dụ: Đang bán 25k, giảm 50% => Giá gốc = 25000 / (1 - 0.5) = 50000
  return Math.round(item.giaBan / (1 - item.discountPercent / 100));
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
  await revalidateCart();
  connectWebSocket();
});

onUnmounted(() => {
  disconnectWebSocket();
});

const formatPrice = (v) => {
  if (v == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN").format(Math.round(v)) + " ₫";
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

// TỔNG TIỀN GỐC (Tổng tiền chưa giảm)
const totalOriginalPriceSelected = computed(() => {
  return cartItems.value
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + getOriginalPrice(item) * item.soLuong, 0);
});

// TỔNG TIỀN TẠM TÍNH (Tổng tiền thực trả)
const totalPriceSelected = computed(() => {
  return cartItems.value
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.giaBan * item.soLuong, 0);
});

// TỔNG SỐ TIỀN TIẾT KIỆM ĐƯỢC
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

const proceedToCheckout = () => {
  const selectedItems = cartItems.value.filter((item) => item.checked);

  if (selectedItems.length === 0) {
    showToast("Vui lòng chọn sản phẩm để thanh toán.", "warning");
    return;
  }

  localStorage.setItem("checkout_items", JSON.stringify(selectedItems));
  router.push({ path: "/payment", query: { fromCart: "true" } });
};

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 3000);
};
</script>

<style scoped>
/* ================= RESET & CƠ BẢN ================= */
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap");

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F7F7F7;
  font-family: 'Nunito', "Segoe UI", Roboto, sans-serif;
  color: #333;
}

.cart-page {
  padding: 40px 20px;
  flex-grow: 1;
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Breadcrumb */
.breadcrumb {
  margin-bottom: 24px;
  font-size: 14px;
  color: #888;
  display: flex;
  align-items: center;
}

.home-link {
  font-weight: 700;
  color: #333;
  cursor: pointer;
  transition: 0.2s;
}

.home-link:hover {
  color: #63391f;
}

.separator {
  margin: 0 10px;
  color: #ccc;
  display: flex;
  align-items: center;
}

.separator svg {
  width: 14px;
  height: 14px;
}

.current {
  color: #63391f;
  font-weight: 600;
  cursor: default;
}

/* Headers */
.cart-header-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 25px;
}

.cart-title {
  font-family: "Montserrat", sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.5px;
}

/* Inputs & Checkbox */
.custom-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #63391F;
  border-radius: 4px;
  transition: 0.2s;
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.empty-icon-wrapper {
  margin-bottom: 20px;
  color: #d1d5db;
}

.empty-svg {
  width: 64px;
  height: 64px;
}

.empty-cart p {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.btn-continue {
  background: #63391f;
  color: #ffffff;
  border: none;
  padding: 12px 35px;
  border-radius: 8px;
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s;
}

.btn-continue:hover {
  background: #4e2c17;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(99, 57, 31, 0.2);
}

/* ================= CART LAYOUT ================= */
.cart-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 30px;
  align-items: start;
}

/* Actions Top */
.cart-actions-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: #ffffff;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid #f0f0f0;
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  color: #333;
}

.btn-text-danger {
  background: none;
  border: none;
  color: #d32f2f;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-text-danger:hover {
  text-decoration: underline;
  color: #b71c1c;
}

/* List Items */
.cart-list-body {
  background: #ffffff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px dashed #f0f0f0;
  gap: 20px;
  transition: background 0.3s;
}

.cart-item:hover {
  background-color: #fdfdfd;
}

.cart-item:last-child {
  border-bottom: none;
}

/* Item details */
.item-info {
  display: flex;
  flex: 2.5;
  gap: 18px;
}

.img-wrapper {
  width: 90px;
  height: 110px;
  border-radius: 8px;
  background: #f8f9fa;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 1px solid #f0f0f0;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: 0.3s;
}
.img-wrapper:hover .item-img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: #d32f2f;
  color: #ffffff;
  font-size: 11px;
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  padding: 3px 8px;
  border-bottom-right-radius: 6px;
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 15px;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  margin: 0 0 8px 0;
  cursor: pointer;
  color: #1a1a1a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  transition: color 0.2s;
}

.item-name:hover {
  color: #63391f;
}

.item-variant {
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
  font-weight: 500;
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
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #1a1a1a;
}

.old-price {
  font-size: 13px;
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
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  height: 36px;
  width: 110px;
  background: #fff;
  overflow: hidden;
}

.qty-btn {
  width: 35px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #4b5563;
  transition: 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #63391f;
}

.qty-btn:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.qty-input {
  flex: 1;
  text-align: center;
  border: none;
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  width: 100%;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  color: #1a1a1a;
  outline: none;
}

.stock-warning {
  font-size: 11px;
  color: #d32f2f;
  margin-top: 6px;
  font-weight: 600;
}

.item-total {
  flex: 1;
  text-align: right;
  font-weight: 800;
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  color: #d32f2f;
}

.item-action {
  width: 40px;
  text-align: right;
}

.btn-remove {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #fee2e2;
  color: #d32f2f;
  border-color: #fecaca;
}

.icon-trash {
  width: 18px;
  height: 18px;
}

/* ================= SUMMARY CARD ================= */
.cart-summary {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px;
  position: sticky;
  top: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.summary-title {
  font-family: "Montserrat", sans-serif;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px dashed #f0f0f0;
  color: #1a1a1a;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 15px;
}

.text-muted {
  color: #666;
  font-weight: 500;
}

.summary-val {
  font-weight: 600;
  color: #333;
}

.text-sale {
  color: #d32f2f;
}

.summary-divider {
  border-top: 1px solid #e5e7eb;
  margin: 20px 0;
}

.total-row {
  align-items: center;
  margin-bottom: 8px;
}

.total-row span:first-child {
  font-weight: 600;
  font-size: 16px;
  color: #1a1a1a;
}

.final-price {
  font-family: "Montserrat", sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #d32f2f;
}

.vat-note {
  font-size: 12px;
  color: #888;
  text-align: right;
  margin-bottom: 25px;
  font-style: italic;
}

.btn-checkout {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #63391f, #8b5328);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 15px rgba(99, 57, 31, 0.2);
}

.btn-checkout:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px rgba(99, 57, 31, 0.3);
}

.btn-checkout:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-continue-shopping {
  width: 100%;
  padding: 15px;
  background: #ffffff;
  color: #63391f;
  border: 1px solid #63391f;
  border-radius: 8px;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-continue-shopping:hover {
  background: #f7f7f7;
}

/* ================= ANIMATIONS & MODALS ================= */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-leave-active {
  position: absolute;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.modal-confirm {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.confirm-box {
  background: #ffffff;
  padding: 35px 30px;
  border-radius: 20px;
  width: 400px;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes zoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #F7F7F7;
  color: #63391F;
  margin: 0 auto 20px auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-title {
  color: #63391F;
  margin-bottom: 12px;
  font-size: 22px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
}

.confirm-desc {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.5;
  font-size: 15px;
}

.confirm-actions {
  display: flex;
  gap: 15px;
}

.btn-confirm {
  background: #63391F;
  color: #FFFFFF;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  flex: 1;
  height: 45px;
  transition: 0.2s;
}

.btn-confirm:hover {
  background: #4e2c17;
}

.btn-cancel {
  background: #F7F7F7;
  color: #333;
  border: 1px solid #ddd;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  flex: 1;
  height: 45px;
  transition: 0.2s;
}

.btn-cancel:hover {
  background: #ebebeb;
  color: #111;
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

/* ================= TOAST NOTIFICATION CSS MỚI ================= */
.toast-notification {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 10001;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  min-width: 250px;
}

/* Mặc định success nếu bạn để type="success" */
.toast-notification.success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.toast-notification.warning {
  background: #ffc107;
  color: #333;
  border-left: 4px solid #ff9800;
}

.toast-notification.error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
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
    display: flex;
    flex-direction: column;
    margin-top: 10px;
  }
  .cart-item {
    flex-wrap: wrap;
    position: relative;
    gap: 16px;
    padding: 20px 15px;
  }
  .item-info {
    flex: 100%;
  }
  .item-qty {
    flex: 1;
    align-items: flex-start;
    padding-left: 36px;
  }
  .item-action {
    position: absolute;
    top: 20px;
    right: 20px;
  }
  .cart-title {
    font-size: 22px;
  }
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
