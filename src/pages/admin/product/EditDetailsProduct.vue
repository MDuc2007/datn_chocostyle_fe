<template>
  <div class="container">
    <h2 class="title">SỬA BIẾN THỂ</h2>

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

    <div class="form-wrapper">
      <div class="left">
        <h4>Thông tin cơ bản:</h4>

        <div class="row">
          <div class="col">
            <label>Mã chi tiết sản phẩm <span class="required">*</span></label>
            <input type="text" :value="maCTSP" readonly />
          </div>

          <div class="col">
            <label>Màu sắc <span class="required">*</span></label>
            <div class="select-box">
              <select v-model="selectedMauSacList">
                <option value="">Chọn màu sắc</option>
                <option
                  v-for="item in mauSacList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenMauSac }}
                </option>
              </select>
            </div>
          </div>

          <div class="col">
            <label>Kích cỡ <span class="required">*</span></label>
            <div class="select-box">
              <select v-model="selectedKichCoList">
                <option value="">Chọn kích cỡ</option>
                <option
                  v-for="item in kichCoList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenKichCo }}
                </option>
              </select>
            </div>
          </div>
          <div class="col">
            <label>Loại áo <span class="required">*</span></label>
            <div class="select-box">
              <select v-model="selectedLoaiAo">
                <option value="">Chọn loại áo</option>
                <option
                  v-for="item in loaiAoList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenLoai }}
                </option>
              </select>
            </div>
          </div>

          <div class="col">
            <label>Kiểu dáng <span class="required">*</span></label>
            <div class="select-box">
              <select v-model="selectedKieuDang">
                <option value="">Chọn kiểu dáng</option>
                <option
                  v-for="item in kieuDangList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenKieuDang }}
                </option>
              </select>
            </div>
          </div>

          <div class="col">
            <label>Phong cách mặc <span class="required">*</span></label>
            <div class="select-box">
              <select v-model="selectedPhongCach">
                <option value="">Chọn phong cách</option>
                <option
                  v-for="item in phongCachList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenPhongCach }}
                </option>
              </select>
            </div>
          </div>

          <div class="col">
            <label>Số lượng tồn <span class="required">*</span></label>
            <input type="number" v-model.number="soLuongTon" />
          </div>
          <div class="col">
            <label>Giá bán:</label>
            <input type="number" v-model.number="giaBan" />
          </div>
          <div class="col">
            <label>Giá nhập:</label>
            <input type="number" v-model.number="giaNhap" />
          </div>
        </div>
      </div>
      <div class="right">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="onFileChange"
          style="display: none"
        />
        <div class="image-box" @click="triggerUpload">
          <img v-if="imageUrl" :src="imageUrl" />
          <div v-else class="plus">+</div>
        </div>
        <p v-if="isUploadingImage" style="font-size: 12px; color: #666">
          Đang tải lên...
        </p>
      </div>
    </div>
    <button class="save-btn" @click="handleOpenConfirm">Lưu sản phẩm</button>
  </div>
  <div v-if="showConfirmModal" class="modal-overlay">
    <div class="modal">
      <h3>Xác nhận cập nhật</h3>
      <p>Bạn có muốn lưu thay đổi không?</p>

      <div class="modal-actions">
        <button @click="showConfirmModal = false">Hủy</button>
        <button class="save-btn" @click="submitUpdate">Xác nhận</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

/* ===== ROUTER ===== */
const route = useRoute();
const router = useRouter();
const ctspId = Number(route.params.id);
const showConfirmModal = ref(false);

/* ===== API ===== */
const API_BASE = "http://localhost:8080/api";

/* ===== STATE ===== */
const maCTSP = ref("");
const selectedMauSacList = ref("");
const selectedKichCoList = ref("");
const soLuongTon = ref(0);
const giaBan = ref(0);
const giaNhap = ref(0);
const imageUrl = ref(null);
const isUploadingImage = ref(false);

/* ===== LIST ===== */
const mauSacList = ref([]);
const kichCoList = ref([]);

const dataCTSP = ref(null);

const selectedLoaiAo = ref("");
const selectedKieuDang = ref("");
const selectedPhongCach = ref("");

const loaiAoList = ref([]);
const kieuDangList = ref([]);
const phongCachList = ref([]);

const fetchLoaiAo = async () => {
  const res = await fetch(`${API_BASE}/loai-ao`);
  loaiAoList.value = await res.json();
};

const fetchKieuDang = async () => {
  const res = await fetch(`${API_BASE}/kieu-dang`);
  kieuDangList.value = await res.json();
};

const fetchPhongCach = async () => {
  const res = await fetch(`${API_BASE}/phong-cach-mac`);
  phongCachList.value = await res.json();
};

/* ===== TOAST ===== */
const notifications = ref([]);
const showNotification = (message, type = "success") => {
  const id = Date.now();
  notifications.value.push({ id, message, type });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 3000);
};

