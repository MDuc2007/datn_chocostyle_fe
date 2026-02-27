<template>
  <header class="header">
    <div class="header-container">
      <div class="logo" @click="$router.push('/')" style="cursor: pointer;">
        <img src="/src/assets/logo/choco-removebg-preview.png" alt="Choco Style" />
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
          src="/src/assets/icon/box.svg"
          alt="Tra cứu"
          class="action-icon"
          title="Tra cứu đơn hàng"
          @click="$router.push('/tra-cuu')"
        />

        <img
          src="/src/assets/icon/heart.svg"
          alt="Wishlist"
          class="action-icon"
        />

        <div class="cart-wrapper" @click="$router.push('/cart')">
          <img
            src="/src/assets/icon/shoppingCart.svg"
            alt="Cart"
            class="action-icon"
          />
          <span v-if="cartTotal > 0" class="cart-badge">{{ cartTotal }}</span>
        </div>

        <div class="user-icon-wrapper" @click.stop="toggleUserMenu" ref="userMenuRef">
          
          <img v-if="!currentUser" src="/src/assets/icon/user.svg" alt="User" class="action-icon" />

          <template v-else>
            <img 
              v-if="currentUser.avatar" 
              :src="getFullImageUrl(currentUser.avatar)" 
              alt="Avatar" 
              class="user-avatar" 
              @error="handleAvatarError"
            />
            <div v-else class="user-initial">
              {{ getUserInitial(currentUser.tenKhachHang) }}
            </div>
          </template>

          <transition name="fade">
            <div v-if="isUserMenuOpen" class="user-menu" @click.stop>
              <template v-if="!currentUser">
                <button @click="goToLogin" class="menu-item login-btn">Đăng nhập</button>
                <button @click="goToRegister" class="menu-item">Đăng ký</button>
              </template>

              <template v-else>
                <div class="user-welcome">
                  <p class="welcome-text">Xin chào,</p>
                  <p class="user-name">
                    {{ currentUser.tenKhachHang }}
                  </p>
                </div>
                <div class="menu-divider"></div>
                <button @click="viewProfile" class="menu-item"><i class="fa fa-user-circle"></i> Tài khoản của tôi</button>
                <button @click="$router.push('/don-hang')" class="menu-item"><i class="fa fa-shopping-bag"></i> Đơn mua</button>
                <button @click="logout" class="menu-item logout"><i class="fa fa-sign-out-alt"></i> Đăng xuất</button>
              </template>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const isUserMenuOpen = ref(false);
const cartTotal = ref(0);
const currentUser = ref(null);
const userMenuRef = ref(null);

// ================= LOGIC GIỎ HÀNG =================
const updateCartTotal = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartTotal.value = cart.reduce((sum, item) => sum + item.soLuong, 0);
};

// 👉 ĐÃ THÊM: Hàm xử lý đường dẫn ảnh từ Backend
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "";
  // Nếu ảnh là link Google/Facebook/Imgur thì giữ nguyên
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  // Nếu chỉ là tên file (VD: avatar.jpg), nối thêm domain Backend
  // LƯU Ý: Sửa port 8080 thành port thật của bạn nếu cần
  return `http://localhost:8080/images/${imagePath}`;
};

// ================= LOGIC USER & ẢNH ĐẠI DIỆN =================
const checkLoginStatus = async () => {
  const userStr = localStorage.getItem("user");

  if (!userStr) {
    currentUser.value = null;
    return;
  }

  try {
    const userData = JSON.parse(userStr);
    const actualToken = localStorage.getItem("token") || userData.accessToken;

    const displayName = userData.tenKhachHang || userData.tenNhanVien || userData.hoTen || userData.name || userData.username || userData.email || "Khách hàng";
    const displayAvatar = userData.avatar || userData.picture || userData.hinhAnh || null;

    currentUser.value = {
      id: userData.id || null,
      email: userData.email || userData.username,
      tenKhachHang: displayName,
      avatar: displayAvatar
    };

    // NẾU CÓ TOKEN, GỌI API ĐỂ LẤY THÔNG TIN MỚI NHẤT TỪ DB
    if (actualToken) {
      const headers = { Authorization: `Bearer ${actualToken}` };

      if (currentUser.value.id) {
        try {
          const res = await axios.get(`http://localhost:8080/api/khach-hang/${currentUser.value.id}`, { headers });
          if (res.data) {
            currentUser.value.tenKhachHang = res.data.tenKhachHang || currentUser.value.tenKhachHang;
            // Gán lại avatar nếu API trả về ảnh mới
            if (res.data.avatar || res.data.hinhAnh) {
               currentUser.value.avatar = res.data.avatar || res.data.hinhAnh;
            }
          }
        } catch (err) {
          if (currentUser.value.email) {
            try {
              const resEmail = await axios.get(`http://localhost:8080/api/khach-hang/email/${currentUser.value.email}`, { headers });
              if (resEmail.data) {
                currentUser.value.tenKhachHang = resEmail.data.tenKhachHang || currentUser.value.tenKhachHang;
                if (resEmail.data.avatar || resEmail.data.hinhAnh) {
                   currentUser.value.avatar = resEmail.data.avatar || resEmail.data.hinhAnh;
                }
              }
            } catch (err2) {
              console.log("Hoàn tất dùng dữ liệu LocalStorage (Không kéo được ảnh từ API).");
            }
          }
        }
      }
    }

  } catch (e) {
    console.error("Lỗi parse user data", e);
    currentUser.value = null;
  }
};

