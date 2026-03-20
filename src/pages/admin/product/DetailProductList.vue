<template>
  <div class="header">
    <h2 class="title">Danh sách tất cả biến thể sản phẩm</h2>

    <div class="top-bar">
      <!-- SEARCH -->
      <div class="left-actions">
        <label>Tìm kiếm</label>
        <div class="search-wrapper">
          <img src="/src/assets/icon/search.svg" class="search-icon" />
          <input
            class="search-input"
            placeholder="Tìm biến thể theo mã biến thể và mã sản phẩm"
            v-model="keyword"
            @input="handleSearch"
            style="border: 1px solid #d6c3b4"
          />
        </div>

        <!-- FILTERS -->
        <div class="filters">
          <div class="filter-item">
            <label>Màu sắc</label>
            <select
              class="select2-mausac"
              :ref="(el) => el && (el.__vModel = selectedMauSacList)"
            >
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

          <div class="filter-item">
            <label>Kích cỡ</label>
            <select
              class="select2-kichco"
              :ref="(el) => el && (el.__vModel = selectedKichCoList)"
            >
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
          <div class="filter-item">
            <label>Trạng thái:</label>
            <select v-model="selectedTrangThai" @change="handleStatusChange">
              <option value="">Tất cả</option>
              <option value="0">Hết hàng</option>
              <option value="1">Đang bán</option>
              <option value="2">Ngừng bán</option>
            </select>
          </div>
          <div class="price-filter">
            <label>
              Khoảng giá:
              <span class="price-value">
                0 ₫ - {{ formatCurrency(selectedMaxPrice) }}
              </span>
            </label>
            <input
              type="range"
              min="0"
              :max="maxPrice"
              v-model.number="selectedMaxPrice"
              @change="handlePriceChange"
              class="price-slider"
              :style="{
                background: `linear-gradient(
      to right,
      #63391f 0%,
      #63391f ${(selectedMaxPrice / maxPrice) * 100}%,
      #e0e0e0 ${(selectedMaxPrice / maxPrice) * 100}%,
      #e0e0e0 100%
     )`,
              }"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="add-btn">
      <button @click="openScanModal">
        <img src="/src/assets/icon/qr.svg" />
        Quét QR
      </button>

      <button @click="exportExcel">
        <img
          src="/src/assets/icon/dowload.svg"
          alt=""
          style="width: 25px; height: 25px"
        />
        Tải excel
      </button>
    </div>
  </div>

  <div class="product-page">
    <div class="table-panel">
      <div class="table-wrapper">
        <table class="product-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="custom-checkbox"
                />
              </th>

              <th>STT</th>
              <th>Ảnh</th>
              <th>Mã SP</th>
              <th>Mã CTSP</th>
              <th>Kích cỡ</th>
              <th>Màu sắc</th>
              <th>SL tồn</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in variants" :key="item.id">
              <td>
                <input
                  type="checkbox"
                  v-model="selectedIds"
                  :value="item.id"
                  class="custom-checkbox"
                />
              </td>

              <td>{{ index + 1 }}</td>
              <td style="position: relative">
                <img
                  v-if="item.hinhAnh?.length"
                  :src="item.hinhAnh[0]"
                  class="variant-img"
                />

                <span v-if="promotionMap[item.id]" class="discount-badge">
                  -{{ promotionMap[item.id] }}%
                </span>
              </td>
              <td>{{ item.maSanPham }}</td>
              <td>{{ item.maChiTietSanPham }}</td>
              <td>
                {{ item.tenKichCo }}
              </td>
              <td>
                {{ item.tenMauSac }}
              </td>
              <td>{{ item.soLuongTon }}</td>
              <td>{{ formatCurrency(item.giaNhap) }}</td>
              <td>
                <div v-if="promotionMap[item.id]">
                  <div
                    style="
                      font-size: 12px;
                      color: #999;
                      text-decoration: line-through;
                    "
                  >
                    {{ formatCurrency(item.giaBan) }}
                  </div>

                  <div style="color: #e53935; font-weight: 700">
                    {{
                      formatCurrency(getDiscountedPrice(item.giaBan, item.id))
                    }}
                  </div>
                </div>

                <div v-else>
                  {{ formatCurrency(item.giaBan) }}
                </div>
              </td>
              <td>
                <span class="status" :class="getStatusClass(item)">
                  {{ getStatusText(item) }}
                </span>
              </td>
              <td>
                <div class="action-inner">
                  <div class="tooltip-wrapper" data-tooltip="Chỉnh sửa">
                    <span class="icon edit" @click="goToUpdate(item.id)">
                      <img
                        src="/src/assets/icon/edit.svg"
                        style="width: 20px; height: 20px"
                      />
                    </span>
                  </div>

                  <div
                    class="tooltip-wrapper"
                    :data-tooltip="
                      item.trangThai === 1
                        ? 'Ngừng bán'
                        : item.trangThai === 2
                          ? 'Bán lại'
                          : 'Không khả dụng'
                    "
                  >
                    <label class="switch">
                      <input
                        type="checkbox"
                        :checked="item.trangThai === 1"
                        @click.prevent="toggleStatus(item)"
                        :disabled="item.trangThai === 0"
                      />
                      <span class="slider"></span>
                    </label>
                  </div>
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
        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-btn"
          :class="{ active: page - 1 === currentPage }"
          :disabled="page === '...'"
          @click="goToPage(page - 1)"
        >
          {{ page }}
        </button>

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
  <div
    v-if="showScanModal"
    class="scan-modal-overlay"
    @click.self="closeScanModal"
  >
    <div class="scan-modal-content">
      <div class="scan-header">
        <div class="header-title">
          <span class="icon-qr">📷</span>
          <h3>Quét mã QR sản phẩm</h3>
        </div>
        <button class="close-btn" @click="closeScanModal" title="Đóng">
          ×
        </button>
      </div>

      <div class="scan-body">
        <div class="camera-section">
          <qrcode-stream
            v-if="cameraActive"
            @detect="onDetect"
            @error="onError"
            :formats="['qr_code']"
            :track="paintBoundingBox"
          >
            <div class="scan-frame">
              <div class="corner topleft"></div>
              <div class="corner topright"></div>
              <div class="corner bottomleft"></div>
              <div class="corner bottomright"></div>
              <p>Đưa mã QR vào giữa khung để quét</p>
              <div v-if="loadingCamera" class="loading-text">
                Đang khởi động camera...
              </div>
            </div>
          </qrcode-stream>

          <div v-else class="camera-placeholder">
            <div class="placeholder-icon">📷</div>
            <p v-if="!scanError">Bấm nút bên dưới để bắt đầu quét</p>
            <p v-else style="color: #e74c3c">{{ scanError }}</p>
            <button class="btn-primary-brown" @click="startCamera">
              Bật Camera Ngay
            </button>
          </div>
        </div>

        <div class="divider">
          <span>HOẶC TẢI ẢNH</span>
        </div>

        <div class="upload-section">
          <label class="upload-box">
            <qrcode-capture
              @detect="onDetect"
              :formats="['qr_code']"
              class="hidden-capture-input"
            />

            <span class="upload-icon">📂</span>
            <span class="upload-text">Chọn ảnh QR từ máy tính</span>
            <span class="upload-subtext">(Hỗ trợ tốt mọi định dạng ảnh)</span>
          </label>
        </div>
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
    <div v-if="modal.show" class="modal-confirm" @click.self="closeModal">
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
          <button class="btn-cancel hover-effect" @click="closeModal">
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
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { QrcodeStream, QrcodeCapture } from "vue-qrcode-reader";
import axios from "axios";
const notifications = ref([]);

