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
              :class="{ 'is-invalid': errors.tenSanPham }"
              @input="errors.tenSanPham = ''"
            />
            <span v-if="errors.tenSanPham" class="error-text">{{
              errors.tenSanPham
            }}</span>
          </div>

          <div class="col" :class="{ 'has-error': errors.xuatXu }">
            <label>Xuất xứ <span class="required">*</span></label>
            <div class="select-box">
              <select
                class="select2-xuatxu"
                :ref="(el) => el && (el.__vModel = selectedXuatXu)"
              >
                <option value="">Chọn xuất xứ</option>
                <option
                  v-for="item in xuatXuList.filter((x) => x.trangThai === 1)"
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
            <span v-if="errors.xuatXu" class="error-text">{{
              errors.xuatXu
            }}</span>
          </div>

          <div class="col" :class="{ 'has-error': errors.loaiAo }">
            <label>Loại áo <span class="required">*</span></label>
            <div class="select-box">
              <select
                class="select2-loaiao"
                :ref="(el) => el && (el.__vModel = selectedLoaiAo)"
              >
                <option value="">Chọn loại áo</option>
                <option
                  v-for="item in loaiAoList.filter((x) => x.trangThai === 1)"
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
            <span v-if="errors.loaiAo" class="error-text">{{
              errors.loaiAo
            }}</span>
          </div>

          <div class="col" :class="{ 'has-error': errors.kieuDang }">
            <label>Kiểu dáng <span class="required">*</span></label>
            <div class="select-box">
              <select
                class="select2-kieudang"
                :ref="(el) => el && (el.__vModel = selectedKieuDang)"
              >
                <option value="">Chọn kiểu dáng</option>
                <option
                  v-for="item in kieuDangList.filter((x) => x.trangThai === 1)"
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
            <span v-if="errors.kieuDang" class="error-text">{{
              errors.kieuDang
            }}</span>
          </div>

          <div class="col" :class="{ 'has-error': errors.phongCach }">
            <label>Phong cách mặc <span class="required">*</span></label>
            <div class="select-box">
              <select
                class="select2-phongcach"
                :ref="(el) => el && (el.__vModel = selectedPhongCach)"
              >
                <option value="">Chọn phong cách</option>
                <option
                  v-for="item in phongCachList.filter((x) => x.trangThai === 1)"
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
            <span v-if="errors.phongCach" class="error-text">{{
              errors.phongCach
            }}</span>
          </div>

          <div class="col" :class="{ 'has-error': errors.chatLieu }">
            <label>Chất liệu <span class="required">*</span></label>
            <div class="select-box">
              <select
                class="select2-chatlieu"
                :ref="(el) => el && (el.__vModel = selectedChatLieu)"
              >
                <option value="">Chọn chất liệu</option>
                <option
                  v-for="item in chatLieuList.filter((x) => x.trangThai === 1)"
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
            <span v-if="errors.chatLieu" class="error-text">{{
              errors.chatLieu
            }}</span>
          </div>
        </div>

        <div class="col full">
          <label>Mô tả sản phẩm</label>
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

    <button
      style="margin-top: 10px"
      v-if="!isEditMode"
      class="save-btn"
      @click="handleCreateVariant"
    >
      Tạo biến thể
    </button>

    <div v-if="showBienThe" class="variants-section">
      <div class="variants-header">
        <h3>Danh sách biến thể</h3>
        <button class="save-fast-btn" @click="openQuickAllModal">
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
                <input
                  type="text"
                  class="input-field"
                  :value="getKichCoName(s.idKichCo)"
                  disabled
                />
              </td>

              <td>
                <div class="money-input">
                  <input
                    type="text"
                    :value="formatMoney(s.giaBan)"
                    @input="handleMoneyInput($event, s, 'giaBan')"
                    class="input-field"
                  />
                  <span>đ</span>
                </div>
              </td>
              <td>
                <div class="money-input">
                  <input
                    type="text"
                    :value="formatMoney(s.giaNhap)"
                    @input="handleMoneyInput($event, s, 'giaNhap')"
                    class="input-field"
                  />
                  <span>đ</span>
                </div>
              </td>
              <td>
                <input
                  type="number"
                  v-model.number="s.soLuongTon"
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
              v-if="bt.hinhAnhUrls.length"
              :src="bt.hinhAnhUrls[0]"
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
      <div class="save-action">
        <button type="button" class="btn-cancel-main" @click="goBack">
          Huỷ
        </button>
        <button class="save-btn" @click="handleOpenConfirm">
          Lưu sản phẩm
        </button>
      </div>
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
            v-for="m in mauSacDaChon.filter((x) => x.trangThai === 1)"
            :key="m.id"
            class="color-item"
            :class="{
              selected: tempMauSacList.some((x) => x.id === m.id),
              locked: isEditMode && originalMauSacIds.includes(m.id),
            }"
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
            v-for="k in kichCoList.filter((x) => x.trangThai === 1)"
            :key="k.id"
            class="color-item"
            :class="{
              selected: tempKichCoList.some((x) => x.id === k.id),
              locked: isEditMode && originalKichCoIds.includes(k.id),
            }"
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
        <button class="save-btn" @click="saveModal">Xong</button>
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

  <transition name="fade-modal">
    <div
      v-if="modal.show"
      class="modal-confirm"
      @click.self="closeModalConfirm"
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
          <button class="btn-cancel hover-effect" @click="closeModalConfirm">
            Hủy
          </button>
          <button class="btn-confirm hover-effect" @click="handleModalConfirm">
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  </transition>

  <div v-if="showQuickAllModal" class="modal-overlay">
    <div class="modal">
      <h3>Thêm nhanh cho tất cả biến thể</h3>

      <div class="money-input">
        <input
          type="text"
          :value="formatMoney(quickAllGiaBan)"
          @input="handleQuickMoneyInput($event, 'giaBan')"
          class="input-field"
          placeholder="Giá bán"
        />
        <span>đ</span>
      </div>

      <div class="money-input">
        <input
          type="text"
          :value="formatMoney(quickAllGiaNhap)"
          @input="handleQuickMoneyInput($event, 'giaNhap')"
          class="input-field"
          placeholder="Giá nhập"
        />
        <span>đ</span>
      </div>

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
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const regexNoSpecialChar = /^[\p{L}\p{N}\s\-._()]+$/u;
const originalMauSacIds = ref([]);
const originalKichCoIds = ref([]);

