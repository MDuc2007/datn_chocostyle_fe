<template>
  <div class="app-container">
    <Header></Header>

    <main class="detail-container" v-if="product">
      <div class="breadcrumb">
        <span @click="$router.push('/')">Trang chủ</span>
        <span class="separator">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
        <span @click="$router.push('/ao-khoac')">Áo khoác</span>
        <span class="separator">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
        <span class="current">{{ product.tenSp }}</span>
      </div>

      <div class="product-wrapper">

        <div class="gallery-section card-box">
          <div class="main-display">
            <img :src="activeImage || product.hinhAnh" class="main-image" @error="handleImageError"
              alt="Product Image" />
            <span v-if="displayDiscountPercent > 0" class="image-sale-badge">-{{ displayDiscountPercent }}%</span>
          </div>

          <div v-if="variantImages.length > 0" class="thumbnail-carousel">
            <div v-for="(image, index) in variantImages" :key="index" class="thumb"
              :class="{ active: activeImage === image }" @click="setActiveImage(image)">
              <img :src="image" class="thumb-image" @error="handleImageError" />
            </div>
          </div>
        </div>

        <div class="info-section card-box">
          <div class="product-header">
            <h1 class="title">{{ product.tenSp }}</h1>
            
            <div class="price-wrapper">
              <template v-if="displayDiscountPercent > 0">
                <div class="price-group">
                  <span class="old-price">{{ displayOldPrice }}</span>
                  <span class="price new-price">{{ displayNewPrice }}</span>
                </div>
                <div class="sale-tag">-{{ displayDiscountPercent }}%</div>
              </template>
              
              <template v-else>
                <span class="price">{{ displayNewPrice }}</span>
              </template>

              <div class="stock-badge" :class="totalStock > 0 ? 'in-stock' : 'out-of-stock'">
                {{ totalStock > 0 ? 'Còn hàng' : 'Hết hàng' }}
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="variant-block" :class="{ 'has-error': showColorError }">
            <div class="variant-header">
              <span class="variant-label">Màu sắc:</span>
              <span class="variant-selected-text">{{ selectedColor ? selectedColor.tenMau : 'Chưa chọn' }}</span>
            </div>
            <div class="color-options">
              <button v-for="(mau, i) in uniqueColors" :key="i" class="color-circle"
                :class="{ selected: selectedColor && selectedColor.rgb === mau.rgb }"
                :style="{ backgroundColor: mau.rgb }" :title="mau.tenMau" @click="selectColor(mau)">
                <svg v-if="selectedColor && selectedColor.rgb === mau.rgb" class="check-icon" viewBox="0 0 24 24"
                  fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
            <span class="error-msg" v-if="showColorError">Vui lòng chọn màu sắc!</span>
          </div>

          <div class="variant-block" v-if="uniqueSizes.length" :class="{ 'has-error': showSizeError }">
            <div class="variant-header flex-between">
              <div>
                <span class="variant-label">Kích cỡ:</span>
                <span class="variant-selected-text">{{ selectedSize || 'Chưa chọn' }}</span>
              </div>
              <button class="btn-size-guide" @click="showSizeGuide = true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    d="M21.3 15.3l-2.6-2.6a2 2 0 0 0-2.8 0L3.1 25.5a2 2 0 0 0 0 2.8l2.6 2.6a2 2 0 0 0 2.8 0L21.3 18.1a2 2 0 0 0 0-2.8zM4.5 26.9l-1.4-1.4M8.7 22.7l-1.4-1.4M12.9 18.5l-1.4-1.4M17.1 14.3l-1.4-1.4">
                  </path>
                </svg>
                Hướng dẫn chọn size
              </button>
            </div>
            <div class="size-options">
              <button v-for="s in uniqueSizes" :key="s" class="size-box" :class="{
                active: s === selectedSize,
                disabled: !isSizeAvailableForSelectedColor(s)
              }" :disabled="!isSizeAvailableForSelectedColor(s)" @click="selectSize(s)"
                :title="!isSizeAvailableForSelectedColor(s) ? 'Hết hàng màu này' : ''">
                {{ s }}
              </button>
            </div>
            <span class="error-msg" v-if="showSizeError">Vui lòng chọn kích cỡ!</span>
          </div>

          <div class="variant-block">
            <div class="variant-header">
              <span class="variant-label">Số lượng:</span>
            </div>
            <div class="qty-wrapper">
              <div class="qty-control">
                <button class="qty-btn" @click="changeQty(-1)" :disabled="quantity <= 1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <input type="number" class="qty-input" v-model.number="quantity" @change="validateQty" />
                <button class="qty-btn" @click="changeQty(1)"
                  :disabled="selectedVariant && quantity >= selectedVariant.soLuongTon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              <span class="stock-hint" v-if="selectedVariant">
                Sẵn có <strong>{{ selectedVariant.soLuongTon }}</strong> sản phẩm
              </span>
              <span class="stock-hint" v-else-if="totalStock > 0">
                Tổng kho: {{ totalStock }}
              </span>
            </div>
          </div>

          <div class="action-group">
            <button class="btn btn-outline-brand" @click="addToCart" :disabled="totalStock === 0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Thêm vào giỏ
            </button>
            <button class="btn btn-brand" @click="buyNow" :disabled="totalStock === 0">
              Mua ngay
            </button>
          </div>

          <ul class="policy-list">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <span>Miễn phí giao hàng toàn quốc cho đơn từ 500k.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 2v6h6"></path>
                <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
                <path d="M21 22v-6h-6"></path>
                <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
              </svg>
              <span>Đổi trả cực dễ chỉ trong vòng 7 ngày.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Cam kết hàng chính hãng, bảo hành 30 ngày.</span>
            </li>
          </ul>
        </div>
      </div>
    </main>

    <main v-else class="loading-full-page">
      <div class="spinner"></div>
    </main>

    <Footer></Footer>

    <transition name="fade-modal">
      <div v-if="showSizeGuide" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Bảng thông số Kích cỡ</h3>
            <button @click="closeModal" class="close-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <img src="/src/assets/logo/image 55.png" alt="Size Guide" class="size-guide-img" />
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast-slide">
      <div v-if="toast.show" class="modern-toast" :class="'toast-' + toast.type">
        <div class="toast-icon-wrap">
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="toast-text">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";