const getStatusText = (item) => {
  if (item.trangThai === 0) return "Hết hàng";
  if (item.trangThai === 1) return "Đang bán";
  return "Ngừng bán";
};

const getStatusClass = (item) => {
  if (item.trangThai === 0) return "out";
  if (item.trangThai === 1) return "selling";
  return "stopped";
};

const promotionMap = ref({});
const fetchPromotions = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/promotions");

    const now = new Date();
    const map = {};

    res.data.forEach((dgg) => {
      const start = new Date(dgg.ngayBatDau);
      const end = new Date(dgg.ngayKetThuc);

      if (dgg.trangThai === 1 && now >= start && now <= end) {
        dgg.chiTietSanPhamIds.forEach((ctspId) => {
          map[ctspId] = Math.max(map[ctspId] || 0, dgg.giaTriGiam);
        });
      }
    });

    promotionMap.value = map;
  } catch (err) {
    console.error("Lỗi load giảm giá:", err);
  }
};

const getDiscountedPrice = (price, variantId) => {
  const percent = promotionMap.value[variantId];
  if (!percent) return null;

  return price - (price * percent) / 100;
};

const showNotification = (message, type = "success") => {
  const id = Date.now();
  notifications.value.push({ id, message, type });

  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 3000);
};
const showScanModal = ref(false);
const scanError = ref("");
const cameraActive = ref(false);
const loadingCamera = ref(false);
function openScanModal() {
  showScanModal.value = true;
  scanError.value = "";
  cameraActive.value = false; // Mặc định tắt để user tự bật
}

