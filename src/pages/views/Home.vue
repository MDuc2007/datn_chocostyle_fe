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
      <button class="slider-arrow next" @click="nextBanner">
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
        <div class="modern-spinner"></div>
        <p>Đang tải bộ sưu tập thời trang...</p>
      </div>

      <div v-else-if="errorMsg" class="error-state">
        <p>{{ errorMsg }}</p>
        <button @click="fetchData" class="btn-retry">Tải lại trang</button>
      </div>

      <template v-else>
        <section class="section" v-if="bestSellers.length > 0">
          <div class="title-wrapper">
            <h2 class="section-title styled-title">ÁO KHOÁC BÁN CHẠY</h2>
            <p class="section-subtitle">
              Những mẫu thiết kế được yêu thích nhất tháng
            </p>
          </div>

          <div class="slider-row">
            <button class="arrow left" @click="scrollLeft('bestSellerRef')">
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

            <div class="slider-container" ref="bestSellerRef">
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
                  <span v-if="sp.phanTramGiam > 0" class="badge badge-sale"
                    >-{{ sp.phanTramGiam }}%</span
                  >
                  <span v-else class="badge badge-hot">HOT</span>
                </div>

                <div class="product-info">
                  <h3 class="product-name" :title="sp.tenSp">{{ sp.tenSp }}</h3>
                  <div class="price-wrapper">
                    <template v-if="sp.phanTramGiam > 0">
                      <p class="old-price">
                        <span v-if="sp.giaGoc">{{
                          formatPrice(sp.giaGoc)
                        }}</span>
                        <span v-else>{{ formatPrice(sp.giaMin) }}</span>
                      </p>
                      <p class="price new-price">
                        <span v-if="sp.giaMin === sp.giaMax">{{
                          formatPrice(sp.giaMin)
                        }}</span>
                        <span v-else
                          >{{ formatPrice(sp.giaMin) }} ~
                          {{ formatPrice(sp.giaMax) }}</span
                        >
                      </p>
                    </template>
                    <template v-else>
                      <p class="price current-price">
                        <span v-if="sp.giaMin === sp.giaMax">{{
                          formatPrice(sp.giaMin)
                        }}</span>
                        <span v-else
                          >{{ formatPrice(sp.giaMin) }} ~
                          {{ formatPrice(sp.giaMax) }}</span
                        >
                      </p>
                    </template>
                  </div>
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
                      <path
                        d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                      ></path>
                    </svg>
                    Thêm Nhanh
                  </button>
                </div>
              </div>
            </div>

            <button class="arrow right" @click="scrollRight('bestSellerRef')">
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

        <section class="section bg-sale" v-if="saleProducts.length > 0">
          <div class="title-wrapper">
            <h2 class="section-title styled-title sale-title">
              ƯU ĐÃI GIẢM GIÁ
            </h2>
            <p class="section-subtitle text-sale">
              Nhanh tay sở hữu thiết kế cao cấp với giá cực sốc
            </p>
          </div>

          <div class="slider-row">
            <button class="arrow left" @click="scrollLeft('saleProductRef')">
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

            <div class="slider-container" ref="saleProductRef">
              <div
                v-for="sp in saleProducts"
                :key="sp.id"
                class="product-card card-sale"
                @click="goDetail(sp.id)"
              >
                <div class="image-box">
                  <img
                    :src="sp.hinhAnh"
                    :alt="sp.tenSp"
                    @error="handleImageError"
                  />
                  <span class="badge badge-sale">-{{ sp.phanTramGiam }}%</span>
                </div>

                <div class="product-info">
                  <h3 class="product-name" :title="sp.tenSp">{{ sp.tenSp }}</h3>
                  <div class="price-wrapper">
                    <p class="old-price">
                      <span v-if="sp.giaGoc">{{ formatPrice(sp.giaGoc) }}</span>
                    </p>
                    <p class="price new-price">
                      <span v-if="sp.giaMin === sp.giaMax">{{
                        formatPrice(sp.giaMin)
                      }}</span>
                      <span v-else
                        >{{ formatPrice(sp.giaMin) }} ~
                        {{ formatPrice(sp.giaMax) }}</span
                      >
                    </p>
                  </div>
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
                      <path
                        d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                      ></path>
                    </svg>
                    Thêm Nhanh
                  </button>
                </div>
              </div>
            </div>

            <button class="arrow right" @click="scrollRight('saleProductRef')">
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
          <div class="title-wrapper">
            <h2 class="section-title styled-title">BỘ SƯU TẬP MỚI</h2>
            <p class="section-subtitle">
              Khám phá toàn bộ thiết kế ấn tượng từ ChocoStyle
            </p>
          </div>

          <div v-if="products.length > 0">
            <div class="product-grid">
              <transition-group
                name="staggered-fade"
                tag="div"
                class="grid-wrapper"
              >
                <div
                  v-for="(sp, index) in displayedProducts"
                  :key="sp.id"
                  class="product-card"
                  :style="{ '--delay': `${index * 0.05}s` }"
                  @click="goDetail(sp.id)"
                >
                  <div class="image-box">
                    <img
                      :src="sp.hinhAnh"
                      :alt="sp.tenSp"
                      @error="handleImageError"
                    />
                    <span v-if="sp.phanTramGiam > 0" class="badge badge-sale"
                      >-{{ sp.phanTramGiam }}%</span
                    >
                  </div>

                  <div class="product-info">
                    <h3 class="product-name" :title="sp.tenSp">
                      {{ sp.tenSp }}
                    </h3>
                    <div class="price-wrapper">
                      <template v-if="sp.phanTramGiam > 0">
                        <p class="old-price">
                          <span v-if="sp.giaGoc">{{
                            formatPrice(sp.giaGoc)
                          }}</span>
                          <span v-else>{{ formatPrice(sp.giaMin) }}</span>
                        </p>
                        <p class="price new-price">
                          <span v-if="sp.giaMin === sp.giaMax">{{
                            formatPrice(sp.giaMin)
                          }}</span>
                          <span v-else
                            >{{ formatPrice(sp.giaMin) }} ~
                            {{ formatPrice(sp.giaMax) }}</span
                          >
                        </p>
                      </template>
                      <template v-else>
                        <p class="price current-price">
                          <span v-if="sp.giaMin === sp.giaMax">{{
                            formatPrice(sp.giaMin)
                          }}</span>
                          <span v-else
                            >{{ formatPrice(sp.giaMin) }} ~
                            {{ formatPrice(sp.giaMax) }}</span
                          >
                        </p>
                      </template>
                    </div>
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
                        <path
                          d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                        ></path>
                      </svg>
                      Thêm Nhanh
                    </button>
                  </div>
                </div>
              </transition-group>
            </div>

            <div v-if="hasMore" class="load-more-container">
              <button class="btn-load-more" @click="loadMoreProducts">
                Xem thêm (Còn {{ remainingCount }})
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

    <transition name="fade">
      <button v-if="showScrollTop" class="scroll-top-btn" @click="scrollToTop">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>
    </transition>

    <div class="chat-wrapper">
      <button class="chat-toggle-btn" @click="toggleChat">
        <img
          src="/src/assets/icon/chat-round-line-svgrepo-com.svg"
          style="width: 30px; height: 30px"
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
          <span v-if="toast.type === 'success'"></span>
          <span v-else-if="toast.type === 'error'"></span>
          <span v-else></span>
        </div>
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>

    <transition name="modal-bounce">
      <div
        v-if="isQuickAddModalOpen"
        class="modal-overlay"
        @click.self="closeQuickAddModal"
      >
        <div class="quick-add-modal">
          <button class="close-btn" @click="closeQuickAddModal">×</button>

          <div class="modal-content" v-if="selectedProduct">
            <div class="modal-left">
              <img
                :src="selectedProduct.hinhAnh"
                :alt="selectedProduct.tenSp"
                @error="handleImageError"
              />
            </div>

            <div class="modal-right">
              <span class="modal-tag" v-if="selectedProduct.phanTramGiam > 0"
                >HOT SALE -{{ selectedProduct.phanTramGiam }}%</span
              >
              <h3 class="modal-product-name">{{ selectedProduct.tenSp }}</h3>

              <div class="modal-price-box">
                <template v-if="currentVariant">
                  <span
                    v-if="selectedProduct.phanTramGiam > 0"
                    class="modal-old-price"
                  >
                    {{
                      formatPrice(currentVariant.giaBan || currentVariant.gia)
                    }}
                  </span>
                  <span class="modal-current-price">
                    {{
                      formatPrice(
                        getDiscountedPrice(
                          currentVariant.giaBan || currentVariant.gia,
                          selectedProduct.phanTramGiam,
                        ),
                      )
                    }}
                  </span>
                </template>
                <template v-else>
                  <template v-if="selectedProduct.phanTramGiam > 0">
                    <span class="modal-old-price">
                      <span v-if="selectedProduct.giaGoc">{{
                        formatPrice(selectedProduct.giaGoc)
                      }}</span>
                      <span
                        v-else-if="
                          selectedProduct.giaMin === selectedProduct.giaMax
                        "
                        >{{
                          formatPrice(
                            selectedProduct.giaMin /
                              (1 - selectedProduct.phanTramGiam / 100),
                          )
                        }}</span
                      >
                      <span v-else
                        >{{
                          formatPrice(
                            selectedProduct.giaMin /
                              (1 - selectedProduct.phanTramGiam / 100),
                          )
                        }}
                        ~
                        {{
                          formatPrice(
                            selectedProduct.giaMax /
                              (1 - selectedProduct.phanTramGiam / 100),
                          )
                        }}</span
                      >
                    </span>
                    <span class="modal-current-price">
                      <span
                        v-if="selectedProduct.giaMin === selectedProduct.giaMax"
                        >{{ formatPrice(selectedProduct.giaMin) }}</span
                      >
                      <span v-else
                        >{{ formatPrice(selectedProduct.giaMin) }} ~
                        {{ formatPrice(selectedProduct.giaMax) }}</span
                      >
                    </span>
                  </template>
                  <template v-else>
                    <span class="modal-current-price">
                      <span
                        v-if="selectedProduct.giaMin === selectedProduct.giaMax"
                        >{{ formatPrice(selectedProduct.giaMin) }}</span
                      >
                      <span v-else
                        >{{ formatPrice(selectedProduct.giaMin) }} ~
                        {{ formatPrice(selectedProduct.giaMax) }}</span
                      >
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
                <label class="qty-label">
                  Số lượng:
                  <span v-if="currentVariant" class="stock-badge"
                    >Kho:
                    {{
                      currentVariant.soLuongTon || currentVariant.soLuong || 0
                    }}</span
                  >
                </label>
                <div class="quantity-control">
                  <button @click="quantity > 1 && quantity--">-</button>
                  <input type="number" v-model="quantity" min="1" readonly />
                  <button @click="quantity++">+</button>
                </div>
              </div>

              <div class="modal-actions">
                <button class="btn-confirm-add" @click="confirmAddToCart">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="cart-icon-btn"
                  >
                    <path
                      d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                    ></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  Thêm Vào Giỏ
                </button>
                <button
                  class="btn-view-detail"
                  @click="goDetail(selectedProduct.id)"
                >
                  Xem Chi Tiết
                </button>
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

