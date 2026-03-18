<template>
  <div class="app-container">
    <Header></Header>

    <main class="main-content">
      <section class="sub-banner sale-banner">
        <div class="banner-text">
          <h1>MÙA SALE LỚN NHẤT NĂM</h1>
          <p>Săn ngay áo khoác hàng hiệu với mức giá giảm cực sốc.</p>
        </div>
      </section>

      <div class="breadcrumb-container">
        <div class="breadcrumb">
          <span class="home-link" @click="$router.push('/')">Trang chủ</span>
          <span class="separator">/</span>
          <span class="current">Ưu đãi</span>
        </div>
      </div>

      <section class="section shop-layout">

        <aside class="sidebar-wrapper">
          <JacketFilter @on-filter="handleAdvancedFilter" />
        </aside>

        <div class="main-product-area">

          <div class="toolbar">
            <div class="search-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" v-model="searchKeyword" @input="applyFilters" placeholder="Tìm áo khoác đang sale..."
                class="search-input" />
              <button v-if="searchKeyword" @click="clearSearch" class="clear-btn">✕</button>
            </div>

            <div class="toolbar-right">
              <div class="sort-box">
                <span class="toolbar-icon ms-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </span>
                <span class="sort-label">Sắp xếp:</span>
                <select v-model="selectedSort" @change="applyFilters" class="sort-select">
                  <option value="bestSale">Giảm nhiều nhất</option>
                  <option value="priceAsc">Giá thấp đến cao</option>
                  <option value="priceDesc">Giá cao đến thấp</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Đang tải dữ liệu khuyến mãi...</p>
          </div>

          <div v-else-if="errorMsg" class="error-state">  
            <p>{{ errorMsg }}</p>
            <button @click="fetchFilteredData" class="btn-retry">Thử lại</button>
          </div>

          <div v-else>
            <div v-if="filteredProducts.length > 0">
              <div class="product-grid">
                <transition-group name="list">
                  <div v-for="sp in displayedProducts" :key="sp.id" class="product-card">

                    <div class="image-box" @click="goDetail(sp.id)">
                      <img :src="sp.hinhAnh" :alt="sp.tenSp" @error="handleImageError" />
                      <span class="badge badge-sale">-{{ getDiscountPercent(sp) }}%</span>
                    </div>

                    <div class="product-info">
                      <h3 class="product-name" @click="goDetail(sp.id)" :title="sp.tenSp">{{ sp.tenSp }}</h3>

                      <div class="price-container">
                        <p class="old-price">
                          {{ formatPrice(getOldPrice(sp)) }}
                        </p>
                        <p class="price new-price">
                          <span v-if="sp.giaMin === sp.giaMax">
                            {{ formatPrice(sp.giaMin) }}
                          </span>
                          <span v-else>
                            {{ formatPrice(sp.giaMin) }} ~ {{ formatPrice(sp.giaMax) }}
                          </span>
                        </p>
                      </div>

                      <button class="btn-quick-add" @click.stop="openQuickAddModal(sp)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cart-icon">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Thêm nhanh
                      </button>
                    </div>
                  </div>
                </transition-group>
              </div>

              <div v-if="hasMore" class="load-more-container">
                <button class="btn-load-more" @click="loadMoreProducts">
                  Xem thêm (Còn {{ remainingCount }} ưu đãi)
                </button>
              </div>
            </div>

            <div v-else class="empty-state">
              <p>Không tìm thấy ưu đãi nào phù hợp với bộ lọc.</p>
              <button @click="clearSearch" class="btn-retry">Xóa tìm kiếm</button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Footer></Footer>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="isQuickAddModalOpen" class="modal-overlay" @click.self="closeQuickAddModal">
        <div class="quick-add-modal">
          <button class="close-btn" @click="closeQuickAddModal">×</button>

          <div class="modal-content" v-if="selectedProduct">
            <div class="modal-left">
              <img :src="currentVariant?.hinhAnhUrls?.[0] || currentVariant?.hinhAnh || selectedProduct.hinhAnh" :alt="selectedProduct.tenSp" @error="handleImageError" />
            </div>

            <div class="modal-right">
              <h3 class="modal-product-name">{{ selectedProduct.tenSp }}</h3>

              <div class="modal-price-container">
                <template v-if="currentVariant">
                  <span v-if="(selectedProduct?.phanTramGiam > 0) || (currentVariant.phanTramGiam > 0)" class="modal-old-price">
                    {{ formatPrice(currentVariant.giaGoc || currentVariant.giaBan || currentVariant.gia) }}
                  </span>
                  <span class="modal-current-price">
                    {{ formatPrice(currentVariantDiscountedPrice) }}
                  </span>
                </template>
                <template v-else>
                  <template v-if="selectedProduct.phanTramGiam > 0">
                    <span class="modal-old-price">
                      <span v-if="selectedProduct.giaMin === selectedProduct.giaMax">{{ formatPrice(selectedProduct.giaMin) }}</span>
                      <span v-else>{{ formatPrice(selectedProduct.giaMin) }} ~ {{ formatPrice(selectedProduct.giaMax) }}</span>
                    </span>
                    <span class="modal-current-price">
                      <span v-if="selectedProduct.giaMinSauGiam === selectedProduct.giaMaxSauGiam">{{ formatPrice(selectedProduct.giaMinSauGiam) }}</span>
                      <span v-else>{{ formatPrice(selectedProduct.giaMinSauGiam) }} ~ {{ formatPrice(selectedProduct.giaMaxSauGiam) }}</span>
                    </span>
                  </template>
                  <template v-else>
                    <span class="modal-current-price">
                      <span v-if="selectedProduct.giaMin === selectedProduct.giaMax">{{ formatPrice(selectedProduct.giaMin) }}</span>
                      <span v-else>{{ formatPrice(selectedProduct.giaMin) }} ~ {{ formatPrice(selectedProduct.giaMax) }}</span>
                    </span>
                  </template>
                </template>
              </div>

              <div class="attribute-group" v-if="availableColors.length > 0">
                <label>Màu sắc: <span class="selected-val">{{ selectedColor || 'Chưa chọn' }}</span></label>
                <div class="color-options">
                  <button v-for="color in availableColors" :key="color" 
                    class="color-circle" 
                    :class="{ active: selectedColor === color }"
                    :style="{ backgroundColor: getColorCode(color) }"
                    @click="selectedColor = color"
                    :title="color"
                  ></button>
                </div>
              </div>

              <div class="attribute-group" v-if="availableSizes.length > 0">
                <label>Kích cỡ: <span class="selected-val">{{ selectedSize || 'Chưa chọn' }}</span></label>
                <div class="size-options">
                  <button v-for="size in availableSizes" :key="size" 
                    class="size-btn"
                    :class="{ active: selectedSize === size }"
                    @click="selectedSize = size">{{ size }}</button>
                </div>
              </div>

              <div class="attribute-group">
                <label>Số lượng: <span v-if="currentVariant" class="stock-info">(Kho: {{ currentVariant.soLuongTon ?? currentVariant.soLuong ?? 0 }})</span></label>
                <div class="quantity-control">
                  <button @click="quantity > 1 && quantity--">-</button>
                  <input type="number" v-model="quantity" min="1" readonly />
                  <button @click="quantity++">+</button>
                </div>
              </div>

              <div class="modal-actions">
                <button class="btn-confirm-add" @click="confirmAddToCart">Xác nhận Thêm</button>
                <button class="btn-view-detail" @click="goDetail(selectedProduct.id)">Xem chi tiết</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import axios from "axios";
