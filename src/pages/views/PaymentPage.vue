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
              <button type="button" class="btn-outline" @click="openCustomerModal">
                📋 Chọn từ sổ địa chỉ
              </button>
            </div>

            <form class="checkout-form" @submit.prevent>
              <div class="form-row">
                <div class="form-group">
                  <label>Họ và tên người nhận</label>
                  <input v-model="form.tenKhachHang" type="text" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input v-model="form.soDienThoai" type="text" class="form-control" />
                </div>
              </div>

              <div class="form-group">
                <label>Email liên hệ</label>
                <input v-model="form.email" type="email" class="form-control" />
              </div>

              <div class="form-row triplet">
                <div class="form-group">
                  <label>Tỉnh/Thành phố</label>
                  <select id="select-province" class="form-control">
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    <option v-for="p in provinces" :key="p.ProvinceID" :value="p.ProvinceID">
                      {{ p.ProvinceName }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Quận/Huyện</label>
                  <select id="select-district" class="form-control" :disabled="!selectedProvince">
                    <option value="">Chọn Quận/Huyện</option>
                    <option v-for="d in districts" :key="d.DistrictID" :value="d.DistrictID">
                      {{ d.DistrictName }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Phường/Xã</label>
                  <select id="select-ward" class="form-control" :disabled="!selectedDistrict">
                    <option value="">Chọn Phường/Xã</option>
                    <option v-for="w in wards" :key="w.WardCode" :value="w.WardCode">
                      {{ w.WardName }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Địa chỉ cụ thể</label>
                <input v-model="form.diaChiCuThe" type="text" class="form-control" />
              </div>

              <div class="payment-section mt-4">
                <div class="header-title mb-3">
                  <span class="icon-circle">💳</span>
                  <h2>Phương thức thanh toán</h2>
                </div>
                <div class="payment-options">
                  <label class="payment-card" :class="{ active: paymentMethod === 'COD' }"
                    @click="paymentMethod = 'COD'">
                    <div class="pay-info">
                      <span class="pay-name">Thanh toán khi nhận hàng (COD)</span>
                    </div>
                    <div class="radio-indicator"></div>
                  </label>
                  <label class="payment-card" :class="{ active: paymentMethod === 'ONLINE' }"
                    @click="paymentMethod = 'ONLINE'">
                    <div class="pay-info">
                      <span class="pay-name">Thanh toán trực tuyến (VNPAY)</span>
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
              <div class="product-item" v-for="(item, index) in checkoutItems" :key="item.variantId + '-' + index">
                <div class="product-img-wrapper">
                  <img :src="item.hinhAnh" @error="handleImageError" />
                  <span class="product-qty-badge">{{ item.soLuong }}</span>
                </div>
                <div class="product-detail">
                  <h3 class="product-name">{{ item.tenSp }}</h3>
                  <p class="product-meta">
                    Phân loại: {{ item.mauSacTen || "Màu chuẩn" }} -
                    {{ item.kichCo }}
                  </p>
                  <div class="price-display">
                    <span v-if="item.discountPercent > 0" class="old-price">
                      {{ formatPrice(item.giaBan) }}
                    </span>
                    <span class="product-price">
                      {{ formatPrice(getDiscountedPrice(item)) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="voucher-section">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="small-label mb-0">Phiếu giảm giá</label>
                <button type="button" class="btn-link-sm" @click="showVoucherModal = true">
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
              <div v-else class="no-voucher-box" @click="showVoucherModal = true">
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
                <span class="value discount-text">- {{ formatPrice(totalPromotionDiscount) }}</span>
              </div>
              <div class="price-row" v-if="voucherDiscountAmount > 0">
                <span class="label">Voucher giảm giá:</span>
                <span class="value discount-text">- {{ formatPrice(voucherDiscountAmount) }}</span>
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

            <button type="button" class="btn-submit-order" @click="confirmOrder">
              Hoàn tất đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showVoucherModal" class="modal-backdrop" @click.self="showVoucherModal = false">
        <div class="modal-dialog modal-small-custom">
          <div class="modal-header">
            <h3>Chọn phiếu giảm giá</h3>
            <button class="btn-close-modal" @click="showVoucherModal = false">
              &times;
            </button>
          </div>
          <div class="modal-body custom-scroll shopee-modal-body">
            <div v-if="processedVouchers.length > 0" class="voucher-list">
              <div v-for="v in processedVouchers" :key="v.id" class="shopee-voucher-card"
                :class="{ 'v-active': selectedVoucher?.id === v.id }" @click="selectVoucher(v)">

                <div class="v-best-badge" v-if="v.isBest">Lựa chọn tốt nhất</div>

                <div class="shopee-v-left">
                  <div class="brand-text">CHOCO<br />STYLE</div>
                </div>

                <div class="shopee-v-right">
                  <div class="v-info-wrap">
                    <div class="v-title">Giảm {{ v.loaiGiam === "PERCENT" ? v.giaTri + "%" : formatPrice(v.giaTri) }}
                    </div>
                    <div class="v-condition">Đơn tối thiểu {{ formatPrice(v.dieueKienDonHang || v.dieuKienDonHang || 0)
                    }}</div>

                    <div class="v-expiry">
                      <span v-if="v.giaTriToiDa && v.loaiGiam === 'PERCENT'" class="v-max-discount">
                        Giảm tối đa {{ formatPrice(v.giaTriToiDa) }}
                      </span>
                      HSD: {{ v.ngayKetThuc }}
                    </div>
                  </div>

                  <div class="v-radio-wrap">
                    <div class="shopee-radio" :class="{ 'checked': selectedVoucher?.id === v.id }"></div>
                  </div>
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
      <div v-if="showCustomerModal" class="modal-backdrop" @click.self="showCustomerModal = false">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <h3>Sổ địa chỉ của bạn</h3>
            <button class="btn-close-modal" @click="showCustomerModal = false">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <div class="search-box mb-3">
              <input type="text" v-model="searchKeyword" placeholder="🔍 Tìm kiếm..." class="form-control" />
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
        <div v-for="notif in notifications" :key="notif.id" class="modern-toast" :class="'toast-' + notif.type">
          <span class="toast-message">{{ notif.message }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import Header from "../../layout/header/Header.vue";
import { ref, onMounted, computed, reactive, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const GHN_TOKEN = "31476b34-15db-11f1-9cf9-9efb715b9957";
const GHN_SHOP_ID = 6296816;
const SHOP_DISTRICT_ID = 1488;
const GHN_API_BASE = "https://online-gateway.ghn.vn/shiip/public-api";

const route = useRoute();
const router = useRouter();

// --- THAY ĐỔI CHÍNH: Dùng mảng checkoutItems thay vì biến đơn lẻ ---
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
  // 1. Cấu hình Select2 cho Tỉnh/Thành
  const $prov = window.$("#select-province");
  $prov.select2({ width: "100%", placeholder: "Chọn Tỉnh/Thành phố" });

  $prov.off("select2:select").on("select2:select", async (e) => {
    const val = Number(e.params.data.id);
    if (selectedProvince.value !== val) {
      selectedProvince.value = val;
      await handleProvinceChange();
    }
  });

  // 2. Cấu hình Select2 cho Quận/Huyện
  const $dist = window.$("#select-district");
  $dist.select2({ width: "100%", placeholder: "Chọn Quận/Huyện" });

  $dist.off("select2:select").on("select2:select", async (e) => {
    const val = Number(e.params.data.id);
    if (selectedDistrict.value !== val) {
      selectedDistrict.value = val;
      await handleDistrictChange();
    }
  });

  // 3. Cấu hình Select2 cho Phường/Xã
  const $ward = window.$("#select-ward");
  $ward.select2({ width: "100%", placeholder: "Chọn Phường/Xã" });

  $ward.off("select2:select").on("select2:select", async (e) => {
    const val = e.params.data.id; // WardCode thường là string
    if (selectedWard.value !== val) {
      selectedWard.value = val;
      await handleWardChange();
    }
  });
};

// Hàm helper để set giá trị cho Select2 từ code (dùng khi chọn từ sổ địa chỉ)
const setSelect2Value = (idSelector, value) => {
  const $el = window.$(idSelector);
  if ($el.length) {
    // Chuyển value về string để Select2 nhận diện đúng option
    $el.val(String(value)).trigger("change");
  }
};

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v) + " đ";
const handleImageError = (e) => {
  e.target.src = "/src/assets/logo/no-image-placeholder.png";
};

// ================== 1. LOGIC GHN (GIỮ NGUYÊN) ==================
const getProvinces = async () => {
  try {
    const res = await axios.get(`${GHN_API_BASE}/master-data/province`, {
      headers: { token: GHN_TOKEN },
    });
    provinces.value = res.data.data;

    // Đợi Vue render options xong mới init Select2
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

    // Reset giao diện quận/huyện
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

    // Reset giao diện phường/xã
    await nextTick();
    setSelect2Value("#select-ward", "");
  } catch (error) {
    console.error("Lỗi lấy phường:", error);
  }
};
const calculateShippingFee = async () => {
  if (!selectedDistrict.value || !selectedWard.value) return;
  try {
    // GHN giới hạn giá trị khai báo tối đa là 5.000.000đ cho gói thường
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
    shipFee.value = 30000; // Fallback
  }
};

const handleProvinceChange = async () => {
  districts.value = [];
  wards.value = [];
  selectedDistrict.value = null;
  selectedWard.value = null;
  shipFee.value = 0;

  // Clear UI cấp con
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

  // Clear UI cấp con
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

// ================== 2. LOGIC SẢN PHẨM & KHUYẾN MÃI ==================

// Hàm lấy giá sau giảm (Helper cho template)
const getDiscountedPrice = (item) => {
  if (!item.discountPercent) return item.giaBan;
  return Math.round(item.giaBan * (1 - item.discountPercent / 100));
};

// Fetch và áp dụng khuyến mãi cho TOÀN BỘ danh sách sản phẩm
const fetchPromotions = async () => {
  try {
    // Gọi API lấy khuyến mãi
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

    // Cập nhật chiết khấu cho từng sản phẩm
    checkoutItems.value.forEach((item) => {
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
    });
  } catch (err) {
    // XỬ LÝ LỖI RIÊNG CHO KHÁCH VÃNG LAI
    if (err.response && err.response.status === 401) {
      console.warn("Chế độ khách vãng lai: Không thể áp dụng khuyến mãi yêu cầu đăng nhập.");
      // Đảm bảo discount về 0 nếu không gọi được API
      checkoutItems.value.forEach(item => item.discountPercent = 0);
    } else {
      console.error("Lỗi hệ thống khi check khuyến mãi:", err);
    }
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

// ================== 3. TÍNH TOÁN TIỀN ==================

// Tổng tiền hàng gốc (chưa trừ KM sản phẩm)
const totalOriginalPrice = computed(() => {
  return checkoutItems.value.reduce(
    (sum, item) => sum + item.giaBan * item.soLuong,
    0,
  );
});

// Tạm tính (Đã trừ khuyến mãi sản phẩm, dùng để tính Voucher)
const subTotal = computed(() => {
  return checkoutItems.value.reduce((sum, item) => {
    return sum + getDiscountedPrice(item) * item.soLuong;
  }, 0);
});

// Tổng tiền tiết kiệm được từ khuyến mãi sản phẩm
const totalSaved = computed(() => {
  return totalOriginalPrice.value - subTotal.value;
});

// Tính giảm giá Voucher
const voucherDiscountAmount = computed(() => {
  if (!selectedVoucher.value) return 0;
  const v = selectedVoucher.value;
  let discount = 0;

  // Voucher áp dụng trên giá đã giảm của sản phẩm (subTotal)
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

// Tổng thanh toán cuối cùng
const finalTotal = computed(() => {
  const total = subTotal.value - voucherDiscountAmount.value + shipFee.value;
  return total > 0 ? Math.round(total) : 0;
});

// Tính toán số tiền giảm và tìm "Lựa chọn tốt nhất"
const processedVouchers = computed(() => {
  const basePrice = subTotal.value;

  let list = availableVouchers.value.map(v => {
    const dieuKien = v.dieueKienDonHang || v.dieuKienDonHang || 0;
    const isEligible = basePrice >= dieuKien;

    // Giả lập tính toán số tiền thực tế sẽ được giảm
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

  // Sắp xếp giảm dần theo số tiền được giảm (mã giảm nhiều nhất lên đầu)
  list.sort((a, b) => b.simulatedDiscount - a.simulatedDiscount);

  // Đánh dấu "Lựa chọn tốt nhất" cho voucher đầu tiên (nếu có giảm giá)
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
      `Đơn hàng tối thiểu ${formatPrice(dieuKien)} để sử dụng mã này`,
      "warning",
    );
    return;
  }
  selectedVoucher.value = v;
  showVoucherModal.value = false;
};

// ================== 4. XỬ LÝ ĐẶT HÀNG ==================
const handleCheckout = async () => {
  if (
    !form.value.tenKhachHang ||
    !form.value.soDienThoai ||
    !form.value.email ||
    !form.value.diaChiCuThe
  ) {
    addNotification("Vui lòng điền đầy đủ thông tin giao hàng!", "warning");
    return;
  }

  const fullAddress = `${form.value.diaChiCuThe}, ${form.value.phuong}, ${form.value.quan}, ${form.value.thanhPho}`;

  // Mapping danh sách sản phẩm để gửi về BE
  const orderDetails = checkoutItems.value.map((item) => ({
    idChiTietSanPham: item.variantId,
    soLuong: item.soLuong,
    donGia: getDiscountedPrice(item), // Gửi đơn giá thực tế sau khi đã giảm
  }));

  const orderData = {
    idKhachHang: customer.value?.id || null,
    idNhanVien: 1,
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
    const response = await axios.post(
      "http://localhost:8080/api/hoa-don",
      orderData,
    );

    let hoaDonId = null;
    if (typeof response.data === "string") {
      const match = response.data.match(/\d+/);
      hoaDonId = match ? parseInt(match[0]) : null;
    } else if (response.data && response.data.id) {
      hoaDonId = response.data.id;
    }

    if (paymentMethod.value === "COD") {
      // Nếu mua từ giỏ hàng, xóa các item đã mua khỏi giỏ
      updateOriginalCartAfterPurchase();

      addNotification("Đặt hàng thành công!", "success");
      setTimeout(() => router.push("/"), 2000);
    } else {
      // VNPAY
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
    addNotification(
      error.response?.data || "Có lỗi xảy ra khi tạo đơn hàng",
      "error",
    );
  }
};

// Hàm phụ: Xóa sản phẩm đã mua khỏi giỏ hàng chính (localStorage)
const updateOriginalCartAfterPurchase = () => {
  const savedCart = localStorage.getItem("cart");
  // Chỉ xóa khi người dùng đến từ trang Giỏ hàng
  if (savedCart && route.query.fromCart) {
    let cart = JSON.parse(savedCart);
    // Lấy danh sách ID các biến thể đã mua
    const boughtIds = checkoutItems.value.map((i) => i.variantId);
    // Giữ lại các sản phẩm KHÔNG nằm trong danh sách mua
    cart = cart.filter((c) => !boughtIds.includes(c.variantId));

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated")); // Update header count
  }
  
  // 👉 ĐÃ SỬA: Luôn luôn xóa bộ nhớ tạm để tránh bị dính sản phẩm cũ ở lần mua sau
  localStorage.removeItem("checkout_items");
};

// ================== 5. KHỞI TẠO DỮ LIỆU ==================
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
      { headers: { Authorization: `Bearer ${token}` } }
    );

    customer.value = res.data;
    form.value.tenKhachHang = res.data.tenKhachHang;
    form.value.soDienThoai = res.data.soDienThoai;
    form.value.email = res.data.email;

    const addr = res.data.listDiaChi?.find((d) => d.macDinh) || res.data.listDiaChi?.[0];
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
  addNotification("Đang cập nhật phí vận chuyển...", "info");
  await mapAddressFromText(
    item.diaChi.thanhPho,
    item.diaChi.quan,
    item.diaChi.phuong,
  );
};

onMounted(async () => {
  // 1. Luôn gọi lấy tỉnh thành vì khách vãng lai cũng cần địa chỉ
  await getProvinces();

  // 2. CHỈ GỌI fetchCustomer khi đã đăng nhập (có token)
  const token = localStorage.getItem("token");
  if (token) {
    try {
      await fetchCustomer();
    } catch (error) {
      console.error("Lỗi khi lấy thông tin khách hàng:", error);
      // Nếu token hết hạn (401), có thể xóa token để họ tiếp tục mua như khách vãng lai
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
      }
    }
  } else {
    console.log("Chế độ mua hàng không đăng nhập (Guest Checkout)");
  }

  // --- CHECK 1: Dữ liệu từ Giỏ hàng (localStorage: checkout_items) ---
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
        }));
        await fetchPromotions();
      }
    } catch (e) {
      console.error("Lỗi parse checkout items", e);
    }
  }

  // --- CHECK 2: Nếu không có dữ liệu từ Giỏ hàng, kiểm tra Mua Ngay (Query Params) ---
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
});

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

// Hàm Mapping địa chỉ từ text sang ID (Giữ nguyên)
const mapAddressFromText = async (cityName, districtName, wardName) => {
  if (!cityName || !districtName || !wardName) return;
  try {
    if (provinces.value.length === 0) await getProvinces();

    // 1. Tìm và set Tỉnh
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
      // Cập nhật giao diện Select2
      setSelect2Value("#select-province", foundProvince.ProvinceID);

      await getDistricts(foundProvince.ProvinceID);

      // 2. Tìm và set Quận
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
        // Cập nhật giao diện Select2 (đợi render options xong)
        await nextTick();
        setSelect2Value("#select-district", foundDistrict.DistrictID);

        await getWards(foundDistrict.DistrictID);

        // 3. Tìm và set Phường
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
          // Cập nhật giao diện Select2
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
  color: #4a2c11;
  /* Đậm phong cách thời trang nam */
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
}

/* Đỏ cam bắt mắt */

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

.toast-error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.toast-warning {
  background: #ffc107;
  color: #333;
  border-left: 4px solid #ff9800;
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
  background: linear-gradient(135deg, #6b3f1e 0%, #8b5a2b 100%);
  color: white;
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 2px dashed #fff;
  position: relative;
  flex-shrink: 0;
}

.brand-logo {
  font-weight: 900;
  font-size: 16px;
  margin-bottom: 5px;
}

.ticket-name {
  font-size: 11px;
  opacity: 0.9;
  text-align: center;
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

.custom-scroll-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;
}

/* ================== SELECT2 CUSTOM STYLES ================== */
:deep(.select2-container) {
  width: 100% !important;
}

:deep(.select2-container .select2-selection--single) {
  height: 48px;
  /* Khớp với form-control */
  padding: 10px 15px;
  font-size: 15px;
  border: 1.5px solid #e9ecef;
  border-radius: 10px;
  background-color: #fcfcfc;
  display: flex;
  align-items: center;
}

:deep(.select2-container--default .select2-selection--single .select2-selection__arrow) {
  height: 100%;
  right: 15px;
}

:deep(.select2-container--default .select2-selection--single .select2-selection__rendered) {
  padding-left: 0;
  color: #333;
  line-height: normal;
}

:deep(.select2-container--default .select2-selection--single .select2-selection__placeholder) {
  color: #6c757d;
}

:deep(.select2-dropdown) {
  border: 1px solid #b97a3a;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  /* Đảm bảo nổi lên trên */
}

:deep(.select2-search__field) {
  border-radius: 6px !important;
  padding: 8px !important;
  border: 1px solid #ddd !important;
}

:deep(.select2-results__option--highlighted) {
  background-color: #b97a3a !important;
  color: white !important;
}

/* Trạng thái focus */
:deep(.select2-container--default.select2-container--open .select2-selection--single) {
  border-color: #b97a3a;
  box-shadow: 0 0 0 4px rgba(185, 122, 58, 0.1);
}

/* Trạng thái disabled */
:deep(.select2-container--default.select2-container--disabled .select2-selection--single) {
  background-color: #e9ecef;
  border-color: #e9ecef;
}

/* ================== SHOPEE VOUCHER STYLE ================== */
.shopee-modal-body {
  background-color: #f5f5f5;
  padding: 15px;
}

.shopee-voucher-card {
  display: flex;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
  height: 130px;
}

.shopee-voucher-card:hover {
  border-color: #ee4d2d;
}

.shopee-voucher-card.v-active {
  border-color: #ee4d2d;
  background-color: #fffaf9;
}

/* Cột bên trái (Màu Cam đặc trưng) */
.shopee-v-left {
  width: 100px;
  background: #ee4d2d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-right: 1px dashed #e8e8e8;
  flex-shrink: 0;
}

.brand-text {
  font-weight: 700;
  font-size: 14px;
  line-height: 1.2;
}

/* Cột bên phải (Chứa thông tin) */
.shopee-v-right {
  flex-grow: 1;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.v-info-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.v-title {
  font-size: 15px;
  font-weight: 500;
  color: #222;
}

.v-condition {
  font-size: 13px;
  color: #555;
}

.v-max-discount {
  display: inline-block;
  color: #ee4d2d;
  background: #ffefe8;
  padding: 2px 4px;
  border-radius: 2px;
  margin-right: 6px;
  font-size: 11px;
}

.v-expiry {
  font-size: 11px;
  color: #888;
  margin-top: 4px;
}

/* Nhãn Lựa chọn tốt nhất */
.v-best-badge {
  position: absolute;
  top: -1px;
  right: -1px;
  background: #ee4d2d;
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-bottom-left-radius: 6px;
  z-index: 2;
  box-shadow: -1px 1px 2px rgba(0, 0, 0, 0.1);
}

/* Nút Check hình tròn giống Shopee */
.shopee-radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid #dcdcdc;
  position: relative;
  transition: 0.2s;
}

.shopee-radio.checked {
  border-color: #ee4d2d;
  background-color: #ee4d2d;
}

.shopee-radio.checked::after {
  content: "";
  position: absolute;
  top: 5px;
  left: 8px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
</style>
