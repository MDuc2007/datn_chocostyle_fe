<template>
  <div class="invoice-container">
    <div class="card-section filter-section">
      <div class="section-header">
        <h2 class="section-title">QUẢN LÝ HÓA ĐƠN</h2>
      </div>

      <div class="filter-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="filters.keyword"
            type="text"
            placeholder="Tìm theo mã hoặc tên khách hàng..."
            @input="handleSearch"
          />
        </div>

        <div class="filter-controls">
          <div class="control-item">
            <label>Trạng thái</label>
            <select v-model="filters.trangThai" @change="fetchInvoices">
              <option :value="null">Tất cả</option>
              <option :value="0">Chờ xác nhận</option>
              <option :value="1">Đã xác nhận</option>
              <option :value="2">Chờ giao hàng</option>
              <option :value="3">Đang giao</option>
              <option :value="4">Hoàn thành</option>
              <option :value="5">Đã hủy</option>
            </select>
          </div>

          <div class="control-item">
            <label>Loại đơn</label>
            <select v-model="filters.loaiDon" @change="fetchInvoices">
              <option :value="null">Tất cả</option>
              <option :value="1">Tại quầy</option>
              <option :value="0">Online</option>
            </select>
          </div>

          <div class="control-item">
            <label>Từ ngày</label>
            <input
              v-model="filters.startDate"
              type="date"
              @change="fetchInvoices"
            />
          </div>

          <div class="control-item">
            <label>Đến ngày</label>
            <input
              v-model="filters.endDate"
              type="date"
              @change="fetchInvoices"
            />
          </div>

          <div class="control-item no-label">
            <button
              class="btn-reset"
              @click="resetFilters"
              title="Làm mới bộ lọc"
            >
              ⟳
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card-section table-section">
      <div class="table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 50px">STT</th>
              <th>Mã hóa đơn</th>
              <th>Tên khách hàng</th>
              <th>Số điện thoại</th>
              <th class="text-center">Loại đơn</th>
              <th>Ngày tạo</th>
              <th class="text-end">Tổng tiền</th>
              <th class="text-center">Trạng thái</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="invoices.length === 0">
              <td colspan="9" class="text-center no-data">
                Không tìm thấy dữ liệu phù hợp
              </td>
            </tr>
            <tr v-for="(hd, index) in invoices" :key="hd.id">
              <td>{{ pagination.page * pagination.size + index + 1 }}</td>
              <td class="text-code">{{ hd.maHoaDon }}</td>
              <td class="text-bold">{{ hd.tenKhachHang || "Khách lẻ" }}</td>
              <td>{{ hd.soDienThoai || "---" }}</td>
              <td class="text-center">
                <span :class="hd.loaiDon === 1 ? 'tag-offline' : 'tag-online'">
                  {{ hd.loaiDon === 1 ? "Tại quầy" : "Online" }}
                </span>
              </td>
              <td>{{ formatDate(hd.ngayTao) }}</td>
              <td class="text-end text-money">
                {{ formatCurrency(hd.tongTien) }}
              </td>
              <td class="text-center">
                <span :class="getStatusClass(hd.trangThai)">
                  {{ getStatusName(hd.trangThai) }}
                </span>
              </td>
              <td class="text-center">
                <button
                  class="btn-icon"
                  @click="goToDetail(hd.id)"
                  title="Xem chi tiết"
                >
                  📝
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-controls" v-if="pagination.totalPages > 1">
        <button
          class="btn-page"
          :disabled="pagination.page === 0"
          @click="changePage(pagination.page - 1)"
        >
          &lt;
        </button>
        <button
          v-for="p in visiblePages"
          :key="p"
          class="btn-page"
          :class="{ active: pagination.page === p }"
          @click="changePage(p)"
        >
          {{ p + 1 }}
        </button>
        <button
          class="btn-page"
          :disabled="pagination.page >= pagination.totalPages - 1"
          @click="changePage(pagination.page + 1)"
        >
          &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import invoiceService from "../../../services/invoiceService";
import type { InvoiceResponse } from "../../../types/invoice";

const router = useRouter();

// --- State ---
const invoices = ref<InvoiceResponse[]>([]);
const pagination = reactive({ page: 0, size: 8, total: 0, totalPages: 0 });
const filters = reactive({
  keyword: "",
  trangThai: null,
  loaiDon: null,
  startDate: "",
  endDate: "",
});

let searchTimeout: any = null;

// --- Methods ---
const handleSearch = () => {
  pagination.page = 0;
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchInvoices, 500);
};

const fetchInvoices = async () => {
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      keyword: filters.keyword,
      trangThai: filters.trangThai,
      loaiDon: filters.loaiDon,
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
    const res = await invoiceService.getAll(params);
    invoices.value = res.data.content;
    pagination.total = res.data.totalElements;
    pagination.totalPages = res.data.totalPages;
  } catch (error) {
    console.error("Lỗi tải danh sách:", error);
  }
};

const changePage = (newPage: number) => {
  pagination.page = newPage;
  fetchInvoices();
};

const resetFilters = () => {
  filters.keyword = "";
  filters.trangThai = null;
  filters.loaiDon = null;
  filters.startDate = "";
  filters.endDate = "";
  pagination.page = 0;
  fetchInvoices();
};

