<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo-wrapper">
        <img
          src="/src/assets/logo/choco-removebg-preview.png"
          class="logo"
          alt="ChocoStyle"
        />
      </div>

      <nav class="menu">
        <router-link to="/admin/product" custom v-slot="{ isActive, navigate }">
          <div
            class="menu-item"
            :class="{ active: isActive }"
            @click="navigate"
          >
            <img
              src="/src/assets/icon/box.svg"
              class="menu-icon default"
              alt="icon"
            />
            <img
              src="/src/assets/icon/box-white.svg"
              class="menu-icon hover"
              alt="icon"
            />

            <span>Quản lý sản phẩm</span>
          </div>
        </router-link>
        <!-- <div class="menu-group">
          <div class="menu-item has-children" @click="toggleAccount">
            <span>👤 Tài khoản</span>
            <span class="arrow" :class="{ open: isAccountOpen }">▾</span>
          </div>

          <div class="submenu" v-show="isAccountOpen">
            <router-link
              to="/admin/employee"
              class="submenu-item"
              active-class="submenu-active"
            >
              👥 Nhân viên
            </router-link>
            <router-link
              to="/admin/customer"
              class="submenu-item"
              active-class="submenu-active"
            >
              👤 Khách hàng
            </router-link>
          </div>
        </div>

        <div class="menu-group">
          <div class="menu-item has-children" @click="toggleDiscount">
            <span>🎫 Quản lý giảm giá</span>
            <span class="arrow" :class="{ open: isDiscountOpen }">▾</span>
          </div>

          <div class="submenu" v-show="isDiscountOpen">
            <router-link
              to="/admin/voucher"
              class="submenu-item"
              active-class="submenu-active"
            >
              Phiếu giảm giá
            </router-link>
            <router-link
              to="/admin/promotion"
              class="submenu-item"
              active-class="submenu-active"
            >
              Đợt giảm giá
            </router-link>
          </div>
        </div>

        <router-link
          to="/admin/invoice"
          class="menu-item"
          active-class="active"
        >
          📄 Quản lý hóa đơn
        </router-link> -->
      </nav>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="top-icons">🔔 👤</div>
      </header>

      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f6f6f6;
}

.sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.logo-wrapper {
  padding: 20px;
  text-align: center;
}

.logo {
  width: 120px;
}

.menu {
  flex: 1;
  padding: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  border-radius: 6px;
  color: #333;
  cursor: pointer;
  margin-bottom: 6px;
  transition: background 0.2s ease, color 0.2s ease;
}

.menu-item:hover {
  background: #63391F;
  color: #fff;
}

.menu-item.active {
  background: #63391F;
  color: #fff;
}

.menu-icon {
  width: 32px;
  height: 32px;
}

.menu-icon.hover {
  display: none;
}

.menu-item:hover .menu-icon.default,
.menu-item.active .menu-icon.default {
  display: none;
}

.menu-item:hover .menu-icon.hover,
.menu-item.active .menu-icon.hover {
  display: block;
}

.logout {
  padding: 15px;
  border-top: 1px solid #eee;
  cursor: pointer;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  background: #fff;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.top-icons {
  font-size: 20px;
  display: flex;
  gap: 15px;
}

.content {
  padding: 20px;
}
</style>