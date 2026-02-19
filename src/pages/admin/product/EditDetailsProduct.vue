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
        <div class="col">
          <input type="hidden" :value="maCTSP" readonly />
        </div>
        <div class="row">
          <div class="col">
            <label>Màu sắc <span class="required">*</span></label>
            <div class="select-box">
              <select v-model="selectedMauSacList" disabled>
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
              <select v-model="selectedKichCoList" disabled>
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
              <select v-model="selectedLoaiAo" disabled>
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
              <select v-model="selectedKieuDang" disabled>
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
              <select v-model="selectedPhongCach" disabled>
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
        <div class="qr-form-section" v-if="qrImageUrl">
          <label>QR sản phẩm</label>

          <div class="qr-inline-box">
            <img :src="qrImageUrl" />
          </div>

          <div class="qr-actions">
            <button type="button" class="btn-download-qr" @click="downloadQR">
              <img
                src="/src/assets/icon/dowload-white.svg"
                style="width: 20px; height: 20px"
                alt=""
              />
              Tải mã QR
            </button>
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
    <div class="save-action">
      <button class="save-btn" @click="handleOpenConfirm">Lưu sản phẩm</button>
    </div>
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
import axios from "axios";

/* ===== ROUTER ===== */
const route = useRoute();
const router = useRouter();
const ctspId = Number(route.params.id);
const showConfirmModal = ref(false);

/* ===== AUTH ===== */
const token = localStorage.getItem("token");
const authHeader = {
  Authorization: `Bearer ${token}`,
};

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
const loaiAoList = ref([]);
const kieuDangList = ref([]);
const phongCachList = ref([]);

const dataCTSP = ref(null);

const selectedLoaiAo = ref("");
const selectedKieuDang = ref("");
const selectedPhongCach = ref("");
const qrImageUrl = ref(null);

