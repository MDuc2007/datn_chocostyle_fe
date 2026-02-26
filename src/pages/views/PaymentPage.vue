<template>
  <div class="checkout-wrapper">
    <Header></Header>

    <div class="checkout-container">
      <div class="checkout-grid">
        <div class="left-column">
          <div class="card shadow-sm">
            <div class="card-header">
              <div class="header-title">
                <span class="icon-circle">👤</span>
                <h2>Thông tin giao hàng</h2>
              </div>
              <button
                type="button"
                class="btn-outline"
                @click="openCustomerModal"
              >
                📋 Chọn từ sổ địa chỉ
              </button>
            </div>

            <form class="checkout-form" @submit.prevent>
              <div class="form-row">
                <div class="form-group">
                  <label>Họ và tên người nhận</label>
                  <input
                    v-model="form.tenKhachHang"
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input
                    v-model="form.soDienThoai"
                    type="text"
                    placeholder="Ví dụ: 0987654321"
                    class="form-control"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Email liên hệ</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="Ví dụ: email@domain.com"
                  class="form-control"
                />
              </div>

              <div class="form-row triplet">
                <div class="form-group">
                  <label>Tỉnh/Thành phố</label>
                  <select v-model="form.thanhPho" class="form-control">
                    <option :value="form.thanhPho">
                      {{ form.thanhPho || "Chọn Tỉnh/Thành phố" }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Quận/Huyện</label>
                  <select v-model="form.quan" class="form-control">
                    <option :value="form.quan">
                      {{ form.quan || "Chọn Quận/Huyện" }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Phường/Xã</label>
                  <select v-model="form.phuong" class="form-control">
                    <option :value="form.phuong">
                      {{ form.phuong || "Chọn Phường/Xã" }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Địa chỉ cụ thể (Số nhà, tên đường)</label>
                <input
                  v-model="form.diaChiCuThe"
                  type="text"
                  placeholder="Nhập địa chỉ chi tiết để giao hàng chính xác hơn"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Ghi chú</label>
                <textarea
                  v-model="form.ghiChu"
                  rows="3"
                  placeholder="Nhập ghi chú"
                  class="form-control"
                ></textarea>
              </div>

              <div class="payment-section mt-4">
                <div class="header-title mb-3">
                  <span class="icon-circle">💳</span>
                  <h2>Phương thức thanh toán</h2>
                </div>
                <div class="payment-options">
                  <label
                    class="payment-card"
                    :class="{ active: paymentMethod === 'COD' }"
                    @click="paymentMethod = 'COD'"
                  >
                    <div class="pay-icon">
                      <img
                        src="/src/assets/icon/money-dollar-svgrepo-com.svg"
                        alt="COD"
                      />
                    </div>
                    <div class="pay-info">
                      <span class="pay-name"
                        >Thanh toán khi nhận hàng (COD)</span
                      >
                      <span class="pay-desc"
                        >Kiểm tra hàng trước khi thanh toán</span
                      >
                    </div>
                    <div class="radio-indicator"></div>
                  </label>

                  <label
                    class="payment-card"
                    :class="{ active: paymentMethod === 'ONLINE' }"
                    @click="paymentMethod = 'ONLINE'"
                  >
                    <div class="pay-icon">
                      <img src="/src/assets/icon/image 56.png" alt="Online" />
                    </div>
                    <div class="pay-info">
                      <span class="pay-name"
                        >Thanh toán trực tuyến (VNPAY)</span
                      >
                      <span class="pay-desc"
                        >Thanh toán an toàn qua ví điện tử</span
                      >
                    </div>
                    <div class="radio-indicator"></div>
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div class="right-column">
          <div class="card shadow-sm sticky-summary">
            <h2 class="summary-title">Tóm tắt đơn hàng</h2>

            <div class="product-list">
              <div
                class="product-item"
                v-if="product && selectedVariant && productInfo"
              >
                <div class="product-img-wrapper">
                  <img
                    :src="selectedVariant.hinhAnhUrls?.[0] || product.hinhAnh"
                    alt="Product"
                  />
                  <span class="product-qty-badge">{{
                    productInfo.quantity
                  }}</span>
                </div>
                <div class="product-detail">
                  <h3 class="product-name" title="Tên sản phẩm">
                    {{ product.tenSp }}
                  </h3>
                  <p class="product-meta">
                    Phân loại: {{ selectedVariant.kichCoList?.[0] }}
                  </p>
                  <p class="product-price">
                    {{ formatPrice(selectedVariant.giaBan) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="voucher-wrapper">
              <input
                type="text"
                placeholder="Nhập mã giảm giá..."
                class="form-control input-voucher"
              />
              <button type="button" class="btn-apply">Áp dụng</button>
            </div>

            <div class="divider"></div>

            <div class="price-breakdown">
              <div class="price-row">
                <span class="label">Tạm tính:</span>
                <span class="value">{{ formatPrice(totalPrice) }}</span>
              </div>
              <div class="price-row">
                <span class="label">Phí vận chuyển:</span>
                <span class="value">{{ formatPrice(shipFee) }}</span>
              </div>
            </div>

            <div class="divider dashed"></div>

            <div class="price-total">
              <span class="label">Tổng cộng</span>
              <span class="value highlight-price">{{
                formatPrice(totalPrice + shipFee)
              }}</span>
            </div>

            <button
              type="button"
              class="btn-submit-order"
              @click="confirmOrder"
            >
              Hoàn tất đặt hàng
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="showCustomerModal"
        class="modal-backdrop"
        @click.self="showCustomerModal = false"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <h3>Sổ địa chỉ của bạn</h3>
            <button class="btn-close-modal" @click="showCustomerModal = false">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <div class="search-box mb-3">
              <input
                type="text"
                v-model="searchKeyword"
                placeholder="🔍 Tìm kiếm tên, số điện thoại..."
                class="form-control"
              />
            </div>
            <div class="table-responsive">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Thông tin</th>
                    <th>Liên hệ</th>
                    <th>Địa chỉ giao hàng</th>
                    <th class="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in filteredCustomers"
                    :key="item.diaChi.id"
                  >
                    <td>
                      <strong>{{ item.tenKhachHang }}</strong>
                    </td>
                    <td>
                      <div>📞 {{ item.soDienThoai }}</div>
                      <div class="text-muted small">✉️ {{ item.email }}</div>
                    </td>
                    <td class="address-cell">
                      {{ item.diaChi.diaChiCuThe }}, {{ item.diaChi.phuong }},
                      {{ item.diaChi.quan }}, {{ item.diaChi.thanhPho }}
                    </td>
                    <td class="text-center">
                      <button class="btn-select" @click="selectAddress(item)">
                        Sử dụng
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredCustomers.length === 0">
                    <td colspan="4" class="text-center text-muted py-4">
                      Chưa có dữ liệu địa chỉ nào.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="zoom">
      <div v-if="modal.show" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-dialog modal-sm text-center">
          <div class="confirm-icon">📦</div>
          <h3 class="confirm-title">{{ modal.title }}</h3>
          <p class="confirm-desc">{{ modal.message }}</p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="closeModal">Quay lại</button>
            <button class="btn-confirm" @click="handleModalConfirm">
              Xác nhận đặt hàng
            </button>
          </div>
        </div>
      </div>
    </transition>

    <div class="toast-container">
      <transition-group name="slide-fade">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="modern-toast"
          :class="'toast-' + notif.type"
        >
          <span class="toast-icon">
            <template v-if="notif.type === 'success'">✓</template>
            <template v-else-if="notif.type === 'warning'">!</template>
            <template v-else>✕</template>
          </span>
          <span class="toast-message">{{ notif.message }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
// TOÀN BỘ LOGIC SCRIPT GIỮ NGUYÊN NHƯ BẠN ĐÃ CUNG CẤP
import Header from "../../layout/header/Header.vue";
import { ref, onMounted, computed, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const product = ref(null);
const selectedVariant = ref(null);
const productInfo = ref(null);
const showCustomerModal = ref(false);
const searchKeyword = ref("");
const customerList = ref([]);
const paymentMethod = ref("COD");

const modal = reactive({ show: false, title: "", message: "", action: null });
const notifications = ref([]);

const addNotification = (message, type = "success") => {
  const id = Date.now();
  notifications.value.push({ id, message, type });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 3000);
};

const closeModal = () => {
  modal.show = false;
};

const confirmOrder = () => {
  if (
    !form.value.tenKhachHang ||
    !form.value.soDienThoai ||
    !form.value.diaChiCuThe
  ) {
    addNotification("Vui lòng điền đầy đủ thông tin giao hàng!", "warning");
    return;
  }
  modal.title = "Xác nhận đặt hàng";
  modal.message = "Bạn có chắc chắn muốn đặt đơn hàng này không?";
  modal.show = true;
  modal.action = handleCheckout;
};

const handleModalConfirm = () => {
  if (modal.action) modal.action();
  closeModal();
};

const openCustomerModal = async () => {
  if (!customer.value) {
    await fetchCustomer();
  }
  showCustomerModal.value = true;
};

const filteredCustomers = computed(() => {
  if (!customer.value) return [];
  const keyword = searchKeyword.value.toLowerCase();
  return (
    customer.value.listDiaChi
      ?.filter((d) => {
        return (
          customer.value.tenKhachHang?.toLowerCase().includes(keyword) ||
          customer.value.email?.toLowerCase().includes(keyword) ||
          customer.value.soDienThoai?.includes(keyword)
        );
      })
      .map((d) => ({ ...customer.value, diaChi: d })) || []
  );
});

const selectCustomer = (item) => {
  customer.value = item;
  form.value.tenKhachHang = item.tenKhachHang;
  form.value.soDienThoai = item.soDienThoai;
  form.value.email = item.email;
  const defaultAddress = item.listDiaChi?.find((d) => d.macDinh);
  if (defaultAddress) {
    setAddressToForm(defaultAddress);
  }
  showCustomerModal.value = false;
};

const shipFee = 20000;
const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v) + " đ";

const totalPrice = computed(() => {
  if (!selectedVariant.value || !productInfo.value) return 0;
  return selectedVariant.value.giaBan * productInfo.value.quantity;
});

const customer = ref(null);
const listDiaChi = ref([]);
const showAddressModal = ref(false);

const form = ref({
  tenKhachHang: "",
  soDienThoai: "",
  email: "",
  thanhPho: "",
  quan: "",
  phuong: "",
  diaChiCuThe: "",
  ghiChu: "",
});

const userStr = localStorage.getItem("user");
let token = null;
let username = null;
if (userStr) {
  const user = JSON.parse(userStr);
  token = user.accessToken;
  username = user.username;
}

const fetchCustomer = async () => {
  try {
    const res = await axios.get(
      `http://localhost:8080/api/khach-hang/email/${username}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    customer.value = res.data;
    listDiaChi.value = res.data.listDiaChi || [];
    form.value.tenKhachHang = res.data.tenKhachHang || "";
    form.value.soDienThoai = res.data.soDienThoai || "";
    form.value.email = res.data.email || "";
    if (listDiaChi.value.length > 0) {
      const defaultAddress =
        listDiaChi.value.find((d) => d.macDinh === true) || listDiaChi.value[0];
      setAddressToForm(defaultAddress);
    }
  } catch (err) {
    console.error("Lỗi lấy khách hàng:", err);
  }
};

const setAddressToForm = (address) => {
  form.value.thanhPho = address.thanhPho;
  form.value.quan = address.quan;
  form.value.phuong = address.phuong;
  form.value.diaChiCuThe = address.diaChiCuThe;
};

const selectAddress = (item) => {
  customer.value = item;
  form.value.tenKhachHang = item.tenKhachHang;
  form.value.soDienThoai = item.soDienThoai;
  form.value.email = item.email;
  setAddressToForm(item.diaChi);
  showCustomerModal.value = false;
};

const handleCheckout = async () => {
  const orderData = {
    idKhachHang: customer.value ? customer.value.id : null,
    idNhanVien: 1,
    loaiDon: 0,
    ghiChu: form.value.ghiChu,
    tongTienHang: totalPrice.value,
    phiShip: shipFee,
    maVoucher: "",
    sanPhamChiTiet: [
      {
        idChiTietSanPham: selectedVariant.value.id,
        soLuong: productInfo.value.quantity,
        donGia: selectedVariant.value.giaBan,
      },
    ],
  };
  try {
    const response = await axios.post(
      "http://localhost:8080/api/hoa-don",
      orderData,
    );
    if (response.status === 201 || response.status === 200) {
      addNotification("Đặt hàng thành công!", "success");
      setTimeout(() => router.push("/"), 2000);
    }
  } catch (error) {
    console.error("Lỗi:", error);
    const errorMsg = error.response?.data || "Lỗi hệ thống khi tạo đơn.";
    addNotification(errorMsg, "error");
  }
};

onMounted(async () => {
  await fetchCustomer();
  const { productId, variantId, quantity } = route.query;
  if (!productId || !variantId) return;
  productInfo.value = { quantity: parseInt(quantity, 10) };
  try {
    const res = await axios.get(
      `http://localhost:8080/api/san-pham/${productId}`,
    );
    product.value = res.data;
    selectedVariant.value = product.value.bienTheList.find(
      (b) => b.id == variantId,
    );
  } catch (err) {
    console.error("Lỗi load sản phẩm:", err);
  }
});
</script>

<style scoped>
/* ================== VARIABLES & GLOBALS ================== */
.checkout-wrapper {
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  color: #333;
  padding-bottom: 60px;
}

.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Typography & Utils */
.mb-3 {
  margin-bottom: 1rem;
}
.mt-4 {
  margin-top: 1.5rem;
}
.text-center {
  text-align: center;
}
.text-muted {
  color: #6c757d;
}
.small {
  font-size: 0.875rem;
}
.shadow-sm {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

/* ================== HEADER ================== */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #4a2c11; /* Đậm phong cách thời trang nam */
  margin: 0 0 8px 0;
}
.page-subtitle {
  color: #6c757d;
  font-size: 15px;
  margin: 0;
}

/* ================== GRID LAYOUT ================== */
.checkout-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
  align-items: start;
}
@media (max-width: 992px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}

/* ================== CARDS ================== */
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px;
  border: 1px solid #eaebec;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f3f5;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #212529;
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #fdf5eb;
  color: #b97a3a;
  border-radius: 50%;
  font-size: 16px;
}

/* ================== FORMS ================== */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.form-row.triplet {
  grid-template-columns: 1fr 1fr 1fr;
}
@media (max-width: 768px) {
  .form-row,
  .form-row.triplet {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  border: 1.5px solid #e9ecef;
  border-radius: 10px;
  background-color: #fcfcfc;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.form-control:focus {
  outline: none;
  border-color: #b97a3a;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(185, 122, 58, 0.1);
}

/* ================== PAYMENT OPTIONS ================== */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border: 1.5px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  background: #fff;
}
.payment-card:hover {
  border-color: #ced4da;
}
.payment-card.active {
  border-color: #b97a3a;
  background-color: #fefcf9;
}

.pay-icon img {
  width: 32px;
  height: 32px;
  margin-right: 15px;
}

.pay-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.pay-name {
  font-weight: 600;
  color: #212529;
  font-size: 15px;
}
.pay-desc {
  font-size: 13px;
  color: #6c757d;
  margin-top: 2px;
}

.radio-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ced4da;
  position: relative;
  transition: all 0.2s;
}
.payment-card.active .radio-indicator {
  border-color: #b97a3a;
  background: #b97a3a;
}
.payment-card.active .radio-indicator::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

/* ================== RIGHT COLUMN: SUMMARY ================== */
.sticky-summary {
  position: sticky;
  top: 24px;
}

.summary-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 25px;
  color: #212529;
}

