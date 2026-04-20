<template>
  <div class="dashboard-container">
    <div class="card filter-section">
      <div class="card-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        <h2>Thống Kê</h2>
      </div>

      <div class="top-actions-container">
        <div class="filter-controls">
          <div class="control-group">
            <label>Khoảng thời gian thống kê (Biểu đồ & Tổng quan)</label>
            <div class="date-inputs">
              <input type="date" v-model="filter.startDate" />
              <span>-</span>
              <input type="date" v-model="filter.endDate" />
            </div>
          </div>

          <div class="control-group">
            <label>Loại biểu đồ</label>
            <div class="btn-group">
              <button @click="chartType = 'line'" :class="{ active: chartType === 'line' }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                Đường
              </button>
              <button @click="chartType = 'bar'" :class="{ active: chartType === 'bar' }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                Cột
              </button>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="resetFilter" class="btn btn-secondary">
            Đặt lại bộ lọc
          </button>
          <button @click="handleTestSendEmail" class="btn" style="background-color: #10b981; color: white">
            🧪 Gửi Thử Mail
          </button>
          <button @click="openSettingsModal" class="btn btn-secondary" style="background-color: #4b5563">
            ⚙️ Cài đặt tự động
          </button>
          <button @click="showExportModal = true" class="btn btn-primary">
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div class="filter-footer-custom">
        <div class="revenue-summary-cards">
          <div class="summary-box">
            <span class="box-label">Tổng số đơn hàng</span>
            <span class="box-value text-black">{{ totalOrdersInChart }}</span>
          </div>
          <div class="summary-box">
            <span class="box-label">Tổng doanh thu</span>
            <span class="box-value text-green">{{ formatCurrency(totalRevenueInChart) }}</span>
          </div>
          <div class="summary-box">
            <span class="box-label">Doanh thu thực tế</span>
            <span class="box-value text-blue">{{ formatCurrency(totalActualRevenueInChart) }}</span>
          </div>
          <div class="summary-box">
            <span class="box-label">Doanh thu dự kiến</span>
            <span class="box-value text-yellow">{{ formatCurrency(totalExpectedRevenueInChart) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-top">
          <div class="icon-box blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatCurrency(summaryData.homNay?.doanhThu || 0) }}</div>
          </div>
        </div>
        <div class="stat-bottom">
          <div class="stat-label">Hôm nay</div>
          <div class="stat-sub">Đơn hàng: {{ summaryData.homNay?.soDonHang || 0 }}</div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-top">
          <div class="icon-box purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatCurrency(summaryData.tuanNay?.doanhThu || 0) }}</div>
          </div>
        </div>
        <div class="stat-bottom">
          <div class="stat-label">Tuần này</div>
          <div class="stat-sub">Đơn hàng: {{ summaryData.tuanNay?.soDonHang || 0 }}</div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-top">
          <div class="icon-box teal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatCurrency(summaryData.thangNay?.doanhThu || 0) }}</div>
          </div>
        </div>
        <div class="stat-bottom">
          <div class="stat-label">Tháng này</div>
          <div class="stat-sub">Đơn hàng: {{ summaryData.thangNay?.soDonHang || 0 }}</div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-top">
          <div class="icon-box orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatCurrency(summaryData.namNay?.doanhThu || 0) }}</div>
          </div>
        </div>
        <div class="stat-bottom">
          <div class="stat-label">Năm nay</div>
          <div class="stat-sub">Đơn hàng: {{ summaryData.namNay?.soDonHang || 0 }}</div>
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
            <Line v-if="chartData && chartType === 'line'" :data="chartData" :options="chartOptions as any" />
            <Bar v-else-if="chartData && chartType === 'bar'" :data="chartData" :options="chartOptions as any" />
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
                      <img :src="item.idSanPham?.hinhAnh || '/placeholder.png'" @error="(e) => ((e.target as HTMLImageElement).src = '/placeholder.png')" alt="img" />
                    </div>
                  </td>
                  <td class="text-gray">{{ item.maChiTietSanPham }}</td>
                  <td class="font-medium">{{ item.idSanPham?.tenSp || "Sản phẩm" }}</td>
                  <td>{{ item.idMauSac?.tenMauSac || "-" }}</td>
                  <td>{{ item.idKichCo?.tenKichCo || "-" }}</td>
                  <td class="text-red font-bold">{{ item.soLuongTon }}</td>
                  <td class="font-bold">{{ formatCurrency(item.giaBan) }}</td>
                </tr>
                <tr v-if="lowStockProducts.length === 0">
                  <td colspan="7" class="text-center text-gray py-4">Không có sản phẩm nào sắp hết hàng</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card table-card mt-4">
          <div class="card-header flex-between border-left-orange">
            <h3 style="font-size: 16px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 8px;">
              Sản Phẩm Bán Chạy Theo Thời Gian
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
            </h3>
            <div class="filter-pills">
              <button :class="{ active: topProductTimeFilter === 'all' }" @click="setTopProductTimeFilter('all')">Tất cả</button>
              <button :class="{ active: topProductTimeFilter === 'today' }" @click="setTopProductTimeFilter('today')">Hôm nay</button>
              <button :class="{ active: topProductTimeFilter === 'week' }" @click="setTopProductTimeFilter('week')">Tuần này</button>
              <button :class="{ active: topProductTimeFilter === 'month' }" @click="setTopProductTimeFilter('month')">Tháng này</button>
              <button :class="{ active: topProductTimeFilter === 'year' }" @click="setTopProductTimeFilter('year')">Năm nay</button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-table text-left border-table">
              <thead>
                <tr>
                  <th style="width: 50px;">Top</th>
                  <th style="width: 60px; text-align: center;">Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th style="text-align: right;">Đã bán</th>
                  <th style="text-align: right;">Giá bán</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(sp, index) in topProductsByTime" :key="index">
                  <td style="text-align: center;">
                    <div class="rank-badge-small" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
                  </td>
                  <td>
                    <div class="table-img">
                      <img :src="sp.anh || '/placeholder.png'" @error="(e) => ((e.target as HTMLImageElement).src = '/placeholder.png')" alt="sp"/>
                    </div>
                  </td>
                  <td class="font-medium text-black">{{ sp.tenSanPham }}</td>
                  <td class="text-black font-bold" style="text-align: right;">{{ sp.soLuongDaBan }}</td>
                  <td class="text-green font-bold" style="text-align: right;">{{ formatCurrency(sp.giaBan) }}</td>
                </tr>
                <tr v-if="!topProductsByTime || topProductsByTime.length === 0">
                  <td colspan="5" class="text-center text-gray py-4">Chưa có dữ liệu sản phẩm bán chạy.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="card donut-card">
          <div class="card-header flex-between">
            <h3>Phân Bố Trạng Thái Đơn Hàng</h3>
          </div>
          <div class="donut-container">
            <Doughnut v-if="statusChartData" :data="statusChartData" :options="statusDoughnutOptions as any" />
          </div>
        </div>

        <div class="card donut-card">
          <div class="card-header">
            <h3>Phân Phối Đa Kênh</h3>
          </div>
          <div class="donut-container">
            <Doughnut v-if="channelChartData" :data="channelChartData" :options="channelDoughnutOptions as any" />
          </div>
        </div>

        <div class="card top-product-section">
          <div class="card-header border-left-orange">
            <h3 style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              Sản Phẩm Bán Chạy Theo Đợt Giảm Giá
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
            </h3>
            <div class="campaign-select-wrap">
              <select v-model="topProductCampaignFilter" @change="fetchTopProductsByCampaign" class="form-control-sm">
                <option value=""> Chọn đợt giảm giá </option>
                <option v-for="c in campaigns" :key="c.id || c.idDotGiamGia" :value="c.id || c.idDotGiamGia || c.id_dot_giam_gia">
                  {{ c.tenDotGiamGia || c.ten_dot_giam_gia }}
                </option>
              </select>
            </div>
          </div>

          <div class="product-list">
            <div v-for="(sp, index) in topProductsByCampaign" :key="index" class="product-item">
              <div class="rank-badge" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
              <div class="product-info">
                <p class="product-name" :title="sp.tenSanPham">{{ sp.tenSanPham }}</p>
                <div class="product-meta">
                  Đã bán: <b>{{ sp.soLuongDaBan }}</b> | Giá: <b class="text-green">{{ formatCurrency(sp.giaBan) }}</b>
                </div>
              </div>
              <div class="product-img">
                <img :src="sp.anh || '/placeholder.png'" @error="(e) => ((e.target as HTMLImageElement).src = '/placeholder.png')" alt="sp" />
              </div>
            </div>
            
            <div v-if="!topProductCampaignFilter" class="text-center text-gray py-4" style="font-size: 13px;">
              Vui lòng chọn đợt giảm giá để xem thống kê.
            </div>
            <div v-else-if="topProductsByCampaign.length === 0" class="text-center text-gray py-4" style="font-size: 13px;">
              Đợt giảm giá này chưa bán được sản phẩm nào.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showExportModal" class="modal-overlay" @click.self="showExportModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Xuất Báo Cáo Doanh Thu</h3>
          <button class="close-btn" @click="showExportModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">Chọn khoảng thời gian cần xuất báo cáo:</p>
          <div class="form-group">
            <label>Từ ngày:</label>
            <input type="date" v-model="exportForm.startDate" class="form-control" />
          </div>
          <div class="form-group">
            <label>Đến ngày:</label>
            <input type="date" v-model="exportForm.endDate" class="form-control" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showExportModal = false">Hủy</button>
          <button class="btn btn-primary" @click="handleExportExcel" :disabled="isExporting">
            {{ isExporting ? "Đang tải..." : "Xuất Excel" }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" :class="['custom-toast', toast.type === 'success' ? 'toast-success' : 'toast-error']">
      <div class="toast-text">{{ toast.message }}</div>
    </div>
  </div>
  </template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, reactive } from "vue";
import axios from "axios";
// Bỏ comment dòng dưới nếu bạn có component EmailSettingsModal
// import EmailSettingsModal from "./EmailSettingsModal.vue";
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

const API_URL = "http://localhost:8080/api/thong-ke";
const CAMPAIGN_API_URL = "http://localhost:8080/api/promotions"; 

const showSettingsModal = ref(false);
const openSettingsModal = () => {
  showSettingsModal.value = true;
};

const toast = reactive({ show: false, message: "", type: "success" });

const showToast = (message: string, type: "success" | "error" = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

const customDataLabelsPlugin = {
  id: "customDataLabels",
  afterDatasetsDraw(chart: any) {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset: any, i: number) => {
      const meta = chart.getDatasetMeta(i);
      if (!meta.hidden && chart.config.type === "line") {
        meta.data.forEach((element: any, index: number) => {
          const dataValue = dataset.data[index];
          if (dataValue !== undefined && dataValue !== null) {
            let text = dataValue === 0 ? "0" : new Intl.NumberFormat("vi-VN").format(dataValue);
            ctx.fillStyle = "#9ca3af";
            ctx.font = "11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            const position = element.tooltipPosition();
            ctx.fillText(text, position.x, position.y - 8);
          }
        });
      }
    });
  },
};

const handleTestSendEmail = async () => {
  const confirmTest = confirm("Hệ thống sẽ gửi 1 bản báo cáo demo tới email bạn đã cài đặt. Bạn có muốn tiếp tục?");
  if (!confirmTest) return;

  try {
    const res = await axios.post(`${API_URL}/test-email`);
    showToast(res.data, "success");
  } catch (error: any) {
    showToast("Lỗi: " + (error.response?.data || "Không thể kết nối đến máy chủ gửi mail"), "error");
  }
};

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler, customDataLabelsPlugin
);

