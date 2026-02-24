<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
// --- INTERFACES ---
// 1. Thêm avatar vào interface
interface Employee { id: number; maNv: string; hoTen: string; chucVu?: string; trangThai: number; avatar?: string; }
interface Shift { idCa: number; tenCa: string; gioBatDau: string; gioKetThuc: string; trangThai: number; }
interface Schedule { id: number; ngayLamViec: string; nhanVien: Employee; caLamViec: Shift; ghiChu?: string; trangThai: number; }
// 2. Thêm computed tự động lọc ra các ca làm việc duy nhất từ lịch của nhân viên

const sortedShifts = computed(() => {
  const shiftMap = new Map<number, Shift>();
  schedules.value.forEach(s => {
    if (s.caLamViec && !shiftMap.has(s.caLamViec.idCa)) {
      shiftMap.set(s.caLamViec.idCa, s.caLamViec);
    }
  });
  // Sắp xếp các ca theo thời gian bắt đầu
   return [...shifts.value].sort((a, b) => timeToMinutes(a.gioBatDau) - timeToMinutes(b.gioBatDau));
});

// 3. Hàm lọc lịch làm việc cho từng ô trong Ma trận (Không cần lọc theo tên NV vì đây là lịch cá nhân)
const getSchedulesForShiftAndDate = (idCa: number, dateStr: string) => {
  if (!dateStr || !idCa) return [];
  return schedules.value.filter(s => {
    if (s.ngayLamViec !== dateStr || s.caLamViec?.idCa !== idCa) return false;
    const matchStatus = filters.status === 'all' || s.trangThai === filters.status;
    return matchStatus;
  });
};
// --- STATE ---
// API lấy lịch của nhân viên đang đăng nhập
// API lấy lịch của nhân viên đang đăng nhập
const API_URL = 'http://localhost:8080/api/lich-lam-viec/my-schedule';
// THÊM: API lấy danh sách tất cả các ca
const API_SHIFT = 'http://localhost:8080/api/ca-lam-viec';
// Lấy ID nhân viên từ localStorage
// const currentUserId = ref<number | null>(15); // Mock ID cho test
// Khởi tạo ref trống
const shifts = ref<Shift[]>([]);
const currentUserId = ref(null);
// Lấy thông tin user từ LocalStorage
const userStr = localStorage.getItem('user');
if (userStr) {
  const userObj = JSON.parse(userStr);
  // Trích xuất id mà Backend đã trả về
  currentUserId.value = userObj.id; 
} else {
  // Nếu chưa đăng nhập thì đá văng ra trang login
  alert("Vui lòng đăng nhập lại!");
  window.location.href = '/login';
}
const schedules = ref<Schedule[]>([]); // Data cho Lịch
const pagedSchedules = ref<Schedule[]>([]); // Data cho Bảng
const loading = ref(false);
const viewMode = ref<'table' | 'calendar'>('table');

// Calendar State
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const calendarView = ref<'month' | 'week' | 'day'>('month'); 
const currentDate = ref(new Date()); 

// Filters & Pagination
const filters = reactive({ 
  fromDate: '', 
  toDate: '', 
  status: 'all' as string | number 
});
const perPage = ref(8);
const page = ref(0);
const totalPages = ref(0);

// Popup Detail State
const selectedSchedule = ref<Schedule | null>(null);
const showDetailPopup = ref(false);

// Notifications
const notifications = ref<{ id: number; message: string; type: string }[]>([]);

// --- HELPERS ---
const formatTime = (time: string) => time ? time.substring(0, 5) : '--:--';
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};
// Hàm hỗ trợ đổi giờ ra phút để sắp xếp
const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const getStatusText = (status: number) => {
  if (status === 3) return 'Đang làm';
  if (status === 2) return 'Sắp tới'; 
  return 'Đã qua';
};

const getStatusClass = (status: number) => {
  if (status === 3) return 'in-progress'; 
  if (status === 2) return 'active';
  return 'inactive';
};

const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
  const id = Date.now();
  notifications.value.push({ id, message, type });
  setTimeout(() => notifications.value = notifications.value.filter(n => n.id !== id), 3000);
};

const todayDateStr = computed(() => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
});

// --- API FETCHING ---
const fetchTableData = async () => {
  if (!currentUserId.value) return;
  try {
    const params: any = { page: page.value, size: perPage.value };
    if (filters.status !== 'all') params.trangThai = filters.status;
    if (filters.fromDate) { params.fromDate = filters.fromDate; }
    if (filters.toDate) { params.toDate = filters.toDate; }

    const res = await axios.get(`${API_URL}/${currentUserId.value}/search`, { params });
    pagedSchedules.value = res.data.content;
    totalPages.value = res.data.totalPages;
  } catch (error) { 
    showToast('Lỗi tải dữ liệu bảng', 'error');
  }
};

const refreshData = async () => {
  if (!currentUserId.value) return;
  loading.value = true;
  try {
    const resAll = await axios.get(`${API_URL}/${currentUserId.value}`);
    schedules.value = resAll.data;
    if (viewMode.value === 'table') await fetchTableData();
  } catch (error) { 
    showToast('Lỗi kết nối máy chủ', 'error');
  } 
  finally { loading.value = false; }
};

