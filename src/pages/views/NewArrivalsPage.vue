<template>
  <div class="app-container">
    <Header></Header>

    <main class="main-content">
      <section class="sub-banner">
        <div class="banner-text">
          <h1>HÀNG MỚI VỀ</h1>
          <p>Khám phá những mẫu áo khoác mới nhất vừa cập bến.</p>
        </div>
      </section>

      <div class="breadcrumb-container">
        <div class="breadcrumb">
          <span class="home-link" @click="$router.push('/')">Trang chủ</span>
          <span class="separator">/</span>
          <span class="current">Hàng mới về</span>
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
              <input type="text" v-model="searchKeyword" @input="applyFilters" placeholder="Tìm kiếm áo khoác..."
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
                <select v-model="selectedSort" @change="applyFiltersImmediate" class="sort-select">
                  <option value="newest">Mới nhất</option>
                  <option value="priceAsc">Giá thấp đến cao</option>
                  <option value="priceDesc">Giá cao đến thấp</option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>

          <div v-else-if="errorMsg" class="error-state">
            <div class="error-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg></div>
            <p>{{ errorMsg }}</p>
            <button @click="fetchFilteredData" class="btn-retry">Thử lại</button>
          </div>

          <div v-else>
            <div v-if="paginatedProducts.length > 0">
              <div class="product-grid">
                <transition-group name="list">
                  <div v-for="sp in paginatedProducts" :key="sp.id" class="product-card">
                    <div class="image-box" @click="goDetail(sp.id)">
                      <img :src="sp.hinhAnh" :alt="sp.tenSp" @error="handleImageError" />
                      <div class="badge-group">
                        <span v-if="sp.phanTramGiam > 0" class="badge badge-sale">-{{ sp.phanTramGiam }}%</span>
                        <span v-else-if="isNew(sp.ngayTao)" class="badge badge-new">Mới</span>
                      </div>
                    </div>

                    <div class="product-info">
                      <h3 class="product-name" @click="goDetail(sp.id)" :title="sp.tenSp">{{ sp.tenSp }}</h3>

                      <div class="price-wrapper">
                        <template v-if="sp.phanTramGiam > 0">
                          <p class="old-price">
                            <span v-if="sp.giaMin === sp.giaMax">{{ formatPrice(sp.giaMin) }}</span>
                            <span v-else>{{ formatPrice(sp.giaMin) }} ~ {{ formatPrice(sp.giaMax) }}</span>
                          </p>
                          <p class="price new-price">
                            <span v-if="sp.giaMinSauGiam === sp.giaMaxSauGiam">{{ formatPrice(sp.giaMinSauGiam)
                            }}</span>
                            <span v-else>{{ formatPrice(sp.giaMinSauGiam) }} ~ {{ formatPrice(sp.giaMaxSauGiam)
                            }}</span>
                          </p>
                        </template>
                        <template v-else>
                          <p class="price current-price">
                            <span v-if="sp.giaMin === sp.giaMax">{{ formatPrice(sp.giaMin) }}</span>
                            <span v-else>{{ formatPrice(sp.giaMin) }} ~ {{ formatPrice(sp.giaMax) }}</span>
                          </p>
                        </template>
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

              <div class="pagination-wrapper" v-if="totalPages > 1">
                <button 
                  class="page-btn prev-btn" 
                  :disabled="currentPage === 1" 
                  @click="changePage(currentPage - 1)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>

                <div class="page-numbers">
                  <button 
                    v-for="page in visiblePages" 
                    :key="page"
                    class="page-num" 
                    :class="{ active: currentPage === page }"
                    @click="changePage(page)"
                  >
                    {{ page }}
                  </button>
                </div>

                <button 
                  class="page-btn next-btn" 
                  :disabled="currentPage === totalPages" 
                  @click="changePage(currentPage + 1)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                  <line x1="16" y1="8" x2="2" y2="22"></line>
                  <line x1="17.5" y1="15H9"></line>
                </svg>
              </div>
              <h4>Không tìm thấy!</h4>
              <p>Rất tiếc, hiện tại không có sản phẩm nào phù hợp với bộ lọc của bạn.</p>
              <button @click="resetAllFilters" class="btn-clear-filter">Xóa bộ lọc & Tìm lại</button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Footer></Footer>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['choco-toast', toast.type]">
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="isQuickAddModalOpen" class="modal-overlay" @click.self="closeQuickAddModal">
        <div class="quick-add-modal">
          <button class="close-btn" @click="closeQuickAddModal">×</button>

          <div class="modal-content" v-if="selectedProduct">
            <div class="modal-left">
              <img :src="currentVariant?.hinhAnhUrls?.[0] || selectedProduct.hinhAnh" :alt="selectedProduct.tenSp" @error="handleImageError" />
            </div>

            <div class="modal-right">
              <h3 class="modal-product-name">{{ selectedProduct.tenSp }}</h3>

              <p class="modal-price">
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
              </p>

              <div class="attribute-group" v-if="availableColors.length > 0">
                <label>Màu sắc: <span class="selected-val">{{ selectedColor || 'Chưa chọn' }}</span></label>
                <div class="color-options">
                  <button v-for="colorData in availableColors" :key="colorData.tenMau" 
                    class="color-circle" 
                    :class="{ active: selectedColor === colorData.tenMau }"
                    :style="{ backgroundColor: colorData.rgb }"
                    @click="selectedColor = colorData.tenMau"
                    :title="colorData.tenMau"
                  >
                    <div class="swatch-check">✓</div>
                  </button>
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
                <label>Số lượng: <span v-if="currentVariant" class="stock-info">(Kho: {{ currentVariant.soLuongTon ?? currentVariant.soLuong ?? 0
                }})</span></label>
                <div class="quantity-control">
                  <button @click="quantity > 1 && quantity--">-</button>
                  <input type="number" v-model="quantity" min="1" readonly />
                  <button @click="quantity++">+</button>
                </div>
              </div>

              <div class="modal-actions">
                <button class="btn-confirm-add" @click="confirmAddToCart">Thêm vào giỏ</button>
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

