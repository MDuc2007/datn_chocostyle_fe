<template>
  <div class="page-container">
    <div class="header-filter-wrapper">
      <div class="page-header">
        <h2 class="page-title">QUẢN LÝ KHÁCH HÀNG</h2>
        <div class="total-badge">
          Tổng số: <b>{{ stats.totalCustomers || 0 }}</b>
        </div>
      </div>

      <div class="card-section filter-card form-page-animation">
        <div class="filter-header">
          <span class="filter-icon"></span>
        </div>

        <div class="filter-controls">
          <div class="search-group">
            <div class="form-item search-box">
              <label>Từ khóa</label>
              <input
                v-model="keyword"
                @input="debouncedSearch"
                type="text"
                class="form-input"
                placeholder="Tìm theo tên, email"
              />
            </div>

            <div class="form-item status-box">
              <label>Trạng thái</label>
              <select
                class="form-select"
                v-model="selectedStatus"
                @change="fetchCustomers"
              >
                <option :value="null">Tất cả</option>
                <option :value="1">Hoạt động</option>
                <option :value="0">Không hoạt động</option>
              </select>
            </div>
          </div>

          <div class="button-group">
            <button class="btn btn-outline" @click="resetFilters">
              Đặt lại
            </button>
            <!-- <button class="btn btn-outline" @click="exportExcel">
              Xuất Excel
            </button> -->
            <button
              class="btn btn-primary"
              @click="$router.push('/admin/customer/add')"
            >
              + Thêm mới
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card-section table-card form-page-animation">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th width="50" class="text-center">STT</th>
              <th width="100">Mã KH</th>
              <th style="min-width: 160px">Tên khách hàng</th>
              <th style="min-width: 180px">Email</th>
              <th width="120">SĐT</th>
              <th style="min-width: 250px">Địa chỉ chính</th>
              <th width="150" class="text-center">Trạng thái</th>
              <th width="110" class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-5 text-muted">
                Đang tải dữ liệu...
              </td>
            </tr>

            <template v-else>
              <tr v-for="(c, i) in customers" :key="c.id">
                <td class="text-center text-muted">
                  <b>{{ i + 1 + (currentPage - 1) * pageSize }}</b>
                </td>

                <td>
                  <b style="color: #63391f">{{ c.maKhachHang }}</b>
                </td>

                <td>
                  <span class="fw-bold text-dark">{{ c.tenKhachHang }}</span>
                </td>

                <td>
                  <span class="text-muted">{{ c.email }}</span>
                </td>

                <td>{{ c.soDienThoai }}</td>

                <td class="address-cell">
                  <div v-if="c.diaChiChinh" class="address-wrapper">
                    <span class="badge-tag-mini">Mặc định</span>
                    <span class="addr-text" :title="c.diaChiChinh">
                      {{ c.diaChiChinh }}
                    </span>
                  </div>
                  <div v-else class="empty-addr">-- Chưa thiết lập --</div>
                </td>

                <td class="text-center">
                  <span
                    :class="[
                      'status-badge',
                      isActive(c) ? 'active' : 'inactive',
                    ]"
                  >
                    {{ isActive(c) ? "Hoạt động" : "Ngừng" }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="actions-group">
                    <button
                      class="btn-icon btn-edit"
                      title="Chỉnh sửa"
                      @click="$router.push(`/admin/customer/edit/${c.id}`)"
                    >
                      <img
                        src="/src/assets/icon/edit.svg"
                        alt=""
                        style="width: 20px; height: 20px"
                      />
                    </button>
                    <label class="switch" title="Đổi trạng thái">
                      <input
                        type="checkbox"
                        :checked="isActive(c)"
                        @click="handleToggleClick($event, c)"
                      />
                      <span class="slider round"></span>
                    </label>
                  </div>
                </td>
              </tr>
            </template>

            <tr v-if="!loading && customers.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                Không tìm thấy dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-footer">
        <button
          class="p-btn"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <img src="/src/assets/icon/arrowRight.svg" alt="" />
        </button>
        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            class="p-btn number"
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="dots">...</span>
        </template>
        <button
          class="p-btn"
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
        >
          <img src="/src/assets/icon/arrowLeft.svg" alt="" />
        </button>
      </div>
    </div>

    <div v-if="modal.show" class="modal-overlay" @click.self="closeModal">
      <div class="confirm-box form-page-animation">
        <div class="confirm-icon" style="font-size: 40px; margin-bottom: 10px">
          ⚠️
        </div>
        <h3 style="color: #63391f; margin-bottom: 10px">{{ modal.title }}</h3>
        <p style="color: #555; margin-bottom: 20px">{{ modal.message }}</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="closeModal">Hủy</button>
          <button class="btn-confirm" @click="handleModalConfirm">
            Đồng ý
          </button>
        </div>
      </div>
    </div>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-content">{{ toast.message }}</div>
        <button class="toast-close" @click="toast.show = false">×</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

// --- STATE ---
const keyword = ref("");
const customers = ref([]);
const stats = ref({ totalCustomers: 0 });
const currentPage = ref(1);
const totalPages = ref(1);
const selectedStatus = ref(null);
const pageSize = ref(8);
const loading = ref(false);
const toast = ref({ show: false, message: "", type: "success" });
const searchTimeout = ref(null);
const modal = ref({
  show: false,
  title: "",
  message: "",
  action: null,
  id: null,
});
const API_URL = "http://localhost:8080/api/khach-hang";

// --- HELPERS ---
// Cập nhật: Kiểm tra theo trường trangThai (1: Hoạt động, 0: Khóa)
const isActive = (c) => Number(c.trangThai) === 1;

// --- API ---
const fetchCustomers = async () => {
  loading.value = true;
  try {
    const res = await axios.get(API_URL, {
      params: {
        page: currentPage.value - 1,
        size: pageSize.value,
        keyword: keyword.value,
        status: selectedStatus.value,
      },
    });
    // Dữ liệu từ Page<KhachHangResponse>
    customers.value = res.data.content || [];
    totalPages.value = res.data.totalPages || 1;

    // Cập nhật nhanh số lượng tổng từ phân trang
    if (res.data.totalElements !== undefined)
      stats.value.totalCustomers = res.data.totalElements;
  } catch (e) {
    showToast("Không thể tải danh sách khách hàng", "error");
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    // Gọi API stats đã sửa trong Controller
    const res = await axios.get(`${API_URL}/stats`);
    stats.value = res.data;
  } catch (e) {
    console.error("Lỗi tải thống kê:", e);
  }
};

const exportExcel = () => {
  window.location.href = `${API_URL}/export?keyword=${keyword.value}`;
};

// --- ACTIONS ---
const handleToggleClick = (event, customer) => {
  event.preventDefault(); // Ngăn checkbox tự thay đổi trước khi xác nhận
  modal.value = {
    show: true,
    title: "Xác nhận thay đổi",
    message: `Bạn có chắc muốn ${
      isActive(customer) ? "Khóa" : "Mở khóa"
    } tài khoản khách hàng "${customer.tenKhachHang}"?`,
    action: "TOGGLE",
    id: customer.id,
  };
};

const handleModalConfirm = async () => {
  try {
    if (modal.value.action === "TOGGLE") {
      // Gọi đúng API @PutMapping("/{id}/toggle-status")
      await axios.put(`${API_URL}/${modal.value.id}/toggle-status`);
      showToast("Cập nhật trạng thái thành công");
      await fetchCustomers();
      await fetchStats();
    }
  } catch (e) {
    const errorMsg = e.response?.data?.message || "Cập nhật thất bại";
    showToast(errorMsg, "error");
  }
  closeModal();
};

const closeModal = () => (modal.value.show = false);

// --- SEARCH & PAGINATION ---
const debouncedSearch = () => {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    fetchCustomers();
  }, 500);
};

