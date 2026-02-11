<template>
  <div class="page-wrapper">
    <div class="form-container">
      <h3 class="form-title">CẬP NHẬT PHIẾU GIẢM GIÁ</h3>

      <div class="form-grid">
        <!-- ===== HÀNG 1 ===== -->
        <div class="form-group">
          <label>Mã phiếu giảm giá</label>
          <input disabled :value="form.maPgg" />
        </div>

        <div class="form-group">
          <label> Tên phiếu giảm giá <span class="required">*</span> </label>
          <input v-model="form.tenPgg" :class="{ error: errors.tenPgg }" />
          <small v-if="errors.tenPgg" class="error-text">
            {{ errors.tenPgg }}
          </small>
        </div>

        <!-- ===== HÀNG 2 ===== -->
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

        <!-- ===== HÀNG 3 ===== -->
        <div class="form-group">
          <label> Giá trị giảm <span class="required">*</span> </label>
          <div class="input-suffix">
            <input
              type="number"
              v-model.number="form.giaTri"
              :disabled="voucherMeta.trangThai !== 'CHUA_DIEN_RA'"
              :class="{ error: errors.giaTri }"
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
            type="number"
            v-model.number="form.giaTriToiDa"
            :disabled="
              form.loaiGiam === 'MONEY' ||
              voucherMeta.trangThai !== 'CHUA_DIEN_RA'
            "
            :class="{ error: errors.giaTriToiDa }"
          />
          <small v-if="errors.giaTriToiDa" class="error-text">
            {{ errors.giaTriToiDa }}
          </small>
        </div>

        <!-- ===== HÀNG 4 ===== -->
        <div class="form-group">
          <label> Điều kiện đơn hàng <span class="required">*</span> </label>
          <input
            type="number"
            v-model.number="form.dieuKienDonHang"
            :class="{ error: errors.dieuKienDonHang }"
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
            :disabled="
              form.kieuApDung === 'PERSONAL' ||
              voucherMeta.trangThai !== 'CHUA_DIEN_RA'
            "
            :class="{ error: errors.soLuong }"
            @input="
              form.soLuong = isNaN($event.target.valueAsNumber)
                ? null
                : Math.floor($event.target.valueAsNumber)
            "
          />
          <small v-if="errors.soLuong" class="error-text">
            {{ errors.soLuong }}
          </small>
        </div>

        <!-- ===== HÀNG 5 ===== -->
        <div class="form-group">
          <label> Ngày bắt đầu <span class="required">*</span> </label>
          <input
            type="date"
            v-model="form.ngayBatDau"
            :disabled="voucherMeta.trangThai === 'DANG_DIEN_RA'"
            :class="{ error: errors.ngayBatDau }"
          />
          <small v-if="errors.ngayBatDau" class="error-text">
            {{ errors.ngayBatDau }}
          </small>
        </div>

        <div class="form-group">
          <label> Ngày kết thúc <span class="required">*</span> </label>
          <input
            type="date"
            v-model="form.ngayKetThuc"
            :class="{ error: errors.ngayKetThuc }"
          />
          <small v-if="errors.ngayKetThuc" class="error-text">
            {{ errors.ngayKetThuc }}
          </small>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-save" @click="openConfirm" :disabled="loading">
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
            placeholder="Nhập tên hoặc email"
            v-model="customerKeyword"
          />
        </div>

        <div class="toolbar-item">
          <label>Sắp xếp</label>
          <select class="toolbar-input" v-model="sortBy">
            <option value="">-- Chọn --</option>
            <option value="order-desc">Đơn (tháng) ↓</option>
            <option value="order-asc">Đơn (tháng) ↑</option>
            <option value="spend-desc">Chi tiêu ↓</option>
            <option value="spend-asc">Chi tiêu ↑</option>
          </select>
        </div>

        <button class="btn-vip" @click="suggestVip">Gợi ý khách VIP</button>
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
            <th>Đơn (tháng)</th>
            <th>Chi tiêu (tháng)</th>
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
            <td>{{ c.tongDonHang ?? 0 }}</td>
            <td>{{ formatMoney(c.tongChiTieu) }}</td>
            <td>{{ formatDateVN(c.lanMuaGanNhat) || "Chưa mua" }}</td>
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
              fill="currentColor"
              width="40"
              height="40"
            >
              <path
                fill-rule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <h3 class="confirm-title">Xác nhận cập nhật</h3>

          <p class="confirm-desc">
            Bạn có chắc chắn muốn cập nhật phiếu giảm giá này?
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

    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
        <span class="toast-icon">
          {{ t.type === "success" ? "✔" : "✖" }}
        </span>
        <span class="toast-text">{{ t.message }}</span>
      </div>
    </div>
  </div>
  <div v-if="loading" class="loading-overlay">
    <div class="spinner"></div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const router = useRouter();
