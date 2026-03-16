<template>
  <div class="orders-page">
    <div class="main-card form-page-animation">
      <div class="header-simple">
        <button
          class="btn-back hover-effect"
          @click="$router.push('/')"
        >
          <i class="fa fa-arrow-left"></i> Tiếp tục mua sắm
        </button>
        <h2 class="page-title" style="margin-top: 15px;">Đơn hàng của tôi</h2>
      </div>

      <div class="order-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn hover-effect" 
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>

      <div v-if="loadingData" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải danh sách đơn hàng...</p>
      </div>

      <div v-else>
        <div v-if="filteredOrders.length === 0" class="empty-state fade-in">
          <img src="/src/assets/icon/box.svg" alt="Empty" class="empty-icon-img" />
          <p>Bạn chưa có đơn hàng nào trong trạng thái này.</p>
          <button class="btn-orange" style="margin-top: 15px;" @click="$router.push('/')">Mua sắm ngay</button>
        </div>

        <div v-else class="order-list fade-in">
          <div v-for="order in filteredOrders" :key="order.id" class="order-card">
            
            <div class="order-header">
              <div class="order-info-left">
                <span class="order-code"><i class="fa fa-receipt"></i> {{ order.maDonHang }}</span>
                <span class="order-date">{{ formatDate(order.ngayTao) }}</span>
              </div>
              <div class="order-status">
                <span class="status-badge" :class="getStatusClass(order.trangThai)">
                  {{ getStatusName(order.trangThai) }}
                </span>
              </div>
            </div>

            <div class="order-body">
              <div v-for="item in order.chiTietDonHangs" :key="item.id" class="product-item">
                <div class="prod-img-box">
                  <img :src="getFullImageUrl(item.anhSanPham)" alt="Product" @error="handleImgError" />
                </div>
                <div class="prod-info">
                  <h4 class="prod-name">{{ item.tenSanPham }}</h4>
                  <p class="prod-variant">Phân loại: {{ item.tenMauSac }} - {{ item.tenKichCo }}</p>
                  <p class="prod-qty">x{{ item.soLuong }}</p>
                </div>
                <div class="prod-price">
                  <span class="original-price" v-if="item.giaGoc > item.giaBan">{{ formatCurrency(item.giaGoc) }}</span>
                  <span class="current-price">{{ formatCurrency(item.giaBan) }}</span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <div class="total-money">
                Thành tiền: <span class="money-highlight">{{ formatCurrency(order.tongTien) }}</span>
              </div>
              <div class="order-actions">
                <button class="btn-outline" @click="$router.push(`/don-hang/${order.id}`)">Xem chi tiết</button>
                
                <button 
                  v-if="(order.trangThai === 0 || order.trangThai === 1) && isLoggedIn" 
                  class="btn-danger-outline"
                  @click="openCancelModal(order.id)"
                >
                  Hủy đơn hàng
                </button>

                <button 
                  v-if="order.trangThai === 4" 
                  class="btn-orange-small"
                  @click="$router.push('/')"
                >
                  Mua lại
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <transition name="fade-modal">
      <div v-if="cancelModal.show" class="modal-overlay" @click.self="cancelModal.show = false">
        <div class="confirm-box">
          <div class="confirm-icon-wrapper error-icon">
             <i class="fa fa-exclamation-triangle fa-2x"></i>
          </div>
          <h3 class="confirm-title">Xác nhận hủy đơn</h3>
          <p class="confirm-desc">Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.</p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="cancelModal.show = false">Không</button>
            <button class="btn-confirm-danger" @click="confirmCancelOrder" :disabled="isCancelling">
              <span v-if="isCancelling"><i class="fa fa-spinner fa-spin"></i></span>
              <span v-else>Đồng ý hủy</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-indicator"></div>
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const loadingData = ref(true);
const toast = ref({ show: false, message: "", type: "success" });

// TABS cấu hình (Value này phải khớp với status trong Database của bạn)
// Giả sử: 1: Chờ xác nhận, 2: Đang chuẩn bị, 3: Đang giao, 4: Hoàn thành, 5: Đã hủy
const tabs = [
  { id: 'ALL', name: 'Tất cả' },
  { id: 1, name: 'Chờ xác nhận' },
  { id: 2, name: 'Chờ lấy hàng' },
  { id: 3, name: 'Đang giao' },
  { id: 4, name: 'Hoàn thành' },
  { id: 5, name: 'Đã hủy' }
];

const activeTab = ref('ALL');
const orders = ref([]);
let currentUserId = null; 

// 👉 BIẾN LƯU TRẠNG THÁI ĐĂNG NHẬP
const isLoggedIn = ref(false);

