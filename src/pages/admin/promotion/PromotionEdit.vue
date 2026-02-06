<template>
  <div class="layout">
    <div class="left">
      <div class="card">
        <h5 class="title">Chỉnh sửa đợt giảm giá</h5>

        <div class="form">
          <div class="field">
            <label>Tên đợt giảm giá</label>
            <input
              v-model="form.tenDotGiamGia"
              placeholder="Nhập tên đợt giảm giá..."
            />
            <small v-if="errors.tenDotGiamGia" class="error">
              {{ errors.tenDotGiamGia }}
            </small>
          </div>

          <div class="field">
            <label>Giá trị giảm (%)</label>
            <div class="input-group">
              <input
                v-model.number="form.giaTriGiam"
                type="number"
                min="1"
                max="100"
              />
              <span>%</span>
            </div>
            <small v-if="errors.giaTriGiam" class="error">
              {{ errors.giaTriGiam }}
            </small>
          </div>

          <div class="field">
            <label>Ngày bắt đầu</label>
            <input v-model="form.ngayBatDau" type="date" />
            <small v-if="errors.ngayBatDau" class="error">
              {{ errors.ngayBatDau }}
            </small>
          </div>

          <div class="field">
            <label>Ngày kết thúc</label>
            <input
              v-model="form.ngayKetThuc"
              type="date"
              :min="form.ngayBatDau"
            />
            <small v-if="errors.ngayKetThuc" class="error">
              {{ errors.ngayKetThuc }}
            </small>
          </div>
        </div>

        <div class="actions">
          <button class="btn cancel" @click="back">Hủy</button>
          <button class="btn primary" @click="onClickSave">Lưu</button>
        </div>
      </div>
    </div>

    <div class="right">
      <div class="card">
        <h5 class="title">Danh sách sản phẩm</h5>

        <input
          v-model="keyword"
          class="search-input"
          placeholder="Tìm theo mã hoặc tên sản phẩm..."
        />

        <small
          v-if="errors.chiTiet"
          class="error block"
          style="margin-bottom: 10px"
        >
          {{ errors.chiTiet }}
        </small>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>
                  <button
                    class="btn-icon header-tick"
                    :class="{ active: isAllSpSelected }"
                    @click="toggleAllSanPham"
                  >
                    {{ isAllSpSelected ? "✓" : "+" }}
                  </button>
                </th>
                <th>STT</th>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Ảnh</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sp, index) in filteredSanPhamList" :key="sp.id">
                <td>
                  <button
                    class="btn-icon"
                    :class="{ active: selectedSanPhamIds.includes(sp.id) }"
                    @click="toggleSanPham(sp)"
                  >
                    {{ selectedSanPhamIds.includes(sp.id) ? "✓" : "+" }}
                  </button>
                </td>
                <td>{{ index + 1 }}</td>
                <td>{{ sp.maSp }}</td>
                <td>{{ sp.tenSp }}</td>
                <td><img :src="sp.hinhAnh" /></td>
              </tr>
              <tr v-if="sanPhamList.length === 0">
                <td colspan="5" class="empty">
                  Đang tải danh sách sản phẩm...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-for="spId in selectedSanPhamIds" :key="spId" class="full">
      <div class="panel-card">
        <h5 class="subtitle">
          Biến thể của: {{ sanPhamList.find((sp) => sp.id === spId)?.tenSp }}
        </h5>
        <div class="variant-wrapper">
          <table class="variant-table">
            <thead>
              <tr>
                <th>
                  <button
                    class="btn-icon header-tick"
                    :class="{ active: isAllChiTietSelected(spId) }"
                    @click="toggleAllChiTiet(spId)"
                  >
                    {{ isAllChiTietSelected(spId) ? "✓" : "+" }}
                  </button>
                </th>
                <th>Mã CTSP</th>
                <th>Màu sắc</th>
                <th>Kích cỡ</th>
                <th>Loại áo</th>
                <th>Kiểu dáng</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ct in chiTietMap[spId] || []" :key="ct.id">
                <td>
                  <button
                    class="btn-icon"
                    :class="{ active: selectedChiTietIds.includes(ct.id) }"
                    @click="toggleChiTiet(ct.id)"
                  >
                    {{ selectedChiTietIds.includes(ct.id) ? "✓" : "+" }}
                  </button>
                </td>
                <td>{{ ct.maChiTietSanPham }}</td>
                <td>
                  {{ ct.mauSacList?.map((ms: any) => ms.tenMauSac).join(", ") }}
                </td>
                <td>
                  {{ ct.kichCoList?.join(", ") }}
                </td>
                <td>
                  {{ sanPhamList.find((sp) => sp.id === spId)?.tenLoaiAo }}
                </td>
                <td>
                  {{ sanPhamList.find((sp) => sp.id === spId)?.tenKieuDang }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="toast-container">
      <div v-for="notif in notifications" :key="notif.id" class="toast success">
        <span style="margin-right: 8px">✔️</span> {{ notif.message }}
      </div>
    </div>

    <div v-if="showConfirm" class="modal">
      <div class="modal-box">
        <h4>Xác nhận hệ thống</h4>
        <p>
          Bạn có chắc chắn muốn lưu các thay đổi cho đợt giảm giá này không?
        </p>
        <div class="actions">
          <button class="btn cancel" @click="showConfirm = false">
            Hủy bỏ
          </button>
          <button class="btn primary" @click="submit">Đồng ý</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

// 1. Khai báo các tiện ích
const router = useRouter();
const route = useRoute();
const id = route.params.id;
const keyword = ref("");

// 2. Khai báo State dữ liệu
const sanPhamList = ref<any[]>([]);
const selectedSanPhamIds = ref<number[]>([]);
const selectedChiTietIds = ref<number[]>([]);
const chiTietMap = reactive<Record<number, any[]>>({});

const form = reactive({
  tenDotGiamGia: "",
  giaTriGiam: 1,
  ngayBatDau: "",
  ngayKetThuc: "",
});

const errors = reactive({
  tenDotGiamGia: "",
  giaTriGiam: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  chiTiet: "",
});
const filteredSanPhamList = computed(() => {
  if (!keyword.value.trim()) return sanPhamList.value;

  const key = keyword.value.toLowerCase();
  return sanPhamList.value.filter(
    (sp) =>
      sp.maSp?.toLowerCase().includes(key) ||
      sp.tenSp?.toLowerCase().includes(key),
  );
});

// 3. Khai báo UI State (Modal & Toast)
const showConfirm = ref(false);
const notifications = ref<{ id: number; message: string }[]>([]);

// 4. Các hàm xử lý giao diện
const showNotification = (message: string) => {
  const id = Date.now();
  notifications.value.push({ id, message });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 3000);
};

