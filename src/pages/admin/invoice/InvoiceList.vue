<template>
  <div class="invoice-container">
    <div class="page-header">
      <h1 class="title">Quản lý hóa đơn</h1>
      <div class="stats">Tổng số hóa đơn: <strong>{{ pagination.total }}</strong></div>
    </div>

    <div class="card filter-section">
      <div class="card-header">
        <span class="icon">🔍</span> Bộ Lọc Tìm Kiếm
      </div>
      <div class="card-body">
        <div class="filter-grid">
          <div class="form-group">
            <label>Từ khóa</label>
            <input 
              v-model="filters.keyword" 
              type="text" 
              placeholder="Nhập Mã HĐ, Tên KH, SĐT..." 
              @input="handleSearch"
            />
          </div>
          <div class="form-group">
            <label>Trạng thái</label>
            <select v-model="filters.trangThai" @change="fetchInvoices">
              <option :value="null">Tất cả trạng thái</option>
              <option :value="0">Chờ xác nhận</option>
              <option :value="1">Đã xác nhận</option>
              <option :value="2">Chờ giao hàng</option>
              <option :value="3">Đang giao</option>
              <option :value="4">Hoàn thành</option>
              <option :value="5">Đã hủy</option>
            </select>
          </div>
          <div class="form-group">
            <label>Loại đơn</label>
            <select v-model="filters.loaiDon" @change="fetchInvoices">
              <option :value="null">Tất cả loại</option>
              <option :value="1">Tại quầy</option>
              <option :value="0">Online</option>
            </select>
          </div>
          <div class="form-group">
            <label>Từ ngày</label>
            <input v-model="filters.startDate" type="date" @change="fetchInvoices" />
          </div>
          <div class="form-group">
            <label>Đến ngày</label>
            <input v-model="filters.endDate" type="date" @change="fetchInvoices" />
          </div>
        </div>
        
        <div class="filter-actions">
          <button class="btn-reset" @click="resetFilters">🔄 Đặt lại</button>
        </div>
      </div>
    </div>

    <div class="card table-section">
      <div class="card-header">
        <span class="icon">📋</span> Danh sách hóa đơn
      </div>
      <div class="card-body">
        <div class="table-wrapper">
          <table class="custom-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã HĐ</th>
                <th>Nhân viên</th> <th>Khách hàng</th>
                <th>Ngày tạo</th>
                <th>Tổng tiền</th>
                <th>Loại đơn</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="invoices.length === 0">
                <td colspan="9" class="text-center">Không tìm thấy dữ liệu phù hợp</td>
              </tr>
              <tr v-for="(hd, index) in invoices" :key="hd.id">
                <td>{{ (pagination.page * pagination.size) + index + 1 }}</td>
                <td class="text-bold">{{ hd.maHoaDon }}</td>
                
                <td>{{ hd.tenNhanVien || '---' }}</td> 

                <td>{{ hd.tenKhachHang || 'Khách lẻ' }}</td>
                <td>{{ formatDate(hd.ngayTao) }}</td>
                <td class="text-total">{{ formatCurrency(hd.tongTien) }}</td>
                <td>
                  <span :class="hd.loaiDon === 1 ? 'tag-blue' : 'tag-orange'">
                    {{ hd.loaiDon === 1 ? 'Tại quầy' : 'Online' }}
                  </span>
                </td>
                <td>
                  <span :class="getStatusClass(hd.trangThai)">
                    {{ getStatusName(hd.trangThai) }}
                  </span>
                </td>
                <td>
                  <button class="btn-view" @click="goToDetail(hd.id)">
                      Chi tiết
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

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
              :class="{ 'active': pagination.page === p }"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import invoiceService from '../../../services/invoiceService'; // Đảm bảo đường dẫn import đúng
import type { InvoiceResponse, InvoiceFilterParams } from '../../../types/invoice';

const router = useRouter();

// --- STATE ---
const invoices = ref<InvoiceResponse[]>([]);
const pagination = reactive({
  page: 0,
  size: 8, 
  total: 0,
  totalPages: 0
});

const filters = reactive({
  keyword: '',
  trangThai: null,
  loaiDon: null,
  startDate: null,
  endDate: null
});

// --- HANDLE SEARCH (DEBOUNCE) ---
let searchTimeout: any = null;

const handleSearch = () => {
  pagination.page = 0;
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchInvoices();
  }, 500);
};

