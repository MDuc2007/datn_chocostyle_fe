<template>
  <div class="checkout-wrapper">
    <Header></Header>

    <div class="checkout-container">
      <div class="checkout-grid">
        <div class="left-column">
          <div class="card shadow-sm">
            <div class="card-header">
              <div class="header-title">
                <span class="icon-circle">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <h2>Thông tin giao hàng</h2>
              </div>
              <button
                v-if="customer"
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
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input
                    v-model="form.soDienThoai"
                    type="text"
                    class="form-control"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Email liên hệ</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  placeholder="Nhập địa chỉ email"
                />
              </div>

              <div class="form-row triplet">
                <div class="form-group">
                  <label>Tỉnh/Thành phố</label>
                  <select id="select-province" class="form-control">
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    <option
                      v-for="p in provinces"
                      :key="p.ProvinceID"
                      :value="p.ProvinceID"
                    >
                      {{ p.ProvinceName }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Quận/Huyện</label>
                  <select
                    id="select-district"
                    class="form-control"
                    :disabled="!selectedProvince"
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    <option
                      v-for="d in districts"
                      :key="d.DistrictID"
                      :value="d.DistrictID"
                    >
                      {{ d.DistrictName }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Phường/Xã</label>
                  <select
                    id="select-ward"
                    class="form-control"
                    :disabled="!selectedDistrict"
                  >
                    <option value="">Chọn Phường/Xã</option>
                    <option
                      v-for="w in wards"
                      :key="w.WardCode"
                      :value="w.WardCode"
                    >
                      {{ w.WardName }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Địa chỉ cụ thể (Số nhà, tên đường)</label>
                <input
                  v-model="form.diaChiCuThe"
                  type="text"
                  class="form-control"
                  placeholder="Ví dụ: Số 12, ngõ 34..."
                />
              </div>

              <div class="form-group">
                <label>Ghi chú đơn hàng (Tùy chọn)</label>
                <input
                  v-model="form.ghiChu"
                  type="text"
                  class="form-control"
                  placeholder="Ghi chú về thời gian giao hàng..."
                />
              </div>

              <div class="payment-section mt-4">
                <div class="header-title mb-3">
                  <span class="icon-circle">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect
                        x="1"
                        y="4"
                        width="22"
                        height="16"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                  </span>
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
                      <span class="pay-desc"
                        >Thanh toán bằng tiền mặt khi shipper giao hàng
                        tới</span
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
                      <span class="pay-desc"
                        >Quét mã QR hoặc dùng thẻ ATM/Visa/MasterCard</span
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
                v-for="(item, index) in checkoutItems"
                :key="item.variantId + '-' + index"
              >
                <div class="product-img-wrapper">
                  <img :src="item.hinhAnh" @error="handleImageError" />
                  <span class="product-qty-badge">{{ item.soLuong }}</span>
                </div>
                <div class="product-detail">
                  <h3 class="product-name" :title="item.tenSp">
                    {{ item.tenSp }}
                  </h3>
                  <p class="product-meta">
                    {{ item.mauSacTen || "Màu chuẩn" }} - {{ item.kichCo }}
                  </p>
                  <div class="price-display">
                    <span v-if="item.discountPercent > 0" class="old-price">
                      {{ formatPrice(item.giaGoc) }}
                    </span>
                    <span class="product-price">
                      {{ formatPrice(item.giaCuoiCung) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="voucher-section">
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <label class="small-label mb-0">Phiếu giảm giá (Voucher)</label>
                <button
                  v-if="customer"
                  type="button"
                  class="btn-link-sm"
                  @click="showVoucherModal = true"
                >
                  {{ selectedVoucher ? "Thay đổi mã" : "Chọn mã giảm giá" }}
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
                @click="
                  customer
                    ? (showVoucherModal = true)
                    : addNotification(
                        'Vui lòng đăng nhập để sử dụng Voucher',
                        'info',
                      )
                "
              >
                <span v-if="customer">Bấm vào đây để chọn mã giảm giá</span>
                <span v-else>Đăng nhập để sử dụng mã giảm giá</span>
              </div>
            </div>

            <div class="divider dashed"></div>

            <div class="price-breakdown">
              <div class="price-row">
                <span class="label"
                  >Tạm tính ({{ totalItemCount }} sản phẩm):</span
                >
                <span class="value">{{ formatPrice(subTotal) }}</span>
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
              <span class="label">Tổng thanh toán</span>
              <span class="value highlight-price">{{
                formatPrice(finalTotal)
              }}</span>
            </div>

            <button
              type="button"
              class="btn-submit-order"
              @click="confirmOrder"
              :disabled="isProcessing"
            >
              <span v-if="isProcessing" class="loader-spinner"></span>
              <span v-else>HOÀN TẤT ĐẶT HÀNG</span>
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
            <h3>Chọn mã giảm giá</h3>
            <button class="btn-close-modal" @click="showVoucherModal = false">
              &times;
            </button>
          </div>
          <div class="modal-body custom-scroll shopee-modal-body">
            <div v-if="processedVouchers.length > 0" class="voucher-list">
              <div
                v-for="v in processedVouchers"
                :key="v.id"
                class="shopee-voucher-card"
                :class="{ 'v-active': selectedVoucher?.id === v.id }"
                @click="selectVoucher(v)"
              >
                <div class="v-best-badge" v-if="v.isBest">
                  Lựa chọn tốt nhất
                </div>

                <div class="shopee-v-left">
                  <div class="brand-text">CHOCO<br />STYLE</div>
                </div>

                <div class="shopee-v-right">
                  <div class="v-info-wrap">
                    <div class="v-title">
                      Giảm
                      {{
                        v.loaiGiam === "PERCENT"
                          ? v.giaTri + "%"
                          : formatPrice(v.giaTri)
                      }}
                    </div>
                    <div class="v-condition">
                      Đơn tối thiểu
                      {{
                        formatPrice(
                          v.dieueKienDonHang || v.dieuKienDonHang || 0,
                        )
                      }}
                    </div>

                    <div class="v-expiry">
                      <span
                        v-if="v.giaTriToiDa && v.loaiGiam === 'PERCENT'"
                        class="v-max-discount"
                      >
                        Giảm tối đa {{ formatPrice(v.giaTriToiDa) }}
                      </span>
                      HSD: {{ v.ngayKetThuc }}
                    </div>
                  </div>

                  <div class="v-radio-wrap">
                    <div
                      class="shopee-radio"
                      :class="{ checked: selectedVoucher?.id === v.id }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-5">
              <p class="text-muted">Bạn chưa có mã giảm giá nào khả dụng.</p>
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
                placeholder="🔍 Tìm kiếm tên hoặc số điện thoại..."
                class="form-control"
              />
            </div>
            <div class="table-responsive">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Thông tin người nhận</th>
                    <th>Địa chỉ giao hàng</th>
                    <th class="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filteredCustomers" :key="item.diaChi.id">
                    <td>
                      <strong>{{ item.tenKhachHang }}</strong>
                      <div class="text-muted mt-1">
                        📞 {{ item.soDienThoai }}
                      </div>
                    </td>
                    <td class="address-cell">
                      <span v-if="item.diaChi.macDinh" class="default-badge"
                        >Mặc định</span
                      >
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
            <button
              class="btn-cancel"
              @click="closeModal"
              :disabled="isProcessing"
            >
              Quay lại sửa
            </button>
            <button
              class="btn-confirm"
              @click="handleModalConfirm"
              :disabled="isProcessing"
            >
              <span v-if="isProcessing">Đang xử lý...</span>
              <span v-else>Xác nhận đặt</span>
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
            <template v-else-if="notif.type === 'info'">i</template>
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
import Footer from "../../layout/footer/Footer.vue";
import { ref, onMounted, computed, reactive, nextTick, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const GHN_TOKEN = "31476b34-15db-11f1-9cf9-9efb715b9957";
const GHN_SHOP_ID = 6296816;
const SHOP_DISTRICT_ID = 1488;
const GHN_API_BASE = "https://online-gateway.ghn.vn/shiip/public-api";

const route = useRoute();
const router = useRouter();

const checkoutItems = ref([]);
const customer = ref(null);
const availableVouchers = ref([]);
const selectedVoucher = ref(null);
const showVoucherModal = ref(false);

const paymentMethod = ref("COD");
const showCustomerModal = ref(false);
const searchKeyword = ref("");
const notifications = ref([]);
const modal = reactive({ show: false, title: "", message: "", action: null });
const isProcessing = ref(false);

const shipFee = ref(0);
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedProvince = ref(null);
const selectedDistrict = ref(null);
const selectedWard = ref(null);

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

const initSelect2 = () => {
  const $prov = window.$("#select-province");
  $prov.select2({ width: "100%", placeholder: "Chọn Tỉnh/Thành phố" });

  $prov.off("select2:select").on("select2:select", async (e) => {
    const val = Number(e.params.data.id);
    if (selectedProvince.value !== val) {
      selectedProvince.value = val;
      await handleProvinceChange();
    }
  });

  const $dist = window.$("#select-district");
  $dist.select2({ width: "100%", placeholder: "Chọn Quận/Huyện" });

  $dist.off("select2:select").on("select2:select", async (e) => {
    const val = Number(e.params.data.id);
    if (selectedDistrict.value !== val) {
      selectedDistrict.value = val;
      await handleDistrictChange();
    }
  });

  const $ward = window.$("#select-ward");
  $ward.select2({ width: "100%", placeholder: "Chọn Phường/Xã" });

  $ward.off("select2:select").on("select2:select", async (e) => {
    const val = e.params.data.id;
    if (selectedWard.value !== val) {
      selectedWard.value = val;
      await handleWardChange();
    }
  });
};

const setSelect2Value = (idSelector, value) => {
  const $el = window.$(idSelector);
  if ($el.length) {
    $el.val(String(value)).trigger("change");
  }
};

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v) + " đ";
const handleImageError = (e) => {
  e.target.src = "/src/assets/logo/no-image-placeholder.png";
};

// ================== 1. LOGIC GHN ==================
const getProvinces = async () => {
  try {
    const res = await axios.get(`${GHN_API_BASE}/master-data/province`, {
      headers: { token: GHN_TOKEN },
    });
    provinces.value = res.data.data;
    await nextTick();
    initSelect2();
  } catch (error) {
    console.error("Lỗi lấy tỉnh:", error);
  }
};

const getDistricts = async (provinceId) => {
  try {
    const res = await axios.get(`${GHN_API_BASE}/master-data/district`, {
      headers: { token: GHN_TOKEN },
      params: { province_id: provinceId },
    });
    districts.value = res.data.data;
    await nextTick();
    setSelect2Value("#select-district", "");
  } catch (error) {
    console.error("Lỗi lấy quận:", error);
  }
};

const getWards = async (districtId) => {
  try {
    const res = await axios.get(`${GHN_API_BASE}/master-data/ward`, {
      headers: { token: GHN_TOKEN },
      params: { district_id: districtId },
    });
    wards.value = res.data.data;
    await nextTick();
    setSelect2Value("#select-ward", "");
  } catch (error) {
    console.error("Lỗi lấy phường:", error);
  }
};

const calculateShippingFee = async () => {
  if (!selectedDistrict.value || !selectedWard.value) return;
  try {
    const insurance = subTotal.value > 5000000 ? 5000000 : subTotal.value;
    const res = await axios.post(
      `${GHN_API_BASE}/v2/shipping-order/fee`,
      {
        service_type_id: 2,
        insurance_value: insurance,
        coupon: null,
        from_district_id: SHOP_DISTRICT_ID,
        to_district_id: selectedDistrict.value,
        to_ward_code: selectedWard.value,
        height: 15,
        length: 15,
        width: 15,
        weight: 1000,
      },
      { headers: { token: GHN_TOKEN, ShopId: GHN_SHOP_ID } },
    );
    shipFee.value = res.data.data.total;
  } catch (error) {
    console.error("Lỗi tính phí ship:", error);
    shipFee.value = 30000;
  }
};

const handleProvinceChange = async () => {
  districts.value = [];
  wards.value = [];
  selectedDistrict.value = null;
  selectedWard.value = null;
  shipFee.value = 0;
  setSelect2Value("#select-district", "");
  setSelect2Value("#select-ward", "");

  const p = provinces.value.find(
    (x) => x.ProvinceID === selectedProvince.value,
  );
  if (p) {
    form.value.thanhPho = p.ProvinceName;
    await getDistricts(selectedProvince.value);
  }
};

const handleDistrictChange = async () => {
  wards.value = [];
  selectedWard.value = null;
  shipFee.value = 0;
  setSelect2Value("#select-ward", "");

  const d = districts.value.find(
    (x) => x.DistrictID === selectedDistrict.value,
  );
  if (d) {
    form.value.quan = d.DistrictName;
    await getWards(selectedDistrict.value);
  }
};

const handleWardChange = async () => {
  const w = wards.value.find((x) => x.WardCode === selectedWard.value);
  if (w) {
    form.value.phuong = w.WardName;
    await calculateShippingFee();
  }
};

// ================== 2. LOGIC SẢN PHẨM & KHUYẾN MÃI (ĐÃ FIX LỖI GIẢM 2 LẦN) ==================

const fetchPromotions = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/promotions");
    if (!res.data) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validPromos = res.data.filter((p) => {
      if (Number(p.trangThai) !== 1) return false;
      const start = new Date(p.ngayBatDau);
      const end = new Date(p.ngayKetThuc);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return today >= start && today <= end;
    });

    const isFromCart = route.query.fromCart === "true";

    checkoutItems.value.forEach((item) => {
      // Tìm Khuyến mãi tốt nhất cho biến thể này
      const itemPromos = validPromos.filter((p) =>
        p.chiTietSanPhamIds?.some(
          (id) => Number(id) === Number(item.variantId),
        ),
      );

      if (itemPromos.length > 0) {
        const best = itemPromos.reduce((max, cur) =>
          Number(cur.giaTriGiam) > Number(max.giaTriGiam) ? cur : max,
        );
        item.discountPercent = Number(best.giaTriGiam);
      } else {
        item.discountPercent = 0;
      }

      // XỬ LÝ GIÁ ĐỂ TRÁNH GIẢM 2 LẦN
      if (isFromCart) {
        // Nếu từ Giỏ Hàng: item.giaBan ĐÃ LÀ GIÁ ĐƯỢC GIẢM RỒI
        item.giaCuoiCung = item.giaBan;

        // Tính ngược lại giá gốc để hiển thị gạch ngang (nếu có khuyến mãi)
        if (item.discountPercent > 0) {
          item.giaGoc = Math.round(
            item.giaCuoiCung / (1 - item.discountPercent / 100),
          );
        } else {
          item.giaGoc = item.giaCuoiCung;
        }
      } else {
        // Nếu Mua Ngay: variant.giaBan từ API trả về LÀ GIÁ GỐC
        item.giaGoc = item.giaBan;

        // Tính xuôi để ra giá cuối cùng
        if (item.discountPercent > 0) {
          item.giaCuoiCung = Math.round(
            item.giaGoc * (1 - item.discountPercent / 100),
          );
        } else {
          item.giaCuoiCung = item.giaGoc;
        }
      }
    });
  } catch (err) {
    // Xử lý lỗi (Thường gặp khi chưa đăng nhập)
    checkoutItems.value.forEach((item) => {
      item.discountPercent = 0;
      // Tránh lỗi undefined nếu API xịt
      item.giaCuoiCung = item.giaBan;
      item.giaGoc = item.giaBan;
    });
  }
};

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

// ================== 3. TÍNH TOÁN TIỀN ĐÃ CẬP NHẬT ==================

const totalItemCount = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + item.soLuong, 0);
});

