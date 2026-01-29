<template>
  <!-- ===== HEADER PANEL ===== -->
  <div class="header">
    <h2 class="title">QUẢN LÝ ĐỢT GIẢM GIÁ</h2>

    <div class="top-bar">
  <!-- LEFT -->
  <div class="left-actions">
    <!-- SEARCH -->
    <div class="search-wrapper">
      <img src="/src/assets/icon/search.svg" class="search-icon" />
      <input
        type="text"
        class="search-input"
        placeholder="Tìm theo mã hoặc tên"
        v-model="filter.keyword"
      />
    </div>

    <!-- FILTER -->
    <div class="filters">
      <div class="filter-item">
        <label>Trạng thái</label>
        <select v-model="filter.trangThai">
          <option value="">Tất cả</option>
          <option :value="1">Đang áp dụng</option>
          <option :value="2">Sắp diễn ra</option>
          <option :value="0">Đã kết thúc</option>
        </select>
      </div>

      <div class="filter-item">
        <label>Từ ngày</label>
        <input type="date" v-model="filter.start" />
      </div>

      <div class="filter-item">
        <label>Đến ngày</label>
        <input type="date" v-model="filter.end" />
      </div>
    </div>
  </div>

  <!-- RIGHT -->
  <div class="add-btn">
    <button @click="$router.push('/admin/promotion/create')">
      <span>＋</span> Thêm đợt giảm
    </button>
  </div>
</div>
  </div>
  <!-- ===== CONTENT ===== -->
  <div class="product-page">
    <!-- TABLE PANEL -->
    <div class="table-panel">
      <table class="product-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã</th>
            <th>Tên</th>
            <th>Giá trị</th>
            <th>Bắt đầu</th>
            <th>Kết thúc</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(p, index) in promotions" :key="p.id">
            <td>{{ pagination.page * pagination.size + index + 1 }}</td>
            <td>{{ p.maDotGiamGia }}</td>
            <td>{{ p.tenDotGiamGia }}</td>
            <td>{{ formatGiaTri(p.giaTriGiam) }}</td>
            <td>{{ formatDate(p.ngayBatDau) }}</td>
            <td>{{ formatDate(p.ngayKetThuc) }}</td>

            <td>
              <span
                class="status"
                :class="{
                  selling: p.trangThai === 1,
                  upcoming: p.trangThai === 2,
                  stopped: p.trangThai === 0,
                }"
              >
                {{ statusText(p.trangThai) }}
              </span>
            </td>

            <td class="action">
               <label class="switch">
                <input
                  type="checkbox"
                  :checked="p.trangThai !== 0"
                  @change="toggleTrangThai(p.id)"
                />

                <span class="slider"></span>
              </label>
              <span
                class="icon edit"
                @click="$router.push(`/admin/promotion/${p.id}/edit`)"
              >
                <img 
                  src="/src/assets/icon/edit.svg"
                  alt=""
                  style="width: 20px; height: 20px"
                />
              </span>

             
            </td>
          </tr>

          <tr v-if="promotions.length === 0">
            <td colspan="8">Không có dữ liệu</td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
      <!-- PREV -->
<button
  class="nav-btn"
  @click="changePage(pagination.page - 1)"
  :disabled="pagination.page === 0"
>
  &lt;
</button>

<!-- PAGE NUMBERS -->
<button
  v-for="p in visiblePages"
  :key="p"
  class="page-btn"
  :class="{ active: p - 1 === pagination.page }"
  :disabled="p === '...'"
  @click="p !== '...' && changePage(p - 1)"
>
  {{ p }}
</button>

<!-- NEXT -->
<button
  class="nav-btn"
  @click="changePage(pagination.page + 1)"
  :disabled="pagination.page >= pagination.totalPages - 1"
>
  &gt;
</button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from "vue";
import axios from "axios";

const promotions = ref<any[]>([]);

