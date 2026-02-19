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
          <span class="tab-close" @click.stop="removeOrder(index)"> ✕ </span>
        </div>
      </div>
      <div v-if="currentOrder" class="main-layout">
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
              <div class="img-wrap">
                <img :src="item.image" class="product-img" />
                <span v-if="item.discountPercent > 0" class="sale-badge">
                  -{{ item.discountPercent }}%
                </span>
              </div>
              <div class="product-info">
                <div class="name">{{ item.name }}</div>
                <div class="meta">Size: {{ item.size || "L" }}</div>
              </div>
              <div class="price">
                <del>{{ formatPrice(item.oldPrice || item.price) }}</del>
                <span class="sale">{{ formatPrice(item.price) }}</span>
              </div>
              <div class="qty">
                <button @click="item.quantity--" :disabled="item.quantity <= 1">
                  −
                </button>
                <span>{{ item.quantity }}</span>
                <button @click="item.quantity++">+</button>
              </div>
              <div class="total">
                {{ formatPrice(item.price * item.quantity) }}
              </div>
              <button class="btn-danger" @click="removeItem(index)">X</button>
            </div>
          </div>
        </div>
        <div class="right-panel">
          <div class="right-grid">
            <div class="info-box">
              <div class="section-header">
                <span>THÔNG TIN KHÁCH HÀNG</span>
                <button class="btn-outline" @click="openCustomerPopup">
                  Chọn khách hàng
                </button>
              </div>
              <div class="customer-form">
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
            <div class="info-box payment-box">
              <div class="section-header">
                <span>THÔNG TIN THANH TOÁN</span>
                <div class="delivery-switch">
                  <span
                    :class="{ active: currentOrder.deliveryType === 'COUNTER' }"
                  >
                    Tại quầy
                  </span>
                  <label class="switch">
                    <input
                      type="checkbox"
                      :checked="currentOrder.deliveryType === 'DELIVERY'"
                      @change="toggleDelivery"
                    />
                    <span class="slider"></span>
                  </label>
                  <span
                    :class="{
                      active: currentOrder.deliveryType === 'DELIVERY',
                    }"
                  >
                    Giao hàng
                  </span>
                </div>
              </div>
              <div class="voucher-row">
                <input
                  v-model="currentOrder.voucherCode"
                  placeholder="Mã giảm giá"
                />
                <button class="btn-outline" @click="applyVoucher">
                  Áp dụng
                </button>
              </div>
              <div v-if="currentOrder?.appliedVoucher" class="voucher-success">
                Áp dụng thành công phiếu giảm giá
                <b>{{ currentOrder.appliedVoucher.message }}</b>
                ({{ voucherText }})
              </div>
              <div class="payment-row">
                <span>Tiền hàng</span>
                <span>{{ formatPrice(subTotal) }}</span>
              </div>
              <div class="payment-row">
                <span>Phí vận chuyển</span>
                <span>{{ formatPrice(shippingFee) }}</span>
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
              <div class="payment-row pay-action">
                <span>Khách thanh toán</span>
                <button class="pay-btn" @click="openPaymentPopup">
                  ⬜⬜ ⬜⬜
                </button>
                <div class="pay-right">
                  <span class="money">
                    {{ formatPrice(currentOrder.paidAmount || 0) }}
                  </span>
                </div>
              </div>

              <div
                v-if="currentOrder.paymentMethod === 'CASH'"
                class="payment-row text-red"
              >
                <span>Tiền thừa</span>
                <span>{{ formatPrice(changeMoney) }}</span>
              </div>
              <button class="btn-submit big" @click="confirmSubmitOrder">
                XÁC NHẬN ĐẶT HÀNG
              </button>
            </div>
          </div>
        </div>
      </div>
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
              v-model="customerSearch"
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
                <tr v-for="(c, index) in filteredCustomers" :key="c.id">
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
              <input
                v-model="searchText"
                placeholder="Tìm theo mã, tên sản phẩm"
              />

              <select v-model="filterColor">
                <option value="">Tất cả màu</option>
                <option v-for="c in colors" :key="c" :value="c">
                  {{ c }}
                </option>
              </select>

              <select v-model="filterSize">
                <option value="">Tất cả size</option>
                <option v-for="s in sizes" :key="s" :value="s">
                  {{ s }}
                </option>
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
                <tr v-for="(p, index) in filteredProducts" :key="p.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ p.code }}</td>
                  <td>
                    <div class="img-wrap small">
                      <img :src="p.image" class="thumb" />

                      <span
                        v-if="p.discountPercent > 0"
                        class="sale-badge small"
                      >
                        -{{ p.discountPercent }}%
                      </span>
                    </div>
                  </td>
                  <td>{{ p.name }}</td>
                  <td>{{ p.color }}</td>
                  <td>{{ p.size }}</td>
                  <td>{{ p.stock }}</td>
                  <td class="price-cell">
                    <del v-if="p.discountPercent > 0">
                      {{ formatPrice(p.oldPrice) }}
                    </del>
                    <span class="sale">
                      {{ formatPrice(p.price) }}
                    </span>
                  </td>
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

      <!-- ================= POPUP THANH TOÁN ================= -->
      <div class="modal-overlay" v-if="showPaymentPopup">
        <div class="modal small">
          <div class="modal-header">
            <h4>PHƯƠNG THỨC THANH TOÁN</h4>
            <button class="btn-close" @click="showPaymentPopup = false">
              Đóng
            </button>
          </div>

          <div class="modal-body payment-popup">
            <!-- chọn loại -->
            <div class="pay-type">
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

            <!-- CASH -->
            <div v-if="paymentMethod === 'CASH'" class="cash-input">
              <input
                type="number"
                v-model.number="cashInput"
                placeholder="Nhập số tiền khách đưa"
              />
            </div>

            <!-- BANK -->
            <div v-if="paymentMethod === 'BANK'" class="bank-box">
              <img :src="bankQR" class="qr-img" />

              <p class="bank-money">
                Số tiền: <b>{{ formatPrice(total) }}</b>
              </p>

              <p>TPBank</p>
              <p>STK: 00000674626</p>
            </div>

            <!-- confirm -->
            <button class="btn-submit" @click="confirmPayment">XONG</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- ===== CONFIRM MODAL ===== -->
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
          <button class="btn-cancel" @click="closeConfirmModal">Hủy</button>
          <button class="btn-confirm" @click="handleModalConfirm">
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  </transition>
  <!-- ===== TOAST ===== -->
  <div class="toast-container">
    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast', toast.type]">
        {{ toast.message }}
      </div>
    </transition>
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
const promotions = ref([]);

