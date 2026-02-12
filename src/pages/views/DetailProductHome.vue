<template>
  <div class="app-container">
    <Header></Header>

    <main class="detail-container" v-if="product">
      <div class="gallery">
        <div class="main-display">
          <img :src="activeImage || product.hinhAnh" class="main-image" />
        </div>

        <div v-if="variantImages.length > 0" class="thumbnail-carousel">
          <div
            v-for="(image, index) in variantImages"
            :key="index"
            class="thumb"
            :class="{ active: activeImage === image }"
            @click="activeImage = image"
          >
            <img :src="image" class="thumb-image" />
          </div>
        </div>
      </div>

      <div class="info">
        <h1 class="title">{{ product.tenSp }}</h1>

        <div class="price">
          <span class="price-range" v-if="priceMin !== priceMax">
            {{ formatPrice(priceMin) }} - {{ formatPrice(priceMax) }}
          </span>
          <span class="price-range" v-else>
            {{ formatPrice(priceMin) }}
          </span>
          <div class="total-stock-label">
            Tổng kho: {{ totalStock }} sản phẩm
          </div>
        </div>

        <div class="block">
          <label>Màu sắc:</label>
          <div class="colors">
            <span
              v-for="(mau, i) in uniqueColors"
              :key="i"
              class="circle"
              :class="{
                selected: selectedColor && selectedColor.rgb === mau.rgb,
              }"
              :style="{ backgroundColor: mau.rgb }"
              @click="selectedColor = mau"
            ></span>
          </div>
        </div>

        <div class="block" v-if="uniqueSizes.length">
          <div class="label-row">
            <label>Kích cỡ:</label>
          </div>
          <div class="sizes">
            <span
              v-for="s in uniqueSizes"
              :key="s"
              :class="{ active: s === selectedSize }"
              @click="selectedSize = s"
            >
              {{ s }}
            </span>
          </div>
          <button class="size-guide-btn" @click="showSizeGuide = true">
            Hướng dẫn chọn size
          </button>
        </div>

        <div class="block">
          <label>Số lượng mua:</label>
          <div class="qty-control">
            <div class="qty-input-group">
              <button @click="changeQty(-1)" :disabled="quantity <= 1">
                -
              </button>
              <input
                type="number"
                v-model.number="quantity"
                @input="validateQty"
              />
              <button
                @click="changeQty(1)"
                :disabled="
                  selectedVariant && quantity >= selectedVariant.soLuongTon
                "
              >
                +
              </button>
            </div>
            <span class="variant-stock-hint" v-if="selectedVariant">
              (Còn {{ selectedVariant.soLuongTon }} sản phẩm)
            </span>
          </div>
        </div>

        <div class="actions">
          <button class="add-btn">THÊM VÀO GIỎ</button>
          <button class="buy-btn" @click="buyNow">MUA NGAY</button>
        </div>
      </div>
    </main>

    <Footer></Footer>

    <div v-if="showSizeGuide" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Bảng thông số size</h3>
          <button @click="closeModal" class="close-x">&times;</button>
        </div>
        <img
          src="/src/assets/logo/image 55.png"
          alt="Size Guide"
          class="size-guide-image"
        />
      </div>
    </div>
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
const selectedColor = ref(null);
const selectedSize = ref(null);
const selectedVariant = ref(null);
const quantity = ref(1);
const showSizeGuide = ref(false);
const activeImage = ref("");
let timer = null;

// Helper: Format Price
const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v) + " đ";

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
  return [...new Set(sizes)];
});

const totalStock = computed(() => {
  if (!product.value || !product.value.bienTheList) return 0;
  return product.value.bienTheList.reduce(
    (sum, b) => sum + (b.soLuongTon || 0),
    0,
  );
});

const variantImages = computed(() => {
  if (!product.value || !product.value.bienTheList) return [];
  const images = product.value.bienTheList.flatMap((b) => b.hinhAnhUrls);
  return [...new Set(images)];
});

// Auto-play Logic
const startAutoPlay = () => {
  stopAutoPlay();
  timer = setInterval(() => {
    if (variantImages.value.length > 1) {
      const currentIndex = variantImages.value.indexOf(activeImage.value);
      const nextIndex = (currentIndex + 1) % variantImages.value.length;
      activeImage.value = variantImages.value[nextIndex];
    }
  }, 3000);
};

