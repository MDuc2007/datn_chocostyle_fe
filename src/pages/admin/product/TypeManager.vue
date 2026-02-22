<template>
  <div class="header">
    <h2 class="title">QUẢN LÝ LOẠI ÁO</h2>

    <div class="top-bar" style="margin-top: 30px">
      <div class="left-actions">
        <div class="search-wrapper">
          <img
            src="/src/assets/icon/search.svg"
            class="search-icon"
            alt="icon"
          />
          <input
            type="text"
            class="search-input"
            placeholder="Tìm kiếm loại áo theo tên"
          />
        </div>
        <div
          class="filters"
          style="display: flex; align-items: center; gap: 10px"
        >
          <label for="">Trạng thái:</label>
          <select
            v-model="selectedStatus"
            @change="handleFilterChange"
            style="padding: 10px; border: 1px solid #d6c3b4; border-radius: 6px"
          >
            <option value="">Tất cả</option>
            <option value="1">Đang hoạt động</option>
            <option value="0">Ngừng hoạt động</option>
          </select>
        </div>
      </div>

      <div class="add-btn">
        <button @click="openModal"><span>＋</span> Thêm loại áo</button>
      </div>
    </div>
  </div>
  <div class="product-page">
    <div class="table-panel">
      <div class="table-wrapper">
        <table class="product-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã loại</th>
              <th>Tên loại</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in colors" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.code }}</td>
              <td>{{ item.name }}</td>
              <td>{{ formatDate(item.ngayTao) }}</td>
              <td>
                <span
                  class="status"
                  :class="item.trangThai === 1 ? 'selling' : 'stopped'"
                >
                  {{
                    item.trangThai === 1 ? "Đang hoạt động" : "Ngừng hoạt động"
                  }}
                </span>
              </td>
              <td class="action">
                <div class="tooltip-wrapper" data-tooltip="Xem chi tiết">
                  <span class="icon view" @click="editColor(item)">
                    <img
                      src="/src/assets/icon/eye.svg"
                      style="width: 20px; height: 20px"
                    />
                  </span>
                </div>
                <div
                  class="tooltip-wrapper"
                  :data-tooltip="
                    item.trangThai === 1
                      ? 'Ngừng hoạt động'
                      : item.trangThai === 0
                        ? 'Hoạt động'
                        : 'Không khả dụng'
                  "
                >
                  <label class="switch">
                    <input
                      type="checkbox"
                      :checked="item.trangThai === 1"
                      @click.prevent="toggleStatus(item)"
                    />
                    <span class="slider"></span>
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button
          class="nav-btn"
          @click="previousPage"
          :disabled="currentPage === 0"
        >
          &lt;
        </button>
        <div class="page-numbers">
          <button class="page-btn">1</button>
        </div>
        <button
          class="nav-btn"
          @click="nextPage"
          :disabled="currentPage === totalPages - 1"
        >
          &gt;
        </button>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <h3>{{ isEdit ? "Sửa loại áo" : "Thêm loại áo" }}</h3>

      <input v-model="newColor.tenLoai" placeholder="Nhập tên" />

      <div class="modal-actions">
        <button @click="closeModal">Huỷ</button>
        <button class="save-btn" @click="isEdit ? updateColor() : addColor()">
          {{ isEdit ? "Cập nhật" : "Lưu" }}
        </button>
      </div>
    </div>
  </div>
  <div class="toast-container">
    <div
      v-for="notif in notifications"
      :key="notif.id"
      class="toast"
      :class="notif.type"
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

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const user = JSON.parse(localStorage.getItem("user") || "{}");
const token = user?.accessToken;
const username = user?.username;

const colors = ref([]);
const allColors = ref([]);
const selectedStatus = ref("");

const notifications = ref([]);

const showNotification = (message, type = "success") => {
  const id = Date.now();
  notifications.value.push({ id, message, type });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 3000);
};

/* ================== CONFIRM MODAL ================== */
const modal = ref({
  show: false,
  title: "",
  message: "",
  action: null,
  data: null,
});

function closeConfirmModal() {
  modal.value.show = false;
}

function toggleStatus(item) {
  const newStatus = item.trangThai === 1 ? 0 : 1;

  modal.value = {
    show: true,
    title: "Xác nhận thay đổi trạng thái",
    message: `Bạn có chắc muốn ${
      newStatus === 1 ? "Kích hoạt" : "Ngừng hoạt động"
    } loại áo "${item.name}"?`,
    action: "TOGGLE_STATUS",
    data: item,
  };
}

