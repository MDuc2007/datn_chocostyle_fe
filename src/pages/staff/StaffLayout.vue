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
        <router-link to="/staff/dashboard" class="menu-item">
          <div class="invoice">
            <img
              src="/src/assets/icon/home.svg"
              style="width: 30px; height: 30px"
            />
            <div>Trang chủ</div>
          </div>
        </router-link>

        <router-link to="/staff/sales" class="menu-item">
          <div class="invoice">
            <img
              src="/src/assets/icon/cashier.svg"
              style="width: 30px; height: 30px"
            />
            <div>Bán hàng</div>
          </div>
        </router-link>

        <router-link to="/staff/invoice" class="menu-item">
          <div class="invoice">
            <img
              src="/src/assets/icon/invoice.svg"
              style="width: 30px; height: 30px"
            />
            <div>Hóa đơn</div>
          </div>
        </router-link>

        <router-link to="/staff/customer" class="menu-item">
          <div class="invoice">
            <img
              src="/src/assets/icon/user.svg"
              style="width: 30px; height: 30px"
            />
            <div>Khách hàng</div>
          </div>
        </router-link>

        <div class="menu-group">
          <div
            class="menu-item has-children"
            :class="{ active: isScheduleOpen }"
            @click="toggleSchedule"
          >
            <img
              src="/src/assets/icon/calendar.svg"
              style="width: 30px; height: 30px"
            />
            <div>
              Lịch làm việc
              <span class="arrow" :class="{ open: isScheduleOpen }">▾</span>
            </div>
          </div>

          <div class="submenu" v-show="isScheduleOpen">
            <router-link to="/staff/my-schedule" class="submenu-item">
              Lịch của tôi
            </router-link>

            <router-link to="/staff/shift-report" class="submenu-item">
              Giao ca và kế toán
            </router-link>
          </div>
        </div>
      </nav>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="top-icons">
          <img src="/src/assets/icon/notification.svg" class="icon" />
          <div class="user-icon-wrapper" @click="toggleUserMenu">
            <img src="/src/assets/icon/user.svg" class="icon" />
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
      </header>

      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// ===== Dropdown =====
const isScheduleOpen = ref(false);
const isUserMenuOpen = ref(false);

// ===== Toggle Lịch làm việc =====
const toggleSchedule = () => {
  isScheduleOpen.value = !isScheduleOpen.value;
};

// ===== Toggle User menu =====
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

// ===== Xem profile =====
const viewProfile = () => {
  alert("Chức năng xem thông tin đang phát triển.");
};

// ===== Logout =====
const logout = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  localStorage.removeItem("user");

  if (user.role === "ROLE_ADMIN" || user.role === "ROLE_STAFF") {
    router.replace("/admin/login");
  } else {
    router.replace("/login");
  }
};
</script>
<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f6f6f6;
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
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
  background: linear-gradient(90deg, #c89b6d 0%, #6b3f23 100%);
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
.menu-group .submenu {
  position: relative;
  margin-left: 20px;
  border-left: 2px solid #ddd;
}

.submenu-item {
  display: block;
  padding: 8px 15px 8px 20px;
  font-size: 14px;
  font-weight: 400;
  color: #333;
  text-decoration: none;
  margin: 2px 0;
}

.submenu-item:hover {
  background: rgba(200, 155, 109, 0.25);
  color: #333;
  font-weight: 600;
  border-radius: 4px;
  width: 130px;
}

.submenu-item.router-link-active {
  background: transparent;
  color: #000;
  font-weight: 600;
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

.menu-item.active {
  background: linear-gradient(90deg, #c89b6d 0%, #6b3f23 100%);
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
  width: 130px;
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
  width: 130px;
  font-weight: bold;
}
</style>
