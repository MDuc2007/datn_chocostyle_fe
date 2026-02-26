<template>
  <div class="app-container">
    <Header></Header>

    <main class="detail-container" v-if="product">
      <div class="breadcrumb">
        <span @click="$router.push('/')">Trang chủ</span>
        <span class="separator">/</span>
        <span @click="$router.push('/ao-khoac')">Áo khoác</span>
        <span class="separator">/</span>
        <span class="current">{{ product.tenSp }}</span>
      </div>

      <div class="product-wrapper">
        <div class="gallery">
          <div class="main-display">
            <img :src="activeImage || product.hinhAnh" class="main-image" @error="handleImageError" />
          </div>

          <div v-if="variantImages.length > 0" class="thumbnail-carousel">
            <div
              v-for="(image, index) in variantImages"
              :key="index"
              class="thumb"
              :class="{ active: activeImage === image }"
              @click="setActiveImage(image)"
            >
              <img :src="image" class="thumb-image" @error="handleImageError" />
            </div>
          </div>
        </div>

        <div class="info">
          <h1 class="title">{{ product.tenSp }}</h1>

          <div class="price-section">
            <div class="price-range" v-if="priceMin !== priceMax">
              {{ formatPrice(priceMin) }} - {{ formatPrice(priceMax) }}
            </div>
            <div class="price-range" v-else>
              {{ formatPrice(priceMin) }}
            </div>
            <div class="total-stock-label">
              <span class="stock-status" :class="{'in-stock': totalStock > 0, 'out-of-stock': totalStock === 0}">
                {{ totalStock > 0 ? 'Còn hàng' : 'Hết hàng' }}
              </span>
              <span class="stock-count">| Tổng kho: {{ totalStock }} sản phẩm</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="block" :class="{ 'has-error': showColorError }">
            <label>Màu sắc: <span class="selected-label">{{ selectedColor ? selectedColor.tenMau : '' }}</span></label>
            <div class="colors">
              <span
                v-for="(mau, i) in uniqueColors"
                :key="i"
                class="circle"
                :class="{
                  selected: selectedColor && selectedColor.rgb === mau.rgb,
                }"
                :style="{ backgroundColor: mau.rgb }"
                :title="mau.tenMau"
                @click="selectColor(mau)"
              ></span>
            </div>
            <span class="error-text" v-if="showColorError">Vui lòng chọn màu sắc</span>
          </div>

          <div class="block" v-if="uniqueSizes.length" :class="{ 'has-error': showSizeError }">
            <div class="label-row">
              <label>Kích cỡ: <span class="selected-label">{{ selectedSize || '' }}</span></label>
              <button class="size-guide-btn" @click="showSizeGuide = true">
                <i class="fa fa-ruler"></i> Hướng dẫn chọn size
              </button>
            </div>
            <div class="sizes">
              <button
                v-for="s in uniqueSizes"
                :key="s"
                class="size-btn"
                :class="{ 
                  active: s === selectedSize,
                  disabled: !isSizeAvailableForSelectedColor(s)
                }"
                :disabled="!isSizeAvailableForSelectedColor(s)"
                @click="selectSize(s)"
                :title="!isSizeAvailableForSelectedColor(s) ? 'Hết hàng màu này' : ''"
              >
                {{ s }}
              </button>
            </div>
            <span class="error-text" v-if="showSizeError">Vui lòng chọn kích cỡ</span>
          </div>

          <div class="block">
            <label>Số lượng:</label>
            <div class="qty-control">
              <div class="qty-input-group">
                <button @click="changeQty(-1)" :disabled="quantity <= 1">
                  <i class="fa fa-minus"></i>
                </button>
                <input
                  type="number"
                  v-model.number="quantity"
                  @change="validateQty"
                />
                <button
                  @click="changeQty(1)"
                  :disabled="
                    selectedVariant && quantity >= selectedVariant.soLuongTon
                  "
                >
                  <i class="fa fa-plus"></i>
                </button>
              </div>
              <span class="variant-stock-hint" v-if="selectedVariant">
                (Sẵn có: <strong>{{ selectedVariant.soLuongTon }}</strong> sản phẩm)
              </span>
            </div>
          </div>

          <div class="actions">
            <button class="btn add-btn hover-effect" @click="addToCart" :disabled="totalStock === 0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              THÊM VÀO GIỎ
            </button>
            <button class="btn buy-btn hover-effect" @click="buyNow" :disabled="totalStock === 0">
              MUA NGAY
            </button>
          </div>
          
          <div class="policy-badges">
            <div class="badge-item"><i class="fa fa-truck"></i> Giao hàng toàn quốc</div>
            <div class="badge-item"><i class="fa fa-undo"></i> Đổi trả trong 7 ngày</div>
            <div class="badge-item"><i class="fa fa-check-circle"></i> Cam kết chính hãng</div>
          </div>
        </div>
      </div>
    </main>
    
    <main v-else class="loading-full-page">
      <div class="spinner"></div>
      <p>Đang tải thông tin sản phẩm...</p>
    </main>

    <Footer></Footer>

    <transition name="fade-modal">
      <div v-if="showSizeGuide" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Bảng thông số size áo khoác</h3>
            <button @click="closeModal" class="close-x">&times;</button>
          </div>
          <div class="modal-body">
            <img src="/src/assets/logo/image 55.png" alt="Size Guide" class="size-guide-image" />
          </div>
        </div>
      </div>
    </transition>

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
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";

