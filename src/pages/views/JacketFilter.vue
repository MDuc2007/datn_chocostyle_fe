<template>
  <div class="filter-sidebar">
    <div class="filter-header">
      <h3 class="filter-title">DANH MỤC SẢN PHẨM</h3>
      <button @click="resetFilter" class="btn-reset" :class="{ 'visible': hasActiveFilters }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        XÓA
      </button>
    </div>

    <div class="filter-scroll-area">
      <div class="filter-group" v-if="jacketTypes.length > 0">
        <div class="filter-group-header" @click="toggleGroup('types')">
          <h4>Loại áo</h4>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon" :class="{ open: openGroups.types }"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-content-wrapper" :class="{ 'is-open': openGroups.types }">
          <div class="filter-content">
            <div class="checkbox-list">
              <label v-for="type in jacketTypes" :key="type.value" class="custom-checkbox-label">
                <input type="checkbox" :value="type.value" v-model="filters.types" class="hidden-checkbox" @change="applyFilter">
                <div class="checkbox-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                <span class="checkbox-text">{{ type.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-group" v-if="materials.length > 0">
        <div class="filter-group-header" @click="toggleGroup('materials')">
          <h4>Chất liệu</h4>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon" :class="{ open: openGroups.materials }"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-content-wrapper" :class="{ 'is-open': openGroups.materials }">
          <div class="filter-content">
            <div class="checkbox-list">
              <label v-for="material in materials" :key="material.value" class="custom-checkbox-label">
                <input type="checkbox" :value="material.value" v-model="filters.materials" class="hidden-checkbox" @change="applyFilter">
                <div class="checkbox-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                <span class="checkbox-text">{{ material.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-group" v-if="sizes.length > 0">
        <div class="filter-group-header" @click="toggleGroup('sizes')">
          <h4>Kích cỡ</h4>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon" :class="{ open: openGroups.sizes }"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-content-wrapper" :class="{ 'is-open': openGroups.sizes }">
          <div class="filter-content">
            <div class="size-grid">
              <label v-for="size in sizes" :key="size" class="size-item">
                <input type="checkbox" :value="size" v-model="filters.sizes" class="hidden-checkbox" @change="applyFilter">
                <span class="size-box" :class="{ active: filters.sizes.includes(size) }">{{ size }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-group" v-if="colors.length > 0">
        <div class="filter-group-header" @click="toggleGroup('colors')">
          <h4>Màu sắc</h4>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon" :class="{ open: openGroups.colors }"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-content-wrapper" :class="{ 'is-open': openGroups.colors }">
          <div class="filter-content">
            <div class="color-grid">
              <label v-for="color in colors" :key="color.value" class="color-item" :title="color.label">
                <input type="checkbox" :value="color.value" v-model="filters.colors" class="hidden-checkbox" @change="applyFilter">
                <div class="color-circle" :style="{ backgroundColor: color.hex }" :class="{ active: filters.colors.includes(color.value) }">
                  <svg v-if="filters.colors.includes(color.value)" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-group border-none">
        <div class="filter-group-header" @click="toggleGroup('price')">
          <h4>Giá tiền (VNĐ)</h4>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon" :class="{ open: openGroups.price }"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-content-wrapper" :class="{ 'is-open': openGroups.price }">
          <div class="filter-content">
            <div class="price-inputs">
              <input type="number" v-model.number="filters.minPrice" placeholder="Từ" @input="applyFilter" />
              <span class="price-separator">-</span>
              <input type="number" v-model.number="filters.maxPrice" placeholder="Đến" @input="applyFilter" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits } from 'vue';
import axios from 'axios';

const emit = defineEmits(['on-filter']);

// Trạng thái mở/đóng Accordion
const openGroups = ref({
  price: true,
  types: true,
  materials: true,
  sizes: true,
  colors: true
});

const toggleGroup = (groupName) => {
  openGroups.value[groupName] = !openGroups.value[groupName];
};

// ================= DỮ LIỆU ĐỘNG TỪ DATABASE =================
const jacketTypes = ref([]);
const materials = ref([]);
const sizes = ref([]);
const colors = ref([]);