const pagination = reactive({
  page: 0,
  size: 8,
  totalPages: 0,
  totalElements: 0,
});
const visiblePages = computed(() => {
  const pages: any[] = [];
  const total = pagination.totalPages;
  const current = pagination.page + 1;

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

const filter = reactive({
  keyword: "",
  trangThai: "",
  start: "",
  end: "",
});

const fetchData = async () => {
  const params: any = {
    page: pagination.page,
    size: pagination.size,
  };

  if (filter.keyword.trim()) params.keyword = filter.keyword.trim();
  if (filter.trangThai !== "") params.trangThai = filter.trangThai;
  if (filter.start) params.start = filter.start;
  if (filter.end) params.end = filter.end;

  const res = await axios.get("http://localhost:8080/api/promotions/filter", {
    params,
  });

  promotions.value = res.data.content;
  pagination.totalPages = res.data.totalPages;
  pagination.totalElements = res.data.totalElements;
};

let debounceTimer: any = null;
watch(
  () => ({ ...filter }),
  () => {
    pagination.page = 0;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchData, 400);
  },
  { deep: true },
);

onMounted(fetchData);

const toggleTrangThai = async (id: number) => {
  try {
    // 1. Gọi API cập nhật
    await axios.patch(`http://localhost:8080/api/promotions/${id}/toggle`);

    // 2. Tìm và cập nhật ngay lập tức trên giao diện (Optional nhưng giúp giao diện mượt hơn)
    const index = promotions.value.findIndex((p) => p.id === id);
    if (index !== -1) {
      // Nếu đang bật (khác 0) thì set về 0, ngược lại thì tạm set về 1 (fetchData sẽ lấy số chuẩn sau)
      promotions.value[index].trangThai =
        promotions.value[index].trangThai === 0 ? 1 : 0;
    }

    // 3. Load lại dữ liệu chuẩn từ server
    await fetchData();
  } catch (error) {
    console.error("Lỗi khi toggle:", error);
    alert("Không thể cập nhật trạng thái!");
  }
};

const changePage = (p: number) => {
  if (p < 0 || p >= pagination.totalPages) return;
  pagination.page = p;
  fetchData();
};

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "";

const formatGiaTri = (v: number) => `${v}%`;

const statusText = (s: number) =>
  s === 1 ? "Đang áp dụng" : s === 2 ? "Sắp diễn ra" : "Đã kết thúc";
</script>

<style scoped>
/* ===== HEADER PANEL ===== */
.header {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e5e5e5; /* 👈 viền mỏng */
  margin-bottom: 12px;
}

.title {
  margin: 15px;
  color: #63391f;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 15px 12px;
}

.left-actions {
  display: flex;
  align-items: flex-end;
gap:12px;
}


/* ===== SEARCH ===== */
.search-wrapper {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
}
.search-input {
  width: 100%;
  height: 40px;
  padding: 8px 10px 8px 34px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-sizing: border-box;
}

/* ===== FILTER ===== */
.filters {
  display: flex;
  gap: 12px; /* 👈 GỌN HƠN */
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 160px;
}

.filter-item label {
  font-size: 15px;
  font-weight: 600;
  color: #484848;
}

.filter-item select,
.filter-item input {
  height: 40px; /* 👈 BẰNG SEARCH */
  padding: 0 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 14px;
  color: #555555a4;
  background: #fff;

}

/* ===== ADD ===== */
.add-btn {
  margin: 0;
  align-self: flex-end; /* 👈 ép nút xuống cùng hàng */
}

.add-btn button {
  height: 40px;                 /* 👈 bằng input */
  padding: 0 16px;              /* ngang vừa tay */
  border: 1px solid #ccc;
  border-radius: 10px;          /* 👈 bo y hệt */
  background: #fff;
  cursor: pointer;

  font-size: 14px;
  font-weight: 600;
  color: #484848;

  display: flex;
  align-items: center;
  gap: 6px;
}

/* ===== TABLE PANEL ===== */
.product-page {
  background: transparent;
}
.product-table thead tr {
  border-bottom: 1.5px solid #e0e0e0;
}

.table-panel {
  background: #fff;
  border-radius: 20px;
  padding: 10px;
  border: 1px solid #e5e5e5; /* 👈 viền nhẹ */
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th {
  color: #000000;
  padding: 20px 12px;
}

.product-table td {
  padding: 18px 12px;
  border-bottom: 1px solid #ddd;
  text-align: center;
  
}

.status.selling {
  color: #2ecc71;
  font-weight: 600;
}
.status.upcoming {
  color: #f39c12;
  font-weight: 600;
}
.status.stopped {
  color: #e74c3c;
  font-weight: 600;
}

.action {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.switch {
  position: relative;
  width: 50px;
  height: 24px;
}
.switch input {
  display: none;
}
.slider {
  position: absolute;
  inset: 0;
  background: #ccc;
  border-radius: 24px;
  transition: 0.3s;
}
.slider::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.3s;
}
input:checked + .slider {
  background: #63391f;
}
input:checked + .slider::before {
  transform: translateX(26px);
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 15px 0;
}
.pagination button {
  padding: 6px 12px;
}
.page-btn {
  min-width: 34px;
  height: 34px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  height: 40px;
  width: 40px;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: #f0f0f0;
}

.page-btn.active {
  background: #63391f;
  color: #fff;
  border-color: #63391f;
  font-weight: 600;
}

.page-btn.active:hover {
  background: #63391f;
}

.page-btn:disabled {
  cursor: default;
  border: none;
  background: transparent;
  color: #999;
}

.switch input:disabled + .slider {
  background-color: #e74c3ccc !important;
  cursor: not-allowed;
  opacity: 0.6;
}

.switch input:disabled ~ .slider {
  pointer-events: none;
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

</style>
