<template>
  <div class="app-container">
    <Header></Header>

    <section 
      class="banner-slider" 
      @mouseenter="pauseSlide" 
      @mouseleave="startSlide"
    >
      <div 
        class="slides-wrapper" 
        :style="{ transform: `translateX(-${currentBanner * 100}%)` }"
      >
        <div class="slide" v-for="(img, index) in banners" :key="index">
          <img :src="img" :alt="'Banner ' + (index + 1)" />
        </div>
      </div>

      <button class="slider-arrow prev" @click="prevBanner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <button class="slider-arrow next" @click="nextBanner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>

      <div class="slider-dots">
        <span 
          v-for="(_, index) in banners" 
          :key="index"
          class="dot" 
          :class="{ active: currentBanner === index }"
          @click="goToBanner(index)"
        ></span>
      </div>
    </section>

    <main class="main-content">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu sản phẩm...</p>
      </div>

      <div v-else-if="errorMsg" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ errorMsg }}</p>
        <button @click="fetchData" class="btn-retry">Thử lại</button>
      </div>

      <template v-else>
        <section class="section" v-if="bestSellers.length > 0">
          <h2 class="section-title styled-title">ÁO KHOÁC NHIỀU LƯỢT MUA NHẤT</h2>

          <div class="best-seller-row">
            <button class="arrow left" @click="scrollLeft">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            
            <div class="best-seller-container" ref="bestSellerRef">
              <div
                v-for="sp in bestSellers"
                :key="sp.id"
                class="product-card"
                @click="goDetail(sp.id)"
              >
                <div class="image-box">
                  <img :src="sp.hinhAnh" :alt="sp.tenSp" @error="handleImageError" />
                  <span class="badge badge-hot">HOT</span>
                </div>

                <div class="product-info">
                  <h3 class="product-name" :title="sp.tenSp">{{ sp.tenSp }}</h3>
                  <p class="price">
                    <span v-if="sp.giaMin === sp.giaMax" class="price-value">
                      {{ formatPrice(sp.giaMin) }}
                    </span>
                    <span v-else class="price-value">
                      {{ formatPrice(sp.giaMin) }} ~ {{ formatPrice(sp.giaMax) }}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <button class="arrow right" @click="scrollRight">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title styled-title">TẤT CẢ SẢN PHẨM</h2>

          <div v-if="products.length > 0">
            <div class="product-grid">
              <transition-group name="list">
                <div
                  v-for="sp in displayedProducts"
                  :key="sp.id"
                  class="product-card"
                  @click="goDetail(sp.id)"
                >
                  <div class="image-box">
                    <img :src="sp.hinhAnh" :alt="sp.tenSp" @error="handleImageError" />
                  </div>

                  <div class="product-info">
                    <h3 class="product-name" :title="sp.tenSp">{{ sp.tenSp }}</h3>
                    <p class="price">
                      <span v-if="sp.giaMin === sp.giaMax" class="price-value">
                        {{ formatPrice(sp.giaMin) }}
                      </span>
                      <span v-else class="price-value">
                        {{ formatPrice(sp.giaMin) }} ~ {{ formatPrice(sp.giaMax) }}
                      </span>
                    </p>
                    
                    <button class="btn-quick-add" @click.stop="quickAddToCart(sp)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cart-icon">
                        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </transition-group>
            </div>

            <div v-if="hasMore" class="load-more-container">
              <button class="btn-load-more" @click="loadMoreProducts">
                Xem thêm (Còn {{ remainingCount }} sản phẩm)
              </button>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">🧥</div>
            <p>Hiện chưa có sản phẩm nào được cập nhật.</p>
          </div>
        </section>
      </template>
    </main>

    <Footer></Footer>
    
    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-icon">
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
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

// ================= LOGIC SLIDER BANNER =================
const banners = ref([
  "/src/assets/logo/banner 1.png",
  // Thêm link ảnh thật của bạn vào 2 dòng dưới này (hoặc xóa đi nếu chỉ dùng 1 ảnh):
  "https://file.hstatic.net/1000360022/file/banner_web_2_9e3d09a06cc54ffab917ccf95e2cd0d4_master.jpg",
  "https://file.hstatic.net/1000360022/file/banner_web_1_8f1dbb16ba6f4523ad0328ed4a29a39f_master.jpg"
]);
const currentBanner = ref(0);
let slideInterval = null;