const filteredProducts = ref([]);
const isLoading = ref(true);
const errorMsg = ref("");

const searchKeyword = ref("");
const selectedSort = ref("newest");
const advancedFilters = ref({ minPrice: null, maxPrice: null, types: [], materials: [], sizes: [], colors: [] });

// ================= LOGIC PHÂN TRANG (PAGINATION) =================
const currentPage = ref(1); 
const itemsPerPage = 12; 

// Tính tổng số trang
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage));

// Lấy sản phẩm của trang hiện tại (Đã ép kiểu Number)
const paginatedProducts = computed(() => {
  const page = Number(currentPage.value);
  const limit = Number(itemsPerPage);
  
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return filteredProducts.value.slice(start, end);
});

// Tính toán các nút số trang hiển thị (giới hạn hiển thị 5 nút)
const visiblePages = computed(() => {
  let pages = [];
  const maxVisibleButtons = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisibleButtons / 2));
  let endPage = startPage + maxVisibleButtons - 1;

  if (endPage > totalPages.value) {
    endPage = totalPages.value;
    startPage = Math.max(1, endPage - maxVisibleButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

// Hàm chuyển trang
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 300, behavior: 'smooth' }); // Tự động cuộn lên đầu danh sách
  }
};

// ================= TOAST & TIỆN ÍCH =================
const toast = ref({ show: false, message: "", type: "success" });
const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 3000);
};

const formatPrice = (v) => v == null ? "0 đ" : new Intl.NumberFormat("vi-VN").format(Math.round(v)) + " đ";
const handleImageError = (e) => e.target.src = "/src/assets/logo/no-image-placeholder.png";

