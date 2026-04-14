<template>
  <div class="page-wrapper">
    <div class="form-container">
      <h3 class="form-title">THÊM PHIẾU GIẢM GIÁ</h3>

      <div class="form-grid">
        <!-- HÀNG 1 -->
        <div class="form-group">
          <label>Mã phiếu giảm giá</label>
          <input disabled :value="form.maPgg" />
        </div>

        <div class="form-group">
          <label> Tên phiếu giảm giá <span class="required">*</span> </label>
          <input
            v-model="form.tenPgg"
            :class="{ error: errors.tenPgg }"
            @blur="handleBlurTen"
          />
          <small v-if="errors.tenPgg" class="error-text">
            {{ errors.tenPgg }}
          </small>
        </div>

        <!-- HÀNG 2 -->
        <div class="form-group">
          <label>Kiểu áp dụng <span class="required">*</span></label>
          <div class="radio-group">
            <label class="radio-item">
              <input type="radio" value="ALL" v-model="form.kieuApDung" />
              <span class="radio-custom"></span>
              Tất cả
            </label>
            <label class="radio-item">
              <input type="radio" value="PERSONAL" v-model="form.kieuApDung" />
              <span class="radio-custom"></span>
              Cá nhân
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Loại ưu đãi <span class="required">*</span></label>
          <div class="radio-group">
            <label class="radio-item">
              <input type="radio" value="PERCENT" v-model="form.loaiGiam" />
              <span class="radio-custom"></span>
              Giảm %
            </label>
            <label class="radio-item">
              <input type="radio" value="MONEY" v-model="form.loaiGiam" />
              <span class="radio-custom"></span>
              Giảm tiền
            </label>
          </div>
        </div>

        <!-- HÀNG 3: GIÁ TRỊ GIẢM + GIÁ TRỊ TỐI ĐA -->
        <div class="form-group">
          <label> Giá trị giảm <span class="required">*</span> </label>
          <div class="input-suffix">
            <input
              type="text"
              v-model="giaTriDisplay"
              :class="{ error: errors.giaTri }"
              @input="handleGiaTriInput"
              @blur="blurGiaTri"
            />
            <span class="suffix">
              {{ form.loaiGiam === "PERCENT" ? "%" : "đ" }}
            </span>
          </div>
          <small v-if="errors.giaTri" class="error-text">
            {{ errors.giaTri }}
          </small>
        </div>

        <div class="form-group">
          <label>
            Giá trị tối đa
            <span v-if="form.loaiGiam === 'PERCENT'" class="required">*</span>
          </label>
          <input
            type="text"
            v-model="giaTriToiDaDisplay"
            :disabled="form.loaiGiam === 'MONEY'"
            :class="{ error: errors.giaTriToiDa }"
            @input="handleGiaTriToiDaInput"
            @blur="blurGiaTriToiDa"
          />
          <small v-if="errors.giaTriToiDa" class="error-text">
            {{ errors.giaTriToiDa }}
          </small>
        </div>

        <!-- HÀNG 4: ĐIỀU KIỆN + SỐ LƯỢNG -->
        <div class="form-group">
          <label> Điều kiện đơn hàng <span class="required">*</span> </label>
          <input
            type="text"
            v-model="dieuKienDisplay"
            :class="{ error: errors.dieuKienDonHang }"
            @input="handleDieuKienInput"
            @blur="blurDieuKien"
          />
          <small v-if="errors.dieuKienDonHang" class="error-text">
            {{ errors.dieuKienDonHang }}
          </small>
        </div>

        <div class="form-group">
          <label> Số lượng <span class="required">*</span> </label>
          <input
            type="number"
            :value="
              form.kieuApDung === 'PERSONAL'
                ? selectedCustomerIds.length
                : form.soLuong
            "
            :disabled="form.kieuApDung === 'PERSONAL'"
            :class="{ error: errors.soLuong }"
            @input="
              form.soLuong = isNaN($event.target.valueAsNumber)
                ? null
                : Math.floor($event.target.valueAsNumber)
            "
            @blur="validateSoLuong"
          />
          <small v-if="errors.soLuong" class="error-text">
            {{ errors.soLuong }}
          </small>
        </div>

        <!-- HÀNG 5 -->
        <div class="form-group">
          <label> Ngày bắt đầu <span class="required">*</span> </label>
          <input type="date" v-model="form.ngayBatDau" @blur="validateNgay" />
          <small v-if="errors.ngayBatDau" class="error-text">
            {{ errors.ngayBatDau }}
          </small>
        </div>

        <div class="form-group">
          <label> Ngày kết thúc <span class="required">*</span> </label>
          <input type="date" v-model="form.ngayKetThuc" @blur="validateNgay" />
          <small v-if="errors.ngayKetThuc" class="error-text">
            {{ errors.ngayKetThuc }}
          </small>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-cancel" @click="back">Hủy</button>
        <button
          class="btn-save"
          @click="openConfirm"
          :disabled="loading || showModal"
        >
          <span v-if="!loading">Lưu</span>
          <span v-else>Đang lưu...</span>
        </button>
      </div>
    </div>

    <!-- ===== FRAME DƯỚI: KHÁCH HÀNG ===== -->
    <div class="customer-container" v-if="form.kieuApDung === 'PERSONAL'">
      <h4 class="customer-title">DANH SÁCH KHÁCH HÀNG</h4>

      <div class="customer-toolbar">
        <div class="toolbar-item search-flex">
          <label>Tìm kiếm khách hàng</label>
          <input
            class="toolbar-input"
            placeholder="Nhập tên hoặc email khách hàng"
            v-model="customerKeyword"
          />
        </div>

        <div class="toolbar-item">
          <label>Thống kê</label>
          <div class="switch-group">
            <button
              :class="{ active: thongKeType === 'THANG' }"
              @click="thongKeType = 'THANG'"
            >
              Tháng
            </button>
            <button
              :class="{ active: thongKeType === 'NAM' }"
              @click="thongKeType = 'NAM'"
            >
              Năm
            </button>
          </div>
        </div>

        <div class="toolbar-item">
          <label>Sắp xếp</label>
          <select class="toolbar-input" v-model="sortBy">
            <option value="">-- Chọn --</option>
            <option value="order-desc">Tổng đơn ↓</option>
            <option value="order-asc">Tổng đơn ↑</option>
            <option value="spend-desc">Chi tiêu ↓</option>
            <option value="spend-asc">Chi tiêu ↑</option>
          </select>
        </div>
      </div>

      <table class="customer-table">
        <thead>
          <tr>
            <th>
              <label class="custom-check">
                <input
                  type="checkbox"
                  :checked="isAllCustomerChecked"
                  @change="toggleSelectAllCustomers"
                />
                <span class="check-ui"></span>
              </label>
            </th>
            <th>STT</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Ngày sinh</th>
            <th>Tổng đơn</th>
            <th>Tổng chi tiêu</th>
            <th>Lần mua gần nhất</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(c, i) in pagedCustomers" :key="c.idKh">
            <td>
              <label class="custom-check">
                <input
                  type="checkbox"
                  :value="c.idKh"
                  v-model="selectedCustomerIds"
                />
                <span class="check-ui"></span>
              </label>
            </td>
            <td>
              {{ (customerCurrentPage - 1) * customerPageSize + i + 1 }}
            </td>
            <td>{{ c.tenKhachHang }}</td>
            <td>{{ c.email }}</td>
            <td>{{ formatDateVN(c.ngaySinh) }}</td>
            <td>
              {{ thongKeType === "THANG" ? c.tongDonHangThang : c.tongDonHang }}
            </td>
            <td>
              {{
                formatMoney(
                  thongKeType === "THANG" ? c.tongChiTieuThang : c.tongChiTieu,
                )
              }}
            </td>
            <td>{{ formatDateVN(c.lanMuaGanNhat) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <button
          class="nav-btn"
          @click="customerPrev"
          :disabled="customerCurrentPage === 1"
        >
          &lt;
        </button>

        <button
          v-for="p in customerVisiblePages"
          :key="p"
          class="page-btn"
          :class="{ active: p === customerCurrentPage }"
          :disabled="p === '...'"
          @click="p !== '...' && (customerCurrentPage = p)"
        >
          {{ p }}
        </button>

        <button
          class="nav-btn"
          @click="customerNext"
          :disabled="customerCurrentPage === customerTotalPages"
        >
          &gt;
        </button>
      </div>
    </div>

    <!-- ===== MODAL ===== -->
    <transition name="fade-modal">
      <div
        v-if="showModal"
        class="modal-confirm"
        @click.self="showModal = false"
      >
        <div class="confirm-box">
          <div class="confirm-icon-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12l3 3 5-5"></path>
            </svg>
          </div>

          <h3 class="confirm-title">Xác nhận</h3>

          <p class="confirm-desc">
            Bạn có chắc chắn muốn thêm phiếu giảm giá này?
          </p>

          <div class="confirm-actions">
            <button class="btn-cancel" @click="showModal = false">Hủy</button>

            <button class="btn-confirm" @click="submit" :disabled="loading">
              <span v-if="!loading">Đồng ý</span>
              <span v-else>Đang lưu...</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="toast.show" :class="['toast', toast.type]">
      <span class="toast-icon"></span>
      <span class="toast-text">{{ toast.message }}</span>
    </div>
  </div>

  <div v-if="loading" class="loading-overlay">
    <div class="spinner"></div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const selectedCustomerIds = ref([]);
const loading = ref(false);

const formatNumber = (value) => {
  if (!value) return "";
  return Number(value).toLocaleString("vi-VN");
};

const parseNumber = (value) => {
  return Number(value.replace(/\./g, "")) || 0;
};

const giaTriDisplay = ref("");
const giaTriToiDaDisplay = ref("");
const dieuKienDisplay = ref("");

const handleGiaTriInput = (e) => {
  const raw = e.target.value.replace(/\D/g, "");
  form.giaTri = Number(raw);
  giaTriDisplay.value = formatNumber(raw);
};

const blurGiaTri = () => {
  giaTriDisplay.value = formatNumber(form.giaTri);
  validateGiaTri();
};

const handleGiaTriToiDaInput = (e) => {
  const raw = e.target.value.replace(/\D/g, "");
  form.giaTriToiDa = Number(raw);
  giaTriToiDaDisplay.value = formatNumber(raw);
};

const blurGiaTriToiDa = () => {
  giaTriToiDaDisplay.value = formatNumber(form.giaTriToiDa);
  validateGiaTriToiDa();
};

const handleDieuKienInput = (e) => {
  const raw = e.target.value.replace(/\D/g, "");
  form.dieuKienDonHang = Number(raw);
  dieuKienDisplay.value = formatNumber(raw);
};

const blurDieuKien = () => {
  dieuKienDisplay.value = formatNumber(form.dieuKienDonHang);
  validateDieuKien();
};

const filter = reactive({
  minSpend: null,
});

const sortBy = ref("");

const form = reactive({
  maPgg: "",
  tenPgg: "",
  kieuApDung: "ALL",
  loaiGiam: "PERCENT",
  giaTri: null,
  giaTriToiDa: null,
  dieuKienDonHang: null,
  ngayBatDau: "",
  ngayKetThuc: "",
  soLuong: null,
});

const errors = reactive({
  tenPgg: "",
  giaTri: "",
  giaTriToiDa: "",
  dieuKienDonHang: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  soLuong: "",
});

const customers = ref([]);
const customerKeyword = ref("");

const showModal = ref(false);

const toast = reactive({
  show: false,
  message: "",
  type: "success",
});

const showToast = (message, type = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;

  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

const isAllCustomerChecked = computed(() => {
  if (pagedCustomers.value.length === 0) return false;
  return pagedCustomers.value.every((c) =>
    selectedCustomerIds.value.includes(c.idKh),
  );
});

const toggleSelectAllCustomers = (e) => {
  const ids = pagedCustomers.value.map((c) => c.idKh);

  if (e.target.checked) {
    selectedCustomerIds.value = Array.from(
      new Set([...selectedCustomerIds.value, ...ids]),
    );
  } else {
    selectedCustomerIds.value = selectedCustomerIds.value.filter(
      (id) => !ids.includes(id),
    );
  }
};

watch(
  () => form.kieuApDung,
  (v) => {
    if (v === "ALL") {
      selectedCustomerIds.value = [];
    }
  },
);

watch(
  () => form.loaiGiam,
  () => {
    form.giaTri = null;
    form.giaTriToiDa = null;
    errors.giaTri = "";
    errors.giaTriToiDa = "";

    validateGiaTri();
    validateGiaTriToiDa();
    validateDieuKien();
  },
);

watch(
  () => selectedCustomerIds.value.length,
  (v) => {
    if (form.kieuApDung === "PERSONAL") {
      form.soLuong = v;
      errors.soLuong = "";
    }
  },
);

const handleBlurTen = async () => {
  const ok = validateTenPgg();
  if (!ok) return;
  await checkTenTrung();
};

const validateTenPgg = () => {
  errors.tenPgg = "";

  if (!form.tenPgg || !form.tenPgg.trim()) {
    errors.tenPgg = "Tên phiếu giảm giá không được để trống";
    return false;
  }

  if (form.tenPgg.trim().length < 3) {
    errors.tenPgg = "Tên phải ít nhất 3 ký tự";
    return false;
  }

  if (form.tenPgg.trim().length > 50) {
    errors.tenPgg = "Tên tối đa 50 ký tự";
    return false;
  }

  const regex = /^[a-zA-Z0-9À-ỹ\s]+$/;

  if (!regex.test(form.tenPgg.trim())) {
    errors.tenPgg = "Tên không được chứa ký tự đặc biệt";
    return false;
  }

  return true;
};

const checkTenTrung = async () => {
  try {
    const res = await axios.get(
      "http://localhost:8080/admin/voucher/check-name",
      {
        params: { ten: form.tenPgg.trim() },
      },
    );

    if (res.data === true) {
      errors.tenPgg = "Tên phiếu giảm giá đã tồn tại";
      return false;
    }

    return true;
  } catch {
    errors.tenPgg = "Không kiểm tra được tên phiếu giảm giá";
    return false;
  }
};

const validateGiaTri = () => {
  errors.giaTri = "";

  if (form.giaTri === null || form.giaTri <= 0) {
    errors.giaTri = "Giá trị giảm phải lớn hơn 0";
    return false;
  }

  if (form.loaiGiam === "PERCENT" && form.giaTri > 100) {
    errors.giaTri = "Giảm % tối đa là 100";
    return false;
  }

  if (form.loaiGiam === "MONEY" && form.giaTri < 1000) {
    errors.giaTri = "Giảm tiền tối thiểu 1.000đ";
    return false;
  }

  return true;
};

const validateGiaTriToiDa = () => {
  errors.giaTriToiDa = "";

  if (form.loaiGiam !== "PERCENT") return true;

  if (!form.giaTriToiDa || form.giaTriToiDa <= 0) {
    errors.giaTriToiDa = "Giá trị tối đa phải lớn hơn 0";
    return false;
  }

  return true;
};

const validateDieuKien = () => {
  errors.dieuKienDonHang = "";

  if (form.dieuKienDonHang === null || form.dieuKienDonHang <= 0) {
    errors.dieuKienDonHang = "Điều kiện đơn hàng phải lớn hơn 0";
    return false;
  }

  if (form.loaiGiam === "MONEY" && form.dieuKienDonHang < form.giaTri) {
    errors.dieuKienDonHang = "Điều kiện đơn hàng phải ≥ giá trị giảm";
    return false;
  }

  if (form.loaiGiam === "PERCENT" && form.dieuKienDonHang < 1000) {
    errors.dieuKienDonHang = "Điều kiện đơn hàng quá thấp";
    return false;
  }

  return true;
};

const validateNgay = () => {
  errors.ngayBatDau = "";
  errors.ngayKetThuc = "";

  if (!form.ngayBatDau) {
    errors.ngayBatDau = "Vui lòng chọn ngày bắt đầu";
    return false;
  }

  if (!form.ngayKetThuc) {
    errors.ngayKetThuc = "Vui lòng chọn ngày kết thúc";
    return false;
  }

  const start = new Date(form.ngayBatDau);
  const end = new Date(form.ngayKetThuc);
  end.setHours(23, 59, 59, 999);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    errors.ngayBatDau = "Ngày bắt đầu không được nhỏ hơn hôm nay";
    return false;
  }

  if (end.getTime() < start.getTime()) {
    errors.ngayKetThuc = "Ngày kết thúc phải sau ngày bắt đầu";
    return false;
  }

  return true;
};

const validateSoLuong = () => {
  errors.soLuong = "";

  if (form.kieuApDung === "PERSONAL") {
    return true;
  }

  if (form.soLuong === null || form.soLuong <= 0) {
    errors.soLuong = "Số lượng phải lớn hơn 0";
    return false;
  }

  if (!Number.isInteger(form.soLuong)) {
    errors.soLuong = "Số lượng phải là số nguyên";
    return false;
  }

  return true;
};

const validateForm = async () => {
  let valid = true;

  if (!validateTenPgg()) valid = false;
  if (!validateGiaTri()) valid = false;
  if (!validateGiaTriToiDa()) valid = false;
  if (!validateDieuKien()) valid = false;
  if (!validateNgay()) valid = false;
  if (!validateSoLuong()) valid = false;

  if (valid) {
    const ok = await checkTenTrung();
    if (!ok) valid = false;
  }

  if (form.kieuApDung === "PERSONAL") {
    if (selectedCustomerIds.value.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 khách hàng", "error");
      valid = false;
    }

    // if (selectedCustomerIds.value.length > form.soLuong) {
    //   showToast("Số khách hàng không được vượt quá số lượng voucher", "error");
    //   valid = false;
    // }

    // if (selectedCustomerIds.value.length !== form.soLuong) {
    //   showToast("Số lượng phải bằng số khách hàng được chọn", "error");
    //   valid = false;
    // }
  }

  if (form.loaiGiam === "MONEY" && form.dieuKienDonHang < form.giaTri) {
    errors.dieuKienDonHang = "Điều kiện đơn hàng phải ≥ giá trị giảm";
    valid = false;
  }

  if (form.loaiGiam === "PERCENT" && form.giaTriToiDa > form.dieuKienDonHang) {
    showToast("Cảnh báo: Giá trị tối đa lớn hơn điều kiện đơn hàng", "error");
  }

  return valid;
};

const openConfirm = async () => {
  const ok = await validateForm();
  if (!ok) return;
  showModal.value = true;
};

const submit = async () => {
  showModal.value = false;
  loading.value = true;

  const payload = {
    ...form,
    soLuong:
      form.kieuApDung === "PERSONAL"
        ? selectedCustomerIds.value.length
        : form.soLuong,
    khachHangIds:
      form.kieuApDung === "PERSONAL" ? selectedCustomerIds.value : [],
  };

  try {
    await axios.post("http://localhost:8080/admin/voucher", payload);
    router.push({
      path: "/admin/voucher",
      query: { toast: "create-success" },
    });
  } catch (e) {
    showToast("Thêm phiếu giảm giá thất bại", "error");
  } finally {
    loading.value = false;
  }
};

const thongKeType = ref("THANG");

const filteredCustomers = computed(() => {
  let list = [...customers.value];

  const kw = customerKeyword.value?.trim().toLowerCase();
  if (kw) {
    list = list.filter(
      (c) =>
        c.tenKhachHang?.toLowerCase().includes(kw) ||
        c.email?.toLowerCase().includes(kw),
    );
  }

  if (filter.minSpend != null) {
    list = list.filter((c) => (c.tongChiTieu ?? 0) >= filter.minSpend);
  }

  switch (sortBy.value) {
    case "order-desc":
      return list.sort((a, b) => (b.tongDonHang ?? 0) - (a.tongDonHang ?? 0));

    case "order-asc":
      return list.sort((a, b) => (a.tongDonHang ?? 0) - (b.tongDonHang ?? 0));

    case "spend-desc":
      return list.sort((a, b) => (b.tongChiTieu ?? 0) - (a.tongChiTieu ?? 0));

    case "spend-asc":
      return list.sort((a, b) => (a.tongChiTieu ?? 0) - (b.tongChiTieu ?? 0));

    default:
      if (thongKeType.value === "THANG") {
        return list.sort(
          (a, b) => (b.tongChiTieuThang ?? 0) - (a.tongChiTieuThang ?? 0),
        );
      } else {
        return list.sort((a, b) => (b.tongChiTieu ?? 0) - (a.tongChiTieu ?? 0));
      }
  }
});

watch(thongKeType, () => {
  customerCurrentPage.value = 1;
});

const formatDateVN = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "-");

const formatMoney = (v) => {
  if (v == null) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(v) + " đ";
};

const customerCurrentPage = ref(1);
const customerPageSize = 6;

const customerTotalPages = computed(() =>
  Math.ceil(filteredCustomers.value.length / customerPageSize),
);

const pagedCustomers = computed(() => {
  const start = (customerCurrentPage.value - 1) * customerPageSize;
  return filteredCustomers.value.slice(start, start + customerPageSize);
});

const customerVisiblePages = computed(() => {
  const pages = [];
  const total = customerTotalPages.value;
  const current = customerCurrentPage.value;

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);

    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push("...");

    pages.push(total);
  }

  return pages;
});

