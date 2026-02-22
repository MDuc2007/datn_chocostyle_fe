<template>
  <div class="voucher-page">
    <div class="frame-top">
      <div class="header-row">
        <h3 class="tittle">QUẢN LÝ PHIẾU GIẢM GIÁ</h3>

        <!-- <div class="total-voucher">
          Tổng số phiếu giảm giá:
          <strong>{{ totalVoucher }}</strong>
        </div> -->
      </div>

      <div class="search-row">
        <div class="search-item">
          <label>Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên PGG"
            v-model="keyword"
          />
        </div>
      </div>

      <div class="filter-row">
        <div class="filters">
          <div class="filter-item">
            <label>Kiểu</label>
            <select v-model="filter.kieuApDung">
              <option value="">Kiểu áp dụng</option>
              <option value="ALL">Tất cả</option>
              <option value="PERSONAL">Cá nhân</option>
            </select>
          </div>

          <div class="filter-item">
            <label>Loại giảm</label>
            <select v-model="filter.loaiGiam">
              <option value="">Loại giảm</option>
              <option value="PERCENT">Giảm %</option>
              <option value="MONEY">Giảm tiền</option>
            </select>
          </div>

          <div class="filter-item">
            <label>Ngày bắt đầu</label>
            <input type="date" v-model="filter.fromDate" />
          </div>

          <div class="filter-item">
            <label>Ngày kết thúc</label>
            <input type="date" v-model="filter.toDate" />
          </div>

          <div class="filter-item">
            <label>Trạng thái</label>
            <select v-model.number="filter.trangThai">
              <option value="">Tất cả trạng thái</option>
              <option :value="1">Đang diễn ra</option>
              <option :value="2">Sắp diễn ra</option>
              <option :value="-1">Ngừng hoạt động</option>
              <option :value="0">Đã kết thúc</option>
            </select>
          </div>

          <button class="btn-clear" @click="resetFilter">
            <img
              src="/src/assets/icon/refesh.svg"
              style="width: 20px; height: 20px"
              alt=""
            />
          </button>
        </div>

        <button class="btn-add" @click="goCreate">+ Thêm phiếu giảm giá</button>
      </div>
    </div>

    <div class="frame-bottom">
      <table class="voucher-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã</th>
            <th>Tên</th>
            <th>Kiểu áp dụng</th>
            <th>Chi tiết ưu đãi</th>
            <th>Thời gian áp dụng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in pagedList" :key="item.id">
            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>

            <td>{{ item.maPgg }}</td>

            <td>{{ item.tenPgg }}</td>

            <td>
              <span :class="kieuApDungClass(item.kieuApDung)">
                {{ kieuApDungText(item.kieuApDung) }}
              </span>
            </td>

            <td class="text-center">
              <div class="discount-main">
                <strong>
                  {{
                    item.loaiGiam === "PERCENT"
                      ? `Giảm ${item.giaTri}%`
                      : `Giảm ${formatMoney(item.giaTri)}`
                  }}
                </strong>
              </div>

              <div v-if="item.giaTriToiDa" class="discount-sub">
                Tối đa: {{ formatMoney(item.giaTriToiDa) }}
              </div>

              <div v-if="item.dieuKienDonHang" class="discount-sub">
                Đơn tối thiểu: {{ formatMoney(item.dieuKienDonHang) }}
              </div>
            </td>

            <td>
              Từ {{ formatDateVN(item.ngayBatDau) }}<br />
              Đến {{ formatDateVN(item.ngayKetThuc) }}
            </td>

            <td>
              <span :class="statusClass(item)">
                {{ statusText(item) }}
              </span>
            </td>

            <td>
              <div class="action-cell">
                <span class="tooltip-wrapper" data-tooltip="Đổi trạng thái">
                  <label class="switch">
                    <input
                      type="checkbox"
                      :checked="
                        calcTrangThai(item) === 1 || calcTrangThai(item) === 2
                      "
                      :disabled="calcTrangThai(item) === 0"
                      @click.prevent="toggleStatus(item)"
                    />
                    <span class="slider"></span>
                  </label>
                </span>

                <span class="tooltip-wrapper" data-tooltip="Chỉnh sửa">
                  <span class="icon-edit" @click="goEdit(item)">
                    <img src="/src/assets/icon/edit.svg" alt="" />
                  </span>
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <!-- PREV -->
        <button
          class="nav-btn"
          @click="previousPage"
          :disabled="currentPage === 1"
        >
          &lt;
        </button>

        <!-- PAGE NUMBERS -->
        <button
          v-for="p in visiblePages"
          :key="p"
          class="page-btn"
          :class="{ active: p === currentPage }"
          :disabled="p === '...'"
          @click="p !== '...' && (currentPage = p)"
        >
          {{ p }}
        </button>

        <!-- NEXT -->
        <button
          class="nav-btn"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          &gt;
        </button>
      </div>
    </div>
  </div>

  <transition name="fade-modal">
    <div
      v-if="showStatusModal"
      class="modal-confirm"
      @click.self="cancelToggle"
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

        <h3 class="confirm-title">Xác nhận</h3>

        <p class="confirm-desc">
          {{
            willDeactivate
              ? "Ngừng hoạt động phiếu giảm giá này?"
              : "Kích hoạt lại phiếu giảm giá này?"
          }}
        </p>

        <div class="confirm-actions">
          <button class="btn-cancel" @click="cancelToggle">Hủy</button>

          <button class="btn-confirm" @click="confirmToggle">Đồng ý</button>
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
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const host = "http://localhost:8080";