const getUserInitial = (name) => {
  if (!name) return "U"; 
  const words = String(name).trim().split(' ');
  const lastName = words[words.length - 1];
  return lastName.charAt(0).toUpperCase();
};

const handleAvatarError = () => {
  if (currentUser.value) {
    currentUser.value.avatar = null; 
  }
};

// ================= MENU ACTIONS =================
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    isUserMenuOpen.value = false;
  }
};

const goToLogin = () => {
  isUserMenuOpen.value = false;
  router.push('/login');
};

const goToRegister = () => {
  isUserMenuOpen.value = false;
  router.push('/register');
};

const viewProfile = () => {
  isUserMenuOpen.value = false;
  alert("Chức năng xem thông tin người dùng đang được phát triển.");
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token"); 
  localStorage.removeItem("idNv"); 
  localStorage.removeItem("tenNv"); 
  currentUser.value = null;
  isUserMenuOpen.value = false;
  router.push('/login');
};

// ================= LIFECYCLE =================
onMounted(() => {
  updateCartTotal();
  checkLoginStatus();
  
  window.addEventListener("cartUpdated", updateCartTotal);
  window.addEventListener("userLoggedIn", checkLoginStatus);
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener("cartUpdated", updateCartTotal);
  window.removeEventListener("userLoggedIn", checkLoginStatus);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  background: #fff;
  border-bottom: 1px solid #eee;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.header-container {
  max-width: 1400px;
  margin: auto;
  padding: 10px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo img {
  height: 70px; 
}

/* ================= MENU ================= */
.nav {
  display: flex;
  gap: 15px;
}

.nav a {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  text-decoration: none;
  padding: 8px 20px;
  border-radius: 20px; 
  transition: all 0.3s ease;
}

.nav a:hover {
  color: #6b3f1e;
  background-color: #fdf8f6;
}

.nav a.active {
  background-color: #63391f; 
  color: #fff; 
  box-shadow: 0 4px 10px rgba(99, 57, 31, 0.2);
}

/* ================= ACTIONS ================= */
.actions {
  display: flex;
  gap: 22px;
  align-items: center;
}

.action-icon {
  width: 26px;
  height: 26px;
  cursor: pointer;
  transition: transform 0.2s;
}
.action-icon:hover { transform: scale(1.1); }

/* Giỏ hàng */
.cart-wrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background-color: #d0021b;
  color: #fff;
  font-size: 11px;
  font-weight: bold;
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(208, 2, 27, 0.3);
}

/* ================= USER AVATAR / INITIAL ================= */
.user-icon-wrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.user-initial {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #6b3f1e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(107, 63, 30, 0.2);
}

/* ================= USER DROPDOWN MENU ================= */
.user-menu {
  position: absolute;
  top: 45px;
  right: -10px;
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 1000;
  min-width: 180px;
}

.user-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 20px;
  width: 12px;
  height: 12px;
  background: white;
  transform: rotate(45deg);
  border-left: 1px solid #eee;
  border-top: 1px solid #eee;
}

.user-welcome {
  padding: 10px 16px;
}
.welcome-text { margin: 0; font-size: 12px; color: #888; }
.user-name { margin: 2px 0 0 0; font-size: 14px; font-weight: 700; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}

.menu-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 5px 0;
}

.menu-item {
  margin: 0;
  padding: 12px 16px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #444;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 0.2s;
  box-sizing: border-box; /* Sửa lỗi tràn nền */
}

.menu-item i { width: 16px; text-align: center; color: #6b3f1e;}

.menu-item:hover {
  background: #fdf8f6;
  color: #6b3f1e;
  font-weight: 600;
}

.login-btn { color: #6b3f1e; font-weight: 600; }

.logout { color: #ef4444; }
.logout i { color: #ef4444; }
.logout:hover { background: #fef2f2; color: #dc2626; }

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>