const resetFilters = () => {
  keyword.value = "";
  selectedStatus.value = null;
  currentPage.value = 1;
  fetchCustomers();
};

const changePage = (p) => {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p;
    fetchCustomers();
  }
};

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 4) pages.push(1, 2, 3, 4, 5, "...", total);
    else if (current >= total - 3)
      pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
    else pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
});

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 3000);
};

onMounted(() => {
  fetchCustomers();
  fetchStats();
});
</script>
zz
<style scoped>
/* --- 1. COLOR PALETTE --- */
:root {
  --primary-brown: #63391f;
  --success-green: #10b981;
  --danger-red: #ef4444;
  --bg-gray: #f8fafc;
  --text-main: #333;
  --text-muted: #6b7280;
}

.page-container {

}
.filter-card {
  background: transparent;
  padding: 0;
  box-shadow: none;
}
/* --- HEADER & CARDS --- */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1px;
}
.page-title {
  color: #63391f;
}
.total-badge {
  background: #fdf8f6;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #63391f;
  border: 1px solid rgba(99, 57, 31, 0.25);
  white-space: nowrap;
}

.card-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  margin-bottom: 24px;
}
.header-filter-wrapper {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

/* --- FILTER --- */
.filter-header {
  color: #63391f;
  margin-bottom: 20px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-controls {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 10px;
}

.form-item label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 6px;
  min-height: 18px;
}
.form-input,
.form-select {
  box-sizing: border-box;
  width: 100%;
  height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0 12px;
  outline: none;
  transition: all 0.2s;
}
.form-input:focus,
.form-select:focus {
  border-color: #63391f;
  box-shadow: 0 0 0 2px rgba(99, 57, 31, 0.1);
}
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  padding-top: 1px;
}
.btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
  transition: 0.2s;
  border: 1px solid transparent;
}
.btn-primary {
  background-color: #63391f;
  color: #fff;
}
.btn-primary:hover {
  background-color: #4e2c18;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.btn-outline {
  background-color: #fff;
  color: #63391f;
  border: 1px solid #63391f;
}
.btn-outline:hover {
  background-color: #fdf8f6;
}

