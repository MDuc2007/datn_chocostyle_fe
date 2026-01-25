<template>
  <div class="container">
    <h2 class="title">{{ pageTitle }}</h2>

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
            <label>Tên sản phẩm <span class="required">*</span></label>
            <input
              v-model="tenSanPham"
              type="text"
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          <div class="col">
            <label>Xuất xứ <span class="required">*</span></label>
            <div class="select-box">
              <select v-model="selectedXuatXu">
                <option value="">Chọn xuất xứ</option>
                <option
                  v-for="item in xuatXuList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenXuatXu }}
                </option>
              </select>
              <button
                type="button"
                class="add-btn"
                @click="openModal('xuat-xu')"
              >
                <img src="/src/assets/icon/plus.svg" />
              </button>
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
              <button
                type="button"
                class="add-btn"
                @click="openModal('loai-ao')"
              >
                <img src="/src/assets/icon/plus.svg" />
              </button>
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
              <button
                type="button"
                class="add-btn"
                @click="openModal('kieu-dang')"
              >
                <img src="/src/assets/icon/plus.svg" />
              </button>
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
              <button
                type="button"
                class="add-btn"
                @click="openModal('phong-cach-mac')"
              >
                <img src="/src/assets/icon/plus.svg" />
              </button>
            </div>
          </div>

          <div class="col">
            <label>Chất liệu <span class="required">*</span></label>
            <div class="select-box">
              <select v-model="selectedChatLieu">
                <option value="">Chọn chất liệu</option>
                <option
                  v-for="item in chatLieuList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenChatLieu }}
                </option>
              </select>
              <button
                type="button"
                class="add-btn"
                @click="openModal('chat-lieu')"
              >
                <img src="/src/assets/icon/plus.svg" />
              </button>
            </div>
          </div>
        </div>

        <div class="col full">
          <label>Mô tả sản phẩm <span class="required">*</span></label>
          <textarea
            v-model="moTa"
            placeholder="Nhập thông tin mô tả"
          ></textarea>
        </div>

        <div class="col" style="margin-top: 10px">
          <div style="display: flex; align-items: center; gap: 10px">
            <label>Màu sắc <span class="required">*</span></label>
            <button type="button" class="add-btn" @click="openModal('mau-sac')">
              <img src="/src/assets/icon/plus.svg" />
            </button>
          </div>
          <div class="color-tags">
            <div v-for="m in selectedMauSacList" :key="m.id" class="color-tag">
              <span class="dot" :style="{ backgroundColor: m.rgb }"></span>
              {{ m.tenMauSac }}
            </div>
          </div>
        </div>

        <div class="col" style="margin-top: 10px">
          <div style="display: flex; align-items: center; gap: 10px">
            <label>Kích cỡ <span class="required">*</span></label>
            <button type="button" class="add-btn" @click="openModal('kich-co')">
              <img src="/src/assets/icon/plus.svg" />
            </button>
          </div>
          <div class="color-tags">
            <div v-for="k in selectedKichCoList" :key="k.id" class="color-tag">
              <span>{{ k.tenKichCo }}</span>
            </div>
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

    <button
      style="margin-top: 10px"
      class="save-btn"
      @click="handleCreateVariant"
    >
      Tạo biến thể
    </button>

    <div v-if="showBienThe" class="variants-section">
      <div class="variants-header">
        <h3>Danh sách biến thể</h3>
        <button
          class="save-btn"
          style="background-color: white; color: black"
          @click="openQuickAllModal"
        >
          <span>+</span> Thêm nhanh
        </button>
      </div>

      <div
        v-for="(bt, mIndex) in bienTheList"
        :key="mIndex"
        class="variant-group"
      >
        <div class="variant-color-header">
          <h4>{{ getMauSacName(bt.mauSacId) }}</h4>
        </div>
        <table class="variant-table">
          <thead>
            <tr>
              <th>Kích cỡ</th>
              <th>Giá bán (VND)</th>
              <th>Giá nhập (VND)</th>
              <th>Số lượng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(s, sIndex) in bt.sizeList" :key="sIndex">
              <td>
                <select v-model="s.idKichCo" class="input-field">
                  <option v-for="k in kichCoList" :key="k.id" :value="k.id">
                    {{ k.tenKichCo }}
                  </option>
                </select>
              </td>
              <td>
                <input type="number" v-model="s.giaBan" class="input-field" />
              </td>
              <td>
                <input type="number" v-model="s.giaNhap" class="input-field" />
              </td>
              <td>
                <input
                  type="number"
                  v-model="s.soLuongTon"
                  class="input-field"
                />
              </td>
              <td class="action-cell">
                <button class="btn-delete" @click="removeSize(mIndex, sIndex)">
                  ✕
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="display: flex; gap: 30px">
        <div
          v-for="(bt, mIndex) in bienTheList"
          :key="'image-' + mIndex"
          style="margin-top: 20px"
        >
          <div style="font-weight: 600; margin-bottom: 8px">
            Ảnh theo màu: {{ getMauSacName(bt.mauSacId) }}
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            @change="onVariantImageChange($event, mIndex)"
            style="display: none"
            :ref="(el) => (variantFileInputs[mIndex] = el)"
          />

          <div
            class="image-box"
            style="width: 120px; height: 120px"
            @click="variantFileInputs[mIndex].click()"
          >
            <div v-if="bt.hinhAnhUrls.length === 0" class="plus">+</div>

            <img
              v-for="(img, i) in bt.hinhAnhUrls"
              :key="i"
              :src="img"
              style="
                width: 120px;
                height: 120px;
                object-fit: cover;
                margin: 2px;
              "
            />
          </div>
        </div>
      </div>
      <button
        style="margin-top: 10px"
        class="save-btn"
        @click="openConfirmModal"
      >
        Lưu sản phẩm
      </button>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <h3>{{ modalTitle }}</h3>

      <div v-if="modalType === 'mau-sac'" class="modal-color-list-section">
        <div class="color-list-header">
          <h4>Chọn màu sắc</h4>
          <button type="button" class="add-btn-small" @click="openColorModal">
            <img src="/src/assets/icon/plus.svg" />
          </button>
        </div>
        <div class="color-list">
          <div
            v-for="m in mauSacDaChon"
            :key="m.id"
            class="color-item"
            :class="{ selected: tempMauSacList.some((x) => x.id === m.id) }"
            @click="toggleTempMauSac(m)"
          >
            <span class="dot" :style="{ backgroundColor: m.rgb }"></span>
            <span>{{ m.tenMauSac }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="modalType === 'kich-co'" class="modal-color-list-section">
        <div class="color-list-header">
          <h4>Chọn kích cỡ</h4>
          <button
            type="button"
            class="add-btn-small"
            @click="modalType = 'kich-co-add'"
          >
            <img src="/src/assets/icon/plus.svg" />
          </button>
        </div>
        <div class="color-list">
          <div
            v-for="k in kichCoList"
            :key="k.id"
            class="color-item"
            :class="{ selected: tempKichCoList.some((x) => x.id === k.id) }"
            @click="toggleTempKichCo(k)"
          >
            <span>{{ k.tenKichCo }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="modalType === 'kich-co-add'">
        <input
          v-model="modalInput"
          placeholder="Nhập tên kích cỡ (vd: S, M, L)"
        />
      </div>

      <div v-else>
        <input v-model="modalInput" placeholder="Nhập tên" />
      </div>

      <div class="modal-actions">
        <button @click="closeModal">Huỷ</button>
        <button class="save-btn" @click="saveModal" >Xong</button>
      </div>
    </div>
  </div>

  <div v-if="showColorModal" class="modal-overlay">
    <div class="modal">
      <h3>Thêm màu sắc mới</h3>
      <div class="modal-color-section">
        <div class="color-input-group">
          <input
            type="color"
            v-model="modalColorRgb"
            class="color-picker"
            style="width: 30%"
          />
          <input v-model="modalInput" placeholder="Nhập tên màu" />
        </div>
      </div>
      <div class="modal-actions">
        <button @click="closeColorModal">Huỷ</button>
        <button
          class="save-btn"
          @click="saveColorModal"
          :disabled="!modalInput.trim()"
        >
          Lưu
        </button>
      </div>
    </div>
  </div>
  <div v-if="showConfirmModal" class="modal-overlay">
    <div class="modal">
      <h3>Xác nhận lưu sản phẩm</h3>

      <p style="margin: 15px 0; font-size: 14px; color: #444">
        Bạn có chắc chắn muốn lưu sản phẩm không?
      </p>

      <div class="modal-actions">
        <button @click="showConfirmModal = false">Huỷ</button>
        <button class="save-btn" @click="confirmSubmit">Xác nhận</button>
      </div>
    </div>
  </div>
  <div v-if="showQuickAllModal" class="modal-overlay">
    <div class="modal">
      <h3>Thêm nhanh cho tất cả biến thể</h3>

      <input
        type="number"
        v-model.number="quickAllGiaBan"
        placeholder="Giá bán (áp dụng tất cả)"
      />

      <input
        type="number"
        v-model.number="quickAllGiaNhap"
        placeholder="Giá nhập (áp dụng tất cả)"
      />

      <input
        type="number"
        v-model.number="quickAllSoLuong"
        placeholder="Số lượng (áp dụng tất cả)"
      />

      <div class="modal-actions">
        <button @click="showQuickAllModal = false">Huỷ</button>
        <button class="save-btn" @click="applyQuickAll">Áp dụng</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const showQuickAllModal = ref(false);

const quickAllGiaBan = ref(null);
const quickAllGiaNhap = ref(null);
const quickAllSoLuong = ref(null);

const showConfirmModal = ref(false);

const openQuickAllModal = () => {
  quickAllGiaBan.value = null;
  quickAllGiaNhap.value = null;
  quickAllSoLuong.value = null;
  showQuickAllModal.value = true;
};

const pageTitle = computed(() => {
  return productId ? "SỬA SẢN PHẨM" : "THÊM SẢN PHẨM";
});

const applyQuickAll = () => {
  if (
    quickAllGiaBan.value === null &&
    quickAllGiaNhap.value === null &&
    quickAllSoLuong.value === null
  ) {
    showNotification("Vui lòng nhập ít nhất 1 trường", "warning");
    return;
  }

  bienTheList.value.forEach((color) => {
    color.sizeList.forEach((size) => {
      if (quickAllGiaBan.value !== null) size.giaBan = quickAllGiaBan.value;

      if (quickAllGiaNhap.value !== null) size.giaNhap = quickAllGiaNhap.value;

      if (quickAllSoLuong.value !== null)
        size.soLuongTon = quickAllSoLuong.value;
    });
  });

  showQuickAllModal.value = false;
  showNotification("Đã áp dụng cho tất cả biến thể");
};

const openConfirmModal = () => {
  showConfirmModal.value = true;
};

const confirmSubmit = async () => {
  showConfirmModal.value = false;
  await submit();
};

const productId = route.params.id;
// Lấy ID từ URL: /admin/product/update/:id

// Hàm lấy chi tiết sản phẩm và fill vào form
const fetchProductDetail = async () => {
  if (!productId) return;

  try {
    const res = await fetch(`${API_BASE}/san-pham/${productId}`);
    const data = await res.json();

    // 1. Fill thông tin cơ bản bằng cách tìm ID theo Tên
    tenSanPham.value = data.tenSp;
    moTa.value = data.moTa;
    hinhAnhCloud.value = data.hinhAnh;
    imageUrl.value = data.hinhAnh;

    selectedChatLieu.value =
      chatLieuList.value.find((x) => x.tenChatLieu === data.tenChatLieu)?.id ||
      "";
    selectedXuatXu.value =
      xuatXuList.value.find((x) => x.tenXuatXu === data.tenXuatXu)?.id || "";
    selectedLoaiAo.value =
      loaiAoList.value.find((x) => x.tenLoai === data.tenLoaiAo)?.id || "";
    selectedKieuDang.value =
      kieuDangList.value.find((x) => x.tenKieuDang === data.tenKieuDang)?.id ||
      "";
    selectedPhongCach.value =
      phongCachList.value.find((x) => x.tenPhongCach === data.tenPhongCachMac)
        ?.id || "";

    // 2. Xử lý Tags Màu sắc và Kích cỡ từ bienTheList
    const uniqueColors = [];
    const uniqueSizes = [];

    // Map dữ liệu để hiển thị bảng (Group theo màu sắc để đúng logic template của bạn)
    const groupedByColor = {};

    data.bienTheList.forEach((variant) => {
      // Lấy thông tin màu sắc (API trả về mảng mauSacList)
      const colorData = variant.mauSacList[0];
      // Tìm ID màu sắc từ danh sách master đã fetch
      const colorObj = mauSacDaChon.value.find(
        (c) => c.tenMauSac === colorData.tenMauSac,
      );

      // Lấy thông tin kích cỡ (API trả về mảng kichCoList chứa string)
      const sizeName = variant.kichCoList[0];
      const sizeObj = kichCoList.value.find((s) => s.tenKichCo === sizeName);

      if (colorObj) {
        // Thu thập màu sắc duy nhất cho Tag
        if (!uniqueColors.find((c) => c.id === colorObj.id))
          uniqueColors.push(colorObj);

        // Nhóm biến thể theo màu sắc để hiển thị bảng
        if (!groupedByColor[colorObj.id]) {
          groupedByColor[colorObj.id] = {
            mauSacId: colorObj.id,
            hinhAnhUrls: variant.hinhAnhUrls || [],
            sizeList: [],
          };
        }

        if (sizeObj) {
          // Thu thập kích cỡ duy nhất cho Tag
          if (!uniqueSizes.find((s) => s.id === sizeObj.id))
            uniqueSizes.push(sizeObj);

          // Thêm size vào nhóm màu tương ứng
          groupedByColor[colorObj.id].sizeList.push({
            idKichCo: sizeObj.id,
            soLuongTon: variant.soLuongTon,
            giaNhap: variant.giaNhap,
            giaBan: variant.giaBan,
          });
        }
      }
    });

    // Gán dữ liệu vào các biến hiển thị
    selectedMauSacList.value = uniqueColors;
    selectedKichCoList.value = uniqueSizes;
    bienTheList.value = Object.values(groupedByColor);
    showBienThe.value = true;
  } catch (error) {
    console.error("Lỗi fill data:", error);
    showNotification("Không thể tải thông tin sản phẩm", "error");
  }
};

const API_BASE = "http://localhost:8080/api";

/* --- THÔNG BÁO (TOAST) --- */
const notifications = ref([]);
const showNotification = (message, type = "success") => {
  const id = Date.now();
  notifications.value.push({ message, type, id });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 4000);
};

/* --- STATE --- */
const tenSanPham = ref("");
const moTa = ref("");
const imageUrl = ref(null);
const hinhAnhCloud = ref("");
const isUploadingImage = ref(false);
const showBienThe = ref(false);
const bienTheList = ref([]);
const variantFileInputs = ref([]);
const fileInput = ref(null);

/* --- DATA LISTS --- */
const xuatXuList = ref([]);
const loaiAoList = ref([]);
const kieuDangList = ref([]);
const phongCachList = ref([]);
const chatLieuList = ref([]);
const mauSacDaChon = ref([]);
const kichCoList = ref([]);

/* --- SELECTIONS --- */
const selectedXuatXu = ref("");
const selectedLoaiAo = ref("");
const selectedKieuDang = ref("");
const selectedPhongCach = ref("");
const selectedChatLieu = ref("");
const selectedMauSacList = ref([]);
const selectedKichCoList = ref([]);
const tempMauSacList = ref([]);
const tempKichCoList = ref([]);

/* --- MODAL LOGIC --- */
const showModal = ref(false);
const modalType = ref("");
const modalInput = ref("");
const modalColorRgb = ref("#000000");
const showColorModal = ref(false);

const modalTitle = computed(() => {
  const map = {
    "xuat-xu": "Thêm xuất xứ",
    "loai-ao": "Thêm loại áo",
    "kieu-dang": "Thêm kiểu dáng",
    "phong-cach-mac": "Thêm phong cách",
    "chat-lieu": "Thêm chất liệu",
    "mau-sac": "Thêm màu sắc",
    "kich-co": "Thêm kích cỡ",
    "kich-co-add": "Tạo kích cỡ mới",
  };
  return map[modalType.value] || "Thêm mới";
});

const openModal = (type) => {
  modalType.value = type;
  modalInput.value = "";
  if (type === "mau-sac") {
    fetchMauSac();
    tempMauSacList.value = [...selectedMauSacList.value];
  } else if (type === "kich-co") {
    fetchKichCo();
    tempKichCoList.value = [...selectedKichCoList.value];
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  modalInput.value = "";
};

const saveModal = async () => {
  if (modalType.value === "mau-sac") {
    selectedMauSacList.value = [...tempMauSacList.value];
    closeModal();
  } else if (modalType.value === "kich-co") {
    selectedKichCoList.value = [...tempKichCoList.value];
    closeModal();
  } else if (modalType.value === "kich-co-add") {
    if (!modalInput.value.trim()) return;
    try {
      await fetch(`${API_BASE}/kich-co`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenKichCo: modalInput.value,
          nguoiTao: "admin",
        }),
      });
      showNotification("Thêm kích cỡ thành công");
      await fetchKichCo();
      modalType.value = "kich-co";
    } catch (e) {
      showNotification("Lỗi khi thêm kích cỡ", "error");
    }
  } else {
    if (!modalInput.value.trim()) return;
    const fieldMap = {
      "xuat-xu": "tenXuatXu",
      "loai-ao": "tenLoai",
      "kieu-dang": "tenKieuDang",
      "phong-cach-mac": "tenPhongCach",
      "chat-lieu": "tenChatLieu",
    };
    try {
      await fetch(`${API_BASE}/${modalType.value}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [fieldMap[modalType.value]]: modalInput.value,
          nguoiTao: "admin",
        }),
      });

      showNotification("Thêm thành công");
      fetchDropdownData();
      closeModal();
    } catch (e) {
      showNotification("Lỗi khi lưu dữ liệu", "error");
    }
  }
};

/* --- COLOR MODAL --- */
const openColorModal = () => {
  showColorModal.value = true;
  modalInput.value = "";
};
const closeColorModal = () => (showColorModal.value = false);
const saveColorModal = async () => {
  if (!modalInput.value.trim()) {
    showNotification("Vui lòng nhập tên màu", "warning");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/mau-sac`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenMauSac: modalInput.value,
        rgb: modalColorRgb.value,
        nguoiTao: "admin",
      }),
    });
    const saved = await res.json();
    mauSacDaChon.value.push(saved);
    showNotification("Thêm màu sắc thành công");
    closeColorModal();
  } catch (e) {
    showNotification("Lỗi khi thêm màu", "error");
  }
};

