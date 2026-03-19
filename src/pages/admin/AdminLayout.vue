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
              <img src="/src/assets/icon/home.svg" class="menu-icon" />
              <div>Trang chủ</div>
            </div>
          </router-link>

          <router-link to="/admin/statistic" class="menu-item">
            <div class="invoice">
              <img src="/src/assets/icon/report.svg" class="menu-icon" />
              <div>Thống kê</div>
            </div>
          </router-link>

          <router-link to="/admin/sales" class="menu-item">
            <div class="invoice">
              <img src="/src/assets/icon/cashier.svg" class="menu-icon" />
              <div>Bán hàng tại quầy</div>
            </div>
          </router-link>

          <router-link to="/admin/invoice" class="menu-item">
            <div class="invoice">
              <img src="/src/assets/icon/invoice.svg" class="menu-icon" />
              <div>Quản lý hóa đơn</div>
            </div>
          </router-link>

          <div
            class="menu-item has-children"
            :class="{ active: isProductOpen }"
            @click="goToProduct"
          >
            <img src="/src/assets/icon/box.svg" class="menu-icon" />
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
            <img src="/src/assets/icon/pgg.svg" class="menu-icon" />
            <div>
              Quản lý giảm giá
              <span class="arrow" :class="{ open: isDiscountOpen }">▾</span>
            </div>
          </div>
          <div class="submenu" v-show="isDiscountOpen">
            <router-link to="/admin/voucher" class="submenu-item"
              >Phiếu giảm giá</router-link
            >
            <router-link to="/admin/promotion" class="submenu-item"
              >Đợt giảm giá</router-link
            >
          </div>
        </div>

        <div class="menu-group">
          <div
            class="menu-item has-children"
            :class="{ active: isAccountOpen }"
            @click="toggleAccount"
          >
            <img src="/src/assets/icon/user.svg" class="menu-icon" />
            <div>
              Tài khoản
              <span class="arrow" :class="{ open: isAccountOpen }">▾</span>
            </div>
          </div>
          <div class="submenu" v-show="isAccountOpen">
            <router-link to="/admin/employee" class="submenu-item"
              >Nhân viên</router-link
            >
            <router-link to="/admin/customer" class="submenu-item"
              >Khách hàng</router-link
            >
          </div>
        </div>

        <div class="menu-group">
          <div class="menu-item has-children" @click="toggleSchedule">
            <img
              src="/src/assets/icon/calendar.svg"
              class="menu-icon"
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
            <router-link to="/admin/shift" class="submenu-item"
              >Ca làm việc</router-link
            >
            <router-link to="/admin/schedule" class="submenu-item"
              >Lịch làm việc</router-link
            >
            <router-link to="/admin/shift-handover" class="submenu-item"
              >Lịch sử hoạt động</router-link
            >
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
          <div class="notification-wrapper" @click.stop="toggleNotification">
            <img src="/src/assets/icon/notification.svg" class="icon" />

            <span v-if="notificationCount > 0" class="notification-badge">
              {{ notificationCount > 99 ? "99+" : notificationCount }}
            </span>

            <!-- DROPDOWN -->
            <div v-if="isNotificationOpen" class="notification-dropdown">
              <div class="notification-header">
                <span>Thông báo</span>

                <button class="mark-read" @click="markAllRead">
                  Đánh dấu đã đọc
                </button>
              </div>

              <div v-if="notifications.length === 0" class="notification-empty">
                Không có thông báo
              </div>

              <div
                v-for="(noti, index) in notifications"
                :key="noti.id"
                class="notification-item"
                :class="{ unread: !noti.daDoc }"
                @click="openNotification(noti)"
              >
                <div class="noti-icon">
                  <span v-if="noti.loaiThongBao === 'ORDER_NEW'">🛒</span>
                  <span v-else-if="noti.loaiThongBao === 'ORDER_CANCEL'"
                    >❌</span
                  >
                  <span v-else-if="noti.loaiThongBao === 'PAYMENT_SUCCESS'"
                    >💰</span
                  >
                  <span v-else>🔔</span>
                </div>

                <div class="noti-body">
                  <div class="noti-title">{{ noti.tieuDe }}</div>
                  <div class="noti-content">{{ noti.noiDung }}</div>
                  <div class="noti-time">
                    {{ formatTime(noti.ngayTao) }}
                  </div>
                </div>
              </div>
              <div v-if="hasMore" class="load-more" @click="loadMore">
                Xem thêm
              </div>
            </div>
          </div>
          <div
            class="user-icon-wrapper"
            @click.stop="toggleUserMenu"
            ref="userMenuRef"
          >
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
                <button @click.stop="viewProfile" class="dropdown-item">
                  Xem thông tin
                </button>
                <div class="dropdown-divider"></div>
                <button @click.stop="logout" class="dropdown-item text-danger">
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
const router = useRouter();

