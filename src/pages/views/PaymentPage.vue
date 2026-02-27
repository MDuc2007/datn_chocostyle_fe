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
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input
                    v-model="form.soDienThoai"
                    type="text"
                    class="form-control"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Email liên hệ</label>
                <input v-model="form.email" type="email" class="form-control" />
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
                <label>Địa chỉ cụ thể</label>
                <input
                  v-model="form.diaChiCuThe"
                  type="text"
                  class="form-control"
                />
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
                    <div class="pay-info">
                      <span class="pay-name"
                        >Thanh toán khi nhận hàng (COD)</span
                      >
                    </div>
                    <div class="radio-indicator"></div>
                  </label>
                  <label
                    class="payment-card"
                    :class="{ active: paymentMethod === 'ONLINE' }"
                    @click="paymentMethod = 'ONLINE'"
                  >
                    <div class="pay-info">
                      <span class="pay-name"
                        >Thanh toán trực tuyến (VNPAY)</span
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
              <div class="product-item" v-if="product && selectedVariant">
                <div class="product-img-wrapper">
                  <img
                    :src="selectedVariant.hinhAnhUrls?.[0] || product.hinhAnh"
                  />
                  <span class="product-qty-badge">{{
                    productInfo.quantity
                  }}</span>
                </div>
                <div class="product-detail">
                  <h3 class="product-name">{{ product.tenSp }}</h3>
                  <p class="product-meta">
                    Phân loại: {{ selectedVariant.kichCoList?.[0] }}
                  </p>
                  <div class="price-display">
                    <span v-if="promotionAmount > 0" class="old-price">{{
                      formatPrice(selectedVariant.giaBan)
                    }}</span>
                    <span class="product-price">{{
                      formatPrice(discountedUnitPrice)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="voucher-section">
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <label class="small-label mb-0">Phiếu giảm giá</label>
                <button
                  type="button"
                  class="btn-link-sm"
                  @click="showVoucherModal = true"
                >
                  {{ selectedVoucher ? "Thay đổi" : "Chọn mã" }}
                </button>
              </div>

              <div v-if="selectedVoucher" class="selected-voucher-tag">
                <span class="voucher-icon">🎟️</span>
                <div class="voucher-info">
                  <strong>{{ selectedVoucher.maPgg }}</strong>
                  <small>{{ selectedVoucher.tenPgg }}</small>
                </div>
                <button class="btn-remove-v" @click="selectedVoucher = null">
                  &times;
                </button>
              </div>
              <div
                v-else
                class="no-voucher-box"
                @click="showVoucherModal = true"
              >
                Chưa áp dụng mã giảm giá
              </div>
            </div>

            <div class="divider"></div>

            <div class="price-breakdown">
              <div class="price-row">
                <span class="label">Tạm tính:</span>
                <span class="value">{{ formatPrice(subTotal) }}</span>
              </div>
              <div class="price-row" v-if="totalPromotionDiscount > 0">
                <span class="label">Giảm giá sản phẩm:</span>
                <span class="value discount-text"
                  >- {{ formatPrice(totalPromotionDiscount) }}</span
                >
              </div>
              <div class="price-row" v-if="voucherDiscountAmount > 0">
                <span class="label">Voucher giảm giá:</span>
                <span class="value discount-text"
                  >- {{ formatPrice(voucherDiscountAmount) }}</span
                >
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
                formatPrice(finalTotal)
              }}</span>
            </div>

            <button
              type="button"
              class="btn-submit-order"
              @click="confirmOrder"
            >
              Hoàn tất đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="showVoucherModal"
        class="modal-backdrop"
        @click.self="showVoucherModal = false"
      >
        <div class="modal-dialog modal-small-custom">
          <div class="modal-header">
            <h3>Chọn phiếu giảm giá</h3>
            <button class="btn-close-modal" @click="showVoucherModal = false">
              &times;
            </button>
          </div>
          <div class="modal-body custom-scroll">
            <div v-if="availableVouchers.length > 0" class="voucher-list">
              <div
                v-for="v in availableVouchers"
                :key="v.id"
                class="v-card-modern"
                :class="{ 'v-active': selectedVoucher?.id === v.id }"
                @click="selectVoucher(v)"
              >
                <div class="v-tag-side">
                  {{ v.loaiGiam === "PERCENT" ? "%" : "VNĐ" }}
                </div>
                <div class="v-content-main">
                  <div class="v-header">
                    <span class="v-code">{{ v.maPgg }}</span>
                    <span class="v-name">{{ v.tenPgg }}</span>
                  </div>
                  <div class="v-details">
                    <p>
                      ✨ Giảm:
                      <strong>{{
                        v.loaiGiam === "PERCENT"
                          ? v.giaTri + "%"
                          : formatPrice(v.giaTri)
                      }}</strong>
                    </p>
                    <p v-if="v.giaTriToiDa">
                      📉 Tối đa:
                      <strong>{{ formatPrice(v.giaTriToiDa) }}</strong>
                    </p>
                    <p>
                      📦 Đơn tối thiểu:
                      <strong>{{
                        formatPrice(
                          v.dieueKienDonHang || v.dieuKienDonHang || 0,
                        )
                      }}</strong>
                    </p>
                    <p class="v-exp">📅 HSD: {{ v.ngayKetThuc }}</p>
                  </div>
                </div>
                <div
                  class="v-selected-icon"
                  v-if="selectedVoucher?.id === v.id"
                >
                  ✓
                </div>
              </div>
            </div>
            <div v-else class="text-center py-5">
              <p class="text-muted">Không có mã giảm giá nào khả dụng.</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

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
                placeholder="🔍 Tìm kiếm..."
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
                  <tr v-for="item in filteredCustomers" :key="item.diaChi.id">
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
            <template v-else>✕</template>
          </span>
          <span class="toast-message">{{ notif.message }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import Header from "../../layout/header/Header.vue";
import { ref, onMounted, computed, reactive, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const product = ref(null);
const selectedVariant = ref(null);
const productInfo = ref(null);
const customer = ref(null);
const availableVouchers = ref([]);
const selectedVoucher = ref(null);
const showVoucherModal = ref(false);
const promotionAmount = ref(0);

const paymentMethod = ref("COD");
const showCustomerModal = ref(false);
const searchKeyword = ref("");
const notifications = ref([]);
const modal = reactive({ show: false, title: "", message: "", action: null });

const shipFee = 20000;
const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v) + " đ";

watch(promotionAmount, (val) => {
  if (val > 0) {
    console.log(`🟢 Sản phẩm đang giảm ${val}%`);
  } else {
    console.log("🔵 Sản phẩm không có khuyến mãi");
  }
});

const fetchPromotion = async (variantId) => {
  try {
    const res = await axios.get("http://localhost:8080/api/promotions");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validPromos = res.data.filter((p) => {
      if (Number(p.trangThai) !== 1) return false;

      // FIX SO SÁNH ID
      if (!p.chiTietSanPhamIds?.some((id) => Number(id) === Number(variantId)))
        return false;

      const start = new Date(p.ngayBatDau);
      const end = new Date(p.ngayKetThuc);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return today >= start && today <= end;
    });

    if (!validPromos.length) {
      promotionAmount.value = 0;
      console.log("🔵 Không có khuyến mãi hợp lệ");
      return;
    }

    // Lấy % lớn nhất
    const bestPromo = validPromos.reduce((max, cur) =>
      Number(cur.giaTriGiam) > Number(max.giaTriGiam) ? cur : max,
    );

    promotionAmount.value = Number(bestPromo.giaTriGiam);

    console.log("📦 Variant:", variantId);
    console.log("🟢 Các đợt hợp lệ:", validPromos);
    console.log(
      `🔥 Áp dụng ${bestPromo.maDotGiamGia} - ${bestPromo.giaTriGiam}%`,
    );
  } catch (err) {
    console.error("❌ Lỗi khuyến mãi:", err);
  }
};

// 2. Logic Voucher
const fetchVouchers = async (khId) => {
  try {
    const res = await axios.get(`http://localhost:8080/admin/voucher/pos`, {
      params: { idKhachHang: khId },
    });
    availableVouchers.value = res.data;
  } catch (err) {
    console.error("Lỗi lấy danh sách voucher:", err);
  }
};

// 3. Tính toán tiền bạc
const subTotal = computed(() => {
  if (!selectedVariant.value || !productInfo.value) return 0;
  return selectedVariant.value.giaBan * productInfo.value.quantity;
});

const discountedUnitPrice = computed(() => {
  if (!selectedVariant.value) return 0;

  const price = selectedVariant.value.giaBan;
  const percent = promotionAmount.value || 0;

  return Math.round(price * (1 - percent / 100));
});

const totalPromotionDiscount = computed(() => {
  if (!selectedVariant.value || !productInfo.value) return 0;

  const price = selectedVariant.value.giaBan;
  const quantity = productInfo.value.quantity;
  const percent = promotionAmount.value || 0;

  return Math.round(price * (percent / 100) * quantity);
});

const voucherDiscountAmount = computed(() => {
  if (!selectedVoucher.value) return 0;
  const v = selectedVoucher.value;
  let discount = 0;
  const basePriceForVoucher = subTotal.value - totalPromotionDiscount.value;

  // Kiểm tra điều kiện đơn hàng
  const dieuKien = v.dieueKienDonHang || v.dieuKienDonHang || 0;
  if (basePriceForVoucher < dieuKien) return 0;

  if (v.loaiGiam === "PERCENT") {
    discount = (basePriceForVoucher * v.giaTri) / 100;
    if (v.giaTriToiDa && discount > v.giaTriToiDa) discount = v.giaTriToiDa;
  } else {
    discount = v.giaTri;
  }
  return discount;
});

const finalTotal = computed(() => {
  const total =
    subTotal.value -
    totalPromotionDiscount.value -
    voucherDiscountAmount.value +
    shipFee;

  return total > 0 ? Math.round(total) : 0;
});

const selectVoucher = (v) => {
  const basePrice = subTotal.value - totalPromotionDiscount.value;
  const dieuKien = v.dieueKienDonHang || v.dieuKienDonHang || 0;

  if (basePrice < dieuKien) {
    addNotification(
      `Đơn hàng tối thiểu ${formatPrice(dieuKien)} để sử dụng mã này`,
      "warning",
    );
    return;
  }
  selectedVoucher.value = v;
  showVoucherModal.value = false;
};

// 4. Luồng đặt hàng
const handleCheckout = async () => {
  const orderData = {
    idKhachHang: customer.value?.id,
    idNhanVien: 1,
    loaiDon: 0,
    ghiChu: form.value.ghiChu,
    tongTienHang: subTotal.value,
    phiShip: shipFee,
    maVoucher: selectedVoucher.value ? selectedVoucher.value.maPgg : "",
    sanPhamChiTiet: [
      {
        idChiTietSanPham: selectedVariant.value.id,
        soLuong: productInfo.value.quantity,
        donGia: discountedUnitPrice.value,
      },
    ],
  };

  try {
    const response = await axios.post(
      "http://localhost:8080/api/hoa-don",
      orderData,
    );
    let hoaDonId = response.data;
    if (typeof hoaDonId === "string") {
      const match = hoaDonId.match(/\d+/);
      hoaDonId = match ? parseInt(match[0]) : null;
    }

    if (paymentMethod.value === "COD") {
      addNotification("Đặt hàng thành công!");
      setTimeout(() => router.push("/"), 2000);
    } else {
      const paymentRes = await axios.post(
        "http://localhost:8080/api/vnpay/create-payment",
        null,
        {
          params: { hoaDonId },
        },
      );
      if (paymentRes.data) window.location.href = paymentRes.data;
    }
  } catch (error) {
    addNotification(error.response?.data || "Lỗi đặt hàng", "error");
  }
};

const fetchCustomer = async () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;
  const { accessToken, username } = JSON.parse(userStr);
  try {
    const res = await axios.get(
      `http://localhost:8080/api/khach-hang/email/${username}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    customer.value = res.data;
    form.value.tenKhachHang = res.data.tenKhachHang;
    form.value.soDienThoai = res.data.soDienThoai;
    form.value.email = res.data.email;
    const addr =
      res.data.listDiaChi?.find((d) => d.macDinh) || res.data.listDiaChi?.[0];
    if (addr) setAddressToForm(addr);
    await fetchVouchers(res.data.id);
  } catch (err) {
    console.error(err);
  }
};

const filteredCustomers = computed(() => {
  if (!customer.value) return [];
  const keyword = searchKeyword.value.toLowerCase();
  return (
    customer.value.listDiaChi
      ?.filter((d) => {
        return (
          customer.value.tenKhachHang?.toLowerCase().includes(keyword) ||
          customer.value.soDienThoai?.includes(keyword)
        );
      })
      .map((d) => ({ ...customer.value, diaChi: d })) || []
  );
});

const selectAddress = (item) => {
  form.value.tenKhachHang = item.tenKhachHang;
  form.value.soDienThoai = item.soDienThoai;
  setAddressToForm(item.diaChi);
  showCustomerModal.value = false;
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
    if (selectedVariant.value) await fetchPromotion(variantId);
  } catch (err) {
    console.error(err);
  }
});

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
const setAddressToForm = (a) => {
  form.value.thanhPho = a.thanhPho;
  form.value.quan = a.quan;
  form.value.phuong = a.phuong;
  form.value.diaChiCuThe = a.diaChiCuThe;
};
const openCustomerModal = () => (showCustomerModal.value = true);
const addNotification = (m, t = "success") => {
  const id = Date.now();
  notifications.value.push({ id, message: m, type: t });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 3000);
};
const confirmOrder = () => {
  if (!form.value.tenKhachHang || !form.value.soDienThoai)
    return addNotification("Thiếu thông tin!", "warning");
  modal.show = true;
  modal.action = handleCheckout;
  modal.title = "Xác nhận";
  modal.message = "Đặt đơn hàng này?";
};
const handleModalConfirm = () => {
  modal.action();
  modal.show = false;
};
const closeModal = () => (modal.show = false);
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
  border-left: 4px solid #28a745;
}
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
.price-display {
  display: flex;
  flex-direction: column;
}
.old-price {
  text-decoration: line-through;
  color: #999;
  font-size: 0.9rem;
}
.discount-text {
  color: #dc3545;
  font-weight: 600;
}
.small-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 5px;
  display: block;
}
.voucher-section {
  margin: 15px 0;
}
/* Các style cũ giữ nguyên từ file gốc của bạn */
.checkout-wrapper {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 60px;
}
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}
.checkout-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
}
.card {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  border: 1px solid #eaebec;
}
.highlight-price {
  color: #d35400;
  font-size: 22px;
  font-weight: 700;
}
.btn-link-sm {
  background: none;
  border: none;
  color: #b97a3a;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}
.no-voucher-box {
  border: 1px dashed #ced4da;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  color: #6c757d;
  cursor: pointer;
  font-size: 14px;
}
.selected-voucher-tag {
  display: flex;
  align-items: center;
  background: #fdf5eb;
  border: 1px solid #b97a3a;
  padding: 10px;
  border-radius: 8px;
  position: relative;
}
.voucher-icon {
  font-size: 20px;
  margin-right: 10px;
}
.voucher-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.voucher-info strong {
  color: #b97a3a;
  font-size: 14px;
}
.voucher-info small {
  color: #8b5a2b;
  font-size: 12px;
}
.btn-remove-v {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 0 5px;
}

/* VOUCHER CARD TRONG MODAL */
.voucher-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.voucher-card {
  display: flex;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: 0.2s;
  position: relative;
}
.voucher-card:hover {
  border-color: #b97a3a;
}
.voucher-card.active {
  border-color: #b97a3a;
  background: #fffcf9;
}
.v-left {
  background: #b97a3a;
  color: #fff;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}
.v-right {
  padding: 12px;
  flex-grow: 1;
}
.v-code {
  margin: 0;
  font-size: 16px;
  color: #333;
}
.v-desc,
.v-date {
  margin: 4px 0 0;
  font-size: 12px;
  color: #666;
}
.v-check {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #28a745;
  font-size: 18px;
}

/* HIỂN THỊ GIÁ */
.price-display {
  display: flex;
  flex-direction: column;
}
.old-price {
  text-decoration: line-through;
  color: #999;
  font-size: 13px;
}
.product-price {
  color: #d35400;
  font-weight: 700;
}
.discount-text {
  color: #dc3545;
  font-weight: 600;
}

/* GIỮ CÁC STYLE CŨ CỦA BẠN */
.checkout-wrapper {
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
  color: #333;
  padding-bottom: 60px;
}
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}
.checkout-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
}
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px;
  border: 1px solid #eaebec;
}
.highlight-price {
  color: #d35400;
  font-size: 22px;
  font-weight: 700;
}
.divider {
  border-top: 1px solid #e9ecef;
  margin: 20px 0;
}
.divider.dashed {
  border-top-style: dashed;
}
.modal-small-custom {
  max-width: 450px !important;
  width: 90%;
  border-radius: 12px;
}

/* THIẾT KẾ VOUCHER CARD MỚI */
.voucher-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.v-card-modern {
  display: flex;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: #fff;
}

.v-card-modern:hover {
  border-color: #b97a3a;
  box-shadow: 0 3px 10px rgba(185, 122, 58, 0.1);
}

.v-active {
  border-color: #b97a3a;
  background: #fffcf9;
}

.v-tag-side {
  background: #b97a3a;
  color: white;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  font-size: 14px;
}

.v-content-main {
  padding: 12px;
  flex-grow: 1;
}

.v-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  border-bottom: 1px dashed #eee;
  padding-bottom: 5px;
}

.v-code {
  font-weight: 800;
  color: #b97a3a;
  font-size: 16px;
}

.v-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.v-details p {
  margin: 2px 0;
  font-size: 12px;
  color: #666;
}

.v-details strong {
  color: #333;
}

.v-exp {
  margin-top: 5px !important;
  font-style: italic;
  color: #999 !important;
}

.v-selected-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #b97a3a;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* GIAO DIỆN VOUCHER ĐÃ CHỌN */
.selected-voucher-tag {
  display: flex;
  align-items: center;
  background: #fdf5eb;
  border: 1px solid #b97a3a;
  padding: 10px;
  border-radius: 8px;
  position: relative;
}

.voucher-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.voucher-info strong {
  color: #b97a3a;
  font-size: 14px;
}

.voucher-info small {
  color: #8b5a2b;
  font-size: 12px;
}

.custom-scroll {
  max-height: 400px;
  overflow-y: auto;
}

/* HIỂN THỊ GIÁ */
.price-display {
  display: flex;
  flex-direction: column;
}

.old-price {
  text-decoration: line-through;
  color: #999;
  font-size: 13px;
}

.product-price {
  color: #d35400;
  font-weight: 700;
}

.discount-text {
  color: #dc3545;
  font-weight: 600;
}

/* CSS GỐC GIỮ NGUYÊN */
.checkout-wrapper {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 60px;
}
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}
.checkout-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
}
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px;
  border: 1px solid #eaebec;
}
.highlight-price {
  color: #d35400;
  font-size: 22px;
  font-weight: 700;
}
.divider {
  border-top: 1px solid #e9ecef;
  margin: 20px 0;
}
.divider.dashed {
  border-top-style: dashed;
}
</style>
