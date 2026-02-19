<template>
  <div class="page-container">
    <div
      class="card-section filter-card form-page-animation"
      style="animation-delay: 0.1s"
    >
      <h2 class="title">QUẢN LÝ KHÁCH HÀNG</h2>

      <div class="filter-controls">
        <div class="left-controls">
          <div class="search-box input-wrapper">
            <i class="search-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </i>

            <input
              v-model="keyword"
              @input="debouncedSearch"
              type="text"
              class="form-input ps-icon"
              placeholder="Tìm theo mã hoặc tên"
            />
          </div>

          <div class="status-box input-wrapper">
            <span class="label-inside">Trạng thái</span>
            <select
              class="form-select"
              v-model="selectedStatus"
              @change="fetchCustomers"
            >
              <option :value="null">Tất cả</option>
              <option :value="1">Hoạt động</option>
              <option :value="0">Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        <div class="right-controls">
          <button class="btn btn-outline hover-effect" @click="resetFilters">
            Đặt lại
          </button>
          <button class="btn btn-outline hover-effect" @click="exportExcel">
            Xuất Excel
          </button>

          <button
            class="btn btn-primary hover-effect"
            @click="$router.push('/admin/customer/add')"
          >
            + Thêm mới
          </button>
        </div>
      </div>
    </div>

    <div
      class="card-section table-card form-page-animation"
      style="animation-delay: 0.2s"
    >
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th width="60" class="text-center">STT</th>
              <th width="120">Mã KH</th>
              <th style="min-width: 180px">Tên khách hàng</th>
              <th style="min-width: 200px">Email</th>
              <th width="140">SĐT</th>
              <th style="min-width: 250px">Địa chỉ</th>
              <th width="150" class="text-center">Trạng thái</th>
              <th width="120" class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-5 text-muted">
                <div class="loading-spinner"></div>
                Đang tải dữ liệu...
              </td>
            </tr>

            <template v-else>
              <tr
                v-for="(c, i) in customers"
                :key="c.id"
                class="table-row-hover"
              >
                <td class="text-center text-muted">
                  <b>{{ i + 1 + (currentPage - 1) * pageSize }}</b>
                </td>

                <td>
                  <span class="text-dark-bold">{{ c.maKhachHang }}</span>
                </td>

                <td>
                  <span class="text-dark-bold">{{ c.tenKhachHang }}</span>
                </td>

                <td>
                  <span class="text-muted truncate-text" :title="c.email">{{
                    c.email
                  }}</span>
                </td>

                <td>{{ c.soDienThoai }}</td>

                <td class="address-cell">
                  <div
                    v-if="c.diaChiChinh"
                    class="address-text"
                    :title="c.diaChiChinh"
                  >
                    {{ c.diaChiChinh }}
                  </div>
                  <div v-else class="text-muted italic">--</div>
                </td>

                <td class="text-center">
                  <span
                    :class="[
                      'status-badge',
                      isActive(c) ? 'status-active' : 'status-inactive',
                    ]"
                  >
                    {{ isActive(c) ? "Đang hoạt động" : "Ngừng hoạt động" }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="actions-group">
                    <label
                      class="switch tooltip-container"
                      :data-tooltip="
                        c.trangThai === 0 ? 'Mở hoạt động' : 'Ngưng hoạt động'
                      "
                    >
                      <input
                        type="checkbox"
                        :checked="isActive(c)"
                        @click="handleToggleClick($event, c)"
                      />
                      <span class="slider round"></span>
                    </label>

                    <div class="tooltip-container" data-tooltip="Chỉnh sửa">
                      <button
                        class="btn-icon-edit"
                        @click="$router.push(`/admin/customer/edit/${c.id}`)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path
                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                          ></path>
                          <path
                            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                          ></path>
                        </svg>
                      </button>
                    </div>
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
          class="p-btn hover-effect"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          &lt;
        </button>
        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            class="p-btn number hover-effect"
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="dots">...</span>
        </template>
        <button
          class="p-btn hover-effect"
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
        >
          &gt;
        </button>
      </div>
    </div>

    <transition name="fade-modal">
      <div v-if="modal.show" class="modal-overlay" @click.self="closeModal">
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
          <h3 class="confirm-title">{{ modal.title }}</h3>
          <p class="confirm-desc">{{ modal.message }}</p>
          <div class="confirm-actions">
            <button class="btn-cancel hover-effect" @click="closeModal">
              Hủy
            </button>
            <button
              class="btn-confirm hover-effect"
              @click="handleModalConfirm"
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </transition>

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

// --- LOGIC GIỮ NGUYÊN ---
const keyword = ref("");
const customers = ref([]);
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

const isActive = (c) => Number(c.trangThai) === 1;

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
    customers.value = res.data.content || [];
    totalPages.value = res.data.totalPages || 1;
  } catch (e) {
    showToast("Không thể tải danh sách khách hàng", "error");
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const exportExcel = async () => {
  try {
    const res = await axios.get(`${API_URL}/export-excel`, {
      params: {
        keyword: keyword.value,
        status: selectedStatus.value,
      },
      responseType: "blob",
    });

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "khach_hang.xlsx";
    link.click();
    window.URL.revokeObjectURL(url);

    showToast("Xuất Excel thành công");
  } catch (e) {
    showToast("Xuất Excel thất bại", "error");
    console.error(e);
  }
};

const handleToggleClick = (event, customer) => {
  event.preventDefault();
  modal.value = {
    show: true,
    title: "Xác nhận thay đổi",
    message: `Bạn có chắc muốn ${isActive(customer) ? "Khóa" : "Mở khóa"} tài khoản "${customer.tenKhachHang}"?`,
    action: "TOGGLE",
    id: customer.id,
  };
};

const handleModalConfirm = async () => {
  try {
    if (modal.value.action === "TOGGLE") {
      await axios.put(`${API_URL}/${modal.value.id}/toggle-status`);
      showToast("Cập nhật trạng thái thành công");
      await fetchCustomers();
    }
  } catch (e) {
    const errorMsg = e.response?.data?.message || "Cập nhật thất bại";
    showToast(errorMsg, "error");
  }
  closeModal();
};

const closeModal = () => (modal.value.show = false);

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
});
</script>

