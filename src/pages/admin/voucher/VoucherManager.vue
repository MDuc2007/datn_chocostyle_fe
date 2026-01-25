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
              <span :class="statusClass(item.trangThai)">
                {{ statusText(item.trangThai) }}
              </span>
            </td>

            <td>
              <span @click="goEdit(item.id)" style="cursor: pointer"
                ><img
                  src="/src/assets/icon/edit.svg"
                  alt=""
                  style="width: 20px; height: 20px"
              /></span>
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="item._checked"
                  :disabled="isExpired(item)"
                  @click.prevent="toggleStatus(item)"
                />
                <span class="slider"></span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button :disabled="currentPage === 1" @click="currentPage--">
          <img src="/src/assets/icon/arrowRight.svg" alt="" />
        </button>

        <button
          v-for="p in totalPages"
          :key="p"
          :class="{ active: p === currentPage }"
          @click="currentPage = p"
        >
          {{ p }}
        </button>

        <button :disabled="currentPage === totalPages" @click="currentPage++">
          <img src="/src/assets/icon/arrowLeft.svg" alt="" />
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

  <div v-if="toast.show" :class="['toast', toast.type]">
    <span class="toast-icon">✔</span>
    <span class="toast-text">{{ toast.message }}</span>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const host = "http://localhost:8080";

const router = useRouter();

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

const isExpired = (item) => {
  const today = new Date();
  return today > new Date(item.ngayKetThuc);
};

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

const toggleStatus = (item) => {
  selectedItem.value = item;
  pendingChecked.value = !item._checked;
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

const loaiGiamText = (v) => (v === "PERCENT" ? "Giảm %" : "Giảm tiền");

const statusText = (s) =>
  s === 1 ? "Đang diễn ra" : s === 2 ? "Sắp diễn ra" : "Đã kết thúc";

const statusClass = (s) =>
  s === 1 ? "status-active" : s === 2 ? "status-upcoming" : "status-stop";

const formatDate = (d) => (d ? d.substring(0, 10) : "");

onMounted(load);
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tittle {
  color: #63391f;
}

.total-voucher {
  font-size: 15px;
  color: #333;
}

.total-voucher strong {
  font-weight: 600;
}

.voucher-page {
  padding: 20px;
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
  gap: 4px;
}

.search-item input {
  width: 320px;
  height: 38px;
  padding: 0 14px;
  border-radius: 6px;
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
  padding: 6px 10px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  min-height: 520px;
  position: relative;
  padding-bottom: 60px;
}

.frame-top,
.frame-bottom {
  border-radius: 10px;
}

.btn-add {
  background: #5a2d0c;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  align-self: flex-end;
}

.voucher-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e0e0e0;
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
  background: #5a2d0c;
  color: white;
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
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  line-height: 1;
}

.table-wrapper {
  position: relative;
  min-height: 520px;
  padding-bottom: 50px;
}

.pagination {
  position: absolute;
  bottom: 16px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.pagination .active {
  background: #5a2d0c;
  color: white;
}

.pagination button {
  padding: 5px 10px;
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

.filters input,
.filters select {
  height: 38px;
  padding: 0 12px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  transition: all 0.2s ease;
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
  height: 38px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background: #5a2d0c;
  color: #fff;
  transition: background 0.2s ease;
}

.btn-add:hover {
  background: #4a2409;
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
</style>