// Tạm tính dùng giaCuoiCung thay vì hàm getDiscountedPrice
const subTotal = computed(() => {
  return checkoutItems.value.reduce(
    (sum, item) => sum + item.giaCuoiCung * item.soLuong,
    0,
  );
});

// Tính giảm giá Voucher dựa trên subTotal
const voucherDiscountAmount = computed(() => {
  if (!selectedVoucher.value) return 0;
  const v = selectedVoucher.value;
  let discount = 0;
  const basePrice = subTotal.value;
  const dieuKien = v.dieueKienDonHang || v.dieuKienDonHang || 0;

  if (basePrice < dieuKien) return 0;

  if (v.loaiGiam === "PERCENT") {
    discount = (basePrice * v.giaTri) / 100;
    if (v.giaTriToiDa && discount > v.giaTriToiDa) discount = v.giaTriToiDa;
  } else {
    discount = v.giaTri;
  }
  return Math.round(discount);
});

const finalTotal = computed(() => {
  const total = subTotal.value - voucherDiscountAmount.value + shipFee.value;
  return total > 0 ? Math.round(total) : 0;
});

// Xử lý logic Voucher Shopee style
const processedVouchers = computed(() => {
  const basePrice = subTotal.value;

  let list = availableVouchers.value.map((v) => {
    const dieuKien = v.dieueKienDonHang || v.dieuKienDonHang || 0;
    const isEligible = basePrice >= dieuKien;

    let simulatedDiscount = 0;
    if (isEligible) {
      if (v.loaiGiam === "PERCENT") {
        simulatedDiscount = (basePrice * v.giaTri) / 100;
        if (v.giaTriToiDa && simulatedDiscount > v.giaTriToiDa) {
          simulatedDiscount = v.giaTriToiDa;
        }
      } else {
        simulatedDiscount = v.giaTri;
      }
    }
    return { ...v, simulatedDiscount };
  });

  list.sort((a, b) => b.simulatedDiscount - a.simulatedDiscount);

  if (list.length > 0 && list[0].simulatedDiscount > 0) {
    list[0].isBest = true;
  }
  return list;
});

