<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo-wrapper">
        <img src="/src/assets/logo/choco.png" class="logo" alt="ChocoStyle" />
      </div>

      <nav class="menu">
        <div class="menu-group">
          <div
            class="menu-item has-children"
            @click="toggleProduct"
          >
            📦 Quản lý sản phẩm
            <span class="arrow" :class="{ open: isProductOpen }">▾</span>
          </div>

          <div class="submenu" v-show="isProductOpen">
            <router-link to="/admin/product" class="submenu-item">
              Sản phẩm
            </router-link>
            <router-link to="/admin/color" class="submenu-item">
              Màu sắc
            </router-link>
            <router-link to="/admin/size" class="submenu-item">
              Kích cỡ
            </router-link>
            <router-link to="/admin/material" class="submenu-item">
              Chất liệu
            </router-link>
            <router-link to="/admin/origin" class="submenu-item">
              Xuất xứ
            </router-link>
            <router-link to="/admin/style" class="submenu-item">
              Phong cách mặc
            </router-link>
            <router-link to="/admin/type" class="submenu-item">
              Loại áo
            </router-link>
            <router-link to="/admin/shapetype" class="submenu-item">
              Kiểu dáng
            </router-link>
          </div>
        </div>

<div class="menu-group">
  <div
    class="menu-item has-children"
    @click="toggleAccount"
  >
    👤 Tài khoản
    <span class="arrow" :class="{ open: isAccountOpen }">▾</span>
  </div>

  <div class="submenu" v-show="isAccountOpen">
    <router-link to="/admin/employee" class="submenu-item">
      👥 Nhân viên
    </router-link>
    <router-link to="/admin/customer" class="submenu-item">
      👤 Khách hàng
    </router-link>
  </div>
</div>

   <div class="menu-group">
  <div
    class="menu-item has-children"
    @click="toggleDiscount"
  >
    🎫 Quản lý giảm giá
    <span class="arrow" :class="{ open: isDiscountOpen }">▾</span>
  </div>

  <div class="submenu" v-show="isDiscountOpen">
    <router-link to="/admin/voucher" class="submenu-item">
      Phiếu giảm giá
    </router-link>
    <router-link to="/admin/promotion" class="submenu-item">
      Đợt giảm giá
    </router-link>
  </div>
</div>


        <router-link to="/admin/invoice" class="menu-item">
          📄 Quản lý hóa đơn
        </router-link>

        <router-link to="/admin/return" class="menu-item">
          🔄 Quản lý đổi hàng
        </router-link>

        <router-link to="/admin/statistic" class="menu-item">
          📊 Thống kê
        </router-link>
      </nav>

      <div class="logout">⎋ Log Out</div>
    </aside>


    <div class="main">

     <header class="topbar">
  <div></div>

  <div class="top-icons">
    🔔
    👤
  </div>
</header>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { R } from 'vue-router/dist/router-CWoNjPRp.mjs'

const isDiscountOpen = ref(false)
const isAccountOpen = ref(false)
const isProductOpen = ref(false)

const toggleDiscount = () => {
  isDiscountOpen.value = !isDiscountOpen.value
}

const toggleAccount = () => {
  isAccountOpen.value = !isAccountOpen.value
}

const toggleProduct = () => {
  isProductOpen.value = !isProductOpen.value
}
</script>


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
  display: block;
  padding: 12px 15px;
  border-radius: 6px;
  color: #333;
  text-decoration: none;
  margin-bottom: 6px;
}

.menu-item:hover,
.router-link-active {
  background: #6b3f2a;
  color: #fff;
}

.menu-group .submenu {
  padding-left: 15px;
}

.submenu-item {
  display: block;
  padding: 8px 15px;
  color: #555;
  text-decoration: none;
  font-size: 14px;
}

.submenu-item:hover {
  text-decoration: underline;
}
.has-children {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.arrow {
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}


.submenu {
  padding-left: 15px;
  margin-top: 4px;
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
  background: #f7f7f7; 
}


.topbar {
  background: #fff;
  padding: 20px 20px;
  margin-left: 5px;             
  border-radius: 2px;      
  display: flex;
  justify-content: flex-end; 
  align-items: center;
  border: 1px solid #ddd;
}

.search-box input {
  border: none;
  outline: none;
  flex: 1;
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