const router = useRouter();

// Nâng cấp: Nút cuộn lên đầu trang
const showScrollTop = ref(false);
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 500;
};
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const isChatOpen = ref(false);
const unreadCount = ref(0);
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
  if (isChatOpen.value) unreadCount.value = 0;
};

// ================= LOGIC SLIDER BANNER =================
const banners = ref([
  "/src/assets/logo/banner 1.png",
  "/src/assets/logo/banner 2.png",
]);
const currentBanner = ref(0);
let slideInterval = null;

const nextBanner = () => {
  currentBanner.value = (currentBanner.value + 1) % banners.value.length;
};
const prevBanner = () => {
  currentBanner.value =
    (currentBanner.value - 1 + banners.value.length) % banners.value.length;
};
const goToBanner = (index) => {
  currentBanner.value = index;
};
const startSlide = () => {
  slideInterval = setInterval(nextBanner, 5000);
}; // Chuyển chậm hơn một chút cho sang
const pauseSlide = () => {
  clearInterval(slideInterval);
};

// ================= LOGIC SẢN PHẨM =================
const bestSellers = ref([]);
const products = ref([]);
const saleProducts = ref([]);

const isLoading = ref(true);
const errorMsg = ref("");
const bestSellerRef = ref(null);
const saleProductRef = ref(null);