function closeScanModal() {
  cameraActive.value = false;
  showScanModal.value = false;
}

function startCamera() {
  scanError.value = "";
  cameraActive.value = true;
  loadingCamera.value = true;
}

function onDetect(detectedCodes) {
  const result = detectedCodes[0];
  if (!result || !result.rawValue) return;

  const qrValue = result.rawValue.trim();

  // ❌ QR SAI
  if (!qrValue.startsWith("CTSP")) {
    showNotification("QR không hợp lệ!", "error");

    cameraActive.value = false;
    loadingCamera.value = false;
    showScanModal.value = false;
    return;
  }

  // ✅ QR ĐÚNG
  showNotification("Quét QR thành công", "success");

  cameraActive.value = false;
  loadingCamera.value = false;
  showScanModal.value = false;

  keyword.value = qrValue;
  currentPage.value = 0;

  fetchVariants();
}

function onError(err) {
  loadingCamera.value = false;
  if (err.name === "NotAllowedError") {
    scanError.value = "Bạn cần cấp quyền truy cập Camera!";
  } else if (err.name === "NotFoundError") {
    scanError.value = "Không tìm thấy thiết bị Camera.";
  } else {
    scanError.value = `Lỗi camera: ${err.message}`;
  }
  cameraActive.value = false;
}

const router = useRouter();
const route = useRoute();
const isInitPrice = ref(true);

const currentPage = ref(0);
const pageSize = ref(8);
const totalPages = ref(0);

const mauSacList = ref([]);
const kichCoList = ref([]);

const selectedMauSacList = ref("");
const selectedKichCoList = ref("");

const selectedTrangThai = ref("");
const selectedIds = ref([]);
const isAllSelected = computed(() => {
  return (
    variants.value.length > 0 &&
    selectedIds.value.length === variants.value.length
  );
});

const exportExcel = async () => {
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: keyword.value || null,

      mauSacId:
        selectedMauSacList.value !== ""
          ? parseInt(selectedMauSacList.value)
          : null,

      kichCoId:
        selectedKichCoList.value !== ""
          ? parseInt(selectedKichCoList.value)
          : null,

      trangThai:
        selectedTrangThai.value !== ""
          ? parseInt(selectedTrangThai.value)
          : null,

      minPrice: 0,
      maxPrice: selectedMaxPrice.value || null,
    };

    // 👉 nếu có chọn checkbox → gửi danh sách id
    if (selectedIds.value.length > 0) {
      params.ids = selectedIds.value;
    }

    const res = await axios.get(
      "http://localhost:8080/api/chi-tiet-san-pham/export-excel",
      {
        params,
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "chi_tiet_san_pham.xlsx");
    document.body.appendChild(link);
    link.click();
  } catch (e) {
    alert("Xuất excel thất bại!");
  }
};

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectedIds.value = variants.value.map((v) => v.id);
  } else {
    selectedIds.value = [];
  }
};

const handleStatusChange = () => {
  currentPage.value = 0;
  fetchVariants();
};
const maxPrice = ref(0); // giá lớn nhất trong data
const selectedMaxPrice = ref(0);

const fetchMauSac = async () => {
  const res = await axios.get("http://localhost:8080/api/mau-sac");
  mauSacList.value = res.data;
};

const fetchKichCo = async () => {
  const res = await axios.get("http://localhost:8080/api/kich-co");
  kichCoList.value = res.data;
};

const fetchFilterData = async () => {
  try {
    const [originRes, materialRes] = await Promise.all([
      axios.get("http://localhost:8080/api/mau-sac"),
      axios.get("http://localhost:8080/api/kich-co"),
    ]);

    originList.value = originRes.data.data || originRes.data;
    materialList.value = materialRes.data.data || materialRes.data;
  } catch (error) {
    console.error("Lỗi lấy dữ liệu filter:", error);
  }
};