const selectVoucher = (v) => {
  const basePrice = subTotal.value;
  const dieuKien = v.dieueKienDonHang || v.dieuKienDonHang || 0;

  if (basePrice < dieuKien) {
    addNotification(
      `Đơn hàng tối thiểu ${formatPrice(dieuKien)} để dùng mã này`,
      "warning",
    );
    return;
  }
  selectedVoucher.value = v;
  showVoucherModal.value = false;
};

// ================== 4. XỬ LÝ ĐẶT HÀNG ==================
const addNotification = (m, t = "success") => {
  const id = Date.now();
  notifications.value.push({ id, message: m, type: t });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 3000);
};

const confirmOrder = () => {
  if (!form.value.tenKhachHang?.trim())
    return addNotification("Vui lòng nhập Họ và tên!", "warning");
  if (!form.value.soDienThoai?.trim())
    return addNotification("Vui lòng nhập Số điện thoại!", "warning");
  if (!form.value.thanhPho || !form.value.quan || !form.value.phuong)
    return addNotification("Vui lòng chọn Tỉnh/Quận/Phường!", "warning");
  if (!form.value.diaChiCuThe?.trim())
    return addNotification("Vui lòng nhập Địa chỉ cụ thể!", "warning");

  modal.show = true;
  modal.action = handleCheckout;
  modal.title = "Xác nhận đặt hàng";
  modal.message = "Bạn có chắc chắn các thông tin đã chính xác?";
};