const itemsPerPage = 8;
const visibleCount = ref(itemsPerPage);

const toast = ref({ show: false, message: "", type: "success" });
const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 3500);
};

const displayedProducts = computed(() =>
  products.value.slice(0, visibleCount.value),
);
const hasMore = computed(() => visibleCount.value < products.value.length);
const remainingCount = computed(
  () => products.value.length - visibleCount.value,
);

const loadMoreProducts = () => {
  visibleCount.value += itemsPerPage;
};
const goDetail = (id) => {
  router.push(`/home/product/${id}`);
};

const formatPrice = (v) => {
  if (v == null) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(Math.round(v)) + " đ";
};

// Vẫn giữ getDiscountedPrice cho Modal, vì trong Modal biến thể chỉ có giá gốc (giaBan)
const getDiscountedPrice = (price, discountPercent) => {
  if (!discountPercent || discountPercent <= 0) return price;
  return price - (price * discountPercent) / 100;
};

// 👉 HÀM LẤY MÃ MÀU CHUẨN ĐỒNG BỘ CÁC TRANG
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

const handleImageError = (event) => {
  event.target.src = "/src/assets/logo/no-image-placeholder.png";
};

const scrollLeft = (refName) => {
  const el =
    refName === "bestSellerRef" ? bestSellerRef.value : saleProductRef.value;
  if (el) el.scrollBy({ left: -350, behavior: "smooth" });
};