const router = useRouter();
const route = useRoute();

const list = ref([]);
const keyword = ref("");
const currentPage = ref(1);
const pageSize = 8;

const filter = reactive({
  loaiGiam: "",
  kieuApDung: "",
  fromDate: "",
  toDate: "",
  trangThai: "",
});

const totalVoucher = computed(() => filteredList.value.length);

const goCreate = () => {
  router.push("/admin/voucher/create");
};

const goEdit = (item) => {
  const trangThai = calcTrangThai(item);

  if (trangThai === 0) {
    showToast("Không thể cập nhật phiếu giảm giá đã hết hạn", "error");
    return;
  }

  router.push(`/admin/voucher/update/${item.id}`);
};

const kieuApDungText = (v) => (v === "ALL" ? "Tất cả" : "Cá nhân");

const kieuApDungClass = (v) => (v === "ALL" ? "apply-all" : "apply-personal");

const formatDateVN = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("vi-VN");
};

const formatMoney = (v) => (v ? v.toLocaleString("vi-VN") + " ₫" : "0 ₫");

const filteredList = computed(() => {
  let data = [...list.value];

  if (keyword.value) {
    const kw = keyword.value.toLowerCase();
    data = data.filter(
      (i) =>
        i.maPgg.toLowerCase().includes(kw) ||
        i.tenPgg.toLowerCase().includes(kw),
    );
  }

  if (filter.loaiGiam) {
    data = data.filter((i) => i.loaiGiam === filter.loaiGiam);
  }

  if (filter.kieuApDung) {
    data = data.filter((i) => i.kieuApDung === filter.kieuApDung);
  }

  if (filter.trangThai !== "") {
    data = data.filter((i) => calcTrangThai(i) === filter.trangThai);
  }

  if (filter.fromDate) {
    const from = new Date(filter.fromDate);
    data = data.filter((i) => new Date(i.ngayBatDau) >= from);
  }

  if (filter.toDate) {
    const to = new Date(filter.toDate);
    to.setHours(23, 59, 59, 999);
    data = data.filter((i) => new Date(i.ngayKetThuc) <= to);
  }

  return data;
});

const totalPages = computed(() =>
  Math.ceil(filteredList.value.length / pageSize),
);

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredList.value.slice(start, start + pageSize);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);

    if (current > 4) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 3) pages.push("...");

    pages.push(total);
  }

  return pages;
});

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

watch(
  () => [filter.fromDate, filter.toDate],
  () => {
    if (filter.fromDate && filter.toDate && filter.fromDate > filter.toDate) {
      showToast("Ngày bắt đầu không được lớn hơn ngày kết thúc", "error");
      filter.toDate = "";
    }
  },
);