interface SummaryResponse { doanhThu: number; soDonHang: number; }
interface SummaryMap { homNay?: SummaryResponse; tuanNay?: SummaryResponse; thangNay?: SummaryResponse; namNay?: SummaryResponse; }
interface ChartResponse { thoiGian: string; doanhThu: number; doanhThuThucTe: number; doanhThuDuKien: number; soLuongDon: number; }
interface TopProductResponse { tenSanPham: string; anh: string; giaBan: number; soLuongDaBan: number; }
interface StatusResponse { trangThai: number; soLuong: number; }
interface ChannelResponse { loai: string; soLuong: number; }

const summaryData = ref<SummaryMap>({});
const chartRawData = ref<ChartResponse[]>([]);
const statusRawData = ref<StatusResponse[]>([]);
const channelRawData = ref<ChannelResponse[]>([]);
const lowStockProducts = ref<any[]>([]);

const chartType = ref<"line" | "bar">("line");
const today = new Date().toISOString().slice(0, 10);
const firstDayOfMonth = new Date();
firstDayOfMonth.setDate(1);
const firstDayStr = firstDayOfMonth.toISOString().slice(0, 10);

const filter = ref({ startDate: firstDayStr, endDate: today });

const showExportModal = ref(false);
const isExporting = ref(false);
const exportForm = ref({
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
});

