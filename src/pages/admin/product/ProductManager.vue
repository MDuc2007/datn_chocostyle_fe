<template>
  <div class="header">
    <h2 class="title">QUẢN LÝ SẢN PHẨM</h2>
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
            placeholder="Tìm kiếm sản phẩm theo mã và tên sản phẩm"
            v-model="keyword"
            @input="handleSearch"
            style="border: 1px solid #d6c3b4"
          />
        </div>
        <div class="filters">
          <div class="filter-item">
            <label>Xuất xứ</label>
            <select
              class="select2-xuatxu"
              :ref="(el) => el && (el.__vModel = selectedOrigin)"
            >
              <option value="">Chọn xuất xứ</option>
              <option
                v-for="item in originList"
                :key="item.id"
                :value="item.id"
              >
                {{ item.tenXuatXu }}
              </option>
            </select>
          </div>

          <div class="filter-item">
            <label>Chất liệu</label>
            <select
              class="select2-chatlieu"
              :ref="(el) => el && (el.__vModel = selectedMaterial)"
            >
              <option value="">Chọn chất liệu</option>
              <option
                v-for="item in materialList"
                :key="item.id"
                :value="item.id"
              >
                {{ item.tenChatLieu }}
              </option>
            </select>
          </div>

          <div class="filter-item">
            <label>Trạng thái</label>
            <select v-model="selectedStatus" @change="handleFilterChange">
              <option value="">Tất cả</option>
              <option value="1">Đang bán</option>
              <option value="0">Hết hàng</option>
              <option value="2">Ngừng bán</option>
            </select>
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
        <button @click="$router.push('/admin/product/create')">
          <span>＋</span> Thêm sản phẩm
        </button>
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
              <th>Hình ảnh</th>
              <th>Mã sản phẩm</th>
              <th>Tên sản phẩm</th>
              <th>Xuất xứ</th>
              <th>Chất liệu</th>
              <th>Số lượng</th>
              <th>Giá (VND)</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in products" :key="item.id">
              <td>{{ currentPage * pageSize + index + 1 }}</td>
              <td>
                <img :src="item.image" />
              </td>
              <td>{{ item.ma }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.origin }}</td>
              <td>{{ item.material }}</td>
              <td>{{ item.quantity }}</td>
              <td>
                <span v-if="typeof item.price === 'number'">
                  {{ formatCurrency(item.price) }}
                </span>
                <span v-else-if="typeof item.price === 'string'">
                  {{ formatPriceRange(item.price) }}
                </span>
                <span v-else>0 ₫</span>
              </td>
              <td>
                <span
                  class="status"
                  :class="{
                    selling: item.trangThai === 1,
                    out: item.trangThai === 0,
                    stopped: item.trangThai === 2,
                  }"
                >
                  {{
                    item.trangThai === 1
                      ? "Đang bán"
                      : item.trangThai === 0
                        ? "Hết hàng"
                        : "Ngừng bán"
                  }}
                </span>
              </td>

              <td class="action">
                <div class="tooltip-wrapper" data-tooltip="Xem chi tiết">
                  <span class="icon view" @click="goToDetail(item.id)">
                    <img
                      src="/src/assets/icon/eye.svg"
                      style="width: 20px; height: 20px"
                    />
                  </span>
                </div>

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
                      @change="toggleStatus(item)"
                      :disabled="item.trangThai === 0"
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
        <!-- PREV -->
        <button
          class="nav-btn"
          @click="previousPage"
          :disabled="currentPage === 0"
        >
          &lt;
        </button>

        <!-- PAGE NUMBERS -->
        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-btn"
          :class="{ active: page - 1 === currentPage }"
          :disabled="page === '...'"
          @click="page !== '...' && goToPage(page - 1)"
        >
          {{ page }}
        </button>

        <!-- NEXT -->
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
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { QrcodeStream, QrcodeCapture } from "vue-qrcode-reader";
/* ===== TOAST (GIỐNG SỬA BIẾN THỂ) ===== */
const notifications = ref([]);