const route = useRoute();
const id = route.params.id;
let originalTenPgg = "";

const selectedCustomerIds = ref([]);

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
const sortBy = ref("");
const showModal = ref(false);
const loading = ref(false);

const toasts = ref([]);
let toastId = 0;

const showToast = (message, type = "success") => {
  const id = toastId++;

  toasts.value.push({
    id,
    message,
    type,
  });

  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 3000);
};

watch(
  () => form.loaiGiam,
  (v) => {
    if (v === "MONEY") {
      form.giaTriToiDa = null;
      errors.giaTriToiDa = "";
    }
  },
);

watch(
  () => form.kieuApDung,
  (v) => {
    if (v === "ALL") {
      selectedCustomerIds.value = [];
    }
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

const checkTenTrung = async () => {
  if (form.tenPgg.trim() === originalTenPgg.trim()) {
    return true;
  }

  try {
    const res = await axios.get(
      "http://localhost:8080/admin/voucher/check-name",
      {
        params: {
          ten: form.tenPgg.trim(),
          id: id,
        },
      },
    );

    if (res.data === true) {
      errors.tenPgg = "Tên phiếu giảm giá đã tồn tại";
      return false;
    }

    return true;
  } catch {
    showToast("Không kiểm tra được tên phiếu giảm giá", "error");
    return false;
  }
};

const validateForm = () => {
  let valid = true;
  Object.keys(errors).forEach((k) => (errors[k] = ""));

  if (voucherMeta.trangThai === "DA_KET_THUC") {
    showToast("Voucher đã kết thúc, không thể chỉnh sửa", "error");
    return false;
  }

  if (!form.tenPgg || !form.tenPgg.trim()) {
    errors.tenPgg = "Tên phiếu giảm giá không được để trống";
    valid = false;
  } else if (form.tenPgg.trim().length < 3) {
    errors.tenPgg = "Tên phải ít nhất 3 ký tự";
    valid = false;
  } else if (form.tenPgg.trim().length > 100) {
    errors.tenPgg = "Tên tối đa 100 ký tự";
    valid = false;
  }

  if (form.giaTri === null || form.giaTri <= 0) {
    errors.giaTri = "Giá trị giảm phải lớn hơn 0";
    valid = false;
  }

  if (form.loaiGiam === "PERCENT") {
    if (form.giaTri > 100) {
      errors.giaTri = "Giảm % tối đa là 100";
      valid = false;
    }

    if (form.giaTriToiDa === null || form.giaTriToiDa <= 0) {
      errors.giaTriToiDa = "Giá trị tối đa phải lớn hơn 0";
      valid = false;
    }

    if (form.giaTriToiDa > form.dieuKienDonHang) {
      errors.giaTriToiDa =
        "Giá trị tối đa không được lớn hơn điều kiện đơn hàng";
      valid = false;
    }
  }

  if (form.loaiGiam === "MONEY") {
    if (voucherMeta.trangThai === "CHUA_DIEN_RA" && form.giaTri < 1000) {
      errors.giaTri = "Giảm tiền tối thiểu 1.000đ";
      valid = false;
    }

    if (form.dieuKienDonHang < form.giaTri) {
      errors.dieuKienDonHang = "Điều kiện đơn hàng phải ≥ giá trị giảm";
      valid = false;
    }
  }

  if (form.dieuKienDonHang === null || form.dieuKienDonHang <= 0) {
    errors.dieuKienDonHang = "Điều kiện đơn hàng phải lớn hơn 0";
    valid = false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate = null;
  let endDate = null;

  if (form.ngayBatDau) {
    startDate = new Date(form.ngayBatDau);
    startDate.setHours(0, 0, 0, 0);
  }

  if (form.ngayKetThuc) {
    endDate = new Date(form.ngayKetThuc);
    endDate.setHours(23, 59, 59, 999);
  }

  if (!form.ngayBatDau) {
    errors.ngayBatDau = "Vui lòng chọn ngày bắt đầu";
    valid = false;
  } else if (voucherMeta.trangThai === "CHUA_DIEN_RA" && startDate < today) {
    errors.ngayBatDau = "Ngày bắt đầu không được nhỏ hơn hôm nay";
    valid = false;
  }

  if (voucherMeta.trangThai === "DANG_DIEN_RA" && endDate < today) {
    errors.ngayKetThuc = "Ngày kết thúc không được nhỏ hơn hôm nay";
    valid = false;
  }

  if (!form.ngayKetThuc) {
    errors.ngayKetThuc = "Vui lòng chọn ngày kết thúc";
    valid = false;
  } else if (endDate <= startDate) {
    errors.ngayKetThuc = "Ngày kết thúc phải sau ngày bắt đầu";
    valid = false;
  }

  if (form.kieuApDung === "ALL" && voucherMeta.soLuongDaSuDung > 0) {
    showToast(
      "Không thể chuyển sang áp dụng cho tất cả khi voucher đã được sử dụng",
      "error",
    );
    return false;
  }

  if (form.kieuApDung === "ALL" && voucherMeta.trangThai === "CHUA_DIEN_RA") {
    if (form.soLuong === null || form.soLuong <= 0) {
      errors.soLuong = "Số lượng phải lớn hơn 0";
      valid = false;
    }

    if (!Number.isInteger(form.soLuong)) {
      errors.soLuong = "Số lượng phải là số nguyên";
      valid = false;
    }

    if (form.soLuong < voucherMeta.soLuongDaSuDung) {
      errors.soLuong = "Số lượng không được nhỏ hơn số đã sử dụng";
      valid = false;
    }
  }

  if (form.kieuApDung === "PERSONAL") {
    if (selectedCustomerIds.value.length === 0) {
      showToast("Vui lòng chọn ít nhất một khách hàng", "error");
      valid = false;
    }

    if (selectedCustomerIds.value.length < voucherMeta.soLuongDaSuDung) {
      showToast("Không thể giảm số khách hàng đã sử dụng voucher", "error");
      valid = false;
    }

    form.soLuong = selectedCustomerIds.value.length;
  }

  return valid;
};

const cannotRemoveIds = ref([]);

watch(
  selectedCustomerIds,
  (newVal, oldVal) => {
    const removed = cannotRemoveIds.value.filter((id) => !newVal.includes(id));

    if (removed.length) {
      selectedCustomerIds.value = Array.from(new Set([...newVal, ...removed]));
      showToast("Không thể bỏ khách hàng đã sử dụng voucher", "error");
    }
  },
  { deep: true },
);

const openConfirm = async () => {
  if (!validateForm()) return;

  const ok = await checkTenTrung();
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
    await axios.put(`http://localhost:8080/admin/voucher/${id}`, payload);

    router.push({
      path: "/admin/voucher",
      query: {
        toast: "update-success",
      },
    });
  } catch (e) {
    showToast("Cập nhật phiếu giảm giá thất bại", "error");
  } finally {
    loading.value = false;
  }
};

const filteredCustomers = computed(() => {
  let list = [...customers.value];

  if (customerKeyword.value) {
    const kw = customerKeyword.value.toLowerCase();
    list = list.filter(
      (c) =>
        c.tenKhachHang.toLowerCase().includes(kw) ||
        (c.email && c.email.toLowerCase().includes(kw)),
    );
  }

  if (sortBy.value === "order-desc") {
    list.sort((a, b) => (b.tongDonHang ?? 0) - (a.tongDonHang ?? 0));
  }

  if (sortBy.value === "order-asc") {
    list.sort((a, b) => (a.tongDonHang ?? 0) - (b.tongDonHang ?? 0));
  }

  if (sortBy.value === "spend-desc") {
    list.sort((a, b) => (b.tongChiTieu ?? 0) - (a.tongChiTieu ?? 0));
  }

  if (sortBy.value === "spend-asc") {
    list.sort((a, b) => (a.tongChiTieu ?? 0) - (b.tongChiTieu ?? 0));
  }

  return list;
});

watch(filteredCustomers, () => {
  if (customerCurrentPage.value > customerTotalPages.value) {
    customerCurrentPage.value = 1;
  }
});

const formatDateVN = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "-");

const formatMoney = (v) => {
  if (!v) return "0 đ";
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

const voucherMeta = reactive({
  trangThai: "",
  soLuongDaSuDung: 0,
});

const suggestVip = () => {
  const vipList = customers.value
    .filter(
      (c) => (c.tongDonHang ?? 0) >= 5 || (c.tongChiTieu ?? 0) >= 5_000_000,
    )
    .map((c) => c.idKh);

  if (vipList.length === 0) {
    showToast("Không có khách VIP theo tiêu chí hiện tại", "error");
    return;
  }

  // Không cho bỏ khách đã dùng voucher
  const finalIds = Array.from(new Set([...vipList, ...cannotRemoveIds.value]));

  selectedCustomerIds.value = Array.from(
    new Set([...selectedCustomerIds.value, ...finalIds]),
  );

  showToast(`Đã chọn ${finalIds.length} khách VIP`);
};

onMounted(async () => {
  const res = await axios.get(`http://localhost:8080/admin/voucher/${id}`);

  const {
    maPgg,
    tenPgg,
    kieuApDung,
    loaiGiam,
    giaTri,
    giaTriToiDa,
    dieuKienDonHang,
    ngayBatDau,
    ngayKetThuc,
    soLuong,
    trangThai,
    soLuongDaSuDung,
  } = res.data;

  Object.assign(form, {
    maPgg,
    tenPgg,
    kieuApDung,
    loaiGiam,
    giaTri,
    giaTriToiDa,
    dieuKienDonHang,
    ngayBatDau,
    ngayKetThuc,
    soLuong,
  });

  originalTenPgg = tenPgg;

  if (loaiGiam === "MONEY") {
    form.giaTriToiDa = null;
  }

  voucherMeta.trangThai = trangThai;
  voucherMeta.soLuongDaSuDung = soLuongDaSuDung;

  if (res.data.khachHangIds) {
    selectedCustomerIds.value = [...res.data.khachHangIds];
  }

  const cusRes = await axios.get(
    "http://localhost:8080/api/admin/khach-hang-thong-ke",
  );
  customers.value = cusRes.data;

  cannotRemoveIds.value = res.data.khachHangDaSuDungIds || [];
});

const back = () => router.push("/admin/voucher");
</script>

<style scoped>
.page-wrapper {
  padding: 25px;
  background: #f5f6f8;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  gap: 18px 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
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
  margin-top: 6px;
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
  padding: 8px 44px 8px 12px;
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
  background: #5a2d0c;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save:hover {
  background: #4a2409;
}

.btn-cancel {
  background: #e0e0e0;
  border: none;
  padding: 8px 18px;
  border-radius: 4px;
  cursor: pointer;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-bottom: 16px;
}

.customer-table {
  width: 100%;
  border-collapse: collapse;
}

.customer-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  margin-top: 1px;
  color: #63391f;
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

.btn-vip {
  height: 42px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 500;
  background: #f59e0b;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-vip:hover {
  background: #d97706;
}

.customer-table th {
  height: 44px;
  padding: 10px 12px;
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

.customer-table tbody tr:hover {
  background: #fafafa;
}

.customer-table input[type="checkbox"] {
  width: 16px;
  height: 16px;
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

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #222;
}

.modal-desc {
  font-size: 14px;
  color: #555;
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 14px;
}

.btn-cancel {
  min-width: 100px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  cursor: pointer;
  transition: 0.2s;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-confirm {
  min-width: 120px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: #63391f;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background: #d97706;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2000;
}

.toast {
  min-width: 320px;
  padding: 14px 16px;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  animation:
    slideIn 0.35s ease,
    fadeOut 0.35s ease 2.7s forwards;
}

@keyframes fadeOut {
  to {
    opacity: 0;
    transform: translateX(20px);
  }
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

@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
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
  display: block; /* Chuyển thành block để flex căn chuẩn hơn */
  margin: 0; /* Xóa margin mặc định nếu có */

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
