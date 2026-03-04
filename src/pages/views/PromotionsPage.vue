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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                v-model="searchKeyword" 
                @input="applyFilters" 
                placeholder="Tìm áo khoác đang sale..." 
                class="search-input"
              />
              <button v-if="searchKeyword" @click="clearSearch" class="clear-btn">✕</button>
            </div>

            <div class="toolbar-right">
              <span class="result-count" v-if="filteredProducts.length > 0">
                Hiển thị <strong>{{ displayedProducts.length }}</strong> trên <strong>{{ filteredProducts.length }}</strong> sản phẩm
              </span>
              <div class="sort-box">
                <span class="toolbar-icon ms-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
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
            <div class="error-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cart-icon"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
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
              <img :src="selectedProduct.hinhAnh" :alt="selectedProduct.tenSp" @error="handleImageError" />
            </div>
            
            <div class="modal-right">
              <h3 class="modal-product-name">{{ selectedProduct.tenSp }}</h3>
              
              <div class="modal-price-container">
                <p class="modal-old-price">
                  {{ formatPrice(getOldPrice(selectedProduct)) }}
                </p>
                <p class="modal-price">
                  <span v-if="currentVariant">{{ formatPrice(currentVariant.giaBan || currentVariant.gia) }}</span>
                  <span v-else>
                    <span v-if="selectedProduct.giaMin === selectedProduct.giaMax">{{ formatPrice(selectedProduct.giaMin) }}</span>
                    <span v-else>{{ formatPrice(selectedProduct.giaMin) }} ~ {{ formatPrice(selectedProduct.giaMax) }}</span>
                  </span>
                </p>
              </div>

              <div class="attribute-group" v-if="availableColors.length > 0">
                <label>Màu sắc:</label>
                <div class="btn-group">
                  <button v-for="color in availableColors" :key="color" :class="{ active: selectedColor === color }" @click="selectedColor = color">{{ color }}</button>
                </div>
              </div>

              <div class="attribute-group" v-if="availableSizes.length > 0">
                <label>Kích cỡ:</label>
                <div class="btn-group">
                  <button v-for="size in availableSizes" :key="size" :class="{ active: selectedSize === size }" @click="selectedSize = size">{{ size }}</button>
                </div>
              </div>

              <div class="attribute-group">
                <label>Số lượng: <span v-if="currentVariant" class="stock-info">(Kho: {{ currentVariant.soLuongTon || 0 }})</span></label>
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
const selectedSort = ref("bestSale"); // Sắp xếp mặc định theo Sale nhiều nhất
const advancedFilters = ref({ minPrice: null, maxPrice: null, types: [], materials: [], sizes: [], colors: [] });

// --- Phân trang Backend ---
const currentPage = ref(0);
const itemsPerPage = 12;
const totalPages = ref(1);

// --- Phân trang Frontend (Hiển thị tạm thời nếu dùng chung mảng) ---
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

// HÀM CHUYỂN TRANG BẰNG ID
const goDetail = (id) => {
  if(!id) {
    console.error("Lỗi: Không tìm thấy ID sản phẩm để chuyển trang!");
    return;
  }
  router.push(`/home/product/${id}`);
};

// LẤY DỮ LIỆU SALE THẬT TỪ BACKEND
const getDiscountPercent = (sp) => {
  // Trả về phần trăm giảm giá từ Backend, nếu không có thì mặc định là 0
  return sp.phanTramGiam || 0; 
};

const getOldPrice = (sp) => {
  // Trả về giá gốc (trước khi giảm)
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
   // Khi người dùng gõ tìm kiếm hoặc đổi select, reset phân trang và gọi lại API
   currentPage.value = 0;
   fetchFilteredData();
}

