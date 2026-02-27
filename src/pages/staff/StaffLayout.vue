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
            <img src="/src/assets/icon/home.svg" class="menu-icon" />
            <div>Trang chủ</div>
          </div>
        </router-link>

        <router-link to="/staff/sales" class="menu-item">
          <div class="invoice">
            <img src="/src/assets/icon/cashier.svg" class="menu-icon" />
            <div>Bán hàng</div>
          </div>
        </router-link>

        <router-link to="/staff/invoice" class="menu-item">
          <div class="invoice">
            <img src="/src/assets/icon/invoice.svg" class="menu-icon" />
            <div>Hóa đơn</div>
          </div>
        </router-link>

        <router-link to="/staff/customer" class="menu-item">
          <div class="invoice">
            <img src="/src/assets/icon/user.svg" class="menu-icon" />
            <div>Khách hàng</div>
          </div>
        </router-link>

        <div class="menu-group">
          <div
            class="menu-item has-children"
            :class="{ active: isScheduleOpen }"
            @click="toggleSchedule"
          >
            <img src="/src/assets/icon/calendar.svg" class="menu-icon" />
            <div class="menu-text-wrap">
              <span>Lịch làm việc</span>
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
          <div class="user-welcome">
            <span class="user-name-bold">{{ currentUserName }}</span>
          </div>

          <img src="/src/assets/icon/notification.svg" class="icon" />
          
          <div class="user-icon-wrapper" @click.stop="toggleUserMenu" ref="userMenuRef">
            <img 
              v-if="currentUserAvatar" 
              :src="currentUserAvatar" 
              alt="Avatar" 
              class="user-avatar" 
              @error="handleAvatarError"
            />
            <div v-else class="user-initial">
              {{ getUserInitial(currentUserName) }}
            </div>

            <transition name="fade">
              <div v-if="isUserMenuOpen" class="user-dropdown">
                <button @click.stop="viewProfile" class="dropdown-item">Xem thông tin</button>
                <div class="dropdown-divider"></div>
                <button @click.stop="logout" class="dropdown-item text-danger">Đăng xuất</button>
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import axios from "axios"; // 👉 Đã thêm axios để gọi API

const router = useRouter();

// ===== Dropdown State =====
const isScheduleOpen = ref(false);
const isUserMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

// ===== Thông tin User =====
const currentUserName = ref("Nhân viên");
const currentUserAvatar = ref<string | null>(null);

// ===== Lấy dữ liệu khi load trang =====
onMounted(async () => {
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token"); // 👉 Lấy token để xác thực API

  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      // Ưu tiên lấy tenNhanVien, nếu không có lấy hoTen hoặc name
      currentUserName.value = userData.tenNhanVien || userData.hoTen || userData.name || userData.username || "Nhân viên";
      
      // 👉 GỌI API LẤY ẢNH TRỰC TIẾP TỪ BACKEND
      if (userData.id && token) {
        try {
          const res = await axios.get(`http://localhost:8080/api/nhan-vien/${userData.id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // Gán ảnh Base64 từ API vào biến hiển thị
          if (res.data && res.data.avatar) {
            currentUserAvatar.value = res.data.avatar;
          }
        } catch (apiError) {
          console.error("Lỗi không thể lấy ảnh nhân viên từ API:", apiError);
        }
      }
    } catch (e) {
      console.error("Lỗi đọc dữ liệu user:", e);
    }
  }

  // Lắng nghe click ra ngoài để đóng menu user
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Hàm lấy chữ cái đầu
const getUserInitial = (name: string) => {
  if (!name || name === "Nhân viên") return "N";
  const words = name.trim().split(' ');
  const lastName = words[words.length - 1];
  return lastName.charAt(0).toUpperCase();
};

// Handle lỗi ảnh avatar
const handleAvatarError = () => {
  currentUserAvatar.value = null; // Chuyển về chế độ hiện chữ cái đầu
};

// Đóng menu khi click ra ngoài
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false;
  }
};

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
  isUserMenuOpen.value = false;
  alert("Chức năng xem thông tin đang phát triển.");
};

// ===== Logout =====
const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.reload(); 
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

.menu-group {
  margin-bottom: 5px;
}

.menu-item {
  display: block;
  padding: 12px 15px;
  border-radius: 6px;
  color: #333;
  text-decoration: none;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.invoice {
  display: flex;
  align-items: center;
  gap: 15px;
}

.menu-icon {
  width: 24px;
  height: 24px;
}

/* hover + active menu cha */
.menu-item:hover,
.router-link-active,
.menu-item.active {
  background: linear-gradient(90deg, #c89b6d 0%, #6b3f23 100%);
  position: relative;
  color: #fff;
}

.menu-item:hover::after,
.router-link-active::after,
.menu-item.active::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  pointer-events: none;
}

/* ================= SUBMENU ================= */
.submenu {
  position: relative;
  margin-left: 20px;
  border-left: 2px solid #eee;
  padding: 5px 0;
}

.submenu-item {
  display: block;
  padding: 8px 15px 8px 20px;
  font-size: 14px;
  font-weight: 400;
  color: #555;
  text-decoration: none;
  margin: 2px 0;
  border-radius: 0 4px 4px 0;
  transition: all 0.2s;
}

.submenu-item:hover {
  background: rgba(200, 155, 109, 0.1);
  color: #6b3f23;
  font-weight: 600;
}

.submenu-item.router-link-active {
  background: rgba(200, 155, 109, 0.2);
  color: #6b3f23;
  font-weight: 700;
  border-left: 3px solid #6b3f23;
  padding-left: 17px;
}

/* ================= HAS CHILD ================= */
.has-children {
  display: flex;
  align-items: center;
  gap: 15px;
}

.menu-text-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.arrow {
  transition: transform 0.2s ease;
  font-size: 12px;
}

.arrow.open {
  transform: rotate(180deg);
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
  padding: 15px 25px;
  border-bottom: 1px solid #ddd;
  z-index: 900;
  display: flex;
  align-items: center;
}

.top-icons {
  margin-left: auto;
  font-size: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

/* TÊN NGƯỜI DÙNG */
.user-welcome {
  font-size: 14px;
  color: #555;
  margin-right: 5px;
}

.user-name-bold {
  font-weight: 700;
  color: #63391f;
}

/* ================= AVATAR / INITIAL ================= */
.user-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eee;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.user-initial {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #63391f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(99, 57, 31, 0.2);
}

/* ================= DROP DOWN MENU ================= */
.user-dropdown {
  position: absolute;
  top: calc(100% + 10px); 
  right: 0;
  background: white;
  border: 1px solid #ebebeb;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 5px 0;
  min-width: 160px;
  z-index: 1000;
  overflow: hidden; 
}

/* Mũi tên chỉ lên */
.user-dropdown::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 12px;
  width: 10px;
  height: 10px;
  background: white;
  transform: rotate(45deg);
  border-left: 1px solid #ebebeb;
  border-top: 1px solid #ebebeb;
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 20px;
  background: none;
  border: none;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
  box-sizing: border-box; 
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #63391f;
}

.dropdown-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 2px 0;
}

.text-danger {
  color: #ef4444;
}

.text-danger:hover {
  background-color: #fef2f2;
  color: #dc2626;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ================= CONTENT ================= */
.content {
  margin-top: 66px;
  padding: 20px;
  height: calc(100vh - 66px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
</style>