// Hàm phụ: Map tên màu từ DB sang mã HEX để hiện vòng tròn màu trên UI
const getHexFromColorName = (colorName) => {
  if (!colorName) return '#E5E7EB';
  const name = colorName.toLowerCase();
  if (name.includes('đen')) return '#222222';
  if (name.includes('trắng')) return '#FFFFFF';
  if (name.includes('đỏ')) return '#DC2626';
  if (name.includes('xanh navy') || name.includes('xanh sẫm')) return '#1E3A8A';
  if (name.includes('xanh')) return '#2563EB';
  if (name.includes('nâu')) return '#63391F';
  if (name.includes('xám') || name.includes('ghi')) return '#9CA3AF';
  if (name.includes('vàng')) return '#FBBF24';
  if (name.includes('hồng')) return '#F472B6';
  if (name.includes('cam')) return '#F97316';
  return '#E5E7EB'; // Màu mặc định nếu không khớp
};

// Gọi API lấy toàn bộ chi tiết SP để trích xuất các thuộc tính lọc
const fetchDynamicFilters = async () => {
  try {
    // Gọi API chi tiết sản phẩm với size lớn để quét toàn bộ Data
    const res = await axios.get("http://localhost:8080/api/chi-tiet-san-pham?size=2000");
    const dataList = res.data.content || res.data || [];

    // Sử dụng Set để lọc lấy các giá trị DUY NHẤT (không trùng lặp)
    const uniqueTypes = new Set();
    const uniqueMaterials = new Set();
    const uniqueSizes = new Set();
    const uniqueColorsMap = new Map(); 

    dataList.forEach(item => {
      // 1. Lọc Loại áo (Danh mục)
      if (item.tenLoaiAo) uniqueTypes.add(item.tenLoaiAo);
      if (item.danhMuc?.tenDanhMuc) uniqueTypes.add(item.danhMuc.tenDanhMuc);

      // 2. Lọc Chất liệu
      if (item.tenChatLieu) uniqueMaterials.add(item.tenChatLieu);
      if (item.chatLieu?.tenChatLieu) uniqueMaterials.add(item.chatLieu.tenChatLieu);

      // 3. Lọc Kích cỡ
      if (item.tenKichCo) uniqueSizes.add(item.tenKichCo);
      if (item.kichCo?.tenKichCo) uniqueSizes.add(item.kichCo.tenKichCo);

      // 4. Lọc Màu sắc (Lưu tên + mã HEX)
      const colorName = item.tenMauSac || item.mauSac?.tenMauSac;
      if (colorName && !uniqueColorsMap.has(colorName)) {
        uniqueColorsMap.set(colorName, getHexFromColorName(colorName));
      }
    });

    // Chuyển Set về mảng Object để v-for render ra UI
    jacketTypes.value = Array.from(uniqueTypes).map(val => ({ label: val, value: val }));
    materials.value = Array.from(uniqueMaterials).map(val => ({ label: val, value: val }));
    
    // Sort kích cỡ (Tùy chọn: S, M, L, XL...)
    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    sizes.value = Array.from(uniqueSizes).sort((a, b) => {
      return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
    });

    colors.value = Array.from(uniqueColorsMap, ([name, hex]) => ({
      label: name,
      value: name,
      hex: hex
    }));

  } catch (error) {
    console.error("Lỗi khi tạo bộ lọc động từ Database:", error);
  }
};

// Chạy hàm lấy data khi component được mount
onMounted(() => {
  fetchDynamicFilters();
});

// ================= LOGIC LỌC =================
const filters = ref({
  minPrice: null,
  maxPrice: null,
  types: [],
  materials: [],
  sizes: [],
  colors: []
});

const hasActiveFilters = computed(() => {
  return filters.value.types.length > 0 || 
         filters.value.materials.length > 0 || 
         filters.value.sizes.length > 0 ||
         filters.value.colors.length > 0 ||
         (filters.value.minPrice !== null && filters.value.minPrice !== "") ||
         (filters.value.maxPrice !== null && filters.value.maxPrice !== "");
});