const fetchProducts = async () => {
  const res = await axios.get("http://localhost:8080/api/pos/san-pham");

  // tạo map: variantId -> percent
  const discountMap = {};

  promotions.value.forEach((pr) => {
    pr.chiTietSanPhamIds.forEach((id) => {
      discountMap[id] = Math.max(discountMap[id] || 0, pr.giaTriGiam);
    });
  });

  products.value = res.data.map((p) => {
    const percent = discountMap[p.id] || 0;

    const oldPrice = p.giaBan;
    const newPrice = (oldPrice * (100 - percent)) / 100;

    return {
      id: p.id,
      code: p.maSp,
      name: p.tenSp,
      image: p.hinhAnh,
      stock: p.soLuongTon,
      color: p.mauSac,
      size: p.kichCo,

      oldPrice,
      price: newPrice,
      discountPercent: percent,
    };
  });
};

const openProductPopup = async () => {
  await fetchPromotions(); // load trước
  await fetchProducts(); // dùng promotions đã có

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

const confirmSubmitOrder = () => {
  if (!currentOrder.value?.cart.length) {
    showToast("Vui lòng chọn sản phẩm trước khi đặt hàng", "error");

    return;
  }

  openConfirmModal(
    "Xác nhận đặt hàng",
    "Bạn có chắc muốn tạo đơn này không?",
    submitOrder,
  );
};

const removeItem = (index) => {
  currentOrder.value.cart.splice(index, 1);
};
const fetchPromotions = async () => {
  const res = await axios.get("http://localhost:8080/api/promotions");

  // chỉ lấy đợt đang hoạt động
  promotions.value = res.data.filter((p) => p.trangThai === 1);
};

const isSettingAddress = ref(false);

const selectCustomer = async (c) => {
  const res = await axios.get(`http://localhost:8080/api/khach-hang/${c.id}`);
  const kh = res.data;

  currentOrder.value.customer.id = c.id; // ⭐⭐ QUAN TRỌNG NHẤT

  currentOrder.value.customer.name = kh.tenKhachHang || "";
  currentOrder.value.customer.email = kh.email || "";
  currentOrder.value.customer.phone = kh.soDienThoai || "";

  const diaChi = kh.listDiaChi?.find((d) => d.macDinh) || kh.listDiaChi?.[0];

  if (!diaChi) return;

  if (!provinces.value.length) await fetchProvinces();

  isSettingAddress.value = true;

  currentOrder.value.customer.address = diaChi.diaChiCuThe;

  const province = provinces.value.find((p) =>
    p.name.toLowerCase().includes(diaChi.thanhPho.toLowerCase()),
  );

  if (!province) return;

  currentOrder.value.customer.province = province.code;

  const resDistrict = await axios.get(
    `https://provinces.open-api.vn/api/p/${province.code}?depth=2`,
  );
  districts.value = resDistrict.data.districts;

  const district = districts.value.find((d) =>
    d.name.toLowerCase().includes(diaChi.quan.toLowerCase()),
  );

  if (!district) return;

  currentOrder.value.customer.district = district.code;

  const resWard = await axios.get(
    `https://provinces.open-api.vn/api/d/${district.code}?depth=2`,
  );
  wards.value = resWard.data.wards;

  const ward = wards.value.find((w) =>
    w.name.toLowerCase().includes(diaChi.phuong.toLowerCase()),
  );

  if (!ward) return;

  currentOrder.value.customer.ward = ward.code;

  setTimeout(() => {
    isSettingAddress.value = false;
  }, 0);

  showCustomerPopup.value = false;
};

const showPaymentPopup = ref(false);

const paymentMethod = ref("CASH");
const cashInput = ref(0);

const openPaymentPopup = () => {
  paymentMethod.value = "CASH";
  cashInput.value = total.value;
  showPaymentPopup.value = true;
};

const confirmPayment = () => {
  if (!currentOrder.value) return;

  currentOrder.value.paymentMethod = paymentMethod.value;

  if (paymentMethod.value === "CASH") {
    currentOrder.value.paidAmount = cashInput.value || 0;
  } else {
    // chuyển khoản = trả đúng tiền
    currentOrder.value.paidAmount = total.value;
  }

  showPaymentPopup.value = false;
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
    alert("Tối đa 5 đơn hàng thôi ");
    return;
  }

  await fetchProvinces();

  const newOrder = {
    id: Date.now(),
    cart: [],
    customer: {
      id: null, // ⭐⭐ THÊM DÒNG NÀY
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

    // ⭐ THÊM
    deliveryType: "COUNTER", // COUNTER | DELIVERY
    shippingFee: 0,
  };
  orders.value.push(newOrder);
  activeOrderIndex.value = orders.value.length - 1;
};

const submitOrder = async () => {
  if (!currentOrder.value) return;

  try {
    const order = currentOrder.value;

    const payload = {
      loaiDon: 0,
      tongTienHang: subTotal.value,
      phiShip: shippingFee.value,
      ghiChu: "",

      maVoucher: order.voucherCode || null,

      idKhachHang: order.customer.id || null,
      idNhanVien: 1,

      sanPhamChiTiet: order.cart.map((i) => ({
        idChiTietSanPham: i.id,
        soLuong: i.quantity,
        donGia: i.price,
      })),
    };

    await axios.post("http://localhost:8080/api/hoa-don", payload);

    showToast("Tạo đơn hàng thành công");

    removeOrder(activeOrderIndex.value);
  } catch (e) {
    console.error("CREATE ORDER ERROR:", e);
    console.error("Response:", e.response);
    console.error("Data:", e.response?.data);

    showToast(e.response?.data || "Lỗi tạo đơn", "error");
  }
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
const searchText = ref("");
const filterColor = ref("");
const filterSize = ref("");
const colors = computed(() => {
  return [...new Set(products.value.map((p) => p.color).filter(Boolean))];
});

const sizes = computed(() => {
  return [...new Set(products.value.map((p) => p.size).filter(Boolean))];
});
const filteredProducts = computed(() => {
  let list = products.value;
  if (searchText.value) {
    const s = searchText.value.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s),
    );
  }
  if (filterColor.value) {
    list = list.filter((p) => p.color === filterColor.value);
  }
  if (filterSize.value) {
    list = list.filter((p) => p.size === filterSize.value);
  }

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

import { onMounted, watchEffect } from "vue";

const STORAGE_KEY = "pos_orders_state";
const isReady = ref(false);

onMounted(async () => {
  isSettingAddress.value = true;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    orders.value = data.orders || [];
    activeOrderIndex.value = data.activeOrderIndex ?? -1;
  }

  await fetchProvinces();

  // ⭐ KHÔI PHỤC DISTRICT + WARD
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
});

watchEffect(() => {
  if (!isReady.value) return; // 🚨 chặn lần đầu

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      orders: orders.value,
      activeOrderIndex: activeOrderIndex.value,
    }),
  );
});