/* ===== FETCH MASTER DATA ===== */
const fetchMauSac = async () => {
  const res = await fetch(`${API_BASE}/mau-sac`);
  mauSacList.value = await res.json();
};

const fetchKichCo = async () => {
  const res = await fetch(`${API_BASE}/kich-co`);
  kichCoList.value = await res.json();
};

/* ===== FETCH CHI TIẾT SP ===== */
const fetchCTSP = async () => {
  const res = await fetch(`${API_BASE}/chi-tiet-san-pham/${ctspId}`);
  const data = await res.json();

  dataCTSP.value = data;

  maCTSP.value = data.maChiTietSanPham;
  selectedMauSacList.value =
    mauSacList.value.find((m) => m.tenMauSac === data.tenMauSac)?.id || "";
  selectedKichCoList.value =
    kichCoList.value.find((k) => k.tenKichCo === data.tenKichCo)?.id || "";

  selectedLoaiAo.value =
    loaiAoList.value.find((l) => l.tenLoai === data.tenLoaiAo)?.id || "";

  selectedKieuDang.value =
    kieuDangList.value.find((k) => k.tenKieuDang === data.tenKieuDang)?.id ||
    "";

  selectedPhongCach.value =
    phongCachList.value.find((p) => p.tenPhongCach === data.tenPhongCachMac)
      ?.id || "";

  soLuongTon.value = data.soLuongTon;
  giaBan.value = data.giaBan;
  giaNhap.value = data.giaNhap;
  imageUrl.value = data.hinhAnh?.[0] || null;
};

/* ===== UPLOAD IMAGE (OPTIONAL) ===== */
const fileInput = ref(null);
const triggerUpload = () => fileInput.value.click();

const uploadImageToCloudinaryReturnUrl = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chocostyle_unsigned");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dvsqk1vel/image/upload",
    { method: "POST", body: formData },
  );
  const data = await res.json();
  return data.secure_url;
};

const onFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  imageUrl.value = URL.createObjectURL(file);
  isUploadingImage.value = true;

  try {
    imageUrl.value = await uploadImageToCloudinaryReturnUrl(file);
    showNotification("Tải ảnh thành công");
  } catch {
    showNotification("Lỗi upload ảnh", "error");
  }
  isUploadingImage.value = false;
};

const validateForm = () => {
  if (!selectedMauSacList.value) {
    showNotification("Vui lòng chọn màu sắc", "warning");
    return false;
  }

  if (!selectedKichCoList.value) {
    showNotification("Vui lòng chọn kích cỡ", "warning");
    return false;
  }

  if (!selectedLoaiAo.value) {
    showNotification("Vui lòng chọn loại áo", "warning");
    return false;
  }

  if (!selectedKieuDang.value) {
    showNotification("Vui lòng chọn kiểu dáng", "warning");
    return false;
  }

  if (!selectedPhongCach.value) {
    showNotification("Vui lòng chọn phong cách mặc", "warning");
    return false;
  }

  if (soLuongTon.value === null || soLuongTon.value < 0) {
    showNotification("Số lượng tồn phải ≥ 0", "warning");
    return false;
  }

  if (!giaNhap.value || giaNhap.value <= 0) {
    showNotification("Giá nhập phải lớn hơn 0", "warning");
    return false;
  }

  if (!giaBan.value || giaBan.value <= 0) {
    showNotification("Giá bán phải lớn hơn 0", "warning");
    return false;
  }

  if (giaBan.value < giaNhap.value) {
    showNotification("Giá bán không được nhỏ hơn giá nhập", "warning");
    return false;
  }

  return true;
};
const handleOpenConfirm = () => {
  if (!validateForm()) return;
  showConfirmModal.value = true;
};