import { useRouter } from "vue-router";
import JacketFilter from "./JacketFilter.vue";

const router = useRouter();

// --- Trạng thái Data ---
const filteredProducts = ref([]);
const isLoading = ref(true);
const errorMsg = ref("");

// --- Trạng thái Lọc & Sắp xếp ---
const searchKeyword = ref("");
const selectedSort = ref("bestSale"); 
const advancedFilters = ref({ minPrice: null, maxPrice: null, types: [], materials: [], sizes: [], colors: [] });

// --- Phân trang Backend ---
const currentPage = ref(0);
const itemsPerPage = 12;
const totalPages = ref(1);

// --- Phân trang Frontend ---
const visibleCount = ref(itemsPerPage);
const displayedProducts = computed(() => filteredProducts.value.slice(0, visibleCount.value));
const hasMore = computed(() => visibleCount.value < filteredProducts.value.length);
const remainingCount = computed(() => filteredProducts.value.length - visibleCount.value);
const loadMoreProducts = () => { visibleCount.value += itemsPerPage; };

// --- Toast ---
const toast = ref({ show: false, message: "", type: "success" });
const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 3000);
};

// --- Helper ---
const formatPrice = (v) => v == null ? "0 đ" : new Intl.NumberFormat("vi-VN").format(v) + " đ";
const handleImageError = (e) => e.target.src = "/src/assets/logo/no-image-placeholder.png";