const applyFilter = () => {
  emit('on-filter', { ...filters.value });
};

const resetFilter = () => {
  filters.value = {
    minPrice: null,
    maxPrice: null,
    types: [],
    materials: [],
    sizes: [],
    colors: []
  };
  applyFilter();
};
</script>

<style scoped>
/* Container chính của Sidebar */
.filter-sidebar {
  background-color: #FFFFFF;
  padding: 0;
  font-family: 'Inter', sans-serif;
  width: 100%;
}

/* --- HEADER: Tiêu đề & Nút xóa --- */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  padding-bottom: 20px;
}

.filter-title {
  font-size: 16px;
  font-weight: 800;
  color: #333;
  text-transform: uppercase;
  margin: 0;
}

/* Nút xóa lọc màu cam như ảnh mẫu 1 */
.btn-reset {
  background: #FFF;
  border: 1px solid #f97316; /* Cam */
  color: #f97316;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  pointer-events: none;
  transform: translateX(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-reset.visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.btn-reset:hover {
  background-color: #f97316;
  color: #FFFFFF;
}

.btn-reset svg {
  width: 14px;
  height: 14px;
}

/* --- GROUP BỘ LỌC CHUNG --- */
.filter-group {
  border-bottom: 1px solid #E5E7EB; /* Kẻ viền phân cách mỏng */
}
.filter-group.border-none {
  border-bottom: none;
}

/* Header của mỗi Accordion */
.filter-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 16px 0;
  user-select: none;
}

.filter-group-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

/* Icon mũi tên xuống */
.dropdown-icon {
  width: 16px;
  height: 16px;
  color: #333;
  transition: transform 0.3s ease;
}
.dropdown-icon.open {
  transform: rotate(180deg);
}

/* Nội dung ẩn/hiện mượt mà */
.filter-content-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
}

.filter-content-wrapper.is-open {
  max-height: 400px;
}

.filter-content {
  padding-bottom: 16px;
}

/* --- KHU VỰC NHẬP GIÁ --- */
.price-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}
.price-inputs input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: 0.3s;
}
.price-inputs input:focus {
  border-color: #63391F; /* Nhấn vào đổi viền nâu */
}
.price-separator {
  color: #888;
}

/* --- KHU VỰC CHECKBOX CHUẨN --- */
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.hidden-checkbox { display: none; }
.custom-checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

/* Ô vuông checkbox */
.checkbox-box {
  width: 18px;
  height: 18px;
  border: 2px solid #CCC;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFF;
  transition: 0.2s;
}
.checkbox-box svg { width: 12px; height: 12px; color: #FFF; opacity: 0; transform: scale(0.5); transition: 0.2s; }
.custom-checkbox-label:hover .checkbox-box { border-color: #63391F; }
.hidden-checkbox:checked + .checkbox-box { background-color: #63391F; border-color: #63391F; }
.hidden-checkbox:checked + .checkbox-box svg { opacity: 1; transform: scale(1); }
.checkbox-text { font-size: 14px; color: #555; }
.hidden-checkbox:checked ~ .checkbox-text { color: #63391F; font-weight: 600; }

/* --- KHU VỰC KÍCH CỠ --- */
.size-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.size-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 36px;
  background-color: #F9F9F9;
  border: 1px solid #EEE;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  transition: 0.2s;
}
.size-item:hover .size-box { border-color: #63391F; color: #63391F; }
.size-box.active { background-color: #63391F; color: #FFF; border-color: #63391F; }

/* --- KHU VỰC MÀU SẮC --- */
.color-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.color-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}
.color-circle[style*="background-color: #FFFFFF"] { border: 1px solid #DDD; }
.color-circle[style*="background-color: #FFFFFF"] svg { stroke: #333 !important; }
.color-circle.active { transform: scale(1.1); box-shadow: 0 0 0 2px #FFF, 0 0 0 4px #63391F; }
.color-circle svg { width: 16px; height: 16px; opacity: 0; transform: scale(0.5); transition: 0.2s; }
.hidden-checkbox:checked + .color-circle svg { opacity: 1; transform: scale(1); }
</style>