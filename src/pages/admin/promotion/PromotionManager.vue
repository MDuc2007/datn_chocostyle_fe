<template>
  <!-- ===== HEADER PANEL ===== -->
  <div class="header">
    <h2 class="title">QUẢN LÝ ĐỢT GIẢM GIÁ</h2>


    <div class="top-bar" style="margin-top: 30px">
      <!-- LEFT -->
      <div class="left-actions">
        <div>
          <label>Tìm kiếm</label>
          <div class="search-wrapper">
            <img src="/src/assets/icon/search.svg" class="search-icon" />
            <input
              type="text"
              class="search-input"
              placeholder="Tìm theo mã hoặc tên"
              v-model="filter.keyword"
            />
          </div>
        </div>
        <!-- SEARCH -->


        <!-- FILTER -->
        <div class="filters">
          <div class="filter-item">
            <label>Trạng thái</label>
          <select v-model="filter.trangThai">
  <option value="">Tất cả</option>
  <option :value="1">Đang áp dụng</option>
  <option :value="2">Sắp diễn ra</option>
  <option :value="3">Ngừng hoạt động</option>
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
          <div class="filter-item clear-wrap">
            <button class="btn-clear" @click="clearFilter">
              <img
                src="/src/assets/icon/refesh.svg"
                style="width: 20px; height: 20px"
                alt=""
              />
            </button>
          </div>
        </div>
      </div>


      <div class="add-btn">
        <button @click="$router.push('/admin/promotion/create')">
          <span>＋</span> Thêm đợt giảm
        </button>
      </div>
    </div>


    <!-- RIGHT -->
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
             {{ statusText(p) }}
              </span>
            </td>


            <td class="action">
              <label
                class="switch tooltip"
                :data-tooltip="p.trangThai === 0 ? 'Kích hoạt' : 'Tắt đợt giảm'"
              >
                <input
                  type="checkbox"
                  :checked="p.trangThai !== 0"
                  @click.prevent="toggleTrangThai(p.id)"
                />


                <span class="slider"></span>
              </label>
              <span
                class="icon edit tooltip"
                data-tooltip="Chỉnh sửa"
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
  <div class="toast-container">
    <div
      v-for="notif in notifications"
      :key="notif.id"
      class="toast"
      :class="{ error: notif.type === 'error' }"
    >
      {{ notif.message }}
    </div>
  </div>
  <transition name="fade-modal">
    <div
      v-if="modal.show"
      class="modal-confirm"
      @click.self="closeConfirmModal"
    >
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
          <button class="btn-cancel hover-effect" @click="closeConfirmModal">
            Hủy
          </button>
          <button class="btn-confirm hover-effect" @click="handleModalConfirm">
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  </transition>
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
 trangThai: "" as number | "",
  start: "",
  end: "",
});
const clearFilter = () => {
  filter.keyword = "";
  filter.trangThai = "";
  filter.start = "";
  filter.end = "";


  pagination.page = 0;
  fetchData(); // reload lại
};
const fetchData = async () => {
  const params: any = {
    page: pagination.page,
    size: pagination.size,
  };


  if (filter.keyword.trim()) params.keyword = filter.keyword.trim();


  // chỉ gửi 0,1,2 lên backend
  if (filter.trangThai !== "" && filter.trangThai !== 3) {
    params.trangThai = filter.trangThai;
  }


  if (filter.start) params.start = filter.start;
  if (filter.end) params.end = filter.end;


  const res = await axios.get("http://localhost:8080/api/promotions/filter", {
    params,
  });


  let data = res.data.content;


  const today = new Date();


  // filter NGỪNG HOẠT ĐỘNG
  if (filter.trangThai === 3) {
    data = data.filter((p: any) => {
      const end = new Date(p.ngayKetThuc);
      return p.trangThai === 0 && end >= today;
    });
  }


  // filter ĐÃ KẾT THÚC
  if (filter.trangThai === 0) {
    data = data.filter((p: any) => {
      const end = new Date(p.ngayKetThuc);
      return p.trangThai === 0 && end < today;
    });
  }


  promotions.value = data;
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


const toggleTrangThai = (id: number) => {
  modal.show = true;
  modal.id = id;
  modal.title = "Xác nhận thay đổi";
  modal.message = "Bạn có chắc chắn muốn thay đổi trạng thái đợt giảm giá này?";
};
const closeConfirmModal = () => {
  modal.show = false;
  modal.id = null;
};


const handleModalConfirm = async () => {
  if (!modal.id) return;


  try {
    await axios.patch(
      `http://localhost:8080/api/promotions/${modal.id}/toggle`,
    );


    showNotification("Cập nhật trạng thái thành công");
    await fetchData();
  } catch {
    showNotification("Cập nhật thất bại", "error");
  }


  closeConfirmModal();
};


const modal = reactive({
  show: false,
  title: "",
  message: "",
  id: null as number | null,
});


const notifications = ref<{ id: number; message: string; type?: string }[]>([]);
const showNotification = (message: string, type = "success") => {
  const id = Date.now();
  notifications.value.push({ id, message, type });


  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 2500);
};


