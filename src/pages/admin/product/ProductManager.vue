<template>
  <div class="product-page">
    <h2 class="title">QUẢN LÝ SẢN PHẨM</h2>

    <div class="top-bar">
      <div class="search-wrapper">
        <img src="/src/assets/icon/search.svg" class="search-icon" alt="icon" />
        <input
          type="text"
          class="search-input"
          placeholder="Tìm kiếm sản phẩm"
        />
      </div>
      <div class="filters">
        <select>
          <option>Xuất xứ</option>
        </select>

        <select>
          <option>Chất liệu</option>
        </select>

        <select>
          <option>Chọn trạng thái</option>
          <option>Đang bán</option>
          <option>Hết hàng</option>
        </select>
      </div>

      <div class="add-btn">
        <router-link to="/admin/product/create">
          <button><span>＋</span> Thêm sản phẩm</button>
        </router-link>
      </div>
    </div>

    <table class="product-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>ID</th>
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
          <td>{{ index + 1 }}</td>
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.origin }}</td>
          <td>{{ item.material }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.price.toLocaleString() }}</td>
          <td>
            <img :src="item.image" />
          </td>
          <td>
            <span
              class="status"
              :class="item.status === 'Đang bán' ? 'selling' : 'out'"
            >
              {{ item.status }}
            </span>
          </td>
          <td class="action">👁️</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="pagination">
    <button>Previous</button>
    <button class="active">1</button>
    <button>Next</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const products = ref([]);

const fetchProducts = async () => {
  const res = await axios.get("http://localhost:8080/api/san-pham");

  products.value = res.data.map((item) => ({
    id: item.maSp,
    name: item.tenSp,
    origin: item.tenXuatXu,
    material: item.tenChatLieu,
    quantity: 0,
    price: 0,
    status: item.trangThai === 1 ? "Đang bán" : "Hết hàng",
    image: item.hinhAnhUrls?.[0] || "https://via.placeholder.com/50x60",
  }));
};

onMounted(fetchProducts);
</script>

<style scoped>
.product-page {
  background: #fff;
  padding: 20px;
  font-size: 14px;
}

.title {
  color: #63391f;
  margin-bottom: 15px;
}

/* TOP BAR */
.top-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.filters select {
  margin-right: 8px;
  padding: 6px 10px;
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
  gap: 6px;
}

.pagination button {
  padding: 4px 10px;
  border: 1px solid #ccc;
  background: #fff;
}

.pagination .active {
  background: #63391f;
  color: #fff;
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
</style>