// HÀM DỰ PHÒNG MÀU SẮC
const getBackupColorCode = (name) => {
  if (!name) return '#cccccc';
  const n = name.toLowerCase().trim();
  const colorMap = {
    'đen': '#222222', 'black': '#222222', 'trắng': '#ffffff', 'white': '#ffffff', 'trắng sữa': '#fdfff5', 'trắng kem': '#f5f5dc', 
    'xám': '#808080', 'gray': '#808080', 'grey': '#808080', 'xám nhạt': '#d3d3d3', 'xám đậm': '#555555',
    'đỏ': '#dc2626', 'red': '#dc2626', 'đỏ đô': '#800000', 'đỏ rượu': '#722f37',
    'hồng': '#ffc0cb', 'pink': '#ffc0cb', 'hồng phấn': '#ffb6c1',
    'tím': '#9333ea', 'purple': '#9333ea', 'tím than': '#191970', 'tím nhạt': '#e6e6fa',
    'xanh dương': '#2563eb', 'blue': '#2563eb', 'xanh biển': '#0000ff', 'navy': '#1e3a8a', 'xanh đen': '#0a1128',
    'xanh ngọc': '#00a86b', 'xanh coban': '#0047ab',
    'xanh lá': '#10b981', 'green': '#10b981', 'xanh rêu': '#4a5d23', 'rêu': '#4a5d23',
    'vàng': '#eab308', 'yellow': '#eab308', 'vàng bò': '#d2b48c', 'vàng kem': '#f0e68c', 
    'cam': '#f97316', 'orange': '#f97316', 'cam đất': '#cc7722',
    'nâu': '#78350f', 'brown': '#78350f', 'nâu bò': '#8b4513', 'nâu tây': '#a0522d',
    'be': '#f5f5dc', 'beige': '#f5f5dc', 'kem': '#fffdd0'
  };
  if (colorMap[n]) return colorMap[n];
  for (const [key, value] of Object.entries(colorMap)) {
    if (n.includes(key)) return value;
  }
  return '#cccccc';
};

const goDetail = (id) => {
  if (!id) return;
  router.push(`/home/product/${id}`);
};

const isNew = (dateString) => {
  if (!dateString) return false;
  const createdDate = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.ceil((now - createdDate) / (1000 * 60 * 60 * 24));
  return diffInDays <= 30;
};

// ================= XỬ LÝ BỘ LỌC =================
const clearSearch = () => {
  searchKeyword.value = "";
  currentPage.value = 1; // Luôn reset về trang 1
  fetchFilteredData();
};

const handleAdvancedFilter = (filters) => {
  advancedFilters.value = filters;
  currentPage.value = 1; // Luôn reset về trang 1
  fetchFilteredData();
};

let searchTimeout = null;
const applyFilters = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1; // Luôn reset về trang 1
    fetchFilteredData();
  }, 500);
}

const applyFiltersImmediate = () => {
  currentPage.value = 1; // Luôn reset về trang 1
  fetchFilteredData();
}

