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
          {{
            isSuccess
              ? "Thanh toán thành công!"
              : "Thanh toán thất bại / Bị hủy!"
          }}
        </h2>

        <p class="message" :class="{ 'text-danger': !isSuccess }">
          {{
            isSuccess
              ? "Cảm ơn bạn đã mua hàng. Đơn hàng đã được xác nhận và đang trong quá trình xử lý."
              : "Giao dịch đã bị hủy hoặc xảy ra lỗi. Đơn hàng tạm thời của bạn đã được xóa khỏi hệ thống."
          }}
        </p>

        <div v-if="isLoading" class="loading-box">
          <span class="loader"></span> Đang tải thông tin...
        </div>

        <div v-else>
          <div class="info-box" v-if="orderDetails">
            <h3 class="box-title">Chi tiết giao dịch</h3>
            <div class="info-row">
              <span>Mã đơn hàng:</span>
              <strong>{{ orderDetails.maHoaDon || orderId }}</strong>
            </div>
            <div class="info-row">
              <span>Người nhận:</span>
              <strong>{{ orderDetails.tenKhachHang }}</strong>
            </div>
            <div class="info-row">
              <span>Số điện thoại:</span>
              <strong>{{ orderDetails.soDienThoai }}</strong>
            </div>
            <div class="info-row">
              <span>Địa chỉ giao:</span>
              <strong class="text-right">{{
                orderDetails.diaChi || orderDetails.diaChiGiaoHang
              }}</strong>
            </div>
            <div
              class="info-row"
              v-if="
                orderDetails.thanhToanList &&
                orderDetails.thanhToanList.length > 0
              "
            >
              <span>Phương thức:</span>
              <strong>{{
                orderDetails.thanhToanList[0].phuongThuc ||
                (vnpRef ? "VNPAY/MOMO" : "VIETQR")
              }}</strong>
            </div>
            <div
              class="info-row"
              v-if="
                vnpRef &&
                vnpRef !== (orderDetails.maHoaDon || '') &&
                !vnpRef.includes('COD')
              "
            >
              <span>Mã tham chiếu:</span>
              <strong>{{ vnpRef }}</strong>
            </div>

            <div class="divider dashed"></div>

            <div class="info-row total-row">
              <span>Tổng thanh toán:</span>
              <strong class="highlight-price">{{
                formatPrice(
                  orderDetails.tongTienThanhToan ||
                    orderDetails.tongThanhToan ||
                    amount,
                )
              }}</strong>
            </div>
          </div>

          <div class="info-box" v-else-if="vnpRef || amount > 0">
            <h3 class="box-title">Chi tiết giao dịch</h3>
            <div class="info-row" v-if="vnpRef">
              <span>Mã giao dịch:</span>
              <strong>{{ vnpRef }}</strong>
            </div>
            <div class="info-row" v-if="amount">
              <span>Số tiền:</span>
              <strong class="highlight-price">{{ formatPrice(amount) }}</strong>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-primary" @click="goToHome">Về trang chủ</button>

          <button
            v-if="(orderId || vnpRef) && isSuccess"
            class="btn-outline"
            @click="goToDetail"
          >
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
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";

const route = useRoute();
const router = useRouter();

const isSuccess = ref(false);
const vnpRef = ref("");
const amount = ref(0);
const orderId = ref(null);
const orderDetails = ref(null);
const isLoading = ref(true);