/* --- UPLOAD LOGIC --- */
const uploadImageToCloudinaryReturnUrl = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chocostyle_unsigned");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dvsqk1vel/image/upload",
      { method: "POST", body: formData },
    );
    const data = await res.json();
    return data.secure_url || null;
  } catch (err) {
    return null;
  }
};

const triggerUpload = () => fileInput.value.click();
const onFileChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    imageUrl.value = URL.createObjectURL(file);
    isUploadingImage.value = true;
    const url = await uploadImageToCloudinaryReturnUrl(file);
    if (url) {
      hinhAnhCloud.value = url;
      showNotification("Tải ảnh sản phẩm thành công");
    } else {
      showNotification("Lỗi tải ảnh lên Cloudinary", "error");
    }
    isUploadingImage.value = false;
  }
};

const onVariantImageChange = async (e, mIndex) => {
  const files = Array.from(e.target.files);
  for (const file of files) {
    const url = await uploadImageToCloudinaryReturnUrl(file);
    if (url) bienTheList.value[mIndex].hinhAnhUrls.push(url);
  }
  showNotification(`Đã tải lên ${files.length} ảnh cho biến thể`);
};

/* --- BIẾN THỂ LOGIC --- */
const handleCreateVariant = () => {
  if (!selectedMauSacList.value.length || !selectedKichCoList.value.length) {
    showNotification("Vui lòng chọn màu và kích cỡ trước khi tạo", "warning");
    return;
  }
  showBienThe.value = true;
  bienTheList.value = selectedMauSacList.value.map((m) => ({
    mauSacId: m.id,
    hinhAnhUrls: [],
    sizeList: selectedKichCoList.value.map((k) => ({
      idKichCo: k.id,
      soLuongTon: 0,
      giaNhap: 0,
      giaBan: 0,
    })),
  }));
  showNotification("Đã khởi tạo danh sách biến thể");
};

