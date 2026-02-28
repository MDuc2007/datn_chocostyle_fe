<template>
  <div class="app-container">
    <Header></Header>

    <main class="tracking-page">
      <div class="breadcrumb">
        <span @click="$router.push('/')">Trang chủ</span>
        <span class="separator">/</span>
        <span class="current">Tra cứu đơn hàng</span>
      </div>

      <div class="tracking-container">
        <div class="search-section">
          <h2 class="title">TRA CỨU ĐƠN HÀNG</h2>
          <p class="subtitle">
            Nhập mã đơn hàng của bạn để kiểm tra tình trạng vận chuyển
          </p>

          <div class="search-box">
            <input
              type="text"
              v-model="searchCode"
              placeholder="VD: DH-123456789..."
              @keyup.enter="handleSearch"
            />
            <button
              class="btn-search hover-effect"
              @click="handleSearch"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">Tra cứu ngay</span>
              <div v-else class="spinner-small"></div>
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer></Footer>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-icon-wrapper">
          <span v-if="toast.type === 'success'">✓</span>
          <span v-else-if="toast.type === 'error'">✕</span>
          <span v-else>!</span>
        </div>
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import { useRouter } from "vue-router";
// State
const searchCode = ref("");
const orderData = ref(null);
const isLoading = ref(false);
const hasSearched = ref(false);
const router = useRouter();

// Toast
const toast = ref({ show: false, message: "", type: "success" });
const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 3000);
};

// Format Tiền & Ngày tháng
const formatPrice = (v) => {
  if (v == null) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(v) + " đ";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return (
    d.toLocaleDateString("vi-VN") +
    " " +
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );
};

// Xử lý ảnh lỗi / Nối link ảnh
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "/src/assets/logo/no-image-placeholder.png";
  if (imagePath.startsWith("http")) return imagePath;
  return `http://localhost:8080/images/${imagePath}`;
};

const handleImageError = (event) => {
  event.target.src = "/src/assets/logo/no-image-placeholder.png";
};

// Xử lý Timeline
const currentStep = computed(() => {
  if (!orderData.value) return 0;
  const status = orderData.value.trangThai;
  if (status === "PENDING") return 1;
  if (status === "PROCESSING") return 2;
  if (status === "SHIPPING") return 3;
  if (status === "DELIVERED") return 4;
  return 0;
});
// Thay thế hàm handleSearch cũ bằng đoạn này
const handleSearch = async () => {
  if (!searchCode.value.trim()) {
    showToast("Vui lòng nhập mã đơn hàng!", "warning");
    return;
  }

  // 1. Lấy User từ localStorage để lấy Token
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    showToast("Vui lòng đăng nhập để tra cứu đơn hàng của bạn!", "warning");
    // Chuyển hướng sang trang login nếu cần
    // router.push('/login');
    return;
  }

  const user = JSON.parse(userStr);
  isLoading.value = true;

  try {
    // 2. Gọi API tra cứu kèm Header Authorization
    const response = await fetch(
      `http://localhost:8080/api/hoa-don/tra-cuu?maDonHang=${searchCode.value.trim()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`, // <--- QUAN TRỌNG: Gửi Token
        },
      },
    );

    if (response.ok) {
      const data = await response.json();

      if (data.id) {
        showToast("Đã tìm thấy đơn hàng! Đang chuyển hướng...", "success");
        setTimeout(() => {
          router.push({
            name: "ClientOrderDetail",
            params: { id: data.id },
          });
        }, 1000);
      } else {
        showToast("Dữ liệu đơn hàng không hợp lệ.", "error");
      }
    } else {
      // Xử lý lỗi từ Backend trả về (Ví dụ: "Đơn hàng này không thuộc về bạn")
      const errorText = await response.text();
      showToast(errorText || "Không tìm thấy đơn hàng!", "error");
    }
  } catch (error) {
    console.error("Lỗi:", error);
    showToast("Lỗi kết nối server!", "error");
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f9fa;
}

.tracking-page {
  flex-grow: 1;
  padding-bottom: 60px;
}

.breadcrumb {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
  font-size: 14px;
  color: #666;
}
.breadcrumb span {
  cursor: pointer;
  transition: 0.2s;
}
.breadcrumb span:hover {
  color: #6b3f1e;
}
.breadcrumb .separator {
  margin: 0 10px;
  cursor: default;
  color: #ccc;
}
.breadcrumb .current {
  font-weight: 600;
  color: #6b3f1e;
}