async function handleModalConfirm() {
  if (modal.value.action === "TOGGLE_STATUS") {
    const item = modal.value.data;
    const oldStatus = item.trangThai;
    const newStatus = oldStatus === 1 ? 0 : 1;

    // optimistic update
    item.trangThai = newStatus;

    try {
      await axios.put(
        `http://localhost:8080/api/loai-ao/${item.id}/doi-trang-thai`,
        null,
        {
          params: { nguoiCapNhat: username },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      showNotification("Cập nhật trạng thái thành công", "success");
    } catch {
      item.trangThai = oldStatus;
      showNotification("Lỗi cập nhật trạng thái", "error");
    }
  }

  modal.value.show = false;
}

const handleFilterChange = () => {
  if (selectedStatus.value === "") {
    colors.value = [...allColors.value];
  } else {
    const status = Number(selectedStatus.value);
    colors.value = allColors.value.filter((item) => item.trangThai === status);
  }
};

const fetchColors = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/loai-ao", {
      headers: { Authorization: `Bearer ${token}` },
    });

    allColors.value = res.data.map((item) => ({
      id: item.id,
      name: item.tenLoai,
      code: item.maLoai,
      ngayTao: item.ngayTao,
      trangThai: item.trangThai,
    }));

    colors.value = [...allColors.value];
  } catch {
    showNotification("Không thể tải danh sách loại áo", "error");
  }
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
};

onMounted(fetchColors);

const isModalOpen = ref(false);
const isEdit = ref(false);
const editingId = ref(null);

const newColor = ref({
  tenLoai: "",
});

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  newColor.value = { tenLoai: "" };
  isEdit.value = false;
  editingId.value = null;
};

const addColor = async () => {
  if (!newColor.value.tenLoai.trim()) {
    showNotification("Tên loại áo không được để trống", "warning");
    return;
  }

  try {
    await axios.post(
      "http://localhost:8080/api/loai-ao",
      {
        tenLoai: newColor.value.tenLoai,
        nguoiTao: username,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    showNotification("Thêm loại áo thành công", "success");
    closeModal();
    fetchColors();
  } catch (error) {
    showNotification(
      error?.response?.data?.message || "Thêm loại áo thất bại",
      "error",
    );
  }
};

const editColor = (item) => {
  isEdit.value = true;
  editingId.value = item.id;
  newColor.value.tenLoai = item.name;
  openModal();
};

const updateColor = async () => {
  if (!newColor.value.tenLoai.trim()) {
    showNotification("Tên loại áo không được để trống", "warning");
    return;
  }

  try {
    await axios.put(
      `http://localhost:8080/api/loai-ao/${editingId.value}`,
      {
        tenLoai: newColor.value.tenLoai,
        nguoiCapNhat: username,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    showNotification("Cập nhật loại áo thành công", "success");
    closeModal();
    fetchColors();
  } catch (error) {
    showNotification(
      error?.response?.data?.message || "Cập nhật thất bại",
      "error",
    );
  }
};

const deleteColor = async (item) => {
  if (!confirm(`Bạn có chắc muốn xóa loại áo "${item.name}"?`)) return;

  try {
    await axios.delete(`http://localhost:8080/api/loai-ao/${item.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    showNotification("Xóa loại áo thành công", "success");
    fetchColors();
  } catch {
    showNotification("Xóa loại áo thất bại", "error");
  }
};
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
  gap: 12px;
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
  margin: 0;
  align-self: flex-end; /* 👈 ép nút xuống cùng hàng */
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
  height: 50px;
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

/* Đang bán */
.status.selling {
  color: #1b7f4b;
  background: #e7f7ef;
  border-color: #a8e5c7;
  font-size: 10px;
}

/* Hết hàng */
.status.out {
  color: #ea580c;
  background: #ffedd5;
  border-color: #fdba74;
  font-size: 10px;
}

/* Ngừng bán */
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
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
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
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: #fff;
  border-color: #63391f;
  font-weight: 600;
}

.page-btn.active:hover {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
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
.product-table img {
  width: 40px;
  height: auto;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: white;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  text-align: center;
  font-weight: 600;
}

.modal input {
  width: 100%;
  padding: 12px;
  margin: 15px 0;
  border: 1px solid #c7b2a3;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal input:focus {
  outline: none;
  border-color: #6b3f23;
  background-color: #fafafa;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.modal-actions button:first-child {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.modal-actions button:first-child:hover {
  background: #e5e5e5;
  border-color: #ccc;
}

.modal-actions .save-btn {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: white;
  min-width: 80px;
}

.modal-actions .save-btn:hover {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
}
.color-input-group {
  display: flex;
  gap: 8px;
}

.color-input-group label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.color-picker {
  width: 100%;
  height: 60px;
  border: 2px solid #c7b2a3;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: white;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  text-align: center;
  font-weight: 600;
}

.modal input {
  width: 100%;
  padding: 12px;
  margin: 15px 0;
  border: 1px solid #c7b2a3;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal input:focus {
  outline: none;
  border-color: #6b3f23;
  background-color: #fafafa;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.modal-actions button:first-child {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.modal-actions button:first-child:hover {
  background: #e5e5e5;
  border-color: #ccc;
}

.modal-actions .save-btn {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: white;
  min-width: 80px;
}

.modal-actions .save-btn:hover {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
}
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.tooltip-wrapper::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 120%;
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
  z-index: 100;
}

.tooltip-wrapper::before {
  content: "";
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #333;
  opacity: 0;
  transition: 0.2s ease;
}

.tooltip-wrapper:hover::after,
.tooltip-wrapper:hover::before {
  opacity: 1;
}
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.toast {
  padding: 15px 20px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
  word-wrap: break-word;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast.warning {
  background: #ffc107;
  color: #333;
  border-left: 4px solid #ff9800;
}

.toast.error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.toast.success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
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
