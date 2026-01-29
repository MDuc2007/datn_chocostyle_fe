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
        <!-- ===== NHÓM CHÍNH ===== -->
        <div class="menu-group">
          <router-link to="/admin" class="menu-item">
            <div class="invoice">
              <img src="/src/assets/icon/home.svg" style="width:30px;height:30px" />
              <div>Trang chủ</div>
            </div>
          </router-link>

          <router-link to="/admin/statistic" class="menu-item">
            <div class="invoice">
              <img src="/src/assets/icon/report.svg" style="width:30px;height:30px" />
              <div>Thống kê</div>
            </div>
          </router-link>

          <router-link to="/admin/pos" class="menu-item">
            <div class="invoice">
              <img src="/src/assets/icon/cashier.svg" style="width:30px;height:30px" />
              <div>Bán hàng tại quầy</div>
            </div>
          </router-link>

          <router-link to="/admin/invoice" class="menu-item">
            <div class="invoice">
              <img src="/src/assets/icon/invoice.svg" style="width:30px;height:30px" />
              <div>Quản lý hóa đơn</div>
            </div>
          </router-link>

          <!-- Quản lý sản phẩm -->
          <div
            class="menu-item has-children"
            :class="{ active: isProductOpen }"
            @click="goToProduct"
          >
            <img src="/src/assets/icon/box.svg" style="width:30px;height:30px" />
            <div>
              Quản lý sản phẩm
              <span class="arrow" :class="{ open: isProductOpen }">▾</span>
            </div>
          </div>

          <div class="submenu" v-show="isProductOpen">
            <router-link to="/admin/product" class="submenu-item">Sản phẩm</router-link>
            <router-link to="/admin/color" class="submenu-item">Màu sắc</router-link>
            <router-link to="/admin/size" class="submenu-item">Kích cỡ</router-link>
            <router-link to="/admin/material" class="submenu-item">Chất liệu</router-link>
            <router-link to="/admin/origin" class="submenu-item">Xuất xứ</router-link>
            <router-link to="/admin/style" class="submenu-item">Phong cách mặc</router-link>
            <router-link to="/admin/type" class="submenu-item">Loại áo</router-link>
            <router-link to="/admin/shapetype" class="submenu-item">Kiểu dáng</router-link>
          </div>
        </div>

        <!-- ===== KHUYẾN MẠI ===== -->
        <div class="menu-group">
          <div
            class="menu-item has-children"
            :class="{ active: isDiscountOpen }"
            @click="toggleDiscount"
          >
            <img src="/src/assets/icon/pgg.svg" style="width:30px;height:30px" />
            <div>
              Khuyến mại
              <span class="arrow" :class="{ open: isDiscountOpen }">▾</span>
            </div>
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

        <!-- ===== TÀI KHOẢN ===== -->
        <div class="menu-group">
          <div
            class="menu-item has-children"
            :class="{ active: isAccountOpen }"
            @click="toggleAccount"
          >
            <img src="/src/assets/icon/user.svg" style="width:30px;height:30px" />
            <div>
              Tài khoản
              <span class="arrow" :class="{ open: isAccountOpen }">▾</span>
            </div>
          </div>

          <div class="submenu" v-show="isAccountOpen">
            <router-link to="/admin/employee" class="submenu-item">
              Nhân viên
            </router-link>
            <router-link to="/admin/customer" class="submenu-item">
              Khách hàng
            </router-link>
          </div>
        </div>
      </nav>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="top-icons">
          <img src="/src/assets/icon/notification.svg" />
          <img src="/src/assets/icon/user.svg" />
        </div>
      </header>

      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const isDiscountOpen = ref(false);
const isAccountOpen = ref(false);
const isProductOpen = ref(false);

const goToProduct = () => {
  isProductOpen.value = !isProductOpen.value;

  // chuyển sang màn quản lý sản phẩm
  router.push("/admin/product");
};

const toggleDiscount = () => {
  isDiscountOpen.value = !isDiscountOpen.value;
};

const toggleAccount = () => {
  isAccountOpen.value = !isAccountOpen.value;
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f6f6f6;
}

/* ================= SIDEBAR ================= */
.sidebar {
  width: 270px;
  background: #fff;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
}

.logo-wrapper {
  padding: 20px;
  text-align: center;
}

.logo {
  width: 200px;
}

/* ================= MENU ================= */
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

.invoice {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* hover + active menu cha */
.menu-item:hover,
.router-link-active {
  background:
    linear-gradient(
      90deg,
      #c89b6d 0%,
      #6b3f23 100%
    );
  position: relative;
  color: #fff;
}

.menu-item:hover::after,
.router-link-active::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 6px;
}

/* ================= SUBMENU ================= */

/* ❌ bỏ thụt lề để thẳng hàng menu cha */
.menu-group .submenu {
  position: relative;
  margin-left: 20px;
  border-left: 2px solid #ddd; /* đường kẻ dọc */
}


/* item menu con */
/* item menu con – mỗi item 1 dòng */
.submenu-item {
  display: block;              /* 🔥 QUAN TRỌNG */
  padding: 8px 15px 8px 20px;
  font-size: 14px;
  font-weight: 400;
  color: #333;
  text-decoration: none;
  margin: 2px 0;               /* sát nhưng không dính */
}



/* hover menu con */
.submenu-item:hover {
  background: rgba(200, 155, 109, 0.25); /* vàng mờ */
  color: #333;
  font-weight: 600;
  border-radius: 4px;
}


/* active menu con */
.submenu-item.router-link-active {
  background: transparent;
  color: #000;
  font-weight: 600;
}


/* chấm tròn đổi màu khi hover/active */
.submenu-item:hover::before,
.submenu-item.router-link-active::before {
  color: #fff;
}

/* ================= HAS CHILD ================= */
.has-children {
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
}

.arrow {
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}
/* menu cha active – giữ gradient sau khi click */
.menu-item.active {
  background: linear-gradient(
    90deg,
    #c89b6d 0%,
    #6b3f23 100%
  );
  color: #fff;
  position: relative;
}

.menu-item.active::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 6px;
}

/* ================= MAIN ================= */
.main {
  margin-left: 270px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f7f7f7;
  height: 100vh;
}

.topbar {
  position: fixed;
  top: 0;
  left: 270px;
  right: 0;
  background: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  z-index: 900;
  display: flex;
  align-items: center;
}

.top-icons {
  margin-left: auto;
  font-size: 20px;
  display: flex;
  gap: 15px;
}

.content {
  margin-top: 65px;
  padding: 20px;
  height: calc(100vh - 80px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.admin-layout {
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

</style>