// Modal hủy đơn
const cancelModal = ref({ show: false, orderId: null });
const isCancelling = ref(false);

// --- LẤY DỮ LIỆU ĐƠN HÀNG ---
onMounted(async () => {
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  // Kiểm tra xem khách có đăng nhập hay không
  if (userStr && token) {
    const userData = JSON.parse(userStr);
    currentUserId = userData.id;
    isLoggedIn.value = true; // Đánh dấu là khách đã đăng nhập (có quyền Hủy đơn)
  } else {
    isLoggedIn.value = false; // Khách vãng lai (ẩn nút Hủy đơn)
  }

  // Chú ý: Ở đây bạn đang chặn khách chưa đăng nhập thì đẩy về trang /login
  // Nếu bạn muốn khách chưa đăng nhập vẫn vào được trang này để "Tra cứu", 
  // thì bạn có thể bỏ 2 dòng dưới đi.
  if (!currentUserId || !token) {
    router.push('/login');
    return;
  }

  await fetchOrders(token);
});

const fetchOrders = async (token) => {
  loadingData.value = true;
  try {
    const res = await axios.get(`http://localhost:8080/api/khach-hang/${currentUserId}/don-hang`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    orders.value = res.data.content || res.data || [];
    
  } catch (error) {
    console.error("Lỗi lấy đơn hàng:", error);
    showToast("Không thể tải dữ liệu đơn hàng!", "error");
  } finally {
    loadingData.value = false;
  }
};

// --- COMPUTED: LỌC ĐƠN HÀNG THEO TAB ---
const filteredOrders = computed(() => {
  if (activeTab.value === 'ALL') return orders.value;
  return orders.value.filter(order => order.trangThai === activeTab.value);
});

// --- HELPER FORMAT ---
const formatCurrency = (value) => {
  if (!value) return "0 ₫";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "/src/assets/img/default-product.png";
  if (imagePath.startsWith("http")) return imagePath;
  return `http://localhost:8080/images/${imagePath}`;
};

const handleImgError = (e) => {
  e.target.src = "/src/assets/img/default-product.png";
};

// --- MAPPING TRẠNG THÁI ---
const getStatusName = (status) => {
  const stt = tabs.find(t => t.id === status);
  return stt ? stt.name : "Không xác định";
};

const getStatusClass = (status) => {
  switch (status) {
    case 1: return 'stt-pending';
    case 2: return 'stt-preparing';
    case 3: return 'stt-shipping';
    case 4: return 'stt-completed';
    case 5: return 'stt-cancelled';
    default: return 'stt-default';
  }
};

// --- LOGIC HỦY ĐƠN ---
const openCancelModal = (orderId) => {
  cancelModal.value = { show: true, orderId: orderId };
};

const confirmCancelOrder = async () => {
  isCancelling.value = true;
  const token = localStorage.getItem("token");

  try {
    await axios.put(`http://localhost:8080/api/don-hang/${cancelModal.value.orderId}/huy`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });

    showToast("Đã hủy đơn hàng thành công!", "success");
    cancelModal.value.show = false;
    
    await fetchOrders(token);
  } catch (error) {
    showToast(error.response?.data || "Không thể hủy đơn hàng lúc này!", "error");
  } finally {
    isCancelling.value = false;
  }
};

// --- TOAST ---
const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => (toast.value.show = false), 3000);
};
</script>

<style scoped>
/* =========================================
   GLOBAL & LAYOUT
   ========================================= */
.orders-page {
  font-family: "Segoe UI", sans-serif;
  padding: 20px;
  background-color: #f7f7f7;
  --primary-brown: #63391f;
  --primary-light: #fdf8f6;
  --text-main: #484848;
  min-height: 100vh;
}

.main-card {
  position: relative;
  background: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  max-width: 1000px;
  margin: 0 auto;
}

