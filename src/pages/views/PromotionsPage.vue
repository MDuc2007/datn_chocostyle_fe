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
        <h2 class="section-title styled-title">SẢN PHẨM KHUYẾN MÃI</h2>

        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu khuyến mãi...</p>
        </div>

        <div v-else-if="errorMsg" class="error-state">
          <div class="error-icon">⚠️</div>
          <p>{{ errorMsg }}</p>
          <button @click="fetchData" class="btn-retry">Thử lại</button>
        </div>

        <div v-else>
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
                    <span class="badge badge-sale">-{{ sp.phanTramGiam || 20 }}%</span>
                  </div>

                  <div class="product-info">
                    <h3 class="product-name" :title="sp.tenSp">{{ sp.tenSp }}</h3>
                    <div class="price-container">
                      <p class="old-price">
                        {{ formatPrice(sp.giaGoc || (sp.giaMin * 1.25)) }}
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
                  </div>
                </div>
              </transition-group>
            </div>

            <div v-if="hasMore" class="load-more-container">
              <button class="btn-load-more" @click="loadMoreProducts">
                Xem thêm ưu đãi
              </button>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">🎁</div>
            <p>Hiện chưa có chương trình khuyến mãi nào.</p>
          </div>
        </div>
      </section>
    </main>

    <Footer></Footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

const products = ref([]);
const isLoading = ref(true);
const errorMsg = ref("");

// Phân trang nội bộ
const itemsPerPage = 12;
const visibleCount = ref(itemsPerPage);

const displayedProducts = computed(() => {
  return products.value.slice(0, visibleCount.value);
});

const hasMore = computed(() => {
  return visibleCount.value < products.value.length;
});

const loadMoreProducts = () => {
  visibleCount.value += itemsPerPage;
};

// Format tiền
const formatPrice = (v) => {
  if (v == null) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(v) + " đ";
};

// Xử lý ảnh lỗi
const handleImageError = (event) => {
  event.target.src = "/src/assets/logo/no-image-placeholder.png"; 
};

// Chuyển trang
const goDetail = (id) => {
  router.push(`/home/product/${id}`);
};

// Tải dữ liệu
const fetchData = async () => {
  isLoading.value = true;
  errorMsg.value = "";
  try {
    // Tạm gọi API home. Sau này nếu Backend có API riêng cho sản phẩm sale (VD: /api/san-pham/sale), bạn đổi link ở đây nhé
    const res = await axios.get("http://localhost:8080/api/san-pham/home");
    
    let rawData = res.data.content || res.data || [];
    
    // Giả lập LỌC các sản phẩm đang được Sale (Tạm lấy random hoặc lấy 1 nửa danh sách)
    // Nếu BE của bạn có thuộc tính 'isSale' hoặc 'phanTramGiam', hãy filter theo thuộc tính đó.
    products.value = rawData.slice(0, 15); // Tạm lấy 15 sản phẩm đầu làm đồ sale

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
.breadcrumb span:hover { color: #d0021b; /* Màu hover đỏ cho trang sale */ }
.breadcrumb .separator { margin: 0 10px; cursor: default; }
.breadcrumb .current { font-weight: 600; color: #d0021b; cursor: default; }

/* Sub Banner Sale */
.sub-banner {
  background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/src/assets/logo/banner 1.png') center/cover;
  background-color: #b91c1c; /* Đỏ đậm làm fallback */
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

.styled-title {
  font-size: 28px;
  font-weight: bold;
  color: #d0021b; /* Tựa đề màu đỏ */
  text-transform: uppercase;
  letter-spacing: 2px;
  border-bottom: 2px solid #d0021b;
  display: block;
  text-align: center;
  padding-bottom: 10px;
  margin-bottom: 40px;
  width: fit-content; 
  margin-left: auto;
  margin-right: auto;
}

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
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(208, 2, 27, 0.15); /* Bóng đổ đỏ nhạt */
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
.badge-sale { 
  background-color: #d0021b; 
  box-shadow: 0 4px 6px rgba(208, 2, 27, 0.3);
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
  margin-bottom: 8px;
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
.product-card:hover .product-name { color: #d0021b; }

.price-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.old-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin: 0;
}

.new-price {
  font-weight: 800;
  color: #d0021b; 
  font-size: 18px;
  margin: 0;
}

/* Animation list */
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(30px); }

/* Load More */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}
.btn-load-more {
  padding: 12px 40px;
  background-color: transparent;
  color: #d0021b;
  border: 2px solid #d0021b;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-load-more:hover {
  background-color: #d0021b;
  color: #fff;
  box-shadow: 0 4px 10px rgba(208, 2, 27, 0.2);
}

/* Loading & Error */
.loading-state, .error-state, .empty-state { text-align: center; padding: 80px 0; color: #666; font-size: 16px; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #d0021b; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
.error-icon, .empty-icon { font-size: 48px; margin-bottom: 15px; opacity: 0.5;}
.btn-retry { margin-top: 15px; padding: 10px 24px; background-color: #d0021b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 1024px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .product-grid { grid-template-columns: repeat(2, 1fr); } .image-box { height: 220px; } }
@media (max-width: 480px) { .product-grid { grid-template-columns: repeat(1, 1fr); } }
</style>