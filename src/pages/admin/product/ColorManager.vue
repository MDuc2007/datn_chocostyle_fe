<template>
  <div class="header">
    <h2 class="title">QUẢN LÝ MÀU SẮC</h2>

    <div class="top-bar">
      <div class="search-wrapper">
        <img src="/src/assets/icon/search.svg" class="search-icon" alt="icon" />
        <input
          type="text"
          class="search-input"
          placeholder="Tìm kiếm màu sắc theo tên"
        />
      </div>

      <div class="add-btn">
        <button @click="openModal"><span>＋</span> Thêm màu sắc</button>
      </div>
    </div>
  </div>
  <div class="color-page">
    <table class="color-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Mã màu</th>
          <th>RGB</th>
          <th>Tên màu</th>
          <th>Ngày tạo</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in colors" :key="item.id">
          <td>{{ index + 1 }}</td>
          <td>{{ item.code }}</td>
          <td>{{ item.rgb }}</td>
          <td>{{ item.name }}</td>
          <td>{{ formatDate(item.ngayTao) }}</td>
          <td class="action">
            <button @click="editColor(item)" class="edit-btn">👁️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="pagination">
    <button><</button>
    <button class="active">1</button>
    <button>></button>
  </div>

  <!-- Modal -->
  <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <h3>{{ isEdit ? "Sửa màu sắc" : "Thêm màu sắc" }}</h3>
      <div class="color-input-group">
        <input
          type="color"
          v-model="newColor.rgb"
          class="color-picker"
          style="width: 30%"
        />

        <input v-model="newColor.tenMauSac" placeholder="Nhập tên màu" />
      </div>

      <div class="modal-actions">
        <button @click="closeModal">Huỷ</button>
        <button class="save-btn" @click="isEdit ? updateColor() : addColor()">
          {{ isEdit ? "Cập nhật" : "Lưu" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const colors = ref([]);

const fetchColors = async () => {
  const res = await axios.get("http://localhost:8080/api/mau-sac");

  colors.value = res.data.map((item) => ({
    id: item.id,
    name: item.tenMauSac,
    code: item.maMauSac,
    rgb: item.rgb,
    ngayTao: item.ngayTao,
  }));
};
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
};

onMounted(fetchColors);

const isModalOpen = ref(false);
const newColor = ref({
  tenMauSac: "",
  rgb: "",
  nguoiTao: "admin", // tạm thời
});

const isEdit = ref(false);
const editingId = ref(null);

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  newColor.value = {
    tenMauSac: "",
    rgb: "",
    nguoiTao: "admin",
  };
  isEdit.value = false;
  editingId.value = null;
};

const addColor = async () => {
  if (!newColor.value.tenMauSac.trim()) return;

  await fetch("http://localhost:8080/api/mau-sac", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenMauSac: newColor.value.tenMauSac,
      rgb: newColor.value.rgb,
      nguoiTao: "admin", // 👈 bắt buộc
    }),
  });

  closeModal();
  fetchColors();
};

const editColor = (item) => {
  isEdit.value = true;
  editingId.value = item.id;
  newColor.value.tenMauSac = item.name;
  newColor.value.rgb = item.rgb;
  openModal();
};

const updateColor = async () => {
  if (!newColor.value.tenMauSac.trim()) return;

  await fetch(`http://localhost:8080/api/mau-sac/${editingId.value}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenMauSac: newColor.value.tenMauSac,
      rgb: newColor.value.rgb,
      nguoiCapNhat: "admin",
    }),
  });

  closeModal();
  fetchColors();
};

const deleteColor = async (item) => {
  if (confirm(`Bạn có chắc muốn xóa màu "${item.name}"?`)) {
    await fetch(`http://localhost:8080/api/mau-sac/${item.id}`, {
      method: "DELETE",
    });
    fetchColors();
  }
};
</script>

<style scoped>
.color-page {
  background: #fff;
  padding: 20px;
  font-size: 14px;
  margin-top: 10px;
  box-shadow:
    rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em,
    rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em,
    rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset;
  border-radius: 6px;
}

.title {
  color: #63391f;
  margin-bottom: 15px;
  margin: 15px;
}

.header {
  margin-bottom: 10px;
  background: #fff;
  box-shadow:
    rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em,
    rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em,
    rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset;
  border-radius: 6px;
}
/* TOP BAR */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.add-btn {
  margin: 15px;
}

.add-btn button {
  background: #fff;
  border: 1px solid #ccc;
  padding: 6px 12px;
  cursor: pointer;
}

/* TABLE */
.color-table {
  width: 100%;
  border-collapse: collapse;
}

.color-table th {
  background: #63391f;
  color: #fff;
  padding: 8px;
}

.color-table td {
  border-bottom: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.action {
  display: flex;
  gap: 5px;
  justify-content: center;
}

.action button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}

.edit-btn:hover {
  color: #007bff;
}

.delete-btn:hover {
  color: #dc3545;
}

/* PAGINATION */
.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.pagination button {
  padding: 4px 10px;
  border: 1px solid #ccc;
  background: #fff;
}

.pagination .active {
  background: #63391f;
  color: #fff;
}
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
  font-size: 16px;
  color: #666;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 10px 8px 34px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
}

.search-input:focus {
  border-color: #6b3f2a;
}

/* MODAL */
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
  background: #6b3f23;
  color: white;
  min-width: 80px;
}

.modal-actions .save-btn:hover {
  background: #6b3f23;
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
</style>