const removeSize = (mIndex, sIndex) => {
  bienTheList.value[mIndex].sizeList.splice(sIndex, 1);
  if (bienTheList.value[mIndex].sizeList.length === 0) {
    bienTheList.value.splice(mIndex, 1);
  }
};

/* --- UTILS --- */
const getMauSacName = (id) =>
  mauSacDaChon.value.find((m) => m.id === id)?.tenMauSac || "Màu";
const toggleTempMauSac = (m) => {
  const idx = tempMauSacList.value.findIndex((x) => x.id === m.id);
  idx > -1 ? tempMauSacList.value.splice(idx, 1) : tempMauSacList.value.push(m);
};
const toggleTempKichCo = (k) => {
  const idx = tempKichCoList.value.findIndex((x) => x.id === k.id);
  idx > -1 ? tempKichCoList.value.splice(idx, 1) : tempKichCoList.value.push(k);
};

/* --- FETCH DATA --- */
const fetchDropdownData = async () => {
  const apis = [
    "xuat-xu",
    "loai-ao",
    "kieu-dang",
    "phong-cach-mac",
    "chat-lieu",
  ];
  const res = await Promise.all(
    apis.map((a) => fetch(`${API_BASE}/${a}`).then((r) => r.json())),
  );
  [xuatXuList, loaiAoList, kieuDangList, phongCachList, chatLieuList].forEach(
    (refList, i) => (refList.value = res[i].data || res[i]),
  );
};

