<template>
  <header class="header">
    <div class="header-container">
      <div class="logo" @click="$router.push('/')" style="cursor: pointer;">
        <img src="/src/assets/logo/choco-removebg-preview.png" />
      </div>

<nav class="nav">
        <router-link to="/" exact-active-class="active">Trang chủ</router-link>
        <router-link to="/ao-khoac" active-class="active">Áo khoác</router-link>
        <router-link to="/uu-dai" active-class="active">Ưu đãi</router-link>
        <router-link to="/moi-ve" active-class="active">Mới về</router-link>
        <router-link to="/thong-tin" active-class="active">Thông tin</router-link>
      </nav>

      <div class="actions">
        <img
          src="/src/assets/icon/heart.svg"
          alt="Wishlist"
          style="width: 30px; height: 30px; cursor: pointer;"
        />

        <div class="cart-wrapper" @click="$router.push('/cart')">
          <img
            src="/src/assets/icon/shoppingCart.svg"
            alt="Cart"
            style="width: 30px; height: 30px"
          />
          <span v-if="cartTotal > 0" class="cart-badge">{{ cartTotal }}</span>
        </div>

        <div class="user-icon-wrapper" @click="toggleUserMenu">
          <img
            src="/src/assets/icon/user.svg"
            alt="User"
            style="width: 30px; height: 30px"
          />
          <transition name="fade">
            <div v-if="isUserMenuOpen" class="user-menu">
              <p @click="viewProfile" class="menu-item">Xem thông tin</p>
              <button @click="logout" class="menu-item logout">
                Đăng xuất
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isUserMenuOpen = ref(false);

// Biến lưu tổng số lượng sản phẩm trong giỏ
const cartTotal = ref(0);

// Hàm tính toán lại tổng số lượng trong giỏ hàng
const updateCartTotal = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  // Cộng dồn số lượng của tất cả sản phẩm
  cartTotal.value = cart.reduce((sum, item) => sum + item.soLuong, 0);
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const viewProfile = () => {
  alert("Chức năng xem thông tin người dùng đang được phát triển.");
};

const logout = () => {
  localStorage.removeItem("user");
  window.location.reload();
};

// Lifecycle: Chạy khi Header được load
onMounted(() => {
  updateCartTotal();
  // Lắng nghe sự kiện để cập nhật giỏ hàng ngay lập tức khi ở trang chi tiết
  window.addEventListener("cartUpdated", updateCartTotal);
});

// Dọn dẹp sự kiện khi component bị hủy
onUnmounted(() => {
  window.removeEventListener("cartUpdated", updateCartTotal);
});
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  background: #fff;
  border-bottom: 1px solid #eee;
  z-index: 1000;
}

.header-container {
  max-width: 1400px;
  margin: auto;
  padding: 14px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo img {
  height: 80px; 
}

/* Menu */
.nav {
  display: flex;
  gap: 34px;
}

.nav a {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
}

.nav a.active {
  background: #63391f;
  color: #fff;
  width: 100px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
}

/* Actions */
.actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.actions svg {
  width: 22px;
  height: 22px;
  fill: #333;
  cursor: pointer;
}

/* 👉 CSS CHO GIỎ HÀNG VÀ CHẤM ĐỎ SỐ LƯỢNG */
.cart-wrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -8px;
  background-color: #d0021b;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* User Menu */
.user-icon-wrapper {
  position: relative;
  cursor: pointer;
}

.user-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  padding: 10px;
  z-index: 1000;
  min-width: 150px;
}

.user-menu p,
.user-menu button {
  margin: 0;
  padding: 10px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  width: 100%;
  box-sizing: border-box;
}

.user-menu p:last-child,
.user-menu button:last-child {
  border-bottom: none;
}

.user-menu p:hover,
.user-menu button:hover {
  background: #f9f9f9;
  color: #000;
  font-weight: bold;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>