const nextBanner = () => {
  currentBanner.value = (currentBanner.value + 1) % banners.value.length;
};

const prevBanner = () => {
  currentBanner.value = (currentBanner.value - 1 + banners.value.length) % banners.value.length;
};

const goToBanner = (index) => {
  currentBanner.value = index;
};

const startSlide = () => {
  slideInterval = setInterval(nextBanner, 4000); // 4 giây tự động lướt 1 lần
};

const pauseSlide = () => {
  clearInterval(slideInterval);
};

// ================= LOGIC SẢN PHẨM =================
const bestSellers = ref([]);
const products = ref([]);
const isLoading = ref(true);
const errorMsg = ref("");
const bestSellerRef = ref(null);

const itemsPerPage = 8;
const visibleCount = ref(itemsPerPage);

const toast = ref({ show: false, message: "", type: "success" });
const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 3000);
};

const displayedProducts = computed(() => products.value.slice(0, visibleCount.value));
const hasMore = computed(() => visibleCount.value < products.value.length);
const remainingCount = computed(() => products.value.length - visibleCount.value);

const loadMoreProducts = () => {
  visibleCount.value += itemsPerPage;
};

const goDetail = (id) => {
  router.push(`/home/product/${id}`);
};

const quickAddToCart = (sp) => {
  showToast("Vui lòng chọn màu sắc và kích cỡ trong trang chi tiết!", "warning");
  setTimeout(() => goDetail(sp.id), 1000);
};

const formatPrice = (v) => {
  if (v == null) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(v) + " đ";
};

const handleImageError = (event) => {
  event.target.src = "/src/assets/logo/no-image-placeholder.png"; 
};

const scrollLeft = () => {
  if (bestSellerRef.value) bestSellerRef.value.scrollBy({ left: -320, behavior: "smooth" });
};

const scrollRight = () => {
  if (bestSellerRef.value) bestSellerRef.value.scrollBy({ left: 320, behavior: "smooth" });
};

const fetchData = async () => {
  isLoading.value = true;
  errorMsg.value = "";
  try {
    const [bs, all] = await Promise.all([
      axios.get("http://localhost:8080/api/san-pham/best-seller"),
      axios.get("http://localhost:8080/api/san-pham/home"),
    ]);
    
    bestSellers.value = bs.data || [];
    products.value = all.data.content || all.data || [];
    
  } catch (error) {
    console.error("Lỗi khi gọi API trang chủ:", error);
    errorMsg.value = "Hệ thống đang bảo trì. Không thể tải danh sách sản phẩm lúc này.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
  startSlide(); // Khởi động slider
});