.header-simple { margin-bottom: 25px; }
.page-title { color: var(--primary-brown); font-size: 22px; font-weight: 700; margin: 0; }
.btn-back { border: none; background: none; color: #666; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px; font-size: 14px; padding: 0;}
.btn-back:hover { color: var(--primary-brown); }

/* =========================================
   TABS TRẠNG THÁI
   ========================================= */
.order-tabs { display: flex; overflow-x: auto; background: #fff; border-bottom: 2px solid #eee; margin-bottom: 20px; }
.tab-btn { background: none; border: none; padding: 15px 20px; font-size: 15px; font-weight: 600; color: #777; cursor: pointer; white-space: nowrap; position: relative; transition: 0.3s; }
.tab-btn::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0%; height: 3px; background: var(--primary-brown); transition: 0.3s; }
.tab-btn:hover { color: var(--primary-brown); }
.tab-btn.active { color: var(--primary-brown); }
.tab-btn.active::after { width: 100%; }

/* =========================================
   DANH SÁCH ĐƠN HÀNG (CARDS)
   ========================================= */
.order-list { display: flex; flex-direction: column; gap: 20px; }
.order-card { background: #fff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: 0.3s; }
.order-card:hover { border-color: #d1d5db; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }

/* Card Header */
.order-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; background: #fafafa; }
.order-info-left { display: flex; gap: 15px; align-items: center; }
.order-code { font-weight: 700; color: #333; font-size: 14px; }
.order-date { font-size: 13px; color: #888; }

/* Trạng thái Badges */
.status-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.stt-pending { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.stt-preparing { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.stt-shipping { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.stt-completed { background: #ecfccb; color: #166534; border: 1px solid #a3e635; }
.stt-cancelled { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.stt-default { background: #f3f4f6; color: #475569; }

/* Card Body (Products) */
.order-body { padding: 0 20px; }
.product-item { display: flex; padding: 15px 0; border-bottom: 1px dashed #eee; align-items: center; }
.product-item:last-child { border-bottom: none; }
.prod-img-box { width: 80px; height: 80px; border-radius: 6px; border: 1px solid #eee; overflow: hidden; flex-shrink: 0; }
.prod-img-box img { width: 100%; height: 100%; object-fit: cover; }
.prod-info { flex: 1; padding: 0 15px; }
.prod-name { margin: 0 0 5px 0; font-size: 15px; color: #333; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;}
.prod-variant { margin: 0; font-size: 13px; color: #777; }
.prod-qty { margin: 5px 0 0 0; font-size: 13px; color: #333; font-weight: 600; }
.prod-price { text-align: right; display: flex; flex-direction: column; }
.original-price { font-size: 12px; color: #999; text-decoration: line-through; margin-bottom: 2px;}
.current-price { font-size: 14px; font-weight: bold; color: var(--primary-brown); }

/* Card Footer */
.order-footer { padding: 15px 20px; background: #fdfdfd; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
.total-money { font-size: 14px; color: #555; }
.money-highlight { font-size: 18px; font-weight: bold; color: #d0021b; margin-left: 5px; }

/* Nút thao tác */
.order-actions { display: flex; gap: 10px; }
.btn-outline { background: #fff; border: 1px solid #ddd; color: #555; padding: 8px 15px; border-radius: 4px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 13px; }
.btn-outline:hover { border-color: var(--primary-brown); color: var(--primary-brown); }
.btn-danger-outline { background: #fff; border: 1px solid #fecaca; color: #dc2626; padding: 8px 15px; border-radius: 4px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 13px; }
.btn-danger-outline:hover { background: #fef2f2; }
.btn-orange-small { background: var(--primary-brown); border: none; color: #fff; padding: 8px 20px; border-radius: 4px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 13px; }
.btn-orange-small:hover { background: #4e2c17; }

/* Empty State */
.empty-state { text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; }
.empty-icon-img { width: 100px; opacity: 0.3; margin-bottom: 15px; }
.empty-state p { color: #888; font-size: 15px; }

/* =========================================
   MODAL HỦY ĐƠN
   ========================================= */
.modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
.confirm-box { background: #fff; padding: 30px; border-radius: 16px; width: 400px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.error-icon { width: 60px; height: 60px; background: #fee2e2; color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; }
.confirm-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333; }
.confirm-desc { font-size: 14px; color: #666; margin-bottom: 25px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 15px; }
.confirm-actions button { flex: 1; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; font-size: 14px; transition: 0.2s;}
.btn-cancel { background: #f1f5f9; color: #475569; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-confirm-danger { background: #dc2626; color: #fff; }
.btn-confirm-danger:hover { background: #b91c1c; }

/* Loading & Utils */
.loading-state { text-align: center; padding: 50px; color: #666; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-brown); border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { to { transform: rotate(360deg); } }

.toast-notification { position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 250px; padding: 12px 15px; border-radius: 6px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); font-size: 14px; font-weight: 500; background: #F0FDF4; color: #374151; }
.toast-indicator { width: 6px; height: 100%; background-color: #22C55E; position: absolute; left: 0; top: 0; border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
.toast-content { margin-left: 10px; }
.toast-notification.error { background: #FEF2F2; color: #991b1b; }
.toast-notification.error .toast-indicator { background-color: #ef4444; }

.fade-in { animation: fadeIn 0.4s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fade-modal-enter-active, .fade-modal-leave-active { transition: opacity 0.2s; }
.fade-modal-enter-from, .fade-modal-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .order-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .order-footer { flex-direction: column; gap: 15px; align-items: stretch; }
  .order-actions { display: flex; flex-direction: column; }
  .order-actions button { width: 100%; }
}
</style>