const notificationCount = ref(0);
const notifications = ref<any[]>([]);
let stompClient: Client | null = null;

const page = ref(0);

const hasMore = ref(true);

const loadNotifications = async () => {
  try {
    page.value = 0; // reset page
    hasMore.value = true;

    const res = await axios.get(
      `http://localhost:8080/api/thong-bao?page=0&size=20`,
    );

    notifications.value = res.data.content;
    hasMore.value = res.data.content.length === 20;
  } catch (e) {
    console.error("Lỗi load thông báo", e);
  }
};

const loadNotificationCount = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/thong-bao/count");
    notificationCount.value = res.data;
  } catch (e) {
    console.error("Lỗi count thông báo", e);
  }
};

const formatTime = (time: string) => {
  const now = new Date().getTime();
  const notiTime = new Date(time).getTime();

  const diff = Math.floor((now - notiTime) / 1000);

  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return Math.floor(diff / 60) + " phút trước";
  if (diff < 86400) return Math.floor(diff / 3600) + " giờ trước";

  return Math.floor(diff / 86400) + " ngày trước";
};

const markAllRead = async () => {
  for (const n of notifications.value) {
    if (!n.daDoc) {
      await axios.put(`http://localhost:8080/api/thong-bao/${n.id}/read`);

      n.daDoc = true;
    }
  }

  notificationCount.value = 0;
};

const loadMore = async () => {
  page.value++;

  const res = await axios.get(
    `http://localhost:8080/api/thong-bao?page=${page.value}&size=20`,
  );

  const newData = res.data.content;

  if (newData.length === 0) {
    hasMore.value = false;
    return;
  }

  notifications.value.push(...newData);

  hasMore.value = newData.length === 20;
};

const connectWebSocket = () => {
  stompClient = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws-chocostyle"),

    reconnectDelay: 5000,

    debug: (str) => {
      console.log("STOMP:", str);
    },

    onConnect: () => {
      console.log("WebSocket connected");

      // ❗ clear trước nếu reconnect
      notifications.value = notifications.value || [];

      stompClient?.subscribe("/topic/notification", async (message) => {
        const data = JSON.parse(message.body);

        // 🔥 ép kiểu id cho chắc (tránh lệch string vs number)
        const exists = notifications.value.some(
          (n) => Number(n.id) === Number(data.id),
        );

        if (!exists) {
          notifications.value.unshift(data);
          await loadNotificationCount();
        }
      });
    },

    onStompError: (frame) => {
      console.error("Broker error:", frame.headers["message"]);
    },
  });

  stompClient.activate();
};
const isNotificationOpen = ref(false);
const toggleNotification = async () => {
  isNotificationOpen.value = !isNotificationOpen.value;

  if (isNotificationOpen.value && notifications.value.length === 0) {
    await loadNotifications();
  }

  await loadNotificationCount();
};
const openNotification = async (noti: any) => {
  try {
    await axios.put(`http://localhost:8080/api/thong-bao/${noti.id}/read`);
    noti.daDoc = true;
  } catch (e) {
    console.error("Lỗi đánh dấu đọc", e);
  }

  if (noti.orderId) {
    router.push(`/admin/invoice/detail/${noti.orderId}`);
  }

  await loadNotificationCount();

  isNotificationOpen.value = false;
};
// Các biến state cho menu
const isDiscountOpen = ref(false);
const isAccountOpen = ref(false);
const isProductOpen = ref(false);
const isUserMenuOpen = ref(false);
const isScheduleOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

// Thông tin user
const currentUserName = ref("Admin");
const currentUserAvatar = ref<string | null>(null);

