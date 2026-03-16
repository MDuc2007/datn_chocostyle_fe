<template>
  <aside class="sidebar-wrapper">
    
    <div class="user-brief" v-if="isLoggedIn">
      <div class="avatar-circle">
        <img
          v-if="currentUser?.avatar"
          :src="getFullImageUrl(currentUser.avatar)"
          alt="Avatar"
          @error="handleAvatarError"
        />
        <span v-else class="avatar-placeholder">{{ getUserInitial(currentUser?.tenKhachHang) }}</span>
      </div>
      <div class="user-info-text">
        <div class="username">
          {{ currentUser?.tenKhachHang || "Khách hàng" }}
        </div>
        <div class="edit-profile" @click="$router.push('/profile')">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span>Sửa hồ sơ</span>
        </div>
      </div>
    </div>

    <div class="user-brief" v-else style="justify-content: center; text-align: center; padding-bottom: 20px;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <div class="avatar-circle" style="background-color: #f3f4f6; border-color: #e5e7eb;">
          <span class="avatar-placeholder" style="color: #9ca3af;">?</span>
        </div>
        <div class="username" style="color: #6b7280;">Khách vãng lai</div>
        <button 
          style="background: #6b3f1e; color: white; border: none; padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; margin-top: 5px;"
          @click="$router.push('/login')"
        >
          Đăng nhập ngay
        </button>
      </div>
    </div>

    <nav class="sidebar-menu">
      
      <div class="menu-group" v-if="isLoggedIn">
        <div 
          class="menu-header" 
          @click="toggleMenu('account')"
          :class="{ 'menu-expanded': openMenus.account }"
        >
          <div class="menu-title">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Tài khoản của tôi
          </div>
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        <div class="submenu" v-show="openMenus.account">
          <div
            class="submenu-item"
            @click="$router.push('/profile')"
            :class="{ active: currentPath === '/profile' }"
          >
            Hồ sơ
          </div>
          <div
            class="submenu-item"
            @click="$router.push('/address')"
            :class="{ active: currentPath === '/address' }"
          >
            Địa chỉ
          </div>
        </div>
      </div>

      <div class="menu-group">
        <div
          class="menu-header single-link"
          @click="$router.push('/my-orders')"
          :class="{ active: currentPath.includes('/my-orders') || currentPath.includes('/order-detail') }"
        >
          <div class="menu-title">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Đơn mua
          </div>
        </div>
      </div>

      <div class="menu-group" v-if="isLoggedIn">
        <div 
          class="menu-header single-link" 
          @click="$router.push('/my-vouchers')"
          :class="{ active: currentPath.includes('/my-vouchers') }"
        >
          <div class="menu-title">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
            </svg>
            Phiếu giảm giá
          </div>
        </div>
      </div>

      <div class="menu-group" v-if="isLoggedIn">
        <div 
          class="menu-header single-link" 
          @click="$router.push('/change-password')"
          :class="{ active: currentPath.includes('/change-password') }"
        >
          <div class="menu-title">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Đổi mật khẩu
          </div>
        </div>
      </div>

    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const currentUser = ref(null);
const openMenus = reactive({ account: true });
const isLoggedIn = ref(false); // 👉 BIẾN LƯU TRẠNG THÁI ĐĂNG NHẬP

const currentPath = computed(() => route.path);

const toggleMenu = (key) => {
  openMenus[key] = !openMenus[key];
};

const getUserInitial = (name) => {
  if (!name) return "U";
  const words = String(name).trim().split(" ");
  return words[words.length - 1].charAt(0).toUpperCase();
};

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:image")) {
    return imagePath; 
  }
  const timestamp = new Date().getTime();
  return `http://localhost:8080/images/${imagePath}?t=${timestamp}`;
};

const handleAvatarError = (e) => {
  e.target.style.display = "none";
};

const loadCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  
  if (userStr && token) {
    currentUser.value = JSON.parse(userStr);
    isLoggedIn.value = true;
  } else {
    currentUser.value = null;
    isLoggedIn.value = false;
  }
};

onMounted(() => {
  loadCurrentUser();
  window.addEventListener('userUpdated', loadCurrentUser);
});

onBeforeUnmount(() => {
  window.removeEventListener('userUpdated', loadCurrentUser);
});
</script>

<style scoped>
/* TOÀN CỤC SIDEBAR */
.sidebar-wrapper {
  width: 260px;
  flex-shrink: 0;
  padding: 24px 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  font-family: 'Inter', sans-serif;
  border: 1px solid #f0f0f0;
}

/* KHU VỰC THÔNG TIN NGƯỜI DÙNG */
.user-brief {
  display: flex;
  gap: 16px;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px dashed #e5e7eb;
  margin-bottom: 20px;
}

.avatar-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  background: #fdf3eb; /* Tone nền cam/nâu nhạt */
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(107, 63, 30, 0.15);
  flex-shrink: 0;
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-weight: 700;
  font-size: 20px;
  color: #6b3f1e;
}

.user-info-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.username {
  font-weight: 700;
  font-size: 15px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-profile {
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  width: fit-content;
}

.edit-profile:hover {
  color: #6b3f1e;
}

.icon-sm {
  width: 14px;
  height: 14px;
}

/* KHU VỰC MENU */
.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-group {
  display: flex;
  flex-direction: column;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s ease;
  user-select: none;
}

.menu-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
  transition: color 0.2s;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  transition: transform 0.3s ease;
}

/* Trạng thái Hover & Mở rộng */
.menu-header:hover {
  background-color: #f9fafb;
  color: #111827;
}

.menu-header:hover .menu-icon {
  color: #6b3f1e;
}

.menu-expanded .chevron-icon {
  transform: rotate(180deg);
}

/* Trạng thái Active cho Single Link (Các menu không có con) */
.single-link.active {
  background-color: #fdf6f0;
  color: #6b3f1e;
  font-weight: 600;
}

.single-link.active .menu-icon {
  color: #6b3f1e;
}

/* KHU VỰC SUBMENU */
.submenu {
  display: flex;
  flex-direction: column;
  padding: 4px 0 8px 46px; /* Canh lùi vào tương ứng với text ở trên */
  gap: 4px;
}

.submenu-item {
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
}

/* Chấm tròn nhỏ phía trước submenu */
.submenu-item::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #d1d5db;
  transition: all 0.2s;
}

.submenu-item:hover {
  color: #111827;
  background-color: #f9fafb;
}

.submenu-item.active {
  color: #6b3f1e;
  font-weight: 600;
  background-color: #fdf6f0;
}

.submenu-item.active::before {
  background-color: #6b3f1e;
  width: 6px;
  height: 6px;
}
</style>