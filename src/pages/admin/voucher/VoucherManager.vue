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
              <option :value="0">Ngừng hoạt động</option>
            </select>
          </div>

          <button @click="resetFilter">Đặt lại</button>
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
                <span class="tooltip-wrapper" data-tooltip="Chỉnh sửa">
                  <span class="icon-edit" @click="goEdit(item.id)">
                    <img src="/src/assets/icon/edit.svg" alt="" />
                  </span>
                </span>

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
  <div v-if="showStatusModal" class="modal-mask">
    <div class="modal-box">
      <h3>Xác nhận</h3>

      <p>
        {{
          pendingChecked
            ? "Kích hoạt lại phiếu giảm giá này?"
            : "Ngừng hoạt động phiếu giảm giá này?"
        }}
      </p>

      <div class="modal-actions">
        <button class="btn-cancel" @click="cancelToggle">Hủy</button>
        <button class="btn-confirm" @click="confirmToggle">Xác nhận</button>
      </div>
    </div>
  </div>

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

const goEdit = (id) => {
  router.push(`/admin/voucher/update/${id}`);
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
  if (!keyword.value) return list.value;
  const kw = keyword.value.toLowerCase();
  return list.value.filter(
    (i) =>
      i.maPgg.toLowerCase().includes(kw) || i.tenPgg.toLowerCase().includes(kw),
  );
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
  () => ({ ...filter }),
  () => {
    currentPage.value = 1;
    fetchFilter();
  },
  { deep: true },
);

watch(keyword, () => {
  currentPage.value = 1;
});

const mapData = (data) =>
  data.map((i) => ({
    ...i,
    _checked: i.trangThai !== 0,
  }));

const load = async () => {
  const res = await axios.get(`${host}/admin/voucher`);
  list.value = mapData(res.data);
};

const fetchFilter = async () => {
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
  filter.loaiGiam = "";
  filter.kieuApDung = "";
  filter.fromDate = "";
  filter.toDate = "";
  filter.trangThai = "";
  load();
};

const isExpired = (item) => {
  return new Date() > new Date(item.ngayKetThuc);
};

const toggleStatus = (item) => {
  if (calcTrangThai(item) === 0) return;

  selectedItem.value = item;
  pendingChecked.value = calcTrangThai(item) === -1;
  showStatusModal.value = true;
};

const confirmToggle = async () => {
  try {
    await axios.put(`${host}/admin/voucher/${selectedItem.value.id}/toggle`);

    showStatusModal.value = false;
    selectedItem.value = null;

    load();

    showToast("Cập nhật trạng thái thành công", "success");
  } catch (e) {
    selectedItem.value._checked = !pendingChecked.value;
    showToast(e.response?.data || "Không thể thay đổi trạng thái", "error");
  }
};

const cancelToggle = () => {
  selectedItem.value._checked = !pendingChecked.value;
  showStatusModal.value = false;
  selectedItem.value = null;
};

const showStatusModal = ref(false);
const selectedItem = ref(null);
const pendingChecked = ref(false);

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

  // Hết hạn thì chết hẳn
  if (now > end) return 0;

  // Bị tắt thủ công
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
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tittle {
  color: #63391f;
  font-size: 25px;
  margin-top: 1px;
  margin-bottom: 7px;
}

.total-voucher {
  font-size: 15px;
  color: #333;
}

.total-voucher strong {
  font-weight: 600;
}

.voucher-page {
  background: #f7f7f7;
}

.frame-top {
  background: #fff;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.search-row {
  margin-bottom: 12px;
}

.search-item {
  display: flex;
  flex-direction: column;
  font-size: 15px;
  font-weight: 600;
  color: #484848;
  gap: 4px;
}

.search-item input {
  width: 460px;
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.search-row input:focus {
  outline: none;
  border-color: #5a2d0c;
  box-shadow: 0 0 0 2px rgba(90, 45, 12, 0.15);
}

.filter-box {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-end;
}

.filters {
  display: flex;
  gap: 14px;
  align-items: flex-end;
}

.filters input,
.filters select,
.filters button {
  height: 40px; /* 👈 BẰNG SEARCH */
  padding: 0 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 14px;
  color: #555555a4;
  background: #fff;
}
.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px; /* tăng từ 4px → 8px hoặc 10px */
}