// ================= LOGIC GỌI API TỪ BACKEND TƯƠNG TỰ FILE MẪU =================
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

    // GOM NHÓM SẢN PHẨM TRÙNG (Do API chi tiết trả về từng biến thể)
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
                
                // 👉 NHẬN DỮ LIỆU THẬT TỪ BACKEND
                giaMin: item.giaSauGiam || item.giaBan, 
                giaMax: item.giaSauGiam || item.giaBan,
                giaGoc: item.giaGoc || item.giaBan, 
                phanTramGiam: percent, 
                
                ngayTao: item.ngayTao
              });
            } else {
              // Cập nhật min/max price cho các biến thể khác nhau
              const existing = uniqueProductsMap.get(item.maSanPham);
              const currentGia = item.giaSauGiam || item.giaBan;
              if (currentGia < existing.giaMin) existing.giaMin = currentGia;
              if (currentGia > existing.giaMax) existing.giaMax = currentGia;
            }
        }
      }
    });

    let uniqueProducts = Array.from(uniqueProductsMap.values());

    // Vì là Trang Sale, nên giới hạn lại hiển thị khoảng 20-30 sản phẩm để giả lập "Top Sale" (Tuỳ chỉnh)
    uniqueProducts = uniqueProducts.slice(0, 30);

    // Sắp xếp
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

// --- LOGIC MODAL QUICK ADD ---
const isQuickAddModalOpen = ref(false);
const selectedProduct = ref(null);
const quantity = ref(1);
const selectedColor = ref("");
const selectedSize = ref("");
const productVariants = ref([]);
const availableColors = ref([]);
const availableSizes = ref([]);

const currentVariant = computed(() => {
  if (!productVariants.value.length || !selectedColor.value || !selectedSize.value) return null;
  return productVariants.value.find(v => {
    const tenM = v.tenMauSac || v.mauSac?.tenMauSac;
    const tenS = v.tenKichCo || v.kichCo?.tenKichCo;
    return tenM === selectedColor.value && tenS === selectedSize.value;
  });
});