const handleColorChange = () => {
  currentPage.value = 0;
  fetchVariants();
};

const handleSizeChange = () => {
  currentPage.value = 0;
  fetchVariants();
};

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    fetchVariants();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
    fetchVariants();
  }
};

const goToPage = (page) => {
  if (page < 0 || page >= totalPages.value) return;
  currentPage.value = page;
  fetchVariants();
};

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value + 1;

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

const handleSearch = () => {
  currentPage.value = 0;
  fetchVariants();
};

const productId = route.params.id;
const isFilterByProduct = ref(!!productId);

const tenSanPham = ref("");
const keyword = ref("");
const variants = ref([]);

const formatCurrency = (value) => {
  if (value == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const goToUpdate = (variantId) => {
  router.push(`/admin/chi-tiet-san-pham/${productId}/edit/${variantId}`);
};
const handlePriceChange = () => {
  currentPage.value = 0;
  fetchVariants();
};

const viewAllVariants = async () => {
  isFilterByProduct.value = false;
  currentPage.value = 0;

  // 🔥 reset price filter
  isInitPrice.value = true;
  selectedMaxPrice.value = 0;
  maxPrice.value = 0;

  await fetchVariants();
};

const fetchVariants = async () => {
  try {
    const url = "http://localhost:8080/api/chi-tiet-san-pham";

    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: keyword.value || null,
      mauSacId: selectedMauSacList.value || null,
      kichCoId: selectedKichCoList.value || null,
      trangThai:
        selectedTrangThai.value !== "" ? selectedTrangThai.value : null,
      minPrice: 0,
      maxPrice: selectedMaxPrice.value || null,
    };

    if (isFilterByProduct.value) {
      params.productId = productId;
    }

    const res = await axios.get(url, { params });

    variants.value = res.data.content;
    totalPages.value = res.data.totalPages;
    if (variants.value.length > 0) {
      tenSanPham.value = variants.value[0].tenSanPham;
    }
    if (variants.value.length > 0 && isInitPrice.value) {
      const prices = variants.value.map((v) => v.giaBan || 0);
      const max = Math.max(...prices);

      maxPrice.value = max;
      selectedMaxPrice.value = max; // set 1 lần duy nhất
      isInitPrice.value = false; // 🔒 khóa lại
    }
  } catch (e) {
    console.error("Lỗi load CTSP:", e);
  }
};
const modal = ref({
  show: false,
  title: "",
  message: "",
  onConfirm: null,
});

function toggleStatus(item) {
  const oldStatus = item.trangThai;
  const newStatus = oldStatus === 1 ? 2 : 1;

  modal.value = {
    show: true,
    title: newStatus === 1 ? "Xác nhận bán lại" : "Xác nhận ngừng bán",
    message:
      newStatus === 1
        ? "Bạn có chắc muốn bán lại sản phẩm này?"
        : "Bạn có chắc muốn ngừng bán sản phẩm này?",
    onConfirm: async () => {
      try {
        await axios.put(
          `http://localhost:8080/api/chi-tiet-san-pham/${item.id}/change-status`,
          null,
          {
            params: {
              trangThai: newStatus,
              nguoiCapNhat: "admin",
            },
          },
        );

        item.trangThai = newStatus;
        showNotification("Cập nhật trạng thái thành công", "success");
      } catch (error) {
        showNotification("Lỗi cập nhật trạng thái!", "error");
      }

      modal.value.show = false;
    },
  };
}

function handleModalConfirm() {
  if (modal.value.onConfirm) {
    modal.value.onConfirm();
  }
}

function closeModal() {
  modal.value.show = false;
}

const initSelect2 = (selector, placeholder, modelRef) => {
  const $el = window.$(selector);

  if (!$el.length || !$el.select2) return;

  if ($el.hasClass("select2-hidden-accessible")) {
    $el.select2("destroy");
  }

  $el.select2({
    width: "100%",
    placeholder,
    allowClear: true,
  });

  if (modelRef.value) {
    $el.val(modelRef.value).trigger("change.select2");
  }

  $el.on("change", function () {
    const val = $(this).val();
    modelRef.value = val !== "" ? parseInt(val) : "";

    currentPage.value = 0;
    fetchVariants();
  });
};

onMounted(() => {
  fetchVariants();
  fetchMauSac();
  fetchKichCo();
  fetchPromotions();
  setTimeout(() => {
    initSelect2(".select2-mausac", "Chọn màu sắc", selectedMauSacList);
    initSelect2(".select2-kichco", "Chọn kích cỡ", selectedKichCoList);
  }, 0);
});
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
  margin-top: 5px;
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
  width: 200px;
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
  margin-right: 20px;
  margin-bottom: 20px; /* 👈 ép nút xuống cùng hàng */
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
  height: 70px;
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
.action-inner {
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
  width: 60px;
  height: auto;
}
.price-filter {
  width: 470px; /* 👈 tăng chiều dài */
  margin-bottom: 20px;
}
.price-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 5px;
  outline: none;
}

