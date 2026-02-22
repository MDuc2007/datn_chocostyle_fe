<template>
  <div class="dashboard-container">
    <div class="card filter-section">
      <div class="card-header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon
            points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
          ></polygon>
        </svg>
        <h2>Thống Kê</h2>
      </div>

      <div class="filter-controls">
        <div class="control-group">
          <label>Khoảng thời gian thống kê</label>
          <div class="date-inputs">
            <input type="date" v-model="filter.startDate" />
            <span>-</span>
            <input type="date" v-model="filter.endDate" />
          </div>
        </div>

        <div class="control-group">
          <label>Loại biểu đồ</label>
          <div class="btn-group">
            <button
              @click="chartType = 'line'"
              :class="{ active: chartType === 'line' }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Đường
            </button>
            <button
              @click="chartType = 'bar'"
              :class="{ active: chartType === 'bar' }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Cột
            </button>
          </div>
        </div>
      </div>

      <div class="filter-footer">
        <div class="summary-text">
          Số đơn hàng: <b>{{ totalOrdersInChart }}</b> &nbsp;|&nbsp; Tổng doanh
          thu:
          <b class="highlight">{{ formatCurrency(totalRevenueInChart) }}</b>
        </div>

        <div class="action-buttons">
          <button @click="resetFilter" class="btn btn-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path
                d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
              ></path>
            </svg>
            Đặt lại bộ lọc
          </button>
          <button @click="showExportModal = true" class="btn btn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Xuất báo cáo
          </button>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-top">
          <div class="icon-box blue">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ formatCurrency(summaryData.homNay?.doanhThu || 0) }}
            </div>
            <div class="stat-trend down">0%</div>
          </div>
        </div>
        <div class="stat-bottom">
          <div class="stat-label">Hôm nay</div>
          <div class="stat-sub">
            Đơn hàng: {{ summaryData.homNay?.soDonHang || 0 }}
          </div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-top">
          <div class="icon-box purple">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ formatCurrency(summaryData.tuanNay?.doanhThu || 0) }}
            </div>
            <div class="stat-trend down">0%</div>
          </div>
        </div>
        <div class="stat-bottom">
          <div class="stat-label">Tuần này</div>
          <div class="stat-sub">
            Đơn hàng: {{ summaryData.tuanNay?.soDonHang || 0 }}
          </div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-top">
          <div class="icon-box teal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ formatCurrency(summaryData.thangNay?.doanhThu || 0) }}
            </div>
            <div class="stat-trend down">0%</div>
          </div>
        </div>
        <div class="stat-bottom">
          <div class="stat-label">Tháng này</div>
          <div class="stat-sub">
            Đơn hàng: {{ summaryData.thangNay?.soDonHang || 0 }}
          </div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-top">
          <div class="icon-box orange">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ formatCurrency(summaryData.namNay?.doanhThu || 0) }}
            </div>
            <div class="stat-trend down">0%</div>
          </div>
        </div>
        <div class="stat-bottom">
          <div class="stat-label">Năm nay</div>
          <div class="stat-sub">
            Đơn hàng: {{ summaryData.namNay?.soDonHang || 0 }}
          </div>
        </div>
      </div>
    </div>

    <div class="main-content-grid">
      <div class="left-panel">
        <div class="card chart-section">
          <div class="card-header border-left-teal">
            <h3>Biểu Đồ Doanh Thu</h3>
          </div>
          <div class="chart-container">
            <Line
              v-if="chartData && chartType === 'line'"
              :data="chartData"
              :options="chartOptions as any"
            />
            <Bar
              v-else-if="chartData && chartType === 'bar'"
              :data="chartData"
              :options="chartOptions as any"
            />
            <div v-else class="loading-text">Đang tải dữ liệu...</div>
          </div>
        </div>

        <div class="card table-card">
          <div class="card-header border-left-red flex-between">
            <h3>Danh sách sản phẩm sắp hết hàng</h3>
            <div class="mini-action">Số lượng dưới 10</div>
          </div>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Mã</th>
                  <th>Tên sản phẩm</th>
                  <th>Màu</th>
                  <th>Size</th>
                  <th>Số lượng</th>
                  <th>Giá tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in lowStockProducts" :key="index">
                  <td>
                    <div class="table-img">
                      <img
                        :src="item.idSanPham?.hinhAnh || '/placeholder.png'"
                        @error="
                          (e) =>
                            ((e.target as HTMLImageElement).src =
                              '/placeholder.png')
                        "
                        alt="img"
                      />
                    </div>
                  </td>
                  <td class="text-gray">{{ item.maChiTietSanPham }}</td>
                  <td class="font-medium">
                    {{ item.idSanPham?.tenSp || "Sản phẩm" }}
                  </td>
                  <td>{{ item.idMauSac?.tenMauSac || "-" }}</td>
                  <td>{{ item.idKichCo?.tenKichCo || "-" }}</td>
                  <td class="text-red font-bold">{{ item.soLuongTon }}</td>
                  <td class="font-bold">{{ formatCurrency(item.giaBan) }}</td>
                </tr>
                <tr v-if="lowStockProducts.length === 0">
                  <td colspan="7" class="text-center text-gray py-4">
                    Không có sản phẩm nào sắp hết hàng
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="card donut-card">
          <div class="card-header flex-between">
            <h3>Phân Bố Trạng Thái</h3>
            <div class="mini-toggles">
              <span class="active">Năm</span>
            </div>
          </div>
          <div class="donut-container">
            <Doughnut
              v-if="statusChartData"
              :data="statusChartData"
              :options="doughnutOptions"
            />
            <div class="center-text">
              <div class="number">{{ totalStatusCount }}</div>
            </div>
          </div>
        </div>

        <div class="card donut-card">
          <div class="card-header">
            <h3>Phân Phối Đa Kênh</h3>
          </div>
          <div class="donut-container">
            <Doughnut
              v-if="channelChartData"
              :data="channelChartData"
              :options="doughnutOptions"
            />
            <div class="center-text">
              <div class="number">{{ totalChannelCount }}</div>
            </div>
          </div>
        </div>

        <div class="card top-product-section">
          <div class="card-header border-left-orange flex-between">
            <h3>Sản Phẩm Bán Chạy</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#eab308"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path
                d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
              ></path>
              <path
                d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
              ></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
          </div>

          <div class="product-list">
            <div
              v-for="(sp, index) in topProducts"
              :key="index"
              class="product-item"
            >
              <div class="rank-badge" :class="getRankClass(index + 1)">
                {{ index + 1 }}
              </div>
              <div class="product-info">
                <p class="product-name" :title="sp.tenSanPham">
                  {{ sp.tenSanPham }}
                </p>
                <div class="product-meta">
                  Đã bán: <b>{{ sp.soLuongDaBan }}</b> | Giá:
                  <b>{{ formatCurrency(sp.giaBan) }}</b>
                </div>
              </div>
              <div class="product-img">
                <img :src="sp.anh || '/placeholder.png'" alt="sp" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showExportModal"
      class="modal-overlay"
      @click.self="showExportModal = false"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h3>Xuất Báo Cáo Doanh Thu</h3>
          <button class="close-btn" @click="showExportModal = false">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">Chọn khoảng thời gian cần xuất báo cáo:</p>
          <div class="form-group">
            <label>Từ ngày:</label>
            <input
              type="date"
              v-model="exportForm.startDate"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label>Đến ngày:</label>
            <input
              type="date"
              v-model="exportForm.endDate"
              class="form-control"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showExportModal = false">
            Hủy
          </button>
          <button
            class="btn btn-primary"
            @click="handleExportExcel"
            :disabled="isExporting"
          >
            {{ isExporting ? "Đang tải..." : "Xuất Excel" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// --- Interface ---
interface SummaryResponse {
  doanhThu: number;
  soDonHang: number;
}
interface SummaryMap {
  homNay?: SummaryResponse;
  tuanNay?: SummaryResponse;
  thangNay?: SummaryResponse;
  namNay?: SummaryResponse;
}
interface ChartResponse {
  thoiGian: string;
  doanhThu: number;
  soLuongDon: number;
}
interface TopProductResponse {
  tenSanPham: string;
  anh: string;
  giaBan: number;
  soLuongDaBan: number;
}
interface StatusResponse {
  trangThai: number;
  soLuong: number;
}
interface ChannelResponse {
  loai: string;
  soLuong: number;
}

const summaryData = ref<SummaryMap>({});
const chartRawData = ref<ChartResponse[]>([]);
const topProducts = ref<TopProductResponse[]>([]);
const statusRawData = ref<StatusResponse[]>([]);
const channelRawData = ref<ChannelResponse[]>([]);
const lowStockProducts = ref<any[]>([]);

const chartType = ref<"line" | "bar">("line");
// Lấy ngày hôm nay theo định dạng YYYY-MM-DD
const today = new Date().toISOString().slice(0, 10);

const filter = ref({ startDate: today, endDate: today });

const API_URL = "http://localhost:8080/api/thong-ke";

// === PHẦN BỔ SUNG: KHAI BÁO BIẾN CHO MODAL ===
const showExportModal = ref(false); // Biến để bật tắt Modal
const isExporting = ref(false); // Biến trạng thái đang tải
const exportForm = ref({
  startDate: new Date().toISOString().slice(0, 10), // Mặc định hôm nay
  endDate: new Date().toISOString().slice(0, 10),
});
// ===============================================

const fetchData = async () => {
  try {
    const resSummary = await axios.get(`${API_URL}/tong-quat`);
    summaryData.value = resSummary.data;
    const resTop = await axios.get(`${API_URL}/ban-chay`);
    topProducts.value = resTop.data;
    const resStatus = await axios.get(`${API_URL}/trang-thai`);
    statusRawData.value = resStatus.data;
    const resChannel = await axios.get(`${API_URL}/loai-don`);
    channelRawData.value = resChannel.data;

    // Gọi API sản phẩm sắp hết hàng
    const resLowStock = await axios.get(`${API_URL}/sap-het`);
    lowStockProducts.value = resLowStock.data;

    await fetchChartData();
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);
  }
};

const fetchChartData = async () => {
  try {
    const params = {
      startDate: filter.value.startDate || null,
      endDate: filter.value.endDate || null,
    };
    const resChart = await axios.get(`${API_URL}/doanh-thu`, { params });
    chartRawData.value = resChart.data;
  } catch (error) {
    console.error("Lỗi tải biểu đồ:", error);
  }
};

watch(
  () => [filter.value.startDate, filter.value.endDate],
  () => {
    if (filter.value.startDate && filter.value.endDate) fetchChartData();
  },
);
const resetFilter = () => {
  filter.value.startDate = today;
  filter.value.endDate = today;
  // Không cần gọi fetchChartData() ở đây nữa vì hàm watch() ở ngay phía trên
  // sẽ tự động nhận diện filter thay đổi và tự gọi fetchChartData() rồi.
};

// === PHẦN BỔ SUNG: HÀM XỬ LÝ XUẤT EXCEL ===
const handleExportExcel = async () => {
  if (!exportForm.value.startDate || !exportForm.value.endDate) {
    alert("Vui lòng chọn đầy đủ ngày tháng!");
    return;
  }

  isExporting.value = true;
  try {
    const response = await axios.get(`${API_URL}/export`, {
      params: {
        startDate: exportForm.value.startDate,
        endDate: exportForm.value.endDate,
      },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `BaoCaoDoanhThu_${exportForm.value.startDate}_${exportForm.value.endDate}.xlsx`,
    );
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    showExportModal.value = false; // Đóng modal sau khi xong
  } catch (error) {
    console.error("Lỗi xuất file:", error);
    alert("Có lỗi xảy ra khi xuất file!");
  } finally {
    isExporting.value = false;
  }
};
// ============================================

// --- CONFIG CHART DOANH THU ---
const chartData = computed(() => {
  const labels = chartRawData.value.map((item) => item.thoiGian);
  const dataValues = chartRawData.value.map((item) => item.doanhThu);
  return {
    labels: labels,
    datasets: [
      {
        label: "Doanh thu",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(20, 184, 166, 0.5)");
          gradient.addColorStop(1, "rgba(20, 184, 166, 0.0)");
          return gradient;
        },
        borderColor: "#14b8a6",
        pointBackgroundColor: "#fff",
        pointBorderColor: "#14b8a6",
        data: dataValues,
        fill: true,
        tension: 0.4,
      },
    ],
  };
});

const chartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      mode: "index",
      intersect: false,
      callbacks: {
        label: function (context: any) {
          return (
            (context.dataset.label || "") +
            ": " +
            new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(context.parsed.y)
          );
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: any) {
          if (value >= 1000000) return value / 1000000 + "M";
          if (value >= 1000) return value / 1000 + "k";
          return value;
        },
        color: "#9ca3af",
      },
      grid: { color: "#f3f4f6" },
      border: { display: false },
    },
    x: {
      grid: { display: false },
      ticks: { color: "#9ca3af" },
      border: { display: false },
    },
  },
};