const changePage = (p: number) => {
  if (p < 0 || p >= pagination.totalPages) return;
  pagination.page = p;
  fetchData();
};


const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "";


const formatGiaTri = (v: number) => `${v}%`;


const statusText = (p: any) => {
  if (p.trangThai === 1) return "Đang áp dụng";
  if (p.trangThai === 2) return "Sắp diễn ra";


  const today = new Date();
  const end = new Date(p.ngayKetThuc);


  if (end < today) return "Đã kết thúc";


  return "Ngừng hoạt động";
};
</script>


<style scoped>
/* ===== HEADER PANEL ===== */
.header {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e5e5e5;
  /* 👈 viền mỏng */
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
  gap: 12px;
}
.left-actions label {
  font-size: 15px;
  font-weight: 600;
  color: #484848;
}


/* ===== SEARCH ===== */
.search-wrapper {
  position: relative;
  width: 400px;
  margin-top: 10px;
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
  margin-top: 20px;
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
  display: flex;
  justify-content: end;
  align-self: flex-end;
  gap: 10px;
}


.add-btn button {
  height: 40px; /* 👈 bằng input */
  padding: 0 16px; /* ngang vừa tay */
  border: 1px solid #ccc;
  border-radius: 10px; /* 👈 bo y hệt */
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
  border: 1px solid #e5e5e5;
  /* 👈 viền nhẹ */
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


  text-align: center;
}


.product-table tbody tr {
  border-bottom: 1px solid #ddd;
}


/* Base badge */
.status {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px; /* bo tròn full */
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  border: 1px solid transparent;
}


/* Đang áp dụng */
.status.selling {
  color: #1b7f4b;
  background: #e7f7ef;
  border-color: #a8e5c7;
  font-size: 10px;
}


/* Sắp diễn ra */
.status.upcoming {
  color: #ea580c;
  background: #ffedd5;
  border-color: #fdba74;
  font-size: 10px;
}


/* Đã kết thúc */
.status.stopped {
  color: #dc2626;
  background: #fee2e2;
  border-color: #fca5a5;
  font-size: 10px;
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


/* ===== TOOLTIP ===== */
.tooltip {
  position: relative;
}


/* box */
.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);


  background: #333;
  color: #fff;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: 0.2s ease;
}


Stashed changes




/* arrow */
.tooltip::before {
  content: "";
  position: absolute;
  bottom: 115%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #333;
  opacity: 0;
  transition: 0.2s ease;
}


/* show */
.tooltip:hover::after,
.tooltip:hover::before {
  opacity: 1;
}


/* ===== CLEAR FILTER BUTTON ===== */
.clear-wrap {
  justify-content: flex-end;
}


.btn-clear {
  height: 42px;
  width: 42px;
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
/* ===== TOAST CONTAINER ===== */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}


.toast {
  min-width: 280px;
  padding: 14px 20px;
  border-radius: 8px;


  background-color: #dcfce7;
  color: #166534;


  font-size: 14px;
  font-weight: 500;


  border-left: 6px solid #22c55e;


  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);


  animation: slideIn 0.3s ease-out;
}


.toast.error {
  background-color: #fee2e2;
  color: #991b1b;
  border-left: 6px solid #ef4444;
}
.modal-confirm {
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
  color: #63391f;
  margin-bottom: 10px;
  font-size: 20px;
}
.confirm-desc {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
}


.btn-confirm {
  background: #63391f;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  flex: 1;
  height: 42px;
}
.btn-confirm:hover {
  background: #4e2c17;
  box-shadow: 0 4px 10px rgba(78, 44, 23, 0.3);
}
.confirm-actions {
  display: flex;
  gap: 20px;
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
  flex: 1;
  height: 42px;
}
.btn-cancel:hover {
  background: #e5e7eb;
}
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
</style>