const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};
const vouchers = ref([]);
const fetchVouchers = async () => {
  const res = await axios.get("http://localhost:8080/admin/voucher");
  vouchers.value = res.data;
};

const bankQR = computed(() => {
  if (!currentOrder.value) return "";

  const amount = total.value || 0;

  // TPBank + STK của bạn
  const bank = "tpbank";
  const account = "00000674626";

  return `https://img.vietqr.io/image/${bank}-${account}-compact.png?amount=${amount}&addInfo=POS`;
});
const applyVoucher = () => {
  if (!currentOrder.value) return;
  const code = currentOrder.value.voucherCode;
  if (!code) return;

  const found = vouchers.value.find(
    (v) => v.maPgg.toLowerCase() === code.toLowerCase(),
  );

  if (!found) {
    showToast("Mã giảm giá không tồn tại", "error");
    currentOrder.value.appliedVoucher = null;
    return;
  }

  // Log ra để kiểm tra nếu vẫn không chạy
  console.log("Voucher tìm thấy:", found);

  currentOrder.value.appliedVoucher = {
    code: found.maPgg,
    // Đảm bảo ép kiểu số cho giaTri
    percent: found.loaiGiam === "PERCENT" ? Number(found.giaTri) : 0,
    amount:
      found.loaiGiam === "AMOUNT" || found.loaiGiam === "MONEY"
        ? Number(found.giaTri)
        : 0,
    message: found.tenPgg,
  };
};