const handleModalConfirm = () => {
  modal.action();
};

const closeModal = () => {
  if (!isProcessing.value) modal.show = false;
};

const handleCheckout = async () => {
  isProcessing.value = true;
  const fullAddress = `${form.value.diaChiCuThe}, ${form.value.phuong}, ${form.value.quan}, ${form.value.thanhPho}`;

  // Gửi giá giaCuoiCung chuẩn xác cho BE
  const orderDetails = checkoutItems.value.map((item) => ({
    idChiTietSanPham: item.variantId,
    soLuong: item.soLuong,
    donGia: item.giaCuoiCung,
  }));

  const orderData = {
    idKhachHang: customer.value?.id || null,
    idNhanVien: 1, // Tránh lỗi SQL NULL
    loaiDon: 0, // Online
    ghiChu: form.value.ghiChu,
    tongTienHang: subTotal.value,
    phiShip: shipFee.value,
    maVoucher: selectedVoucher.value ? selectedVoucher.value.maPgg : "",
    giamGiaVoucher: voucherDiscountAmount.value,

    tenNguoiNhan: form.value.tenKhachHang,
    sdtNguoiNhan: form.value.soDienThoai,
    emailNguoiNhan: form.value.email,
    diaChiGiaoHang: fullAddress,

    phuongThuc: paymentMethod.value === "COD" ? 1 : 2,
    sanPhamChiTiet: orderDetails,
  };

  try {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await axios.post(
      "http://localhost:8080/api/hoa-don",
      orderData,
      { headers },
    );

    let hoaDonId = null;
    if (typeof response.data === "string") {
      const match = response.data.match(/\d+/g);
      hoaDonId = match ? parseInt(match[match.length - 1]) : null;
    } else if (response.data && response.data.id) {
      hoaDonId = response.data.id;
    } else if (typeof response.data === "number") {
      hoaDonId = response.data;
    }

    if (paymentMethod.value === "COD") {
      updateOriginalCartAfterPurchase();
      addNotification("Đặt hàng thành công!", "success");
      setTimeout(() => {
        router.push({
          path: "/payment-result",
          query: {
            method: "COD",
            status: "success",
            orderRef: "COD-" + (hoaDonId || Date.now()),
            amount: finalTotal.value,
            hoaDonId: hoaDonId,
          },
        });
      }, 1000);
    } else {
      const paymentRes = await axios.post(
        "http://localhost:8080/api/vnpay/create-payment",
        null,
        { params: { hoaDonId } },
      );
      if (paymentRes.data) {
        updateOriginalCartAfterPurchase();
        window.location.href = paymentRes.data;
      }
    }
  } catch (error) {
    console.error("Lỗi đặt hàng:", error);
    if (error.response && error.response.status === 401) {
      addNotification(
        "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        "error",
      );
    } else {
      addNotification(
        error.response?.data || "Có lỗi xảy ra khi tạo đơn hàng",
        "error",
      );
    }
    modal.show = false;
  } finally {
    isProcessing.value = false;
  }
};