/* --- TABLE (UPDATED CLEAN STYLE) --- */
.table-responsive {
  overflow-x: auto; /* Cho phép cuộn ngang nếu màn hình bé */
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px; /* Đảm bảo bảng không bị bóp méo khi màn hình nhỏ */
}
.custom-table th {
  background-color: #63391f;
  color: #ffffff;
  font-weight: 700;
  padding: 16px 12px;
  text-align: left;
  font-size: 13px;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap; /* Tiêu đề không xuống dòng */
}
.custom-table td {
  padding: 12px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #4b5563;
  vertical-align: middle; /* Căn giữa theo chiều dọc */
}
.custom-table tbody tr:hover {
  background-color: #fafafa;
}
.fw-bold {
  font-weight: 600;
}
.text-muted {
  color: #9ca3af !important;
  font-size: 13px;
}
.text-dark {
  color: #111827;
}

/* === STATUS BADGE === */
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  min-width: 90px; /* Thu nhỏ lại chút cho gọn */
}
.status-badge.active {
  background-color: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
}
.status-badge.inactive {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* === CỘT ĐỊA CHỈ (ĐÃ UPDATE) === */
/* Không set max-width nữa để nó tự giãn */
.address-wrapper {
  display: flex;
  flex-direction: column; /* Xếp chồng badge và text */
  gap: 4px;
  align-items: flex-start;
}

/* Badge mặc định kiểu mới: Nhỏ gọn, tinh tế hơn */
.badge-tag-mini {
  font-size: 10px;
  background-color: #eff6ff; /* Xanh dương siêu nhạt */
  color: #3b82f6; /* Xanh dương */
  border: 1px solid #dbeafe;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
}

.addr-text {
  font-size: 13.5px;
  color: #374151;
  line-height: 1.4;
  /* Giới hạn 2 dòng cho gọn */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.empty-addr {
  font-style: italic;
  color: #9ca3af;
  font-size: 13px;
}

/* === SWITCH & ACTIONS === */
.actions-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
} /* Thu nhỏ switch xíu */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: 0.4s;
  border-radius: 20px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
input:checked + .slider {
  background-color: #10b981;
}
input:checked + .slider:before {
  transform: translateX(20px);
}

.btn-icon {
  width: 32px;
  height: 32px; /* Bé lại chút cho vừa ô hành động */
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
}
.btn-icon:hover {
  border-color: #63391f;
  color: #63391f;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Các phần khác giữ nguyên (Pagination, Modal, Toast) */
.pagination-footer {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
}
.p-btn {
  width: 36px;
  height: 36px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  font-weight: 500;
  transition: 0.2s;
}
.p-btn.active {
  background: #63391f;
  border-color: #63391f;
  color: #fff;
}
.p-btn:hover:not(.active):not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.confirm-box {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  width: 400px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.confirm-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
.btn-confirm {
  background: #10b981;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #10b981;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}
.toast-close {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 18px;
  color: #9ca3af;
}
.header-filter-wrapper .card-section {
  background: transparent;
  box-shadow: none;
  padding: 0;
  margin: 0;
}
.header-filter-wrapper label {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 6px;
  display: block;
}
.search-group .form-item label {
  font-size: 13px !important;
  font-weight: 600 !important;
}
.form-item {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.search-group {
  display: grid;
  grid-template-columns: 3fr 1.2fr;
  gap: 12px;
  align-items: start;
}

.search-group .form-item label {
  height: 18px;
  line-height: 18px;
  margin-bottom: 6px;
}

.search-group .form-item {
  align-self: start;
}
</style>