// HÀM TÍNH GIÁ ĐÃ GIẢM DÙNG CHO MODAL
const getDiscountedPrice = (price, discountPercent) => {
  if (!discountPercent || discountPercent <= 0) return price;
  return price - (price * discountPercent) / 100;
};

// HÀM LẤY MÃ MÀU CHUẨN ĐỒNG BỘ CÁC TRANG
const getColorCode = (name) => {
  if (!name) return '#ddd';
  const n = name.toLowerCase().trim();
  const colorMap = {
    'đen': '#000000',
    'trắng': '#ffffff',
    'đỏ': '#dc2626',
    'xanh dương': '#2563eb',
    'xanh lá': '#10b981',
    'vàng': '#eab308',
    'tím': '#9333ea',
    'hồng': '#db2777',
    'cam': '#f97316',
    'xám': '#64748b',
    'nâu': '#78350f',
    'be': '#f5f5dc',
    'navy': '#1e3a8a'
  };
  return colorMap[n] || '#cccccc'; 
};

// HÀM CHUYỂN TRANG BẰNG ID
const goDetail = (id) => {
  if (!id) {
    console.error("Lỗi: Không tìm thấy ID sản phẩm để chuyển trang!");
    return;
  }
  router.push(`/home/product/${id}`);
};

// LẤY DỮ LIỆU SALE THẬT TỪ BACKEND
const getDiscountPercent = (sp) => {
  return sp.phanTramGiam || 0;
};

const getOldPrice = (sp) => {
  return sp.giaGoc || sp.giaMin;
};

const clearSearch = () => {
  searchKeyword.value = "";
  currentPage.value = 0;
  fetchFilteredData();
};

const handleAdvancedFilter = (filters) => {
  advancedFilters.value = filters;
  currentPage.value = 0;
  fetchFilteredData();
};

const applyFilters = () => {
  currentPage.value = 0;
  fetchFilteredData();
}