.product-item {
  display: flex;
  gap: 15px;
  align-items: center;
}

.product-img-wrapper {
  position: relative;
  width: 70px;
  height: 85px;
  flex-shrink: 0;
}
.product-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
}
.product-qty-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #6c757d;
  color: white;
  font-size: 11px;
  font-weight: bold;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #fff;
}

.product-detail {
  flex-grow: 1;
}
.product-name {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-meta {
  font-size: 13px;
  color: #6c757d;
  margin: 0 0 4px 0;
}
.product-price {
  font-weight: 700;
  color: #4a2c11;
  margin: 0;
  font-size: 14px;
}

.divider {
  border-top: 1px solid #e9ecef;
  margin: 20px 0;
}
.divider.dashed {
  border-top-style: dashed;
}

.voucher-wrapper {
  display: flex;
  gap: 10px;
}
.input-voucher {
  flex-grow: 1;
  text-transform: uppercase;
}
.btn-apply {
  background: #212529;
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-apply:hover {
  background: #495057;
}

.price-breakdown {
  font-size: 15px;
  color: #495057;
}
.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.price-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 25px;
}
.highlight-price {
  color: #d35400;
  font-size: 22px;
} /* Đỏ cam bắt mắt */

/* Buttons */
.btn-outline {
  background: transparent;
  color: #b97a3a;
  border: 1px solid #b97a3a;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline:hover {
  background: #fdf5eb;
}

.btn-submit-order {
  width: 100%;
  background: #b97a3a;
  background: linear-gradient(135deg, #b97a3a 0%, #8b5a2b 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 20px rgba(139, 90, 43, 0.25);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.btn-submit-order:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(139, 90, 43, 0.35);
}

/* ================== MODALS ================== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.modal-dialog {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-height: 90vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}
.modal-lg {
  max-width: 800px;
}
.modal-sm {
  max-width: 400px;
  padding: 30px;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}
.btn-close-modal {
  background: none;
  border: none;
  font-size: 24px;
  color: #6c757d;
  cursor: pointer;
}
.btn-close-modal:hover {
  color: #dc3545;
}

.modal-body {
  padding: 25px;
  overflow-y: auto;
}

/* Table in Modal */
.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.modern-table th {
  background: #f8f9fa;
  padding: 12px 15px;
  font-size: 14px;
  color: #495057;
  text-align: left;
  border-bottom: 2px solid #e9ecef;
}
.modern-table td {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
  font-size: 14px;
}
.modern-table tr:hover td {
  background: #fdfdfd;
}
.address-cell {
  max-width: 250px;
  line-height: 1.5;
  color: #495057;
}

.btn-select {
  background: #f1f3f5;
  color: #212529;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-select:hover {
  background: #b97a3a;
  color: white;
}

/* Confirm Modal Specifics */
.confirm-icon {
  font-size: 48px;
  width: 80px;
  height: 80px;
  background: #fdf5eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}
.confirm-title {
  font-size: 22px;
  color: #212529;
  margin-bottom: 10px;
}
.confirm-desc {
  color: #6c757d;
  margin-bottom: 30px;
  line-height: 1.6;
}
.confirm-actions {
  display: flex;
  gap: 15px;
}
.confirm-actions button {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-cancel {
  background: #f1f3f5;
  color: #495057;
}
.btn-cancel:hover {
  background: #e2e6ea;
}
.btn-confirm {
  background: #8b5a2b;
  color: white;
}
.btn-confirm:hover {
  background: #6b4421;
}

/* ================== TOASTS ================== */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.modern-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  border-left: 4px solid #ced4da;
}
.toast-success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;}
.toast-success .toast-icon {
  background: #d4edda;
  color: #28a745;
}
.toast-error {
  border-left-color: #dc3545;
}
.toast-error .toast-icon {
  background: #f8d7da;
  color: #dc3545;
}
.toast-warning {
  border-left-color: #ffc107;
}
.toast-warning .toast-icon {
  background: #fff3cd;
  color: #ffc107;
}

.toast-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}
.toast-message {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* ================== ANIMATIONS ================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(50px);
  opacity: 0;
}
</style>