const showSuccessModal = () => {
  showConfirm.value = false;
  showNotification("Cập nhật đợt giảm giá thành công");
  setTimeout(() => {
    back();
  }, 1500);
};

const onClickSave = () => {
  if (!validate()) return;
  showConfirm.value = true;
};

// ... (các code cũ giữ nguyên)

// --- LOGIC CHỌN TẤT CẢ SẢN PHẨM ---
const isAllSpSelected = computed(() => {
  const visibleIds = filteredSanPhamList.value.map((sp) => sp.id);
  if (visibleIds.length === 0) return false;

  return visibleIds.every((id) => selectedSanPhamIds.value.includes(id));
});

const toggleAllSanPham = async () => {
  const visibleProducts = filteredSanPhamList.value;
  const visibleIds = visibleProducts.map((sp) => sp.id);

  if (isAllSpSelected.value) {
    // Bỏ chọn các SP đang hiển thị
    selectedSanPhamIds.value = selectedSanPhamIds.value.filter(
      (id) => !visibleIds.includes(id),
    );

    // Bỏ luôn các biến thể tương ứng
    visibleIds.forEach((spId) => {
      const ctIds = (chiTietMap[spId] || []).map((ct) => ct.id);
      selectedChiTietIds.value = selectedChiTietIds.value.filter(
        (id) => !ctIds.includes(id),
      );
    });
  } else {
    // Chọn tất cả SP đang hiển thị
    for (const sp of visibleProducts) {
      if (!selectedSanPhamIds.value.includes(sp.id)) {
        selectedSanPhamIds.value.push(sp.id);
        await fetchChiTietBySpId(sp.id);
      }
    }
  }
};

// --- LOGIC CHỌN TẤT CẢ BIẾN THỂ ---
const isAllChiTietSelected = (spId: number) => {
  const allIds = chiTietMap[spId]?.map((ct) => ct.id) || [];
  if (allIds.length === 0) return false;
  return allIds.every((id) => selectedChiTietIds.value.includes(id));
};