const user = JSON.parse(localStorage.getItem("user") || "{}");
const token = user?.accessToken;
const username = user?.username;

const route = useRoute();
const router = useRouter();
const showQuickAllModal = ref(false);

const quickAllGiaBan = ref(null);
const quickAllGiaNhap = ref(null);
const quickAllSoLuong = ref(null);
const errors = ref({});

const showConfirmModal = ref(false);
const modal = ref({
  show: false,
  title: "",
  message: "",
  action: null,
});

const goBack = () => {
  router.push("/admin/product");
};

const formatMoney = (value) => {
  if (!value && value !== 0) return "";
  const number = value.toString().replace(/\D/g, "");
  return new Intl.NumberFormat("vi-VN").format(number);
};

const handleMoneyInput = (event, obj, field) => {
  const raw = event.target.value.replace(/\D/g, "");
  const number = raw ? parseInt(raw) : 0;

  obj[field] = number;
  event.target.value = formatMoney(number);
};

const handleQuickMoneyInput = (event, field) => {
  const raw = event.target.value.replace(/\D/g, "");
  // Nếu xoá trắng thì gán về null để không bị áp dụng số 0 vào tất cả
  const number = raw ? parseInt(raw) : null;

  if (field === "giaBan") {
    quickAllGiaBan.value = number;
  } else if (field === "giaNhap") {
    quickAllGiaNhap.value = number;
  }

  event.target.value = formatMoney(number);
};

const getKichCoName = (id) =>
  kichCoList.value.find((k) => k.id === id)?.tenKichCo || "Size";