const fetchMauSac = async () => {
  const res = await fetch(`${API_BASE}/mau-sac`).then((r) => r.json());
  mauSacDaChon.value = res.data || res;
};

const fetchKichCo = async () => {
  const res = await fetch(`${API_BASE}/kich-co`).then((r) => r.json());
  kichCoList.value = res.data || res;
};

/* --- SUBMIT --- */
const submit = async () => {
  if (
    !tenSanPham.value.trim() ||
    !hinhAnhCloud.value ||
    !bienTheList.value.length
  ) {
    showNotification("Vui lòng điền đủ thông tin cơ bản và ảnh", "error");
    return;
  }

  const payload = {
    id: productId || null,
    tenSp: tenSanPham.value,
    moTa: moTa.value,
    idChatLieu: selectedChatLieu.value,
    idXuatXu: selectedXuatXu.value,
    idLoaiAo: selectedLoaiAo.value,
    idKieuDang: selectedKieuDang.value,
    idPhongCachMac: selectedPhongCach.value,
    bienTheList: bienTheList.value,
    hinhAnh: hinhAnhCloud.value,
    ...(productId
      ? { nguoiCapNhat: "admin" } // UPDATE
      : { nguoiTao: "admin" }),
  };

  const method = productId ? "PUT" : "POST";
  const url = productId
    ? `${API_BASE}/san-pham/${productId}`
    : `${API_BASE}/san-pham`;

  try {
    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showNotification(
        productId ? "Cập nhật thành công!" : "Thêm mới thành công!",
      );
      setTimeout(() => {
        router.push("/admin/product");
      }, 1200);
    } else {
      const result = await res.json();
      showNotification(result.message || "Có lỗi xảy ra", "error");
    }
  } catch (e) {
    showNotification("Lỗi kết nối", "error");
  }
};

onMounted(async () => {
  // Load toàn bộ danh mục trước
  await Promise.all([fetchDropdownData(), fetchMauSac(), fetchKichCo()]);

  // Sau đó mới fill dữ liệu sản phẩm
  if (productId) {
    await fetchProductDetail();
  }
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
  width: 100%;
  aspect-ratio: 1;
  background: #e8e0d8;
  border: 2px dashed #c7b2a3;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.image-box img {
  width: 100%;
  height: 100%;
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