// --- WATCHERS ---
watch(viewMode, () => refreshData());
watch([() => filters.fromDate, () => filters.toDate, () => filters.status], () => { page.value = 0; refreshData(); });
watch(page, () => { if (viewMode.value === 'table') fetchTableData(); });

// --- UI / CALENDAR LOGIC ---
const changePage = (newPage: number) => { if (newPage >= 0 && newPage < totalPages.value) page.value = newPage; };
const openDetailPopup = (item: Schedule) => { selectedSchedule.value = item; showDetailPopup.value = true; };
const closeDetailPopup = () => { showDetailPopup.value = false; selectedSchedule.value = null; };

// Calendar helpers
const getStartOfWeek = (date: Date) => { const day = date.getDay(); const diff = date.getDate() - day + (day === 0 ? -6 : 1); return new Date(date.setDate(diff)); };

const calendarTitle = computed(() => { 
  const d = new Date(currentDate.value); 
  if (calendarView.value === 'month') return `Tháng ${d.getMonth() + 1} - ${d.getFullYear()}`; 
  else if (calendarView.value === 'week') { 
    const s = getStartOfWeek(new Date(d)); 
    const e = new Date(s); 
    e.setDate(e.getDate() + 6); 
    return `Tuần: ${s.getDate()}/${s.getMonth()+1} - ${e.getDate()}/${e.getMonth()+1}`; 
  } 
  else return `Ngày ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; 
});

const calendarDays = computed(() => { 
  const days = []; 
  const curr = new Date(currentDate.value); 
  if (calendarView.value === 'month') { 
    const year = curr.getFullYear(); 
    const month = curr.getMonth(); 
    const firstDay = new Date(year, month, 1); 
    const lastDay = new Date(year, month + 1, 0); 
    let startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; 
    for (let i = 0; i < startPadding; i++) days.push({ day: null, dateStr: '' }); 
    for (let i = 1; i <= lastDay.getDate(); i++) { days.push({ day: i, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` }); } 
  } else if (calendarView.value === 'week') { 
    const s = getStartOfWeek(new Date(curr)); 
    for (let i = 0; i < 7; i++) { 
      const d = new Date(s); 
      d.setDate(d.getDate() + i); 
      days.push({ day: d.getDate(), dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }); 
    } 
  } else { 
    days.push({ day: curr.getDate(), dateStr: `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}` }); 
  } 
  return days; 
});

const navigateCalendar = (step: number) => { 
  const d = new Date(currentDate.value); 
  if (calendarView.value === 'month') d.setMonth(d.getMonth() + step); 
  else if (calendarView.value === 'week') d.setDate(d.getDate() + (step * 7)); 
  else d.setDate(d.getDate() + step); 
  currentDate.value = d; 
};

const goToToday = () => { 
  const t = new Date(); 
  currentDate.value = new Date(t.getFullYear(), t.getMonth(), t.getDate()); 
  filters.fromDate = todayDateStr.value; 
  filters.toDate = todayDateStr.value;
  if (calendarView.value !== 'month') calendarView.value = 'month'; 
};

const getSchedulesForCalendarCell = (dateStr: string) => {
  if (!dateStr) return [];
  return schedules.value.filter(s => {
    if (s.ngayLamViec !== dateStr) return false;
    const matchStatus = filters.status === 'all' || s.trangThai === filters.status;
    return matchStatus;
  });
};