const voucherText = computed(() => {
  const v = currentOrder.value?.appliedVoucher;
  if (!v) return "";
  if (v.percent > 0) return `Giảm ${v.percent}%`;
  if (v.amount > 0) return `Giảm ${formatPrice(v.amount)}`;
  return "";
});
const discount = computed(() => {
  const v = currentOrder.value?.appliedVoucher;
  if (!v) return 0;

  let totalDiscount = 0;

  if (v.percent && v.percent > 0) {
    totalDiscount = (subTotal.value * v.percent) / 100;
  } else if (v.amount && v.amount > 0) {
    totalDiscount = v.amount;
  }

  // Không cho phép tiền giảm lớn hơn tổng tiền hàng
  return Math.min(totalDiscount, subTotal.value);
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

const setDelivery = (type) => {
  if (!currentOrder.value) return;

  currentOrder.value.deliveryType = type;

  if (type === "COUNTER") {
    currentOrder.value.shippingFee = 0;
  } else {
    currentOrder.value.shippingFee = 30000; // ⭐ default ship (bạn đổi tùy ý)
  }
};

/* ================= CONFIRM MODAL ================= */
const modal = ref({
  show: false,
  title: "",
  message: "",
  onConfirm: null,
});

const openConfirmModal = (title, message, cb) => {
  modal.value = {
    show: true,
    title,
    message,
    onConfirm: cb,
  };
};

const closeConfirmModal = () => {
  modal.value.show = false;
};

const handleModalConfirm = () => {
  modal.value.onConfirm?.();
  closeConfirmModal();
};

/* ================= TOAST ================= */
const toast = ref({
  show: false,
  message: "",
  type: "success", // success | error
});

const showToast = (msg, type = "success") => {
  toast.value.message = msg;
  toast.value.type = type;
  toast.value.show = true;

  setTimeout(() => {
    toast.value.show = false;
  }, 2500);
};

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

.modal.small {
  width: 400px;
}

.payment-popup {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pay-type {
  display: flex;
  gap: 10px;
}

.pay-type button {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #c49a6c;
  background: #fff;
  cursor: pointer;
}

.pay-type button.active {
  background: linear-gradient(90deg, #c89b6d, #6b3f23);
  color: #fff;
}

.pay-action {
  align-items: center;
}

.pay-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.money {
  font-weight: 600;
}

.pay-btn {
  width: 34px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #c49a6c;
  background: #fff;
  font-size: 10px;
  line-height: 10px;
  cursor: pointer;
  transition: 0.2s;
  padding: 2px;
}

.pay-btn:hover {
  background: #c49a6c;
  color: #fff;
}

.cash-input input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.clickable {
  cursor: pointer;
  color: #6b3f23;
  font-weight: 600;
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

.bank-box {
  text-align: center;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.qr-img {
  width: 200px;
  height: 200px;
  border-radius: 10px;
  border: 1px solid #eee;
}

.bank-money {
  font-size: 15px;
  font-weight: 600;
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
  grid-template-columns: 30px 200px 1.5fr 1fr 500px 200px 100px 40px;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.product-img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #eee;
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

.price-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  line-height: 1.2;
}

.price-cell del {
  color: #999;
  font-size: 12px;
  margin-bottom: 2px;
}

.price-cell .sale {
  color: #e53935;
  font-weight: 600;
  font-size: 13px;
}

.table td,
.table th {
  vertical-align: middle;
}

.modal .table td {
  height: 70px;
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
  gap: 0;
  /* QUAN TRỌNG */
  margin: 0;
  /* QUAN TRỌNG */
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
  border-bottom: 1px solid #fff;
  /* DÍNH LIỀN CONTENT */

  font-weight: 600;

  margin-bottom: -1px;
  /* trick dính */
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

/* ===== WRAP ẢNH ===== */
.img-wrap {
  position: relative;
  display: inline-block;
}

.img-wrap.small {
  width: fit-content;
}

/* ===== BADGE SALE ===== */
.sale-badge {
  position: absolute;
  top: 6px;
  left: 6px;

  background: #e53935;
  color: #fff;

  font-size: 12px;
  font-weight: 700;

  padding: 3px 7px;
  border-radius: 6px;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.sale-badge.small {
  font-size: 10px;
  padding: 2px 6px;
}

/* ===== DELIVERY SWITCH ===== */
.delivery-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 13px;
}

.delivery-switch span {
  color: #999;
  font-weight: 500;
  transition: 0.2s;
}

.delivery-switch span.active {
  color: #6b3f23;
  font-weight: 700;
}

/* SWITCH */
.switch {
  position: relative;
  width: 46px;
  height: 24px;
}

.switch input {
  display: none;
}

.slider {
  position: absolute;
  inset: 0;
  background: #ddd;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.25s;
}

.slider::before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  top: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.25s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
}

/* ON */
.switch input:checked + .slider {
  background: linear-gradient(90deg, #c89b6d, #6b3f23);
}

.switch input:checked + .slider::before {
  transform: translateX(22px);
}

/* ===== TOAST ===== */
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
  background-color: #dcfce7;
  color: #166534;
  font-size: 16px;
  font-weight: 500;
  border-left: 6px solid #22c55e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast.error {
  background-color: #fee2e2;
  color: #991b1b;
  border-left: 6px solid #ef4444;
}

.modal-confirm {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
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

/* Tìm đoạn này trong phần 8. MODAL & TOAST */
/* Sửa lại đoạn này */
.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #fff4e5;
  color: #ff9800;
  margin: 0 auto 15px auto;

  /* Dùng flex thay vì inline-flex để kiểm soát khung tốt hơn */
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 40px;

  /* QUAN TRỌNG: Reset line-height về 1 hoặc 0 để icon không bị đẩy lên cao */
  line-height: 1;

  /* Nếu vẫn thấy lệch, bỏ comment dòng dưới để tắt hiệu ứng nhún nhảy cho dễ căn */
  /* animation: none; */
}

/* THÊM MỚI: Đảm bảo icon bên trong không bị margin thừa */
.confirm-icon-wrapper i,
.confirm-icon-wrapper svg,
.confirm-icon-wrapper span {
  display: block;
  /* Chuyển thành block để flex căn chuẩn hơn */
  margin: 0;
  /* Xóa margin mặc định nếu có */

  /* MẸO: Nếu icon vẫn cảm giác hơi cao, hãy thêm dòng dưới để đẩy nhẹ xuống */
  /* transform: translateY(2px); */
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

.btn-confirm {
  background: #63391f;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  flex: 1;
  height: 42px;
}

.btn-confirm:hover {
  background: #4e2c17;
  box-shadow: 0 4px 10px rgba(78, 44, 23, 0.3);
}

.confirm-actions {
  display: flex;
  gap: 20px;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  flex: 1;
  height: 42px;
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
</style>