const downloadQR = async () => {
  if (!qrImageUrl.value) return;

  try {
    const response = await fetch(qrImageUrl.value);
    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${maCTSP.value}.png`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Lỗi tải QR:", error);
  }
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
  try {
    const res = await axios.get(`${API_BASE}/mau-sac`, {
      headers: authHeader,
    });
    mauSacList.value = res.data;
  } catch {
    showNotification("Không thể tải màu sắc", "error");
  }
};

const fetchKichCo = async () => {
  try {
    const res = await axios.get(`${API_BASE}/kich-co`, {
      headers: authHeader,
    });
    kichCoList.value = res.data;
  } catch {
    showNotification("Không thể tải kích cỡ", "error");
  }
};

const fetchLoaiAo = async () => {
  try {
    const res = await axios.get(`${API_BASE}/loai-ao`, {
      headers: authHeader,
    });
    loaiAoList.value = res.data;
  } catch {
    showNotification("Không thể tải loại áo", "error");
  }
};

const fetchKieuDang = async () => {
  try {
    const res = await axios.get(`${API_BASE}/kieu-dang`, {
      headers: authHeader,
    });
    kieuDangList.value = res.data;
  } catch {
    showNotification("Không thể tải kiểu dáng", "error");
  }
};

const fetchPhongCach = async () => {
  try {
    const res = await axios.get(`${API_BASE}/phong-cach-mac`, {
      headers: authHeader,
    });
    phongCachList.value = res.data;
  } catch {
    showNotification("Không thể tải phong cách mặc", "error");
  }
};

/* ===== FETCH CHI TIẾT SẢN PHẨM ===== */
const fetchCTSP = async () => {
  try {
    const res = await axios.get(`${API_BASE}/chi-tiet-san-pham/${ctspId}`, {
      headers: authHeader,
    });

    const data = res.data;
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
    qrImageUrl.value = data.qrImage || null;
  } catch {
    showNotification("Không thể tải chi tiết sản phẩm", "error");
  }
};

/* ===== UPLOAD IMAGE ===== */
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

/* ===== VALIDATE ===== */
const validateForm = () => {
  if (!selectedMauSacList.value)
    return (showNotification("Vui lòng chọn màu sắc", "warning"), false);
  if (!selectedKichCoList.value)
    return (showNotification("Vui lòng chọn kích cỡ", "warning"), false);
  if (!selectedLoaiAo.value)
    return (showNotification("Vui lòng chọn loại áo", "warning"), false);
  if (!selectedKieuDang.value)
    return (showNotification("Vui lòng chọn kiểu dáng", "warning"), false);
  if (!selectedPhongCach.value)
    return (showNotification("Vui lòng chọn phong cách mặc", "warning"), false);
  if (soLuongTon.value < 0)
    return (showNotification("Số lượng tồn phải ≥ 0", "warning"), false);
  if (giaNhap.value <= 0)
    return (showNotification("Giá nhập phải > 0", "warning"), false);
  if (giaBan.value <= 0)
    return (showNotification("Giá bán phải > 0", "warning"), false);
  if (giaBan.value < giaNhap.value)
    return (showNotification("Giá bán < giá nhập", "warning"), false);
  if (!imageUrl.value)
    return (showNotification("Vui lòng chọn ảnh", "warning"), false);

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
    await axios.put(`${API_BASE}/chi-tiet-san-pham/${ctspId}`, payload, {
      headers: authHeader,
    });

    showNotification("Cập nhật chi tiết sản phẩm thành công");
    setTimeout(() => router.back(), 1200);
  } catch (error) {
    showNotification(
      error?.response?.data?.message || "Cập nhật thất bại",
      "error",
    );
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
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap");

/* ================= CONTAINER ================= */
.container {
  padding: 35px;
  font-family: "Poppins", sans-serif;
  background: #ffffff;
  border-radius: 14px;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  font-weight: 600;
  font-size: 22px;
  color: #2d2d2d;
  letter-spacing: 0.5px;
}

/* ================= LAYOUT ================= */
.form-wrapper {
  display: flex;
  gap: 60px;
  margin-top: 10px;
}

.left {
  flex: 3;
}

.right {
  flex: 1;
  text-align: center;
  margin-top: 90px;
}

.row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
  margin-bottom: 22px;
}

.col {
  display: flex;
  flex-direction: column;
}

/* ================= LABEL ================= */
label {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 6px;
  color: #333;
}

.required {
  color: #e53935;
  font-weight: 600;
}

/* ================= INPUT + SELECT ================= */
input,
textarea {
  padding: 11px 14px;
  border: 1px solid #e2e2e2;
  border-radius: 10px;
  font-size: 14px;
  font-family: "Poppins", sans-serif;
  background: white;
  transition: all 0.25s ease;
}

select {
  padding: 11px 14px;
  border: 1px solid #e2e2e2;
  border-radius: 10px;
  font-size: 14px;
  font-family: "Poppins", sans-serif;
  background: #fafafa;
  transition: all 0.25s ease;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #6b3f23;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(107, 63, 35, 0.12);
}

/* Remove number arrows */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}

/* ================= SELECT CUSTOM ================= */
.select-box {
  position: relative;
}

.select-box select {
  appearance: none;
  width: 100%;
  cursor: pointer;
}

/* ================= IMAGE BOX ================= */
.image-box {
  width: 280px;
  height: 280px;
  background: #f5f2ef;
  border: 2px dashed #d6c4b8;
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 0.3s;
}

.image-box:hover {
  background: #f0ebe7;
  border-color: #c89b6d;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.plus {
  font-size: 40px;
  color: #999;
  font-weight: 300;
}

/* ================= BUTTON ================= */
.save-action {
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: white;
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* ================= MODAL ================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: white;
  padding: 30px;
  width: 100%;
  max-width: 420px;
  border-radius: 14px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 25px;
}

.modal-actions button {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.3s;
}

.modal-actions button:first-child {
  background: #f3f3f3;
  border: 1px solid #ddd;
}

.modal-actions button:first-child:hover {
  background: #e8e8e8;
}

/* ================= TOAST ================= */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(300px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.toast.error {
  background: #ffebee;
  color: #c62828;
}

.toast.warning {
  background: #fff8e1;
  color: #f57f17;
}

/* ================= QR ================= */
.qr-form-section {
  margin-top: 20px;
}

.qr-inline-box {
  width: 160px;
  height: 160px;
  border: 2px dashed #d6c4b8;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fafafa;
  margin: 12px 0;
}

.qr-inline-box img {
  width: 160px;
  height: 160px;
  object-fit: contain;
}

.qr-actions {
  margin-left: 15px;
}

.btn-download-qr {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.btn-download-qr:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}
</style>
