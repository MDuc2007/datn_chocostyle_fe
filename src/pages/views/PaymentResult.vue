<template>
  <div class="result-container">
    <Header></Header>

    <div class="content-wrapper">
      <div class="card result-card">
        <div class="icon-wrapper" :class="isSuccess ? 'success' : 'error'">
          <span v-if="isSuccess">✓</span>
          <span v-else>✕</span>
        </div>

        <h2 class="title">
          {{ isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại!" }}
        </h2>

        <p class="message">
          {{
            isSuccess
              ? "Cảm ơn bạn đã mua hàng. Đơn hàng đã được thanh toán và đang xử lý."
              : "Giao dịch bị hủy hoặc xảy ra lỗi trong quá trình thanh toán."
          }}
        </p>

        <div class="info-box" v-if="vnpRef">
          <div class="info-row">
            <span>Mã giao dịch:</span>
            <strong>{{ vnpRef }}</strong>
          </div>
          <div class="info-row">
            <span>Số tiền:</span>
            <strong>{{ formatPrice(amount) }}</strong>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-primary" @click="goToHome">Về trang chủ</button>
          
          <button v-if="orderId || vnpRef" class="btn-outline" @click="goToDetail">
            Xem chi tiết đơn hàng
          </button>
        </div>
      </div>
    </div>

    <Footer></Footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";

const route = useRoute();
const router = useRouter();

const isSuccess = ref(false);
const vnpRef = ref("");
const amount = ref(0);
const orderId = ref(null);

onMounted(() => {
  const params = route.query;

  // Kiểm tra mã phản hồi (00 là thành công)
  if (params.vnp_ResponseCode === "00") {
    isSuccess.value = true;
  } else {
    isSuccess.value = false;
  }

  vnpRef.value = params.vnp_TxnRef || "";
  amount.value = params.vnp_Amount ? Number(params.vnp_Amount) / 100 : 0;

  if (params.hoaDonId) {
    orderId.value = params.hoaDonId;
  }
});

const formatPrice = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const goToHome = () => router.push("/");

const goToDetail = () => {
  const isLoggedIn = !!localStorage.getItem("token");

  if (isLoggedIn) {
    // NẾU ĐÃ ĐĂNG NHẬP -> Vào thẳng lịch sử đơn hàng
    if (orderId.value) {
      router.push({ name: "ClientOrderDetail", params: { id: orderId.value } });
    } else {
      router.push("/my-orders");
    }
  } else {
    // NẾU KHÁCH LẺ -> Đẩy sang trang tra cứu đơn hàng (mang theo mã vnpRef nếu có)
    if (vnpRef.value) {
      // Gửi mã giao dịch qua query để trang Tra Cứu có thể tự động điền (tùy chỉnh thêm ở trang Tra cứu nếu cần)
      router.push({ path: "/tra-cuu", query: { code: vnpRef.value } });
    } else {
      router.push("/tra-cuu");
    }
  }
};
</script>

<style scoped>
.result-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* --- PHẦN CĂN GIỮA CHÍNH --- */
.content-wrapper {
  flex: 1; /* Chiếm toàn bộ khoảng trống còn lại giữa Header và Footer */
  display: flex;
  justify-content: center; /* Căn giữa Ngang */
  align-items: center; /* Căn giữa Dọc */
  background: #f7f9fa;
  min-height: 500px; /* Đảm bảo chiều cao tối thiểu */
}

.result-card {
  background: white;
  padding: 50px 40px;
  border-radius: 16px;
  text-align: center;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  /* Hiệu ứng trượt lên nhẹ khi xuất hiện */
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
  margin: 0 auto 24px;
}
.success {
  background: #22c55e; /* Màu xanh lá hiện đại */
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
}
.error {
  background: #ef4444;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.title {
  color: #1e293b;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 24px;
}

.message {
  color: #64748b;
  margin-bottom: 30px;
  line-height: 1.6;
  font-size: 15px;
}

.info-box {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  text-align: left;
  border: 1px solid #e2e8f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #475569;
}
.info-row:last-child {
  margin-bottom: 0;
}
.info-row strong {
  color: #1e293b;
}

.action-buttons {
  display: flex;
  flex-direction: column; /* Nút xếp dọc trên mobile */
  gap: 12px;
}

@media (min-width: 480px) {
  .action-buttons {
    flex-direction: row; /* Nút xếp ngang trên desktop */
    justify-content: center;
  }
}

.btn-primary {
  background: #6b3f1e;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  flex: 1;
}
.btn-primary:hover {
  background: #5a3218;
}

.btn-outline {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  flex: 1;
}
.btn-outline:hover {
  border-color: #6b3f1e;
  color: #6b3f1e;
  background: #fffbf7;
}
</style>