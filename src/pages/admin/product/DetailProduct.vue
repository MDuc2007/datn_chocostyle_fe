<template>
  <div class="header">
    <h2 class="title">Danh sách biến thể sản phẩm {{ tenSanPham }}</h2>

    <div class="top-bar">
      <!-- SEARCH -->
      <div class="search-wrapper">
        <img src="/src/assets/icon/search.svg" class="search-icon" />
        <input
          class="search-input"
          placeholder="Tìm biến thể theo tên"
          v-model="keyword"
        />
      </div>

      <!-- FILTERS -->
      <div class="filters">
        <div class="filter-item">
          <label>Màu sắc:</label>
          <select v-model="selectedMauSacList">
            <option value="">Tất cả</option>
            <option v-for="item in mauSacList" :key="item.id" :value="item.id">
              {{ item.tenMauSac }}
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label>Kích cỡ:</label>
          <select v-model="selectedKichCoList">
            <option value="">Tất cả</option>
            <option v-for="item in kichCoList" :key="item.id" :value="item.id">
              {{ item.tenKichCo }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <div class="product-page">
    <table class="product-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Ảnh</th>
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
        <tr v-for="(item, index) in filteredVariants" :key="index">
          <td>{{ index + 1 }}</td>
          <td>
            <img
              v-if="item.hinhAnhUrls?.length"
              :src="item.hinhAnhUrls[0]"
              class="variant-img"
            />
          </td>
          <td>{{ item.maChiTietSanPham }}</td>
          <td>
            <span v-for="(kc, i) in item.kichCoList" :key="i">
              {{ kc }}<span v-if="i < item.kichCoList.length - 1">, </span>
            </span>
          </td>
          <td>
            <span v-for="(mau, i) in item.mauSacList" :key="i">
              {{ mau.tenMauSac
              }}<span v-if="i < item.mauSacList.length - 1">, </span>
            </span>
          </td>
          <td>{{ item.soLuongTon }}</td>
          <td>{{ formatCurrency(item.giaNhap) }}</td>
          <td>{{ formatCurrency(item.giaBan) }}</td>
          <td>
            <span
              class="status"
              :class="item.trangThai === 1 ? 'selling' : 'out'"
            >
              {{ item.trangThai === 1 ? "Đang bán" : "Ngừng bán" }}
            </span>
          </td>
          <td class="action">
            <span class="icon edit" @click="goToUpdate(item.id)"
              ><img
                src="/src/assets/icon/edit.svg"
                alt=""
                style="width: 20px; height: 20px"
            /></span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const router = useRouter();
const route = useRoute();

const mauSacList = ref([]);
const kichCoList = ref([]);

const selectedMauSacList = ref("");
const selectedKichCoList = ref("");

const fetchMauSac = async () => {
  const res = await axios.get("http://localhost:8080/api/mau-sac");
  mauSacList.value = res.data;
};

const fetchKichCo = async () => {
  const res = await axios.get("http://localhost:8080/api/kich-co");
  kichCoList.value = res.data;
};

const productId = route.params.id;

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

const fetchVariants = async () => {
  const res = await axios.get(
    `http://localhost:8080/api/san-pham/${productId}`,
  );

  tenSanPham.value = res.data.tenSanPham;
  variants.value = res.data.bienTheList;
};

const filteredVariants = computed(() => {
  if (!keyword.value) return variants.value;
  return variants.value.filter((v) =>
    v.maChiTietSanPham.toLowerCase().includes(keyword.value.toLowerCase()),
  );
});

onMounted(() => {
  fetchVariants();
  fetchMauSac();
  fetchKichCo();
});
</script>

<style scoped>
.product-page {
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

.header {
  margin-bottom: 10px;
  background: #fff;
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

/* TOP BAR */
.top-bar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 100px;
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

/* STATUS */
.status.selling {
  color: green;
  font-weight: 600;
}

.status.out {
  color: red;
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

.pagination button:hover:not(:disabled) {
  background: #f0f0f0;
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
.variant-img {
  width: 45px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

/* FILTER GROUP */
.filters {
  display: flex;
  align-items: center;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-item label {
  font-weight: 500;
  white-space: nowrap;
}

.filter-item select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}
</style>