.filter-item label {
  font-size: 15px;
  font-weight: 600;
  color: #484848;
}

.filters select {
  min-width: 150px;
}

.filters input[type="date"] {
  min-width: 140px;
}

.filters button {
  white-space: nowrap;
}

.frame-bottom {
  background: #fff;
  padding: 16px 20px;
}

.frame-top,
.frame-bottom {
  border-radius: 20px;
}

.btn-add {
  background: #5a2d0c;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  align-self: flex-end;
}

.voucher-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  background: #fff;
}
.voucher-table thead th {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 20px;
}

.voucher-table thead th:first-child {
  border-top-left-radius: 8px;
}

.voucher-table thead th:last-child {
  border-top-right-radius: 8px;
}

.voucher-table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 8px;
}

.voucher-table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 8px;
}

.voucher-table tbody tr:hover {
  background: #fafafa;
}

.voucher-table th {
  color: rgb(0, 0, 0);
  padding: 10px;
}

.voucher-table td {
  padding: 8px;
  border-bottom: 1px solid #ddd;
  text-align: center;
}

.voucher-table td.text-center {
  text-align: center;
}

.voucher-table td span {
  vertical-align: middle;
}

.voucher-table td.text-left {
  text-align: left;
  line-height: 1.5;
}

.discount-main {
  color: #e53935;
  margin-bottom: 4px;
}

.discount-sub {
  color: #888;
  line-height: 1.4;
}

.status-active {
  background: #e7f7ef;
  color: #1b7f4b;
  border: 1px solid #a8e5c7;
}

.status-upcoming {
  background: #fff4e5;
  color: #c77700;
  border: 1px solid #ffd59e;
}

.status-stop {
  background: #fdecea;
  color: #c62828;
  border: 1px solid #f5b5b0;
}

.status-active,
.status-upcoming,
.status-stop {
  display: inline-block;
  min-width: 90px;
  padding: 6px 12px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  line-height: 1;
}

.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.icon-edit {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.icon-edit img {
  width: 20px;
  height: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 15px 0;
}

.nav-btn {
  min-width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #63391f;

  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.nav-btn:disabled {
  cursor: default;
  opacity: 0.4;
  background: #fff;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: #f0f0f0;
}

.page-btn.active {
  background: #63391f;
  color: #fff;
  border-color: #63391f;
}

.page-btn:disabled {
  cursor: default;
  border: none;
  background: transparent;
  color: #999;
}

.switch {
  position: relative;
  display: inline-block;
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
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 22px;
}

.slider::before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.switch input:checked + .slider {
  background-color: #5a2d0c;
}

.switch input:checked + .slider::before {
  transform: translateX(20px);
}

.filters input[type="date"] {
  min-width: 140px;
}

.filters input:focus,
.filters select:focus {
  outline: none;
  border-color: #5a2d0c;
  box-shadow: 0 0 0 2px rgba(90, 45, 12, 0.15);
}

.filters input::placeholder {
  color: #999;
  font-size: 13px;
}

.filters button {
  height: 38px;
  padding: 0 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #f3f3f3;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filters button:hover {
  background: #eaeaea;
  border-color: #bbb;
}

.btn-add {
  height: 40px; /* 👈 bằng input */
  padding: 0 16px; /* ngang vừa tay */
  border: 1px solid #ccc;
  border-radius: 10px; /* 👈 bo y hệt */
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #484848;

  transition: background 0.2s ease;
}

.apply-all {
  background: #e7f7ef;
  color: #1b7f4b;
  border: 1px solid #a8e5c7;
}

.apply-personal {
  background: #fff4e5;
  color: #c77700;
  border: 1px solid #ffd59e;
}

.apply-all,
.apply-personal {
  display: inline-block;
  min-width: 90px;
  padding: 6px 12px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  line-height: 1;
}
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-box {
  background: #fff;
  width: 360px;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.modal-box h3 {
  margin-bottom: 10px;
}

.modal-box p {
  margin-bottom: 20px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-cancel {
  padding: 6px 14px;
  border: 1px solid #ccc;
  background: #f3f3f3;
  border-radius: 6px;
}

.btn-confirm {
  padding: 6px 14px;
  background: #5a2d0c;
  color: white;
  border-radius: 6px;
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
    transform: translateX(40px);
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
  pointer-events: none;
  transition: 0.2s ease;
  z-index: 999;
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
</style>