/* Chrome, Edge */
.price-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  cursor: pointer;
  border: none;
}

/* Firefox */
.price-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  cursor: pointer;
  border: none;
}
.scan-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}
.scan-modal-content {
  background: #fff;
  width: 550px;
  max-width: 95%;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.scan-header {
  background: #fdf8f5;
  padding: 16px 24px;
  border-bottom: 1px solid #efe6e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #63391f;
}
.header-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}
.icon-qr {
  font-size: 20px;
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 28px;
  color: #a89288;
  cursor: pointer;
  line-height: 1;
}
.close-btn:hover {
  color: #63391f;
}
.scan-body {
  padding: 24px;
}

/* CAMERA SECTION */
.camera-section {
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  text-align: center;
  gap: 15px;
  padding: 20px;
  z-index: 3;
}
.placeholder-icon {
  font-size: 48px;
  opacity: 0.5;
}
.btn-primary-brown {
  background: #63391f;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 57, 31, 0.4);
}
.btn-primary-brown:hover {
  background: #7d4a2b;
}

/* SCAN FRAME (Đè lên camera) */
.scan-frame {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 10px;
  pointer-events: none;
  z-index: 5;
}
.scan-text {
  color: #fff;
  margin-bottom: 5px;
  font-size: 14px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}
.loading-text {
  color: #f39c12;
  font-size: 13px;
  margin-top: 5px;
}
.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 4px solid #4caf50;
}
.topleft {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
  border-radius: 12px 0 0 0;
}
.topright {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 12px 0 0;
}
.bottomleft {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 12px;
}
.bottomright {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 12px 0;
}

/* DIVIDER */
.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #a89288;
  font-size: 12px;
  font-weight: 600;
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #eee;
}
.divider span {
  padding: 0 10px;
}

/* UPLOAD SECTION (Custom UI cho input file) */
.upload-box {
  border: 2px dashed #d6c3b4;
  background: #faf6f4;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  color: #63391f;
  position: relative;
}
.upload-box:hover {
  border-color: #63391f;
  background: #fdf1e8;
}
.upload-icon {
  font-size: 24px;
  margin-bottom: 5px;
}
.upload-text {
  font-weight: 600;
  font-size: 14px;
}
.upload-subtext {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.hidden-capture-input {
  display: none;
} /* Ẩn input mặc định của qrcode-capture */
.error-alert {
  margin-top: 15px;
  padding: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
  text-align: center;
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
:deep(.select2-container) {
  width: 100% !important;
}

/* ô select giống input */
:deep(.select2-container .select2-selection--single) {
  height: 40px;
  padding: 0 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 14px;
  color: #555555a4;
  background: #fff;
  display: flex;
  align-items: center;
}
/* Mũi tên */
:deep(.select2-container .select2-selection__arrow) {
  height: 40px;
}

/* text bên trong */
:deep(.select2-selection__rendered) {
  font-size: 14px;
  color: #3f2a1d; /* màu chữ input */
  padding-left: 0 !important;
  line-height: normal !important;
}

/* placeholder */
:deep(.select2-selection__placeholder) {
  color: #a08c7a; /* giống placeholder input */
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
.variant-img {
  width: 60px;
  border-radius: 10px;
}

.discount-badge {
  position: absolute;
  top: 12px;
  left: 6px;
  background: #e53935;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}
.custom-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #a9744f;
}
</style>
