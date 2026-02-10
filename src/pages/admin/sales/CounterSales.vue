<template>
  <div class="pos-page">
    <div class="top-header">
      <h3 class="page-title">BÁN HÀNG TẠI QUẦY</h3>

      <button class="btn-create" @click="createOrder">+ Tạo đơn hàng</button>
    </div>
    <div v-if="orders.length" class="pos-card">
      <div class="order-tabs" v-if="orders.length">
        <div
          v-for="(o, index) in orders"
          :key="o.id"
          class="order-tab"
          :class="{ active: index === activeOrderIndex }"
          @click="activeOrderIndex = index"
        >
          <span>Đơn {{ index + 1 }}</span>

          <!-- nút xoá -->
          <span class="tab-close" @click.stop="removeOrder(index)"> ✕ </span>
        </div>
      </div>

      <!-- ================= MAIN LAYOUT ================= -->
      <div v-if="currentOrder" class="main-layout">
        <!-- ===== LEFT: DANH SÁCH SẢN PHẨM ===== -->
        <div class="product-section">
          <div class="section-header">
            <span class="section-title">SẢN PHẨM</span>
            <div class="actions">
              <button class="btn-outline">Quét QR sản phẩm</button>
              <button class="btn-primary" @click="openProductPopup">
                Chọn sản phẩm
              </button>
            </div>
          </div>

          <div class="product-list">
            <div
              v-for="(item, index) in currentOrder.cart"
              :key="index"
              class="product-row"
            >
              <!-- checkbox -->
              <input type="checkbox" />

              <!-- ảnh -->
              <img :src="item.image" class="product-img" />

              <!-- thông tin -->
              <div class="product-info">
                <div class="name">{{ item.name }}</div>
                <div class="meta">Size: {{ item.size || "L" }}</div>
              </div>

              <!-- giá -->
              <div class="price">
                <del>{{ formatPrice(item.oldPrice || item.price) }}</del>
                <span class="sale">{{ formatPrice(item.price) }}</span>
              </div>

              <!-- số lượng -->
              <div class="qty">
                <button @click="item.quantity--" :disabled="item.quantity <= 1">
                  −
                </button>
                <span>{{ item.quantity }}</span>
                <button @click="item.quantity++">+</button>
              </div>

              <!-- tổng -->
              <div class="total">
                {{ formatPrice(item.price * item.quantity) }}
              </div>

              <!-- xoá -->
              <button class="btn-danger" @click="removeItem(index)">X</button>
            </div>
          </div>
        </div>

        <!-- ===== RIGHT: THÔNG TIN ===== -->
        <div class="right-panel">
          <div class="right-grid">
            <!-- ===== THÔNG TIN KHÁCH HÀNG ===== -->
            <div class="info-box">
              <div class="section-header">
                <span>THÔNG TIN KHÁCH HÀNG</span>
                <button class="btn-outline" @click="openCustomerPopup">
                  Chọn khách hàng
                </button>
              </div>

              <div class="customer-form">
                <!-- HÀNG 1 -->
                <div class="form-row">
                  <div class="form-item">
                    <label>Tên khách hàng</label>
                    <input
                      v-model="currentOrder.customer.name"
                      placeholder="Nhập tên khách hàng"
                    />
                  </div>

                  <div class="form-item">
                    <label>Email</label>
                    <input
                      v-model="currentOrder.customer.email"
                      placeholder="Nhập email"
                    />
                  </div>
                </div>

                <!-- HÀNG 2 -->
                <div class="form-row">
                  <div class="form-item">
                    <label>Số điện thoại</label>
                    <input
                      v-model="currentOrder.customer.phone"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div class="form-item">
                    <label>Địa chỉ cụ thể</label>
                    <input
                      v-model="currentOrder.customer.address"
                      placeholder="Số nhà, đường..."
                    />
                  </div>
                </div>

                <!-- HÀNG 3 -->
                <div class="form-row">
                  <div class="form-item">
                    <label>Tỉnh / Thành phố</label>
                    <select v-model="currentOrder.customer.province">
                      <option value="">Chọn tỉnh thành phố</option>
                      <option
                        v-for="p in provinces"
                        :key="p.code"
                        :value="p.code"
                      >
                        {{ p.name }}
                      </option>
                    </select>
                  </div>

                  <div class="form-item">
                    <label>Quận / Huyện</label>
                    <select v-model="currentOrder.customer.district">
                      <option value="">Chọn quận huyện</option>
                      <option
                        v-for="d in districts"
                        :key="d.code"
                        :value="d.code"
                      >
                        {{ d.name }}
                      </option>
                    </select>
                  </div>

                  <div class="form-item">
                    <label>Xã / Phường</label>
                    <select v-model="currentOrder.customer.ward">
                      <option value="">Chọn xã phường</option>
                      <option v-for="w in wards" :key="w.code" :value="w.code">
                        {{ w.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- ===== THÔNG TIN THANH TOÁN ===== -->
            <div class="info-box payment-box">
              <div class="section-header">
                <span>THÔNG TIN THANH TOÁN</span>
              </div>

              <!-- MÃ GIẢM GIÁ -->
              <div class="voucher-row">
                <input v-model="voucherCode" placeholder="Mã giảm giá" />
                <button class="btn-outline" @click="applyVoucher">
                  Áp dụng
                </button>
              </div>

              <!-- THÔNG BÁO -->
              <div v-if="appliedVoucher" class="voucher-success">
                Áp dụng thành công phiếu giảm giá
                <b>{{ appliedVoucher.message }}</b>
              </div>

              <!-- CHI TIẾT TIỀN -->
              <div class="payment-row">
                <span>Tiền hàng</span>
                <span>{{ formatPrice(subTotal) }}</span>
              </div>

              <div class="payment-row">
                <span>Phí vận chuyển</span>
                <span>{{ formatPrice(0) }}</span>
              </div>

              <div class="payment-row">
                <span>Giảm giá</span>
                <span class="text-red"> - {{ formatPrice(discount) }} </span>
              </div>

              <hr />

              <div class="payment-row total">
                <span>Tổng số tiền</span>
                <span>{{ formatPrice(total) }}</span>
              </div>

              <div class="payment-row">
                <span>Khách thanh toán</span>
                <span>0 ₫</span>
              </div>

              <div class="payment-row text-red">
                <span>Tiền thừa</span>
                <span>{{ formatPrice(total) }}</span>
              </div>

              <button class="btn-submit big">XÁC NHẬN ĐẶT HÀNG</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= POPUP CHỌN KHÁCH HÀNG ================= -->
      <div class="modal-overlay" v-if="showCustomerPopup">
        <div class="modal">
          <div class="modal-header">
            <h4>CHỌN KHÁCH HÀNG</h4>
            <button class="btn-close" @click="showCustomerPopup = false">
              Đóng
            </button>
          </div>

          <div class="modal-body">
            <input
              class="search-input"
              placeholder="Tìm theo tên, email, số điện thoại"
            />

            <table class="table">
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
                <tr v-for="(c, index) in customers" :key="c.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ c.tenKhachHang }}</td>
                  <td>{{ c.email }}</td>
                  <td>{{ c.soDienThoai }}</td>
                  <td>{{ c.diaChiChinh }}</td>
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

      <!-- ================= POPUP CHỌN SẢN PHẨM ================= -->
      <div class="modal-overlay" v-if="showProductPopup">
        <div class="modal large">
          <div class="modal-header">
            <h4>CHỌN SẢN PHẨM</h4>
            <button class="btn-close" @click="showProductPopup = false">
              Đóng
            </button>
          </div>

          <div class="modal-body">
            <div class="filter-row">
              <input placeholder="Tìm theo mã, tên sản phẩm" />
              <select>
                <option>Màu sắc</option>
              </select>
              <select>
                <option>Kích cỡ</option>
              </select>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã SP</th>
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>Màu</th>
                  <th>Size</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, index) in products" :key="p.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ p.code }}</td>
                  <td>
                    <img :src="p.image" class="thumb" />
                  </td>
                  <td>{{ p.name }}</td>
                  <td>{{ p.color }}</td>
                  <td>{{ p.size }}</td>
                  <td>{{ p.stock }}</td>
                  <td>{{ formatPrice(p.price) }}</td>
                  <td>
                    <button class="btn-primary" @click="addToCart(p)">
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const showProductPopup = ref(false);
const showCustomerPopup = ref(false);
const orders = ref([]);
const activeOrderIndex = ref(-1);
const MAX_ORDER = 5;