onBeforeUnmount(() => {
  pauseSlide(); // Xóa bộ nhớ dọn dẹp khi rời trang
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fafafa;
}

/* ================= SLIDER BANNER CSS (MỚI) ================= */
.banner-slider {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
}

.slides-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide {
  min-width: 100%;
  height: 100%;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
  color: #333;
  opacity: 0; /* Ẩn mặc định, hiện khi hover vào banner */
}

.slider-arrow svg { width: 28px; height: 28px; }

.banner-slider:hover .slider-arrow { opacity: 1; }

.slider-arrow:hover {
  background: #6b3f1e;
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.slider-arrow.prev { left: 20px; }
.slider-arrow.next { right: 20px; }

.slider-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.dot {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.dot:hover { background: rgba(255, 255, 255, 0.8); }

.dot.active {
  background: #6b3f1e;
  width: 30px;
  border-radius: 10px;
}

/* ================= SECTION & TITLE ================= */
.section {
  padding: 60px 4%;
  max-width: 1400px; 
  margin: 0 auto;
  width: 100%;
}

.styled-title {
  font-size: 28px;
  font-weight: bold;
  color: #6b3f1e;
  text-transform: uppercase;
  letter-spacing: 2px;
  border-bottom: 2px solid #6b3f1e;
  display: block;
  text-align: center;
  padding-bottom: 10px;
  margin-bottom: 40px;
  width: fit-content; 
  margin-left: auto;
  margin-right: auto;
}

/* ================= BEST SELLER ================= */
.best-seller-row {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
}

.best-seller-container {
  display: flex;
  gap: 25px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 15px 5px 25px 5px; 
  flex-grow: 1;
  -ms-overflow-style: none;
  scrollbar-width: none; 
}
.best-seller-container::-webkit-scrollbar { display: none; }

.arrow {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  color: #555;
}
.arrow svg { width: 24px; height: 24px; }
.arrow:hover {
  background: #6b3f1e;
  border-color: #6b3f1e;
  color: #fff;
  transform: scale(1.05);
}

.badge {
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  z-index: 2;
  letter-spacing: 1px;
}
.badge-hot { background-color: #ef4444; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3); }

/* ================= PRODUCT GRID ================= */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 30px;
}

/* ================= PRODUCT CARD ================= */
.product-card {
  width: 260px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0; 
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(107, 63, 30, 0.15); 
  border-color: #6b3f1e;
}

.image-box {
  width: 100%;
  height: 280px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f5f5f5;
  overflow: hidden;
  position: relative;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: contain; 
  transition: transform 0.5s ease;
}

.product-card:hover .image-box img { transform: scale(1.05); }

/* Thông tin sản phẩm */
.product-info {
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  height: 42px; 
  transition: color 0.2s;
}
.product-card:hover .product-name { color: #6b3f1e; }

.price {
  font-weight: 700;
  color: #d32f2f; 
  font-size: 16px;
  margin-bottom: 5px;
}

/* Quick Add Button */
.btn-quick-add {
  background: transparent;
  border: 1px solid #6b3f1e;
  color: #6b3f1e;
  padding: 10px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  opacity: 0;
  transform: translateY(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}
.cart-icon { width: 16px; height: 16px; }
.product-card:hover .btn-quick-add {
  opacity: 1;
  transform: translateY(0);
}
.btn-quick-add:hover {
  background: #6b3f1e;
  color: #fff;
}

/* Animation list */
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(30px); }

/* ================= NÚT XEM THÊM ================= */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}
.btn-load-more {
  padding: 12px 40px;
  background-color: transparent;
  color: #6b3f1e;
  border: 2px solid #6b3f1e;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-load-more:hover {
  background-color: #6b3f1e;
  color: #fff;
  box-shadow: 0 4px 10px rgba(107, 63, 30, 0.2);
}

/* ================= STATES & TOAST ================= */
.loading-state, .error-state, .empty-state { text-align: center; padding: 80px 0; color: #666; font-size: 16px; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #6b3f1e; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
.error-icon, .empty-icon { font-size: 48px; margin-bottom: 15px; opacity: 0.5; }
.btn-retry { margin-top: 15px; padding: 10px 24px; background-color: #6b3f1e; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.toast-notification { position: fixed; top: 25px; right: 25px; z-index: 10001; min-width: 280px; padding: 16px 20px; border-radius: 8px; display: flex; align-items: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); background: #fff; border-left: 6px solid #22C55E; }
.toast-notification.error { border-left-color: #ef4444; }
.toast-notification.warning { border-left-color: #f59e0b; }
.toast-icon { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; }
.success .toast-icon { background: #22C55E; }
.error .toast-icon { background: #ef4444; }
.warning .toast-icon { background: #f59e0b; }
.toast-content { margin-left: 12px; font-weight: 500; color: #333; font-size: 15px;}
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }

/* ================= RESPONSIVE ================= */
@media (max-width: 1024px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .product-card { width: 100%; max-width: 300px; margin: 0 auto; }
  .image-box { height: 250px; }
  .banner-slider { height: 320px; }
  .best-seller-container { padding-bottom: 10px; }
}
@media (max-width: 480px) {
  .product-grid { grid-template-columns: repeat(1, 1fr); justify-items: center; }
  .banner-slider { height: 200px; }
}
</style>