const showNotification = (message, type = "success") => {
  const id = Date.now();
  notifications.value.push({ id, message, type });

  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 3000);
};

const router = useRouter();

const goToUpdate = (id) => {
  router.push(`/admin/product/update/${id}`);
};

const products = ref([]);
const currentPage = ref(0);
const pageSize = ref(8);
const totalPages = ref(1);
const keyword = ref("");
const selectedStatus = ref("");
const selectedOrigin = ref("");
const selectedMaterial = ref("");
const originList = ref([]);
const materialList = ref([]);
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
  if (!qrValue.startsWith("SP")) {
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

  fetchProducts(
    0,
    pageSize.value,
    keyword.value,
    selectedStatus.value,
    selectedOrigin.value,
    selectedMaterial.value,
  );
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

const goToDetail = (id) => {
  router.push(`/admin/product/${id}/details`);
};

const exportExcel = async () => {
  try {
    const res = await axios.get(
      "http://localhost:8080/api/san-pham/export-excel",
      {
        params: {
          keyword: keyword.value || null,
          status: selectedStatus.value || null,
          idXuatXu: selectedOrigin.value || null,
          idChatLieu: selectedMaterial.value || null,
        },
        responseType: "blob",
      },
    );

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "san_pham.xlsx";
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    alert("Xuất excel thất bại");
  }
};

const fetchProducts = async (
  page = 0,
  size = 8,
  kw = "",
  status = null,
  originId = "",
  materialId = "",
) => {
  try {
    const params = {
      page,
      size,
    };

    if (kw) params.keyword = kw;
    if (status !== "" && status !== null) params.status = parseInt(status);
    if (originId !== "" && originId !== null) {
      params.idXuatXu = parseInt(originId);
    }

    if (materialId !== "" && materialId !== null) {
      params.idChatLieu = parseInt(materialId);
    }

    const res = await axios.get("http://localhost:8080/api/san-pham", {
      params,
    });

    const pageData = res.data;
    totalPages.value = pageData.totalPages || 1;
    currentPage.value = pageData.number || 0;

    products.value = (pageData.content || []).map((item) => {
      let quantity = 0;
      let prices = [];
      let idXuatXu = "";
      let idChatLieu = "";

      if (item.bienTheList && item.bienTheList.length > 0) {
        quantity = item.bienTheList.reduce(
          (sum, bt) => sum + (bt.soLuongTon || 0),
          0,
        );

        prices = item.bienTheList
          .map((bt) => bt.giaBan)
          .filter((p) => p != null);
      }

      let price = null;

      if (prices.length === 1) {
        price = prices[0]; // 1 giá
      } else if (prices.length > 1) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        price = min === max ? min : `${min}~${max}`; // khoảng giá
      }

      if (item.tenXuatXu) {
        const origin = originList.value.find(
          (o) => o.tenXuatXu === item.tenXuatXu,
        );
        idXuatXu = origin?.id || "";
      }

      if (item.tenChatLieu) {
        const material = materialList.value.find(
          (m) => m.tenChatLieu === item.tenChatLieu,
        );
        idChatLieu = material?.id || "";
      }

      return {
        id: item.id,
        ma: item.maSp,
        name: item.tenSp,
        origin: item.tenXuatXu,
        originId: idXuatXu,
        material: item.tenChatLieu,
        materialId: idChatLieu,
        quantity,
        price, // 👈 số HOẶC string "min~max"
        trangThai: item.trangThai,
        image: item.hinhAnh || "https://via.placeholder.com/50x60",
      };
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);
  }
};

const handleSearch = () => {
  currentPage.value = 0;
  fetchProducts(
    0,
    pageSize.value,
    keyword.value,
    selectedStatus.value,
    selectedOrigin.value,
    selectedMaterial.value,
  );
};

const handleFilterChange = () => {
  currentPage.value = 0;
  fetchProducts(
    0,
    pageSize.value,
    keyword.value,
    selectedStatus.value,
    selectedOrigin.value,
    selectedMaterial.value,
  );
};

const fetchFilterData = async () => {
  try {
    const [originRes, materialRes] = await Promise.all([
      axios.get("http://localhost:8080/api/xuat-xu"),
      axios.get("http://localhost:8080/api/chat-lieu"),
    ]);

    originList.value = originRes.data.data || originRes.data;
    materialList.value = materialRes.data.data || materialRes.data;
  } catch (error) {
    console.error("Lỗi lấy dữ liệu filter:", error);
  }
};

const handleOriginChange = () => {
  currentPage.value = 0;
  fetchProducts(
    0,
    pageSize.value,
    keyword.value,
    selectedStatus.value,
    selectedOrigin.value,
    selectedMaterial.value,
  );
};

const handleMaterialChange = () => {
  currentPage.value = 0;
  fetchProducts(
    0,
    pageSize.value,
    keyword.value,
    selectedStatus.value,
    selectedOrigin.value,
    selectedMaterial.value,
  );
};

const goToPage = (page) => {
  if (page < 0 || page >= totalPages.value) return;
  currentPage.value = page;
  fetchProducts(
    page,
    pageSize.value,
    keyword.value,
    selectedStatus.value,
    selectedOrigin.value,
    selectedMaterial.value,
  );
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

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    fetchProducts(
      currentPage.value,
      pageSize.value,
      keyword.value,
      selectedStatus.value,
      selectedOrigin.value,
      selectedMaterial.value,
    );
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
    fetchProducts(
      currentPage.value,
      pageSize.value,
      keyword.value,
      selectedStatus.value,
      selectedOrigin.value,
      selectedMaterial.value,
    );
  }
};