watch(keyword, () => {
  currentPage.value = 1;
});

const mapData = (data) => data;

const load = async () => {
  const res = await axios.get(`${host}/admin/voucher`);
  list.value = mapData(res.data);
};

const fetchFilter = async () => {
  currentPage.value = 1;

  const res = await axios.get(`${host}/admin/voucher/filter`, {
    params: {
      loaiGiam: filter.loaiGiam || null,
      kieuApDung: filter.kieuApDung || null,
      fromDate: filter.fromDate || null,
      toDate: filter.toDate || null,
      trangThai: filter.trangThai !== "" ? filter.trangThai : null,
    },
  });

  list.value = mapData(res.data);
};

const resetFilter = () => {
  keyword.value = "";
  filter.loaiGiam = "";
  filter.kieuApDung = "";
  filter.fromDate = "";
  filter.toDate = "";
  filter.trangThai = "";
  currentPage.value = 1;
  load();
};

const isExpired = (item) => {
  return new Date() > new Date(item.ngayKetThuc);
};

const willDeactivate = ref(false);

const toggleStatus = (item) => {
  if (calcTrangThai(item) === 0) {
    showToast("Phiếu giảm giá đã kết thúc, không thể thay đổi", "error");
    return;
  }

  selectedItem.value = item;
  willDeactivate.value = item.trangThai === 1;
  showStatusModal.value = true;
};

const confirmToggle = async () => {
  if (!selectedItem.value) return;

  try {
    await axios.put(`${host}/admin/voucher/${selectedItem.value.id}/toggle`);

    showStatusModal.value = false;
    selectedItem.value = null;

    load();
    showToast("Cập nhật trạng thái thành công", "success");
  } catch (e) {
    showToast(e.response?.data || "Không thể thay đổi trạng thái", "error");
  }
};

const cancelToggle = () => {
  showStatusModal.value = false;
  selectedItem.value = null;
};

const showStatusModal = ref(false);
const selectedItem = ref(null);

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

const calcTrangThai = (item) => {
  const now = new Date();
  const start = new Date(item.ngayBatDau);
  const end = new Date(item.ngayKetThuc);

  end.setHours(23, 59, 59, 999);

  if (now > end) return 0;
  if (item.trangThai === 0) return -1;
  if (now < start) return 2;
  return 1;
};

const loaiGiamText = (v) => (v === "PERCENT" ? "Giảm %" : "Giảm tiền");

const statusText = (item) => {
  const s = calcTrangThai(item);
  return s === 1
    ? "Đang diễn ra"
    : s === 2
      ? "Sắp diễn ra"
      : s === -1
        ? "Ngừng hoạt động"
        : "Đã kết thúc";
};

const statusClass = (item) => {
  const s = calcTrangThai(item);
  return s === 1
    ? "status-active"
    : s === 2
      ? "status-upcoming"
      : s === -1
        ? "status-stop"
        : "status-stop";
};

const formatDate = (d) => (d ? d.substring(0, 10) : "");

let filterTimeout;

watch(
  () => ({ ...filter }),
  () => {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
      currentPage.value = 1;
      fetchFilter();
    }, 300);
  },
  { deep: true },
);

onMounted(() => {
  load();

  if (route.query.toast === "create-success") {
    showToast("Thêm phiếu giảm giá thành công", "success");
    router.replace({ query: {} });
  }

  if (route.query.toast === "update-success") {
    showToast("Cập nhật phiếu giảm giá thành công", "success");
    router.replace({ query: {} });
  }
});
</script>

<style scoped>
/* ================= LAYOUT ================= */
.voucher-page {
  background: #f7f7f7;
}

.frame-top,
.frame-bottom {
  background: #fff;
  padding: 16px 20px;
  border-radius: 20px;
}