const hiddenStatusIndices = ref<number[]>([]);
const hiddenChannelIndices = ref<number[]>([]);

const topProductsByTime = ref<TopProductResponse[]>([]);
const topProductsByCampaign = ref<TopProductResponse[]>([]);
const topProductTimeFilter = ref('all');
const topProductCampaignFilter = ref<number | ''>('');
const campaigns = ref<any[]>([]);

// HÀM CHUYỂN ĐỔI NGÀY THÁNG ĐÚNG CHUẨN (YYYY-MM-DD)
const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateRangeForTopProducts = (type: string) => {
  const now = new Date();
  let start = '';
  let end = getLocalDateString(now);

  if (type === 'today') {
    start = end;
  } else if (type === 'week') {
    const day = now.getDay() || 7; 
    if (day !== 1) now.setHours(-24 * (day - 1)); 
    start = getLocalDateString(now);
    now.setDate(now.getDate() + 6); 
    end = getLocalDateString(now);
  } else if (type === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    start = getLocalDateString(firstDay);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end = getLocalDateString(lastDay);
  } else if (type === 'year') {
    start = `${now.getFullYear()}-01-01`;
    end = `${now.getFullYear()}-12-31`;
  }
  return { startDate: start, endDate: end };
};

// FIX LỖI 400: Loại bỏ tham số nếu người dùng chọn "Tất cả"
const fetchTopProductsByTime = async () => {
  try {
    let params: Record<string, string> = {};
    
    if (topProductTimeFilter.value !== 'all') {
      const range = getDateRangeForTopProducts(topProductTimeFilter.value);
      // Chỉ gán nếu có giá trị để tránh gửi chuỗi rỗng
      if(range.startDate) params.startDate = range.startDate;
      if(range.endDate) params.endDate = range.endDate;
    }

    const res = await axios.get(`${API_URL}/ban-chay`, { params });
    topProductsByTime.value = res.data;
  } catch (error) {
    console.error("Lỗi tải danh sách sản phẩm bán chạy theo thời gian:", error);
  }
};