const updateOriginalCartAfterPurchase = () => {
  const savedCart = localStorage.getItem("cart");
  if (savedCart && route.query.fromCart === "true") {
    let cart = JSON.parse(savedCart);
    const boughtIds = checkoutItems.value.map((i) => i.variantId);
    cart = cart.filter((c) => !boughtIds.includes(c.variantId));

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  }
  localStorage.removeItem("checkout_items");
};

// ================== 5. KHỞI TẠO ==================
const fetchCustomer = async () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;

  const user = JSON.parse(userStr);
  const userId = user.id;
  const token = user.accessToken || localStorage.getItem("token");

  if (!userId) return;

  try {
    const res = await axios.get(
      `http://localhost:8080/api/khach-hang/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    customer.value = res.data;
    form.value.tenKhachHang = res.data.tenKhachHang;
    form.value.soDienThoai = res.data.soDienThoai;
    form.value.email = res.data.email;

    const addr =
      res.data.listDiaChi?.find((d) => d.macDinh) || res.data.listDiaChi?.[0];
    if (addr) {
      form.value.diaChiCuThe = addr.diaChiCuThe;
      await mapAddressFromText(addr.thanhPho, addr.quan, addr.phuong);
    }
    await fetchVouchers(res.data.id);
  } catch (err) {
    console.error("Lỗi lấy thông tin khách hàng:", err);
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

const selectAddress = async (item) => {
  form.value.tenKhachHang = item.tenKhachHang;
  form.value.soDienThoai = item.soDienThoai;
  form.value.diaChiCuThe = item.diaChi.diaChiCuThe;
  showCustomerModal.value = false;
  addNotification("Đang cập nhật phí ship...", "info");
  await mapAddressFromText(
    item.diaChi.thanhPho,
    item.diaChi.quan,
    item.diaChi.phuong,
  );
};

const mapAddressFromText = async (cityName, districtName, wardName) => {
  if (!cityName || !districtName || !wardName) return;
  try {
    if (provinces.value.length === 0) await getProvinces();

    const foundProvince = provinces.value.find(
      (p) =>
        p.ProvinceName.toLowerCase().trim() === cityName.toLowerCase().trim() ||
        p.NameExtension?.some(
          (ext) => ext.toLowerCase() === cityName.toLowerCase().trim(),
        ),
    );

    if (foundProvince) {
      selectedProvince.value = foundProvince.ProvinceID;
      form.value.thanhPho = foundProvince.ProvinceName;
      setSelect2Value("#select-province", foundProvince.ProvinceID);
      await getDistricts(foundProvince.ProvinceID);

      const foundDistrict = districts.value.find(
        (d) =>
          d.DistrictName.toLowerCase().trim() ===
            districtName.toLowerCase().trim() ||
          d.NameExtension?.some(
            (ext) => ext.toLowerCase() === districtName.toLowerCase().trim(),
          ),
      );

      if (foundDistrict) {
        selectedDistrict.value = foundDistrict.DistrictID;
        form.value.quan = foundDistrict.DistrictName;
        await nextTick();
        setSelect2Value("#select-district", foundDistrict.DistrictID);
        await getWards(foundDistrict.DistrictID);

        const foundWard = wards.value.find(
          (w) =>
            w.WardName.toLowerCase().trim() === wardName.toLowerCase().trim() ||
            w.NameExtension?.some(
              (ext) => ext.toLowerCase() === wardName.toLowerCase().trim(),
            ),
        );

        if (foundWard) {
          selectedWard.value = foundWard.WardCode;
          form.value.phuong = foundWard.WardName;
          await nextTick();
          setSelect2Value("#select-ward", foundWard.WardCode);
          await calculateShippingFee();
        }
      }
    }
  } catch (e) {
    console.error("Lỗi map địa chỉ:", e);
  }
};

const openCustomerModal = () => (showCustomerModal.value = true);

onMounted(async () => {
  await getProvinces();

  const token = localStorage.getItem("token");
  if (token) {
    try {
      await fetchCustomer();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
      }
    }
  }

  // Lấy dữ liệu sản phẩm
  const checkoutData = localStorage.getItem("checkout_items");
  if (checkoutData) {
    try {
      const items = JSON.parse(checkoutData);
      if (Array.isArray(items) && items.length > 0) {
        checkoutItems.value = items.map((i) => ({
          ...i,
          mauSacTen: i.mauSac?.tenMau || i.mauSacTen || "",
          kichCo: i.kichCo || "",
          discountPercent: 0,
          giaGoc: i.giaBan,
          giaCuoiCung: i.giaBan,
        }));
        await fetchPromotions();
      }
    } catch (e) {
      console.error("Lỗi parse checkout items", e);
    }
  }

  // Mua ngay
  if (checkoutItems.value.length === 0) {
    const { productId, variantId, quantity } = route.query;
    if (productId && variantId) {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/san-pham/${productId}`,
        );
        const prod = res.data;
        const variant = prod.bienTheList.find((b) => b.id == variantId);

        if (variant) {
          checkoutItems.value.push({
            variantId: variant.id,
            productId: prod.id,
            tenSp: prod.tenSp,
            giaBan: variant.giaBan,
            giaGoc: variant.giaBan,
            giaCuoiCung: variant.giaBan,
            soLuong: parseInt(quantity || 1),
            hinhAnh: variant.hinhAnhUrls?.[0] || prod.hinhAnh,
            mauSacTen: variant.mauSac?.tenMau,
            kichCo: variant.kichCoList?.[0] || "Tiêu chuẩn",
            discountPercent: 0,
          });
          await fetchPromotions();
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  // 👉 THÊM DÒNG NÀY VÀO CUỐI CÙNG
  // Sau khi đã load xong giá sản phẩm và voucher của khách hàng
  autoSelectBestVoucher();
});

