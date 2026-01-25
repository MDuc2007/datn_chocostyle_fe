<template>
  <div class="header">
    <h2 class="title">QUẢN LÝ SẢN PHẨM</h2>
    <div class="top-bar">
      <div class="search-wrapper">
        <img src="/src/assets/icon/search.svg" class="search-icon" alt="icon" />
        <input
          type="text"
          class="search-input"
          placeholder="Tìm kiếm sản phẩm theo tên"
          v-model="keyword"
          @input="handleSearch"
          style="border: 1px solid #d6c3b4"
        />
      </div>
      <div
        class="filters"
        style="display: flex; align-items: center; gap: 10px"
      >
        <label for="">Xuất xứ:</label>
        <select
          v-model="selectedOrigin"
          @change="handleOriginChange"
          style="padding: 10px; border: 1px solid #d6c3b4; border-radius: 6px"
        >
          <option value="">Tất cả</option>
          <option v-for="item in originList" :key="item.id" :value="item.id">
            {{ item.tenXuatXu }}
          </option>
        </select>

        <label for="">Chất liệu:</label>
        <select
          v-model="selectedMaterial"
          @change="handleMaterialChange"
          style="padding: 10px; border: 1px solid #d6c3b4; border-radius: 6px"
        >
          <option value="">Tất cả</option>
          <option v-for="item in materialList" :key="item.id" :value="item.id">
            {{ item.tenChatLieu }}
          </option>
        </select>

        <label for="">Trạng thái:</label>
        <select
          v-model="selectedStatus"
          @change="handleFilterChange"
          style="padding: 10px; border: 1px solid #d6c3b4; border-radius: 6px"
        >
          <option value="">Tất cả</option>
          <option value="1">Đang bán</option>
          <option value="0">Hết hàng</option>
          <option value="2">Ngừng bán</option>
        </select>
      </div>

      <div class="add-btn">
        <router-link to="/admin/product/create">
          <button
            style="
              padding: 10px 16px;
              border-radius: 6px;
              border: 0;
              cursor: pointer;
              background-color: #63391f;
              color: white;
            "
          >
            <span>＋</span> Thêm sản phẩm
          </button>
        </router-link>
      </div>
    </div>
  </div>
  <div class="product-page">
    <div class="table-wrapper">
      <table class="product-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã sản phẩm</th>
            <th>Tên sản phẩm</th>
            <th>Xuất xứ</th>
            <th>Chất liệu</th>
            <th>Số lượng</th>
            <th>Giá (VND)</th>
            <th>Hình ảnh</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in products" :key="item.id">
            <td>{{ currentPage * pageSize + index + 1 }}</td>
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
              <img :src="item.image" />
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
              <span class="icon view" @click="goToDetail(item.id)">
                <img
                  src="/src/assets/icon/eye.svg"
                  alt=""
                  style="width: 20px; height: 20px"
                />
              </span>
              <span class="icon edit" @click="goToUpdate(item.id)"
                ><img
                  src="/src/assets/icon/edit.svg"
                  alt=""
                  style="width: 20px; height: 20px"
              /></span>
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="item.trangThai === 1"
                  @change="toggleStatus(item)"
                />
                <span class="slider"></span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button @click="previousPage" :disabled="currentPage === 0">
        <img src="/src/assets/icon/arrowRight.svg" alt="" />
      </button>
      <div class="page-numbers">
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
      </div>
      <button @click="nextPage" :disabled="currentPage === totalPages - 1">
        <img src="/src/assets/icon/arrowLeft.svg" alt="" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

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

const goToDetail = (id) => {
  router.push(`/admin/product/${id}/details`);
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
    if (originId) params.idXuatXu = originId;
    if (materialId) params.idChatLieu = materialId;

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

onMounted(() => {
  fetchFilterData();
  fetchProducts();
});
</script>

<style scoped>
.product-page {
  background: #fff;
  padding: 20px;
  font-size: 14px;
  margin-top: 10px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em,
    rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em,
    rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset;
  border-radius: 6px;
}

.header {
  margin-bottom: 10px;
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em,
    rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em,
    rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset;
  border-radius: 6px;
}

.title {
  color: #63391f;
  margin-bottom: 15px;
  margin: 15px;
}

/* TOP BAR */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.filters select {
  margin-right: 8px;
  padding: 6px 10px;
}

.add-btn {
  position: relative;
  margin: 15px;
}

.add-btn button {
  background: #fff;
  border: 1px solid #ccc;
  padding: 6px 12px;
  cursor: pointer;
}

/* SUMMARY */
.summary {
  margin: 10px 0;
  display: flex;
  gap: 20px;
}

/* TABLE */
.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th {
  background: #63391f;
  color: #fff;
  padding: 8px;
}

.product-table td {
  border-bottom: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.product-table img {
  width: 40px;
  height: auto;
}

/* ĐANG BÁN */
.status.selling {
  color: #63391f; /* xanh */
  font-weight: 600;
}

/* HẾT HÀNG */
.status.out {
  color: #e74c3c; /* đỏ */
  font-weight: 600;
}

/* NGỪNG BÁN */
.status.stopped {
  color: #7f8c8d; /* xám */
  font-weight: 600;
}

/* PAGINATION */
.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #333;
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
/* Switch Toggle */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e74c3c; /* red for locked */
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #6b3a2b; /* brown for unlocked */
}

input:checked + .slider:before {
  transform: translateX(26px);
}
/* ACTION COLUMN */
.action {
  display: flex;
  align-items: center; /* căn giữa theo chiều dọc */
  justify-content: center; /* căn giữa theo chiều ngang */
  gap: 10px; /* khoảng cách giữa icon và switch */
  height: 60px;
}

/* ICONS */
.action .icon {
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.product-page {
  height: calc(100vh - 200px); /* trừ header + filter */
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
}

.product-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
}
.table-wrapper::-webkit-scrollbar {
  width: 6px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f5f5f5;
}
.page-numbers {
  display: flex;
  gap: 6px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  width: 40px;
  height: 40px;
}

.page-btn:hover:not(.active):not(:disabled) {
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
  background: transparent;
  border: none;
  cursor: default;
}
</style>