const route = useRoute();
const router = useRouter();
const product = ref(null);

// Form State
const selectedColor = ref(null);
const selectedSize = ref(null);
const selectedVariant = ref(null);
const quantity = ref(1);

// UI State
const showSizeGuide = ref(false);
const activeImage = ref("");
const showColorError = ref(false);
const showSizeError = ref(false);
let timer = null;

// Thêm biến cho Toast thông báo
const toast = ref({ show: false, message: "", type: "success" });

// Hàm hiển thị Toast
const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 3000);
};

// Helper: Format Price
const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v) + " đ";

// Xử lý ảnh lỗi
const handleImageError = (event) => {
  event.target.src = "/src/assets/logo/no-image-placeholder.png"; 
};

// Computed Properties
const priceMin = computed(() => {
  if (!product.value) return 0;
  return Math.min(...product.value.bienTheList.map((b) => b.giaBan));
});

const priceMax = computed(() => {
  if (!product.value) return 0;
  return Math.max(...product.value.bienTheList.map((b) => b.giaBan));
});

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
  // Sắp xếp size theo chuẩn S, M, L, XL... nếu có
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
  const allImages = [product.value.hinhAnh, ...images].filter(Boolean); // Gom ảnh chính và ảnh biến thể
  return [...new Set(allImages)];
});

// Kiểm tra xem Size có tồn tại trong Màu đang chọn không (hoặc ngược lại)
const isSizeAvailableForSelectedColor = (size) => {
  if (!selectedColor.value) return true; // Nếu chưa chọn màu, hiện tất cả size
  return product.value.bienTheList.some(b => 
    b.mauSacList.some(m => m.rgb === selectedColor.value.rgb) && 
    b.kichCoList.includes(size) &&
    b.soLuongTon > 0
  );
};

// Handlers Click Màu / Size
const selectColor = (mau) => {
  selectedColor.value = mau;
  showColorError.value = false;
  
  // Nếu size đã chọn trước đó không có trong màu mới này, reset size
  if (selectedSize.value && !isSizeAvailableForSelectedColor(selectedSize.value)) {
    selectedSize.value = null;
    showToast(`Màu ${mau.tenMau} đã hết size ${selectedSize.value}`, "warning");
  }
};

const selectSize = (size) => {
  selectedSize.value = size;
  showSizeError.value = false;
};

