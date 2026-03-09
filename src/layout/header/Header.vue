<template>
  <div class="header-placeholder" :class="{ 'is-scrolled': isScrolled }"></div>
  
  <header class="header" :class="{ 'is-scrolled': isScrolled }">
    <div class="header-container">
      
      <div class="logo" @click="$router.push('/')">
        <img
          src="/src/assets/logo/choco-removebg-preview.png"
          alt="ChocoStyle Logo"
        />
      </div>

      <nav class="nav">
        <router-link to="/" exact-active-class="active">Trang chủ</router-link>
        <router-link to="/ao-khoac" active-class="active">Sản phẩm</router-link>
        <router-link to="/uu-dai" active-class="active">Ưu đãi</router-link>
        <router-link to="/moi-ve" active-class="active">Mới về</router-link>
        <router-link to="/tra-cuu" active-class="active">Tra cứu</router-link>
        <router-link to="/thong-tin" active-class="active">Về chúng tôi</router-link>
      </nav>

      <div class="actions">
        <div class="action-btn cart-wrapper" @click="$router.push('/cart')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <span v-if="cartTotal > 0" class="cart-badge">{{ cartTotal }}</span>
        </div>

        <div class="action-btn user-icon-wrapper" @click.stop="toggleUserMenu" ref="userMenuRef">
          
          <template v-if="!currentUser">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </template>

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

          <transition name="dropdown-fade">
            <div v-if="isUserMenuOpen" class="user-menu" @click.stop>
              <template v-if="!currentUser">
                <button @click="goToLogin" class="menu-item login-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                  Đăng nhập
                </button>
                <button @click="goToRegister" class="menu-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                  Đăng ký
                </button>
              </template>

              <template v-else>
                <div class="user-welcome">
                  <p class="welcome-text">Xin chào,</p>
                  <p class="user-name">{{ currentUser.tenKhachHang }}</p>
                </div>
                <div class="menu-divider"></div>
                <button @click="viewProfile" class="menu-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Tài khoản của tôi
                </button>
                <button @click="logout" class="menu-item logout">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Đăng xuất
                </button>
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
const isScrolled = ref(false); 

