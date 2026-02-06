<template>
  <div class="app-container">
    <Header></Header>

    <!-- BANNER -->
    <section class="banner">
      <img src="/src/assets/logo/banner 1.png" />
    </section>

    <main class="main-content">
      <!-- BEST SELLER -->
      <section class="section">
        <h2 class="section-title styled-title">ÁO KHOÁC NHIỀU LƯỢT MUA NHẤT</h2>

        <div class="best-seller-row">
          <button class="arrow left" @click="scrollLeft">
            <img src="/src/assets/icon/arrowRight.svg" alt="" />
          </button>
          <div class="best-seller-container">
            <div
              v-for="sp in bestSellers"
              :key="sp.id"
              class="product-card"
              @click="goDetail(sp.id)"
            >
              <div class="image-box">
                <img :src="sp.hinhAnh" />
              </div>

              <div class="product-info">
                <h3 class="product-name">{{ sp.tenSp }}</h3>
                <p class="price">
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
          <button class="arrow right" @click="scrollRight">
            <img src="/src/assets/icon/arrowLeft.svg" alt="" />
          </button>
        </div>
      </section>

      <!-- ALL PRODUCTS -->
      <section class="section">
        <h2 class="section-title styled-title">TẤT CẢ SẢN PHẨM</h2>

        <div class="product-grid">
          <div
            v-for="sp in products"
            :key="sp.id"
            class="product-card"
            @click="goDetail(sp.id)"
          >
            <div class="image-box">
              <img :src="sp.hinhAnh" />
            </div>

            <div class="product-info">
              <h3 class="product-name">{{ sp.tenSp }}</h3>
              <p class="price">
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
      </section>
    </main>

    <Footer></Footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const bestSellers = ref([]);
const products = ref([]);

const goDetail = (id) => {
  router.push(`/home/product/${id}`);
};

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v) + " đ";

const scrollLeft = () => {
  const container = document.querySelector(".best-seller-container");
  container.scrollBy({ left: -300, behavior: "smooth" });
};

const scrollRight = () => {
  const container = document.querySelector(".best-seller-container");
  container.scrollBy({ left: 300, behavior: "smooth" });
};

onMounted(async () => {
  const [bs, all] = await Promise.all([
    axios.get("http://localhost:8080/api/san-pham/best-seller"),
    axios.get("http://localhost:8080/api/san-pham/home"),
  ]);
  bestSellers.value = bs.data;
  products.value = all.data;
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ================= BANNER ================= */
.banner img {
  width: 100%;
  height: 500px;
  display: block;
  object-fit: cover;
}

/* ================= SECTION ================= */
.section {
  padding: 60px 4%;
}

.section-title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 40px;
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
  margin-bottom: 30px;
}

/* ================= BEST SELLER ================= */
.best-seller-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.best-seller-container {
  display: flex;
  gap: 30px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 10px;
  flex-grow: 1;
}

.best-seller-container::-webkit-scrollbar {
  display: none;
}

/* Arrow */
.arrow {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.3s;
}

.arrow:hover {
  background: #f2f2f2;
}

/* ================= PRODUCT GRID ================= */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 30px;
  justify-items: center;
}

/* ================= PRODUCT CARD (DÙNG CHUNG) ================= */
.product-card {
  width: 260px;
  border-radius: 18px;
  border: 1px solid #eee;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0; /* quan trọng cho best seller */
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

/* ================= IMAGE ================= */
.image-box {
  width: 100%;
  height: 260px;
  background: #f6f6f6;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* ================= INFO ================= */
.product-info {
  padding: 14px;
  text-align: center;
}

.product-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
}

.price {
  font-weight: 700;
  color: #6b3f1e;
}

/* ================= RESPONSIVE ================= */
@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .banner img {
    height: 320px;
  }
}
</style>
