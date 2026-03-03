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
          <h2 class="section-title styled-title">
            ÁO KHOÁC NHIỀU LƯỢT MUA NHẤT
          </h2>

          <div class="best-seller-row">
            <button class="arrow left" @click="scrollLeft">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div class="best-seller-container" ref="bestSellerRef">
              <div
                v-for="sp in bestSellers"
                :key="sp.id"
                class="product-card"
                @click="goDetail(sp.id)"
              >
                <div class="image-box">
                  <img
                    :src="sp.hinhAnh"
                    :alt="sp.tenSp"
                    @error="handleImageError"
                  />
                  <span class="badge badge-hot">HOT</span>
                </div>

                <div class="product-info">
                  <h3 class="product-name" :title="sp.tenSp">{{ sp.tenSp }}</h3>
                  <p class="price">
                    <span v-if="sp.giaMin === sp.giaMax" class="price-value">
                      {{ formatPrice(sp.giaMin) }}
                    </span>
                    <span v-else class="price-value">
                      {{ formatPrice(sp.giaMin) }} ~
                      {{ formatPrice(sp.giaMax) }}
                    </span>
                  </p>

                  <button
                    class="btn-quick-add"
                    @click.stop="openQuickAddModal(sp)"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="cart-icon"
                    >
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Thêm nhanh
                  </button>
                </div>
              </div>
            </div>

            <button class="arrow right" @click="scrollRight">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
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
                    <img
                      :src="sp.hinhAnh"
                      :alt="sp.tenSp"
                      @error="handleImageError"
                    />
                  </div>

                  <div class="product-info">
                    <h3 class="product-name" :title="sp.tenSp">
                      {{ sp.tenSp }}
                    </h3>
                    <p class="price">
                      <span v-if="sp.giaMin === sp.giaMax" class="price-value">
                        {{ formatPrice(sp.giaMin) }}
                      </span>
                      <span v-else class="price-value">
                        {{ formatPrice(sp.giaMin) }} ~
                        {{ formatPrice(sp.giaMax) }}
                      </span>
                    </p>

                    <button
                      class="btn-quick-add"
                      @click.stop="openQuickAddModal(sp)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        class="cart-icon"
                      >
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
    <div class="chat-wrapper">
      <button class="chat-toggle-btn" @click="toggleChat">
        <img
          src="https://cdn-icons-png.flaticon.com/512/134/134914.png"
          alt="Chat Icon"
        />
        <span class="chat-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
      </button>

      <div v-if="isChatOpen" class="chat-popup">
        <Chat />
      </div>
    </div>

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
              
              <p class="modal-price">
                <span v-if="currentVariant">
                  {{ formatPrice(currentVariant.giaBan || currentVariant.gia) }}
                </span>
                <span v-else>
                  <span v-if="selectedProduct.giaMin === selectedProduct.giaMax">
                    {{ formatPrice(selectedProduct.giaMin) }}
                  </span>
                  <span v-else>
                    {{ formatPrice(selectedProduct.giaMin) }} ~ {{ formatPrice(selectedProduct.giaMax) }}
                  </span>
                </span>
              </p>

              <div class="attribute-group" v-if="availableColors.length > 0">
                <label>Màu sắc:</label>
                <div class="btn-group">
                  <button 
                    v-for="color in availableColors" :key="color"
                    :class="{ active: selectedColor === color }" 
                    @click="selectedColor = color"
                  >{{ color }}</button>
                </div>
              </div>

              <div class="attribute-group" v-if="availableSizes.length > 0">
                <label>Kích cỡ:</label>
                <div class="btn-group">
                  <button 
                    v-for="size in availableSizes" :key="size"
                    :class="{ active: selectedSize === size }" 
                    @click="selectedSize = size"
                  >{{ size }}</button>
                </div>
              </div>

              <div class="attribute-group">
                <label>
                  Số lượng: 
                  <span v-if="currentVariant" style="font-weight: normal; font-size: 14px; color: #888; margin-left: 10px;">
                    (Kho: {{ currentVariant.soLuongTon || currentVariant.soLuong || 0 }})
                  </span>
                </label>
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
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import axios from "axios";
import { useRouter } from "vue-router";
import Chat from "../../views/Chat.vue";