const hours = Array.from({ length: 24 }, (_, i) => i);
const getEventStyle = (sche: Schedule, dateStr: string, allSchedules: Schedule[]) => { 
  const startMins = timeToMinutes(sche.caLamViec.gioBatDau); 
  const endMins = timeToMinutes(sche.caLamViec.gioKetThuc); 
  const topPercent = (startMins / 1440) * 100; 
  const heightPercent = ((endMins - startMins) / 1440) * 100; 
  const overlapping = allSchedules.filter(s => { 
    if (s.ngayLamViec !== dateStr || s.id === sche.id) return false; 
    const sStart = timeToMinutes(s.caLamViec.gioBatDau); 
    const sEnd = timeToMinutes(s.caLamViec.gioKetThuc); 
    return (startMins < sEnd) && (endMins > sStart); 
  }); 
  let leftOffset = 2; 
  let widthOffset = 2; 
  if (overlapping.length > 0) { 
    const sorted = [...overlapping, sche].sort((a, b) => timeToMinutes(a.caLamViec.gioBatDau) - timeToMinutes(b.caLamViec.gioBatDau)); 
    const index = sorted.findIndex(s => s.id === sche.id); 
    const slotWidth = 100 / (sorted.length + 1); 
    widthOffset = slotWidth - 2; 
    leftOffset = index * slotWidth + 2; 
  } 
  return { top: `${topPercent}%`, height: `${heightPercent}%`, position: 'absolute' as 'absolute', left: `${leftOffset}%`, width: overlapping.length > 0 ? `${widthOffset}%` : 'auto', right: overlapping.length > 0 ? 'auto' : '2px', zIndex: 10 }; 
};
// --- CHỨC NĂNG XUẤT EXCEL ---
const exportExcel = async () => {
  const workbook = new ExcelJS.Workbook(); 
  const worksheet = workbook.addWorksheet('Lịch của tôi');
  
  // Rút gọn các cột (Bỏ cột Tên/Mã NV vì toàn bộ là lịch cá nhân)
  worksheet.columns = [ 
    { key: 'stt', width: 8 }, 
    { key: 'ngayLamViec', width: 15 }, 
    { key: 'tenCa', width: 20 }, 
    { key: 'gioBatDau', width: 12 }, 
    { key: 'gioKetThuc', width: 12 }, 
    { key: 'ghiChu', width: 35 }, 
    { key: 'trangThai', width: 15 } 
  ];
  
  worksheet.mergeCells('A1:G1'); 
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'DANH SÁCH LỊCH LÀM VIỆC CỦA TÔI';
  titleCell.font = { name: 'Times New Roman', size: 16, bold: true };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  
  worksheet.addRow([]);
  
  const headerRow = worksheet.addRow(['STT', 'Ngày làm việc', 'Ca', 'Bắt đầu', 'Kết thúc', 'Ghi chú', 'Trạng thái']);
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Times New Roman', bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }};
  });
  
  const dataToExport = viewMode.value === 'table' ? pagedSchedules.value : schedules.value;

  dataToExport.forEach((sche, index) => {
    const row = worksheet.addRow([ 
      index + 1, 
      sche.ngayLamViec, 
      sche.caLamViec?.tenCa, 
      formatTime(sche.caLamViec?.gioBatDau), 
      formatTime(sche.caLamViec?.gioKetThuc), 
      sche.ghiChu || '', 
      getStatusText(sche.trangThai) 
    ]);

    row.eachCell((cell, colNumber) => { // <-- Thêm biến colNumber vào đây
      cell.font = { name: 'Times New Roman' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }};
      
      // Dùng colNumber (kiểu số) để so sánh thay vì cell.col
      if (colNumber !== 3 && colNumber !== 6) { 
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  });
  
  const buffer = await workbook.xlsx.writeBuffer(); 
  saveAs(new Blob([buffer]), `LichCuaToi_${Date.now()}.xlsx`);
};
const weekDays = [ { val: 1, label: 'T2' }, { val: 2, label: 'T3' }, { val: 3, label: 'T4' }, { val: 4, label: 'T5' }, { val: 5, label: 'T6' }, { val: 6, label: 'T7' }, { val: 0, label: 'CN' } ];

// Visible pages for pagination
const visiblePages = computed(() => {
  const total = totalPages.value; 
  const current = page.value + 1; 
  const delta = 2; 
  const range: number[] = []; 
  const rangeWithDots: (number | string)[] = []; 
  let l: number | undefined;
  for (let i = 1; i <= total; i++) { if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) { range.push(i); } }
  range.forEach(i => { if (l) { if (i - l === 2) { rangeWithDots.push(l + 1); } else if (i - l !== 1) { rangeWithDots.push('...'); } } rangeWithDots.push(i); l = i; });
  return rangeWithDots;
});

// Reset filters
const resetFilters = () => { filters.fromDate = ''; filters.toDate = ''; filters.status = 'all'; page.value = 0; refreshData(); };
// THÊM: Hàm gọi API lấy danh sách toàn bộ Ca Làm Việc
const fetchShifts = async () => {
  try {
    const response = await axios.get(API_SHIFT);
    // Lọc lấy các ca đang hoạt động (trangThai === 1) nếu cần thiết, hoặc lấy hết
    shifts.value = response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách ca làm việc:', error);
  }
};
// --- INIT ---
onMounted(() => {
  // Sử dụng mock ID cho test
  if (currentUserId.value) {
    fetchShifts(); // Gọi API lấy danh sách ca làm việc
    refreshData();
  }
});
</script>

