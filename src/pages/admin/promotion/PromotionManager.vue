<template>
  <!-- ===== HEADER PANEL ===== -->
  <div class="header">
    <h2 class="title">QUẢN LÝ ĐỢT GIẢM GIÁ</h2>

    <div class="top-bar">
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
        <label>Trạng thái:</label>
        <select v-model="filter.trangThai">
          <option value="">Tất cả</option>
          <option :value="1">Đang áp dụng</option>
          <option :value="2">Sắp diễn ra</option>
          <option :value="0">Đã kết thúc</option>
        </select>

        <label>Từ ngày:</label>
        <input type="date" v-model="filter.start" />

        <label>Đến ngày:</label>
        <input type="date" v-model="filter.end" />
      </div>

      <!-- ADD -->
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

              <label class="switch">
                <input
                  type="checkbox"
                  :checked="p.trangThai !== 0"
                  @change="toggleTrangThai(p.id)"
                />
                <span class="slider"></span>
              </label>
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
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 0"
        >
          <img src="/src/assets/icon/arrowRight.svg" alt="" />
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
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.totalPages - 1"
        >
          <img src="/src/assets/icon/arrowLeft.svg" alt="" />
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
  await axios.patch(`http://localhost:8080/api/promotions/${id}/toggle`);
  fetchData();
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
  border-radius: 6px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em,
    rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em;
  margin-bottom: 12px;
}

.title {
  margin: 15px;
  color: #63391f;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ===== SEARCH ===== */
.search-wrapper {
  position: relative;
  width: 300px;
  margin: 15px;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
}

.search-input {
  width: 100%;
  padding: 8px 10px 8px 34px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* ===== FILTER ===== */
.filters {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filters select,
.filters input {
  padding: 6px 10px;
}

/* ===== ADD ===== */
.add-btn {
  margin: 15px;
}

.add-btn button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
}

/* ===== TABLE PANEL ===== */
.product-page {
  background: transparent;
}

.table-panel {
  background: #fff;
  border-radius: 6px;
  padding: 10px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 0.0625em 0.0625em,
    rgba(0, 0, 0, 0.15) 0px 0.125em 0.5em;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th {
  background: #63391f;
  color: #fff;
  padding: 8px;
}

.product-table td {
  padding: 8px;
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
  gap: 10px;
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
  background: #e74c3c;
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
</style>