const isChatOpen = ref(false);
const unreadCount = ref(0); 

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
  if (isChatOpen.value) unreadCount.value = 0;
};

const router = useRouter();

// ================= LOGIC SLIDER BANNER =================
const banners = ref([
  "/src/assets/logo/banner 1.png",
  "/src/assets/logo/banner 2.png",
  // "/src/assets/logo/banner 3.png",
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
  slideInterval = setInterval(nextBanner, 4000); 
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
    errorMsg.value =
      "Hệ thống đang bảo trì. Không thể tải danh sách sản phẩm lúc này.";
  } finally {
    isLoading.value = false;
  }
};
// ================= LOGIC THÊM NHANH (QUICK ADD) THẬT TỪ API =================
const isQuickAddModalOpen = ref(false);
const selectedProduct = ref(null);
const quantity = ref(1);

const selectedColor = ref("");
const selectedSize = ref("");

// Chứa danh sách chi tiết sản phẩm thật gọi từ API
const productVariants = ref([]);
const availableColors = ref([]);
const availableSizes = ref([]);

// Tự động tìm Biến thể (Chi tiết sản phẩm) khớp với Màu và Size đang chọn
const currentVariant = computed(() => {
  if (!productVariants.value.length || !selectedColor.value || !selectedSize.value) return null;
  
  return productVariants.value.find(v => {
    // Tùy thuộc vào tên trường API trả về (có thể là tenMauSac, hoặc mauSac.tenMauSac)
    const tenMau = v.tenMauSac || v.mauSac?.tenMauSac || v.mauSac || v.tenMau;
    const tenSize = v.tenKichCo || v.kichCo?.tenKichCo || v.kichCo || v.tenSize;
    
    return tenMau === selectedColor.value && tenSize === selectedSize.value;
  });
});