const route = useRoute();
const router = useRouter();
const product = ref(null);

const selectedColor = ref(null);
const selectedSize = ref(null);
const selectedVariant = ref(null);
const quantity = ref(1);

const showSizeGuide = ref(false);
const activeImage = ref("");
const showColorError = ref(false);
const showSizeError = ref(false);
let timer = null;

// Thêm logic % giảm giá cao nhất của SP
const discountPercent = ref(0);

const toast = reactive({ show: false, message: "", type: "success" });

const showToast = (msg, type = "success") => {
  toast.message = msg;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(Math.round(v)) + " đ";

const handleImageError = (event) => {
  event.target.src = "/src/assets/logo/no-image-placeholder.png";
};

// ================= LOGIC TÍNH GIÁ ĐÃ SỬA =================

// Tính % Giảm giá hiển thị (Lấy của biến thể nếu chọn, không thì lấy Max)
const displayDiscountPercent = computed(() => {
  if (selectedVariant.value && selectedVariant.value.phanTramGiam !== undefined) {
    return selectedVariant.value.phanTramGiam;
  }
  return discountPercent.value || 0;
});

const priceMin = computed(() => {
  if (!product.value) return 0;
  return Math.min(...product.value.bienTheList.map((b) => b.giaBan));
});

const priceMax = computed(() => {
  if (!product.value) return 0;
  return Math.max(...product.value.bienTheList.map((b) => b.giaBan));
});

// Giá gốc hiển thị (Bị gạch ngang)
const displayOldPrice = computed(() => {
  if (selectedVariant.value) return formatPrice(selectedVariant.value.giaBan);
  if (priceMin.value === priceMax.value) return formatPrice(priceMin.value);
  return `${formatPrice(priceMin.value)} - ${formatPrice(priceMax.value)}`;
});

// Giá mới hiển thị (Màu đỏ, đã trừ khuyến mãi)
const displayNewPrice = computed(() => {
  const pct = displayDiscountPercent.value; // Lấy đúng % của biến thể hoặc global
  
  if (selectedVariant.value) {
    const discounted = selectedVariant.value.giaBan * (1 - pct / 100);
    return formatPrice(Math.round(discounted));
  }
  
  if (priceMin.value === priceMax.value) {
    return formatPrice(Math.round(priceMin.value * (1 - pct / 100)));
  }
  return `${formatPrice(Math.round(priceMin.value * (1 - pct / 100)))} - ${formatPrice(Math.round(priceMax.value * (1 - pct / 100)))}`;
});

// Tính giá thực tế CỦA RIÊNG BIẾN THỂ ĐƯỢC CHỌN ĐỂ LƯU VÀO GIỎ HÀNG
const currentVariantDiscountedPrice = computed(() => {
  if (!selectedVariant.value) return 0;
  const pct = selectedVariant.value.phanTramGiam || 0;
  return Math.round(selectedVariant.value.giaBan * (1 - pct / 100));
});

// ==========================================================

const uniqueColors = computed(() => {
  if (!product.value) return [];
  const colorMap = new Map();
  product.value.bienTheList.forEach((b) => {
    b.mauSacList.forEach((m) => colorMap.set(m.rgb, m));
  });
  return Array.from(colorMap.values());
});

const uniqueSizes = computed(() => {
  if (!product.value) return [];
  const sizes = product.value.bienTheList.flatMap((b) => b.kichCoList);
  const sizeOrder = { "S": 1, "M": 2, "L": 3, "XL": 4, "XXL": 5, "2XL": 5, "3XL": 6 };
  return [...new Set(sizes)].sort((a, b) => (sizeOrder[a] || 99) - (sizeOrder[b] || 99));
});

const totalStock = computed(() => {
  if (!product.value || !product.value.bienTheList) return 0;
  return product.value.bienTheList.reduce((sum, b) => sum + (b.soLuongTon || 0), 0);
});

const variantImages = computed(() => {
  if (!product.value || !product.value.bienTheList) return [];
  const images = product.value.bienTheList.flatMap((b) => b.hinhAnhUrls);
  const allImages = [product.value.hinhAnh, ...images].filter(Boolean);
  return [...new Set(allImages)];
});

const isSizeAvailableForSelectedColor = (size) => {
  if (!selectedColor.value) return true;
  return product.value.bienTheList.some(b =>
    b.mauSacList.some(m => m.rgb === selectedColor.value.rgb) &&
    b.kichCoList.includes(size) &&
    b.soLuongTon > 0
  );
};

const selectColor = (mau) => {
  selectedColor.value = mau;
  showColorError.value = false;

  if (selectedSize.value && !isSizeAvailableForSelectedColor(selectedSize.value)) {
    selectedSize.value = null;
    showToast(`Màu ${mau.tenMau} đã hết size ${selectedSize.value}`, "warning");
  }
};

const selectSize = (size) => {
  selectedSize.value = size;
  showSizeError.value = false;
};

const setActiveImage = (img) => {
  activeImage.value = img;
  startAutoPlay();
};

const startAutoPlay = () => {
  stopAutoPlay();
  timer = setInterval(() => {
    if (variantImages.value.length > 1) {
      const currentIndex = variantImages.value.indexOf(activeImage.value);
      const nextIndex = (currentIndex + 1) % variantImages.value.length;
      activeImage.value = variantImages.value[nextIndex];
    }
  }, 4000);
};

const stopAutoPlay = () => {
  if (timer) clearInterval(timer);
};

const changeQty = (num) => {
  const newQty = quantity.value + num;
  if (newQty >= 1 && (!selectedVariant.value || newQty <= selectedVariant.value.soLuongTon)) {
    quantity.value = newQty;
  }
};

const validateQty = () => {
  if (quantity.value < 1 || isNaN(quantity.value)) quantity.value = 1;
  if (selectedVariant.value && quantity.value > selectedVariant.value.soLuongTon) {
    quantity.value = selectedVariant.value.soLuongTon;
    showToast(`Kho chỉ còn ${selectedVariant.value.soLuongTon} sản phẩm!`, "warning");
  }
};

const closeModal = () => {
  showSizeGuide.value = false;
};

const checkValidation = () => {
  let isValid = true;
  if (!selectedColor.value) { showColorError.value = true; isValid = false; }
  if (uniqueSizes.value.length > 0 && !selectedSize.value) { showSizeError.value = true; isValid = false; }

  if (!isValid) showToast("Vui lòng chọn đầy đủ Màu sắc và Kích cỡ!", "error");
  return isValid;
};

const addToCart = () => {
  if (!product.value) return;
  if (!checkValidation()) return;

  const cartItem = {
    productId: product.value.id,
    variantId: selectedVariant.value.id,
    tenSp: product.value.tenSp,
    hinhAnh: activeImage.value || product.value.hinhAnh,
    mauSac: selectedColor.value,
    kichCo: selectedSize.value,
    // ĐÃ SỬA: LƯU GIÁ ĐÃ GIẢM VÀO GIỎ HÀNG CHUẨN XÁC NHẤT
    giaBan: currentVariantDiscountedPrice.value, 
    soLuong: quantity.value,
    tonKho: selectedVariant.value.soLuongTon
  };

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItemIndex = cart.findIndex(item => item.variantId === cartItem.variantId);

  if (existingItemIndex !== -1) {
    const newQty = cart[existingItemIndex].soLuong + cartItem.soLuong;
    if (newQty > cartItem.tonKho) {
      showToast(`Không đủ số lượng sản phẩm!`, "error");
      return;
    }
    cart[existingItemIndex].soLuong = newQty;
  } else {
    cart.push(cartItem);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  showToast("Đã thêm sản phẩm vào giỏ hàng thành công!", "success");
  window.dispatchEvent(new Event("cartUpdated"));
};

  const buyNow = () => {
    if (!checkValidation()) return;
    
    // 👉 SỬA Ở ĐÂY: Xóa sạch dữ liệu "mua từ giỏ hàng" cũ trước khi chuyển trang
    localStorage.removeItem("checkout_items");
    
    router.push({
      path: "/payment",
      query: {
        productId: product.value.id,
        variantId: selectedVariant.value.id,
        quantity: quantity.value.toString(),
      },
    });
  };

// ================= GỌI API LẤY KHUYẾN MÃI (FIX ĐỂ TÌM ĐÚNG BIẾN THỂ) =================
const fetchPromotions = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/promotions");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validPromos = res.data.filter((p) => {
      if (Number(p.trangThai) !== 1) return false;
      const start = new Date(p.ngayBatDau);
      const end = new Date(p.ngayKetThuc);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return today >= start && today <= end;
    });

    if (product.value && product.value.bienTheList) {
      let maxGlobalDiscount = 0;
      product.value.bienTheList.forEach(variant => {
        // FIX: Đổi từ includes sang some(Number===Number) để lấy chính xác mảng ID Khuyến mãi
        const variantPromos = validPromos.filter(p => 
          p.chiTietSanPhamIds?.some(id => Number(id) === Number(variant.id))
        );
        
        if (variantPromos.length > 0) {
          const best = variantPromos.reduce((max, cur) => Number(cur.giaTriGiam) > Number(max.giaTriGiam) ? cur : max);
          variant.phanTramGiam = Number(best.giaTriGiam); 
          
          if (variant.phanTramGiam > maxGlobalDiscount) {
            maxGlobalDiscount = variant.phanTramGiam;
          }
        } else {
          variant.phanTramGiam = 0;
        }
      });
      discountPercent.value = maxGlobalDiscount; 
    }
  } catch (err) {
    console.error("Lỗi tải khuyến mãi:", err);
  }
};