<style scoped>
/* =========================================
    1. GLOBAL VARIABLES & ANIMATIONS
    ========================================= */
.page-container {
  --primary-brown: #63391f;
  --primary-light: #fdf8f6;
  --text-main: #484848;
  --border-color: #e0e0e0;
  --success-green: #27ae60;
  --danger-red: #e74c3c;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 5px 15px rgba(0, 0, 0, 0.08);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* Keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Animation Classes */
.form-page-animation {
  opacity: 0; /* Init hidden */
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* =========================================
    2. LAYOUT & CARDS
    ========================================= */
.card-section {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
  overflow: hidden;
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;
}

.card-section:hover {
  box-shadow: var(--shadow-md);
  /* transform: translateY(-2px); // Optional: Nhấc nhẹ card khi hover */
}

.filter-card {
  padding: 24px;
}
.table-card {
  padding: 10px;
}

.title {
  margin: 15px;
  color: #63391f;
}

/* =========================================
    3. INPUTS & CONTROLS
    ========================================= */
.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  padding: 0 15px 12px;
}

.left-controls {
  display: flex;
  gap: 15px;
  flex: 1;
  align-items: flex-end;
}
.right-controls {
  display: flex;
  gap: 10px;
  align-self: flex-end;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.label-inside {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}
.search-box {
  position: relative;
  width: 300px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  pointer-events: none;
  transition: 0.3s;
}

.form-input,
.form-select {
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  background-color: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-input.ps-icon {
  padding-left: 40px;
}

/* Input Focus Effects */
.form-input:focus,
.form-select:focus {
  border-color: var(--primary-brown);
  box-shadow: 0 0 0 4px rgba(99, 57, 31, 0.1);
  background-color: #fff;
}

.form-input:focus + .search-icon svg {
  stroke: var(--primary-brown);
}

/* =========================================
    4. BUTTONS
    ========================================= */
.btn {
  height: 42px;
  padding: 0 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  user-select: none;
}

/* Hover Effect Utility */
.hover-effect:active {
  transform: scale(0.96);
}

.btn-primary {
  background-color: #fff;
  color: var(--text-main);
  border: 1px solid #d1d5db;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
.btn-primary:hover {
  border-color: var(--primary-brown);
  color: var(--primary-brown);
  background-color: #fff8f5;
  box-shadow: 0 4px 10px rgba(99, 57, 31, 0.15);
}

.btn-outline {
  background-color: #fff;
  color: var(--text-main);
  border: 1px solid #d1d5db;
}
.btn-outline:hover {
  border-color: var(--primary-brown);
  background-color: var(--primary-light);
  color: var(--primary-brown);
}

/* =========================================
    5. TABLE
    ========================================= */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}
.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1000px;
  table-layout: fixed;
}

.custom-table th {
  font-weight: 700;
  padding: 16px 12px;
  text-align: left;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #edf2f7;
}

.custom-table td {
  padding: 16px 12px;
  font-size: 15px;
  color: #484848;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}

/* Row Hover Effect */
.table-row-hover:hover td {
  background-color: #fdf8f6; /* Nền nâu rất nhạt */
}

.text-dark-bold {
  color: #1f2937;
  font-weight: 600;
}
.text-center {
  text-align: center !important;
}
.truncate-text,
.address-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status Badge */
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
  min-width: 130px;
}
.status-active {
  color: var(--success-green);
}
.status-inactive {
  color: var(--danger-red);
}

/* =========================================
    6. ACTIONS & SWITCH
    ========================================= */
.actions-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.btn-icon-edit {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-icon-edit:hover {
  background: var(--primary-brown);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(99, 57, 31, 0.2);
}

/* Switch Animation */
.switch {
  position: relative;
  width: 46px;
  height: 24px;
}
.switch input {
  display: none;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #d1d5db;
  transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 24px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
input:checked + .slider {
  background-color: var(--primary-brown);
}
input:checked + .slider:before {
  transform: translateX(22px);
}

/* =========================================
    7. PAGINATION
    ========================================= */
.pagination-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px 0;
}
.p-btn {
  min-width: 38px;
  height: 38px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  color: #374151;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.p-btn:hover:not(:disabled) {
  border-color: var(--primary-brown);
  color: var(--primary-brown);
}
.p-btn.active {
  background: var(--primary-brown);
  border-color: var(--primary-brown);
  color: #fff;
  box-shadow: 0 4px 6px rgba(99, 57, 31, 0.2);
}
.p-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-actions {
  display: flex;
  gap: 20px;
}

.confirm-actions button {
  flex: 1;
  height: 42px;
}

/* =========================================
    8. MODAL & TOAST
    ========================================= */
.modal-overlay {
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
  color: var(--primary-brown);
  margin-bottom: 10px;
  font-size: 20px;
}
.confirm-desc {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
}

.btn-confirm {
  background: var(--primary-brown);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}
.btn-confirm:hover {
  background: #4e2c17;
  box-shadow: 0 4px 10px rgba(78, 44, 23, 0.3);
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
}
.btn-cancel:hover {
  background: #e5e7eb;
}

/* Toast */
.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  background-color: #fff;
  padding: 16px 20px;
  border-radius: 12px;
  border-left: 5px solid;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 320px;
}
.toast-notification.success {
  border-color: var(--success-green);
}
.toast-notification.error {
  border-color: var(--danger-red);
}
.toast-content {
  font-weight: 600;
  font-size: 14px;
}
.toast-close {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

/* Transitions */
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}

/* Loading Spinner */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-brown);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
  vertical-align: middle;
}

/* Tooltip Animation */
.tooltip-container {
  position: relative;
}
.tooltip-container:hover::after,
.tooltip-container:hover::before {
  opacity: 1;
  transform: translate(-50%, -5px);
}
.tooltip-container::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translate(-50%, 5px);
  background: #1f2937;
  color: #fff;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.tooltip-container::before {
  content: "";
  position: absolute;
  bottom: 115%;
  left: 50%;
  transform: translate(-50%, 5px);
  border: 6px solid transparent;
  border-top-color: #1f2937;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
}
</style>