// Auto-play Logic Gallery
const setActiveImage = (img) => {
  activeImage.value = img;
  startAutoPlay(); // Reset timer khi click tay
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

// Quantity Handlers
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

// Validation & Giỏ hàng
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
    giaBan: selectedVariant.value.giaBan,
    soLuong: quantity.value,
    tonKho: selectedVariant.value.soLuongTon
  };

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItemIndex = cart.findIndex(item => item.variantId === cartItem.variantId);

  if (existingItemIndex !== -1) {
    const newQty = cart[existingItemIndex].soLuong + cartItem.soLuong;
    if (newQty > cartItem.tonKho) {
      showToast(`Rất tiếc, kho chỉ còn ${cartItem.tonKho} sản phẩm!`, "error");
      return;
    }
    cart[existingItemIndex].soLuong = newQty;
  } else {
    cart.push(cartItem);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  showToast("Đã thêm sản phẩm vào giỏ hàng thành công!");
  window.dispatchEvent(new Event("cartUpdated"));
};

const buyNow = () => {
  if (!checkValidation()) return;
  
  // Tùy chọn: Có thể lưu luôn vào giỏ hàng trước khi đẩy qua thanh toán
  router.push({
    path: "/payment",
    query: {
      productId: product.value.id,
      variantId: selectedVariant.value.id,
      quantity: quantity.value.toString(),
    },
  });
};

// Watchers
watch([selectedColor, selectedSize], () => {
  if (selectedColor.value && selectedSize.value) {
    const found = product.value.bienTheList.find(
      (b) =>
        b.mauSacList.some((m) => m.rgb === selectedColor.value.rgb) &&
        b.kichCoList.includes(selectedSize.value)
    );
    selectedVariant.value = found || null;
    
    if (selectedVariant.value) {
       // Cập nhật giá trên giao diện (nếu bạn muốn hiện giá cụ thể của variant này)
       // Cập nhật ảnh tương ứng với variant nếu có
       if(selectedVariant.value.hinhAnhUrls && selectedVariant.value.hinhAnhUrls.length > 0) {
           setActiveImage(selectedVariant.value.hinhAnhUrls[0]);
           stopAutoPlay(); // Tạm dừng auto play khi user tự chọn màu
       }

       if (quantity.value > selectedVariant.value.soLuongTon) {
          quantity.value = selectedVariant.value.soLuongTon || 1;
       }
    }
  }
});