const stopAutoPlay = () => {
  if (timer) clearInterval(timer);
};

// Handlers
const changeQty = (num) => {
  const newQty = quantity.value + num;
  if (
    newQty >= 1 &&
    (!selectedVariant.value || newQty <= selectedVariant.value.soLuongTon)
  ) {
    quantity.value = newQty;
  }
};

const validateQty = () => {
  if (quantity.value < 1) quantity.value = 1;
  if (
    selectedVariant.value &&
    quantity.value > selectedVariant.value.soLuongTon
  ) {
    quantity.value = selectedVariant.value.soLuongTon;
  }
};

const closeModal = () => {
  showSizeGuide.value = false;
};

const buyNow = () => {
  if (product.value && selectedVariant.value) {
    router.push({
      path: "/payment",
      query: {
        productId: product.value.id,
        variantId: selectedVariant.value.id,
        quantity: quantity.value.toString(),
      },
    });
  } else {
    alert("Vui lòng chọn sản phẩm và biến thể trước khi mua.");
  }
};

// Watchers
watch([selectedColor, selectedSize], () => {
  if (selectedColor.value && selectedSize.value) {
    const found = product.value.bienTheList.find(
      (b) =>
        b.mauSacList.some((m) => m.rgb === selectedColor.value.rgb) &&
        b.kichCoList.includes(selectedSize.value),
    );
    selectedVariant.value = found || null;
  }
});

// Lifecycle
onMounted(async () => {
  try {
    const res = await axios.get(
      `http://localhost:8080/api/san-pham/${route.params.id}`,
    );
    product.value = res.data;
    if (variantImages.value.length > 0) {
      activeImage.value = variantImages.value[0];
    }
    if (product.value.bienTheList.length > 0) {
      selectedVariant.value = product.value.bienTheList[0];
    }
    startAutoPlay(); // Chạy auto slide sau khi dữ liệu đã tải xong
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu:", err);
  }
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.detail-container {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 50px;
  padding: 40px 10%;
}

/* LEFT: Gallery Styles */
.gallery {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.main-display {
  background: #fdfdfd;
  border: 1px solid #f0f0f0;
  height: 550px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.thumbnail-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 5px 0;
}

.thumb {
  width: 90px;
  height: 90px;
  border: 1px solid #ddd;
  padding: 4px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  border-radius: 2px;
}

.thumb.active {
  border: 2px solid #000;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* RIGHT: Info Styles */
.title {
  font-size: 32px;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.price {
  margin-bottom: 30px;
}

.price-range {
  font-size: 24px;
  font-weight: bold;
  color: #d0021b;
}

.total-stock-label {
  font-size: 14px;
  color: #777;
  margin-top: 5px;
}

.block {
  margin-bottom: 25px;
}

.block label {
  display: block;
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 15px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.size-guide-btn {
  background: none;
  border: none;
  text-decoration: underline;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.size-guide-btn:hover {
  color: #000;
}

.colors,
.sizes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: transform 0.2s;
}

.circle.selected {
  outline: 2px solid #000;
  outline-offset: 3px;
  transform: scale(1.1);
}

.sizes span {
  min-width: 50px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.sizes span.active {
  background: #000;
  color: #fff;
  border-color: #000;
}

/* Quantity Control */
.qty-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.qty-input-group {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.qty-input-group button {
  width: 40px;
  height: 40px;
  border: none;
  background: #f8f8f8;
  cursor: pointer;
  font-size: 18px;
}

.qty-input-group button:hover {
  background: #eee;
}

.qty-input-group input {
  width: 60px;
  text-align: center;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  outline: none;
}

.variant-stock-hint {
  font-size: 14px;
  color: #888;
}

/* Actions */
.actions {
  display: flex;
  gap: 15px;
  margin-top: 40px;
}

.add-btn,
.buy-btn {
  flex: 1;
  height: 50px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}

.add-btn {
  background: #fff;
  color: #000;
  border: 1px solid #000;
}

.buy-btn {
  background: #000;
  color: #fff;
}

.add-btn:hover,
.buy-btn:hover {
  opacity: 0.8;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  max-width: 700px;
  width: 90%;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.close-x {
  font-size: 28px;
  background: none;
  border: none;
  cursor: pointer;
}

.size-guide-image {
  width: 100%;
  border-radius: 4px;
}
</style>