const scrollRight = (refName) => {
  const el =
    refName === "bestSellerRef" ? bestSellerRef.value : saleProductRef.value;
  if (el) el.scrollBy({ left: 350, behavior: "smooth" });
};

const fetchData = async () => {
  isLoading.value = true;
  errorMsg.value = "";
  try {
    const [bsRes, allRes] = await Promise.all([
      axios
        .get("http://localhost:8080/api/san-pham/best-seller")
        .catch(() => ({ data: [] })),
      axios
        .get("http://localhost:8080/api/san-pham/home")
        .catch(() => ({ data: { content: [] } })),
    ]);

    // Gán dữ liệu tạm để xử lý logic thêm Khuyến Mãi
    let tempBestSellers = bsRes.data || [];
    let tempProducts = allRes.data.content || allRes.data || [];

    // Gọi API chi tiết để lấy chính xác giá gốc / giá min / giá max và phần trăm giảm
    const saleRes = await axios
      .get("http://localhost:8080/api/chi-tiet-san-pham?page=0&size=100")
      .catch(() => ({ data: { content: [] } }));
    const rawData = saleRes.data.content || [];
    const uniqueProductsMap = new Map();

    rawData.forEach((item) => {
      const percent = item.phanTramGiam || 0;

      let realProductId = item.sanPham?.id || item.id;
      if (item.maSanPham && item.maSanPham.startsWith("SP")) {
        realProductId = parseInt(item.maSanPham.replace("SP", ""), 10);
      }

      if (!uniqueProductsMap.has(item.maSanPham)) {
        uniqueProductsMap.set(item.maSanPham, {
          id: realProductId,
          maSanPham: item.maSanPham,
          tenSp: item.tenSanPham,
          hinhAnh:
            item.hinhAnh && item.hinhAnh.length > 0 ? item.hinhAnh[0] : null,
          giaMin: item.giaSauGiam || item.giaBan,
          giaMax: item.giaSauGiam || item.giaBan,
          giaGoc: item.giaGoc || item.giaBan,
          phanTramGiam: percent,
        });
      } else {
        const existing = uniqueProductsMap.get(item.maSanPham);
        const currentGia = item.giaSauGiam || item.giaBan;
        if (currentGia < existing.giaMin) existing.giaMin = currentGia;
        if (currentGia > existing.giaMax) existing.giaMax = currentGia;
        if (percent > existing.phanTramGiam) existing.phanTramGiam = percent;
        // Luôn cập nhật giá gốc lớn nhất
        if ((item.giaGoc || item.giaBan) > existing.giaGoc) {
          existing.giaGoc = item.giaGoc || item.giaBan;
        }
      }
    });

    let uniqueSaleProducts = Array.from(uniqueProductsMap.values());

    // ĐỒNG BỘ: Cập nhật thông tin Giá + Khuyến mãi vào Best Sellers và Products
    bestSellers.value = tempBestSellers.map((sp) => {
      const mappedSp = uniqueSaleProducts.find((m) => m.id === sp.id);
      if (mappedSp) {
        return { ...sp, ...mappedSp }; // Lấy đè dữ liệu giá chuẩn từ Map
      }
      return sp;
    });

    products.value = tempProducts.map((sp) => {
      const mappedSp = uniqueSaleProducts.find((m) => m.id === sp.id);
      if (mappedSp) {
        return { ...sp, ...mappedSp }; // Lấy đè dữ liệu giá chuẩn từ Map
      }
      return sp;
    });

    // Lọc ra các sản phẩm sale cho mục riêng
    let onlySaleItems = uniqueSaleProducts.filter((sp) => sp.phanTramGiam > 0);
    onlySaleItems.sort((a, b) => b.phanTramGiam - a.phanTramGiam);
    saleProducts.value = onlySaleItems.slice(0, 10);
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    errorMsg.value = "Hệ thống đang bảo trì. Xin quay lại sau.";
  } finally {
    isLoading.value = false;
  }
};

