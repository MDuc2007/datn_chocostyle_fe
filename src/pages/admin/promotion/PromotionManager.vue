<template>
  <div class="page-wrapper">
    <div class="page-content">
      <div class="card panel mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-uppercase mb-0">Quản lý đợt giảm giá</h5>
          </div>

          <div class="row g-2 align-items-end">
            <div class="col-md-2">
              <label class="form-label">Tìm kiếm</label>
              <input
                v-model="filter.keyword"
                class="form-control form-control-sm"
                placeholder="Mã hoặc tên"
              />
            </div>
            <div class="col-md-2">
              <label class="form-label">Trạng thái</label>
              <select
                v-model="filter.trangThai"
                class="form-select form-select-sm"
              >
                <option value="">Tất cả</option>
                <option :value="1">Đang áp dụng</option>
                <option :value="2">Sắp diễn ra</option>
                <option :value="0">Đã kết thúc</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Từ ngày</label>
              <input
                type="date"
                v-model="filter.start"
                class="form-control form-control-sm"
              />
            </div>
            <div class="col-md-2">
              <label class="form-label">Đến ngày</label>
              <input
                type="date"
                v-model="filter.end"
                class="form-control form-control-sm"
              />
            </div>
            <div class="col-md-2 d-flex gap-2">
              <button
                class="btn btn-secondary btn-sm w-100"
                @click="resetFilter"
              >
                Đặt lại
              </button>
              <button
                class="btn btn-brown btn-sm w-400"
                @click="$router.push('/admin/promotion/create')"
              >
                + Thêm
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="card panel table-panel">
        <div class="card panel">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table align-middle text-center mb-0">
                <thead class="table-header">
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
                    <td :class="statusClass(p.trangThai)">
                      {{ statusText(p.trangThai) }}
                    </td>
                    <td class="d-flex justify-content-center gap-2">
                      <label class="switch">
                        <input
                          type="checkbox"
                          :checked="p.trangThai !== 0"
                          @change="toggleTrangThai(p.id)"
                        />
                        <span class="slider"></span>
                      </label>
                      <i
                        class="bi bi-pencil-square action-icon"
                        @click="$router.push(`/admin/promotion/${p.id}/edit`)"
                      ></i>
                    </td>
                  </tr>

                  <tr v-if="promotions.length === 0">
                    <td colspan="10" class="py-4">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination-wrapper" v-show="pagination.totalPages > 0">
        <ul class="pagination custom-pagination mb-0">
          <li class="page-item" :class="{ disabled: pagination.page === 0 }">
            <button class="page-link" @click="changePage(pagination.page - 1)">
              ‹
            </button>
          </li>
          <li
            v-for="i in pagination.totalPages"
            :key="i"
            class="page-item"
            :class="{ active: pagination.page === i - 1 }"
          >
            <button class="page-link" @click="changePage(i - 1)">
              {{ i }}
            </button>
          </li>
          <li
            class="page-item"
            :class="{
              disabled: pagination.page >= pagination.totalPages - 1,
            }"
          >
            <button class="page-link" @click="changePage(pagination.page + 1)">
              ›
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import axios from "axios";

const promotions = ref<any[]>([]);

const pagination = reactive({
  page: 0,
  size: 8,
  totalPages: 0,
  totalElements: 0,
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

const resetFilter = () => {
  Object.assign(filter, {
    keyword: "",
    trangThai: "",
    start: "",
    end: "",
  });
  pagination.page = 0;
  fetchData();
};

const toggleTrangThai = async (id: number) => {
  try {
    await axios.patch(`http://localhost:8080/api/promotions/${id}/toggle`);
    fetchData(); 
  } catch (e) {
    console.error("Toggle thất bại", e);
  }
};

onMounted(fetchData);

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "";

const formatGiaTri = (v: number) => `${v}%`;

const statusText = (s: number) =>
  s === 1 ? "Đang áp dụng" : s === 2 ? "Sắp diễn ra" : "Đã kết thúc";

const statusClass = (s: number) => ({
  "status-active": s === 1,
  "status-upcoming": s === 2,
  "status-stop": s === 0,
});
const changePage = (newPage: number) => {
  if (newPage < 0 || newPage >= pagination.totalPages) return;
  pagination.page = newPage;
  fetchData();
};
</script>

<style scoped>
.table-header {
  background: #63391f;
  color: #fff;
}

.btn-brown {
  background: #63391f;
  color: #fff;
  width: 200px;
  height: 40px;
  border-radius: 7px;
}

.btn-brown:hover {
  background: #63391f;
}

.status-active {
  color: green;
  font-weight: 600;
}

.status-stop {
  color: red;
  font-weight: 600;
}

.status-upcoming {
  color: orange;
  font-weight: 600;
}

.table-panel {
  border-radius: 10px;
  overflow: hidden; 
}

.panel {
  max-width: 100%;
  background: #fff;
  border-radius: 10px; 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-icon {
  cursor: pointer;
}

.action-icon:hover {
  color: #63391f;
}
.table-header th {
  background-color: #63391f;
  color: #fff;
  border: none;
}

.table th,
.table td {
  border-left: none !important;
  border-right: none !important;
  border-top: none;
  border-bottom: 1px solid #dee2e6;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-box {
  width: 600px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}
.form-label {
  font-size: 13px;
  font-weight: 600;
}
.custom-pagination .page-link {
  border-radius: 6px;
  margin: 0 4px;
  color: #63391f;
  border: 1px solid #ddd;
  min-width: 36px;
  text-align: center;
}

.custom-pagination .page-item.active .page-link {
  background-color: #63391f;
  border-color: #63391f;
  color: #fff;
}

.custom-pagination .page-item.disabled .page-link {
  color: #ccc;
  pointer-events: none;
  background-color: #f8f9fa;
}
.page-wrapper {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pagination-wrapper {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding: 16px 0;
  background: #f5f5f5;
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
  border-radius: 22px;
  transition: 0.3s;
}

.slider::before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .slider {
  background-color: #63391f;
}

input:checked + .slider::before {
  transform: translateX(20px);
}
</style>
