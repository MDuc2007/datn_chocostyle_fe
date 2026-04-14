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
            <label>Màu sắc</label>
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
            <label>Kích cỡ</label>
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
            <label>Loại áo</label>
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
            <label>Kiểu dáng</label>
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
            <label>Phong cách mặc</label>
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
            <input
              type="number"
              v-model.number="soLuongTon"
              :class="{ 'is-invalid': errors.soLuongTon }"
              @input="errors.soLuongTon = ''"
            />
            <span v-if="errors.soLuongTon" class="error-text">{{
              errors.soLuongTon
            }}</span>
          </div>

          <div class="col">
            <label>Giá bán <span class="required">*</span></label>
            <div class="money-input">
              <input
                type="text"
                :value="formatVNDInput(giaBan)"
                @input="handlePriceInput($event, 'giaBan')"
                :class="{ 'is-invalid': errors.giaBan }"
              />
              <span class="currency">đ</span>
            </div>
            <span v-if="errors.giaBan" class="error-text">{{
              errors.giaBan
            }}</span>
          </div>

          <div class="col">
            <label>Giá nhập <span class="required">*</span></label>
            <div class="money-input">
              <input
                type="text"
                :value="formatVNDInput(giaNhap)"
                @input="handlePriceInput($event, 'giaNhap')"
                :class="{ 'is-invalid': errors.giaNhap }"
              />
              <span class="currency">đ</span>
            </div>
            <span v-if="errors.giaNhap" class="error-text">{{
              errors.giaNhap
            }}</span>
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
        <div
          class="image-box"
          :class="{ 'is-invalid': errors.hinhAnh }"
          @click="triggerUpload"
        >
          <img v-if="imageUrl" :src="imageUrl" />
          <div v-else class="plus">+</div>
        </div>
        <p v-if="isUploadingImage" style="font-size: 12px; color: #666">
          Đang tải lên...
        </p>
        <span
          v-if="errors.hinhAnh"
          class="error-text"
          style="display: block; margin-top: 10px"
          >{{ errors.hinhAnh }}</span
        >
      </div>
    </div>
    <div class="save-action">
      <button type="button" class="btn-cancel-main" @click="goBack">Huỷ</button>
      <button class="save-btn" @click="handleOpenConfirm">Lưu sản phẩm</button>
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
            width="36"
            height="36"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 12l3 3 5-5"></path>
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
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const priceInput = ref("");
const priceValue = ref(null);
const errors = ref({});

const goBack = () => {
  if (route.params.sanPhamId) {
    // Trở về trang details của ID sản phẩm cụ thể
    router.push(`/admin/product/${route.params.sanPhamId}/details`);
  } else {
    // Hoặc quay lại trang trước đó nếu không tìm thấy ID
    router.back();
  }
};

const handlePriceInput = (e, field) => {
  const raw = e.target.value.replace(/\D/g, "");
  const value = raw ? parseInt(raw) : null;

  if (field === "giaBan") {
    giaBan.value = value;
    errors.value.giaBan = ""; // Tắt lỗi khi đang nhập

    // Nếu đang bị lỗi check chéo Giá Nhập/Giá Bán thì tắt đỏ cả ô kia
    if (errors.value.giaNhap === "Giá nhập phải nhỏ hơn giá bán") {
      errors.value.giaNhap = "";
    }
  }

  if (field === "giaNhap") {
    giaNhap.value = value;
    errors.value.giaNhap = ""; // Tắt lỗi khi đang nhập

    // Nếu đang bị lỗi check chéo Giá Nhập/Giá Bán thì tắt đỏ cả ô kia
    if (errors.value.giaBan === "Giá bán phải lớn hơn giá nhập") {
      errors.value.giaBan = "";
    }
  }

  e.target.value = formatVNDInput(value);

  // 👉 HÀM MỚI: Chặn mọi ký tự đặc biệt (e, -, +, .) khi gõ vào ô Số lượng
const handleStockInput = (e) => {
  const raw = e.target.value.replace(/\D/g, ""); // Xóa sạch mọi thứ không phải là số (0-9)
  soLuongTon.value = raw ? parseInt(raw, 10) : 0;
  e.target.value = soLuongTon.value;
};
};

const formatVNDInput = (value) => {
  if (!value) return "";

  const number = value.toString().replace(/\D/g, "");
  return new Intl.NumberFormat("vi-VN").format(number);
};

/* ===== ROUTER ===== */
const route = useRoute();
const router = useRouter();
const ctspId = Number(route.params.id);
const modal = ref({
  show: false,
  title: "",
  message: "",
  onConfirm: null,
});
const user = JSON.parse(localStorage.getItem("user") || "{}");
const token = user?.accessToken;
const username = user?.username;

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
  errors.value.hinhAnh = ""; // Xoá lỗi hình ảnh nếu có

  try {
    imageUrl.value = await uploadImageToCloudinaryReturnUrl(file);
    showNotification("Tải ảnh thành công");
  } catch {
    showNotification("Lỗi upload ảnh", "error");
  }

  isUploadingImage.value = false;
};