// ================= LOGIC GỌI API TỪ BACKEND =================
const fetchFilteredData = async (isAppend = false) => {
  isLoading.value = true;
  errorMsg.value = "";

  try {
    let url = `http://localhost:8080/api/chi-tiet-san-pham?page=${currentPage.value}&size=100`;

    if (searchKeyword.value.trim()) {
      url += `&keyword=${encodeURIComponent(searchKeyword.value.trim())}`;
    }

    const adv = advancedFilters.value;
    if (adv.minPrice !== null && adv.minPrice !== "") url += `&minPrice=${adv.minPrice}`;
    if (adv.maxPrice !== null && adv.maxPrice !== "") url += `&maxPrice=${adv.maxPrice}`;

    const res = await axios.get(url);
    const data = res.data;

    // GOM NHÓM SẢN PHẨM TRÙNG
    const rawData = data.content || [];
    const uniqueProductsMap = new Map();

    rawData.forEach(item => {
      let passFilter = true;
      if (adv.types.length > 0 && !adv.types.includes(item.tenLoaiAo)) passFilter = false;
      if (adv.sizes.length > 0 && !adv.sizes.includes(item.tenKichCo)) passFilter = false;
      if (adv.colors.length > 0 && !adv.colors.includes(item.tenMauSac)) passFilter = false;

      if (passFilter) {
        // 👉 CHỈ LẤY SẢN PHẨM CÓ KHUYẾN MÃI
        const percent = item.phanTramGiam || 0;

        if (percent > 0) {
          if (!uniqueProductsMap.has(item.maSanPham)) {
            let realProductId = item.sanPham?.id || item.id;
            if (item.maSanPham && item.maSanPham.startsWith('SP')) {
              realProductId = parseInt(item.maSanPham.replace('SP', ''), 10);
            }

            uniqueProductsMap.set(item.maSanPham, {
              id: realProductId,
              maSanPham: item.maSanPham,
              tenSp: item.tenSanPham,
              hinhAnh: (item.hinhAnh && item.hinhAnh.length > 0) ? item.hinhAnh[0] : null,
              giaMin: item.giaSauGiam || item.giaBan,
              giaMax: item.giaSauGiam || item.giaBan,
              giaGoc: item.giaGoc || item.giaBan,
              phanTramGiam: percent,
              ngayTao: item.ngayTao
            });
          } else {
            const existing = uniqueProductsMap.get(item.maSanPham);
            const currentGia = item.giaSauGiam || item.giaBan;
            if (currentGia < existing.giaMin) existing.giaMin = currentGia;
            if (currentGia > existing.giaMax) existing.giaMax = currentGia;

            if (percent > existing.phanTramGiam) {
              existing.phanTramGiam = percent;
            }
          }
        }
      }
    });

    let uniqueProducts = Array.from(uniqueProductsMap.values());
    uniqueProducts = uniqueProducts.slice(0, 30);

    if (selectedSort.value === "priceAsc") uniqueProducts.sort((a, b) => a.giaMin - b.giaMin);
    else if (selectedSort.value === "priceDesc") uniqueProducts.sort((a, b) => b.giaMin - a.giaMin);
    else if (selectedSort.value === "bestSale") {
      uniqueProducts.sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
    }
    else uniqueProducts.sort((a, b) => b.id - a.id); // newest

    if (isAppend) {
      filteredProducts.value = [...filteredProducts.value, ...uniqueProducts];
    } else {
      filteredProducts.value = uniqueProducts;
    }

    visibleCount.value = itemsPerPage;
    totalPages.value = data.totalPages || 1;

  } catch (error) {
    console.error("Lỗi lấy dữ liệu:", error);
    errorMsg.value = "Hệ thống đang bảo trì. Vui lòng thử lại sau.";
  } finally {
    isLoading.value = false;
  }
};

// ================= LOGIC MODAL QUICK ADD ĐÃ FIX TỪ TRANG CHỦ =================
const isQuickAddModalOpen = ref(false);
const selectedProduct = ref(null);
const quantity = ref(1);
const selectedColor = ref("");
const selectedSize = ref("");
const productVariants = ref([]);
const availableColors = ref([]);
const availableSizes = ref([]);

const currentVariantDiscountedPrice = computed(() => {
  if (!currentVariant.value) return 0;
  const rawPrice = currentVariant.value.giaBan || currentVariant.value.gia || 0;
  const discountPercent = selectedProduct.value?.phanTramGiam || currentVariant.value.phanTramGiam || 0;
  return currentVariant.value.giaSauGiam || Math.round(rawPrice * (1 - discountPercent / 100));
});

const currentVariant = computed(() => {
  if (!productVariants.value.length || !selectedColor.value || !selectedSize.value) return null;
  return productVariants.value.find((v) => {
    // Bao phủ cấu trúc JSON dạng list và object lồng
    const tenMau = v.tenMauSac || v.mauSacList?.[0]?.tenMauSac || v.mauSac?.tenMauSac || v.mauSac || v.tenMau;
    const tenSize = v.tenKichCo || v.kichCoList?.[0] || v.kichCo?.tenKichCo || v.kichCo || v.tenSize;
    return tenMau === selectedColor.value && tenSize === selectedSize.value;
  });
});