// Hàm chạy khi load trang để lấy thông tin từ LocalStorage
onMounted(async () => {
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (userStr) {
    try {
      const userData = JSON.parse(userStr);

      currentUserName.value =
        userData.tenNhanVien ||
        userData.hoTen ||
        userData.name ||
        userData.username ||
        "Admin";

      if (userData.id && token) {
        try {
          const res = await axios.get(
            `http://localhost:8080/api/nhan-vien/${userData.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (res.data) {
            currentUserName.value =
              res.data.tenNhanVien || res.data.hoTen || currentUserName.value;
          }

          if (res.data && res.data.avatar) {
            let avatarUrl = res.data.avatar;

            if (!avatarUrl.startsWith("http")) {
              avatarUrl = `http://localhost:8080/images/${avatarUrl}`;
            }

            currentUserAvatar.value = avatarUrl;
          }
        } catch (apiError) {
          console.error(
            "Lỗi không thể lấy thông tin nhân viên từ API:",
            apiError,
          );
        }
      }
    } catch (e) {
      console.error("Lỗi khi đọc dữ liệu user:", e);
    }
  }

  document.addEventListener("click", handleClickOutside);

  await loadNotifications();
  await loadNotificationCount();

  connectWebSocket();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);

  if (stompClient) {
    stompClient.deactivate();
  }
});
// Hàm lấy chữ cái đầu tiên
const getUserInitial = (name: string) => {
  if (!name) return "A";
  const words = String(name).trim().split(" ");
  return words[words.length - 1].charAt(0).toUpperCase();
};

const handleAvatarError = () => {
  currentUserAvatar.value = null;
};

const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false;
  }

  if (!(event.target as HTMLElement).closest(".notification-wrapper")) {
    isNotificationOpen.value = false;
  }
};

const toggleSchedule = () => {
  isScheduleOpen.value = !isScheduleOpen.value;
};

const goToProduct = () => {
  isProductOpen.value = !isProductOpen.value;
  if (isProductOpen.value) {
    router.push("/admin/product");
  }
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
  isUserMenuOpen.value = false;
  router.push("/admin/profile"); // Chuyển đến route profile admin
};

// 👉 ĐÃ THÊM: Logic chuyển hướng sang trang Đơn mua
const viewMyOrders = () => {
  isUserMenuOpen.value = false;
  router.push("/don-hang");
};

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
  z-index: 999;
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
  transition: all 0.2s;
  cursor: pointer;
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
  justify-content: space-between;
}

.has-children > div {
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

/* ================= FIX LỖI USER DROPDOWN MENU ================= */
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
  /* Đảm bảo text không bị tràn */
  overflow: hidden;
}

.user-dropdown::before {
  content: "";
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
  background: #f8f9fa;
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
  background: #fef2f2;
  color: #dc2626;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
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

.notification-wrapper {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -6px;
  background: #ff424f;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 10px;
  padding: 2px 6px;
  min-width: 16px;
  text-align: center;
}

.notification-dropdown {
  position: absolute;
  top: 38px;
  right: 0;
  width: 360px;
  max-height: 420px;
  overflow-y: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #eee;
}

.notification-header {
  padding: 12px 15px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.notification-item {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #f6f6f6;
}

.notification-item:first-child {
  background: #fff7f0;
}

.noti-icon {
  width: 34px;
  height: 34px;
  background: #fff3f3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.noti-body {
  flex: 1;
}

.noti-title {
  font-size: 14px;
  font-weight: 600;
}

.noti-content {
  font-size: 13px;
  color: #666;
  margin-top: 2px;
}

.noti-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.notification-empty {
  padding: 30px;
  text-align: center;
  color: #999;
}

.notification-item.unread {
  background: #fff7f0;
}

.notification-item.unread .noti-title {
  font-weight: 700;
}

.mark-read {
  background: none;
  border: none;
  font-size: 12px;
  color: #ee4d2d;
  cursor: pointer;
}

.load-more {
  text-align: center;
  padding: 12px;
  font-size: 13px;
  color: #ee4d2d;
  cursor: pointer;
  border-top: 1px solid #eee;
}

.load-more:hover {
  background: #f9f9f9;
}
</style>