const toggleAllChiTiet = (spId: number) => {
  const allIds = chiTietMap[spId]?.map((ct) => ct.id) || [];
  if (isAllChiTietSelected(spId)) {
    // Bỏ chọn tất cả biến thể của SP này
    selectedChiTietIds.value = selectedChiTietIds.value.filter(
      (id) => !allIds.includes(id),
    );
  } else {
    // Thêm các ID chưa có vào mảng chọn
    allIds.forEach((id) => {
      if (!selectedChiTietIds.value.includes(id)) {
        selectedChiTietIds.value.push(id);
      }
    });
  }
};
const back = () => router.push("/admin/promotion");

// 5. Logic Nghiệp vụ & Validation
const validate = () => {
  let valid = true;
  Object.keys(errors).forEach((k) => (errors[k as keyof typeof errors] = ""));

  if (!form.tenDotGiamGia.trim()) {
    errors.tenDotGiamGia = "Tên đợt giảm giá không được để trống";
    valid = false;
  }
  if (!form.giaTriGiam || form.giaTriGiam < 1 || form.giaTriGiam > 100) {
    errors.giaTriGiam = "Giá trị giảm phải từ 1 – 100%";
    valid = false;
  }
  if (!form.ngayBatDau) {
    errors.ngayBatDau = "Ngày bắt đầu không được để trống";
    valid = false;
  }
  if (!form.ngayKetThuc) {
    errors.ngayKetThuc = "Ngày kết thúc không được để trống";
    valid = false;
  } else if (form.ngayKetThuc < form.ngayBatDau) {
    errors.ngayKetThuc = "Ngày kết thúc phải ≥ ngày bắt đầu";
    valid = false;
  }
  if (selectedChiTietIds.value.length === 0) {
    errors.chiTiet = "Vui lòng chọn ít nhất 1 biến thể sản phẩm";
    valid = false;
  }
  return valid;
};

// 6. Gọi API
const fetchSanPham = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/san-pham");
    sanPhamList.value = res.data.content ?? res.data;
  } catch (e) {
    console.error("Lỗi tải danh sách sản phẩm", e);
  }
};

const fetchChiTietBySpId = async (spId: number) => {
  if (chiTietMap[spId]) return;
  try {
    const res = await axios.get(`http://localhost:8080/api/san-pham/${spId}`);
    chiTietMap[spId] = (res.data.bienTheList || []).map((ct: any) => ({
      ...ct,
      id: Number(ct.id),
    }));
  } catch (e) {
    console.error("Lỗi tải biến thể", e);
  }
};

const submit = async () => {
  try {
    const payload = {
      ...form,
      chiTietSanPhamIds: selectedChiTietIds.value,
    };
    await axios.put(`http://localhost:8080/api/promotions/${id}`, payload);
    showSuccessModal();
  } catch (e) {
    alert("Lỗi server: Không thể cập nhật đợt giảm giá");
    console.error(e);
  }
};

// 7. Xử lý sự kiện chọn sản phẩm/biến thể
const toggleSanPham = async (sp: any) => {
  const index = selectedSanPhamIds.value.indexOf(sp.id);
  if (index === -1) {
    selectedSanPhamIds.value.push(sp.id);
    await fetchChiTietBySpId(sp.id);
  } else {
    selectedSanPhamIds.value.splice(index, 1);
    const ctIds = (chiTietMap[sp.id] || []).map((c) => c.id);
    selectedChiTietIds.value = selectedChiTietIds.value.filter(
      (id) => !ctIds.includes(id),
    );
  }
};

const toggleChiTiet = (ctId: number) => {
  const index = selectedChiTietIds.value.indexOf(ctId);
  if (index === -1) {
    selectedChiTietIds.value.push(ctId);
  } else {
    selectedChiTietIds.value.splice(index, 1);
  }
};

// 8. Khởi tạo dữ liệu khi Load trang
onMounted(async () => {
  await fetchSanPham();
  try {
    const res = await axios.get(`http://localhost:8080/api/promotions/${id}`);
    const data = res.data;

    form.tenDotGiamGia = data.tenDotGiamGia;
    form.giaTriGiam = data.giaTriGiam;
    form.ngayBatDau = data.ngayBatDau;
    form.ngayKetThuc = data.ngayKetThuc;

    selectedSanPhamIds.value =
      data.sanPhamApDung?.map((sp: any) => sp.idSp) || [];
    selectedChiTietIds.value = data.chiTietSanPhamIds || [];

    // Tải trước biến thể của các sản phẩm đã được áp dụng
    for (const spId of selectedSanPhamIds.value) {
      await fetchChiTietBySpId(spId);
    }
  } catch (e) {
    console.error(e);
    alert("Không tìm thấy thông tin đợt giảm giá này");
  }
});
</script>

