<template>
  <div class="app-container">
    <Header></Header>

    <main class="main-content">
      <div class="breadcrumb">
        <span @click="$router.push('/')">Trang chủ</span>
        <span class="separator">/</span>
        <span class="current">Ưu đãi</span>
      </div>

      <section class="sub-banner sale-banner">
        <div class="banner-text">
          <h1>MÙA SALE LỚN NHẤT NĂM</h1>
          <p>Săn ngay áo khoác hàng hiệu với mức giá giảm cực sốc.</p>
        </div>
      </section>

      <section class="section">
        <div class="toolbar">
          <div class="search-group">
            <div class="search-input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                v-model="searchKeyword" 
                @input="applyFilters" 
                placeholder="Tìm áo khoác đang sale..." 
                class="search-input"
              />
              <button v-if="searchKeyword" @click="clearSearch" class="clear-search-btn">✕</button>
            </div>
          </div>

          <div class="filter-actions">
            <div class="filter-group">
              <span class="toolbar-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toolbar-icon"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                Lọc giá sale:
              </span>
              <select v-model="selectedPriceFilter" @change="applyFilters" class="toolbar-select">
                <option value="all">Tất cả</option>
                <option value="under300">Dưới 300.000 đ</option>
                <option value="300to700">300k - 700.000 đ</option>
                <option value="over700">Trên 700.000 đ</option>
              </select>
            </div>

            <div class="sort-group">
              <span class="toolbar-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toolbar-icon"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                Sắp xếp:
              </span>
              <select v-model="selectedSort" @change="applyFilters" class="toolbar-select">
                <option value="bestSale">Giảm nhiều nhất</option>
                <option value="priceAsc">Giá thấp đến cao</option>
                <option value="priceDesc">Giá cao đến thấp</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu khuyến mãi...</p>
        </div>

        <div v-else-if="errorMsg" class="error-state">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p>{{ errorMsg }}</p>
          <button @click="fetchData" class="btn-retry">Thử lại</button>
        </div>

        <div v-else>
          <div v-if="filteredProducts.length > 0">
            <div class="product-grid">
              <transition-group name="list">
                <div
                  v-for="sp in displayedProducts"
                  :key="sp.id"
                  class="product-card"
                >
                  <div class="image-box" @click="goDetail(sp.id)">
                    <img :src="sp.hinhAnh" :alt="sp.tenSp" @error="handleImageError" />
                    <span class="badge badge-sale">-{{ getDiscountPercent(sp) }}%</span>
                  </div>

                  <div class="product-info">
                    <h3 class="product-name" :title="sp.tenSp" @click="goDetail(sp.id)">{{ sp.tenSp }}</h3>
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
                    
                    <button class="btn-quick-add" @click.stop="quickAddToCart(sp)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-cart-icon">
                        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      Thêm vào giỏ
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
            <div class="empty-icon">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15H9"></line></svg>
            </div>
            <p>Không tìm thấy ưu đãi nào phù hợp với bộ lọc.</p>
            <button @click="resetFilters" class="btn-retry">Xóa bộ lọc</button>
          </div>
        </div>
      </section>
    </main>

    <Footer></Footer>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-icon-wrapper">
          <span v-if="toast.type === 'success'">✓</span>
          <span v-else-if="toast.type === 'error'">✕</span>
          <span v-else>!</span>
        </div>
        <div class="toast-content">{{ toast.message }}</div>
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

const router = useRouter();

// Trạng thái dữ liệu
const allProducts = ref([]);
const filteredProducts = ref([]);
const isLoading = ref(true);
const errorMsg = ref("");

// Trạng thái bộ lọc
const searchKeyword = ref("");
const selectedPriceFilter = ref("all");
const selectedSort = ref("bestSale"); // Sắp xếp mặc định của trang Sale

// Phân trang nội bộ
const itemsPerPage = 12;
const visibleCount = ref(itemsPerPage);

// Toast System
const toast = ref({ show: false, message: "", type: "success" });

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 3000);
};

// Computed
const displayedProducts = computed(() => {
  return filteredProducts.value.slice(0, visibleCount.value);
});

const hasMore = computed(() => {
  return visibleCount.value < filteredProducts.value.length;
});

const remainingCount = computed(() => {
  return filteredProducts.value.length - visibleCount.value;
});

// Load More
const loadMoreProducts = () => {
  visibleCount.value += itemsPerPage;
};

// Helper Functions
const formatPrice = (v) => {
  if (v == null) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(v) + " đ";
};

const handleImageError = (event) => {
  event.target.src = "/src/assets/logo/no-image-placeholder.png"; 
};