<template>
  <div class="page-container">
    
    <!-- Toast Notifications -->
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="notif in notifications" :key="notif.id" class="toast" :class="notif.type">
          <span class="toast-msg">{{ notif.message }}</span>
        </div>
      </TransitionGroup>
    </div>

    <!-- Filter Card -->
    <div class="card-section filter-card form-page-animation">
      <div class="filter-card-header">
        <h2 class="card-title">LỊCH LÀM VIỆC CỦA TÔI</h2>
      </div>

      <div class="filter-controls">
        <div class="filter-group-wrapper">
          <div class="filter-group">
            <label class="filter-label">Từ ngày</label>
            <input type="date" class="filter-input" v-model="filters.fromDate" />
          </div>

          <div class="filter-group">
            <label class="filter-label">Đến ngày</label>
            <input type="date" class="filter-input" v-model="filters.toDate" />
          </div>

          <div class="filter-group">
            <label class="filter-label">Trạng thái</label>
            <select class="filter-select" v-model="filters.status">
              <option value="all">Tất cả</option>
              <option :value="2">Đang mở</option>
              <option :value="3">Đang làm</option>
              <option :value="1">Đã đóng</option>
            </select>
          </div>
        </div>

        <div class="right-controls">
          <button class="btn btn-outline hover-effect" @click="exportExcel" style="margin-right: 10px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Xuất Excel
          </button>
          <button class="btn btn-outline hover-effect" @click="resetFilters">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="view-toggle-container">
        <div class="view-toggle">
          <button class="toggle-btn" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
            Bảng
          </button>
          <button class="toggle-btn" :class="{ active: viewMode === 'calendar' }" @click="viewMode = 'calendar'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Lịch
          </button>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table'" class="card-section table-card form-page-animation">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th width="5%" class="text-center">STT</th>
              <th width="15%">Ngày</th>
              <th width="20%">Ca Làm Việc</th>
              <th width="20%">Thời Gian</th>
              <th width="20%">Ghi chú</th>
              <th width="20%" class="text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">Đang tải dữ liệu...</td>
            </tr>
            <tr v-else-if="pagedSchedules.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">Không tìm thấy dữ liệu</td>
            </tr>
            <tr v-else v-for="(item, index) in pagedSchedules" :key="item.id" @click="openDetailPopup(item)" class="cursor-pointer">
              <td class="text-center font-bold text-gray-500">{{ index + 1 }}</td>
              <td><div class="date-badge">{{ item.ngayLamViec }}</div></td>
              <td>
                <span class="shift-badge">{{ item.caLamViec?.tenCa }}</span>
                <div v-if="item.ghiChu" class="small-note">📝 {{ item.ghiChu }}</div>
              </td>
              <td>
                <span class="time-text">
                  {{ formatTime(item.caLamViec?.gioBatDau) }} - {{ formatTime(item.caLamViec?.gioKetThuc) }}
                </span>
              </td>
              <td class="text-muted">{{ item.ghiChu || '--' }}</td>
              <td class="text-center">
                <span class="status-badge" :class="getStatusClass(item.trangThai)">
                  {{ getStatusText(item.trangThai) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-footer" v-if="totalPages > 1">
        <button class="p-btn" :disabled="page === 0" @click="changePage(page - 1)"> < </button>
        <template v-for="p in visiblePages" :key="p">
          <button v-if="p !== '...'" class="p-btn number" :class="{ active: p === (page + 1) }" @click="changePage((p as number) - 1)">{{ p }}</button>
          <span v-else class="dots">...</span>
        </template>
        <button class="p-btn" :disabled="page >= totalPages - 1" @click="changePage(page + 1)"> > </button>
      </div>
    </div>

    <!-- Calendar View -->
    <div v-if="viewMode === 'calendar'" class="card-section calendar-card form-page-animation">
      
      <div class="calendar-header">
        <div class="header-left">
          <div class="month-nav">
            <button class="nav-btn" @click="navigateCalendar(-1)">❮</button>
            <h2 class="current-month">{{ calendarTitle }}</h2>
            <button class="nav-btn" @click="navigateCalendar(1)">❯</button>
          </div>
          <button class="btn-today" @click="goToToday">Hôm nay</button>
          <div class="view-switcher">
            <button class="switch-btn" :class="{ active: calendarView === 'month' }" @click="calendarView = 'month'">Tháng</button>
            <button class="switch-btn" :class="{ active: calendarView === 'week' }" @click="calendarView = 'week'">Tuần</button>
            <button class="switch-btn" :class="{ active: calendarView === 'day' }" @click="calendarView = 'day'">Ngày</button>
          </div>
        </div>

        <div class="legend-mini">
          <div class="legend-item"><span class="dot active"></span> Đang mở</div>
          <div class="legend-item"><span class="dot working"></span> Đang làm</div>
          <div class="legend-item"><span class="dot draft"></span> Đã đóng</div>
        </div>
      </div>

      <!-- Month View -->
      <div v-if="calendarView === 'month'" class="calendar-grid month-view">
        <div class="weekday-header">T2</div>
        <div class="weekday-header">T3</div>
        <div class="weekday-header">T4</div>
        <div class="weekday-header">T5</div>
        <div class="weekday-header">T6</div>
        <div class="weekday-header text-red">T7</div>
        <div class="weekday-header text-red">CN</div>

        <div v-for="(cell, index) in calendarDays" :key="index"
            class="day-cell"
            :class="{
                'empty': !cell.day,
                'today': cell.dateStr === todayDateStr,
                'selected-day': cell.dateStr && ((filters.fromDate && cell.dateStr === filters.fromDate) || (filters.toDate && cell.dateStr === filters.toDate))
            }"
            @click="cell.day && (filters.fromDate = cell.dateStr, filters.toDate = cell.dateStr, refreshData())"
        >
            <div v-if="cell.day">
              <span class="day-number">{{ cell.day }}</span>
            </div>

            <div v-if="cell.day" class="shifts-container">
                <div v-for="sche in getSchedulesForCalendarCell(cell.dateStr)" :key="sche.id" 
                    class="shift-item"
                    :class="{'draft': sche.trangThai === 1, 'working': sche.trangThai === 3}"
                    @click.stop="openDetailPopup(sche)" 
                    :data-tooltip="`${sche.caLamViec?.tenCa} (${formatTime(sche.caLamViec?.gioBatDau)} - ${formatTime(sche.caLamViec?.gioKetThuc)})`"
                >
                    <span class="shift-time">{{ formatTime(sche.caLamViec?.gioBatDau) }}</span>
                    <span class="shift-name">{{ sche.caLamViec?.tenCa }}</span>
                </div>
            </div>
        </div>
      </div>

      <!-- Week/Day View (Scheduler) -->
      <div v-else-if="calendarView === 'week'" class="week-matrix-view">
          <div class="matrix-header">
              <div class="matrix-cell-head shift-col-head">CA / NGÀY</div>
              <div v-for="(cell, index) in calendarDays" :key="index"
                   class="matrix-cell-head"
                   :class="{ 'today': cell.dateStr === todayDateStr }">
                  <div class="day-name">
                      {{ weekDays.find(d => d.val === new Date(cell.dateStr).getDay())?.label }}
                  </div>
                  <div class="day-date">{{ formatDate(cell.dateStr) }}</div>
              </div>
          </div>

          <div class="matrix-body">
              <div v-if="sortedShifts.length === 0" class="text-center py-4 text-muted" style="padding: 20px;">
                  Tuần này bạn không có lịch làm việc nào.
              </div>

              <div v-else v-for="shift in sortedShifts" :key="shift.idCa" class="matrix-row">
                  <div class="matrix-cell shift-info-cell">
                      <div class="shift-name">{{ shift.tenCa }}</div>
                      <div class="shift-time">{{ formatTime(shift.gioBatDau) }} - {{ formatTime(shift.gioKetThuc) }}</div>
                  </div>

                  <div v-for="(cell, index) in calendarDays" :key="index"
                       class="matrix-cell data-cell"
                       :class="{'today-col': cell.dateStr === todayDateStr}">

                      <div v-for="sche in getSchedulesForShiftAndDate(shift.idCa, cell.dateStr)" :key="sche.id"
                           class="emp-card"
                           :class="{'draft': sche.trangThai === 1, 'working': sche.trangThai === 3}"
                           @click.stop="openDetailPopup(sche)">
                          
                          <img :src="sche.nhanVien?.avatar || 'https://ui-avatars.com/api/?name=' + sche.nhanVien?.hoTen + '&background=random'" 
                               class="emp-avatar" 
                               alt="avt" />
                          
                          <div class="emp-details">
                              <div class="emp-name">{{ sche.nhanVien?.hoTen }}</div>
                              <div class="emp-code">{{ sche.nhanVien?.maNv }}</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div v-else class="week-matrix-view">
          <div class="matrix-header" style="grid-template-columns: 200px 1fr;">
              <div class="matrix-cell-head shift-col-head" style="justify-content: center;">CA LÀM VIỆC</div>
              <div class="matrix-cell-head today" style="border-right: none;">
                  <div class="day-name">
                      {{ weekDays.find(d => d.val === new Date(calendarDays[0]?.dateStr).getDay())?.label || 'Ngày' }}
                  </div>
                  <div class="day-date">{{ formatDate(calendarDays[0]?.dateStr) }}</div>
              </div>
          </div>

          <div class="matrix-body">
              <div v-if="sortedShifts.length === 0" class="text-center py-4 text-muted" style="padding: 20px;">
                  Hôm nay bạn không có lịch làm việc nào.
              </div>

              <div v-else v-for="shift in sortedShifts" :key="shift.idCa" class="matrix-row" style="grid-template-columns: 200px 1fr;">
                  
                  <div class="matrix-cell shift-info-cell" style="justify-content: center; align-items: center; text-align: center;">
                      <div class="shift-name" style="font-size: 15px;">{{ shift.tenCa }}</div>
                      <div class="shift-time" style="font-size: 13px; margin-top: 4px;">
                          {{ formatTime(shift.gioBatDau) }} - {{ formatTime(shift.gioKetThuc) }}
                      </div>
                  </div>

                  <div class="matrix-cell data-cell"
                       style="border-right: none; display: flex; flex-direction: column; gap: 16px; padding: 16px !important; position: relative;">

                      <div v-for="sche in getSchedulesForShiftAndDate(shift.idCa, calendarDays[0].dateStr)" :key="sche.id"
                           class="emp-card"
                           :class="{'draft': sche.trangThai === 1, 'working': sche.trangThai === 3}"
                           @click.stop="openDetailPopup(sche)"
                           style="width: 100%; min-height: 100px;"> 
                          
                          <img :src="sche.nhanVien?.avatar || 'https://ui-avatars.com/api/?name=' + sche.nhanVien?.hoTen + '&background=random'" 
                               class="emp-avatar" 
                               alt="avt" />
                          
                          <div class="emp-details">
                              <div class="emp-name">{{ sche.nhanVien?.hoTen }}</div>
                              <div class="emp-code">{{ sche.nhanVien?.maNv }}</div>
                          </div>
                      </div>

                      <div v-if="getSchedulesForShiftAndDate(shift.idCa, calendarDays[0].dateStr).length === 0"
                           style="color: #9ca3af; font-size: 13px; font-style: italic; width: 100%; display: flex; align-items: center; justify-content: center; min-height: 80px;">
                          Trống (Không có phân công)
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>

    <!-- Detail Popup -->
    <div v-if="showDetailPopup && selectedSchedule" class="modal-backdrop z-highest" @click.self="closeDetailPopup">
      <div class="modal-box detail-box form-page-animation">
         
        <div class="detail-header">
            <h3 class="modal-title">CHI TIẾT CA</h3>
            <div class="right-actions">
              <button class="icon-btn close" @click="closeDetailPopup" title="Đóng">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
        </div>

        <div class="detail-body">
            <div class="detail-row">
                <span class="color-dot"></span>
                <h2 class="detail-title">{{ selectedSchedule.caLamViec?.tenCa }}</h2>
            </div>

            <div class="detail-row info">
                <div class="icon">🕒</div>
                <div class="content">
                    <div class="main-text">
                      {{ formatDate(selectedSchedule.ngayLamViec) }}
                    </div>
                    <div class="sub-text">
                      {{ formatTime(selectedSchedule.caLamViec?.gioBatDau) }} - {{ formatTime(selectedSchedule.caLamViec?.gioKetThuc) }}
                    </div>
                </div>
            </div>

            <div class="detail-row info" v-if="selectedSchedule.ghiChu">
                <div class="icon">📝</div>
                <div class="content">
                    <div class="main-text">{{ selectedSchedule.ghiChu }}</div>
                </div>
            </div>

            <div class="detail-row info">
                <div class="icon">🚩</div>
                <div class="content">
                    <span class="status-tag" :class="{ 'active': selectedSchedule.trangThai === 2, 'draft': selectedSchedule.trangThai === 1, 'working': selectedSchedule.trangThai === 3 }">
                      {{ selectedSchedule.trangThai === 2 ? 'Đang mở' : (selectedSchedule.trangThai === 3 ? 'Đang làm' : 'Đã đóng') }}
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* =========================================
   1. GLOBAL VARIABLES & ANIMATIONS
   ========================================= */
.page-container {
  --primary-brown: #63391f;
  --primary-light: #fdf8f6;
  --text-main: #484848;
  --border-color: #e0e0e0;
  --success-green: #27ae60;
  --danger-red: #e74c3c;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 5px 15px rgba(0, 0, 0, 0.08);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-page-animation {
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* =========================================
   2. LAYOUT & CARDS
   ========================================= */
.card-section {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
  overflow: hidden;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.card-section:hover {
  box-shadow: var(--shadow-md);
}

.filter-card {
  padding: 24px;
}
.table-card {
  padding: 10px;
}

.filter-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.card-title {
  font-size: 24px;
  font-weight: bold;
  color: #63391f;
  margin: 0;
}

/* =========================================
   FILTER CONTROLS
   ========================================= */
.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 10px;
}

.filter-group-wrapper {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  margin-left: 2px;
}

.filter-input,
.filter-select {
  height: 44px;
  min-width: 160px;
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
  padding: 0 14px;
  outline: none;
  background-color: #fff;
  transition: all 0.2s;
  color: #374151;
}

.filter-input {
  cursor: pointer;
}

.filter-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.4);
}