// ================= LOGIC GỌI API TỪ BACKEND =================
const fetchFilteredData = async () => {
  isLoading.value = true;
  errorMsg.value = "";

  try {
    // Để phân trang trên Frontend chạy tốt, ta kéo một số lượng lớn sản phẩm về
    let url = `http://localhost:8080/api/chi-tiet-san-pham?page=0&size=1000`;

    const adv = advancedFilters.value;
    if (adv.minPrice !== null && adv.minPrice !== "") url += `&minPrice=${adv.minPrice}`;
    if (adv.maxPrice !== null && adv.maxPrice !== "") url += `&maxPrice=${adv.maxPrice}`;

    const res = await axios.get(url);
    const data = res.data;

    const rawData = data.content || [];
    const uniqueProductsMap = new Map();

    const keywordLower = searchKeyword.value.trim().toLowerCase();

    rawData.forEach(item => {
      let passFilter = true;

      // HÀNG MỚI VỀ: CHỈ LẤY SẢN PHẨM MỚI (Tạo trong vòng 30 ngày)
      if (!isNew(item.ngayTao)) {
        passFilter = false;
      }

      if (keywordLower) {
        const productName = (item.tenSanPham || item.tenSp || item.sanPham?.tenSanPham || "").toLowerCase();
        const productCode = (item.maSanPham || item.sanPham?.maSanPham || "").toLowerCase();
        
        if (!productName.includes(keywordLower) && !productCode.includes(keywordLower)) {
          passFilter = false;
        }
      }

      if (adv.types.length > 0 && !adv.types.includes(item.tenLoaiAo)) passFilter = false;
      if (adv.sizes.length > 0 && !adv.sizes.includes(item.tenKichCo)) passFilter = false;
      if (adv.colors.length > 0 && !adv.colors.includes(item.tenMauSac)) passFilter = false;

      if (passFilter) {
        if (!uniqueProductsMap.has(item.maSanPham)) {
          let realProductId = item.sanPham?.id;
          if (!realProductId && item.maSanPham && item.maSanPham.startsWith('SP')) {
            realProductId = parseInt(item.maSanPham.replace('SP', ''), 10);
          }
          if (!realProductId) realProductId = item.id;

          uniqueProductsMap.set(item.maSanPham, {
            id: realProductId,
            maSanPham: item.maSanPham,
            tenSp: item.tenSanPham || item.tenSp,
            hinhAnh: (item.hinhAnh && item.hinhAnh.length > 0) ? item.hinhAnh[0] : null,
            giaMin: item.giaGoc || item.giaBan,
            giaMax: item.giaGoc || item.giaBan,
            giaMinSauGiam: item.giaSauGiam || item.giaBan,
            giaMaxSauGiam: item.giaSauGiam || item.giaBan,
            phanTramGiam: item.phanTramGiam || 0,
            ngayTao: item.ngayTao
          });
        } else {
          const existing = uniqueProductsMap.get(item.maSanPham);
          const currentGia = item.giaGoc || item.giaBan;
          const currentGiaSauGiam = item.giaSauGiam || item.giaBan;

          if (currentGia < existing.giaMin) existing.giaMin = currentGia;
          if (currentGia > existing.giaMax) existing.giaMax = currentGia;

          if (currentGiaSauGiam < existing.giaMinSauGiam) existing.giaMinSauGiam = currentGiaSauGiam;
          if (currentGiaSauGiam > existing.giaMaxSauGiam) existing.giaMaxSauGiam = currentGiaSauGiam;

          if (item.phanTramGiam > existing.phanTramGiam) existing.phanTramGiam = item.phanTramGiam;
        }
      }
    });

    let uniqueProducts = Array.from(uniqueProductsMap.values());

    // Sắp xếp
    if (selectedSort.value === "priceAsc") uniqueProducts.sort((a, b) => a.giaMinSauGiam - b.giaMinSauGiam);
    else if (selectedSort.value === "priceDesc") uniqueProducts.sort((a, b) => b.giaMinSauGiam - a.giaMinSauGiam);
    else uniqueProducts.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));

    filteredProducts.value = uniqueProducts;

  } catch (error) {
    console.error("Lỗi lấy dữ liệu:", error);
    errorMsg.value = "Hệ thống đang bảo trì. Vui lòng thử lại sau.";
  } finally {
    isLoading.value = false;
  }
};

// ================= LOGIC MODAL QUICK ADD CHUẨN =================
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
    const tenMau = v.mauSacList?.[0]?.tenMauSac || v.tenMauSac || v.mauSac?.tenMauSac;
    const tenSize = v.kichCoList?.[0] || v.tenKichCo || v.kichCo?.tenKichCo;
    
    return tenMau === selectedColor.value && tenSize === selectedSize.value;
  });
});

