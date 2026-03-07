<template>
  <div class="filter-sidebar">
    <div class="filter-header">
      <h3 class="filter-title">BỘ LỌC</h3>
      <button @click="resetFilter" class="btn-reset" :class="{ 'visible': hasActiveFilters }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon" :class="{ open: openGroups.price }"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-content-wrapper" :class="{ 'is-open': openGroups.price }">
          <div class="filter-content">
            <div class="price-inputs">
              <div class="input-wrapper">
                <input type="number" v-model.number="filters.minPrice" placeholder="Từ" @input="applyFilter" />
                <span class="currency">đ</span>
              </div>
              <span class="price-separator">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </span>
              <div class="input-wrapper">
                <input type="number" v-model.number="filters.maxPrice" placeholder="Đến" @input="applyFilter" />
                <span class="currency">đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-group" v-if="jacketTypes.length > 0">
        <div class="filter-group-header" @click="toggleGroup('types')">
          <h4>Loại áo</h4>
          <span class="filter-badge" v-if="filters.types.length > 0">{{ filters.types.length }}</span>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon" :class="{ open: openGroups.types }"><polyline points="6 9 12 15 18 9"></polyline></svg>
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

      <div class="filter-group" v-if="sizes.length > 0">
        <div class="filter-group-header" @click="toggleGroup('sizes')">
          <h4>Kích cỡ</h4>
          <span class="filter-badge" v-if="filters.sizes.length > 0">{{ filters.sizes.length }}</span>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon" :class="{ open: openGroups.sizes }"><polyline points="6 9 12 15 18 9"></polyline></svg>
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
          <span class="filter-badge" v-if="filters.colors.length > 0">{{ filters.colors.length }}</span>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon" :class="{ open: openGroups.colors }"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-content-wrapper" :class="{ 'is-open': openGroups.colors }">
          <div class="filter-content">
            <div class="color-grid">
              <label v-for="color in colors" :key="color.value" class="color-item" :title="color.label">
                <input type="checkbox" :value="color.value" v-model="filters.colors" class="hidden-checkbox" @change="applyFilter">
                <div class="color-circle" :style="{ backgroundColor: color.hex }" :class="{ active: filters.colors.includes(color.value) }">
                  <svg v-if="filters.colors.includes(color.value)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-group border-none" v-if="materials.length > 0">
        <div class="filter-group-header" @click="toggleGroup('materials')">
          <h4>Chất liệu</h4>
          <span class="filter-badge" v-if="filters.materials.length > 0">{{ filters.materials.length }}</span>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon" :class="{ open: openGroups.materials }"><polyline points="6 9 12 15 18 9"></polyline></svg>
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

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits } from 'vue';
import axios from 'axios';

const emit = defineEmits(['on-filter']);

const openGroups = ref({
  price: true,
  types: true,
  materials: false, 
  sizes: true,
  colors: true
});

const toggleGroup = (groupName) => {
  openGroups.value[groupName] = !openGroups.value[groupName];
};

const jacketTypes = ref([]);
const materials = ref([]);
const sizes = ref([]);
const colors = ref([]);

const getHexFromColorName = (colorName) => {
  if (!colorName) return '#E5E7EB';
  const name = colorName.toLowerCase();
  if (name.includes('đen')) return '#222222';
  if (name.includes('trắng')) return '#FFFFFF';
  if (name.includes('đỏ')) return '#DC2626';
  if (name.includes('xanh navy') || name.includes('xanh sẫm')) return '#1E3A8A';
  if (name.includes('xanh')) return '#2563EB';
  if (name.includes('nâu')) return '#6b3f1e';
  if (name.includes('xám') || name.includes('ghi')) return '#9CA3AF';
  if (name.includes('vàng')) return '#FBBF24';
  if (name.includes('hồng')) return '#F472B6';
  if (name.includes('cam')) return '#F97316';
  if (name.includes('rêu')) return '#4B5320';
  if (name.includes('be')) return '#F5F5DC';
  return '#E5E7EB'; 
};

