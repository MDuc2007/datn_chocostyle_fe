<template>
  <div class="filter-sidebar">
    <div class="filter-header">
      <h3 class="filter-title">BỘ LỌC</h3>
      <button
        @click="resetFilter"
        class="btn-reset"
        :class="{ visible: hasActiveFilters }"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
        LÀM MỚI
      </button>
    </div>

    <div class="filter-scroll-area">
      <div class="filter-group">
        <div class="filter-group-header" @click="toggleGroup('price')">
          <h4>Khoảng giá (VNĐ)</h4>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="dropdown-icon"
            :class="{ open: openGroups.price }"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div
          class="filter-content-wrapper"
          :class="{ 'is-open': openGroups.price }"
        >
          <div class="filter-content">
            <div class="price-inputs">
              <div class="input-wrapper">
                <input
                  type="number"
                  v-model.number="filters.minPrice"
                  placeholder="Từ"
                  @input="applyFilter"
                />
                <span class="currency">đ</span>
              </div>
              <span class="price-separator">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </span>
              <div class="input-wrapper">
                <input
                  type="number"
                  v-model.number="filters.maxPrice"
                  placeholder="Đến"
                  @input="applyFilter"
                />
                <span class="currency">đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-group" v-if="jacketTypes.length > 0">
        <div class="filter-group-header" @click="toggleGroup('types')">
          <h4>Loại áo</h4>
          <span class="filter-badge" v-if="filters.types.length > 0">{{
            filters.types.length
          }}</span>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="dropdown-icon"
            :class="{ open: openGroups.types }"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div
          class="filter-content-wrapper"
          :class="{ 'is-open': openGroups.types }"
        >
          <div class="filter-content">
            <div class="checkbox-list">
              <label
                v-for="type in jacketTypes"
                :key="type.value"
                class="custom-checkbox-label"
              >
                <input
                  type="checkbox"
                  :value="type.value"
                  v-model="filters.types"
                  class="hidden-checkbox"
                  @change="() => $nextTick(applyFilter)"
                />
                <div class="checkbox-box">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span class="checkbox-text">{{ type.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-group" v-if="sizes.length > 0">
        <div class="filter-group-header" @click="toggleGroup('sizes')">
          <h4>Kích cỡ</h4>
          <span class="filter-badge" v-if="filters.sizes.length > 0">{{
            filters.sizes.length
          }}</span>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="dropdown-icon"
            :class="{ open: openGroups.sizes }"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div
          class="filter-content-wrapper"
          :class="{ 'is-open': openGroups.sizes }"
        >
          <div class="filter-content">
            <div class="size-grid">
              <label v-for="size in sizes" :key="size" class="size-item">
                <input
                  type="checkbox"
                  :value="String(size)"
                  v-model="filters.sizes"
                  class="hidden-checkbox"
                  @change="() => $nextTick(applyFilter)"
                />
                <span
                  class="size-box"
                  :class="{ active: filters.sizes.includes(String(size)) }"
                  >{{ size }}</span
                >
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-group" v-if="colors.length > 0">
        <div class="filter-group-header" @click="toggleGroup('colors')">
          <h4>Màu sắc</h4>
          <span class="filter-badge" v-if="filters.colors.length > 0">{{
            filters.colors.length
          }}</span>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="dropdown-icon"
            :class="{ open: openGroups.colors }"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div
          class="filter-content-wrapper"
          :class="{ 'is-open': openGroups.colors }"
        >
          <div class="filter-content">
            <div class="color-grid">
              <label
                v-for="color in colors"
                :key="color.value"
                class="color-item"
                :title="color.label"
              >
                <input
                  type="checkbox"
                  :value="String(color.value)"
                  v-model="filters.colors"
                  class="hidden-checkbox"
                  @change="() => $nextTick(applyFilter)"
                />
                <div
                  class="color-circle"
                  :style="{ backgroundColor: color.hex }"
                  :class="{
                    active: filters.colors.includes(String(color.value)),
                  }"
                >
                  <svg
                    v-if="filters.colors.includes(String(color.value))"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-group border-none" v-if="materials.length > 0">
        <div class="filter-group-header" @click="toggleGroup('materials')">
          <h4>Chất liệu</h4>
          <span class="filter-badge" v-if="filters.materials.length > 0">{{
            filters.materials.length
          }}</span>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="dropdown-icon"
            :class="{ open: openGroups.materials }"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div
          class="filter-content-wrapper"
          :class="{ 'is-open': openGroups.materials }"
        >
          <div class="filter-content">
            <div class="checkbox-list">
              <label
                v-for="material in materials"
                :key="material.value"
                class="custom-checkbox-label"
              >
                <input
                  type="checkbox"
                  :value="material.value"
                  v-model="filters.materials"
                  class="hidden-checkbox"
                  @change="() => $nextTick(applyFilter)"
                />
                <div class="checkbox-box">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span class="checkbox-text">{{ material.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits } from "vue";
import axios from "axios";

const emit = defineEmits(["on-filter"]);

const openGroups = ref({
  price: true,
  types: true,
  materials: false,
  sizes: true,
  colors: true,
});

const toggleGroup = (groupName) => {
  openGroups.value[groupName] = !openGroups.value[groupName];
};

const jacketTypes = ref([]);
const materials = ref([]);
const sizes = ref([]);
const colors = ref([]);

// 👉 ĐÃ THÊM LẠI: Hàm backup màu thông minh để chống lỗi xám
const getBackupColorCode = (name) => {
  if (!name) return "#cccccc";
  const n = name.toLowerCase().trim();
  const colorMap = {
    đen: "#222222",
    black: "#222222",
    trắng: "#ffffff",
    white: "#ffffff",
    "trắng sữa": "#fdfff5",
    "trắng kem": "#f5f5dc",
    xám: "#808080",
    gray: "#808080",
    grey: "#808080",
    "xám nhạt": "#d3d3d3",
    "xám đậm": "#555555",
    đỏ: "#dc2626",
    red: "#dc2626",
    "đỏ đô": "#800000",
    "đỏ rượu": "#722f37",
    hồng: "#ffc0cb",
    pink: "#ffc0cb",
    "hồng phấn": "#ffb6c1",
    tím: "#9333ea",
    purple: "#9333ea",
    "tím than": "#191970",
    "tím nhạt": "#e6e6fa",
    "xanh dương": "#2563eb",
    blue: "#2563eb",
    "xanh biển": "#0000ff",
    navy: "#1e3a8a",
    "xanh đen": "#0a1128",
    "xanh ngọc": "#00a86b",
    "xanh coban": "#0047ab",
    "xanh lá": "#10b981",
    green: "#10b981",
    "xanh rêu": "#4a5d23",
    rêu: "#4a5d23",
    vàng: "#eab308",
    yellow: "#eab308",
    "vàng bò": "#d2b48c",
    "vàng kem": "#f0e68c",
    cam: "#f97316",
    orange: "#f97316",
    "cam đất": "#cc7722",
    nâu: "#78350f",
    brown: "#78350f",
    "nâu bò": "#8b4513",
    "nâu tây": "#a0522d",
    be: "#f5f5dc",
    beige: "#f5f5dc",
    kem: "#fffdd0",
  };

  if (colorMap[n]) return colorMap[n];
  for (const [key, value] of Object.entries(colorMap)) {
    if (n.includes(key)) return value;
  }
  return "#cccccc"; // Nếu vẫn không tìm được mới ra màu xám
};

const fetchDynamicFilters = async () => {
  try {
    const res = await axios.get(
      "http://localhost:8080/api/chi-tiet-san-pham?size=2000",
    );
    const dataList = res.data.content || res.data || [];

    const uniqueTypes = new Set();
    const uniqueMaterials = new Set();
    const uniqueSizes = new Set();
    const uniqueColorsMap = new Map();

    dataList.forEach((item) => {
      // 1. Loại áo
      const typeName =
        item.tenLoaiAo || item.loaiAo?.tenLoaiAo || item.danhMuc?.tenDanhMuc;
      if (typeName) uniqueTypes.add(typeName);

      // 2. Chất liệu
      const materialName = item.tenChatLieu || item.chatLieu?.tenChatLieu;
      if (materialName) uniqueMaterials.add(materialName);

      // 3. Kích cỡ
      const sizeName =
        item.tenKichCo ||
        item.kichCo?.tenKichCo ||
        item.kichCoList?.[0] ||
        item.kichCo;
      if (sizeName) uniqueSizes.add(sizeName);

      // 4. Màu sắc
      const colorName =
        item.tenMauSac ||
        item.mauSac?.tenMau ||
        item.mauSac?.tenMauSac ||
        item.mauSacList?.[0]?.tenMauSac;

      // Ưu tiên lấy luôn trường rgb vừa được thêm từ API
      let dbColorCode =
        item.rgb ||
        item.maMau ||
        item.mauSac?.maMau ||
        item.mauSac?.hex ||
        item.mauSac?.rgb ||
        item.mauSacList?.[0]?.maMau;

      // Chuẩn hóa CSS (phòng trường hợp API mất dấu #)
      if (dbColorCode && /^[0-9A-Fa-f]{3,6}$/.test(dbColorCode)) {
        dbColorCode = "#" + dbColorCode;
      }

      // Ưu tiên lấy màu chuẩn từ DB, nếu lỡ DB bị null thì mới dùng màu backup
      const finalColorCode = dbColorCode || getBackupColorCode(colorName);

      if (colorName && !uniqueColorsMap.has(colorName)) {
        uniqueColorsMap.set(colorName, finalColorCode);
      }
    });

    jacketTypes.value = Array.from(uniqueTypes).map((val) => ({
      label: val,
      value: val,
    }));
    materials.value = Array.from(uniqueMaterials).map((val) => ({
      label: val,
      value: val,
    }));

    // Sắp xếp Kích cỡ theo thứ tự chuẩn S M L XL
    const sizeOrder = ["S", "M", "L", "XL", "XXL", "XXXL"];
    sizes.value = Array.from(uniqueSizes).sort((a, b) => {
      let indexA = sizeOrder.indexOf(String(a).trim().toUpperCase());
      let indexB = sizeOrder.indexOf(String(b).trim().toUpperCase());
      if (indexA === -1) indexA = 99;
      if (indexB === -1) indexB = 99;
      return indexA === indexB
        ? String(a).localeCompare(String(b))
        : indexA - indexB;
    });

    // Đẩy dữ liệu Màu sắc ra View
    colors.value = Array.from(uniqueColorsMap, ([name, hex]) => ({
      label: name,
      value: name,
      hex: hex, // hex này lúc này chắc chắn đã có màu xịn (từ DB hoặc từ Backup)
    }));
  } catch (error) {
    console.error("Lỗi khi tạo bộ lọc động từ Database:", error);
  }
};

onMounted(() => {
  fetchDynamicFilters();
});

const filters = ref({
  minPrice: null,
  maxPrice: null,
  types: [],
  materials: [],
  sizes: [],
  colors: [],
});

const hasActiveFilters = computed(() => {
  return (
    filters.value.types.length > 0 ||
    filters.value.materials.length > 0 ||
    filters.value.sizes.length > 0 ||
    filters.value.colors.length > 0 ||
    (filters.value.minPrice !== null && filters.value.minPrice !== "") ||
    (filters.value.maxPrice !== null && filters.value.maxPrice !== "")
  );
});

const applyFilter = () => {
  emit("on-filter", { ...filters.value });
};

const resetFilter = () => {
  filters.value = {
    minPrice: null,
    maxPrice: null,
    types: [],
    materials: [],
    sizes: [],
    colors: [],
  };
  applyFilter();
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Nunito:wght@400;600;700&display=swap");

/* Container chính của Sidebar */
.filter-sidebar {
  background-color: #ffffff;
  font-family: "Nunito", sans-serif;
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

/* --- HEADER: Tiêu đề & Nút xóa --- */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fdfaf9;
  border-bottom: 1px solid rgba(107, 63, 30, 0.1);
}

.filter-title {
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: 1px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-title::before {
  content: "";
  display: block;
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, #6b3f1e, #b88661);
  border-radius: 4px;
}

.btn-reset {
  background: rgba(107, 63, 30, 0.05);
  border: none;
  color: #6b3f1e;
  font-family: "Montserrat", sans-serif;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  pointer-events: none;
  transform: scale(0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-reset.visible {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1);
}

.btn-reset:hover {
  background-color: #6b3f1e;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(107, 63, 30, 0.2);
}

.btn-reset svg {
  width: 12px;
  height: 12px;
}

.filter-scroll-area {
  padding: 0 20px;
}

/* --- GROUP BỘ LỌC CHUNG --- */
.filter-group {
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}
.filter-group.border-none {
  border-bottom: none;
}

.filter-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 20px 0;
  user-select: none;
  transition: color 0.3s;
}
.filter-group-header:hover h4 {
  color: #6b3f1e;
}

.filter-group-header h4 {
  margin: 0;
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-badge {
  background: #6b3f1e;
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  color: #888;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-icon.open {
  transform: rotate(180deg);
  color: #6b3f1e;
}

.filter-content-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.filter-content-wrapper.is-open {
  max-height: 500px;
}
.filter-content {
  padding-bottom: 20px;
  padding-left: 6px;
  padding-right: 6px;
}

/* =========================================================
   KHU VỰC NHẬP GIÁ 
   ========================================================= */
.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}
.input-wrapper {
  position: relative;
  flex: 1;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}

.input-wrapper input {
  width: 75px;
  padding: 10px 24px 10px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: "Nunito", sans-serif;
  font-size: 14px;
  font-weight: 600;
  outline: none;
  background: #f8fafc;
  transition: all 0.3s;
}
.input-wrapper input:focus {
  border-color: #6b3f1e;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(107, 63, 30, 0.1);
}
.currency {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
  font-weight: 700;
}
.price-separator svg {
  width: 12px;
  color: #cbd5e1;
}

/* --- KHU VỰC CHECKBOX CHUẨN --- */
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hidden-checkbox {
  display: none;
}
.custom-checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.checkbox-box {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.checkbox-box svg {
  width: 14px;
  height: 14px;
  color: #fff;
  opacity: 0;
  transform: scale(0.5);
  transition: 0.2s;
}
.custom-checkbox-label:hover .checkbox-box {
  border-color: #6b3f1e;
}
.hidden-checkbox:checked + .checkbox-box {
  background-color: #6b3f1e;
  border-color: #6b3f1e;
  box-shadow: 0 4px 10px rgba(107, 63, 30, 0.2);
}
.hidden-checkbox:checked + .checkbox-box svg {
  opacity: 1;
  transform: scale(1);
}
.checkbox-text {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  transition: color 0.2s;
}
.hidden-checkbox:checked ~ .checkbox-text {
  color: #1a1a1a;
  font-weight: 700;
}

/* --- KHU VỰC KÍCH CỠ --- */
.size-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 4px;
}

.size-item {
  cursor: pointer;
}

.size-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 45px;
  padding: 0 10px;
  height: 38px;
  background-color: #fff;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-family: "Montserrat", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  transition: all 0.2s ease;
}

.size-item:hover .hidden-checkbox:not(:checked) + .size-box {
  border-color: #6b3f1e;
  color: #6b3f1e;
  background-color: #fcf9f7;
}

.hidden-checkbox:checked + .size-box {
  background-color: #6b3f1e !important;
  color: #ffffff !important;
  border-color: #6b3f1e !important;
  box-shadow: 0 4px 10px rgba(107, 63, 30, 0.25);
  transform: translateY(-2px);
}

/* =========================================================
   KHU VỰC MÀU SẮC
   ========================================================= */
.color-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px;
  padding: 6px 4px;
}

.color-item {
  cursor: pointer;
  display: block;
}

.color-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-sizing: border-box;
  flex-shrink: 0;
  position: relative;
}

.color-item:hover .hidden-checkbox:not(:checked) + .color-circle {
  border: 2px solid #6b3f1e;
  padding: 2px;
}

.hidden-checkbox:checked + .color-circle {
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #6b3f1e;
  transform: scale(1.15);
}

.color-circle svg {
  width: 16px;
  height: 16px;
  stroke: #fff;
  opacity: 0;
  transform: scale(0.5);
  transition: 0.2s;
  filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.5));
}

/* Cân nhắc màu nền quá sáng -> dấu tick thành màu đen/sẫm để hiển thị rõ */
.color-circle[style*="background-color: #ffffff"] svg,
.color-circle[style*="background-color: rgb(255, 255, 255)"] svg,
.color-circle[style*="background-color: #f5f5dc"] svg {
  stroke: #334155 !important;
  filter: none;
}

.hidden-checkbox:checked + .color-circle svg {
  opacity: 1;
  transform: scale(1);
}
</style>