const setTopProductTimeFilter = (val: string) => {
  topProductTimeFilter.value = val;
  fetchTopProductsByTime();
};

const fetchTopProductsByCampaign = async () => {
  if (!topProductCampaignFilter.value) {
    topProductsByCampaign.value = []; 
    return;
  }
  try {
    const res = await axios.get(`${API_URL}/ban-chay-theo-dot`, {
      params: { idDotGiamGia: topProductCampaignFilter.value }
    });
    topProductsByCampaign.value = res.data;
  } catch (error) {
    console.error("Lỗi tải danh sách sản phẩm bán chạy theo đợt:", error);
  }
};

const fetchCampaigns = async () => {
  try {
    const res = await axios.get(CAMPAIGN_API_URL);
    campaigns.value = res.data;
  } catch (e) {
    console.warn("Chưa lấy được danh sách đợt giảm giá", e);
  }
};

const fetchData = async () => {
  try {
    const resSummary = await axios.get(`${API_URL}/tong-quat`);
    summaryData.value = resSummary.data;

    const resStatus = await axios.get(`${API_URL}/trang-thai`);
    statusRawData.value = resStatus.data;

    const resChannel = await axios.get(`${API_URL}/loai-don`);
    channelRawData.value = resChannel.data;

    const resLowStock = await axios.get(`${API_URL}/sap-het`);
    lowStockProducts.value = resLowStock.data;

    hiddenStatusIndices.value = [];
    hiddenChannelIndices.value = [];

    await fetchChartData();
    await fetchTopProductsByTime();
    await fetchCampaigns();
  } catch (error) {
    console.error("Lỗi tải dữ liệu Dashboard:", error);
  }
};