const isEditMode = computed(() => !!productId);

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

  if (quickAllGiaBan.value !== null && quickAllGiaBan.value <= 0)
    return showNotification("Giá bán phải lớn 0", "warning");

  if (quickAllGiaNhap.value !== null && quickAllGiaNhap.value < 0)
    return showNotification("Giá nhập không được âm", "warning");

  if (quickAllSoLuong.value !== null && quickAllSoLuong.value < 0)
    return showNotification("Số lượng không được âm", "warning");

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

const handleOpenConfirm = () => {
  if (!validateBeforeSubmit()) return;

  modal.value = {
    show: true,
    title: "Xác nhận lưu sản phẩm",
    message: "Bạn có chắc chắn muốn lưu sản phẩm không?",
    action: "SAVE",
  };
};

const closeModalConfirm = () => {
  modal.value.show = false;
};

const handleModalConfirm = async () => {
  if (modal.value.action === "SAVE") {
    modal.value.show = false;
    await submit();
  }
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
    const res = await axios.get(`${API_BASE}/san-pham/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = res.data;

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
    const groupedByColor = {};

    data.bienTheList.forEach((variant) => {
      const colorData = variant.mauSacList[0];
      const colorObj = mauSacDaChon.value.find(
        (c) => c.tenMauSac === colorData.tenMauSac,
      );
      const sizeName = variant.kichCoList[0];
      const sizeObj = kichCoList.value.find((s) => s.tenKichCo === sizeName);

      if (colorObj) {
        if (!uniqueColors.find((c) => c.id === colorObj.id))
          uniqueColors.push(colorObj);

        if (!groupedByColor[colorObj.id]) {
          groupedByColor[colorObj.id] = {
            mauSacId: colorObj.id,
            hinhAnhUrls: variant.hinhAnhUrls || [],
            sizeList: [],
          };
        }

        if (sizeObj) {
          if (!uniqueSizes.find((s) => s.id === sizeObj.id))
            uniqueSizes.push(sizeObj);
          groupedByColor[colorObj.id].sizeList.push({
            idKichCo: sizeObj.id,
            soLuongTon: variant.soLuongTon,
            giaNhap: variant.giaNhap,
            giaBan: variant.giaBan,
          });
        }
      }
    });

    selectedMauSacList.value = uniqueColors;
    selectedKichCoList.value = uniqueSizes;
    bienTheList.value = Object.values(groupedByColor);
    showBienThe.value = true;

    // --- THÊM MỚI: LƯU LẠI ID GỐC ĐỂ KHÓA ---
    originalMauSacIds.value = uniqueColors.map((c) => c.id);
    originalKichCoIds.value = uniqueSizes.map((s) => s.id);
  } catch (error) {
    console.error("Error fetching product details:", error);
    showNotification("Failed to fetch product details", "error");
  }
};
const syncVariantsTable = () => {
  // Chỉ đồng bộ khi bảng biến thể đã hiện (Ở màn Sửa hoặc đã bấm Tạo biến thể)
  if (!showBienThe.value) return;

  // 1. QUÉT VÀ XOÁ: Loại bỏ các Màu sắc đã bị bỏ chọn (huỷ) khỏi bảng
  bienTheList.value = bienTheList.value.filter((bt) =>
    selectedMauSacList.value.some((m) => m.id === bt.mauSacId),
  );

  // 2. QUÉT VÀ XOÁ: Loại bỏ các Kích cỡ đã bị bỏ chọn (huỷ) khỏi bảng
  bienTheList.value.forEach((bt) => {
    bt.sizeList = bt.sizeList.filter((s) =>
      selectedKichCoList.value.some((k) => k.id === s.idKichCo),
    );
  });

  // 3. THÊM MỚI: Bổ sung các Màu & Size vừa được chọn thêm vào
  selectedMauSacList.value.forEach((m) => {
    let colorGroup = bienTheList.value.find((bt) => bt.mauSacId === m.id);
    if (!colorGroup) {
      colorGroup = {
        mauSacId: m.id,
        hinhAnhUrls: [],
        sizeList: [],
      };
      bienTheList.value.push(colorGroup);
    }

    selectedKichCoList.value.forEach((k) => {
      const sizeExists = colorGroup.sizeList.some((s) => s.idKichCo === k.id);
      if (!sizeExists) {
        colorGroup.sizeList.push({
          idKichCo: k.id,
          soLuongTon: 0,
          giaNhap: 0,
          giaBan: 0,
        });
      }
    });
  });
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
    syncVariantsTable(); // Gọi merge
    closeModal();
  } else if (modalType.value === "kich-co") {
    selectedKichCoList.value = [...tempKichCoList.value];
    syncVariantsTable(); // Gọi merge
    closeModal();
  } else if (modalType.value === "kich-co-add") {
    if (!modalInput.value.trim()) return;

    if (!regexNoSpecialChar.test(modalInput.value.trim())) {
      return showNotification(
        "Tên kích cỡ không được chứa ký tự đặc biệt",
        "warning",
      );
    }

    try {
      const res = await axios.post(
        `${API_BASE}/kich-co`,
        { tenKichCo: modalInput.value, nguoiTao: username },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const newSize = res.data.data || res.data;
      showNotification("Thêm kích cỡ thành công");
      kichCoList.value.unshift(newSize);
      tempKichCoList.value.push(newSize);
      modalType.value = "kich-co";
      modalInput.value = "";
    } catch (e) {
      showNotification(
        e.response?.data?.message || "Lỗi khi thêm kích cỡ",
        "error",
      );
    }
  } else {
    if (!modalInput.value.trim()) return;

    if (!regexNoSpecialChar.test(modalInput.value.trim())) {
      return showNotification(
        "Tên thuộc tính không được chứa ký tự đặc biệt",
        "warning",
      );
    }

    const fieldMap = {
      "xuat-xu": "tenXuatXu",
      "loai-ao": "tenLoai",
      "kieu-dang": "tenKieuDang",
      "phong-cach-mac": "tenPhongCach",
      "chat-lieu": "tenChatLieu",
    };
    try {
      const res = await axios.post(
        `${API_BASE}/${modalType.value}`,
        { [fieldMap[modalType.value]]: modalInput.value, nguoiTao: username },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      showNotification("Thêm dữ liệu thành công");
      switch (modalType.value) {
        case "xuat-xu":
          xuatXuList.value.push(res.data);
          break;
        case "loai-ao":
          loaiAoList.value.push(res.data);
          break;
        case "kieu-dang":
          kieuDangList.value.push(res.data);
          break;
        case "phong-cach-mac":
          phongCachList.value.push(res.data);
          break;
        case "chat-lieu":
          chatLieuList.value.push(res.data);
          break;
      }
      closeModal();
    } catch (e) {
      showNotification(
        e.response?.data?.message || "Lỗi khi lưu dữ liệu",
        "error",
      );
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
  if (!regexNoSpecialChar.test(modalInput.value.trim())) {
    showNotification("Tên màu sắc không được chứa ký tự đặc biệt", "warning");
    return;
  }

  try {
    const res = await axios.post(
      `${API_BASE}/mau-sac`,
      {
        tenMauSac: modalInput.value,
        rgb: modalColorRgb.value,
        nguoiTao: username,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const newColor = res.data.data || res.data;
    mauSacDaChon.value.unshift(newColor);
    tempMauSacList.value.push(newColor);
    showNotification("Thêm màu sắc thành công");
    closeColorModal();
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Lỗi khi thêm màu sắc",
      "error",
    );
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
  const file = e.target.files[0];
  if (!file) return;

  const url = await uploadImageToCloudinaryReturnUrl(file);

  if (url) {
    // ❗ GHI ĐÈ → chỉ 1 ảnh
    bienTheList.value[mIndex].hinhAnhUrls = [url];
    showNotification("Đã cập nhật ảnh cho biến thể");
  } else {
    showNotification("Lỗi tải ảnh biến thể", "error");
  }

  // reset input để chọn lại cùng file vẫn trigger change
  e.target.value = "";
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
  const mauSacId = bienTheList.value[mIndex].mauSacId;
  const idKichCo = bienTheList.value[mIndex].sizeList[sIndex].idKichCo;

  // Nếu đang sửa và cố xóa màu/size gốc -> Chặn
  if (
    isEditMode.value &&
    originalMauSacIds.value.includes(mauSacId) &&
    originalKichCoIds.value.includes(idKichCo)
  ) {
    showNotification(
      "Không thể xóa biến thể đã tồn tại sẵn khi Sửa sản phẩm",
      "warning",
    );
    return;
  }

  bienTheList.value[mIndex].sizeList.splice(sIndex, 1);
  if (bienTheList.value[mIndex].sizeList.length === 0) {
    bienTheList.value.splice(mIndex, 1);
  }
};

/* --- UTILS --- */
const getMauSacName = (id) =>
  mauSacDaChon.value.find((m) => m.id === id)?.tenMauSac || "Màu";
const toggleTempMauSac = (m) => {
  const isCurrentlySelected = tempMauSacList.value.some((x) => x.id === m.id);
  // Nếu đang Sửa, màu này là màu gốc, và hành động là "bỏ chọn" -> Chặn
  if (
    isEditMode.value &&
    originalMauSacIds.value.includes(m.id) &&
    isCurrentlySelected
  ) {
    showNotification("Không thể bỏ chọn màu sắc đã có sẵn khi sửa", "warning");
    return;
  }

  const idx = tempMauSacList.value.findIndex((x) => x.id === m.id);
  idx > -1 ? tempMauSacList.value.splice(idx, 1) : tempMauSacList.value.push(m);
};

const toggleTempKichCo = (k) => {
  const isCurrentlySelected = tempKichCoList.value.some((x) => x.id === k.id);
  // Nếu đang Sửa, size này là size gốc, và hành động là "bỏ chọn" -> Chặn
  if (
    isEditMode.value &&
    originalKichCoIds.value.includes(k.id) &&
    isCurrentlySelected
  ) {
    showNotification("Không thể bỏ chọn kích cỡ đã có sẵn khi sửa", "warning");
    return;
  }

  const idx = tempKichCoList.value.findIndex((x) => x.id === k.id);
  idx > -1 ? tempKichCoList.value.splice(idx, 1) : tempKichCoList.value.push(k);
};

/* --- FETCH DATA --- */
const fetchDropdownData = async () => {
  try {
    const apis = [
      "xuat-xu",
      "loai-ao",
      "kieu-dang",
      "phong-cach-mac",
      "chat-lieu",
    ];
    const res = await Promise.all(
      apis.map((a) =>
        axios
          .get(`${API_BASE}/${a}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => response.data),
      ),
    );
    [xuatXuList, loaiAoList, kieuDangList, phongCachList, chatLieuList].forEach(
      (refList, i) => (refList.value = res[i].data || res[i]),
    );
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    showNotification("Failed to fetch dropdown data", "error");
  }
};