const updateCartTotal = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartTotal.value = cart.reduce((sum, item) => sum + item.soLuong, 0);
};

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  return `http://localhost:8080/images/${imagePath}`;
};

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
      avatar: displayAvatar,
    };

    if (actualToken) {
      const headers = { Authorization: `Bearer ${actualToken}` };

      if (currentUser.value.id) {
        try {
          const res = await axios.get(`http://localhost:8080/api/khach-hang/${currentUser.value.id}`, { headers });
          if (res.data) {
            currentUser.value.tenKhachHang = res.data.tenKhachHang || currentUser.value.tenKhachHang;
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
              console.log("Hoàn tất dùng dữ liệu LocalStorage.");
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
  const words = String(name).trim().split(" ");
  const lastName = words[words.length - 1];
  return lastName.charAt(0).toUpperCase();
};

const handleAvatarError = () => {
  if (currentUser.value) {
    currentUser.value.avatar = null;
  }
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    isUserMenuOpen.value = false;
  }
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10; 
};

const goToLogin = () => {
  isUserMenuOpen.value = false;
  router.push("/login");
};

const goToRegister = () => {
  isUserMenuOpen.value = false;
  router.push("/register");
};

const viewProfile = () => {
  isUserMenuOpen.value = false;
  router.push('/profile'); 
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("idNv");
  localStorage.removeItem("tenNv");
  currentUser.value = null;
  isUserMenuOpen.value = false;
  router.push("/login");
};

onMounted(() => {
  updateCartTotal();
  checkLoginStatus();

  window.addEventListener("cartUpdated", updateCartTotal);
  window.addEventListener("userLoggedIn", checkLoginStatus);
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("scroll", handleScroll); 
});

onBeforeUnmount(() => {
  window.removeEventListener("cartUpdated", updateCartTotal);
  window.removeEventListener("userLoggedIn", checkLoginStatus);
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("scroll", handleScroll); 
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap');

/* ================= THIẾT LẬP HEADER CỐ ĐỊNH ================= */
/* BẢN SỬA LỖI TRÔI HEADER: 
  Sử dụng position: fixed để ép nó ghim lên cùng màn hình, 
  không phụ thuộc vào parent có bị overflow hay không.
*/
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px); /* Hỗ trợ Safari */
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 10000; /* Đẩy index lên cực đại để đè lên mọi element */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  font-family: 'Nunito', sans-serif;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Do dùng position: fixed, ta cần 1 cái div giả lót ở dưới 
   để nội dung trang web không bị chui tuột vào trong Header lúc đầu */
.header-placeholder {
  height: 80px; 
  width: 100%;
  transition: height 0.4s ease;
}

.header-placeholder.is-scrolled {
  height: 65px; 
}

/* Hiệu ứng khi cuộn trang */
.header.is-scrolled {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 30px rgba(99, 57, 31, 0.08);
  border-bottom-color: transparent;
}

.header-container {
  max-width: 1280px;
  margin: auto;
  padding: 0 20px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: height 0.4s ease;
}

/* Thu nhỏ header lại một chút khi cuộn */
.header.is-scrolled .header-container {
  height: 65px;
}

/* ================= LOGO ================= */
.logo {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.logo img {
  height: 65px;
  object-fit: contain;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.4s ease;
}

.header.is-scrolled .logo img {
  height: 50px;
}

.logo:hover img {
  transform: scale(1.05) rotate(-2deg);
}

/* ================= NAV MENU ================= */
.nav {
  display: flex;
  gap: 40px;
}

.nav a {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #4b5563;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  padding: 10px 0;
  transition: color 0.3s ease;
}

.nav a:hover {
  color: #63391F; 
}

/* Hiệu ứng gạch dưới hiện đại */
.nav a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0%;
  height: 3px;
  background: linear-gradient(90deg, #63391F, #8b5328);
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 4px;
}

.nav a.active {
  color: #63391F;
}

.nav a.active::after {
  width: 100%;
}

.nav a:hover::after {
  width: 70%;
}

/* ================= ACTIONS (ICONS) ================= */
.actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.action-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #374151;
  transition: all 0.3s ease;
  position: relative;
  background-color: transparent;
}

.action-btn svg {
  width: 24px;
  height: 24px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.action-btn:hover {
  background-color: #fdfaf8;
  color: #63391F;
}

.action-btn:hover svg {
  transform: scale(1.15);
}

/* Giỏ hàng */
.cart-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  font-size: 11px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #fff;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.action-btn:hover .cart-badge {
  transform: scale(1.2) translateY(-2px);
}

/* ================= USER AVATAR ================= */
.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.user-icon-wrapper:hover .user-avatar {
  border-color: #63391F;
  box-shadow: 0 4px 10px rgba(99, 57, 31, 0.2);
}

.user-initial {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #63391F, #8b5328);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  box-shadow: 0 4px 10px rgba(99, 57, 31, 0.2);
  transition: transform 0.3s ease;
}

.user-icon-wrapper:hover .user-initial {
  transform: scale(1.05);
}

/* ================= DROPDOWN MENU ================= */
.user-menu {
  position: absolute;
  top: 60px;
  right: 0;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 1000;
  min-width: 250px;
}

.user-welcome {
  padding: 16px 16px 12px;
}

.welcome-text {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.user-name {
  margin: 4px 0 0 0;
  font-size: 16px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-divider {
  height: 1px;
  background-color: #f1f5f9;
  margin: 8px 0;
}

.menu-item {
  margin: 2px 0;
  padding: 12px 16px;
  text-align: left;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box; 
}

.menu-item svg {
  width: 20px;
  height: 20px;
  color: #94a3b8;
  transition: color 0.2s;
}

.menu-item:hover {
  background-color: #f8fafc;
  color: #1e293b;
  transform: translateX(4px);
}

.menu-item:hover svg {
  color: #63391F;
}

.login-btn {
  color: #1e293b;
}

.logout {
  color: #ef4444;
}
.logout svg {
  color: #fca5a5;
}
.logout:hover {
  background-color: #fef2f2;
  color: #dc2626;
}
.logout:hover svg {
  color: #ef4444;
}

/* Animations Dropdown */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* ================= RESPONSIVE ================= */
@media (max-width: 1024px) {
  .nav { gap: 20px; }
  .nav a { font-size: 13px; }
}

@media (max-width: 768px) {
  .nav { display: none; /* Nên có Hamburger menu riêng cho Mobile */ }
}
</style>