// FIX LỖI 400: Tránh gửi chuỗi rỗng cho API biểu đồ
const fetchChartData = async () => {
  try {
    const params: Record<string, string> = {};
    if (filter.value.startDate) params.startDate = filter.value.startDate;
    if (filter.value.endDate) params.endDate = filter.value.endDate;

    const resChart = await axios.get(`${API_URL}/doanh-thu`, { params });
    chartRawData.value = resChart.data;
  } catch (error) {
    console.error("Lỗi tải biểu đồ doanh thu:", error);
  }
};

watch(
  () => [filter.value.startDate, filter.value.endDate],
  () => {
    if (filter.value.startDate && filter.value.endDate) fetchChartData();
  },
);

const resetFilter = () => {
  filter.value.startDate = firstDayStr;
  filter.value.endDate = today;
};

// FIX LỖI 400: Xử lý file Export an toàn
const handleExportExcel = async () => {
  if (!exportForm.value.startDate || !exportForm.value.endDate) {
    showToast("Vui lòng chọn đầy đủ ngày tháng!", "error");
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
    link.setAttribute("download", `BaoCaoDoanhThu_${exportForm.value.startDate}_${exportForm.value.endDate}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showExportModal.value = false;
    showToast("Xuất báo cáo thành công!", "success");
  } catch (error) {
    console.error("Lỗi xuất file:", error);
    showToast("Có lỗi xảy ra khi xuất file!", "error");
  } finally {
    isExporting.value = false;
  }
};

const chartData = computed(() => {
  if (!filter.value.startDate || !filter.value.endDate) return null;

  const start = new Date(filter.value.startDate);
  const end = new Date(filter.value.endDate);

  const labels: string[] = [];
  const dataValues: number[] = [];

  const dataMap: Record<string, number> = {};
  chartRawData.value.forEach((item) => {
    dataMap[item.thoiGian] = item.doanhThu;
  });

  let currentDate = new Date(start);
  while (currentDate <= end) {
    const dateString = currentDate.toISOString().slice(0, 10);
    const day = currentDate.getDate();

    labels.push(day.toString());
    dataValues.push(dataMap[dateString] || 0);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    labels: labels,
    datasets: [
      {
        label: "Doanh thu",
        backgroundColor: chartType.value === "bar" ? "rgba(66, 184, 163, 0.8)" : "transparent",
        borderColor: "#42b8a3",
        borderWidth: chartType.value === "bar" ? 0 : 2,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#42b8a3",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        data: dataValues,
        fill: false,
        tension: 0.4,
      },
    ],
  };
});

const chartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 30 } },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      mode: "index",
      intersect: false,
      callbacks: {
        label: function (context: any) {
          return "Doanh thu: " + new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(context.parsed.y);
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      min: 0,
      ticks: {
        stepSize: 500000000,
        callback: function (value: any) {
          if (value === 0) return "0";
          if (value >= 1000000) return value / 1000000 + "M";
          return value;
        },
        color: "#9ca3af",
      },
      grid: { display: false },
      border: { display: false },
    },
    x: {
      grid: { display: false },
      ticks: { color: "#9ca3af" },
      border: { display: true, color: "#d1d5db" },
    },
  },
};

const statusChartData = computed(() => {
  const statusMap: Record<number, string> = {
    0: "Chờ xác nhận", 1: "Đã xác nhận", 2: "Giao cho vận chuyển", 3: "Đang giao hàng", 4: "Hoàn thành", 5: "Đã hủy",
  };
  const colors = ["#38bdf8", "#fcd34d", "#8b5cf6", "#06b6d4", "#14b8a6", "#fb7185"];
  const total = statusRawData.value.reduce((sum, item) => sum + item.soLuong, 0);

  const labels = statusRawData.value.map((i) => {
    const name = statusMap[i.trangThai] || `Trạng thái ${i.trangThai}`;
    const percent = total > 0 ? ((i.soLuong / total) * 100).toFixed(2) : "0.00";
    return `${name}\n${i.soLuong} đơn (${percent}%)`;
  });

  return {
    labels: labels,
    datasets: [{
      data: statusRawData.value.map((i) => i.soLuong),
      backgroundColor: statusRawData.value.map((i) => colors[i.trangThai] || "#cbd5e1"),
      borderWidth: 2,
      borderColor: "#ffffff",
    }],
  };
});

const channelChartData = computed(() => {
  const colors = ["#14b8a6", "#fb7185", "#38bdf8"];
  const total = channelRawData.value.reduce((sum, item) => sum + item.soLuong, 0);

  const labels = channelRawData.value.map((i) => {
    const percent = total > 0 ? ((i.soLuong / total) * 100).toFixed(2) : "0.00";
    return `${i.loai}\n${i.soLuong} đơn (${percent}%)`;
  });

  return {
    labels: labels,
    datasets: [{
      data: channelRawData.value.map((i) => i.soLuong),
      backgroundColor: colors,
      borderWidth: 2,
      borderColor: "#ffffff",
    }],
  };
});

const donutOptionsBase = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  layout: { padding: { top: 10, bottom: 20, left: 10, right: 10 } },
  plugins: {
    legend: {
      position: "right",
      align: "center",
      labels: {
        usePointStyle: true, boxWidth: 8, padding: 20,
        font: { size: 13, family: "'Inter', sans-serif" },
        color: "#4b5563",
        generateLabels: (chart: any) => {
          const datasets = chart.data.datasets;
          return chart.data.labels.map((label: string, i: number) => {
            const isHidden = chart.getDataVisibility(i) === false;
            return {
              text: label.split("\n")[0],
              fillStyle: datasets[0].backgroundColor[i],
              hidden: isHidden,
              index: i,
              strokeStyle: datasets[0].backgroundColor[i],
              lineWidth: 0,
            };
          });
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      titleColor: "#1f2937", bodyColor: "#4b5563", borderColor: "#e5e7eb", borderWidth: 1, padding: 12, boxPadding: 4,
      callbacks: {
        title: function (context: any) { return context[0].label.split("\n")[0]; },
        label: function (context: any) { const labelArr = context.label.split("\n"); return ` ${labelArr[1]}`; },
      },
    },
  },
};

const statusDoughnutOptions = computed(() => ({
  ...donutOptionsBase,
  plugins: {
    ...donutOptionsBase.plugins,
    legend: {
      ...donutOptionsBase.plugins.legend,
      onClick: (e: any, legendItem: any, legend: any) => {
        const index = legendItem.index;
        const chart = legend.chart;
        chart.toggleDataVisibility(index);
        chart.update();
        if (hiddenStatusIndices.value.includes(index)) {
          hiddenStatusIndices.value = hiddenStatusIndices.value.filter((i) => i !== index);
        } else {
          hiddenStatusIndices.value = [...hiddenStatusIndices.value, index];
        }
      },
    },
  },
}));

const channelDoughnutOptions = computed(() => ({
  ...donutOptionsBase,
  plugins: {
    ...donutOptionsBase.plugins,
    legend: {
      ...donutOptionsBase.plugins.legend,
      onClick: (e: any, legendItem: any, legend: any) => {
        const index = legendItem.index;
        const chart = legend.chart;
        chart.toggleDataVisibility(index);
        chart.update();
        if (hiddenChannelIndices.value.includes(index)) {
          hiddenChannelIndices.value = hiddenChannelIndices.value.filter((i) => i !== index);
        } else {
          hiddenChannelIndices.value = [...hiddenChannelIndices.value, index];
        }
      },
    },
  },
}));

const totalRevenueInChart = computed(() => chartRawData.value.reduce((sum, item) => sum + item.doanhThu, 0));
const totalOrdersInChart = computed(() => chartRawData.value.reduce((sum, item) => sum + item.soLuongDon, 0));
const totalActualRevenueInChart = computed(() => chartRawData.value.reduce((sum, item) => sum + (item.doanhThuThucTe || 0), 0));
const totalExpectedRevenueInChart = computed(() => chartRawData.value.reduce((sum, item) => sum + (item.doanhThuDuKien || 0), 0));

const formatCurrency = (value: number) => {
  if (value === undefined || value === null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};

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
.dashboard-container {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
.top-actions-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f3f4f6;
}
.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
}
.action-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
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
  background: linear-gradient(90deg, #c79a63, #8b5e34);
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
  background: linear-gradient(90deg, #c79a63, #8b5e34);
  color: white;
  border: none;
}
.btn-primary:hover {
  background: linear-gradient(90deg, #b88d57, #7a502c);
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
  transition: transform 0.2s, box-shadow 0.2s;
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
.icon-box.blue { background: #dbeafe; color: #2563eb; }
.icon-box.purple { background: #f3e8ff; color: #9333ea; }
.icon-box.teal { background: #ccfbf1; color: #0d9488; }
.icon-box.orange { background: #ffedd5; color: #ea580c; }
.stat-info { text-align: right; }
.stat-value { font-size: 20px; font-weight: bold; color: #1f2937; }
.stat-trend { font-size: 12px; margin-top: 4px; display: flex; align-items: center; justify-content: flex-end; gap: 2px; }
.stat-trend.down { color: #ef4444; }
.stat-bottom { margin-top: 10px; }
.stat-label { font-weight: 600; color: #374151; }
.stat-sub { font-size: 12px; color: #6b7280; }
.main-content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}
@media (max-width: 1024px) {
  .main-content-grid { grid-template-columns: 1fr; }
}
.card-header h3 { font-size: 16px; font-weight: bold; color: #374151; margin: 0; }
.border-left-teal { border-left: 4px solid #14b8a6; padding-left: 10px; }
.border-left-orange { border-left: 4px solid #f97316; padding-left: 10px; }
.border-left-red { border-left: 4px solid #ef4444; padding-left: 10px; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.chart-container { height: 350px; position: relative; width: 100%; margin-top: 20px; }
.loading-text { display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af; }
.product-list { margin-top: 15px; max-height: 350px; overflow-y: auto; }
.product-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.product-item:last-child { border-bottom: none; }
.rank-badge { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; color: white; flex-shrink: 0; }
.rank-badge-small { width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; color: white; }
.rank-1 { background-color: #facc15; }
.rank-2 { background-color: #9ca3af; }
.rank-3 { background-color: #fb923c; }
.rank-other { background-color: #ccfbf1; color: #0d9488; }
.product-info { flex: 1; min-width: 0; }
.product-name { font-size: 14px; font-weight: 600; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
.product-meta { font-size: 12px; color: #6b7280; margin-top: 2px; }
.product-img { width: 48px; height: 48px; border-radius: 6px; overflow: hidden; border: 1px solid #e5e7eb; flex-shrink: 0; }
.product-img img { width: 100%; height: 100%; object-fit: cover; }
.right-panel { display: flex; flex-direction: column; gap: 20px; }
.donut-card { min-height: auto; padding: 15px; display: flex; flex-direction: column; }
.donut-card .card-header h3 { font-size: 14px; }
.donut-container { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; height: 360px; margin-top: 10px; }
.left-panel { display: flex; flex-direction: column; gap: 24px; }
.table-card { overflow: hidden; }
.mini-action { font-size: 12px; background-color: #f3f4f6; padding: 2px 8px; border-radius: 4px; color: #6b7280; }
.table-responsive { overflow-x: auto; margin-top: 15px; }
.custom-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.custom-table th { text-align: center; padding: 12px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
.custom-table td { text-align: center; padding: 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #4b5563; }
.custom-table tr:last-child td { border-bottom: none; }
.table-img { width: 40px; height: 40px; border-radius: 4px; overflow: hidden; border: 1px solid #e5e7eb; margin: 0 auto; }
.table-img img { width: 100%; height: 100%; object-fit: cover; }
.text-red { color: #ef4444; }
.text-green { color: #10b981; }
.text-gray { color: #9ca3af; }
.font-bold { font-weight: bold; }
.font-medium { font-weight: 500; }
.text-center { text-align: center; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; display: flex; justify-content: center; align-items: center; }
.modal-content { background: white; width: 400px; padding: 24px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); animation: slideDown 0.3s ease-out; }
@keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.modal-header h3 { margin: 0; font-size: 18px; color: #1f2937; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }
.close-btn:hover { color: #4b5563; }
.modal-body { margin-bottom: 24px; }
.modal-desc { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.form-control { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.form-control:focus { border-color: #63391f; }
.form-control-sm { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; outline: none; cursor: pointer; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; }
.filter-footer-custom { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
.revenue-summary-cards { display: flex; gap: 16px; width: 100%; }
.summary-box { flex: 1; background-color: #f8f9fc; border: 1px solid #edf2f7; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.box-label { font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500; }
.box-value { font-size: 22px; font-weight: 700; }
.text-black { color: #1f2937; }
.text-blue { color: #3b82f6; }
.text-yellow { color: #fbbf24; }
.mt-4 { margin-top: 24px; }
.border-table th, .border-table td { border: 1px solid #f3f4f6; }
.custom-table.text-left th, .custom-table.text-left td { text-align: left; padding: 14px 16px; }
.custom-table.text-left th { background-color: #ffffff; color: #1f2937; font-weight: 600; }
.filter-pills { display: flex; background: #f3f4f6; padding: 4px; border-radius: 6px; gap: 4px; }
.filter-pills button { border: none; background: transparent; padding: 6px 12px; border-radius: 4px; cursor: pointer; color: #6b7280; font-size: 13px; transition: all 0.2s; }
.filter-pills button:hover { color: #374151; }
.filter-pills button.active { background: #ffffff; color: #f97316; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.campaign-select-wrap { margin-top: 10px; }
.custom-toast { position: fixed; top: 30px; right: 30px; padding: 12px 20px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); z-index: 9999; font-size: 14px; font-weight: 500; display: flex; align-items: center; animation: slideInRight 0.3s ease forwards; }
.toast-success { background-color: #d1e7dd; color: #0f5132; border-left: 4px solid #198754; }
.toast-error { background-color: #f8d7da; color: #842029; border-left: 4px solid #dc3545; }
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
</style>