// GIẢ LẬP DỮ LIỆU SALE (Nếu BE chưa có trường phanTramGiam)
const getDiscountPercent = (sp) => {
  return sp.phanTramGiam || Math.floor(Math.random() * (50 - 15 + 1)) + 15; // Random từ 15% đến 50%
};

const getOldPrice = (sp) => {
  if (sp.giaGoc) return sp.giaGoc;
  const discount = getDiscountPercent(sp) / 100;
  return sp.giaMin / (1 - discount); 
};

const goDetail = (id) => {
  router.push(`/home/product/${id}`);
};

const quickAddToCart = (sp) => {
  showToast("Vui lòng chọn màu sắc và kích cỡ trong trang chi tiết!", "warning");
  setTimeout(() => {
    goDetail(sp.id);
  }, 1200);
};

// Loại bỏ dấu để tìm kiếm
const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const clearSearch = () => {
  searchKeyword.value = "";
  applyFilters();
};

// Lọc và Sắp xếp chính
const applyFilters = () => {
  let result = [...allProducts.value];

  // 1. Tìm kiếm chữ
  if (searchKeyword.value.trim() !== "") {
    const keyword = removeAccents(searchKeyword.value);
    result = result.filter(sp => {
      const name = removeAccents(sp.tenSp || "");
      return name.includes(keyword);
    });
  }

  // 2. Lọc giá (Lọc theo Giá Min đang hiển thị - Giá đã Sale)
  if (selectedPriceFilter.value !== "all") {
    result = result.filter(sp => {
      const price = sp.giaMin;
      if (selectedPriceFilter.value === "under300") return price < 300000;
      if (selectedPriceFilter.value === "300to700") return price >= 300000 && price <= 700000;
      if (selectedPriceFilter.value === "over700") return price > 700000;
      return true;
    });
  }

  // 3. Sắp xếp
  result.sort((a, b) => {
    if (selectedSort.value === "priceAsc") return a.giaMin - b.giaMin;
    if (selectedSort.value === "priceDesc") return b.giaMin - a.giaMin;
    if (selectedSort.value === "bestSale") {
       const discountA = getDiscountPercent(a);
       const discountB = getDiscountPercent(b);
       return discountB - discountA; // Giảm nhiều đứng trước
    }
    return 0;
  });

  filteredProducts.value = result;
  visibleCount.value = itemsPerPage; 
};

const resetFilters = () => {
  searchKeyword.value = "";
  selectedPriceFilter.value = "all";
  selectedSort.value = "bestSale";
  applyFilters();
};

