<template>
  <div class="app-container">
    <Header></Header>

    <div class="breadcrumb">
      <span @click="$router.push('/')">Trang chủ</span>
      <span class="separator">/</span>
      <span class="current">Đơn mua của tôi</span>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="order-list-box">
          <div class="section-header">
            <h2 class="section-title">LỊCH SỬ ĐƠN HÀNG</h2>
          </div>

          <div class="filter-tabs">
            <button
              v-for="status in statusTabs"
              :key="status.value"
              class="tab-btn"
              :class="{ active: filters.trangThai === status.value }"
              @click="setFilterStatus(status.value)"
            >
              {{ status.label }}
            </button>
          </div>

          <div class="table-wrapper">
            <table class="custom-table">
              <thead>
                <tr>
                  <th style="width: 50px">STT</th>
                  <th>Mã đơn hàng</th>
                  <th>Ngày đặt</th>
                  <th class="text-end">Tổng tiền</th>
                  <th class="text-center">Trạng thái</th>
                  <th class="text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredInvoices.length === 0">
                  <td colspan="6" class="text-center no-data">
                    <div class="empty-state">
                      <p>Không có đơn hàng nào ở trạng thái này</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="(hd, index) in filteredInvoices" :key="hd.id">
                  <td>{{ index + 1 }}</td>
                  <td class="text-code text-bold">{{ hd.maHoaDon }}</td>
                  <td>{{ formatDate(hd.ngayTao) }}</td>
                  <td class="text-end text-money">
                    {{ formatCurrency(hd.tongTien) }}
                  </td>
                  <td class="text-center">
                    <span :class="getStatusClass(hd.trangThai)">
                      {{ getStatusName(hd.trangThai) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn-detail" @click="goToDetail(hd.id)">
                      Xem
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <Footer></Footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import ClientSidebar from "../../pages/views/ClientSidebar.vue"; // Import Sidebar

const router = useRouter();
const invoices = ref([]);
const filters = ref({ trangThai: null });

const statusTabs = [
  { label: "Tất cả", value: null },
  { label: "Chờ xác nhận", value: 0 },
  { label: "Đang giao", value: 3 },
  { label: "Hoàn thành", value: 4 },
  { label: "Đã hủy", value: 5 },
];

const fetchMyOrders = async () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("Vui lòng đăng nhập!");
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    const res = await axios.get("http://localhost:8080/api/hoa-don/my-orders", {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    });
    invoices.value = res.data;
  } catch (error) {
    console.error("Lỗi tải lịch sử đơn hàng:", error);
  }
};

const filteredInvoices = computed(() => {
  if (filters.value.trangThai === null) return invoices.value;
  if (filters.value.trangThai === 3) {
    return invoices.value.filter(
      (hd) => hd.trangThai === 2 || hd.trangThai === 3,
    );
  }
  return invoices.value.filter(
    (hd) => hd.trangThai === filters.value.trangThai,
  );
});

const setFilterStatus = (stt) => {
  filters.value.trangThai = stt;
};

const goToDetail = (id) => {
  router.push({ name: "ClientOrderDetail", params: { id } });
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val,
  );

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
};

const getStatusName = (stt) => {
  const map = {
    0: "Chờ xác nhận",
    1: "Đã xác nhận",
    2: "Chờ giao hàng",
    3: "Đang giao",
    4: "Hoàn thành",
    5: "Đã hủy",
  };
  return map[stt] || "Đang xử lý";
};

const getStatusClass = (stt) => {
  if (stt === 4) return "status-tag success";
  if (stt === 5) return "status-tag danger";
  if (stt === 0) return "status-tag warning";
  return "status-tag info";
};

onMounted(() => {
  fetchMyOrders();
});
</script>

<style scoped>
/* GLOBAL LAYOUT */
.app-container {
  background: #f7f9fa;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
}
.breadcrumb {
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 4%;
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
}
.breadcrumb .current {
  font-weight: 600;
  color: #6b3f1e;
  cursor: default;
}

.main-layout {
  max-width: 1400px;
  margin: 0 auto 40px auto;
  padding: 0 4%;
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
}

.content-section {
  flex: 1;
  min-width: 0;
}

/* KHUNG CHỨA DANH SÁCH ĐƠN HÀNG (CÓ BORDER) */
.order-list-box {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.section-title {
  color: #333;
  margin-bottom: 20px;
  font-weight: 700;
  font-size: 18px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

/* TABS */
.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.tab-btn {
  border: 1px solid #e0e0e0;
  background: white;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 14px;
  color: #555;
}
.tab-btn.active {
  background: #fff5f0;
  color: #6b3f1e;
  border-color: #6b3f1e;
  font-weight: 600;
}
.tab-btn:hover {
  border-color: #6b3f1e;
  color: #6b3f1e;
}

/* TABLE */
.table-wrapper {
  overflow-x: auto;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
}
.custom-table th {
  background: #f8f9fa;
  padding: 15px;
  text-align: left;
  font-size: 13px;
  color: #666;
  border-bottom: 2px solid #eee;
}
.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #333;
}

.text-code {
  color: #6b3f1e;
}
.text-money {
  font-weight: bold;
  color: #d0021b;
}
.btn-detail {
  background: white;
  border: 1px solid #ddd;
  color: #555;
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: 0.2s;
}
.btn-detail:hover {
  border-color: #6b3f1e;
  color: #6b3f1e;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.success {
  background: #e6fffa;
  color: #047857;
}
.danger {
  background: #ffe4e6;
  color: #be123c;
}
.warning {
  background: #fffbeb;
  color: #b45309;
}
.info {
  background: #e0f2fe;
  color: #0369a1;
}

.empty-state {
  padding: 40px;
  color: #888;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  .order-list-box {
    padding: 15px;
  }
}
</style>
