<template>
  <div>
    <Header></Header>

    <div class="payment-page">
      <div class="title-banner">
        <h1>Thông tin thanh toán</h1>
      </div>

      <div class="payment-container">
        <!-- LEFT -->
        <div class="customer-info card">
          <div class="card-header">
            <h2>THÔNG TIN KHÁCH HÀNG</h2>
            <button
              type="button"
              class="btn-select-address"
              @click="openCustomerModal"
            >
              Chọn khách hàng
            </button>
          </div>

          <form @submit.prevent>
            <div class="form-group">
              <label>Tên khách hàng</label>
              <input
                v-model="form.tenKhachHang"
                type="text"
                placeholder="Nhập tên khách hàng"
              />
            </div>

            <div class="form-group">
              <label>Số điện thoại</label>
              <input
                v-model="form.soDienThoai"
                type="text"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="Nhập email"
              />
            </div>

            <div class="form-row">
              <div class="form-group col">
                <label>Xã/Phường</label>
                <select v-model="form.phuong">
                  <option :value="form.phuong">
                    {{ form.phuong || "Chọn xã phường" }}
                  </option>
                </select>
              </div>
              <div class="form-group col">
                <label>Quận/Huyện</label>
                <select v-model="form.quan">
                  <option :value="form.quan">
                    {{ form.quan || "Chọn quận huyện" }}
                  </option>
                </select>
              </div>
              <div class="form-group col">
                <label>Tỉnh/Thành phố</label>
                <select v-model="form.thanhPho">
                  <option :value="form.thanhPho">
                    {{ form.thanhPho || "Chọn tỉnh thành phố" }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Địa chỉ cụ thể</label>
              <input
                v-model="form.diaChiCuThe"
                type="text"
                placeholder="Nhập địa chỉ cụ thể"
              />
            </div>

            <div class="form-group">
              <label>Ghi chú</label>
              <textarea
                v-model="form.ghiChu"
                rows="3"
                placeholder="Nhập ghi chú"
              ></textarea>
            </div>

            <div class="payment-methods">
              <label>Phương thức thanh toán</label>
              <div class="method-options">
                <div
                  class="method-box"
                  :class="{ active: paymentMethod === 'COD' }"
                  @click="paymentMethod = 'COD'"
                >
                  <img
                    src="/src/assets/icon/money-dollar-svgrepo-com.svg"
                    style="width: 30px; height: 30px"
                  />
                  Thanh toán khi nhận hàng
                </div>

                <div
                  class="method-box"
                  :class="{ active: paymentMethod === 'ONLINE' }"
                  @click="paymentMethod = 'ONLINE'"
                >
                  <img
                    src="/src/assets/icon/image 56.png"
                    style="width: 30px; height: 30px"
                  />
                  Thanh toán ngay
                </div>
              </div>
            </div>

            <button class="btn-buy-now">Mua ngay</button>
          </form>
        </div>

        <!-- RIGHT -->
        <div class="selected-products card">
          <h2 class="section-title">Sản phẩm đã chọn</h2>

          <div
            class="product-box"
            v-if="product && selectedVariant && productInfo"
          >
            <div class="product-img">
              <img :src="selectedVariant.hinhAnhUrls?.[0] || product.hinhAnh" />
            </div>

            <div class="product-info">
              <h3 class="product-name">{{ product.tenSp }}</h3>
              <p>Kích cỡ: {{ selectedVariant.kichCoList?.[0] }}</p>
              <p>Giá: {{ formatPrice(selectedVariant.giaBan) }}</p>
              <p>Số lượng: {{ productInfo.quantity }}</p>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Voucher -->
          <div class="voucher-section">
            <label>Nhập mã phiếu giảm giá</label>
            <div class="voucher-input-group">
              <input type="text" placeholder="Nhập mã..." />
              <button type="button">Áp dụng</button>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Summary -->
          <div class="price-summary">
            <div class="summary-line">
              <span>Tiền hàng</span>
              <span>{{ formatPrice(totalPrice) }}</span>
            </div>

            <div class="summary-line">
              <span>Phí giao hàng</span>
              <span>{{ formatPrice(shipFee) }}</span>
            </div>

            <div class="summary-line total">
              <span>Tổng số tiền</span>
              <span>{{ formatPrice(totalPrice + shipFee) }}</span>
            </div>

            <div class="summary-line pay-final">
              <span>Khách thanh toán</span>
              <span>{{ formatPrice(totalPrice + shipFee) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <transition name="fade-modal">
    <div
      v-if="showCustomerModal"
      class="modal-overlay"
      @click.self="showCustomerModal = false"
    >
      <div class="customer-modal">
        <!-- HEADER -->
        <div class="modal-header">
          <h3>CHỌN KHÁCH HÀNG</h3>
          <button class="btn-close" @click="showCustomerModal = false">
            Đóng
          </button>
        </div>

        <!-- SEARCH -->
        <div class="modal-search">
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="Tìm theo tên, email, số điện thoại"
          />
        </div>

        <!-- TABLE -->
        <div class="modal-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên khách hàng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in filteredCustomers"
                :key="item.diaChi.id"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ item.tenKhachHang }}</td>
                <td>{{ item.email }}</td>
                <td>{{ item.soDienThoai }}</td>
                <td>
                  {{ item.diaChi.diaChiCuThe }}, {{ item.diaChi.phuong }},
                  {{ item.diaChi.quan }},
                  {{ item.diaChi.thanhPho }}
                </td>
                <td>
                  <button class="btn-choose" @click="selectAddress(item)">
                    Chọn
                  </button>
                </td>
              </tr>

              <tr v-if="filteredCustomers.length === 0">
                <td colspan="6" class="no-data">Không tìm thấy khách hàng</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </transition>
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
const showCustomerModal = ref(false);
const searchKeyword = ref("");
const customerList = ref([]);
const paymentMethod = ref("COD");

// mở modal
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
      .map((d) => ({
        ...customer.value,
        diaChi: d,
      })) || []
  );
});