async function toggleStatus(item) {
  const oldStatus = item.trangThai;

  // 🔁 toggle 1 ↔ 2
  const newStatus = oldStatus === 1 ? 2 : 1;

  // optimistic update
  item.trangThai = newStatus;

  try {
    await axios.put(
      `http://localhost:8080/api/san-pham/${item.id}/change-status`,
      null,
      {
        params: {
          trangThai: newStatus,
          nguoiCapNhat: "admin",
        },
      },
    );
  } catch (error) {
    // rollback
    item.trangThai = oldStatus;
    alert("Lỗi cập nhật trạng thái sản phẩm!");
  }
}

const formatCurrency = (value) => {
  if (value == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatPriceRange = (value) => {
  if (!value) return "0 ₫";

  if (typeof value === "number") {
    return formatCurrency(value);
  }

  if (typeof value === "string" && value.includes("~")) {
    const [min, max] = value.split("~");
    return `${formatCurrency(min)} ~ ${formatCurrency(max)}`;
  }

  return formatCurrency(value);
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
    currentPage.value = 0;

    fetchProducts(
      0,
      pageSize.value,
      keyword.value,
      selectedStatus.value,
      selectedOrigin.value,
      selectedMaterial.value,
    );
  });
};

onMounted(() => {
  fetchFilterData();
  fetchProducts();
  setTimeout(() => {
    initSelect2(".select2-xuatxu", "Chọn xuất xứ", selectedOrigin);
    initSelect2(".select2-chatlieu", "Chọn chất liệu", selectedMaterial);
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
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

/* ===== SEARCH ===== */
.search-wrapper {
  position: relative;
  width: 320px;
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
  display: flex;
  justify-content: end;
  margin-right: 20px;
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

.status.selling {
  color: #2ecc71;
  font-weight: 600;
}
.status.upcoming {
  color: #f39c12;
  font-weight: 600;
}
.status.stopped {
  color: #e74c3c;
  font-weight: 600;
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
  background: #6b3f23;
  color: white;
  min-width: 80px;
}

.modal-actions .save-btn:hover {
  background: #6b3f23;
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
  height: 30px;
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
</style>