watch(
  () => processedVouchers.value,
  (newVal) => {
    // Nếu chưa có voucher nào được chọn VÀ danh sách có voucher khả dụng
    if (!selectedVoucher.value && newVal && newVal.length > 0) {
      const bestVoucher = newVal[0];
      // Nếu voucher tốt nhất đủ điều kiện giảm giá (> 0) thì tự động chọn luôn
      if (bestVoucher.simulatedDiscount > 0) {
        selectedVoucher.value = bestVoucher;
      }
    }
  },
  { immediate: true }, // Kích hoạt ngay lập tức khi component vừa render
);
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap");

/* ================== VARIABLES & GLOBALS ================== */
.checkout-wrapper {
  background-color: #f7f7f7; /* Nền xám nhạt */
  min-height: 100vh;
  font-family: "Nunito", sans-serif;
  color: #1a1a1a;
  padding-bottom: 60px;
}

.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

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
  color: #64748b;
}
.shadow-sm {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

/* ================== HEADER ================== */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-family: "Montserrat", sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #63391f; /* Màu nâu chủ đạo */
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.page-subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
  font-weight: 500;
}

/* ================== GRID LAYOUT ================== */
.checkout-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
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
  border: 1px solid #f1f5f9;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px dashed #f1f5f9;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title h2 {
  font-family: "Montserrat", sans-serif;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #fdfaf8;
  color: #63391f;
  border-radius: 10px;
}
.icon-circle svg {
  width: 20px;
  height: 20px;
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
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
}