// 👉 BƯỚC 1: THÊM HÀM DỌN DẸP GIỎ HÀNG Ở ĐÂY
const cleanCartAfterSuccess = () => {
  const savedCart = localStorage.getItem("cart");
  const checkoutData = localStorage.getItem("checkout_items");

  if (savedCart && checkoutData) {
    let cart = JSON.parse(savedCart);
    let checkoutList = JSON.parse(checkoutData);

    // Lọc bỏ những món đã mua thành công
    const boughtIds = checkoutList.map((i) => i.variantId);
    cart = cart.filter((c) => !boughtIds.includes(c.variantId));

    // Cập nhật lại giỏ hàng và báo cho Header biết
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  // Luôn xóa biến tạm
  localStorage.removeItem("checkout_items");
};

onMounted(async () => {
  const params = route.query;

  if (
    params.vnp_ResponseCode === "00" ||
    params.status === "success" ||
    params.status === "1" ||
    params.resultCode === "0"
  ) {
    isSuccess.value = true;
  } else {
    isSuccess.value = false;
  }

  // NẾU THẤT BẠI: XÓA ĐƠN NHÁP
  if (!isSuccess.value) {
    const pendingOrderId = localStorage.getItem("pending_order_id");
    if (pendingOrderId) {
      try {
        await axios.delete(
          `http://localhost:8080/api/hoa-don/${pendingOrderId}`,
        );
        console.log(
          "Đã tự động xóa đơn hàng vì giao dịch bị hủy:",
          pendingOrderId,
        );
      } catch (e) {
        console.error("Lỗi xóa đơn hàng hủy:", e);
      } finally {
        localStorage.removeItem("pending_order_id");
      }
    }
    isLoading.value = false;
    return;
  }

  // 👉 BƯỚC 2: GỌI HÀM DỌN DẸP KHI XÁC NHẬN LÀ THÀNH CÔNG
  cleanCartAfterSuccess();
  localStorage.removeItem("pending_order_id");

  vnpRef.value =
    params.vnp_TxnRef ||
    params.orderRef ||
    params.orderId ||
    params.apptransid ||
    "";

  if (
    params.method === "COD" ||
    params.method === "VIETQR" ||
    params.method === "MOMO" ||
    params.method === "ZALOPAY"
  ) {
    amount.value = params.amount ? Number(params.amount) : 0;
  } else {
    amount.value = params.vnp_Amount ? Number(params.vnp_Amount) / 100 : 0;
  }

  if (params.hoaDonId) orderId.value = params.hoaDonId;

  if (orderId.value) {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(
        `http://localhost:8080/api/hoa-don/${orderId.value}`,
        { headers },
      );
      orderDetails.value = res.data;
    } catch (error) {
      console.error("Lỗi lấy thông tin đơn hàng:", error);
    }
  }
  isLoading.value = false;
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
    if (orderId.value) {
      router.push({ name: "ClientOrderDetail", params: { id: orderId.value } });
    } else {
      router.push("/my-orders");
    }
  } else {
    const maDon = orderDetails.value?.maHoaDon || vnpRef.value;
    if (maDon) {
      router.push({ path: "/tra-cuu", query: { code: maDon } });
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
  /* Đồng bộ font chữ cho toàn bộ container */
  font-family: 'Times New Roman', Times, serif;
}

.result-container * {
  /* Ép tất cả các thẻ con (kể cả button, strong) dùng chung font */
  font-family: 'Times New Roman', Times, serif;
}

.content-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f7f9fa;
  min-height: 500px;
  padding: 40px 20px;
}

.result-card {
  background: white;
  padding: 50px 40px;
  border-radius: 16px;
  text-align: center;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
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
  background: #22c55e;
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
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 30px;
  text-align: left;
  border: 1px solid #e2e8f0;
}

.box-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
  text-align: center;
}

/* --- PHẦN CĂN CHỈNH CHI TIẾT GIAO DỊCH --- */
.info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 14px;
  font-size: 15px;
  line-height: 1.5;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row span {
  flex-shrink: 0;
  width: 130px; /* Độ rộng cố định tạo thành cột thẳng hàng */
  color: #64748b;
  font-weight: 500;
}

.info-row strong {
  color: #1e293b;
  flex: 1;
  text-align: left;
  font-weight: 600;
  word-break: break-word; /* Tự xuống dòng gọn gàng nếu địa chỉ dài */
}
/* ------------------------------------------ */

.divider {
  border-top: 1px solid #e2e8f0;
  margin: 15px 0;
}

.divider.dashed {
  border-top-style: dashed;
}

.total-row {
  margin-top: 16px;
  align-items: center;
}

.total-row span {
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
}

.highlight-price {
  color: #d32f2f !important;
  font-size: 18px;
  font-weight: 800;
}

.text-danger {
  color: #ef4444;
  font-weight: bold;
}

.loading-box {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 20px;
  color: #64748b;
  font-size: 14px;
  margin-bottom: 20px;
}

.loader {
  border: 2px solid #e2e8f0;
  border-top: 2px solid #6b3f1e;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 480px) {
  .action-buttons {
    flex-direction: row;
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