.filter-input::-webkit-calendar-picker-indicator:hover {
  filter: invert(0.2);
}

.filter-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 20px;
  padding-right: 40px;
}

.filter-input:focus,
.filter-select:focus {
  border-color: #63391f;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.15);
}

.filter-input:hover,
.filter-select:hover {
  border-color: #d1d5db;
}

.right-controls {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.btn-filter {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: #fff;
  border: none;
}

.btn-filter:hover {
  background: linear-gradient(135deg, #5a3420, #b8895d);
  box-shadow: 0 4px 10px rgba(78, 44, 23, 0.3);
}

/* =========================================
   VIEW TOGGLE
   ========================================= */
.view-toggle-container {
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.view-toggle {
  background: #f3f4f6;
  padding: 4px;
  border-radius: 10px;
  display: inline-flex;
  gap: 4px;
}

.toggle-btn {
  border: none;
  background: transparent;
  padding: 8px 20px;
  font-weight: 600;
  font-size: 14px;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-btn:hover:not(.active) {
  background: #e5e7eb;
}

/* =========================================
   BUTTONS
   ========================================= */
.btn {
  height: 42px;
  padding: 0 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  white-space: nowrap;
}

.btn-outline {
  background-color: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  border-color: #63391f;
  color: #63391f;
  background-color: #fdf8f6;
}

.hover-effect:active {
  transform: scale(0.96);
}

/* =========================================
   TABLE STYLES
   ========================================= */
.table-container {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 800px;
  table-layout: fixed;
}

.custom-table th {
  font-weight: 700;
  padding: 16px 12px;
  text-align: left;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #edf2f7;
  color: #000000;
  background: transparent;
}

.custom-table td {
  padding: 14px 12px;
  font-size: 15px;
  color: #000000;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}

.custom-table tbody tr:hover td {
  background-color: var(--primary-light);
}

.text-center {
  text-align: center !important;
}

.date-badge {
  font-weight: 600;
  color: #000000;
  font-size: 15px;
}

.shift-badge {
  background: #e0e7ff;
  color: #000000;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  display: inline-block;
}

.small-note {
  font-size: 11px;
  color: #000000;
  margin-top: 4px;
  font-style: italic;
}

.time-text {
  font-family: monospace;
  font-weight: 500;
  color: #000000;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
  min-width: 90px;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #22c55e;
}

.status-badge.inactive {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #ef4444;
}

.status-badge.in-progress {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: white;
  border: none;
}


.cursor-pointer {
  cursor: pointer;
}

/* =========================================
   PAGINATION
   ========================================= */
.pagination-footer {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
}

.p-btn {
  min-width: 38px;
  height: 38px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  color: #374151;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.p-btn.active {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  border-color: #6b3f23;
  color: #fff;
  box-shadow: 0 4px 6px rgba(99, 57, 31, 0.2);
}

.p-btn:hover:not(.active):not(:disabled) {
  border-color: var(--primary-brown);
  color: var(--primary-brown);
}

.p-btn:disabled {
  background: #f9f9f9;
  color: #ccc;
  border-color: #eee;
  cursor: not-allowed;
}

.dots {
  color: #999;
  padding: 0 5px;
  font-weight: bold;
}

/* =========================================
   CALENDAR STYLES
   ========================================= */
.calendar-card { 
  min-height: auto; 
  display: flex; 
  flex-direction: column; 
  padding: 10px; 
}
.calendar-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 16px; 
  padding: 16px 10px 0; 
  flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.month-nav { display: flex; align-items: center; gap: 8px; }
.current-month { color: #63391F; font-size: 18px; font-weight: 800; margin: 0; min-width: 160px; text-align: center; }
.nav-btn { background: #f3f4f6; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-weight: bold; color: #555; }
.nav-btn:hover { background: linear-gradient(135deg, #6b3f23, #c89b6d); color: white; }
.btn-today { background: white; border: 1px solid #d1d5db; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; color: #555; transition: all 0.2s; }
.btn-today:hover { background: linear-gradient(135deg, #6b3f23, #c89b6d); color: white; border-color: #6b3f23; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; flex: 1; }
.weekday-header { background: #f9fafb; padding: 10px; text-align: center; font-weight: 700; color: #374151; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; font-size: 13px; position: sticky; top: 0; z-index: 10; }
.weekday-header:last-child { border-right: none; }
.text-red { color: #dc2626; }
.day-cell { min-height: 80px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 6px; position: relative; background: white; cursor: pointer; display: flex; flex-direction: column; }
.day-cell:nth-child(7n) { border-right: none; }
.day-cell.empty { background: #fcfcfc; }
.day-cell.today { background: #fff8f5; }
.day-cell.selected-day { box-shadow: inset 0 0 0 2px #63391F; }
.day-number { font-weight: 700; font-size: 13px; color: #374151; margin-bottom: 6px; flex-shrink: 0; }
.today .day-number { color: #63391F; text-decoration: underline; }
.shifts-container { display: flex; flex-direction: column; gap: 3px; overflow-y: auto; max-height: 60px; }
.shift-item { background: #dcfce7; color: #166534; border-left: 3px solid #22c55e; cursor: pointer; position: relative; flex-shrink: 0; font-size: 10px; padding: 2px 4px; }
.shift-item.draft { background: #fee2e2; color: #dc2626; border-left-color: #ef4444; }
.shift-item.working { background: linear-gradient(135deg, #6b3f23, #c89b6d); color: white; border-left-color: #8B5A2B; }
.shift-time { font-weight: 700; margin-right: 4px; }
.shift-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.legend-mini { display: flex; gap: 15px; font-size: 12px; color: #555; padding-right: 10px; }
.legend-item { display: flex; align-items: center; gap: 5px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.active { background: #22c55e; }
.dot.working { background: linear-gradient(135deg, #6b3f23, #c89b6d); }
.dot.draft { background: #ef4444; }

/* TOOLTIP */
[data-tooltip] { position: relative; }
[data-tooltip]::before {
  content: attr(data-tooltip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(-5px);
  background: #333; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; white-space: nowrap;
  opacity: 0; visibility: hidden; transition: 0.2s; pointer-events: none; z-index: 100;
}
[data-tooltip]:hover::before { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(-10px); }

/* =========================================
   VIEW SWITCHER
   ========================================= */
.view-switcher {
  display: flex;
  background: #f3f4f6;
  padding: 3px;
  border-radius: 8px;
  gap: 2px;
}

.switch-btn {
  border: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: 0.2s;
}

.switch-btn.active {
  background: white;
  color: #63391F;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.switch-btn:hover:not(.active) {
  background: #e5e7eb;
}

/* ==================================
   SỬA CHỮ LỊCH THÁNG (Ép mảnh lại)
   ================================== */
.shift-time { 
  font-weight: normal !important; 
  font-size: 11px; 
}
.shift-name { 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
  font-weight: normal !important; 
  font-size: 11px; 
}

/* =========================================
   GIAO DIỆN LỊCH DẠNG TUẦN (FIX LỆCH CỘT VÀ TRÀN Ô)
   ========================================= */
.week-matrix-view,
.week-matrix-view * {
  box-sizing: border-box; 
}

.week-matrix-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  overflow: auto;
  max-height: 600px;
}

.matrix-header, .matrix-row {
  display: grid;
  grid-template-columns: 140px repeat(7, minmax(130px, 1fr)); 
  width: 100%;
}

.matrix-header {
  background: #f9fafb !important;
  color: #374151 !important;
  border-bottom: 2px solid #edf2f7;
  position: sticky;
  top: 0;
  z-index: 20;
}

.matrix-row {
  border-bottom: 1px solid #e5e7eb;
}
.matrix-row:last-child { border-bottom: none; }

.matrix-cell-head, .matrix-cell {
  min-width: 0; 
  overflow: hidden; 
}

.matrix-cell-head {
  padding: 12px 8px; 
  text-align: center;
  border-right: 1px solid #e5e7eb !important;
  color: #374151 !important;
}
.matrix-cell-head:last-child { border-right: none; }

.matrix-cell-head.shift-col-head {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 16px;
  color: #000000 !important;
  font-weight: 700 !important;
  font-size: 13px;
}

.day-name { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
.day-date { font-size: 12px; opacity: 0.8; }

.matrix-cell-head.today { background: #fff8f5 !important; } 
.matrix-cell-head.today .day-name, 
.matrix-cell-head.today .day-date { color: #63391F !important; }

.matrix-cell {
  border-right: 1px solid #e5e7eb;
  min-height: 120px; 
}
.matrix-cell:last-child { border-right: none; }

.shift-info-cell {
  background: #fcfcfc;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 16px;
}
.shift-name { font-weight: 700; color: #1e293b; font-size: 13px; margin-bottom: 4px; }
.shift-time { font-size: 12px; color: #6b7280; }

.data-cell {
  display: flex;
  flex-direction: column;
  gap: 10px; 
  cursor: pointer;
  transition: background 0.2s;
  padding: 12px !important; 
  vertical-align: top;
}
.data-cell:hover { background: #f8fafc; }
.data-cell.today-col { background: #fafaf9; } 

/* =========================================
   THẺ NHÂN VIÊN
   ========================================= */
.emp-card {
  display: flex;
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
  
  background: #ffffff !important; 
  border: 1px solid #e5e7eb !important; 
  border-left: 4px solid #22c55e !important; 
  border-radius: 8px !important; 
  
  padding: 10px 8px !important;
  width: 100%;
  min-width: 0; 
  box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important; 
  transition: all 0.2s;
}

.emp-card:hover {
  transform: translateY(-2px) !important; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
}

.emp-card.working { border-left-color: #f59e0b !important; }
.emp-card.draft { border-left-color: #ef4444 !important; }

.emp-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e5e7eb;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.emp-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  min-width: 0; 
  overflow: hidden;
}

.emp-name {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; 
  width: 100%;
  display: block;
}

.emp-code {
  font-size: 10px;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  display: block;
}
/* =========================================
   MODAL
   ========================================= */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(2px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.modal-box { background: white; width: 500px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }

/* TOAST */
.toast-container { position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
.toast { pointer-events: auto; min-width: 250px; max-width: 350px; padding: 12px 16px; border-radius: 4px; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); background: #fff; animation: slideInRight 0.3s forwards; }
.toast.success { background-color: #f0f9eb; border-left: 5px solid #67c23a; color: #67c23a; }
.toast.error { background-color: #fef0f0; border-left: 5px solid #f56c6c; color: #f56c6c; }
.toast.warning { background-color: #fdf6ec; border-left: 5px solid #e6a23c; color: #e6a23c; }
.toast-msg { color: #333; }
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

/* =========================================
   DETAIL POPUP STYLES
   ========================================= */
.z-highest { z-index: 2000; }
.detail-box {
  width: 400px;
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #dadce0;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  text-transform: uppercase;
}

.right-actions { display: flex; gap: 4px; }

.icon-btn {
  background: transparent; border: none;
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #5f6368; transition: 0.2s;
}
.icon-btn:hover { background-color: #e8eaed; color: #202124; }
.icon-btn.close:hover { background-color: #fce8e6; color: #d93025; }

.detail-body { padding: 20px 24px 24px; }

.detail-row { display: flex; align-items: flex-start; margin-bottom: 16px; gap: 16px; }
.detail-row.info { align-items: center; }

.color-dot {
  width: 14px; height: 14px; background-color: #039be5;
  border-radius: 4px; margin-top: 6px;
}

.detail-title {
  margin: 0; font-size: 20px; font-weight: 400; color: #3c4043;
  line-height: 1.4; flex: 1;
}

.detail-row .icon {
  width: 20px; text-align: center; font-size: 18px; color: #5f6368;
}

.detail-row .content { flex: 1; }

.main-text { font-size: 14px; color: #3c4043; font-weight: 500; }
.sub-text { font-size: 12px; color: #70757a; margin-top: 2px; }

.status-tag {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 12px; font-weight: 600;
}
.status-tag.active { background: #e6f4ea; color: #137333; }
.status-tag.draft { background: #fef7e0; color: #b06000; }
.status-tag.working { background: linear-gradient(135deg, #6b3f23, #c89b6d); color: white; }
/* Gradient for trạng thái Đang làm (không có animation) */
.status-badge.in-progress, 
.event-pill.in-progress, 
.color-dot.in-progress {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: white;
  border: none;
}
</style>