const openQuickAddModal = async (sp) => {
  selectedProduct.value = sp;
  quantity.value = 1;
  isQuickAddModalOpen.value = true;

  try {
    // GỌI API THEO ĐÚNG CONTROLLER BẠN CUNG CẤP
    const res = await axios.get(`http://localhost:8080/api/chi-tiet-san-pham?productId=${sp.id}&size=100`);
    
    // Spring Boot Page trả về mảng dữ liệu trong thuộc tính 'content'
    productVariants.value = res.data.content || res.data || [];

    if (productVariants.value.length > 0) {
      // Trích xuất danh sách Màu sắc không trùng lặp
      const colors = [...new Set(productVariants.value.map(v => v.tenMauSac || v.mauSac?.tenMauSac || v.mauSac || v.tenMau))].filter(Boolean);
      // Trích xuất danh sách Kích cỡ không trùng lặp
      const sizes = [...new Set(productVariants.value.map(v => v.tenKichCo || v.kichCo?.tenKichCo || v.kichCo || v.tenSize))].filter(Boolean);

      availableColors.value = colors;
      availableSizes.value = sizes;

      // Chọn sẵn lựa chọn đầu tiên cho khách
      if (colors.length > 0) selectedColor.value = colors[0];
      if (sizes.length > 0) selectedSize.value = sizes[0];
    } else {
      availableColors.value = [];
      availableSizes.value = [];
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    showToast("Không thể tải thông tin chi tiết của sản phẩm này!", "error");
  }
};

const closeQuickAddModal = () => {
  isQuickAddModalOpen.value = false;
  setTimeout(() => { 
    selectedProduct.value = null; 
    productVariants.value = [];
  }, 300);
};

const confirmAddToCart = () => {
  if (!selectedColor.value || !selectedSize.value) {
    showToast("Vui lòng chọn màu sắc và kích cỡ!", "warning");
    return;
  }

  if (!currentVariant.value) {
    showToast("Phân loại này hiện không tồn tại hoặc đã hết hàng!", "error");
    return;
  }

  // Lấy tồn kho (Tùy thuộc tên trường là soLuongTon hay soLuong)
  const tonKhoThucTe = currentVariant.value.soLuongTon || currentVariant.value.soLuong || 0;

  if (quantity.value > tonKhoThucTe) {
    showToast(`Kho chỉ còn ${tonKhoThucTe} sản phẩm!`, "error");
    return;
  }
  
  try {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const newItem = {
      productId: selectedProduct.value.id,
      variantId: currentVariant.value.id, // Lấy đúng ID của bảng ChiTietSanPham
      tenSp: selectedProduct.value.tenSp,
      hinhAnh: currentVariant.value.hinhAnh || selectedProduct.value.hinhAnh,
      mauSac: { tenMau: selectedColor.value, rgb: '#6b3f1e' }, // CSS màu mặc định
      kichCo: selectedSize.value,
      giaBan: currentVariant.value.giaBan || currentVariant.value.gia || 0,
      soLuong: quantity.value,
      tonKho: tonKhoThucTe
    };

    const existingIndex = cart.findIndex(item => item.variantId === newItem.variantId);
    
    if (existingIndex !== -1) {
      const newQty = cart[existingIndex].soLuong + newItem.soLuong;
      if(newQty > cart[existingIndex].tonKho) {
        showToast(`Vượt quá số lượng tồn kho (${tonKhoThucTe})!`, "error");
        return;
      }
      cart[existingIndex].soLuong = newQty;
    } else {
      cart.push(newItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    showToast(`Đã thêm ${selectedProduct.value.tenSp} vào giỏ hàng!`, "success");
    closeQuickAddModal();
  } catch (error) {
    console.error(error);
    showToast("Thêm vào giỏ thất bại, vui lòng kiểm tra lại!", "error");
  }
};

onMounted(() => {
  fetchData();
  startSlide(); 
});

onBeforeUnmount(() => {
  pauseSlide(); 
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fafafa;
}

/* ================= SLIDER BANNER CSS ================= */
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
  opacity: 0; 
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
.best-seller-container::-webkit-scrollbar {
  display: none;
}

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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  color: #555;
}
.arrow svg {
  width: 24px;
  height: 24px;
}
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
.badge-hot {
  background-color: #ef4444;
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
}

/* ================= PRODUCT GRID ================= */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

/* ================= PRODUCT CARD ================= */
.product-card {
  width: 100%; 
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

.best-seller-container .product-card {
  width: 280px; 
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(107, 63, 30, 0.15);
  border-color: #6b3f1e;
}

.image-box {
  width: 100%;
  height: 320px; 
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

.product-card:hover .image-box img {
  transform: scale(1.05);
}

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
.product-card:hover .product-name {
  color: #6b3f1e;
}

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
  z-index: 3;
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
  background: #6b3f1e;
  color: #fff;
}

/* Animation list */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

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
  background: #6b3f1e;
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

/* ================= CHAT ================= */
.chat-wrapper {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
}

.chat-toggle-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #6b3f1e;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.chat-toggle-btn:hover {
  transform: scale(1.1);
}

.chat-toggle-btn img {
  width: 30px;
  height: 30px;
  filter: invert(1);
}

.chat-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 4px 8px;
  font-size: 12px;
  border: 2px solid white;
}

.chat-popup {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ================= MODAL QUICK ADD (MỚI) ================= */
.modal-overlay {
  position: fixed; 
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 10000;
}

.quick-add-modal {
  background: #fff; 
  width: 90%; 
  max-width: 800px;
  border-radius: 12px; 
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  padding: 30px; 
  animation: slideUp 0.3s ease;
}

.close-btn {
  position: absolute; 
  top: 15px; 
  right: 15px;
  background: transparent; 
  border: none; 
  font-size: 28px;
  cursor: pointer; 
  color: #888; 
  transition: color 0.3s;
}

.close-btn:hover { color: #d32f2f; }

.modal-content { 
  display: flex; 
  gap: 30px; 
}

.modal-left { 
  flex: 1; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: #f9f9f9; 
  border-radius: 8px; 
  overflow: hidden; 
  height: 400px; 
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
  margin-bottom: 10px; 
}

.modal-price { 
  font-size: 20px; 
  color: #d32f2f; 
  font-weight: bold; 
  margin-bottom: 25px; 
  border-bottom: 1px solid #eee; 
  padding-bottom: 15px; 
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

.btn-group { 
  display: flex; 
  gap: 10px; 
  flex-wrap: wrap; 
}

.btn-group button { 
  padding: 8px 16px; 
  border: 1px solid #ccc; 
  background: #fff; 
  border-radius: 6px; 
  cursor: pointer; 
  transition: all 0.2s; 
  font-size: 14px; 
}

.btn-group button:hover { 
  border-color: #6b3f1e; 
  color: #6b3f1e; 
}

.btn-group button.active { 
  background: #6b3f1e; 
  color: #fff; 
  border-color: #6b3f1e; 
  font-weight: bold; 
}

.quantity-control { 
  display: flex; 
  align-items: center; 
  border: 1px solid #ccc; 
  width: fit-content; 
  border-radius: 6px; 
  overflow: hidden; 
}

.quantity-control button { 
  width: 35px; 
  height: 35px; 
  background: #f5f5f5; 
  border: none; 
  font-size: 18px; 
  cursor: pointer; 
}

.quantity-control button:hover { 
  background: #e0e0e0; 
}

.quantity-control input { 
  height: 35px; 
  text-align: center; 
  border: none; 
  border-left: 1px solid #ccc; 
  border-right: 1px solid #ccc; 
  font-size: 16px; 
  font-weight: bold; 
  outline: none; 
}

.modal-actions { 
  margin-top: 30px; 
  display: flex; 
  gap: 15px; 
}

.btn-confirm-add { 
  flex: 2; 
  background: #6b3f1e; 
  color: white; 
  border: none; 
  padding: 12px; 
  font-size: 16px; 
  font-weight: bold; 
  border-radius: 6px; 
  cursor: pointer; 
  transition: background 0.3s; 
}

.btn-confirm-add:hover { 
  background: #553218; 
}

.btn-view-detail { 
  flex: 1; 
  background: transparent; 
  color: #6b3f1e; 
  border: 1px solid #6b3f1e; 
  padding: 12px; 
  font-size: 16px; 
  font-weight: bold; 
  border-radius: 6px; 
  cursor: pointer; 
  transition: all 0.3s; 
}

.btn-view-detail:hover { 
  background: #6b3f1e; 
  color: white; 
}

.modal-fade-enter-active, .modal-fade-leave-active { 
  transition: opacity 0.3s; 
}

.modal-fade-enter-from, .modal-fade-leave-to { 
  opacity: 0; 
}

@keyframes slideUp { 
  from { transform: translateY(30px); opacity: 0; } 
  to { transform: translateY(0); opacity: 1; } 
}

/* ================= RESPONSIVE ================= */
@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  .best-seller-container .product-card {
    width: 250px;
  }
  .image-box { 
    height: 280px; 
  }
}

@media (max-width: 768px) {
  .product-grid { 
    grid-template-columns: repeat(2, 1fr); 
    gap: 15px;
  }
  .best-seller-container .product-card { 
    width: 220px; 
  }
  .image-box { 
    height: 240px; 
  }
  .banner-slider { height: 320px; }
  .best-seller-container { padding-bottom: 10px; }
  
  /* Căn lại modal cho Mobile */
  .modal-content { flex-direction: column; gap: 15px; }
  .modal-left { height: 250px; }
}

@media (max-width: 480px) {
  .product-grid { 
    grid-template-columns: repeat(1, 1fr); 
  }
  .best-seller-container .product-card { 
    width: 260px; 
  }
  .image-box { 
    height: 300px; 
  }
  .banner-slider { height: 200px; }
}
</style>