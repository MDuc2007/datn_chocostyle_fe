<template>
  <aside class="sidebar-wrapper">
    <div class="user-brief">
      <div class="avatar-circle">
        <img
          v-if="currentUser?.avatar"
          :src="getFullImageUrl(currentUser.avatar)"
          alt="Avatar"
          @error="handleAvatarError"
        />
        <span v-else>{{ getUserInitial(currentUser?.tenKhachHang) }}</span>
      </div>
      <div class="user-info-text">
        <div class="username">
          {{ currentUser?.tenKhachHang || "Khách hàng" }}
        </div>
        <div class="edit-profile" @click="$router.push('/profile')">
          <i class="fa fa-pencil"></i> ✎ Sửa hồ sơ
        </div>
      </div>
    </div>

    <div class="sidebar-menu">
      <div class="menu-group">
        <div class="menu-header" @click="toggleMenu('account')">
          <span class="icon">👤</span> Tài khoản của tôi
        </div>
        <div class="submenu" v-if="openMenus.account">
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
          class="menu-header"
          @click="$router.push('/my-orders')"
          :class="{
            active:
              currentPath.includes('/my-orders') ||
              currentPath.includes('/order-detail'),
          }"
        >
          <span class="icon">📄</span> Đơn mua
        </div>
      </div>

      <div class="menu-group">
        <div class="menu-header" @click="$router.push('/my-vouchers')">
          <span class="icon">🎟️</span> Phiếu giảm giá
        </div>
      </div>

      <div class="menu-group">
        <div class="menu-header" @click="$router.push('/change-password')">
          <span class="icon">🔑</span> Đổi mật khẩu
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const currentUser = ref(null);
const openMenus = reactive({ account: true });

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
  if (imagePath.startsWith("http")) return imagePath;
  return `http://localhost:8080/images/${imagePath}`;
};

const handleAvatarError = (e) => {
  e.target.style.display = "none";
};

const loadCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
  }
};

onMounted(() => {
  loadCurrentUser();
});
</script>

<style scoped>
.sidebar-wrapper {
  width: 250px;
  flex-shrink: 0;
  padding: 15px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.user-brief {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}
.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #666;
  border: 1px solid #ddd;
}
.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}
.edit-profile {
  font-size: 13px;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.edit-profile:hover {
  color: #6b3f1e;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.menu-header {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 15px;
  color: #333;
  font-weight: 500;
  transition: 0.2s;
}
.menu-header:hover,
.menu-header.active {
  color: #6b3f1e;
  font-weight: 700;
}
.menu-header .icon {
  width: 20px;
  text-align: center;
  color: #555;
}

.submenu {
  padding-left: 35px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}
.submenu-item {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: 0.2s;
}
.submenu-item:hover,
.submenu-item.active {
  color: #6b3f1e;
}
</style>