.frame-top {
  margin-bottom: 16px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tittle {
  color: #63391f;
  font-size: 25px;
  margin: 0;
}

/* ================= SEARCH ================= */
.search-row {
  margin-bottom: 12px;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 10px;
  color: #484848;
}

.search-item input {
  width: 460px;
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.search-item input:focus {
  outline: none;
  border-color: #5a2d0c;
  box-shadow: 0 0 0 2px rgba(90, 45, 12, 0.15);
}

/* ================= FILTER ================= */
.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.filters {
  display: flex;
  gap: 14px;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-item label {
  font-size: 15px;
  font-weight: 600;
  color: #484848;
}

.filters input,
.filters select,
.filters button {
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 14px;
  background: #fff;
}

.filters input[type="date"] {
  min-width: 140px;
}

.filters select {
  min-width: 150px;
}

.filters input:focus,
.filters select:focus {
  outline: none;
  border-color: #5a2d0c;
  box-shadow: 0 0 0 2px rgba(90, 45, 12, 0.15);
}

.filters button {
  cursor: pointer;
  background: #f3f3f3;
}

.filters button:hover {
  background: #eaeaea;
}

/* ================= BUTTON ADD ================= */
.btn-add {
  height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid #ccc;
  background: #ffffff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
}

/* ================= TABLE ================= */
.voucher-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.voucher-table thead th {
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 10px;
}

.voucher-table th,
.voucher-table td {
  padding: 8px;
  text-align: center;
}

.voucher-table td {
  border-bottom: 1px solid #ddd;
}

.voucher-table tbody tr:hover {
  background: #fafafa;
}

/* ================= DISCOUNT ================= */
.discount-main {
  color: #e53935;
  margin-bottom: 4px;
}

.discount-sub {
  color: #888;
  line-height: 1.4;
}

/* ================= STATUS ================= */
.status-active,
.status-upcoming,
.status-stop {
  display: inline-block;
  min-width: 90px;
  padding: 6px 12px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

.status-active {
  background: #e7f7ef;
  color: #1b7f4b;
}

.status-upcoming {
  background: #fff4e5;
  color: #c77700;
}

.status-stop {
  background: #fdecea;
  color: #c62828;
}

/* ================= APPLY TYPE ================= */
.apply-all,
.apply-personal {
  display: inline-block;
  min-width: 90px;
  padding: 6px 12px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

.apply-all {
  background: #e7f7ef;
  color: #1b7f4b;
}

.apply-personal {
  background: #fff4e5;
  color: #c77700;
}

/* ================= ACTION ================= */
.action-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.icon-edit img {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* ================= SWITCH ================= */
.switch {
  position: relative;
  width: 42px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  background: #ccc;
  border-radius: 22px;
  transition: 0.3s;
  cursor: pointer;
}

.slider::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  left: 2px;
  bottom: 2px;
  background: #fff;
  border-radius: 50%;
  transition: 0.3s;
}

.switch input:checked + .slider {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
}

.switch input:checked + .slider::before {
  transform: translateX(20px);
}

/* ================= PAGINATION ================= */
.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 15px 0;
}

.nav-btn,
.page-btn {
  min-width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  font-weight: 600;
  cursor: pointer;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.page-btn.active {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: #fff;
  border: none;
}

.page-btn:disabled {
  border: none;
  background: transparent;
  color: #999;
}

/* ================= MODAL ================= */
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
}

.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fff4e5;
  color: #ff9800;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.confirm-actions {
  display: flex;
  gap: 20px;
}

.btn-confirm,
.btn-cancel {
  flex: 1;
  height: 42px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-confirm {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: #fff;
}

.btn-confirm:hover {
  background: #4e2c17;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
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

/* ================= TOAST ================= */
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
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
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

/* ================= TOOLTIP ================= */
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-wrapper::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: 0.2s ease;
}

.tooltip-wrapper::before {
  content: "";
  position: absolute;
  bottom: 115%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
  opacity: 0;
  transition: 0.2s ease;
}

.tooltip-wrapper:hover::after,
.tooltip-wrapper:hover::before {
  opacity: 1;
}

.switch {
  position: relative;
  width: 42px;
  height: 22px;
  display: inline-block;
}

</style>