// format địa chỉ
const formatAddress = (customer) => {
  const defaultAddress = customer.listDiaChi?.find((d) => d.macDinh);
  if (!defaultAddress) return "Chưa có địa chỉ";

  return `${defaultAddress.diaChiCuThe}, ${defaultAddress.phuong}, ${defaultAddress.quan}, ${defaultAddress.thanhPho}`;
};

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

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v) + " VND";

const totalPrice = computed(() => {
  if (!selectedVariant.value || !productInfo.value) return 0;
  return selectedVariant.value.giaBan * productInfo.value.quantity;
});

/* ======================
   CUSTOMER SECTION
====================== */

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    customer.value = res.data;
    listDiaChi.value = res.data.listDiaChi || [];

    // Fill thông tin cơ bản
    form.value.tenKhachHang = res.data.tenKhachHang || "";
    form.value.soDienThoai = res.data.soDienThoai || "";
    form.value.email = res.data.email || "";

    // 🔥 TỰ ĐỘNG CHỌN ĐỊA CHỈ MẶC ĐỊNH
    if (listDiaChi.value.length > 0) {
      const defaultAddress =
        listDiaChi.value.find((d) => d.macDinh === true) || listDiaChi.value[0]; // nếu không có macDinh thì lấy cái đầu

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

const openAddressModal = async () => {
  if (!customer.value) {
    await fetchCustomer();
  }
  showAddressModal.value = true;
};

const selectAddress = (item) => {
  customer.value = item;

  form.value.tenKhachHang = item.tenKhachHang;
  form.value.soDienThoai = item.soDienThoai;
  form.value.email = item.email;

  setAddressToForm(item.diaChi);

  showCustomerModal.value = false;
};

/* ======================
   PRODUCT SECTION
====================== */

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
onMounted(async () => {
  await fetchCustomer(); // 🔥 thêm dòng này

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
  height: 40px; /* 👈 bằng input */
  padding: 0 16px; /* ngang vừa tay */
  border: 1px solid #ccc;
  border-radius: 10px; /* 👈 bo y hệt */
  background: #fff;
  cursor: pointer;

  font-size: 14px;
  font-weight: 600;
  color: #484848;

  display: flex;
  align-items: center;
  gap: 6px;
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
  width: 98%;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.method-box.active {
  border-color: #6b3f23;
  background-color: #fdfaf7;
}

.btn-buy-now {
  width: 100%;
  padding: 15px;
  background: linear-gradient(90deg, #c89b6d 0%, #6b3f23 100%);
  font-size: 16px;
  font-weight: bold;
  margin-top: 20px;
  color: white;
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
  height: 40px; /* 👈 bằng input */
  padding: 0 16px; /* ngang vừa tay */
  border: 1px solid #ccc;
  border-radius: 10px; /* 👈 bo y hệt */
  background: #fff;
  cursor: pointer;

  font-size: 14px;
  font-weight: 600;
  color: #484848;

  display: flex;
  align-items: center;
  gap: 6px;
  width: 92px;
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
/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

/* Modal box */
.customer-modal {
  width: 1100px;
  background: #f6f2ee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #ede7e1;
  border-bottom: 1px solid #ddd;
}

.modal-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
}

.btn-close {
  background: #c5a27d;
  border: none;
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

/* Search */
.modal-search {
  padding: 15px 20px;
}

.modal-search input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

/* Table */
.modal-table {
  max-height: 350px;
  overflow-y: auto;
  padding: 0 20px 20px 20px;
}

.modal-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.modal-table th {
  text-align: left;
  background: #f1ece7;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.modal-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.modal-table tr:hover {
  background: #f9f6f3;
}

/* Choose button */
.btn-choose {
  background: #c5a27d;
  border: none;
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

.no-data {
  text-align: center;
  padding: 15px;
  color: #888;
}
.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}

/* Product Box */
.product-box {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.product-img img {
  width: 90px;
  height: 110px;
  object-fit: cover;
  border-radius: 6px;
}

.product-info {
  font-size: 14px;
}

.product-name {
  font-weight: 600;
  margin-bottom: 6px;
}

.product-info p {
  margin: 3px 0;
  color: #444;
}

/* Divider line */
.divider {
  border-top: 1px solid #e5e5e5;
  margin: 18px 0;
}

/* Voucher */
.voucher-section label {
  font-size: 13px;
  font-weight: 500;
}

.voucher-input-group {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.voucher-input-group input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

/* Summary */
.price-summary {
  font-size: 14px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.total {
  font-weight: bold;
  font-size: 15px;
}

.pay-final {
  color: #666;
}
</style>