// --- CONFIG DONUT CHARTS (GIỮ NGUYÊN) ---
const statusChartData = computed(() => {
  const statusMap: Record<number, string> = {
    0: "Chờ xác nhận",
    1: "Đã xác nhận",
    2: "Giao cho vận chuyển",
    3: "Đang giao hàng",
    4: "Hoàn thành",
    5: "Đã hủy",
  };
  const colors = [
    "#f59e0b",
    "#3b82f6",
    "#8b5cf6",
    "#06b6d4",
    "#10b981",
    "#ef4444",
  ];

  const labels = statusRawData.value.map(
    (i) => statusMap[i.trangThai] || `Trạng thái ${i.trangThai}`,
  );
  const dataValues = statusRawData.value.map((i) => i.soLuong);
  const backgroundColors = statusRawData.value.map(
    (i) => colors[i.trangThai] || "#cbd5e1",
  );

  return {
    labels: labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };
});
const totalStatusCount = computed(() =>
  statusRawData.value.reduce((sum, item) => sum + item.soLuong, 0),
);

const channelChartData = computed(() => {
  const colors = ["#f472b6", "#3b82f6", "#fb7185"];
  return {
    labels: channelRawData.value.map((i) => i.loai),
    datasets: [
      {
        data: channelRawData.value.map((i) => i.soLuong),
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };
});
const totalChannelCount = computed(() =>
  channelRawData.value.reduce((sum, item) => sum + item.soLuong, 0),
);

const doughnutOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "70%",
  plugins: {
    legend: {
      position: "bottom",
      labels: { usePointStyle: true, padding: 10, font: { size: 10 } },
    },
  },
};

const totalRevenueInChart = computed(() =>
  chartRawData.value.reduce((sum, item) => sum + item.doanhThu, 0),
);
const totalOrdersInChart = computed(() =>
  chartRawData.value.reduce((sum, item) => sum + item.soLuongDon, 0),
);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );
const getRankClass = (rank: number) => {
  if (rank === 1) return "rank-1";
  if (rank === 2) return "rank-2";
  if (rank === 3) return "rank-3";
  return "rank-other";
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* GIỮ NGUYÊN CSS CŨ */
.dashboard-container {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
}
.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}
.filter-section .card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: #4b5563;
}
.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
  padding-bottom: 15px;
  border-bottom: 1px solid #f3f4f6;
}
.filter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}
.summary-text {
  font-size: 15px;
  color: #4b5563;
}
.highlight {
  color: #0d9488;
}
.action-buttons {
  display: flex;
  gap: 10px;
}
.control-group label {
  display: block;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 5px;
}
.date-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}
.date-inputs input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
}
.btn-group {
  display: flex;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 6px;
}
.btn-group button {
  border: none;
  background: transparent;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.btn-group button.active {
  background: #63391f;
  color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.btn-secondary {
  background-color: #6b7280;
}
.btn-secondary:hover {
  background-color: #4b5563;
}
.btn-primary {
  background-color: #63391f;
}
.btn-primary:hover {
  background-color: #63391f;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}
.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 140px;
  margin-bottom: 0;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.icon-box.blue {
  background: #dbeafe;
  color: #2563eb;
}
.icon-box.purple {
  background: #f3e8ff;
  color: #9333ea;
}
.icon-box.teal {
  background: #ccfbf1;
  color: #0d9488;
}
.icon-box.orange {
  background: #ffedd5;
  color: #ea580c;
}
.stat-info {
  text-align: right;
}
.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
}
.stat-trend {
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}
.stat-trend.down {
  color: #ef4444;
}
.stat-bottom {
  margin-top: 10px;
}
.stat-label {
  font-weight: 600;
  color: #374151;
}
.stat-sub {
  font-size: 12px;
  color: #6b7280;
}

.main-content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}
@media (max-width: 1024px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }
}
.card-header h3 {
  font-size: 16px;
  font-weight: bold;
  color: #374151;
  margin: 0;
}
.border-left-teal {
  border-left: 4px solid #14b8a6;
  padding-left: 10px;
}
.border-left-orange {
  border-left: 4px solid #f97316;
  padding-left: 10px;
}
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chart-container {
  height: 350px;
  position: relative;
  width: 100%;
  margin-top: 20px;
}
.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}
.product-list {
  margin-top: 15px;
  max-height: 350px;
  overflow-y: auto;
}
.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}
.product-item:last-child {
  border-bottom: none;
}
.rank-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}
.rank-1 {
  background-color: #facc15;
}
.rank-2 {
  background-color: #9ca3af;
}
.rank-3 {
  background-color: #fb923c;
}
.rank-other {
  background-color: #ccfbf1;
  color: #0d9488;
}
.product-info {
  flex: 1;
  min-width: 0;
}
.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}
.product-meta {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
.product-img {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* CSS PANEL & DONUT */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.donut-card {
  min-height: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
}
.donut-card .card-header h3 {
  font-size: 14px;
}
.donut-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  max-height: 180px;
  margin-top: 10px;
}
.center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
  text-align: center;
  pointer-events: none;
}
.center-text .number {
  font-size: 18px;
  font-weight: 700;
  color: #374151;
}
.mini-toggles {
  display: flex;
  gap: 4px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 2px;
}
.mini-toggles span {
  font-size: 10px;
  padding: 2px 6px;
  cursor: pointer;
  color: #6b7280;
}
.mini-toggles span.active {
  background-color: #2563eb;
  color: white;
  border-radius: 3px;
  font-weight: 500;
}