const customerPrev = () => {
  if (customerCurrentPage.value > 1) {
    customerCurrentPage.value--;
  }
};

const customerNext = () => {
  if (customerCurrentPage.value < customerTotalPages.value) {
    customerCurrentPage.value++;
  }
};

watch([customerKeyword, sortBy], () => {
  customerCurrentPage.value = 1;
});

onMounted(async () => {
  try {
    const res = await axios.get(
      "http://localhost:8080/admin/voucher/next-code",
    );
    form.maPgg = res.data;

    const token = localStorage.getItem("accessToken");

    const cusRes = await axios.get(
      "http://localhost:8080/api/admin/khach-hang-thong-ke",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("CUSTOMERS:", cusRes.data);
    customers.value = cusRes.data;
  } catch (e) {
    console.error(e);
    showToast("Không tải được dữ liệu ban đầu", "error");
  }
});

const back = () => router.push("/admin/voucher");
</script>

<style scoped>
.page-wrapper {
  background: #f5f6f8;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.form-container,
.customer-container {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  margin-top: 24px;
  border: 1px solid #e0e0e0;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  margin-top: 1px;
  color: #63391f;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 40px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 480;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  width: 100%;
  max-width: 100%;
  height: 45px;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 10px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
}

.radio-item input {
  display: none;
}

.radio-custom {
  width: 16px;
  height: 16px;
  border: 2px solid #5a2d0c;
  border-radius: 50%;
  position: relative;
}

.radio-item input:checked + .radio-custom::after {
  content: "";
  width: 8px;
  height: 8px;
  background: #5a2d0c;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.input-suffix {
  position: relative;
  width: 100%;
}

.input-suffix input {
  width: 100%;
  height: 45px;
  padding-right: 44px;
  box-sizing: border-box;
}

.suffix {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #555;
  pointer-events: none;
}

.error {
  border-color: #e53935;
}

.error-text {
  color: #e53935;
  font-size: 13px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn-save {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save:hover {
  background: #4a2409;
}

.search-input {
  width: 97%;
  height: 42px;
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-bottom: 16px;
}

.customer-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  background: #fff;
}

.customer-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  margin-top: 1px;
  color: #63391f;
}

.customer-table th {
  height: 38px;
  padding: 6px 10px;
  font-size: 14px;
  font-weight: 600;
  background: #f3f3f3;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.customer-table td {
  height: 44px;
  padding: 10px 12px;
  font-size: 14px;
  border-bottom: 1px solid #eee;
}

.customer-table th,
.customer-table td {
  white-space: nowrap;
}

.customer-table thead th:first-child {
  border-top-left-radius: 8px;
}

.customer-table thead th:last-child {
  border-top-right-radius: 8px;
}

.customer-table th:first-child,
.customer-table td:first-child {
  width: 40px;
  text-align: center;
}

.customer-table tbody tr:hover {
  background: #fafafa;
}

.customer-table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 8px;
}

.customer-table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 8px;
}