import axios from "axios";

const customers = ref([]);

const fetchCustomers = async () => {
  const res = await axios.get("http://localhost:8080/api/khach-hang");
  customers.value = res.data.content;
};

const openCustomerPopup = async () => {
  await fetchCustomers();
  showCustomerPopup.value = true;
};

const products = ref([]);

const fetchProducts = async () => {
  const res = await axios.get("http://localhost:8080/api/pos/san-pham");

  products.value = res.data.map((p) => ({
    id: p.id,
    code: p.maSp,
    name: p.tenSp,
    image: p.hinhAnh,
    price: p.giaBan,
    stock: p.soLuongTon,
    color: p.mauSac,
    size: p.kichCo,
  }));
};

const openProductPopup = async () => {
  await fetchProducts();
  showProductPopup.value = true;
};

const currentOrder = computed(
  () => orders.value[activeOrderIndex.value] || null,
);

const addToCart = (product) => {
  const cart = currentOrder.value.cart;

  const exist = cart.find((i) => i.id === product.id);
  if (exist) exist.quantity++;
  else cart.push({ ...product, quantity: 1 });

  showProductPopup.value = false;
};

const removeItem = (index) => {
  currentOrder.value.cart.splice(index, 1);
};

const isSettingAddress = ref(false);

const selectCustomer = async (c) => {
  const res = await axios.get(`http://localhost:8080/api/khach-hang/${c.id}`);
  const kh = res.data;

  currentOrder.value.customer.name = kh.tenKhachHang || "";
  currentOrder.value.customer.email = kh.email || "";
  currentOrder.value.customer.phone = kh.soDienThoai || "";

  const diaChi = kh.listDiaChi.find((d) => d.macDinh);
  if (!diaChi) return;

  if (!provinces.value.length) {
    await fetchProvinces();
  }

  isSettingAddress.value = true;

  currentOrder.value.customer.address = diaChi.diaChiCuThe;

  const province = provinces.value.find((p) =>
    p.name.includes(diaChi.thanhPho),
  );
  if (!province) return;

  currentOrder.value.customer.province = province.code;

  const resDistrict = await axios.get(
    `https://provinces.open-api.vn/api/p/${province.code}?depth=2`,
  );
  districts.value = resDistrict.data.districts;

  const district = districts.value.find((d) => d.name.includes(diaChi.quan));
  if (!district) return;

  currentOrder.value.customer.district = district.code;

  const resWard = await axios.get(
    `https://provinces.open-api.vn/api/d/${district.code}?depth=2`,
  );
  wards.value = resWard.data.wards;

  const ward = wards.value.find((w) => w.name.includes(diaChi.phuong));
  if (!ward) return;

  currentOrder.value.customer.ward = ward.code;

  isSettingAddress.value = false;
  showCustomerPopup.value = false;
};

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