watch([selectedColor, selectedSize], () => {
  if (selectedColor.value && selectedSize.value) {
    const found = product.value.bienTheList.find(
      (b) =>
        b.mauSacList.some((m) => m.rgb === selectedColor.value.rgb) &&
        b.kichCoList.includes(selectedSize.value)
    );
    selectedVariant.value = found || null;

    if (selectedVariant.value) {
      if (selectedVariant.value.hinhAnhUrls && selectedVariant.value.hinhAnhUrls.length > 0) {
        setActiveImage(selectedVariant.value.hinhAnhUrls[0]);
        stopAutoPlay();
      }
      if (quantity.value > selectedVariant.value.soLuongTon) {
        quantity.value = selectedVariant.value.soLuongTon || 1;
      }
    }
  }
});

onMounted(async () => {
  try {
    const res = await axios.get(`http://localhost:8080/api/san-pham/${route.params.id}`);
    product.value = res.data;

    // GỌI API KHUYẾN MÃI NGAY SAU KHI CÓ PRODUCT
    await fetchPromotions();

    if (variantImages.value.length > 0) {
      activeImage.value = variantImages.value[0];
    }
    startAutoPlay();
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu:", err);
    showToast("Không tìm thấy sản phẩm. Vui lòng thử lại sau.", "error");
    setTimeout(() => router.push('/'), 2000);
  }
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap');

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F7F7F7; /* Màu nền xám nhạt theo chuẩn */
  font-family: 'Nunito', sans-serif;
  color: #111827;
}

/* ================== BREADCRUMB ================== */
.breadcrumb {
  max-width: 1280px;
  margin: 24px auto;
  padding: 0 20px;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb span {
  cursor: pointer;
  transition: color 0.2s;
}

.breadcrumb span:hover {
  color: #63391F; /* Màu nâu chủ đạo */
}

.breadcrumb .separator svg {
  width: 14px;
  height: 14px;
  margin-top: 3px;
}

.breadcrumb .current {
  font-weight: 700;
  color: #63391F;
  cursor: default;
}

/* ================== LAYOUT CHÍNH ================== */
.detail-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px 80px;
}

.product-wrapper {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 30px; 
}

/* KHỐI BOX (CARD) CHO GALLERY VÀ INFO */
.card-box {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

/* ================== LEFT: GALLERY ================== */
.gallery-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.main-display {
  background: #F7F7F7; /* Nền khung ảnh */
  border-radius: 12px;
  width: 100%;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: zoom-in;
  position: relative;
  border: 1px solid #f0f0f0;
}

.image-sale-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  background: linear-gradient(135deg, #f53844, #e60023);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 14px;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(230, 0, 35, 0.3);
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* QUAN TRỌNG: Ép ảnh nằm gọn trong box, không thay đổi kích thước box */
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.main-display:hover .main-image {
  transform: scale(1.08);
}

.thumbnail-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.thumbnail-carousel::-webkit-scrollbar {
  display: none;
}

.thumb {
  width: 90px;
  height: 90px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 2px solid transparent;
  transition: all 0.2s;
  background: #F7F7F7;
}

.thumb:hover {
  opacity: 0.8;
}

.thumb.active {
  border-color: #63391F; /* Màu chủ đạo */
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Đồng bộ với ảnh lớn */
}

/* ================== RIGHT: PRODUCT INFO ================== */
.info-section {
  display: flex;
  flex-direction: column;
}

.product-header {
  margin-bottom: 24px;
}

.title {
  font-family: 'Montserrat', sans-serif;
  font-size: 30px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  line-height: 1.3;
  letter-spacing: -0.5px;
}

.price-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.price-group {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.old-price {
  font-size: 16px;
  text-decoration: line-through;
  color: #9ca3af;
  font-weight: 600;
  margin-bottom: 2px;
}

.price {
  font-family: 'Montserrat', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #d32f2f; /* Màu đỏ cho giá khuyến mãi */
}

.sale-tag {
  background: #fef2f2;
  color: #d32f2f;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  border: 1px solid #fecaca;
  margin-bottom: 5px;
}

.stock-badge {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 5px;
}

.in-stock {
  background: #ecfdf5;
  color: #059669;
}

.out-of-stock {
  background: #fef2f2;
  color: #dc2626;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0 0 24px 0;
}

/* ================== VARIANTS (MÀU & SIZE) ================== */
.variant-block {
  margin-bottom: 24px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.3s;
  margin-left: -12px;
  margin-right: -12px;
}

.variant-block.has-error {
  background-color: #fef2f2;
  border-color: #fecaca;
}

.variant-header {
  margin-bottom: 16px;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.variant-label {
  font-size: 15px;
  font-weight: 700;
  color: #334155;
  margin-right: 8px;
}

.variant-selected-text {
  font-size: 15px;
  color: #63391F; /* Nhấn mạnh text đã chọn */
  font-weight: 700;
}

.btn-size-guide {
  background: none;
  border: none;
  color: #63391F;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.btn-size-guide svg {
  width: 16px;
  height: 16px;
}

/* Colors */
.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.color-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.color-circle:hover {
  transform: scale(1.1);
}

.color-circle.selected {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #63391F; /* Viền bao quanh màu nâu */
  border: none;
}

.check-icon {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

/* Sizes */
.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.size-box {
  min-width: 64px;
  height: 44px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #334155 !important;
  cursor: pointer;
  transition: all 0.2s;
}

.size-box:hover:not(.disabled) {
  border-color: #63391F;
  color: #63391F !important;
}

.size-box.active {
  background: #63391F !important;
  color: #ffffff !important;
  border-color: #63391F !important;
  box-shadow: 0 4px 10px rgba(99, 57, 31, 0.2);
}

.size-box.disabled {
  background: #f8fafc !important;
  color: #9ca3af !important;
  border-color: #e2e8f0 !important;
  cursor: not-allowed;
  position: relative;
  overflow: hidden;
}

.size-box.disabled::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #cbd5e1;
  transform: rotate(-30deg);
}

.error-msg {
  color: #dc2626;
  font-size: 13px;
  display: block;
  margin-top: 10px;
  font-weight: 600;
}

/* ================== SỐ LƯỢNG ================== */
.qty-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
}

.qty-control {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  height: 48px;
  overflow: hidden;
}

.qty-btn {
  width: 48px;
  height: 100%;
  background: #F7F7F7;
  border: none;
  cursor: pointer;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.qty-btn svg {
  width: 18px;
  height: 18px;
}

.qty-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #63391F;
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-input {
  width: 50px;
  height: 100%;
  text-align: center;
  border: none;
  border-left: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  outline: none;
}

.stock-hint {
  font-size: 14px;
  color: #64748b;
}

.stock-hint strong {
  color: #059669; /* Đổi màu xanh cho số lượng tồn */
}

/* ================== NÚT HÀNH ĐỘNG ================== */
.action-group {
  display: flex;
  gap: 16px;
  margin: 32px 0;
}

.btn {
  flex: 1;
  height: 56px;
  border-radius: 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none !important;
  transform: none !important;
}

.btn-outline-brand {
  background: #fff;
  color: #63391F;
  border: 2px solid #63391F;
}

.btn-outline-brand:hover:not(:disabled) {
  background: #fdfaf8;
  box-shadow: 0 4px 12px rgba(99, 57, 31, 0.1);
}

.btn-brand {
  background: linear-gradient(135deg, #63391F, #8b5328);
  color: #fff;
  border: none;
  box-shadow: 0 8px 20px rgba(99, 57, 31, 0.25);
}

.btn-brand:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(99, 57, 31, 0.35);
}

.btn-icon {
  width: 22px;
  height: 22px;
}

/* ================== CHÍNH SÁCH ================== */
.policy-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 1px dashed #e5e7eb;
  padding-top: 24px;
}

.policy-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}

.policy-list svg {
  width: 20px;
  height: 20px;
  color: #63391F;
  flex-shrink: 0;
}

/* ================== MODAL & TOAST ================== */
.loading-full-page {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4px solid rgba(99, 57, 31, 0.1);
  border-top: 4px solid #63391F;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  cursor: pointer;
  color: #64748b;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.close-btn:hover {
  background: #fee2e2;
  color: #d32f2f;
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  text-align: center;
}

.size-guide-img {
  max-width: 100%;
  border-radius: 8px;
}

/* ================= TOAST MỚI (SUCCESS, ERROR, WARNING) KHÔNG ICON ================= */
.modern-toast {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 10001;
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  transition: all 0.3s ease;
}

.modern-toast.toast-success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.modern-toast.toast-error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.modern-toast.toast-warning {
  background: #ffc107;
  color: #333;
  border-left: 4px solid #ff9800;
}

.toast-text {
  font-size: 15px;
  font-weight: 600;
  color: inherit; /* Chữ tự động lấy màu đúng theo khung cảnh báo */
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

/* ================== RESPONSIVE ================== */
@media (max-width: 900px) {
  .product-wrapper {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .main-display {
    height: 500px;
  }
}

@media (max-width: 480px) {
  .main-display {
    height: 350px;
  }
  .title {
    font-size: 24px;
  }
  .action-group {
    flex-direction: column;
  }
}
</style>