.customer-table input[type="checkbox"] {
  width: 16px;
  height: 16px;
  transform: scale(1.1);
}

/* ===== CUSTOM CHECKBOX GIỐNG DGG ===== */
.custom-check {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Ẩn checkbox gốc */
.custom-check input {
  display: none;
}

/* Nút tròn */
.custom-check .check-ui {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  transition: all 0.2s ease;
}

/* icon + khi CHƯA tick */
.custom-check .check-ui::before {
  content: "+";
}

/* Hover */
.custom-check:hover .check-ui {
  border-color: #63391f;
  box-shadow: 0 0 5px rgba(99, 57, 31, 0.3);
}

/* Checked */
.custom-check input:checked + .check-ui {
  background: #63391f;
  border-color: #63391f;
  color: #fff;
}

/* Hiện dấu ✓ */
.custom-check input:checked + .check-ui::before {
  content: "✓";
}

/* ===== PAGINATION CHO BẢNG KHÁCH HÀNG ===== */
.customer-container .pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.customer-container .nav-btn {
  min-width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #63391f;

  display: flex;
  align-items: center;
  justify-content: center;
}

.customer-container .nav-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.customer-container .nav-btn:disabled {
  cursor: default;
  opacity: 0.4;
}

.customer-container .page-btn {
  min-width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.customer-container .page-btn:hover:not(:disabled):not(.active) {
  background: #f0f0f0;
}

.customer-container .page-btn.active {
  background: #63391f;
  color: #fff;
  border-color: #63391f;
}

.customer-container .page-btn:disabled {
  cursor: default;
  border: none;
  background: transparent;
  color: #999;
}

.switch-group {
  display: flex;
  border: 1px solid #ccc;
  border-radius: 6px;
  overflow: hidden;
  height: 42px;
}

.switch-group button {
  height: 100%;
  padding: 0 16px;
  border: none;
  background: #f3f3f3;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch-group button.active {
  background: #fff;
  color: #63391f;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* ===== CONFIRM MODAL ===== */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* Khung modal */
.confirm-modal {
  position: relative;
  width: 420px;
  background: #ffffff;
  border-radius: 16px;
  padding: 28px 24px 24px;
  text-align: center;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  animation: modalFade 0.2s ease;
}

/* Nút X góc phải */
.modal-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #888;
  transition: 0.2s;
}

.modal-close:hover {
  color: #333;
}

/* Icon cảnh báo */
.modal-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: #fff3cd;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
}

/* Tiêu đề */
.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #222;
}