const fetchDynamicFilters = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/chi-tiet-san-pham?size=2000");
    const dataList = res.data.content || res.data || [];

    const uniqueTypes = new Set();
    const uniqueMaterials = new Set();
    const uniqueSizes = new Set();
    const uniqueColorsMap = new Map(); 

    dataList.forEach(item => {
      if (item.tenLoaiAo) uniqueTypes.add(item.tenLoaiAo);
      if (item.danhMuc?.tenDanhMuc) uniqueTypes.add(item.danhMuc.tenDanhMuc);

      if (item.tenChatLieu) uniqueMaterials.add(item.tenChatLieu);
      if (item.chatLieu?.tenChatLieu) uniqueMaterials.add(item.chatLieu.tenChatLieu);

      if (item.tenKichCo) uniqueSizes.add(item.tenKichCo);
      if (item.kichCo?.tenKichCo) uniqueSizes.add(item.kichCo.tenKichCo);

      const colorName = item.tenMauSac || item.mauSac?.tenMauSac;
      if (colorName && !uniqueColorsMap.has(colorName)) {
        uniqueColorsMap.set(colorName, getHexFromColorName(colorName));
      }
    });

    jacketTypes.value = Array.from(uniqueTypes).map(val => ({ label: val, value: val }));
    materials.value = Array.from(uniqueMaterials).map(val => ({ label: val, value: val }));
    
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

onMounted(() => {
  fetchDynamicFilters();
});

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
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Nunito:wght@400;600;700&display=swap');

/* Container chính của Sidebar */
.filter-sidebar {
  background-color: #FFFFFF;
  font-family: 'Nunito', sans-serif;
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
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
  font-family: 'Montserrat', sans-serif;
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
  content: '';
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
  font-family: 'Montserrat', sans-serif;
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
  color: #FFFFFF;
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
  border-bottom: 1px dashed rgba(0,0,0,0.08); 
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
  font-family: 'Montserrat', sans-serif;
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
}

/* =========================================================
   KHU VỰC NHẬP GIÁ - ĐÃ ĐƯỢC CHỈNH SỬA ĐỂ KHÔNG BỊ ÉP CHỮ
   ========================================================= */
.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px; /* Giảm khoảng cách giữa 2 ô để input có thêm diện tích */
}
.input-wrapper {
  position: relative;
  flex: 1;
}

/* Ẩn mũi tên lên xuống của thẻ input number trên các trình duyệt */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] {
  -moz-appearance: textfield;
}

.input-wrapper input {
  width: 75px;
  /* Giảm padding trái/phải để chữ có không gian rộng hơn */
  padding: 10px 24px 10px 8px; 
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'Nunito', sans-serif;
  font-size: 14px; /* Chữ to lên xíu dễ nhìn */
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
  right: 8px; /* Đẩy sát chữ 'đ' ra lề phải để nhường chỗ cho số */
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
  font-weight: 700;
}
.price-separator svg {
  width: 12px; /* Thu nhỏ gạch ngang ở giữa */
  color: #cbd5e1;
}

/* --- KHU VỰC CHECKBOX CHUẨN --- */
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hidden-checkbox { display: none; }
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
  background-color: #FFF;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.checkbox-box svg { width: 14px; height: 14px; color: #FFF; opacity: 0; transform: scale(0.5); transition: 0.2s; }
.custom-checkbox-label:hover .checkbox-box { border-color: #6b3f1e; }
.hidden-checkbox:checked + .checkbox-box { background-color: #6b3f1e; border-color: #6b3f1e; box-shadow: 0 4px 10px rgba(107, 63, 30, 0.2); }
.hidden-checkbox:checked + .checkbox-box svg { opacity: 1; transform: scale(1); }
.checkbox-text { font-size: 14px; font-weight: 600; color: #475569; transition: color 0.2s; }
.hidden-checkbox:checked ~ .checkbox-text { color: #1a1a1a; font-weight: 700; }

/* --- KHU VỰC KÍCH CỠ --- */
.size-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.size-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 45px;
  padding: 0 10px;
  height: 38px;
  background-color: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.size-item:hover .size-box { border-color: #6b3f1e; color: #6b3f1e; }
.size-box.active { background-color: #6b3f1e; color: #FFF; border-color: #6b3f1e; box-shadow: 0 4px 12px rgba(107, 63, 30, 0.25); transform: translateY(-2px); }

/* --- KHU VỰC MÀU SẮC --- */
.color-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.color-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}
.color-circle[style*="background-color: #FFFFFF"],
.color-circle[style*="background-color: rgb(255, 255, 255)"] { 
  border: 1px solid #cbd5e1; 
}
.color-circle[style*="background-color: #FFFFFF"] svg,
.color-circle[style*="background-color: rgb(255, 255, 255)"] svg { 
  stroke: #333 !important; 
}
.color-circle:hover {
  transform: scale(1.1);
}
.color-circle.active { 
  transform: scale(1.15); 
  box-shadow: 0 0 0 2px #FFF, 0 0 0 4px #6b3f1e; 
}
.color-circle svg { width: 16px; height: 16px; stroke: #fff; opacity: 0; transform: scale(0.5); transition: 0.2s; }
.hidden-checkbox:checked + .color-circle svg { opacity: 1; transform: scale(1); }
</style>