/* --- CSS MỚI CHO BẢNG SẮP HẾT HÀNG --- */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.table-card {
  overflow: hidden;
}
.border-left-red {
  border-left: 4px solid #ef4444;
  padding-left: 10px;
}
.mini-action {
  font-size: 12px;
  background-color: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
  color: #6b7280;
}
.table-responsive {
  overflow-x: auto;
  margin-top: 15px;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.custom-table th {
  text-align: center;
  padding: 12px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}
.custom-table td {
  text-align: center;
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
  color: #4b5563;
}
.custom-table tr:last-child td {
  border-bottom: none;
}
.table-img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  margin: 0 auto;
}
.table-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.text-red {
  color: #ef4444;
}
.text-gray {
  color: #9ca3af;
}
.font-bold {
  font-weight: bold;
}
.font-medium {
  font-weight: 500;
}
.text-right {
  text-align: right;
}
.text-center {
  text-align: center;
}
.py-4 {
  padding-top: 16px;
  padding-bottom: 16px;
}

/* === PHẦN BỔ SUNG: CSS CHO MODAL === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  width: 400px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease-out;
}
@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #9ca3af;
}
.close-btn:hover {
  color: #4b5563;
}
.modal-body {
  margin-bottom: 24px;
}
.modal-desc {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}
.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-control:focus {
  border-color: #63391f;
  ring: 2px solid #63391f;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