/* Nội dung */
.modal-desc {
  font-size: 14px;
  color: #555;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* Nút */
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 14px;
}

/* Animation */
@keyframes modalFade {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 320px;
  padding: 14px 16px;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2000;
  animation: slideIn 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.toast.success {
  background: #e8f5e9;
  color: #2e7d32;
  border-left: 5px solid #2e7d32;
}

.toast.error {
  background: #fdecea;
  color: #c62828;
  border-left: 5px solid #c62828;
}

.toast-icon {
  font-size: 18px;
  font-weight: bold;
}

.toast-text {
  line-height: 1.4;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
}

.spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #ccc;
  border-top: 4px solid #5a2d0c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.required {
  color: #e53935;
  margin-left: 2px;
  font-weight: 600;
}

.customer-toolbar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
}

.toolbar-input {
  height: 42px;
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.toolbar-input:focus {
  outline: none;
  border-color: #5a2d0c;
}

.toolbar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toolbar-item label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.search-flex {
  flex: 1;
}

@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== CONFIRM MODAL ===== */

.modal-confirm {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  z-index: 2000;
}

.confirm-box {
  width: 400px;
  background: #ffffff;
  border-radius: 20px;
  padding: 30px 24px;
  background: #ffffff;
  border-radius: 20px;
  padding: 30px 24px;
  text-align: center;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: zoomIn 0.25s ease;
  animation: zoomIn 0.25s ease;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e8f5e9;
  color: #22c55e;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.confirm-icon-wrapper svg {
  display: block;
}

.confirm-title {
  font-size: 20px;
  font-weight: 600;
  font-size: 20px;
  font-weight: 600;
  color: #63391f;
  margin-bottom: 10px;
}

.confirm-desc {
  font-size: 14px;
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  margin-bottom: 24px;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-cancel,
.btn-confirm {
  min-width: 120px;
  height: 42px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
  padding: 0 20px;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: none;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: #63391f;
  color: #ffffff;
  border: none;
}

.btn-confirm:hover {
  background: #4e2c17;
}

.btn-confirm {
  background: #63391f;
  color: #ffffff;
  border: none;
}

.btn-confirm:hover {
  background: #4e2c17;
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.25s ease;
  transition: opacity 0.25s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
</style>