// Lifecycle
onMounted(async () => {
  try {
    const res = await axios.get(`http://localhost:8080/api/san-pham/${route.params.id}`);
    product.value = res.data;
    
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
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fdfdfd;
}

/* Breadcrumb */
.breadcrumb {
  max-width: 1200px;
  margin: 20px auto 30px;
  font-size: 13px;
  color: #888;
}
.breadcrumb span { cursor: pointer; transition: 0.2s; }
.breadcrumb span:hover { color: #6b3f1e; }
.breadcrumb .separator { margin: 0 12px; cursor: default; color: #ccc;}
.breadcrumb .current { font-weight: 600; color: #333; cursor: default; }

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

.product-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

/* LEFT: Gallery Styles */
.gallery {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-display {
  background: #fff;
  border: 1px solid #eee;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  cursor: zoom-in;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.main-display:hover .main-image {
  transform: scale(1.1);
}

.thumbnail-carousel {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding: 5px 0;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.thumbnail-carousel::-webkit-scrollbar { display: none; }

.thumb {
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  background: #fff;
  padding: 2px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  border-radius: 8px;
  opacity: 0.7;
}
.thumb:hover { opacity: 1; }
.thumb.active {
  border-color: #6b3f1e;
  opacity: 1;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

/* RIGHT: Info Styles */
.info {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #222;
  margin-bottom: 15px;
  line-height: 1.3;
}

.price-section {
  margin-bottom: 20px;
}

.price-range {
  font-size: 26px;
  font-weight: 800;
  color: #d0021b;
  margin-bottom: 8px;
}

.total-stock-label {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}
.stock-status { font-weight: 600; }
.in-stock { color: #22C55E; }
.out-of-stock { color: #ef4444; }

.divider {
  height: 1px;
  background: #eee;
  margin: 25px 0;
}

.block {
  margin-bottom: 30px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: border-color 0.3s;
}
.block.has-error {
  border-color: #fca5a5;
  background-color: #fef2f2;
}
.error-text {
  color: #ef4444;
  font-size: 13px;
  margin-top: 8px;
  display: block;
}

.block label {
  display: block;
  font-weight: 700;
  color: #444;
  margin-bottom: 15px;
  font-size: 15px;
}
.selected-label { font-weight: normal; color: #6b3f1e; }

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 15px;
}
.label-row label { margin-bottom: 0; }

.size-guide-btn {
  background: none;
  border: none;
  text-decoration: underline;
  font-size: 13px;
  color: #6b3f1e;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}
.size-guide-btn:hover { font-weight: bold; }

.colors, .sizes {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}
.circle:hover { transform: scale(1.1); }
.circle.selected {
  outline: 2px solid #6b3f1e;
  outline-offset: 4px;
  border-color: transparent;
  transform: scale(1.1);
}

.size-btn {
  min-width: 60px;
  height: 40px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #444;
  cursor: pointer;
  transition: all 0.2s;
}
.size-btn:hover:not(.disabled) { border-color: #6b3f1e; color: #6b3f1e; }
.size-btn.active {
  background: #6b3f1e;
  color: #fff;
  border-color: #6b3f1e;
}
.size-btn.disabled {
  background: #f5f5f5;
  color: #bbb;
  text-decoration: line-through;
  cursor: not-allowed;
  border-style: dashed;
}

/* Quantity Control */
.qty-control {
  display: flex;
  align-items: center;
  gap: 20px;
}

.qty-input-group {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  height: 45px;
}

.qty-input-group button {
  width: 45px;
  background: #f8f8f8;
  border: none;
  cursor: pointer;
  color: #555;
  transition: 0.2s;
}
.qty-input-group button:hover:not(:disabled) { background: #eee; color: #000; }
.qty-input-group input {
  width: 60px;
  text-align: center;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  font-size: 16px;
  font-weight: 600;
  outline: none;
}
.qty-input-group input::-webkit-outer-spin-button,
.qty-input-group input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.variant-stock-hint { font-size: 14px; color: #888; }

/* Actions */
.actions {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.btn {
  flex: 1;
  height: 55px;
  font-weight: 700;
  font-size: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.add-btn {
  background: #fff;
  color: #6b3f1e;
  border: 2px solid #6b3f1e;
}
.add-btn:hover:not(:disabled) { background: #fdf8f6; }
.btn-icon { width: 20px; height: 20px; }

.buy-btn {
  background: #6b3f1e;
  color: #fff;
  border: none;
  box-shadow: 0 4px 15px rgba(107, 63, 30, 0.3);
}
.buy-btn:hover:not(:disabled) { background: #4a2a17; transform: translateY(-2px); }

.policy-badges {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fdfdfd;
  border: 1px dashed #ddd;
  padding: 20px;
  border-radius: 8px;
}
.badge-item { font-size: 14px; color: #555; display: flex; align-items: center; gap: 10px;}
.badge-item i { color: #6b3f1e; font-size: 16px;}

/* Full page Loading */
.loading-full-page { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #666;}
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #6b3f1e; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(3px);}
.modal-content { background: #fff; border-radius: 12px; max-width: 800px; width: 90%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);}
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; border-bottom: 1px solid #eee; background: #fafafa;}
.modal-header h3 { margin: 0; font-size: 18px; color: #333;}
.close-x { font-size: 28px; background: none; border: none; cursor: pointer; color: #888; transition: 0.2s;}
.close-x:hover { color: #d0021b; transform: scale(1.2);}
.modal-body { padding: 20px; overflow-y: auto; text-align: center;}
.size-guide-image { max-width: 100%; border-radius: 8px;}

/* ================= TOAST CSS ================= */
.toast-notification {
  position: fixed;
  top: 25px;
  right: 25px;
  z-index: 10001;
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
.toast-icon {
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
.success .toast-icon { background: #22C55E; }
.error .toast-icon { background: #ef4444; }
.warning .toast-icon { background: #f59e0b; }
.toast-content { margin-left: 12px; font-weight: 500; color: #333; font-size: 15px;}
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }

/* Responsive */
@media (max-width: 900px) {
  .product-wrapper { grid-template-columns: 1fr; gap: 30px; }
  .main-display { height: 450px; }
  .actions { flex-direction: column; }
}
@media (max-width: 480px) {
  .main-display { height: 350px; }
  .title { font-size: 24px; }
}
</style>