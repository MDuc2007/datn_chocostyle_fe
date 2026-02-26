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
        <div class="menu-group">
          <router-link to="/admin/dashboard" class="menu-item">
            <div class="invoice">
              <img
                src="/src/assets/icon/home.svg"
                style="width: 30px; height: 30px"
              />
              <div>Trang chủ</div>
            </div>
          </router-link>

          <router-link to="/admin/statistic" class="menu-item">
            <div class="invoice">
              <img
                src="/src/assets/icon/report.svg"
                style="width: 30px; height: 30px"
              />
              <div>Thống kê</div>
            </div>
          </router-link>
          <router-link to="/admin/sales" class="menu-item">
            <div class="invoice">
              <img
                src="/src/assets/icon/cashier.svg"
                style="width: 30px; height: 30px"
              />
              <div>Bán hàng tại quầy</div>
            </div>
          </router-link>

          <router-link to="/admin/invoice" class="menu-item">
            <div class="invoice">
              <img
                src="/src/assets/icon/invoice.svg"
                style="width: 30px; height: 30px"
              />
              <div>Quản lý hóa đơn</div>
            </div>
          </router-link>

          <div
            class="menu-item has-children"
            :class="{ active: isProductOpen }"
            @click="goToProduct"
          >
            <img
              src="/src/assets/icon/box.svg"
              style="width: 30px; height: 30px"
            />
            <div>
              Quản lý sản phẩm
              <span class="arrow" :class="{ open: isProductOpen }">▾</span>
            </div>
          </div>

          <div class="submenu" v-show="isProductOpen">
            <router-link to="/admin/product" class="submenu-item"
              >Sản phẩm</router-link
            >
            <router-link to="/admin/product/details" class="submenu-item"
              >Biến thể sản phẩm</router-link
            >
            <router-link to="/admin/origin" class="submenu-item"
              >Xuất xứ</router-link
            >
            <router-link to="/admin/material" class="submenu-item"
              >Chất liệu</router-link
            >
            <router-link to="/admin/color" class="submenu-item"
              >Màu sắc</router-link
            >
            <router-link to="/admin/size" class="submenu-item"
              >Kích cỡ</router-link
            >
            <router-link to="/admin/style" class="submenu-item"
              >Phong cách mặc</router-link
            >
            <router-link to="/admin/type" class="submenu-item"
              >Loại áo</router-link
            >
            <router-link to="/admin/shapetype" class="submenu-item"
              >Kiểu dáng</router-link
            >
          </div>
        </div>

        <div class="menu-group">
          <div
            class="menu-item has-children"
            :class="{ active: isDiscountOpen }"
            @click="toggleDiscount"
          >
            <img
              src="/src/assets/icon/pgg.svg"
              style="width: 30px; height: 30px"
            />
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

        <div class="menu-group">
          <div
            class="menu-item has-children"
            :class="{ active: isAccountOpen }"
            @click="toggleAccount"
          >
            <img
              src="/src/assets/icon/user.svg"
              style="width: 30px; height: 30px"
            />
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
        <div class="menu-group">
          <div class="menu-item has-children" @click="toggleSchedule">
            <img
              src="/src/assets/icon/calendar.svg"
              alt=""
              style="width: 30px; height: 30px"
              onerror="
                this.src =
                  'https://cdn-icons-png.flaticon.com/512/2693/2693507.png'
              "
            />
            <div>
              Quản lý lịch làm việc
              <span class="arrow" :class="{ open: isScheduleOpen }">▾</span>
            </div>
          </div>

          <div class="submenu" v-show="isScheduleOpen">
            <router-link to="/admin/shift" class="submenu-item">
              Ca làm việc
            </router-link>
            <router-link to="/admin/schedule" class="submenu-item">
              Lịch làm việc
            </router-link>
          </div>
        </div>
      </nav>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="top-icons">
          <div class="user-welcome">
            <span class="user-name-bold">{{ currentUserName }}</span>
          </div>

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
import { ref, onMounted } from "vue"; // Thêm onMounted
import { useRouter } from "vue-router";

const router = useRouter();

// Các biến state cho menu
const isDiscountOpen = ref(false);
const isAccountOpen = ref(false);
const isProductOpen = ref(false);
const isUserMenuOpen = ref(false);
const isScheduleOpen = ref(false);

// Biến lưu tên người dùng
const currentUserName = ref("Admin");

// Hàm chạy khi load trang để lấy tên từ LocalStorage
onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      // LƯU Ý: Bạn cần kiểm tra xem object 'user' trong localStorage có trường nào lưu tên.
      // Ví dụ: tenNhanVien, hoTen, fullName, hoặc name.
      // Ở đây mình ưu tiên lấy 'tenNhanVien', nếu không có thì lấy 'hoTen', mặc định là 'Admin'
      currentUserName.value = userData.tenNhanVien || userData.hoTen || userData.name || "Admin";
    } catch (e) {
      console.error("Lỗi khi đọc dữ liệu user:", e);
    }
  }
});

const toggleSchedule = () => {
  isScheduleOpen.value = !isScheduleOpen.value;
};

const goToProduct = () => {
  isProductOpen.value = !isProductOpen.value;
  router.push("/admin/product");
};

const toggleDiscount = () => {
  isDiscountOpen.value = !isDiscountOpen.value;
};

const toggleAccount = () => {
  isAccountOpen.value = !isAccountOpen.value;
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
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f6f6f6;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
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
  gap: 20px; /* Tăng gap để tên và icon không dính nhau */
  align-items: center;
}

/* CSS CHO TÊN NGƯỜI DÙNG */
.user-welcome {
  font-size: 14px;
  color: #555;
  margin-right: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.user-name-bold {
  font-weight: 700;
  color: #63391f; /* Màu nâu chủ đạo */
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