.form-control {
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background-color: #f8fafc;
  transition: all 0.2s ease;
  box-sizing: border-box;
  color: #1e293b;
  font-family: "Nunito", sans-serif;
}

.form-control:focus {
  outline: none;
  border-color: #63391f;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(99, 57, 31, 0.1);
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
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  background: #fff;
}

.payment-card:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.payment-card.active {
  border-color: #63391f;
  background-color: #fdfaf8;
}

.pay-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.pay-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 15px;
}

.pay-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.radio-indicator {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  position: relative;
  transition: all 0.2s;
}

.payment-card.active .radio-indicator {
  border-color: #63391f;
  background: #63391f;
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
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 25px;
  color: #1e293b;
}

.product-item {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
}

.product-img-wrapper {
  position: relative;
  width: 75px;
  height: 90px;
  flex-shrink: 0;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

.product-img-wrapper img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-qty-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #64748b;
  color: white;
  font-size: 11px;
  font-weight: 800;
  width: 22px;
  height: 22px;
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
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #1e293b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.product-meta {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.price-display {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.old-price {
  text-decoration: line-through;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
}

.product-price {
  font-weight: 800;
  color: #63391f;
  margin: 0;
  font-size: 15px;
}

.divider {
  border-top: 1px solid #e2e8f0;
  margin: 20px 0;
}

.divider.dashed {
  border-top-style: dashed;
}

/* VOUCHER SECTION */
.voucher-section {
  margin: 15px 0;
}

.small-label {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 5px;
  display: block;
}

.btn-link-sm {
  background: none;
  border: none;
  color: #d32f2f; /* Màu đỏ nổi bật cho voucher */
  font-weight: 700;
  cursor: pointer;
  font-size: 13px;
  transition: 0.2s;
}
.btn-link-sm:hover {
  text-decoration: underline;
}

.no-voucher-box {
  border: 1px dashed #cbd5e1;
  padding: 14px;
  border-radius: 10px;
  text-align: center;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  background: #f8fafc;
  transition: 0.2s;
}
.no-voucher-box:hover {
  border-color: #d32f2f;
  color: #d32f2f;
  background: #fef2f2;
}

.selected-voucher-tag {
  display: flex;
  align-items: center;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 12px 15px;
  border-radius: 10px;
  position: relative;
}

.voucher-icon {
  font-size: 24px;
  margin-right: 12px;
}

.voucher-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.voucher-info strong {
  color: #b91c1c;
  font-size: 14px;
  font-weight: 800;
}

.voucher-info small {
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
  margin-top: 2px;
}

.btn-remove-v {
  background: none;
  border: none;
  font-size: 24px;
  color: #ef4444;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
}
.btn-remove-v:hover {
  color: #991b1b;
}

/* PRICE BREAKDOWN */
.price-breakdown {
  font-size: 15px;
  color: #475569;
  font-weight: 500;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.discount-text {
  color: #10b981; /* Xanh lá cho giảm giá */
  font-weight: 700;
}

.price-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 25px;
  color: #1e293b;
}

.highlight-price {
  color: #d32f2f; /* Đỏ rực */
  font-size: 24px;
  font-family: "Montserrat", sans-serif;
}

/* BUTTON SUBMIT */
.btn-outline {
  background: transparent;
  color: #63391f;
  border: 1px solid #63391f;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #fdfaf8;
  box-shadow: 0 4px 10px rgba(99, 57, 31, 0.1);
}

.btn-submit-order {
  width: 100%;
  background: linear-gradient(135deg, #63391f, #8b5a2b);
  color: white;
  border: none;
  padding: 18px;
  border-radius: 12px;
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 20px rgba(99, 57, 31, 0.25);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.btn-submit-order:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(99, 57, 31, 0.35);
}

.btn-submit-order:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}

.loader-spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ================== MODALS ================== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
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
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-lg {
  max-width: 800px;
}
.modal-sm {
  max-width: 400px;
  padding: 35px 30px;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
}

.btn-close-modal {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.btn-close-modal:hover {
  background: #fee2e2;
  color: #ef4444;
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
  background: #f8fafc;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
}

.modern-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 14px;
  color: #334155;
}

.modern-table tr:hover td {
  background: #fdfdfd;
}

