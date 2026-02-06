<template>
  <div class="page-container">
    <div class="card-section filter-card form-page-animation">
      <h2 class="page-title">QUẢN LÝ KHÁCH HÀNG</h2>

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
          <button class="btn btn-outline" @click="resetFilters">Đặt lại</button>
          <button class="btn btn-outline" @click="exportExcel">
            Xuất Excel
          </button>

          <button
            class="btn btn-primary"
            @click="$router.push('/admin/customer/add')"
          >
            + Thêm mới
          </button>
        </div>
      </div>
    </div>

    <div class="card-section table-card form-page-animation">
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
                Đang tải dữ liệu...
              </td>
            </tr>

            <template v-else>
              <tr v-for="(c, i) in customers" :key="c.id">
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
                      'status-text',
                      isActive(c) ? 'text-active' : 'text-inactive',
                    ]"
                  >
                    {{ isActive(c) ? "Đang hoạt động" : "Ngừng hoạt động" }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="actions-group">
                    <label class="switch" title="Đổi trạng thái">
                      <input
                        type="checkbox"
                        :checked="isActive(c)"
                        @click="handleToggleClick($event, c)"
                      />
                      <span class="slider round"></span>
                    </label>

                    <button
                      class="btn-icon-edit"
                      title="Chỉnh sửa"
                      @click="$router.push(`/admin/customer/edit/${c.id}`)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
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
          &lt;
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
          &gt;
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

const exportExcel = () => {
  window.location.href = `${API_URL}/export?keyword=${keyword.value}`;
};

const handleToggleClick = (event, customer) => {
  event.preventDefault();
  modal.value = {
    show: true,
    title: "Xác nhận thay đổi",
    message: `Bạn có chắc muốn ${isActive(customer) ? "Khóa" : "Mở khóa"} tài khoản khách hàng "${customer.tenKhachHang}"?`,
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
/* NOTE: moved global CSS variables to `src/style.css` to avoid leaking styles app-wide */
:deep(.page-container),
.page-container {
  --primary-brown: #63391f; /* Màu nâu thương hiệu của bạn */
  --primary-light: #fdf8f6; /* Màu nền nhạt khi hover */
  --text-main: #484848; /* Màu chữ xám đậm */
  --border-color: #e0e0e0; /* Màu viền */
  --success-green: #2ecc71; /* Màu xanh cho trạng thái hoạt động */
  --danger-red: #e74c3c; /* Màu đỏ cho ngừng hoạt động */
}
.card-section {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  overflow: hidden;
}

.filter-card {
  padding: 24px;
}

.page-title {
  /* 1. Font chữ có chân (Serif) để giống ảnh mẫu */
  font-family: "Times New Roman", Times, serif;

  /* 2. Kích thước và độ đậm */
  font-size: 24px; /* Tăng nhẹ kích thước */
  font-weight: 700; /* Độ đậm vừa phải nhưng sắc nét */

  /* 3. Màu sắc: Ảnh mẫu dùng màu đen hoặc nâu cực đậm */
  color: #63391f;

  /* 4. Định dạng chữ */
  text-transform: uppercase;
  letter-spacing: 1px; /* Khoảng cách giữa các chữ cái rộng hơn một chút */

  /* 5. Căn lề: Để sát lề trái và tạo khoảng cách với ô tìm kiếm bên dưới */
  margin: 10px 0 25px 5px;
  display: block;
}

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
  gap: 12px;
  flex: 1;
  align-items: flex-end;
}
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.label-inside {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 4px;
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
  z-index: 1;
}

.form-input,
.form-select {
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  color: #555;
  background-color: #fff;
}
.form-input.ps-icon {
  padding-left: 36px;
}
.form-input:focus,
.form-select:focus {
  border-color: var(--primary-brown);
  box-shadow: 0 0 0 2px rgba(99, 57, 31, 0.1);
}
.status-box {
  width: 160px;
}

.right-controls {
  display: flex;
  gap: 10px;
  align-self: flex-end;
}
.btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-primary {
  background-color: #ffffff;
  color: var(--text-main);
  border: 1px solid #ccc;
}
.btn-primary:hover {
  border-color: var(--primary-brown);
  color: var(--primary-brown);
  background-color: #f9f9f9;
}
.btn-outline {
  background-color: #fff;
  color: var(--text-main);
  border: 1px solid #ccc;
}
.btn-outline:hover {
  border-color: var(--primary-brown);
  background-color: #fdf8f6;
}

/* --- BẢNG DỮ LIỆU TỐI ƯU --- */
.table-card {
  padding: 10px;
}
.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
  table-layout: fixed; /* Cố định layout để đảm bảo width chính xác */
}

.custom-table thead tr {
  border-bottom: 1.5px solid #e0e0e0;
}

.custom-table th {
  background-color: #fff;
  color: #000000;
  font-weight: 700;
  padding: 20px 12px;
  text-align: left;
  font-size: 14px;
}

.custom-table td {
  padding: 18px 12px;
  font-size: 14px;
  color: #484848;
  vertical-align: middle; /* Căn giữa nội dung theo chiều dọc */
  border-bottom: 1px solid var(--border-color);
}
.custom-table tbody tr:hover {
  background-color: #f9fafb;
}

.text-dark-bold {
  color: #111827;
  font-weight: 600;
}
.text-center {
  text-align: center !important;
}

/* Xử lý nhảy dòng Trạng thái */
.status-text {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap; /* Không cho phép xuống dòng */
}
.text-active {
  color: var(--success-green);
}
.text-inactive {
  color: var(--danger-red);
}

/* Xử lý tràn chữ cho Email và Địa chỉ */
.truncate-text,
.address-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Hiện dấu ... khi text quá dài */
}

.address-cell {
  max-width: 0; /* Cần thiết để text-overflow hoạt động trong table-layout fixed */
}

.actions-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.btn-icon-edit {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  color: #484848;
  cursor: pointer;
  transition: 0.2s;
}
.btn-icon-edit:hover {
  border-color: var(--primary-brown);
  color: var(--primary-brown);
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
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  transition: 0.3s;
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
  transition: 0.3s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: var(--primary-brown);
}
input:checked + .slider:before {
  transform: translateX(26px);
}

.pagination-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 20px 0;
}
.p-btn {
  width: 40px;
  height: 40px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  color: var(--primary-brown);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.p-btn.active {
  background: var(--primary-brown);
  border-color: var(--primary-brown);
  color: #fff;
}
.p-btn:disabled {
  opacity: 0.4;
  cursor: default;
  border: none;
  background: transparent;
}

.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  background-color: #ecfdf5;
  padding: 16px 20px;
  border-radius: 12px;
  border-left: 6px solid #10b981;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 300px;
}
.toast-content {
  color: #065f46;
  font-weight: 700;
  font-size: 15px;
}
.toast-close {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 20px;
  color: #065f46;
  opacity: 0.7;
}

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
  border: 1px solid var(--border-color);
}
.confirm-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
.btn-confirm {
  background: var(--primary-brown);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}
.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}
</style>