const openQuickAddModal = async (sp) => {
  selectedProduct.value = sp;
  quantity.value = 1;
  isQuickAddModalOpen.value = true;

  try {
    // 👉 GỌI API SAN-PHAM/{ID} NHƯ TRANG CHỦ
    const res = await axios.get(
      `http://localhost:8080/api/san-pham/${sp.id}`
    );
    const prod = res.data;
    
    productVariants.value = prod.bienTheList || prod.sanPhamChiTietList || [];

    if (productVariants.value.length > 0) {
      const colors = [
        ...new Set(
          productVariants.value.map(
            (v) => v.tenMauSac || v.mauSacList?.[0]?.tenMauSac || v.mauSac?.tenMauSac || v.mauSac || v.tenMau,
          ),
        ),
      ].filter(Boolean);
      const sizes = [
        ...new Set(
          productVariants.value.map(
            (v) => v.tenKichCo || v.kichCoList?.[0] || v.kichCo?.tenKichCo || v.kichCo || v.tenSize,
          ),
        ),
      ].filter(Boolean);

      availableColors.value = colors;
      availableSizes.value = sizes;

      if (colors.length > 0) selectedColor.value = colors[0];
      if (sizes.length > 0) selectedSize.value = sizes[0];
    } else {
      availableColors.value = [];
      availableSizes.value = [];
    }
  } catch (error) {
    showToast("Không thể tải thông tin chi tiết!", "error");
  }
};

const closeQuickAddModal = () => {
  isQuickAddModalOpen.value = false;
  setTimeout(() => { selectedProduct.value = null; productVariants.value = []; }, 300);
};