const validateForm = () => {
  errors.value = {}; // Reset toàn bộ lỗi
  let isValid = true;
  let isMissingData = false; // Biến check xem có bị trống dữ liệu không

  // 1. Validate Số lượng tồn
  if (soLuongTon.value === null || soLuongTon.value === "") {
    errors.value.soLuongTon = "Vui lòng nhập số lượng tồn";
    isValid = false;
    isMissingData = true;
  } else if (!Number.isInteger(Number(soLuongTon.value))) {
    errors.value.soLuongTon = "Số lượng tồn phải là số nguyên";
    isValid = false;
  } else if (soLuongTon.value <= 0) {
    errors.value.soLuongTon = "Số lượng tồn phải lớn hơn 0";
    isValid = false;
  } else if (soLuongTon.value > 100000) {
    errors.value.soLuongTon = "Số lượng tồn tối đa là 100.000";
    isValid = false;
  }

  // 2. Validate Giá bán
  if (giaBan.value === null || giaBan.value === "") {
    errors.value.giaBan = "Vui lòng nhập giá bán";
    isValid = false;
    isMissingData = true;
  } else if (giaBan.value <= 0) {
    errors.value.giaBan = "Giá bán phải lớn hơn 0";
    isValid = false;
  } else if (giaBan.value > 999999999) {
    errors.value.giaBan = "Giá bán tối đa 999.999.999đ";
    isValid = false;
  }

  // 3. Validate Giá nhập
  if (giaNhap.value === null || giaNhap.value === "") {
    errors.value.giaNhap = "Vui lòng nhập giá nhập";
    isValid = false;
    isMissingData = true;
  } else if (giaNhap.value <= 0) {
    errors.value.giaNhap = "Giá nhập phải lớn hơn 0";
    isValid = false;
  } else if (giaNhap.value > 999999999) {
    errors.value.giaNhap = "Giá nhập tối đa 999.999.999đ";
    isValid = false;
  }

  // 4. Validate Giá nhập & Giá bán (Chỉ chạy khi 2 ô trên đã nhập hợp lệ)
  if (!errors.value.giaBan && !errors.value.giaNhap) {
    if (giaNhap.value >= giaBan.value) {
      // Gán text lỗi cho cả 2 ô để giao diện bôi đỏ cả 2
      errors.value.giaNhap = "Giá nhập phải nhỏ hơn giá bán";
      errors.value.giaBan = "Giá bán phải lớn hơn giá nhập";
      isValid = false;
    }
  }

  // 5. Validate Ảnh
  if (!imageUrl.value) {
    errors.value.hinhAnh = "Vui lòng tải ảnh biến thể";
    isValid = false;
    isMissingData = true;
  }

  // HIỂN THỊ TOAST DỰA VÀO LOẠI LỖI
  if (!isValid) {
    if (isMissingData) {
      showNotification("Vui lòng nhập đủ thông tin!", "error");
    } else {
      showNotification(
        "Vui lòng kiểm tra lại các thông tin không hợp lệ!",
        "error",
      );
    }
  }

  return isValid;
};

const handleOpenConfirm = () => {
  if (!validateForm()) return;

  modal.value = {
    show: true,
    title: "Xác nhận cập nhật",
    message: "Bạn có chắc muốn lưu thay đổi không?",
    onConfirm: submitUpdate,
  };
};

const closeConfirmModal = () => {
  modal.value.show = false;
};

const handleModalConfirm = () => {
  if (modal.value.onConfirm) {
    modal.value.onConfirm();
  }
  modal.value.show = false;
};
/* ===== SUBMIT UPDATE ===== */
const submitUpdate = async () => {
  modal.value.show = false;
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
    nguoiCapNhat: username,
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
  gap: 15px; /* Thêm dòng này để cách 2 nút ra */
}
.btn-cancel-main {
  background: #e5e7eb;
  color: #374151;
  padding: 12px 28px; /* Kích thước chuẩn với save-btn bên Edit */
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px; /* Căn bằng với nút Thêm */
}

.btn-cancel-main:hover {
  background: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
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
  background-color: #e8f5e9;
  color: #22c55e;
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
  display: block;
  /* Chuyển thành block để flex căn chuẩn hơn */
  margin: 0;
  /* Xóa margin mặc định nếu có */

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

.money-input {
  position: relative;
  width: 100%;
  display: flex;
}

.money-input input {
  width: 100%;
  padding-right: 35px;
}

.currency {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
  pointer-events: none;
}
/* Styling cho các input bị lỗi */
input.is-invalid {
  border-color: #d9534f !important;
  background-color: #fff9f9 !important;
}

input.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(217, 83, 79, 0.15) !important;
}

/* Styling cho khung Upload ảnh bị lỗi */
.image-box.is-invalid {
  border-color: #d9534f !important;
  background-color: #fff9f9 !important;
}

/* Đoạn text thông báo lỗi */
.error-text {
  color: #d9534f;
  font-size: 13px;
  margin-top: 5px;
  display: block;
}
</style>