const fetchMauSac = async () => {
  try {
    const res = await axios.get(`${API_BASE}/mau-sac`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    mauSacDaChon.value = res.data.data || res.data;
  } catch (error) {
    console.error("Error fetching colors (mau-sac):", error);
    showNotification("Failed to fetch colors", "error");
  }
};

const fetchKichCo = async () => {
  try {
    const res = await axios.get(`${API_BASE}/kich-co`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    kichCoList.value = res.data.data || res.data;
  } catch (error) {
    console.error("Error fetching sizes (kich-co):", error);
    showNotification("Failed to fetch sizes", "error");
  }
};

const validateBeforeSubmit = () => {
  // Reset lỗi mỗi lần bấm lưu
  errors.value = {};
  let isValid = true;

  // ==== THÔNG TIN CƠ BẢN ====
  if (!tenSanPham.value.trim()) {
    errors.value.tenSanPham = "Vui lòng nhập tên sản phẩm";
    isValid = false;
  } else if (tenSanPham.value.trim().length < 3) {
    errors.value.tenSanPham = "Tên sản phẩm tối thiểu 3 ký tự";
    isValid = false;
  } else if (tenSanPham.value.length > 150) {
    errors.value.tenSanPham = "Tên sản phẩm tối đa 150 ký tự";
    isValid = false;
  } else if (!regexNoSpecialChar.test(tenSanPham.value.trim())) {
    errors.value.tenSanPham = "Tên sản phẩm không được chứa ký tự đặc biệt";
    isValid = false;
  }

  if (!selectedXuatXu.value) {
    errors.value.xuatXu = "Vui lòng chọn xuất xứ";
    isValid = false;
  }
  if (!selectedLoaiAo.value) {
    errors.value.loaiAo = "Vui lòng chọn loại áo";
    isValid = false;
  }
  if (!selectedKieuDang.value) {
    errors.value.kieuDang = "Vui lòng chọn kiểu dáng";
    isValid = false;
  }
  if (!selectedPhongCach.value) {
    errors.value.phongCach = "Vui lòng chọn phong cách mặc";
    isValid = false;
  }
  if (!selectedChatLieu.value) {
    errors.value.chatLieu = "Vui lòng chọn chất liệu";
    isValid = false;
  }

  if (!hinhAnhCloud.value) {
    errors.value.hinhAnh = "Vui lòng tải ảnh đại diện sản phẩm";
    isValid = false;
  }

  if (!isValid) {
    showNotification("Vui lòng nhập đầy đủ thông tin bắt buộc!", "error");
    return false;
  }

  // ==== MÀU SẮC & KÍCH CỠ ====
  if (!selectedMauSacList.value.length)
    return (
      showNotification("Vui lòng chọn ít nhất 1 màu sắc", "warning"),
      false
    );
  if (!selectedKichCoList.value.length)
    return (
      showNotification("Vui lòng chọn ít nhất 1 kích cỡ", "warning"),
      false
    );
  if (!bienTheList.value.length)
    return (
      showNotification("Vui lòng tạo ít nhất 1 biến thể", "warning"),
      false
    );

  // ==== VALIDATE BIẾN THỂ TỪNG DÒNG (Giữ nguyên logic cũ của bạn) ====
  for (const color of bienTheList.value) {
    if (!color.sizeList.length) {
      showNotification(
        `Màu ${getMauSacName(color.mauSacId)} chưa có kích cỡ`,
        "warning",
      );
      return false;
    }
    if (!color.hinhAnhUrls || color.hinhAnhUrls.length === 0) {
      showNotification(
        `Vui lòng thêm ảnh biến thể cho màu ${getMauSacName(color.mauSacId)}`,
        "warning",
      );
      return false;
    }

    const sizeSet = new Set();
    for (const size of color.sizeList) {
      if (sizeSet.has(size.idKichCo)) {
        showNotification(
          `Màu ${getMauSacName(color.mauSacId)} bị trùng kích cỡ`,
          "error",
        );
        return false;
      }
      sizeSet.add(size.idKichCo);

      if (size.giaBan === null || size.giaBan === "") {
        showNotification(
          `Vui lòng nhập giá bán cho màu ${getMauSacName(color.mauSacId)}`,
          "warning",
        );
        return false;
      }
      if (size.giaNhap === null || size.giaNhap === "") {
        showNotification(
          `Vui lòng nhập giá nhập cho màu ${getMauSacName(color.mauSacId)}`,
          "warning",
        );
        return false;
      }
      if (size.soLuongTon === null || size.soLuongTon === "") {
        showNotification(
          `Vui lòng nhập số lượng cho màu ${getMauSacName(color.mauSacId)}`,
          "warning",
        );
        return false;
      }

      if (size.giaBan <= 0) {
        showNotification("Giá bán phải lớn hơn 0", "error");
        return false;
      }
      if (size.giaBan > 999999999 || size.giaNhap > 999999999) {
        showNotification("Giá tiền vượt quá giới hạn hệ thống", "error");
        return false;
      }
      if (size.giaNhap <= 0) {
        showNotification("Giá nhập phải lớn hơn 0", "error");
        return false;
      }
      if (size.giaNhap >= size.giaBan) {
        showNotification("Giá nhập phải nhỏ hơn giá bán", "error");
        return false;
      }

      if (size.soLuongTon < 0) {
        showNotification("Số lượng tồn không được âm", "error");
        return false;
      }
      if (size.soLuongTon > 100000) {
        showNotification("Số lượng tồn quá lớn (Max: 100.000)", "error");
        return false;
      }
      if (!Number.isInteger(Number(size.soLuongTon))) {
        showNotification("Số lượng tồn phải là số nguyên", "error");
        return false;
      }
    }
  }

  return true;
};

/* --- SUBMIT --- */
const submit = async () => {
  showConfirmModal.value = false;

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
      ? { nguoiCapNhat: username } // UPDATE
      : { nguoiTao: username }),
  };

  const method = productId ? "PUT" : "POST";
  const url = productId
    ? `${API_BASE}/san-pham/${productId}`
    : `${API_BASE}/san-pham`;

  try {
    const res = await axios({
      method: method,
      url: url,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: payload,
    });

    showNotification(
      productId ? "Cập nhật thành công!" : "Thêm mới thành công!",
    );
    setTimeout(() => {
      router.push("/admin/product");
    }, 1000);
  } catch (error) {
    console.error("Error saving product:", error);
    showNotification(
      error.response?.data?.message || "Lỗi khi lưu sản phẩm",
      "error",
    );
  }
};