const openQuickAddModal = async (sp) => {
  selectedProduct.value = sp;
  quantity.value = 1;
  isQuickAddModalOpen.value = true;

  try {
    const res = await axios.get(
      `http://localhost:8080/api/san-pham/${sp.id}`
    );
    const prod = res.data;
    
    productVariants.value = prod.bienTheList || prod.sanPhamChiTietList || [];

    if (productVariants.value.length > 0) {
      const colorMap = new Map();
      const sizeSet = new Set();

      productVariants.value.forEach(v => {
        const tenMau = v.mauSacList?.[0]?.tenMauSac || v.tenMauSac || v.mauSac?.tenMauSac;
        const tenSize = v.kichCoList?.[0] || v.tenKichCo || v.kichCo?.tenKichCo;
        
        // Bắt mã RGB từ DB, nếu lỡ ko có thì dùng hàm backup
        const rgbCode = v.rgb || v.mauSacList?.[0]?.rgb || v.mauSac?.rgb || getBackupColorCode(tenMau);

        if (tenMau && !colorMap.has(tenMau)) {
          colorMap.set(tenMau, rgbCode);
        }
        if (tenSize) sizeSet.add(tenSize);
      });

      // Chuyển Map thành Mảng [{tenMau: 'Đỏ', rgb: '#FF0000'}]
      availableColors.value = Array.from(colorMap.entries()).map(([tenMau, rgb]) => ({
        tenMau,
        rgb
      }));

      availableSizes.value = [...sizeSet];

      if (availableColors.value.length > 0) selectedColor.value = availableColors.value[0].tenMau;
      if (availableSizes.value.length > 0) selectedSize.value = availableSizes.value[0];
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

  const tonKhoThucTe = currentVariant.value.soLuongTon || currentVariant.value.soLuong || 0;
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

    // Tìm lại Data màu để lấy mã RGB
    const selectedColorData = availableColors.value.find(c => c.tenMau === selectedColor.value);

    const newItem = {
      productId: selectedProduct.value.id,
      variantId: currentVariant.value.id,
      tenSp: selectedProduct.value.tenSp,
      hinhAnh: finalImage,
      // Lưu lại thông tin màu gồm tên và mã RGB
      mauSac: { tenMau: selectedColor.value, rgb: selectedColorData?.rgb || '#cccccc' },
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

/* Banner */
.sub-banner {
  width: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/src/assets/logo/banner 1.png') center/cover;
  background-color: #2c3e50;
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

.badge-group {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 2;
}

.badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  color: white;
  width: fit-content;
  text-transform: uppercase;
}

.badge-new {
  background: #10B981;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
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
  margin-bottom: 12px;
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

/* CSS CHO GIÁ CŨ VÀ MỚI */
.price-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 15px;
}

.old-price {
  text-decoration: line-through;
  color: #999;
  font-size: 13px;
  margin: 0;
}

.price {
  margin: 0;
  font-weight: 800;
  color: #d32f2f;
  font-size: 16px;
}

.btn-quick-add {
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

/* 👉 PHÂN TRANG (PAGINATION) */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 50px;
  padding-bottom: 20px;
}

.page-btn, .page-num {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #4b5563;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn svg {
  width: 16px;
  height: 16px;
}

.page-btn:hover:not(:disabled), .page-num:hover:not(.active) {
  border-color: #63391F;
  color: #63391F;
}

.page-btn:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.page-num.active {
  background: #63391F;
  color: #fff;
  border-color: #63391F;
}

.page-numbers {
  display: flex;
  gap: 6px;
}

/* STATES */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  border-radius: 12px;
  background-color: #fafafa;
  border: 1px dashed #e5e7eb;
  margin-top: 20px;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #63391F;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-icon svg {
  width: 48px;
  height: 48px;
  color: #d32f2f;
  margin-bottom: 15px;
}

.error-state p {
  color: #666;
  margin-bottom: 20px;
  font-size: 15px;
}

.empty-icon-wrapper {
  margin-bottom: 20px;
  display: inline-block;
  padding: 20px;
  background-color: #f3f4f6;
  border-radius: 50%;
}

.empty-icon-wrapper svg {
  width: 64px;
  height: 64px;
  color: #9ca3af;
}

.empty-state h4 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #374151;
}

.empty-state p {
  color: #6b7280;
  font-size: 15px;
  margin-bottom: 25px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.btn-clear-filter {
  background: #63391F;
  color: white;
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(99, 57, 31, 0.2);
}

.btn-clear-filter:hover {
  background: #4a2a17;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(99, 57, 31, 0.3);
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-circle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.color-circle.active {
  border-color: #d32f2f;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #d32f2f;
}

.swatch-check {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  opacity: 0;
  text-shadow: 0px 0px 4px rgba(0,0,0,0.7); 
  transition: opacity 0.2s;
}

.color-circle.active .swatch-check {
  opacity: 1;
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

.btn-confirm-add {
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

/* 👉 ĐÃ CẬP NHẬT TOAST DẠNG VIỀN DÀY */
.choco-toast {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 10001;
  padding: 14px 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  font-family: "Inter", sans-serif;
  font-weight: 500;
  font-size: 15px;
  min-width: 250px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.choco-toast.success {
  background-color: #F7F7F7; 
  color: #63391F; 
  border-left: 6px solid #63391F; 
}

.choco-toast.error {
  background-color: #fee2e2; 
  color: #b91c1c; 
  border-left: 6px solid #dc2626;
}

.choco-toast.warning {
  background-color: #fffbeb; 
  color: #b45309; 
  border-left: 6px solid #f59e0b;
}

.toast-content {
  letter-spacing: 0.2px;
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
  
  .pagination-wrapper {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}

/* ================= HIỆU ỨNG CHUYỂN TRANG MƯỢT MÀ ================= */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-leave-active {
  display: none !important; 
  position: absolute;
}
</style>