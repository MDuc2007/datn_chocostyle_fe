<template>
  <div class="admin-dashboard-home fade-in">
    <div class="dashboard-content">
      <div class="welcome-section">
        <h2 class="welcome-title">Chào mừng đến với ChocoStyle, {{ currentUserName }}! 👋</h2>
        <p class="welcome-subtitle">
          Nền tảng quản lý thời trang socola tinh tế. <br />
          Bắt đầu công việc ngay hôm nay!
        </p>
      </div>

      <div class="quick-access-grid">
        <div v-for="(card, index) in quickCards" :key="index" class="access-card-wrapper">
          <router-link :to="card.path" class="access-card">
            <div class="card-icon-wrapper" :style="{ backgroundColor: card.bgColor }">
              <span class="card-icon">{{ card.icon }}</span>
            </div>
            <div class="card-text">
              <h4 class="card-title">{{ card.title }}</h4>
              <p class="card-desc">{{ card.desc }}</p>
            </div>
            <span class="card-arrow">→</span>
          </router-link>
        </div>
      </div>
    </div>

    <div class="illustration-section">
      <img src="/src/assets/logo/choco-removebg-preview.png" alt="ChocoStyle Illustration" class="illustration-img" @error="handleImageError" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// Dữ liệu mô phỏng cho tên nhân viên
const currentUserName = ref("Admin");

// Cấu hình các thẻ Lối tắt nhanh
// 👉 ĐÃ ĐỒNG BỘ: Các path này trỏ đến các tuyến đường trong router của bạn
const quickCards = ref([
  {
    path: "/admin/statistic", // Trỏ đến tuyến đường Thống kê
    icon: "📊", 
    bgColor: "#e0f2fe", 
    title: "Thống kê", 
    desc: "Xem báo cáo doanh thu"
  },
  {
    path: "/admin/sales", // Trỏ đến tuyến đường Bán hàng tại quầy
    icon: "🛒", 
    bgColor: "#fef3c7", 
    title: "Bán hàng", 
    desc: "Tạo đơn tại quầy"
  },
  {
    path: "/admin/product", // Trỏ đến tuyến đường Quản lý sản phẩm
    icon: "📦", 
    bgColor: "#d1fae5", 
    title: "Sản phẩm", 
    desc: "Thêm sản phẩm mới"
  },
  {
    path: "/admin/invoice", // Trỏ đến tuyến đường Quản lý hóa đơn
    icon: "📄", 
    bgColor: "#ffe4e6", 
    title: "Hóa đơn", 
    desc: "Quản lý đơn hàng"
  },
  {
    path: "/admin/voucher", // Trỏ đến tuyến đường Phiếu giảm giá
    icon: "🎫", 
    bgColor: "#ede9fe", 
    title: "Voucher", 
    desc: "Tạo phiếu giảm giá"
  },
  {
    path: "/admin/employee", // Trỏ đến tuyến đường Nhân sự
    icon: "👥", 
    bgColor: "#f3e8ff", 
    title: "Nhân viên", 
    desc: "Quản lý nhân sự"
  }
]);

// Lấy tên nhân viên từ LocalStorage khi trang load
onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      // Giả định tên nhân viên nằm ở tenNhanVien, hoTen, name, username
      currentUserName.value = userData.tenNhanVien || userData.hoTen || userData.name || userData.username || "Admin";
    } catch (e) {
      console.error("Lỗi khi đọc dữ liệu user:", e);
    }
  }
});

// Hàm xử lý lỗi hình ảnh (nếu không tìm thấy logo)
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = "/src/assets/logo/no-image-placeholder.png"; 
};
</script>

<style scoped>
.admin-dashboard-home {
  display: grid;
  grid-template-columns: 2fr 1fr; /* Nội dung 2/3, Hình ảnh 1/3 */
  gap: 30px;
  padding: 30px;
  font-family: 'Inter', sans-serif; /* Sử dụng font Inter nếu có */
  color: #333;
}

/* CONTENT SECTION */
.dashboard-content {
  display: flex;
  flex-direction: column;
}

/* WELCOME SECTION */
.welcome-section {
  margin-bottom: 30px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #63391f; /* Màu nâu socola */
  margin: 0 0 10px 0;
}

.welcome-subtitle {
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  margin: 0;
}

/* QUICK ACCESS GRID */
.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 thẻ mỗi hàng */
  gap: 20px;
}

.access-card-wrapper {
  perspective: 1000px;
}

.access-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #fff;
  padding: 15px 20px;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  transform: translateZ(0);
}

.access-card:hover {
  transform: translateY(-5px) translateZ(0);
  box-shadow: 0 10px 25px rgba(99, 57, 31, 0.08); /* Bóng nâu socola nhẹ */
  border-color: #63391f50;
}

.card-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon {
  font-size: 20px;
}

.card-text {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 3px 0;
  color: #333;
}

.card-desc {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.card-arrow {
  color: #ccc;
  font-size: 18px;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.access-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(5px);
  color: #63391f;
}

/* ILLUSTRATION SECTION */
.illustration-section {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Mô phỏng hiệu ứng nồi lẩu: Làm mờ nhẹ bên phải */
  /* background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 100%); */
  background-color: #fdfaf8; /* Màu nền nhẹ socola */
  border-radius: 16px;
  padding: 20px;
}

.illustration-img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  filter: drop-shadow(0 4px 10px rgba(99, 57, 31, 0.1));
}

/* Animation */
.fade-in {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-dashboard-home {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .quick-access-grid {
    grid-template-columns: 1fr;
  }
}
</style>