const confirmAddToCart = () => {
  if (!selectedColor.value || !selectedSize.value)
    return showToast("Vui lòng chọn màu sắc và kích cỡ!", "warning");
  if (!currentVariant.value)
    return showToast("Phân loại này hiện không tồn tại hoặc đã hết hàng!", "error");

  const tonKhoThucTe = currentVariant.value.soLuongTon ?? currentVariant.value.soLuong ?? 0;
  if (quantity.value > tonKhoThucTe)
    return showToast(`Kho chỉ còn ${tonKhoThucTe} sản phẩm!`, "error");

  try {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const giaGoc = currentVariant.value.giaBan || currentVariant.value.gia || 0;
    const phanTram = selectedProduct.value.phanTramGiam || 0;
    const giaSauGiam = phanTram > 0 ? giaGoc - (giaGoc * phanTram) / 100 : giaGoc;

    const hinhAnhVariant = currentVariant.value.hinhAnhUrls?.[0] || currentVariant.value.hinhAnh;
    const hinhAnhSp = selectedProduct.value.hinhAnh;
    const finalImage = (hinhAnhVariant && hinhAnhVariant.length > 0) ? hinhAnhVariant : hinhAnhSp;

    const newItem = {
      productId: selectedProduct.value.id,
      variantId: currentVariant.value.id,
      tenSp: selectedProduct.value.tenSp,
      hinhAnh: finalImage,
      mauSac: { tenMau: selectedColor.value, rgb: getColorCode(selectedColor.value) },
      kichCo: selectedSize.value,
      giaBan: Math.round(giaSauGiam), 
      giaGoc: giaGoc,
      soLuong: quantity.value,
      tonKho: tonKhoThucTe,
    };

    const existingIndex = cart.findIndex((item) => item.variantId === newItem.variantId);
    if (existingIndex !== -1) {
      const newQty = cart[existingIndex].soLuong + newItem.soLuong;
      if (newQty > cart[existingIndex].tonKho)
        return showToast(`Vượt quá tồn kho (${tonKhoThucTe})!`, "error");
      cart[existingIndex].soLuong = newQty;
    } else {
      cart.push(newItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    showToast(`Đã thêm vào giỏ hàng thành công!`, "success");
    closeQuickAddModal();
  } catch (error) {
    showToast("Thêm thất bại, vui lòng thử lại!", "error");
  }
};

const resetAllFilters = () => {
  searchKeyword.value = "";
  selectedSort.value = "bestSale";
  advancedFilters.value = { minPrice: null, maxPrice: null, types: [], materials: [], sizes: [], colors: [] };
  applyFilters();
};

onMounted(() => {
  fetchFilteredData();
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #FFF;
  font-family: 'Inter', sans-serif;
}

/* Banner Sale Đặc Trưng */
.sub-banner {
  width: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/src/assets/logo/banner 1.png') center/cover;
  background-color: #b91c1c;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.sub-banner h1 {
  margin: 0 0 10px 0;
  letter-spacing: 5px;
  font-size: 42px;
  font-weight: 800;
  text-transform: uppercase;
}

.sub-banner p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

/* Breadcrumb */
.breadcrumb-container {
  max-width: 1536px;
  margin: 20px auto 0;
  padding: 0 4%;
}

.breadcrumb {
  font-size: 14px;
  color: #888;
}

.home-link {
  font-weight: 700;
  color: #333;
  cursor: pointer;
  transition: 0.2s;
}

.home-link:hover {
  color: #63391F;
}

.separator {
  margin: 0 10px;
}

.current {
  color: #888;
  cursor: default;
}

/* Layout Chia Cột */
.shop-layout {
  display: flex;
  align-items: flex-start;
  gap: 40px;
  padding: 30px 4% 60px;
  max-width: 1536px;
  margin: 0 auto;
}

.sidebar-wrapper {
  flex: 0 0 250px;
  position: sticky;
  top: 20px;
}

.main-product-area {
  flex: 1;
  min-width: 0;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFF;
  padding: 16px 0;
  margin-bottom: 25px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  width: 16px;
  color: #888;
}

.search-input {
  width: 350px;
  padding: 10px 35px 10px 40px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  background: #FFF;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #63391F;
  box-shadow: 0 0 0 2px rgba(99, 57, 31, 0.1);
}

.clear-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
}

.clear-btn:hover {
  color: #333;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.result-count {
  font-size: 14px;
  color: #666;
}

.result-count strong {
  color: #333;
}

.sort-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}

.toolbar-icon {
  width: 16px;
  height: 16px;
  color: #666;
  display: flex;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  outline: none;
  background: #FFF;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.sort-select:hover,
.sort-select:focus {
  border-color: #63391F;
}

.ms-3 {
  margin-left: 15px;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.product-card {
  background: #FFF;
  border-radius: 8px;
  border: 1px solid #F0F0F0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  border-color: #DDD;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.image-box {
  width: 100%;
  height: 280px;
  background: #F9F9F9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.image-box img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover .image-box img {
  transform: scale(1.05);
}

/* MỚI THÊM: CSS CHO BADGE SALE/MỚI */
.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  color: white;
  z-index: 2;
}

.badge-new {
  background: #10B981;
}

.badge-sale {
  background: #d32f2f;
  box-shadow: 0 4px 6px rgba(211, 47, 47, 0.3);
}

.product-info {
  padding: 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  background: #FFF;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  cursor: pointer;
  transition: color 0.3s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 42px;
}

.product-card:hover .product-name {
  color: #63391F;
}

/* CSS Hiển Thị Giá Cũ / Mới */
.price-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-bottom: 15px;
}

.old-price {
  font-size: 13px;
  color: #999;
  text-decoration: line-through;
  margin: 0;
}

.new-price {
  color: #d32f2f;
  font-weight: 800;
  font-size: 18px;
  margin: 0;
}

.btn-quick-add{
    width: 100%;
    background: #FFF;
    border: 1px solid #63391F;
    color: #63391F;
    padding: 10px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.4s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    opacity: 0;
    transform: translateY(10px);
}

.cart-icon {
  width: 16px;
  height: 16px;
}

.product-card:hover .btn-quick-add {
  opacity: 1;
  transform: translateY(0);
}

.btn-quick-add:hover {
  background: #63391F;
  color: #FFF;
}
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.btn-load-more {
  background: transparent;
  border: 1px solid #63391F;
  color: #63391F;
  padding: 12px 30px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.btn-load-more:hover {
  background: #63391F;
  color: #FFF;
}

.empty-state {
  text-align: center;
  padding: 50px;
  color: #888;
}

.btn-retry {
  margin-top: 15px;
  background: #d0021b;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

/* Modal Quick Add */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-add-modal {
  background: #FFF;
  padding: 30px;
  border-radius: 12px;
  width: 800px;
  max-width: 95%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #888;
  transition: 0.2s;
}

.close-btn:hover {
  color: #d32f2f;
  transform: rotate(90deg);
}

.modal-content {
  display: flex;
  gap: 30px;
}

.modal-left {
  flex: 1;
  background: #F9F9F9;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 350px;
}

.modal-left img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.modal-right {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.modal-product-name {
  font-size: 22px;
  color: #333;
  font-weight: 700;
  margin-bottom: 10px;
}

.modal-price-container {
  margin-bottom: 20px;
  border-bottom: 1px solid #EEE;
  padding-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.modal-old-price {
  font-size: 15px;
  color: #999;
  text-decoration: line-through;
  margin: 0;
}

.modal-price {
  font-size: 22px;
  font-weight: 800;
  color: #d32f2f;
  margin: 0;
}

.attribute-group {
  margin-bottom: 20px;
}

.attribute-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
  color: #555;
}

.selected-val {
  font-weight: 400;
  color: #333;
  margin-left: 8px;
  text-transform: capitalize;
}

/* CSS MÀU SẮC (VÒNG TRÒN) */
.color-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.color-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  position: relative;
}

.color-circle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.color-circle.active {
  border-color: #d32f2f;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #d32f2f;
}

/* CSS KÍCH CỠ (Ô VUÔNG) */
.size-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.size-btn {
  min-width: 40px;
  height: 36px;
  padding: 0 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.size-btn:hover {
  border-color: #63391F;
  color: #63391F;
}

.size-btn.active {
  border-color: #63391F;
  color: #63391F;
  background-color: #fff5f0;
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid #DDD;
  border-radius: 6px;
  overflow: hidden;
  background: #FFF;
}

.quantity-control button {
  width: 35px;
  height: 35px;
  background: #F9F9F9;
  border: none;
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s;
  color: #555;
}

.quantity-control button:hover {
  background: #EEE;
  color: #d0021b;
}

.quantity-control input {
  width: 50px;
  height: 35px;
  text-align: center;
  border: none;
  font-weight: bold;
  border-left: 1px solid #DDD;
  border-right: 1px solid #DDD;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn-confirm-add{
    flex: 2;
    background: #63391F;
    color: #FFF;
    border: none;
    padding: 14px;
    font-size: 16px;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s;
}

.btn-confirm-add:hover {
  background: #4A2A17;
}

.btn-view-detail {
  flex: 1;
  background: transparent;
  border: 1px solid #63391F;
  color: #63391F;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-view-detail:hover {
  background: #F9F9F9;
}

@keyframes slideUp {
  from {
    transform: translateY(40px) scale(0.95);
    opacity: 0;
  }

  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Toast */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 8px;
  z-index: 10001;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.toast-notification.success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}
.toast-notification.error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}
.toast-notification.warning {
  background: #ffc107;
  color: #333;
  border-left: 4px solid #ff9800;
}

.toast-content {
  font-weight: 600;
  color: inherit;
  font-size: 15px;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}
@media (max-width: 992px) {
  .shop-layout {
    flex-direction: column;
  }

  .sidebar-wrapper {
    flex: none;
    width: 100%;
    position: static;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .search-input {
    width: 100%;
  }

  .toolbar-right {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .modal-content {
    flex-direction: column;
    gap: 20px;
  }

  .modal-left {
    height: 300px;
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>