/* ===== SUBMIT UPDATE ===== */
const submitUpdate = async () => {
  showConfirmModal.value = false;

  const payload = {
    id: ctspId,
    idSanPham: route.params.sanPhamId,
    idMauSac: selectedMauSacList.value,
    idKichCo: selectedKichCoList.value,
    idLoaiAo: selectedLoaiAo.value,
    idKieuDang: selectedKieuDang.value,
    idPhongCachMac: selectedPhongCach.value,
    soLuongTon: soLuongTon.value,
    giaBan: giaBan.value,
    giaNhap: giaNhap.value,
    trangThai: soLuongTon.value > 0 ? 1 : 0,
    nguoiCapNhat: "admin",
    hinhAnh: imageUrl.value ? [imageUrl.value] : [],
  };

  try {
    const res = await fetch(`${API_BASE}/chi-tiet-san-pham/${ctspId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(await res.text());

    showNotification("Cập nhật chi tiết sản phẩm thành công");
    setTimeout(() => router.back(), 1200);
  } catch (e) {
    showNotification(e.message || "Cập nhật thất bại", "error");
  }
};

/* ===== INIT ===== */
onMounted(async () => {
  await Promise.all([
    fetchMauSac(),
    fetchKichCo(),
    fetchLoaiAo(),
    fetchKieuDang(),
    fetchPhongCach(),
  ]);

  await fetchCTSP();
  const sanPhamId = route.params.sanPhamId;

  console.log(sanPhamId);
  console.log("CTSP:", dataCTSP.value);
});
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.form-wrapper {
  display: flex;
  gap: 20px;
}

.left {
  flex: 3;
}

.right {
  flex: 1;
  text-align: center;
  margin-top: 60px;
  height: 100px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.col {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.col.full {
  flex: 100%;
  width: 100%;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
}

input,
select,
textarea {
  padding: 8px;
  border: 1px solid #c7b2a3;
  border-radius: 4px;
}

textarea {
  height: 80px;
  resize: none;
}

.price {
  display: flex;
  align-items: center;
}

.price span {
  margin-left: 8px;
}

.select-box {
  display: flex;
  gap: 6px;
  align-items: flex-end;
}

.select-box select {
  flex: 1;
}

.add-btn {
  width: 36px;
  height: 36px;
  border-radius: 7px;
  border: 1px solid #c7b2a3;
  background: white;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sizes label {
  margin-right: 15px;
}

.tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag {
  padding: 5px 10px;
  border: 1px solid #c7b2a3;
  border-radius: 4px;
  font-size: 13px;
}

.tag.blue {
  color: #0b3d91;
}

.tag.black {
  color: black;
}

.image-box {
  width: 205px;
  aspect-ratio: 1;
  background: #e8e0d8;
  border: 2px dashed #c7b2a3;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  height: 205px;
}

.image-box img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 6px;
}

.plus {
  font-size: 40px;
  border: 2px solid #999;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.save-btn {
  background: #6b3f23;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.save-btn:hover:not(:disabled) {
  background: #5a3318;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
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
  background: #6b3f23;
  color: white;
  min-width: 80px;
}

.modal-actions .save-btn:hover {
  background: #6b3f23;
}

.modal-color-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 15px 0;
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

.color-picker:focus {
  outline: none;
  border-color: #6b3f23;
}

.color-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.color-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #c7b2a3;
  border-radius: 20px;
  font-size: 13px;
  background: #fafafa;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #999;
}

.modal-color-list-section {
  margin: 15px 0;
}

.color-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.color-list-header h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.add-btn-small {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #c7b2a3;
  background: white;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.add-btn-small:hover {
  background: #f5f5f5;
}

.color-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
  padding: 10px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #c7b2a3;
  border-radius: 20px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.color-item:hover {
  background: #e8f4f8;
  border-color: #6b3f23;
}

.color-item.selected {
  background: #6b3f23;
  color: white;
  border-color: #6b3f23;
  font-weight: 600;
}

.empty-message {
  color: #999;
  font-size: 13px;
  width: 100%;
  text-align: center;
  padding: 8px;
}

/* ===== VARIANTS SECTION ===== */
.variants-section {
  margin-top: 30px;
}

.variants-header {
  background: #6b3f23;
  color: white;
  padding: 15px 20px;
  border-radius: 6px 6px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.variants-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background: #6b3f23;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #5a3318;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-danger:hover {
  background: #c82333;
}

.variant-group {
  background: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  margin-bottom: 20px;
}

.variant-color-header {
  background: #f9f9f9;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20px;
}

.color-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-name {
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.color-count {
  color: #666;
  font-size: 13px;
}

.color-select {
  padding: 6px 10px;
  border: 1px solid #c7b2a3;
  border-radius: 4px;
  font-size: 13px;
  min-width: 150px;
}

.variant-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.variant-table thead {
  background: #f5f5f5;
}

.variant-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #d0d0d0;
}

.variant-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e8e8e8;
}

.input-field {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #c7b2a3;
  border-radius: 4px;
  font-size: 13px;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #6b3f23;
  background-color: #fffbf8;
}

.action-cell {
  text-align: center;
}

.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  transition: transform 0.2s;
}

.btn-delete:hover {
  transform: scale(1.2);
}

.variant-actions {
  display: flex;
  gap: 10px;
  padding: 12px 15px;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
}

.btn-add-size {
  background: #6b3f23;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-add-size:hover {
  background: #5a3318;
}

.btn-remove-color {
  background: white;
  color: #d9534f;
  border: 1px solid #d9534f;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-remove-color:hover {
  background: #f5f5f5;
  border-color: #c82333;
  color: #c82333;
}

.btn-add-color {
  background: white;
  color: #6b3f23;
  border: 2px solid #6b3f23;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  margin-top: 15px;
}

.btn-add-color:hover {
  background: #6b3f23;
  color: white;
}

/* ===== TOAST NOTIFICATION ===== */
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
.required {
  color: #e53935;
  margin-left: 2px;
  font-weight: 600;
}
</style>