const fetchProvinces = async () => {
  const res = await axios.get("https://provinces.open-api.vn/api/p/");
  provinces.value = res.data;
};

const fetchDistricts = async (provinceName) => {
  const province = provinces.value.find((p) => p.name === provinceName);

  if (!province) return;

  const res = await axios.get(
    `https://provinces.open-api.vn/api/p/${province.code}?depth=2`,
  );

  districts.value = res.data.districts;
};

const fetchWards = async (districtName) => {
  const district = districts.value.find((d) => d.name === districtName);

  if (!district) return;

  const res = await axios.get(
    `https://provinces.open-api.vn/api/d/${district.code}?depth=2`,
  );

  wards.value = res.data.wards;
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

const formatPrice = (v) => {
  if (v === null || v === undefined) return "0 ₫";
  return Number(v).toLocaleString("vi-VN") + " ₫";
};
const createOrder = async () => {
  if (orders.value.length >= MAX_ORDER) {
    alert("Tối đa 5 đơn hàng thôi 😅");
    return;
  }

  await fetchProvinces();

  const newOrder = {
    id: Date.now(),
    cart: [],
    customer: {
      name: "",
      email: "",
      phone: "",
      address: "",
      ward: "",
      district: "",
      province: "",
    },
  };

  orders.value.push(newOrder);
  activeOrderIndex.value = orders.value.length - 1;
};

const removeOrder = (index) => {
  orders.value.splice(index, 1);

  if (!orders.value.length) {
    activeOrderIndex.value = -1;
    return;
  }

  if (activeOrderIndex.value >= orders.value.length) {
    activeOrderIndex.value = orders.value.length - 1;
  }
};

const voucherCode = ref("");
const appliedVoucher = ref(null);

const applyVoucher = () => {
  if (voucherCode.value === "PGG10") {
    appliedVoucher.value = {
      code: "PGG10",
      percent: 10,
      message: "Giảm 10% cho đơn hàng đầu tiên",
    };
  } else {
    appliedVoucher.value = null;
    alert("Mã giảm giá không hợp lệ");
  }
};

const discount = computed(() => {
  if (!appliedVoucher.value) return 0;
  return (subTotal.value * appliedVoucher.value.percent) / 100;
});

const total = computed(() => subTotal.value - discount.value);
</script>

<style scoped>
.pos-page {
  background: #f7f7f7;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-top: 1px;
  margin-bottom: 16px;
  color: #333;
}
/* ===== HEADER PANEL ===== */
.top-header {
  background: #fff;
  border-radius: 10px;
  padding: 14px 18px;
  border: 1px solid #e5e5e5;

  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.btn-create {
  background: linear-gradient(90deg, #c89b6d, #6b3f23);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-create:hover {
  opacity: 0.9;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
}

.main-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* CARD CHUNG */
.info-box,
.product-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e5e5;
}

/* HEADER CARD */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

/* ACTIONS */
.actions {
  display: flex;
  gap: 8px;
}

/* BUTTON */
.btn-primary {
  background: linear-gradient(90deg, #c89b6d, #6b3f23);
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
}

.btn-outline {
  border: 1px solid #c89b6d;
  background: #fff;
  color: #6b3f23;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
}

.btn-danger {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
}

/* TABLE */
.table th {
  font-size: 13px;
  color: #666;
  font-weight: 600;
}

.table td {
  font-size: 13px;
}

/* BOTTOM LAYOUT */
.bottom-layout {
  display: grid;
  grid-template-columns: 2fr 1.2fr;
  gap: 16px;
}

/* PAYMENT */
.payment-row {
  font-size: 14px;
}

.payment-row.total {
  font-size: 16px;
  color: #c0392b;
}

.btn-submit {
  margin-top: 12px;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: linear-gradient(90deg, #c89b6d, #6b3f23);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border: none;
  outline: none;
}
.popup-content {
  background: #fff;
  padding: 20px;
  width: 800px;
  border-radius: 10px;
}
/* ================= MODAL OVERLAY ================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.25s ease;
}

/* ================= MODAL BOX ================= */
.modal {
  width: 1100px;
  max-width: 95vw;
  max-height: 85vh;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.modal.large {
  width: 1300px;
}

/* ================= HEADER ================= */
.modal-header {
  padding: 14px 20px;
  background: #f7f2ee;
  border-bottom: 1px solid #e5d6c8;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #7b4a2f;
}

/* ================= BODY ================= */
.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
}

/* ================= CLOSE BUTTON ================= */
.btn-close {
  background: #c8a27a;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-close:hover {
  background: #b08b63;
}

/* ================= FILTER ROW ================= */
.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.filter-row input,
.filter-row select {
  height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid #d8c6b5;
  outline: none;
}

.filter-row input:focus,
.filter-row select:focus {
  border-color: #c49a6c;
}

/* ================= SEARCH INPUT ================= */
.search-input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid #d8c6b5;
  margin-bottom: 14px;
  outline: none;
}

.search-input:focus {
  border-color: #c49a6c;
}

/* ================= TABLE ================= */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th {
  background: #faf6f3;
  color: #6b4226;
  font-weight: 600;
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #e3d5c8;
}

.table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.table th,
.table td {
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
}

.table tr:hover {
  background: #fff7f1;
}

.modal .table td {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table td img.thumb {
  display: block;
  margin: 0 auto;
}

.table td {
  white-space: nowrap;
}

.table th,
.table td {
  padding: 12px 10px;
}

/* ================= IMAGE ================= */
.thumb {
  width: 48px;
  height: auto;
  border-radius: 6px;
  border: 1px solid #ddd;
}

/* ================= BUTTONS ================= */
.btn-primary {
  background: #c49a6c;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-primary:hover {
  background: #b0855d;
}

.btn-outline {
  background: #fff;
  border: 1px solid #c49a6c;
  color: #c49a6c;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-outline:hover {
  background: #c49a6c;
  color: #fff;
}

.customer-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-row:last-child {
  grid-template-columns: 1fr 1fr 1fr;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 13px;
  font-weight: 600;
  color: #4a2f1b;
}

.form-item input,
.form-item select {
  height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid #c8a27a;
  font-size: 13px;
  outline: none;
  background: #fff;
}

.form-item input:focus,
.form-item select:focus {
  border-color: #6b3f23;
  box-shadow: 0 0 0 1px rgba(107, 63, 35, 0.2);
}

.right-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.product-list {
  display: flex;
  flex-direction: column;
}

.product-row {
  display: grid;
  grid-template-columns: 30px 70px 1.5fr 1fr 120px 140px 80px 40px;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.product-img {
  width: 60px;
  border-radius: 8px;
}

.product-info .name {
  font-weight: 600;
  font-size: 14px;
}

.product-info .meta {
  font-size: 12px;
  color: #777;
}

.price {
  font-size: 13px;
}

.price del {
  display: block;
  color: #999;
}

.price .sale {
  color: red;
  font-weight: 600;
}

.qty {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #c49a6c;
  background: #fff;
  cursor: pointer;
}

.qty span {
  min-width: 20px;
  text-align: center;
}

.total {
  color: red;
  font-weight: 600;
}

.btn-danger {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
}

/* ================= ANIMATION ================= */
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
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
/* ===== CARD CHA ===== */
.pos-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
}

/* ===== TAB BAR ===== */
.order-tabs {
  display: flex;
  background: #f7f7f7;
  border-bottom: 1px solid #e5e5e5;
  padding: 0 12px;
  gap: 0; /* QUAN TRỌNG */
  margin: 0; /* QUAN TRỌNG */
}

/* ===== TAB ===== */
.order-tab {
  background: #e7e7e7;
  padding: 10px 18px;

  border: 1px solid transparent;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;

  margin-right: 2px;

  display: flex;
  align-items: center;
  gap: 8px;

  cursor: pointer;
  transition: all 0.15s ease;
}
.order-tab.active {
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

/* hover */
.order-tab:hover {
  background: #ddd;
}

/* ===== ACTIVE (mấu chốt) ===== */
.order-tab.active {
  background: #fff;

  border: 1px solid #e5e5e5;
  border-bottom: 1px solid #fff; /* DÍNH LIỀN CONTENT */

  font-weight: 600;

  margin-bottom: -1px; /* trick dính */
}

/* close */
.tab-close {
  font-size: 12px;
  opacity: 0.6;
}

.tab-close:hover {
  opacity: 1;
}

/* content */
.main-layout {
  padding: 16px;
}
.payment-box {
  font-size: 14px;
}

.voucher-row {
  display: grid;
  grid-template-columns: 1fr 80px;
  gap: 8px;
  margin-bottom: 8px;
}

.voucher-row input {
  height: 36px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.voucher-percent {
  text-align: center;
}

.voucher-success {
  background: #e9f7ef;
  color: #2e7d32;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 10px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  margin: 6px 0;
}

.payment-row.total {
  font-size: 18px;
  font-weight: 700;
  color: #d32f2f;
}

.text-red {
  color: #d32f2f;
  font-weight: 600;
}

.payment-box hr {
  border: none;
  border-top: 1px dashed #ddd;
  margin: 10px 0;
}

.btn-submit.big {
  margin-top: 12px;
  height: 42px;
  font-size: 15px;
  border-radius: 20px;
  border: none;
}
</style>