const initSelect2 = (selector, placeholder, modelRef) => {
  const $el = window.$(selector);

  if (!$el.length || !$el.select2) return;

  // destroy nếu đã init trước đó (tránh init lại khi edit)
  if ($el.hasClass("select2-hidden-accessible")) {
    $el.select2("destroy");
  }

  $el.select2({
    width: "100%",
    placeholder,
    allowClear: true,
  });

  // set giá trị nếu đã có (khi edit)
  if (modelRef.value) {
    $el.val(modelRef.value).trigger("change.select2");
  }

  $el.on("change", function () {
    modelRef.value = $(this).val();
  });
};

onMounted(async () => {
  // Load toàn bộ danh mục trước
  await Promise.all([fetchDropdownData(), fetchMauSac(), fetchKichCo()]);

  // Sau đó mới fill dữ liệu sản phẩm
  if (productId) {
    await fetchProductDetail();
  }
  setTimeout(() => {
    initSelect2(".select2-xuatxu", "Chọn xuất xứ", selectedXuatXu);
    initSelect2(".select2-loaiao", "Chọn loại áo", selectedLoaiAo);
    initSelect2(".select2-kieudang", "Chọn kiểu dáng", selectedKieuDang);
    initSelect2(".select2-phongcach", "Chọn phong cách", selectedPhongCach);
    initSelect2(".select2-chatlieu", "Chọn chất liệu", selectedChatLieu);
  }, 0);
});
watch(selectedXuatXu, (val) => {
  if (val) errors.value.xuatXu = "";
});
watch(selectedLoaiAo, (val) => {
  if (val) errors.value.loaiAo = "";
});
watch(selectedKieuDang, (val) => {
  if (val) errors.value.kieuDang = "";
});
watch(selectedPhongCach, (val) => {
  if (val) errors.value.phongCach = "";
});
watch(selectedChatLieu, (val) => {
  if (val) errors.value.chatLieu = "";
});
watch(hinhAnhCloud, (val) => {
  if (val) errors.value.hinhAnh = "";
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap");

.container {
  padding: 35px;
  font-family: "Poppins", sans-serif;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.06);
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
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
  margin-bottom: 22px;
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
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  font-family: "Poppins", sans-serif;
  background: white;
  transition: all 0.25s ease;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #6b3f23;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(107, 63, 35, 0.08);
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
  align-items: center;
  gap: 8px;
}

/* select2 full width */
:deep(.select2-container) {
  width: 100% !important;
}

:deep(.select2-container .select2-selection--single) {
  height: 42px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 14px;
  transition: 0.25s;
}

:deep(
  .select2-container--default.select2-container--focus
    .select2-selection--single
) {
  border-color: #6b3f23;
  box-shadow: 0 0 0 3px rgba(107, 63, 35, 0.08);
}

/* Mũi tên */
:deep(.select2-container .select2-selection__arrow) {
  height: 40px;
}

/* text bên trong */
:deep(.select2-selection__rendered) {
  font-size: 14px;
  color: #3f2a1d;
  /* màu chữ input */
  padding-left: 0 !important;
  line-height: normal !important;
}

/* placeholder */
:deep(.select2-selection__placeholder) {
  color: #a08c7a;
  /* giống placeholder input */
}

/* mũi tên */
:deep(.select2-selection__arrow) {
  height: 100%;
  right: 10px;
}

/* focus giống input */
:deep(
  .select2-container--default.select2-container--focus
    .select2-selection--single
) {
  border-color: #a9744f;
  box-shadow: 0 0 0 1px rgba(169, 116, 79, 0.35);
}

.add-btn {
  width: 42px;
  height: 42px;
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
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.save-fast-btn {
  background: white;
  color: black;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
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
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: white;
  min-width: 80px;
}

.modal-actions .save-btn:hover {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
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
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
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
  color: white;
  padding: 15px 20px;
  border-radius: 6px 6px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
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
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
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
  border: 1px solid #e0e0e0;
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
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
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
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
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

.modal-confirm {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
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

.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e8f5e9;
  color: #22c55e;
  margin: 0 auto 15px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.confirm-icon-wrapper svg {
  display: block;
  margin: 0;
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

.confirm-actions {
  display: flex;
  gap: 20px;
}

.btn-confirm {
  background: #63391f;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  flex: 1;
  height: 42px;
  transition: 0.2s;
}

.btn-confirm:hover {
  background: #4e2c17;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  flex: 1;
  height: 42px;
  transition: 0.2s;
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

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

.variant-table tbody tr {
  background: #ffffff;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.04);
}

.variant-table td {
  padding: 12px;
}

.variant-table .input-field {
  width: 100%;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  padding: 0 12px;
  font-size: 14px;
  font-family: "Poppins", sans-serif;
  background: white;
  transition: all 0.25s ease;
}

.variant-table .input-field:focus {
  outline: none;
  border-color: #6b3f23;
  background: white;
  box-shadow: 0 0 0 3px rgba(107, 63, 35, 0.08);
}

.variant-table input[type="number"]::-webkit-outer-spin-button,
.variant-table input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.variant-table input[type="number"] {
  -moz-appearance: textfield;
}

.btn-delete {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #ffeaea;
  color: #c0392b;
  cursor: pointer;
  transition: 0.2s;
}

.btn-delete:hover {
  background: #ffcccc;
}

.money-input {
  position: relative;
  width: 100%;
}

.money-input input {
  width: 100%;
  padding: 10px 35px 10px 12px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
}

.money-input span {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
}
.save-action {
  display: flex;
  justify-content: flex-end;
  gap: 15px; /* Thêm dòng này để cách 2 nút ra */
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.btn-cancel-main {
  background: #e5e7eb; /* Màu xám nhạt */
  color: #374151;
  padding: 12px 24px; /* Kích thước y hệt save-btn */
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel-main:hover {
  background: #d1d5db; /* Đậm hơn một chút khi di chuột vào */
  transform: translateY(-2px); /* Hiệu ứng nảy lên giống nút Thêm */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); /* Đổ bóng giống nút Thêm */
}
/* Styling cho các input thông thường bị lỗi */
input.is-invalid,
textarea.is-invalid {
  border-color: #d9534f !important;
  background-color: #fff9f9 !important; /* Màu nền hơi hồng */
}
input.is-invalid:focus,
textarea.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(217, 83, 79, 0.15) !important;
}

/* Styling cho Select2 bị lỗi */
.has-error :deep(.select2-selection--single) {
  border-color: #d9534f !important;
  background-color: #fff9f9 !important;
}

/* Styling cho khung Upload ảnh bị lỗi */
.image-box.is-invalid {
  border-color: #d9534f !important;
  background-color: #fff9f9 !important;
}

/* Đoạn text thông báo lỗi giống trong hình */
.error-text {
  color: #d9534f;
  font-size: 13px;
  margin-top: 5px;
  display: block;
}
.color-item.locked {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: all;
  background: #e9ecef;
  border-color: #ced4da;
  color: #6c757d;
}

.color-item.locked.selected {
  background: #6b3f23;
  color: white;
  opacity: 0.7;
}
</style>