// ================= LOGIC THÊM NHANH =================
const isQuickAddModalOpen = ref(false);
const selectedProduct = ref(null);
const quantity = ref(1);
const selectedColor = ref("");
const selectedSize = ref("");
const productVariants = ref([]);
const availableColors = ref([]);
const availableSizes = ref([]);

const currentVariant = computed(() => {
  if (
    !productVariants.value.length ||
    !selectedColor.value ||
    !selectedSize.value
  )
    return null;
  return productVariants.value.find((v) => {
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
    const res = await axios.get(
      `http://localhost:8080/api/chi-tiet-san-pham?productId=${sp.id}&size=100`,
    );
    productVariants.value = res.data.content || res.data || [];

    if (productVariants.value.length > 0) {
      const colors = [
        ...new Set(
          productVariants.value.map(
            (v) => v.tenMauSac || v.mauSac?.tenMauSac || v.mauSac || v.tenMau,
          ),
        ),
      ].filter(Boolean);
      const sizes = [
        ...new Set(
          productVariants.value.map(
            (v) => v.tenKichCo || v.kichCo?.tenKichCo || v.kichCo || v.tenSize,
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
  setTimeout(() => {
    selectedProduct.value = null;
    productVariants.value = [];
  }, 300);
};

const confirmAddToCart = () => {
  if (!selectedColor.value || !selectedSize.value)
    return showToast("Vui lòng chọn màu sắc và kích cỡ!", "warning");
  if (!currentVariant.value)
    return showToast(
      "Phân loại này hiện không tồn tại hoặc đã hết hàng!",
      "error",
    );

  const tonKhoThucTe =
    currentVariant.value.soLuongTon || currentVariant.value.soLuong || 0;
  if (quantity.value > tonKhoThucTe)
    return showToast(`Kho chỉ còn ${tonKhoThucTe} sản phẩm!`, "error");

  try {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const giaGoc = currentVariant.value.giaBan || currentVariant.value.gia || 0;
    const phanTram = selectedProduct.value.phanTramGiam || 0;
    const giaSauGiam =
      phanTram > 0 ? giaGoc - (giaGoc * phanTram) / 100 : giaGoc;

    const newItem = {
      productId: selectedProduct.value.id,
      variantId: currentVariant.value.id,
      tenSp: selectedProduct.value.tenSp,
      hinhAnh: currentVariant.value.hinhAnh || selectedProduct.value.hinhAnh,
      mauSac: { tenMau: selectedColor.value, rgb: getColorCode(selectedColor.value) },
      kichCo: selectedSize.value,
      giaBan: giaSauGiam, // Lưu giá ĐÃ GIẢM vào giỏ hàng
      soLuong: quantity.value,
      tonKho: tonKhoThucTe,
    };

    const existingIndex = cart.findIndex(
      (item) => item.variantId === newItem.variantId,
    );
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
  fetchData();
  startSlide();
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  pauseSlide();
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
/* Import Phông chữ cao cấp */
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap");

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fafafa;
  font-family: "Nunito", sans-serif;
  color: #333;
}

/* ================= SLIDER BANNER CSS ================= */
.banner-slider {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  background: #000;
}

.slides-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide {
  min-width: 100%;
  height: 100%;
  position: relative;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0.9;
}

.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  color: #fff;
  opacity: 0;
}

.banner-slider:hover .slider-arrow {
  opacity: 1;
}

.slider-arrow:hover {
  background: #6b3f1e;
  color: white;
  border-color: transparent;
  box-shadow: 0 8px 20px rgba(107, 63, 30, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.slider-arrow.prev {
  left: 30px;
}

.slider-arrow.next {
  right: 30px;
}

.slider-dots {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.dot {
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dot:hover {
  background: rgba(255, 255, 255, 0.9);
}

.dot.active {
  background: #fff;
  width: 35px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* ================= SECTION & TITLE ================= */
.section {
  padding: 80px 4%;
  max-width: 1536px;
  margin: 0 auto;

}

.bg-sale {
  background-color: #fdfaf9;
  border-radius: 20px;
  padding: 60px 4%;
  margin: 20px auto;
  max-width: 1350px;
}

.title-wrapper {
  text-align: center;
  margin-bottom: 50px;
}

.styled-title {
  font-family: "Montserrat", sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  position: relative;
  display: inline-block;
  padding-bottom: 15px;
  margin: 0;
}

.styled-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #6b3f1e, #b88661);
  border-radius: 2px;
}

.section-subtitle {
  font-size: 16px;
  color: #666;
  margin-top: 15px;
  font-weight: 600;
}

.sale-title {
  color: #d32f2f;
}

.sale-title::after {
  background: linear-gradient(90deg, #d32f2f, #ff6b6b);
}

.text-sale {
  color: #d32f2f;
  opacity: 0.8;
}

/* ================= HORIZONTAL SLIDER ================= */
.slider-row {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
}

.slider-container {
  display: flex;
  gap: 25px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 15px 5px 30px 5px;
  flex-grow: 1;
  scroll-snap-type: x mandatory;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.slider-container::-webkit-scrollbar {
  display: none;
}

.arrow {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  color: #555;
  z-index: 2;
}

.arrow:hover {
  background: #6b3f1e;
  border-color: #6b3f1e;
  color: #fff;
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(107, 63, 30, 0.2);
}

/* ================= PRODUCT GRID ================= */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.grid-wrapper {
  display: contents;
}

/* ================= PRODUCT CARD ================= */
.product-card {
  width: 100%;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  flex-shrink: 0;
  scroll-snap-align: start;
  border: 1px solid rgba(0, 0, 0, 0.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
}

.slider-container .product-card {
  width: 280px;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(107, 63, 30, 0.1);
  border-color: rgba(107, 63, 30, 0.1);
}

.card-sale {
  border: 1px solid rgba(211, 47, 47, 0.05);
}

.card-sale:hover {
  box-shadow: 0 20px 40px rgba(211, 47, 47, 0.12);
  border-color: rgba(211, 47, 47, 0.15);
}

.image-box {
  width: 100%;
  height: 340px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  mix-blend-mode: multiply;
}

.product-card:hover .image-box img {
  transform: scale(1.08);
}

/* BADGES */
.badge {
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  font-family: "Montserrat", sans-serif;
  color: white;
  z-index: 2;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.badge-hot {
  background: linear-gradient(135deg, #ff416c, #ff4b2b);
}

.badge-sale {
  background: linear-gradient(135deg, #f53844, #e60023);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(230, 0, 35, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(230, 0, 35, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(230, 0, 35, 0);
  }
}

/* INFO */
.product-info {
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

.product-name {
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #222;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  height: 44px;
  transition: color 0.3s;
  cursor: pointer;
}

.product-card:hover .product-name {
  color: #6b3f1e;
}

.card-sale:hover .product-name {
  color: #d32f2f;
}

/* PRICE */
.price-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 15px;
}

.old-price {
  text-decoration: line-through;
  color: #a0aec0;
  font-size: 14px;
  margin: 0;
  font-weight: 600;
}

.price {
  margin: 0;
  font-weight: 800;
  font-size: 18px;
  font-family: "Montserrat", sans-serif;
  color: #1a1a1a;
}

.new-price {
  color: #d32f2f;
}

/* Quick Add Button */
.btn-quick-add {
  background: rgba(107, 63, 30, 0.05);
  color: #6b3f1e;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transform: translateY(15px);
}

.cart-icon {
  width: 18px;
  height: 18px;
}

.product-card:hover .btn-quick-add {
  opacity: 1;
  transform: translateY(0);
}

.btn-quick-add:hover {
  background: linear-gradient(90deg, #6b3f1e, #8b5328);
  color: #fff;
  box-shadow: 0 8px 15px rgba(107, 63, 30, 0.25);
  transform: translateY(-2px) !important;
}

/* Animations for grid */
.staggered-fade-enter-active,
.staggered-fade-leave-active {
  transition: all 0.5s ease var(--delay);
}

.staggered-fade-enter-from,
.staggered-fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* ================= LOAD MORE ================= */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 60px;
}

.btn-load-more {
  padding: 14px 45px;
  background: #fff;
  color: #6b3f1e;
  border: 2px solid #6b3f1e;
  border-radius: 30px;
  font-family: "Montserrat", sans-serif;
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.btn-load-more:hover {
  background: linear-gradient(90deg, #6b3f1e, #8b5328);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 10px 20px rgba(107, 63, 30, 0.2);
  transform: translateY(-3px);
}

/* ================= LOADING & ERROR ================= */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 100px 0;
  color: #666;
  font-size: 16px;
  font-weight: 600;
}

.modern-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(107, 63, 30, 0.1);
  border-left-color: #6b3f1e;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.btn-retry {
  margin-top: 20px;
  padding: 12px 30px;
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(211, 47, 47, 0.2);
  transition: 0.3s;
}

.btn-retry:hover {
  background: #b71c1c;
  transform: translateY(-2px);
}

/* ================= TOAST MỚI (SUCCESS, ERROR, WARNING) KHÔNG ICON ================= */
.toast-notification {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 10001;
  min-width: 300px;
  padding: 18px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
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

/* ================= BUTTON SCROLL TOP ================= */
.scroll-top-btn {
  position: fixed;
  bottom: 110px;
  right: 35px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #fff;
  color: #6b3f1e;
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9998;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-top-btn svg {
  width: 24px;
  height: 24px;
}

.scroll-top-btn:hover {
  background: #6b3f1e;
  color: #fff;
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(107, 63, 30, 0.3);
}

.chat-wrapper {
  position: fixed;
  bottom: 35px;
  right: 30px;
  z-index: 9999;
}

.chat-toggle-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b3f1e, #8b5328);
  border: none;
  box-shadow: 0 8px 25px rgba(107, 63, 30, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-toggle-btn img {
  width: 28px;
  height: 28px;
  filter: invert(1);
}

/* ===== CLASS MỚI ĐỂ HIỂN THỊ MODAL CHAT CHUẨN ===== */
.chat-popup {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10000;
  transform-origin: bottom right;
}

/* Animation mượt mà cho chat */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

/* ================= MODAL QUICK ADD (Nâng Cấp VIP) ================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.quick-add-modal {
  background: #fff;
  width: 900px;
  max-width: 95%;
  border-radius: 24px;
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #f1f5f9;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #64748b;
  transition: all 0.3s;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #fee2e2;
  color: #d32f2f;
  transform: rotate(90deg);
}

.modal-content {
  display: flex;
  gap: 0;
}

.modal-left {
  flex: 1;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.modal-left img {
  max-width: 100%;
  max-height: 450px;
  object-fit: contain;
  mix-blend-mode: multiply;
  filter: drop-shadow(0 20px 20px rgba(0, 0, 0, 0.05));
}

.modal-right {
  flex: 1.2;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.modal-tag {
  display: inline-block;
  background: #fee2e2;
  color: #d32f2f;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  font-family: "Montserrat", sans-serif;
  letter-spacing: 0.5px;
  width: fit-content;
  margin-bottom: 15px;
}

.modal-product-name {
  font-family: "Montserrat", sans-serif;
  font-size: 26px;
  color: #1a1a1a;
  font-weight: 800;
  margin-bottom: 15px;
  line-height: 1.3;
}

.modal-price-box {
  margin-bottom: 25px;
  border-bottom: 2px dashed #f1f5f9;
  padding-bottom: 20px;
  display: flex;
  align-items: baseline;
  gap: 15px;
}

.modal-old-price {
  text-decoration: line-through;
  color: #94a3b8;
  font-size: 18px;
  font-weight: 600;
}

.modal-current-price {
  color: #d32f2f;
  font-size: 28px;
  font-weight: 800;
  font-family: "Montserrat", sans-serif;
}

.attribute-group {
  margin-bottom: 25px;
}

.attribute-group label {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: 700;
  margin-bottom: 12px;
  color: #334155;
  font-size: 15px;
}

.selected-val {
  font-weight: 400;
  color: #333;
  margin-left: 8px;
  text-transform: capitalize;
}

.qty-label {
  justify-content: space-between !important;
}

.stock-badge {
  font-weight: 600;
  font-size: 13px;
  color: #059669;
  background: #dcfce7;
  padding: 4px 10px;
  border-radius: 12px;
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
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.size-btn:hover {
  border-color: #cbd5e1;
  color: #334155;
}

.size-btn.active {
  background: #6b3f1e;
  color: #fff;
  border-color: #6b3f1e;
  box-shadow: 0 4px 12px rgba(107, 63, 30, 0.2);
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  height: 44px;
}

.quantity-control button {
  width: 44px;
  height: 100%;
  background: #f8fafc;
  border: none;
  font-size: 20px;
  color: #475569;
  cursor: pointer;
  transition: 0.2s;
}

.quantity-control button:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.quantity-control input {
  width: 50px;
  height: 100%;
  text-align: center;
  border: none;
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
  border-left: 2px solid #e2e8f0;
  border-right: 2px solid #e2e8f0;
  outline: none;
}

.modal-actions {
  margin-top: 10px;
  display: flex;
  gap: 15px;
}

.btn-confirm-add {
  flex: 2;
  background: #63391f;
  color: white;
  border: none;
  padding: 15px;
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 800;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-transform: uppercase;
}

.btn-confirm-add:hover {
  transform: translateY(-3px);
}

.cart-icon-btn {
  width: 20px;
  height: 20px;
}

.btn-view-detail {
  flex: 1;
  background: #fff;
  color: #0f172a;
  border: 2px solid #e2e8f0;
  padding: 15px;
  font-family: "Montserrat", sans-serif;
  font-size: 15px;
  font-weight: 700;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
}

.btn-view-detail:hover {
  border-color: #0f172a;
  background: #f8fafc;
}

.modal-bounce-enter-active {
  animation: modalBounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-bounce-leave-active {
  animation: modalBounceOut 0.3s ease forwards;
}

@keyframes modalBounceIn {
  0% {
    transform: scale(0.9) translateY(30px);
    opacity: 0;
  }

  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes modalBounceOut {
  0% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }

  100% {
    transform: scale(0.95) translateY(20px);
    opacity: 0;
  }
}

/* ================= RESPONSIVE ================= */
@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  .slider-container .product-card {
    width: 250px;
  }

  .image-box {
    height: 280px;
  }

  .modal-content {
    flex-direction: column;
  }

  .modal-left {
    height: 350px;
    padding: 20px;
  }

  .modal-right {
    padding: 30px;
  }
}

@media (max-width: 768px) {
  .section {
    padding: 50px 4%;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .slider-container .product-card {
    width: 220px;
  }

  .image-box {
    height: 240px;
  }

  .banner-slider {
    height: 350px;
  }

  .styled-title {
    font-size: 24px;
  }

  .slider-arrow {
    width: 40px;
    height: 40px;
  }

  .scroll-top-btn {
    right: 20px;
    bottom: 100px;
  }

  .chat-wrapper {
    right: 20px;
    bottom: 20px;
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }

  .slider-container .product-card {
    width: 280px;
  }

  .image-box {
    height: 320px;
  }

  .banner-slider {
    height: 220px;
  }
}
</style>