// --- COMPUTED ---
const visiblePages = computed(() => {
  const { page: current, totalPages: total } = pagination;
  const delta = 2;
  let start = Math.max(0, current - delta);
  let end = Math.min(total - 1, current + delta);

  if (total > 5) {
    if (current < delta) end = 4;
    if (current > total - delta - 1) start = total - 5;
  } else {
    start = 0; end = total - 1;
  }

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// --- API ACTIONS ---
const fetchInvoices = async () => {
  try {
    // Đảm bảo interface InvoiceFilterParams khớp với code service
    const params: any = {
      page: pagination.page,
      size: pagination.size,
      keyword: filters.keyword,
      trangThai: filters.trangThai,
      loaiDon: filters.loaiDon,
      startDate: filters.startDate,
      endDate: filters.endDate
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
  filters.keyword = ''; filters.trangThai = null; filters.loaiDon = null;
  filters.startDate = null; filters.endDate = null;
  pagination.page = 0;
  fetchInvoices();
};

const goToDetail = (id: number) => {
  router.push(`/admin/invoice/${id}`);
};

// --- FORMAT HELPER ---
const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '';
const getStatusName = (stt: number) => {
  const map: Record<number, string> = { 0: 'Chờ xác nhận', 1: 'Đã xác nhận', 2: 'Chờ giao hàng', 3: 'Đang giao', 4: 'Hoàn thành', 5: 'Đã hủy' };
  return map[stt] || 'N/A';
};
const getStatusClass = (stt: number) => {
  if (stt === 4) return 'tag-green';
  if (stt === 5) return 'tag-red';
  if (stt === 0) return 'tag-gray';
  return 'tag-blue';
};

onMounted(() => { fetchInvoices(); });
</script>

<style scoped>
/* --- 1. CÀI ĐẶT FONT CHỮ & MÀU NỀN --- */
.invoice-container { 
  padding: 25px; 
  background-color: #F7F7F7; 
  min-height: 100vh; 
  font-family: 'Times New Roman', Times, serif; 
}

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

/* --- 2. STYLE CHO CARD (CỤC) --- */
.card { 
  background: #FFFFFF; 
  border-radius: 8px; 
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  margin-bottom: 30px;
  border: none;
  padding: 0;
  overflow: hidden;
}

.card-header {
  font-weight: 700;
  color: #63391F; 
  padding: 15px 20px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.card-body {
  padding: 20px;
}

/* --- 3. FILTER STYLES --- */
.filter-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
.form-group { display: flex; flex-direction: column; }
.form-group label { font-size: 14px; color: #555; margin-bottom: 5px; font-weight: 600; }
.form-group input, .form-group select { 
  height: 38px; border: 1px solid #ddd; border-radius: 4px; padding: 0 10px; outline: none;
  font-family: 'Times New Roman', Times, serif;
}
.form-group input:focus, .form-group select:focus { border-color: #63391F; }

.filter-actions { margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end; }
.btn-reset { 
  background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; 
  font-family: 'Times New Roman', Times, serif;
}
.btn-reset:hover { background: #5a6268; }

/* --- 4. TABLE STYLES --- */
.custom-table { width: 100%; border-collapse: collapse; margin-top: 0; }
.custom-table th { 
  background: #F7F7F7; 
  padding: 14px 12px; 
  border-bottom: 2px solid #eee; 
  text-align: left; 
  font-size: 14px; 
  font-weight: 700; 
  color: #63391F; 
}
.custom-table td { padding: 12px; border-bottom: 1px solid #eee; vertical-align: middle; font-size: 15px; }
.text-center { text-align: center; }

.title { font-size: 26px; color: #63391F; margin: 0; font-weight: 800; }
.text-bold { font-weight: 700; color: #63391F; }
.text-total { color: #d93025; font-weight: 700; }

.btn-view { 
  background: #333; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;
  font-family: 'Times New Roman', Times, serif; 
}
.btn-view:hover { background: #63391F; }

/* Tags Status */
.tag-blue { background: #e3f2fd; color: #0d47a1; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; }
.tag-green { background: #e8f5e9; color: #1b5e20; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; }
.tag-red { background: #ffebee; color: #b71c1c; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; }
.tag-orange { background: #fff3e0; color: #e65100; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; }
.tag-gray { background: #f5f5f5; color: #616161; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; }

/* --- 5. PAGINATION --- */
.table-wrapper { position: relative; min-height: 520px; padding-bottom: 60px; }
.pagination-controls { position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 8px; }
.btn-page {
  min-width: 32px; height: 32px; padding: 0 6px;
  border: 1px solid #d9d9d9; background-color: #fff; color: #333;
  border-radius: 4px; font-size: 15px; font-weight: 500; cursor: pointer;
  transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Times New Roman', Times, serif;
}
.btn-page:hover:not(:disabled) { border-color: #63391F; color: #63391F; }
.btn-page.active { background-color: #63391F; color: #fff; border-color: #63391F; font-weight: bold; }
.btn-page:disabled { background-color: #f5f5f5; color: #ccc; cursor: not-allowed; border-color: #eee; }
</style>