.tracking-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ================= SEARCH SECTION ================= */
.search-section {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  margin-bottom: 30px;
}
.title {
  font-size: 28px;
  color: #6b3f1e;
  margin-bottom: 10px;
  font-weight: 800;
}
.subtitle {
  color: #666;
  margin-bottom: 25px;
  font-size: 15px;
}

.search-box {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  height: 55px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid #eee;
}
.search-box input {
  flex: 1;
  border: none;
  padding: 0 25px;
  font-size: 16px;
  outline: none;
}
.btn-search {
  background: #6b3f1e;
  color: #fff;
  border: none;
  padding: 0 35px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-search:hover {
  background: #4a2814;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ================= KẾT QUẢ ================= */
.fade-in {
  animation: fadeIn 0.5s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  margin-bottom: 20px;
  font-size: 15px;
}
.order-id strong {
  color: #6b3f1e;
  font-size: 18px;
}
.order-date {
  color: #666;
}

/* TIMELINE */
.status-timeline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  margin-bottom: 20px;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex: 1;
  position: relative;
  z-index: 2;
}
.step .icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: 0.4s;
}
.step p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #999;
  text-align: center;
}
.step.active .icon {
  background: #6b3f1e;
  color: #fff;
  box-shadow: 0 0 0 5px rgba(107, 63, 30, 0.1);
}
.step.active p {
  color: #6b3f1e;
}

.step-line {
  flex: 2;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  margin: -25px 10px 0;
  transition: 0.4s;
}
.step-line.active {
  background: #6b3f1e;
}

.status-cancelled {
  background: #fef2f2;
  color: #ef4444;
  padding: 20px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid #fecaca;
}

/* ================= CHI TIẾT LƯỚI ================= */
.order-details-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: start;
}

.product-list-card {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.product-list-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f9f9f9;
  margin-bottom: 15px;
}
.product-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.item-img {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #eee;
}
.item-info {
  flex: 1;
}
.item-name {
  font-weight: 600;
  font-size: 15px;
  color: #333;
  margin-bottom: 4px;
}
.item-variant {
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
}
.item-qty {
  font-size: 13px;
  font-weight: bold;
  color: #555;
}
.item-price {
  font-weight: 700;
  color: #d0021b;
  font-size: 15px;
}

/* Sidebar Info */
.info-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.info-card h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}
.info-card p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #555;
}
.summary-divider {
  height: 1px;
  background: #eee;
  margin: 15px 0;
}
.total-row {
  font-weight: 700;
  font-size: 16px;
  color: #333;
  align-items: center;
}
.final-price {
  font-size: 22px;
  color: #d0021b;
}
.text-danger {
  color: #d0021b;
}
.payment-method {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #eee;
  font-size: 13px;
  color: #666;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.empty-icon {
  font-size: 50px;
  margin-bottom: 15px;
  opacity: 0.5;
}
.empty-state p {
  font-size: 16px;
  color: #333;
  font-weight: 600;
  margin-bottom: 5px;
}
.empty-state span {
  font-size: 14px;
  color: #888;
}

/* Toast */
.toast-notification {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 10000;
  min-width: 280px;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}
.toast-notification.error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}
.toast-notification.warning {
  background: #ffc107;
  color: #333;
  border-left: 4px solid #ff9800;
}
.toast-icon-wrapper {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
}
.success .toast-icon-wrapper {
  background: #22c55e;
}
.error .toast-icon-wrapper {
  background: #ef4444;
}
.warning .toast-icon-wrapper {
  background: #f59e0b;
}
.toast-content {
  margin-left: 12px;
  font-weight: 500;
  font-size: 14px;
  color: #333;
}
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .order-details-grid {
    grid-template-columns: 1fr;
  }
  .order-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  .status-timeline {
    flex-direction: column;
    gap: 20px;
    padding: 30px 20px;
    align-items: flex-start;
  }
  .step {
    flex-direction: row;
    text-align: left;
  }
  .step-line {
    width: 4px;
    height: 30px;
    margin: -15px 0 -15px 23px;
  }
}
</style>