<style scoped>
/* === LAYOUT === */
.layout {
  display: grid;
  grid-template-columns: 39% 60%;
  gap: 20px;
  background-color: #f4f4f9;
  min-height: 100vh;
  margin-top: 1px;
}

.full {
  grid-column: 1 / -1;
}

/* === CARD === */
.card {
  height: 510px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #ddd;
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  margin-top: 1px;
  color: #333;
}

.subtitle {
  font-weight: 600;
  margin-bottom: 12px;
  color: #63391f;
}

/* === FORM === */
.form {
  display: grid;
  gap: 16px;
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #555;
}

.field input {
  height: 50px;
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-sizing: border-box;
}
.input-group {
  display: flex;
  align-items: center; /* căn giữa theo chiều dọc */
}

.input-group input {
  height: 50px;
  border-right: none;
  border-radius: 10px 0 0 10px;
}

.input-group span {
  height: 50px;
  display: flex;
  align-items: center; /* căn giữa chữ % */
  justify-content: center;
  padding: 0 16px; /* chỉ để padding ngang */
  border: 1px solid #ddd;
  border-left: none;
  border-radius: 0 10px 10px 0;
  color: #666;
  font-weight: 600;
}

/* === BUTTONS === */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn.primary {
  width: 100px;
  height: 40px;
  background: #63391f;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  margin-top: 1px;
}

.btn.cancel {
  width: 100px;
  height: 40px;
  background: #888;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  margin-top: 1px;
}

.btn:hover {
  opacity: 0.9;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon.active {
  background: #63391f;
  color: #fff;
  border-color: #63391f;
}
.header-tick:hover {
  transform: scale(1.1);
}
/* === TABLE === */
/* ===== TABLE DSSP (GIỐNG CREATE) ===== */
.table-wrapper {
  height: 390px;
  position: relative;
  flex: 1;
  border-radius: 16px;
  border: 1px solid #ddd;
  background: #fff;

  overflow: hidden; /* 🔥 giữ bo góc */
  display: flex;
  flex-direction: column;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  flex: 1;
}

/* thead + tbody tách riêng */
.table thead,
.table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

/* header cố định */
.table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* chỉ tbody cuộn */
.table tbody {
  display: block;
  overflow-y: auto;
  max-height: 300px;
}

/* bo góc header */
.table thead th:first-child {
  border-top-left-radius: 16px;
}

.table thead th:last-child {
  border-top-right-radius: 16px;
}

/* cell */
.table th,
.table td {
  padding: 17px 8px;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #eee;
  word-wrap: break-word;
}

/* màu chữ header */
.table thead th {
  color: #000000;
}

/* width các cột giống CREATE */
.table th:first-child,
.table td:first-child {
  width: 70px;
}

.table th:nth-child(2),
.table td:nth-child(2) {
  width: 60px;
}

.table th:last-child,
.table td:last-child {
  width: 100px;
}

img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

/* === ERROR === */
.error {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 4px;
}

.block {
  display: block;
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Style cho từng cái Toast giống ảnh mẫu */
.toast {
  min-width: 300px;
  padding: 16px 24px;
  border-radius: 8px;
  background-color: #dcfce7; /* Xanh nhạt */
  color: #166534; /* Chữ xanh đậm */
  font-size: 16px;
  font-weight: 500;
  border-left: 6px solid #22c55e; /* Thanh màu xanh lá đậm bên trái */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

/* Hiệu ứng trượt từ phải vào */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.search-input {
  height: 50px;
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-sizing: border-box;
  margin-bottom: 20px;
}
/* === MODAL === */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-box {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.modal-box h4 {
  margin-top: 0;
  color: #333;
}
.modal-box p {
  color: #666;
  line-height: 1.5;
}
/* ===== PANEL BIẾN THỂ ===== */
.panel-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 20px;
}

/* tiêu đề */
.subtitle {
  font-weight: 700;
  font-size: 25px;
  margin-top: 1px;
  margin-bottom: 12px;
  color: #000000;
}

/* wrapper chỉ để bo góc */
.variant-wrapper {
  border: 1px solid #ddd;
  border-radius: 16px;
  overflow: hidden; /* 🔥 để bo góc table */
}

/* bảng hiển thị BÌNH THƯỜNG */
.variant-table {
  width: 100%;
  border-collapse: collapse;
}

/* header */
.variant-table thead th {
  color: #000000;
  padding: 14px 8px;
  text-align: center;
}

/* cell */
.variant-table td {
  padding: 14px 8px;
  text-align: center;
  border-top: 1px solid #eee;
}
</style>