const openQuickAddModal = async (sp) => {
  selectedProduct.value = sp;
  quantity.value = 1;
  isQuickAddModalOpen.value = true;
  try {
    // Dùng maSanPham để API Back-End lọc ra list màu, size của áo này
    const res = await axios.get(`http://localhost:8080/api/chi-tiet-san-pham?keyword=${sp.maSanPham}&size=100`);
    productVariants.value = res.data.content || res.data || [];
    
    if (productVariants.value.length > 0) {
      availableColors.value = [...new Set(productVariants.value.map(v => v.tenMauSac || v.mauSac?.tenMauSac))].filter(Boolean);
      availableSizes.value = [...new Set(productVariants.value.map(v => v.tenKichCo || v.kichCo?.tenKichCo))].filter(Boolean);
      if (availableColors.value.length) selectedColor.value = availableColors.value[0];
      if (availableSizes.value.length) selectedSize.value = availableSizes.value[0];
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
  if (!currentVariant.value) return showToast("Vui lòng chọn phân loại hợp lệ!", "warning");
  const tk = currentVariant.value.soLuongTon || 0;
  if (quantity.value > tk) return showToast(`Kho chỉ còn ${tk} sản phẩm!`, "error");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const newItem = {
    productId: selectedProduct.value.id, // Dùng ID để click từ giỏ hàng nhảy sang trang chi tiết
    variantId: currentVariant.value.id, 
    tenSp: selectedProduct.value.tenSp,
    hinhAnh: currentVariant.value.hinhAnh || selectedProduct.value.hinhAnh,
    mauSac: { tenMau: selectedColor.value, rgb: '#63391F' },
    kichCo: selectedSize.value,
    giaBan: currentVariant.value.giaBan || currentVariant.value.gia || 0,
    soLuong: quantity.value,
    tonKho: tk
  };

  const existingIndex = cart.findIndex(item => item.variantId === newItem.variantId);
  if (existingIndex !== -1) {
    if(cart[existingIndex].soLuong + newItem.soLuong > tk) return showToast(`Vượt quá tồn kho (${tk})!`, "error");
    cart[existingIndex].soLuong += newItem.soLuong;
  } else {
    cart.push(newItem);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
  showToast(`Đã thêm vào giỏ hàng!`, "success");
  closeQuickAddModal();
};

onMounted(() => {
  fetchFilteredData();
});
</script>

<style scoped>
.app-container { min-height: 100vh; background-color: #FFF; font-family: 'Inter', sans-serif;}

/* Banner Sale Đặc Trưng */
.sub-banner {
  width: 100%;
  background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/src/assets/logo/banner 1.png') center/cover;
  background-color: #b91c1c; 
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}
.sub-banner h1 { margin: 0 0 10px 0; letter-spacing: 5px; font-size: 42px; font-weight: 800; text-transform: uppercase;}
.sub-banner p { margin: 0; font-size: 16px; opacity: 0.9; }

/* Breadcrumb */
.breadcrumb-container { max-width: 1400px; margin: 20px auto 0; padding: 0 4%; }
.breadcrumb { font-size: 14px; color: #888; }
.home-link { font-weight: 700; color: #333; cursor: pointer; transition: 0.2s;}
.home-link:hover { color: #d0021b; }
.separator { margin: 0 10px; }
.current { color: #888; cursor: default; }

/* Layout Chia Cột */
.shop-layout { display: flex; align-items: flex-start; gap: 40px; padding: 30px 4% 60px; max-width: 1400px; margin: 0 auto;}
.sidebar-wrapper { flex: 0 0 250px; position: sticky; top: 20px;}
.main-product-area { flex: 1; min-width: 0; }

/* Toolbar */
.toolbar { display: flex; justify-content: space-between; align-items: center; background: #FFF; padding: 16px 0; margin-bottom: 25px;}
.search-wrapper { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 14px; width: 16px; color: #888; }
.search-input { width: 350px; padding: 10px 35px 10px 40px; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 14px; outline: none; background: #FFF; transition: all 0.3s;}
.search-input:focus { border-color: #d0021b; box-shadow: 0 0 0 2px rgba(208,2,27,0.1);}
.clear-btn { position: absolute; right: 10px; background: none; border: none; color: #999; cursor: pointer; font-size: 16px;}
.clear-btn:hover { color: #333; }

.toolbar-right { display: flex; align-items: center; gap: 20px; }
.result-count { font-size: 14px; color: #666; }
.result-count strong { color: #333; }
.sort-box { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #333;}
.toolbar-icon { width: 16px; height: 16px; color: #666; display: flex;}
.sort-select { padding: 8px 12px; border: 1px solid #E5E7EB; border-radius: 6px; outline: none; background: #FFF; font-family: inherit; font-size: 14px; cursor: pointer; transition: 0.2s;}
.sort-select:hover, .sort-select:focus { border-color: #d0021b;}
.ms-3 { margin-left: 15px;}

/* Product Grid */
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
.product-card { background: #FFF; border-radius: 8px; border: 1px solid #F0F0F0; overflow: hidden; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; position: relative;}
.product-card:hover { transform: translateY(-8px); border-color: #DDD; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

.image-box { width: 100%; height: 280px; background: #F9F9F9; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; position: relative;}
.image-box img { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.product-card:hover .image-box img { transform: scale(1.05); }

.badge { position: absolute; top: 10px; left: 10px; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; color: white; background: #d0021b;} 

.product-info { padding: 15px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1; background: #FFF;}
.product-name { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 10px; cursor: pointer; transition: color 0.3s; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 42px;}
.product-card:hover .product-name { color: #d0021b; }

/* CSS Hiển Thị Giá Cũ / Mới */
.price-container { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-bottom: 15px;}
.old-price { font-size: 13px; color: #999; text-decoration: line-through; margin: 0; }
.new-price { color: #d32f2f; font-weight: 800; font-size: 18px; margin: 0; }

.btn-quick-add { width: 100%; background: #FFF; border: 1px solid #d0021b; color: #d0021b; padding: 10px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.4s; display: flex; align-items: center; justify-content: center; gap: 6px; opacity: 0; transform: translateY(10px);}
.cart-icon { width: 16px; height: 16px; }
.product-card:hover .btn-quick-add { opacity: 1; transform: translateY(0); }
.btn-quick-add:hover { background: #d0021b; color: #FFF; }

.load-more-container { display: flex; justify-content: center; margin-top: 40px; }
.btn-load-more { background: transparent; border: 1px solid #d0021b; color: #d0021b; padding: 12px 30px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s; }
.btn-load-more:hover { background: #d0021b; color: #FFF; }
.empty-state { text-align: center; padding: 50px; color: #888; }
.btn-retry { margin-top: 15px; background: #d0021b; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;}

/* Modal Quick Add */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; }
.quick-add-modal { background: #FFF; padding: 30px; border-radius: 12px; width: 800px; max-width: 95%; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.15);}
.close-btn { position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 28px; cursor: pointer; color: #888; transition: 0.2s;}
.close-btn:hover { color: #d32f2f; transform: rotate(90deg);}
.modal-content { display: flex; gap: 30px; }
.modal-left { flex: 1; background: #F9F9F9; border-radius: 8px; display: flex; justify-content: center; align-items: center; height: 350px;}
.modal-left img { max-width: 100%; max-height: 100%; object-fit: contain; }
.modal-right { flex: 1.2; display: flex; flex-direction: column; justify-content: center;}
.modal-product-name { font-size: 22px; color: #333; font-weight: 700; margin-bottom: 10px; }
.modal-price-container { margin-bottom: 20px; border-bottom: 1px solid #EEE; padding-bottom: 15px; display: flex; flex-direction: column; gap: 5px;}
.modal-old-price { font-size: 15px; color: #999; text-decoration: line-through; margin: 0; }
.modal-price { font-size: 22px; font-weight: 800; color: #d32f2f; margin: 0;}

.attribute-group { margin-bottom: 20px; }
.attribute-group label { display: block; font-weight: 600; margin-bottom: 10px; color: #555; }
.btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
.btn-group button { padding: 8px 16px; border: 1px solid #DDD; background: #FFF; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; transition: 0.2s;}
.btn-group button:hover { border-color: #d0021b; color: #d0021b; }
.btn-group button.active { background: #d0021b; color: #FFF; border-color: #d0021b; }
.quantity-control { display: inline-flex; align-items: center; border: 1px solid #DDD; border-radius: 6px; overflow: hidden; background: #FFF;}
.quantity-control button { width: 35px; height: 35px; background: #F9F9F9; border: none; font-size: 18px; cursor: pointer; transition: 0.3s; color: #555;}
.quantity-control button:hover { background: #EEE; color: #d0021b;}
.quantity-control input { width: 50px; height: 35px; text-align: center; border: none; font-weight: bold; border-left: 1px solid #DDD; border-right: 1px solid #DDD;}
.modal-actions { display: flex; gap: 15px; margin-top: 20px; }
.btn-confirm-add { flex: 2; background: #d0021b; color: #FFF; border: none; padding: 14px; font-size: 16px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.3s; }
.btn-confirm-add:hover { background: #991b1b;}
.btn-view-detail { flex: 1; background: transparent; border: 1px solid #d0021b; color: #d0021b; padding: 14px; font-size: 16px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.3s;}
.btn-view-detail:hover { background: #F9F9F9; }

@keyframes slideUp { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

/* Toast */
.toast-notification { position: fixed; top: 20px; right: 20px; background: #22C55E; color: #FFF; padding: 15px 25px; border-radius: 8px; z-index: 10001; font-weight: 500;}
.toast-notification.error { background: #ef4444; }
.toast-notification.warning { background: #f59e0b; }

@media (max-width: 992px) { .shop-layout { flex-direction: column; } .sidebar-wrapper { flex: none; width: 100%; position: static;} }
@media (max-width: 768px) { .toolbar { flex-direction: column; align-items: flex-start; gap: 15px;} .search-input { width: 100%;} .toolbar-right { width: 100%; justify-content: space-between; flex-wrap: wrap;} .modal-content { flex-direction: column; gap: 20px;} .modal-left{ height: 300px;} .modal-actions { flex-direction: column;} }
@media (max-width: 480px) { .product-grid { grid-template-columns: 1fr; } }
</style>