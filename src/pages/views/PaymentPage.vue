<template>
  <div>
    <Header />

    <div class="payment-page">
      <div class="title-banner">
        <h1>Thông tin thanh toán</h1>
      </div>

      <div class="payment-container">
        <!-- LEFT -->
        <div class="customer-info card">
          <div class="card-header">
            <h2>THÔNG TIN KHÁCH HÀNG</h2>
            <button class="btn-select-address">Chọn địa chỉ</button>
          </div>

          <form @submit.prevent>
            <div class="form-group">
              <label>Tên khách hàng</label>
              <input type="text" placeholder="Nhập tên khách hàng" />
            </div>

            <div class="form-group">
              <label>Số điện thoại</label>
              <input type="text" placeholder="Nhập số điện thoại" />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input type="email" placeholder="Nhập email" />
            </div>

            <div class="form-row">
              <div class="form-group col">
                <label>Xã/Phường</label>
                <select>
                  <option>Chọn xã phường</option>
                </select>
              </div>
              <div class="form-group col">
                <label>Quận/Huyện</label>
                <select>
                  <option>Chọn quận huyện</option>
                </select>
              </div>
              <div class="form-group col">
                <label>Tỉnh/Thành phố</label>
                <select>
                  <option>Chọn tỉnh thành phố</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Địa chỉ cụ thể</label>
              <input type="text" placeholder="Nhập địa chỉ cụ thể" />
            </div>

            <div class="form-group">
              <label>Ghi chú</label>
              <textarea rows="3" placeholder="Nhập ghi chú"></textarea>
            </div>

            <div class="payment-methods">
              <label>Phương thức thanh toán</label>
              <div class="method-options">
                <div class="method-box active">
                  <span>💰</span> Thanh toán khi nhận hàng
                </div>
                <div class="method-box"><span>💳</span> Thanh toán ngay</div>
              </div>
            </div>

            <button class="btn-buy-now">Mua ngay</button>
          </form>
        </div>

        <!-- RIGHT -->
        <div class="selected-products card">
          <h2>Sản phẩm đã chọn</h2>

          <div
            class="product-item"
            v-if="product && selectedVariant && productInfo"
          >
            <div class="product-img">
              <img :src="selectedVariant.hinhAnhUrls?.[0] || product.hinhAnh" />
            </div>

            <div class="product-details">
              <h3>{{ product.tenSp }}</h3>
              <p>Màu: {{ selectedVariant.mauSacList?.[0]?.tenMauSac }}</p>
              <p>Size: {{ selectedVariant.kichCoList?.[0] }}</p>
              <p>Giá: {{ formatPrice(selectedVariant.giaBan) }}</p>
              <p>Số lượng: {{ productInfo.quantity }}</p>
            </div>
          </div>

          <div class="voucher-section">
            <label>Nhập mã phiếu giảm giá</label>
            <div class="voucher-input-group">
              <input type="text" />
              <button type="button">Áp dụng</button>
            </div>
          </div>

          <div class="price-summary">
            <div class="summary-line">
              <span>Tiền hàng</span>
              <span>{{ formatPrice(totalPrice) }}</span>
            </div>

            <div class="summary-line">
              <span>Phí giao hàng</span>
              <span>{{ formatPrice(shipFee) }}</span>
            </div>

            <hr />

            <div class="summary-line total">
              <span>Tổng số tiền</span>
              <span>{{ formatPrice(totalPrice + shipFee) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from "../../layout/header/Header.vue";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();

const product = ref(null);
const selectedVariant = ref(null);
const productInfo = ref(null);

const shipFee = 20000;

// format tiền
const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v) + " VND";

// tổng tiền
const totalPrice = computed(() => {
  if (!selectedVariant.value || !productInfo.value) return 0;
  return selectedVariant.value.giaBan * productInfo.value.quantity;
});

onMounted(async () => {
  const { productId, variantId, quantity } = route.query;
  if (!productId || !variantId) return;

  productInfo.value = {
    quantity: parseInt(quantity, 10),
  };

  const res = await axios.get(
    `http://localhost:8080/api/san-pham/${productId}`,
  );

  product.value = res.data;

  selectedVariant.value = product.value.bienTheList.find(
    (b) => b.id == variantId,
  );
});
</script>

<style scoped>
.payment-page {
  /* max-width: 1200px; */
  margin: 0 auto;
  padding: 20px;
  background-color: #fcfcfc;
  color: #4a3427; /* Màu chữ nâu đậm */
}

.title-banner {
  background: #fff;
  border: 1px solid #eee;
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 25px;
}

.title-banner h1 {
  font-size: 20px;
  margin: 0;
}

.payment-container {
  display: flex;
  gap: 25px;
  align-items: flex-start;
}

.card {
  background-color: #fff;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.customer-info {
  width: 60%;
}
.selected-products {
  width: 40%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.btn-select-address {
  background-color: #d2b48c;
  font-size: 12px;
  padding: 6px 12px;
}

/* Form Styles */
.form-group {
  margin-bottom: 15px;
}
.form-row {
  display: flex;
  gap: 10px;
}
.col {
  flex: 1;
}

label {
  display: block;
  font-size: 14px;
  margin-bottom: 6px;
  font-weight: 500;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}

/* Payment Methods */
.method-options {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.method-box {
  flex: 1;
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  font-size: 13px;
}

.method-box.active {
  border-color: #c5a27d;
  background-color: #fdfaf7;
}

.btn-buy-now {
  width: 100%;
  padding: 15px;
  background-color: #c5a27d;
  font-size: 16px;
  font-weight: bold;
  margin-top: 20px;
}

/* Right Column Styles */
.product-item {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.product-img img {
  width: 90px;
  height: 110px;
  object-fit: cover;
  border-radius: 6px;
}

.product-details h3 {
  font-size: 15px;
  margin: 0 0 5px 0;
}

.product-details p {
  font-size: 13px;
  margin: 2px 0;
  color: #666;
}

.mini-pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin: 15px 0;
}

.mini-pagination button {
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  padding: 2px 8px;
}

.mini-pagination button.active {
  background: #4a3427;
  color: #fff;
}

.voucher-input-group {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.voucher-input-group button {
  white-space: nowrap;
}

/* Price Summary Table-like */
.price-summary {
  margin-top: 25px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.discount {
  color: #e74c3c;
}
.total {
  font-weight: bold;
  font-size: 16px;
}
.pay-final {
  font-weight: normal;
  color: #888;
}

hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 15px 0;
}

button {
  transition: opacity 0.2s;
}

button:hover {
  opacity: 0.9;
}
</style>