.address-cell {
  max-width: 250px;
  line-height: 1.6;
}

.default-badge {
  background: #dcfce7;
  color: #059669;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  margin-right: 8px;
}

.btn-select {
  background: #f1f5f9;
  color: #1e293b;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.btn-select:hover {
  background: #63391f;
  color: white;
}

/* Confirm Modal Specifics */
.confirm-icon {
  font-size: 48px;
  width: 80px;
  height: 80px;
  background: #fdfaf8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.confirm-title {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 10px;
}

.confirm-desc {
  color: #64748b;
  margin-bottom: 30px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 15px;
}

.confirm-actions button {
  flex: 1;
  padding: 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: 0.2s;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-confirm {
  background: #63391f;
  color: white;
}

.btn-confirm:hover {
  background: #4e2c17;
}

/* ================== TOASTS ================== */
.toast-container {
  position: fixed;
  top: 30px;
  right: 30px;
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
  border-left: 5px solid #cbd5e1;
}

.toast-success {
  border-left-color: #10b981;
}
.toast-success .toast-icon {
  background: #10b981;
  color: white;
}

.toast-error {
  border-left-color: #ef4444;
}
.toast-error .toast-icon {
  background: #ef4444;
  color: white;
}

.toast-warning {
  border-left-color: #f59e0b;
}
.toast-warning .toast-icon {
  background: #f59e0b;
  color: white;
}

.toast-info {
  border-left-color: #3b82f6;
}
.toast-info .toast-icon {
  background: #3b82f6;
  color: white;
}

.toast-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.toast-message {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

/* ANIMATIONS */
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
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* ================== SELECT2 CUSTOM STYLES ================== */
:deep(.select2-container) {
  width: 100% !important;
}
:deep(.select2-container .select2-selection--single) {
  height: 50px;
  padding: 10px 15px;
  font-size: 15px;
  font-weight: 600;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  color: #1e293b;
}
:deep(
  .select2-container--default
    .select2-selection--single
    .select2-selection__arrow
) {
  height: 100%;
  right: 15px;
}
:deep(
  .select2-container--default
    .select2-selection--single
    .select2-selection__rendered
) {
  padding-left: 0;
  color: #1e293b;
  line-height: normal;
}
:deep(
  .select2-container--default.select2-container--open .select2-selection--single
) {
  border-color: #63391f;
  box-shadow: 0 0 0 4px rgba(99, 57, 31, 0.1);
  background-color: #fff;
}
:deep(.select2-dropdown) {
  border: 1px solid #63391f;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 9999;
}
:deep(.select2-results__option--highlighted) {
  background-color: #63391f !important;
  color: white !important;
}

/* ================== SHOPEE VOUCHER STYLE ================== */
.modal-small-custom {
  max-width: 500px !important;
  width: 95%;
  border-radius: 16px;
}

.shopee-modal-body {
  background-color: #f8fafc;
  padding: 20px;
}

.custom-scroll {
  max-height: 450px;
  overflow-y: auto;
}

.voucher-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.shopee-voucher-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
  height: 110px;
}

.shopee-voucher-card:hover {
  border-color: #d32f2f;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.1);
}

.shopee-voucher-card.v-active {
  border-color: #d32f2f;
  background-color: #fef2f2;
}

.shopee-v-left {
  width: 100px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-right: 2px dashed #f8fafc;
  flex-shrink: 0;
  position: relative;
}

.shopee-v-left::before,
.shopee-v-left::after {
  content: "";
  position: absolute;
  right: -8px;
  width: 16px;
  height: 16px;
  background-color: #f8fafc;
  border-radius: 50%;
}
.shopee-v-left::before {
  top: -8px;
}
.shopee-v-left::after {
  bottom: -8px;
}

.brand-text {
  font-family: "Montserrat", sans-serif;
  font-weight: 900;
  font-size: 15px;
  line-height: 1.2;
  letter-spacing: 1px;
}

.shopee-v-right {
  flex-grow: 1;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.v-info-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.v-title {
  font-size: 15px;
  font-weight: 800;
  color: #1e293b;
}

.v-condition {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.v-max-discount {
  display: inline-block;
  color: #d32f2f;
  background: #fee2e2;
  padding: 3px 6px;
  border-radius: 4px;
  margin-right: 6px;
  font-size: 11px;
  font-weight: 700;
}

.v-expiry {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

.v-best-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #d32f2f;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-bottom-left-radius: 8px;
  z-index: 2;
  text-transform: uppercase;
}

.shopee-radio {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  position: relative;
  transition: 0.2s;
}

.shopee-radio.checked {
  border-color: #d32f2f;
  background-color: #d32f2f;
}

.shopee-radio.checked::after {
  content: "";
  position: absolute;
  top: 4px;
  left: 8px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.modern-table th:last-child,
.modern-table td:last-child {
  text-align: center;
  vertical-align: middle;
}
</style>