const goToDetail = (id: number) => {
  router.push(`/admin/invoice/${id}`);
};

// --- Computed Pagination ---
const visiblePages = computed(() => {
  const { page: current, totalPages: total } = pagination;
  const delta = 2;
  let start = Math.max(0, current - delta);
  let end = Math.min(total - 1, current + delta);
  if (total > 5) {
    if (current < delta) end = 4;
    if (current > total - delta - 1) start = total - 5;
  } else {
    start = 0;
    end = total - 1;
  }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// --- Formatting ---
const formatCurrency = (val: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val,
  );

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const getStatusName = (stt: number) => {
  const map: Record<number, string> = {
    0: "Chờ xác nhận",
    1: "Đã xác nhận",
    2: "Chờ giao hàng",
    3: "Đang giao",
    4: "Hoàn thành",
    5: "Đã hủy",
  };
  return map[stt] || "Đang xử lý";
};

const getStatusClass = (stt: number) => {
  if (stt === 4) return "status-text status-green";
  if (stt === 1) return "status-text status-green";
  if (stt === 5) return "status-text status-red";
  if (stt === 0) return "status-text status-orange";
  if (stt === 3) return "status-text status-blue";
  return "status-text status-green";
};

onMounted(() => {
  fetchInvoices();
});
</script>

<style scoped>
/* --- 1. Layout Tổng --- */
.invoice-container {
  /* padding: 20px 40px; */
  background-color: #f5f5f5; /* Nền xám nhạt */
  min-height: 100vh;
  color: #333;
}

/* --- 2. Card Section (Dùng chung cho Filter & Table) --- */
/* Đây là class quy định style: Không viền, bo góc, bóng mờ */
.card-section {
  background: #fff;
  border: none; /* QUAN TRỌNG: Không viền */
  border-radius: 24px; /* Bo tròn lớn */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); /* Bóng nhẹ */
  padding: 25px;
  margin-bottom: 24px;
}

/* --- 3. Header & Filter Style --- */
.section-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 18px;
  font-weight: 800;
  color: #63391f; /* Màu nâu chủ đạo */
  text-transform: uppercase;
  margin: 0;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
}

/* Ô tìm kiếm */
.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 0 15px;
  height: 45px;
  background: #fff;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #63391f;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}

.search-icon {
  font-size: 16px;
  color: #999;
  margin-right: 10px;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: #333;
}

/* Các filter controls */
.filter-controls {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.control-item {
  display: flex;
  flex-direction: column;
}

.control-item label {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  margin-bottom: 6px;
  margin-left: 4px;
}

.control-item select,
.control-item input {
  height: 45px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 0 15px;
  font-size: 14px;
  outline: none;
  background: #fff;
  min-width: 140px;
  color: #444;
  transition: all 0.2s;
}

.control-item select:focus,
.control-item input:focus {
  border-color: #63391f;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}

.control-item.no-label {
  justify-content: flex-end; /* Để nút reset nằm dưới cùng */
}

.btn-reset {
  height: 45px;
  width: 45px;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-reset:hover {
  background: #f9f9f9;
  border-color: #ccc;
  color: #333;
}

/* --- 4. Table Styling --- */
.table-wrapper {
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

/* Header */
.custom-table th {
  background: transparent;
  padding: 15px 15px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  color: #000;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
}

/* Body */
.custom-table td {
  padding: 18px 15px;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
  font-size: 14px;
  color: #333;
}

.custom-table tbody tr:hover td {
  background-color: #fafafa;
}

/* Helpers */
.text-center {
  text-align: center !important;
}
.text-end {
  text-align: right !important;
}
.text-code {
  font-weight: 600;
  color: #333;
  font-family: monospace;
}
.text-bold {
  font-weight: 600;
}
.text-money {
  font-weight: 700;
  color: #333;
}

/* Status Styles */
.status-text {
  font-weight: 700;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 20px;
}
.status-green {
  color: #00b894;
  background: rgba(0, 184, 148, 0.1);
}
.status-orange {
  color: #e17055;
  background: rgba(225, 112, 85, 0.1);
}
.status-red {
  color: #d63031;
  background: rgba(214, 48, 49, 0.1);
}
.status-blue {
  color: #0984e3;
  background: rgba(9, 132, 227, 0.1);
}

/* Tag Type */
.tag-offline,
.tag-online {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  border: 1px solid transparent;
}
.tag-offline {
  color: #636e72;
  background: #dfe6e9;
}
.tag-online {
  color: #63391f;
  background: #efebe9;
  border-color: #efebe9;
}

/* Buttons */
.btn-icon {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
}
.btn-icon:hover {
  background: #f1f2f6;
  color: #63391f;
}

/* Pagination */
.pagination-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.btn-page {
  min-width: 36px;
  height: 36px;
  border: none;
  background: #fff;
  color: #666;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.btn-page.active {
  background: #63391f;
  color: white;
  box-shadow: 0 4px 10px rgba(99, 57, 31, 0.3);
}

.no-data {
  padding: 40px;
  color: #b2bec3;
  font-style: italic;
}
</style>
