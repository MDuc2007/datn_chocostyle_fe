<template>
  <header class="header">
    <div class="header-container">
      <!-- LOGO -->
      <div class="logo">
        <img src="/src/assets/logo/choco-removebg-preview.png" />
      </div>

      <!-- MENU -->
      <nav class="nav">
        <a class="active">Trang chủ</a>
        <a>Áo khoác</a>
        <a>Ưu đãi</a>
        <a>Mới về</a>
        <a>Thông tin</a>
      </nav>

      <!-- ACTIONS -->
      <div class="actions">
        <img
          src="/src/assets/icon/heart.svg"
          alt=""
          style="width: 30px; height: 30px"
        />

        <img
          src="/src/assets/icon/shoppingCart.svg"
          alt=""
          style="width: 30px; height: 30px"
        />

        <!-- User Menu -->
        <div class="user-icon-wrapper" @click="toggleUserMenu">
          <img
            src="/src/assets/icon/user.svg"
            alt=""
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
import { ref } from "vue";

const isUserMenuOpen = ref(false);

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const viewProfile = () => {
  alert("Chức năng xem thông tin người dùng đang được phát triển.");
};

const logout = () => {
  localStorage.removeItem("user");
  // alert("Đã xóa token! Hãy thử bấm Đăng nhập lại.");
  window.location.reload();
};
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
  height: 80px; /* Increased logo size */
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
}

.actions svg {
  width: 22px;
  height: 22px;
  fill: #333;
  cursor: pointer;
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
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  width: 140px;
}

.user-menu p:last-child,
.user-menu button:last-child {
  border-bottom: none;
}

.user-menu p:hover,
.user-menu button:hover {
  background: #f9f9f9;
  color: #000;
  font-weight: 500;
  font-weight: bold;
}
</style>