// Lấy dữ liệu
const fetchData = async () => {
  isLoading.value = true;
  errorMsg.value = "";
  try {
    // Nếu BE có api: /api/san-pham/sale thì gọi ở đây. Tạm dùng Home.
    const res = await axios.get("http://localhost:8080/api/san-pham/home");
    
    let rawData = res.data.content || res.data || [];
    
    // Giả lập danh sách Sale (Lấy 20 sản phẩm đầu làm đồ sale)
    // Thực tế nên filter: rawData.filter(sp => sp.isSale === true)
    allProducts.value = rawData.slice(0, 20); 

    applyFilters();
  } catch (error) {
    console.error("Lỗi:", error);
    errorMsg.value = "Hệ thống đang bảo trì. Không thể tải ưu đãi lúc này.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fafafa;
}

.main-content {
  flex-grow: 1;
}

/* Breadcrumb */
.breadcrumb {
  max-width: 1400px;
  margin: 20px auto 0;
  padding: 0 4%;
  font-size: 14px;
  color: #666;
}
.breadcrumb span { cursor: pointer; transition: 0.2s; }
.breadcrumb span:hover { color: #d0021b; }
.breadcrumb .separator { margin: 0 10px; cursor: default; }
.breadcrumb .current { font-weight: 600; color: #d0021b; cursor: default; }

/* Sub Banner Sale */
.sub-banner {
  background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/src/assets/logo/banner 1.png') center/cover;
  background-color: #b91c1c; 
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  margin-top: 20px;
}
.sub-banner h1 { margin: 0 0 10px 0; letter-spacing: 4px; font-size: 38px; font-weight: 900; color: #fecaca; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);}
.sub-banner p { margin: 0; font-size: 18px; font-weight: 500; letter-spacing: 1px;}

.section {
  padding: 40px 4%;
  max-width: 1400px; 
  margin: 0 auto;
  width: 100%;
}

/* ================= TOOLBAR TÌM KIẾM & BỘ LỌC (Dùng màu đỏ chủ đạo) ================= */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
}

.search-group { flex: 1; min-width: 250px; max-width: 400px; }
.search-input-wrapper { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 12px; width: 18px; height: 18px; color: #888; }
.search-input {
  width: 100%;
  padding: 10px 35px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  transition: all 0.3s;
}
.search-input:focus { border-color: #d0021b; box-shadow: 0 0 0 3px rgba(208, 2, 27, 0.1); }
.clear-search-btn { position: absolute; right: 10px; background: none; border: none; color: #999; font-size: 12px; cursor: pointer; padding: 5px; border-radius: 50%; }
.clear-search-btn:hover { background: #eee; color: #333; }

.filter-actions { display: flex; gap: 20px; flex-wrap: wrap; }
.filter-group, .sort-group { display: flex; align-items: center; gap: 12px; }
.toolbar-label { font-weight: 600; color: #555; font-size: 14px; display: flex; align-items: center; gap: 6px; }
.toolbar-icon { width: 16px; height: 16px; }
.toolbar-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
  color: #333;
}
.toolbar-select:hover, .toolbar-select:focus { border-color: #d0021b; box-shadow: 0 0 0 3px rgba(208, 2, 27, 0.1); }


/* ================= PRODUCT GRID ================= */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 30px;
}

.product-card {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(208, 2, 27, 0.15); 
  border-color: #d0021b;
}

.image-box {
  width: 100%;
  height: 300px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f5f5f5;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.image-box img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.5s ease; }
.product-card:hover .image-box img { transform: scale(1.05); }

.badge {
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  z-index: 2;
}
.badge-sale { background-color: #d0021b; box-shadow: 0 4px 6px rgba(208, 2, 27, 0.3); }

.product-info {
  padding: 20px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  height: 42px; 
  cursor: pointer;
  transition: color 0.2s;
}
.product-name:hover { color: #d0021b; }

.price-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-bottom: 15px;
}
.old-price { font-size: 14px; color: #999; text-decoration: line-through; margin: 0; }
.new-price { font-weight: 800; color: #d0021b; font-size: 18px; margin: 0; }

.btn-quick-add {
  background: transparent;
  border: 1px solid #d0021b;
  color: #d0021b;
  padding: 10px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  opacity: 0;
  transform: translateY(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-cart-icon { width: 16px; height: 16px; }
.product-card:hover .btn-quick-add { opacity: 1; transform: translateY(0); }
.btn-quick-add:hover { background: #d0021b; color: #fff; }

/* Animation list */
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(20px); }
.list-leave-active { position: absolute; }

/* Load More */
.load-more-container { display: flex; justify-content: center; margin-top: 50px; }
.btn-load-more {
  padding: 14px 40px;
  background-color: transparent;
  color: #d0021b;
  border: 2px solid #d0021b;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-load-more:hover { background-color: #d0021b; color: #fff; box-shadow: 0 4px 15px rgba(208, 2, 27, 0.2); transform: translateY(-2px); }

/* Loading & Error */
.loading-state, .error-state, .empty-state { text-align: center; padding: 80px 0; color: #666; font-size: 16px; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #d0021b; border-radius: 50%; width: 45px; height: 45px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
.error-icon, .empty-icon { width: 60px; height: 60px; margin: 0 auto 15px; color: #ccc;}
.btn-retry { margin-top: 20px; padding: 12px 30px; background-color: #d0021b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s;}
.btn-retry:hover { background-color: #991b1b; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Toast */
.toast-notification {
  position: fixed;
  top: 25px;
  right: 25px;
  z-index: 10000;
  min-width: 280px;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  background: #fff; 
  border-left: 6px solid #22C55E;
}
.toast-notification.error { border-left-color: #ef4444; }
.toast-notification.warning { border-left-color: #f59e0b; }
.toast-icon-wrapper {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
}
.success .toast-icon-wrapper { background: #22C55E; }
.error .toast-icon-wrapper { background: #ef4444; }
.warning .toast-icon-wrapper { background: #f59e0b; }
.toast-content { margin-left: 12px; font-weight: 500; font-size: 14px; color: #333;}
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }

/* Responsive */
@media (max-width: 1024px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { 
  .product-grid { grid-template-columns: repeat(2, 1fr); } 
  .image-box { height: 220px; } 
  .toolbar { flex-direction: column; align-items: stretch; gap: 15px;}
  .search-group { max-width: 100%; }
  .filter-actions { justify-content: space-between; width: 100%;}
  .sub-banner h1 { font-size: 26px; }
}
@media (max-width: 480px) { 
  .product-grid { grid-template-columns: repeat(1, 1fr); } 
  .filter-actions { flex-direction: column; align-items: stretch; }
  .filter-group, .sort-group { justify-content: space-between;}
}
</style>