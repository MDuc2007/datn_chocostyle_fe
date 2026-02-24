<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- 1. INTERFACES ---
interface Employee { id: number; maNv: string; hoTen: string; chucVu?: string; trangThai: number; }
interface Shift { idCa: number; tenCa: string; gioBatDau: string; gioKetThuc: string; trangThai: number; }
interface Schedule { id: number; ngayLamViec: string; nhanVien: Employee; caLamViec: Shift; ghiChu?: string; trangThai: number; maLapLai?: string; }
// 1. Thêm avatar vào Employee interface
interface Employee { id: number; maNv: string; hoTen: string; chucVu?: string; trangThai: number; avatar?: string; }

// ... (Giữ nguyên code cũ) ...

// 2. Thêm computed property để sắp xếp ca làm việc theo giờ bắt đầu
const sortedShifts = computed(() => {
  return [...shifts.value].sort((a, b) => timeToMinutes(a.gioBatDau) - timeToMinutes(b.gioBatDau));
});

// 3. Thêm hàm lọc lịch làm việc theo Ngày và ID Ca
const getSchedulesForShiftAndDate = (idCa: number, dateStr: string) => {
  if (!dateStr || !idCa) return [];
  return schedules.value.filter(s => {
    if (s.ngayLamViec !== dateStr || s.caLamViec?.idCa !== idCa) return false;
    // Áp dụng bộ lọc tìm kiếm
    const searchName = filters.employeeName.toLowerCase();
    const matchEmpName = !filters.employeeName || (s.nhanVien?.hoTen?.toLowerCase().includes(searchName) || s.nhanVien?.maNv?.toLowerCase().includes(searchName));
    const matchStatus = filters.status === 'all' || s.trangThai === filters.status;
    return matchEmpName && matchStatus;
  });
};

// 4. Thêm hàm mở Modal và tự động chọn sẵn Ngày + Ca khi click vào ô trống
const openAddModalWithDateAndShift = (dateStr: string, idCa: number) => {
  openAddModalWithDate(dateStr);
  form.idCa = idCa; // Gán sẵn ca làm việc
};
// API Endpoints
const API_URL = 'http://localhost:8080/api/lich-lam-viec';
const API_EMP = 'http://localhost:8080/api/nhan-vien';
const API_SHIFT = 'http://localhost:8080/api/ca-lam-viec';

// --- 2. STATE ---
const schedules = ref<Schedule[]>([]); // Dữ liệu FULL dùng cho Lịch & Validate
const pagedSchedules = ref<Schedule[]>([]); // Dữ liệu phân trang dùng cho BẢNG
const employees = ref<Employee[]>([]);
const shifts = ref<Shift[]>([]);

const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);

// VIEW MODE: 'table' hoặc 'calendar'
const viewMode = ref<'table' | 'calendar'>('table');

// Calendar State
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const calendarView = ref<'month' | 'week' | 'day'>('month'); 
const currentDate = ref(new Date()); 

// Filter State
const filters = reactive({
  date: '',
  employeeName: '',
  shiftName: '',    
  status: 'all' as string | number
});

// Pagination State (Sử dụng API)
const perPage = ref(8);
const page = ref(0);
const totalPages = ref(0);

// Form Data & Errors
const form = reactive({
  id: null as number | null,
  ngayLamViec: getTodayStr(),
  idNhanVien: '' as string | number,
  idCa: '' as string | number,
  ghiChu: '',
  trangThai: 2
});

const errors = reactive({ ngayLamViec: '', idNhanVien: '', idCa: '' });

// Lặp lại State (Repeat)
const showRepeatModal = ref(false);
const repeatConfig = reactive({
  frequency: 'weekly',
  interval: 1,         
  daysOfWeek: [] as number[],
  endDate: '',         
});
const weekDays = [ { val: 1, label: 'T2' }, { val: 2, label: 'T3' }, { val: 3, label: 'T4' }, { val: 4, label: 'T5' }, { val: 5, label: 'T6' }, { val: 6, label: 'T7' }, { val: 0, label: 'CN' } ];

// Mở rộng State khác
const contextMenu = reactive({ visible: false, x: 0, y: 0, item: null as Schedule | null });
const selectedSchedule = ref<Schedule | null>(null);
const showDetailPopup = ref(false);
const showUpdateOptionModal = ref(false);
const updateOption = ref('one');
const showDeleteOptionModal = ref(false);
const deleteOption = ref('one');
const notifications = ref<{ id: number; message: string; type: string }[]>([]);
const confirmDialog = ref({ show: false, title: 'Xác nhận', message: '', resolve: null as ((value: boolean) => void) | null });
const originalForm = ref<any>(null);

// --- 3. HELPER FUNCTIONS ---
function getTodayStr() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
const formatTime = (time: string) => time ? time.substring(0, 5) : '--:--';
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};
const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};
const clearErrors = () => { errors.ngayLamViec = ''; errors.idNhanVien = ''; errors.idCa = ''; };
const resetRepeatConfig = () => {
  repeatConfig.frequency = 'weekly'; repeatConfig.interval = 1; repeatConfig.daysOfWeek = [];
  const d = new Date(); d.setMonth(d.getMonth() + 1);
  repeatConfig.endDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
  const id = Date.now();
  notifications.value.push({ id, message, type });
  setTimeout(() => notifications.value = notifications.value.filter(n => n.id !== id), 3000);
};

const showConfirmDialog = (message: string, title: string = 'Xác nhận'): Promise<boolean> => {
  return new Promise((resolve) => {
    confirmDialog.value.title = title; confirmDialog.value.message = message;
    confirmDialog.value.resolve = resolve; confirmDialog.value.show = true;
  });
};
const handleConfirm = (result: boolean) => {
  if (confirmDialog.value.resolve) confirmDialog.value.resolve(result);
  confirmDialog.value.show = false; confirmDialog.value.message = ''; confirmDialog.value.resolve = null;
};

// --- 4. DATA FETCHING (API GỌI THEO VIEW) ---

// Lấy Data cho Bảng (Gọi API /search có phân trang)
const fetchTableData = async () => {
  try {
    const params: any = {
      keyword: filters.employeeName,
      page: page.value,
      size: perPage.value
    };
    if (filters.status !== 'all') params.trangThai = filters.status;
    if (filters.date) { params.fromDate = filters.date; params.toDate = filters.date; }

    const res = await axios.get(`${API_URL}/search`, { params });
    pagedSchedules.value = res.data.content;
    totalPages.value = res.data.totalPages;
  } catch (error) {
    showToast('Lỗi tải dữ liệu bảng', 'error');
  }
};

// Hàm Fetch tổng để điều phối (Gọi lại mỗi khi thêm/sửa/xóa)
const refreshData = async () => {
  loading.value = true;
  try {
    // 1. Luôn tải FULL lịch để phục vụ Validate trùng giờ và view Lịch
    const resAll = await axios.get(API_URL);
    schedules.value = resAll.data;

    // 2. Tải thêm Data phân trang nếu đang ở mode Bảng
    if (viewMode.value === 'table') {
      await fetchTableData();
    }
  } catch (error) {
    showToast('Lỗi kết nối máy chủ', 'error');
  } finally {
    loading.value = false;
  }
};

// Hàm tải lần đầu tiên lúc mở web
const fetchInitialData = async () => {
  loading.value = true;
  try {
    const [resEmp, resShift] = await Promise.all([ axios.get(API_EMP), axios.get(API_SHIFT) ]);
    employees.value = resEmp.data.filter((e: any) => e.trangThai === 1);
    shifts.value = resShift.data.filter((s: any) => s.trangThai === 1);
    await refreshData();
  } catch (error) {
    showToast('Lỗi tải danh mục ban đầu', 'error');
  } finally {
    loading.value = false;
  }
};

// --- 5. WATCHERS ĐỂ LỌC VÀ CHUYỂN TRANG ---

watch(viewMode, () => {
  refreshData();
});

watch([() => filters.employeeName, () => filters.date, () => filters.status], () => {
  page.value = 0; // Reset trang khi đổi filter
  if (filters.date) {
    const d = new Date(filters.date);
    currentMonth.value = d.getMonth(); currentYear.value = d.getFullYear();
  }
  refreshData();
});

watch(page, () => {
  if (viewMode.value === 'table') fetchTableData();
});

// --- 6. LOGIC LƯU TRỮ, VALIDATE (Giữ nguyên) ---
const hasFormChanged = computed(() => {
  if (!originalForm.value || !isEditing.value) return false;
  return ( form.ngayLamViec !== originalForm.value.ngayLamViec || String(form.idNhanVien) !== String(originalForm.value.idNhanVien) || String(form.idCa) !== String(originalForm.value.idCa) || form.ghiChu !== originalForm.value.ghiChu || form.trangThai !== originalForm.value.trangThai );
});
const isRepeatEnabled = computed(() => {
  if (repeatConfig.frequency === 'daily') return true;
  if (repeatConfig.frequency === 'weekly' && repeatConfig.daysOfWeek.length > 0) return true;
  return false;
});

const validateForm = () => {
  clearErrors(); let isValid = true;
  if (!form.ngayLamViec) { errors.ngayLamViec = 'Vui lòng chọn ngày'; isValid = false; }
  if (!form.idNhanVien) { errors.idNhanVien = 'Vui lòng chọn nhân viên'; isValid = false; }
  if (!form.idCa) { errors.idCa = 'Vui lòng chọn ca làm việc'; isValid = false; }
  if (!isValid) return false;

  const today = getTodayStr();
  if (!isEditing.value && form.ngayLamViec < today) { errors.ngayLamViec = 'Không thể phân lịch cho ngày đã qua'; isValid = false; }

  const selectedShift = shifts.value.find(s => s.idCa === Number(form.idCa));
  if (selectedShift) {
    const newStart = timeToMinutes(selectedShift.gioBatDau);
    const newEnd = timeToMinutes(selectedShift.gioKetThuc);
    const hasConflict = schedules.value.some(s => {
      if (isEditing.value && s.id === form.id) return false;
      const isSameDay = s.ngayLamViec === form.ngayLamViec;
      const sIdNv = s.nhanVien?.id || (s.nhanVien as any)?.idNv;
      if (isSameDay && Number(sIdNv) === Number(form.idNhanVien)) {
        const existingStart = timeToMinutes(s.caLamViec.gioBatDau);
        const existingEnd = timeToMinutes(s.caLamViec.gioKetThuc);
        return (newStart < existingEnd) && (newEnd > existingStart);
      }
      return false;
    });
    if (hasConflict) { errors.idCa = 'Nhân viên này đã có ca làm việc bị trùng giờ trong ngày!'; isValid = false; }
  }
  return isValid;
};

const generateDates = () => {
  const dates: string[] = []; const start = new Date(form.ngayLamViec); const end = new Date(repeatConfig.endDate);
  if (start > end) return [];
  const current = new Date(start);
  if (repeatConfig.frequency === 'daily') {
    while (current <= end) {
      dates.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`);
      current.setDate(current.getDate() + repeatConfig.interval);
    }
  } else if (repeatConfig.frequency === 'weekly') {
    const targetDays = repeatConfig.daysOfWeek.length > 0 ? repeatConfig.daysOfWeek : [start.getDay()];
    while (current <= end) {
      if (targetDays.includes(current.getDay())) { dates.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`); }
      current.setDate(current.getDate() + 1);
    }
  }
  return dates;
};

const handleSave = async () => {
  if (!validateForm()) return;
  if (isEditing.value && form.id) {
      const originalItem = schedules.value.find(s => s.id === form.id);
      if (originalItem && originalItem.maLapLai) {
          updateOption.value = 'one'; showUpdateOptionModal.value = true; return; 
      }
      const confirmMsg = `Bạn có chắc chắn muốn cập nhật lịch làm việc?`;
      if(!await showConfirmDialog(confirmMsg)) return;

      try {
        await axios.put(`${API_URL}/${form.id}`, { ...form, idNhanVien: Number(form.idNhanVien), idCa: Number(form.idCa) });
        showToast('Cập nhật thành công', 'success'); originalForm.value = null; closeModal(); refreshData();
      } catch (e: any) { showToast(e.response?.data?.message || 'Lỗi', 'error'); }
      return;
  }

  try {
    if (isRepeatEnabled.value) {
        const dates = generateDates();
        if (dates.length === 0) { showToast('Không có ngày nào được chọn', 'warning'); return; }
        const confirmMsg = `Bạn có chắc chắn muốn tạo ${dates.length} lịch làm việc?`;
        if (!await showConfirmDialog(confirmMsg)) return;
        const payloads = dates.map(date => ({ ngayLamViec: date, idNhanVien: Number(form.idNhanVien), idCa: Number(form.idCa), ghiChu: form.ghiChu, trangThai: form.trangThai }));
        await axios.post(`${API_URL}/batch`, payloads);
        showToast(`Đã tạo thành công ${dates.length} lịch`, 'success');
    } else {
        // Thêm xác nhận trước khi lưu lịch mới
        const confirmMsg = `Bạn có chắc chắn muốn phân lịch cho nhân viên này?`;
        if (!await showConfirmDialog(confirmMsg)) return;
        
        await axios.post(API_URL, { ngayLamViec: form.ngayLamViec, idNhanVien: Number(form.idNhanVien), idCa: Number(form.idCa), ghiChu: form.ghiChu, trangThai: form.trangThai });
        showToast('Phân lịch thành công', 'success');
    }
    originalForm.value = null; closeModal(); refreshData();
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Có lỗi xảy ra';
    if(msg.toLowerCase().includes('trùng') || msg.toLowerCase().includes('đã có nhân viên')) { errors.idCa = msg; } 
    else { showToast(msg, 'error'); }
  }
};

const confirmUpdateSeries = async () => {
  const originalItem = schedules.value.find(s => s.id === form.id);
  if (!originalItem || !originalItem.maLapLai) return;
  try {
     const payload = { ngayLamViec: form.ngayLamViec, ghiChu: form.ghiChu, trangThai: form.trangThai, idNhanVien: Number(form.idNhanVien), idCa: Number(form.idCa) };
     if (updateOption.value === 'one') { await axios.put(`${API_URL}/${form.id}`, payload); showToast('Đã cập nhật', 'success'); } 
     else { await axios.put(`${API_URL}/series/${originalItem.maLapLai}`, payload); showToast('Đã cập nhật chuỗi', 'success'); }
     showUpdateOptionModal.value = false; originalForm.value = null; closeModal(); refreshData();
  } catch (error: any) { showToast(error.response?.data?.message || 'Lỗi', 'error'); }
};

const handleDelete = async (item: Schedule) => {
  const today = getTodayStr();
  if (item.ngayLamViec < today) { showToast('Không thể xóa lịch đã qua!', 'error'); return; }
        const confirmMsg = `Bạn có chắc chắn muốn xóa lịch làm việc?`;
  if(!await showConfirmDialog(confirmMsg)) return;
  try {
    await axios.delete(`${API_URL}/${item.id}`);
    showToast('Đã xóa', 'success'); refreshData();
  } catch (error: any) { showToast(error.response?.data?.message || 'Lỗi khi xóa', 'error'); }
};

const handleRightClickDelete = (itemOverride?: Schedule) => {
  closeContextMenu(); const item = itemOverride || contextMenu.item; if (!item) return;
  const today = getTodayStr(); if (item.ngayLamViec < today) { showToast('Không thể xóa lịch quá khứ!', 'error'); return; }
  if (item.maLapLai) { contextMenu.item = item; deleteOption.value = 'one'; showDeleteOptionModal.value = true; } 
  else { handleDelete(item); }
};

const confirmDeleteSeries = async () => {
  if (!contextMenu.item) return;
  try {
    if (deleteOption.value === 'one') { await axios.delete(`${API_URL}/${contextMenu.item.id}`); showToast('Đã xóa', 'success'); } 
    else { await axios.delete(`${API_URL}/series/${contextMenu.item.maLapLai}`); showToast('Đã xóa chuỗi', 'success'); }
    refreshData();
  } catch (error: any) { showToast(error.response?.data?.message || 'Lỗi', 'error'); } 
  finally { showDeleteOptionModal.value = false; }
};

// --- CÁC HÀM UI ---
const resetFilters = () => { filters.date = ''; filters.employeeName = ''; filters.shiftName = ''; filters.status = 'all'; page.value = 0; };
const changePage = (newPage: number) => { if (newPage < 0 || newPage >= totalPages.value) return; page.value = newPage; };

const visiblePages = computed(() => {
  const total = totalPages.value; const current = page.value + 1; const delta = 2; const range: number[] = []; const rangeWithDots: (number | string)[] = []; let l: number | undefined;
  for (let i = 1; i <= total; i++) { if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) { range.push(i); } }
  range.forEach(i => { if (l) { if (i - l === 2) { rangeWithDots.push(l + 1); } else if (i - l !== 1) { rangeWithDots.push('...'); } } rangeWithDots.push(i); l = i; });
  return rangeWithDots;
});
// --- HELPER TRẠNG THÁI ---
const getStatusText = (status: number) => {
  if (status === 3) return 'Đang làm';
  if (status === 2) return 'Đang mở';
  return 'Đã đóng';
};

const getStatusClass = (status: number) => {
  if (status === 3) return 'in-progress'; // Trạng thái mới có animation
  if (status === 2) return 'active';
  return 'inactive';
};
const exportExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lịch làm việc');

  // Kiểm tra xem có đang ở chế độ Lịch Tuần không
  const isWeekView = viewMode.value === 'calendar' && calendarView.value === 'week';

  if (isWeekView) {
    // ==============================================================
    // 1. XUẤT EXCEL DẠNG MA TRẬN (DÀNH CHO LỊCH TUẦN)
    // ==============================================================
    
    // Tạo cấu trúc cột: Cột đầu là Ca, các cột sau là các Ngày trong tuần
    const columns = [
      { header: 'CA / NGÀY', key: 'shift', width: 25 },
      ...calendarDays.value.map(day => {
        const dayLabel = weekDays.find(d => d.val === new Date(day.dateStr).getDay())?.label || '';
        const dateLabel = formatDate(day.dateStr);
        return { header: `${dayLabel}\n${dateLabel}`, key: day.dateStr, width: 25 };
      })
    ];
    worksheet.columns = columns;

    // Chèn Tiêu đề ở Dòng 1
    worksheet.insertRow(1, ['BẢNG PHÂN CA LÀM VIỆC TUẦN']);
    // Merge ô tiêu đề (Từ cột A đến cột cuối cùng của tuần)
    const lastColChar = String.fromCharCode(65 + calendarDays.value.length);
    worksheet.mergeCells(`A1:${lastColChar}1`);
    
    const titleCell = worksheet.getCell('A1');
    titleCell.font = { size: 16, bold: true, color: { argb: 'FF63391F' } }; // Chữ nâu
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Format Dòng Header (Dòng 2: Ca / Ngày)
    worksheet.getRow(2).height = 40;
    worksheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FF374151' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }; // Nền xám nhạt
      cell.border = { 
        top: {style:'thin'}, left: {style:'thin'}, 
        bottom: {style:'thin'}, right: {style:'thin'} 
      };
    });

    // Điền dữ liệu các Ca làm việc
    sortedShifts.value.forEach(shift => {
      // Cột đầu tiên: Tên ca và Giờ
      const rowData: Record<string, string> = {
      shift: `${shift.tenCa}\n(${formatTime(shift.gioBatDau)} - ${formatTime(shift.gioKetThuc)})`
      };

      // Các cột tiếp theo: Tìm nhân viên làm trong ngày đó, ca đó
      calendarDays.value.forEach(day => {
        // Tận dụng luôn hàm có sẵn bộ lọc bạn vừa làm
        const employeesInShift = getSchedulesForShiftAndDate(shift.idCa, day.dateStr);
        
        if (employeesInShift.length > 0) {
          // Nối tên các nhân viên bằng dấu xuống dòng (\n)
          rowData[day.dateStr] = employeesInShift.map(s => `- ${s.nhanVien?.hoTen} (${s.nhanVien?.maNv})`).join('\n\n');
        } else {
          rowData[day.dateStr] = ''; // Ô trống nếu không có ai làm
        }
      });

      // Thêm dòng vào Excel
      const addedRow = worksheet.addRow(rowData);
      
      // Format cho dòng nội dung (Tự động giãn chiều cao để hiển thị hết tên)
      addedRow.eachCell(cell => {
        cell.alignment = { vertical: 'top', wrapText: true }; // wrapText giúp \n xuống dòng được trong Excel
        cell.border = { 
          top: {style:'thin'}, left: {style:'thin'}, 
          bottom: {style:'thin'}, right: {style:'thin'} 
        };
      });
    });

  } else {
    // ==============================================================
    // 2. XUẤT EXCEL DẠNG DANH SÁCH (NHƯ CŨ DÀNH CHO BẢNG)
    // ==============================================================
    worksheet.columns = [
      { key: 'stt', width: 10 }, { key: 'ngayLamViec', width: 15 }, { key: 'maNv', width: 15 }, 
      { key: 'hoTen', width: 30 }, { key: 'tenCa', width: 20 }, { key: 'gioBatDau', width: 12 }, 
      { key: 'gioKetThuc', width: 12 }, { key: 'ghiChu', width: 30 }, { key: 'trangThai', width: 15 }
    ];
    worksheet.mergeCells('A1:I1'); 
    worksheet.getCell('A1').value = 'DANH SÁCH LỊCH LÀM VIỆC';
    worksheet.addRow([]);
    worksheet.addRow(['STT', 'Ngày', 'Mã NV', 'Họ và tên', 'Ca', 'Bắt đầu', 'Kết thúc', 'Ghi chú', 'Trạng thái']);
    
    // Format Header của bảng
    worksheet.getRow(3).font = { bold: true };
    worksheet.getRow(3).alignment = { horizontal: 'center' };

    const dataToExport = viewMode.value === 'table' ? pagedSchedules.value : schedules.value;

    dataToExport.forEach((sche, index) => {
      worksheet.addRow([ 
        index + 1, sche.ngayLamViec, sche.nhanVien?.maNv, sche.nhanVien?.hoTen, 
        sche.caLamViec?.tenCa, formatTime(sche.caLamViec?.gioBatDau), 
        formatTime(sche.caLamViec?.gioKetThuc), sche.ghiChu || '', getStatusText(sche.trangThai) 
      ]);
    });
  }

  // Ghi ra file
  const buffer = await workbook.xlsx.writeBuffer(); 
  saveAs(new Blob([buffer]), `LichLamViec_${Date.now()}.xlsx`);
};

// ... Các logic mở/đóng Modal, context menu, lấy list Calendar (Giữ nguyên)
const openAddModalWithDate = (dateStr: string) => { isEditing.value = false; form.id = null; form.idNhanVien = ''; form.idCa = ''; form.ghiChu = ''; form.trangThai = 2; form.ngayLamViec = dateStr; resetRepeatConfig(); showRepeatModal.value = false; showModal.value = true; clearErrors(); };
const openAddModal = () => { isEditing.value = false; form.id = null; form.ngayLamViec = filters.date || getTodayStr(); form.idNhanVien = ''; form.idCa = ''; form.ghiChu = ''; form.trangThai = 2; clearErrors(); resetRepeatConfig(); showModal.value = true; };
const openEditModal = (item: Schedule) => { isEditing.value = true; form.id = item.id; form.ngayLamViec = item.ngayLamViec; form.idNhanVien = item.nhanVien?.id || ''; form.idCa = item.caLamViec?.idCa || ''; form.ghiChu = item.ghiChu || ''; form.trangThai = item.trangThai; originalForm.value = { ...form }; clearErrors(); showModal.value = true; };
const closeModal = async () => { if (isEditing.value && hasFormChanged.value) { if(!await showConfirmDialog('Hủy thay đổi?')) return; } showModal.value = false; originalForm.value = null; };

const openContextMenu = (event: MouseEvent, item: Schedule) => { contextMenu.visible = true; contextMenu.item = item; contextMenu.x = event.clientX; contextMenu.y = event.clientY; };
const closeContextMenu = () => { contextMenu.visible = false; };
const vClickOutside = { mounted(el: any, binding: any) { el.clickOutsideEvent = (e: Event) => { if (!(el === e.target || el.contains(e.target))) binding.value(e); }; document.body.addEventListener('click', el.clickOutsideEvent); }, unmounted(el: any) { document.body.removeEventListener('click', el.clickOutsideEvent); } };

const openDetailPopup = (event: MouseEvent, item: Schedule) => { selectedSchedule.value = item; showDetailPopup.value = true; };
const closeDetailPopup = () => { showDetailPopup.value = false; selectedSchedule.value = null; };
const editFromDetail = () => { if (selectedSchedule.value) { openEditModal(selectedSchedule.value); closeDetailPopup(); } };
const deleteFromDetail = () => { if (selectedSchedule.value) { handleRightClickDelete(selectedSchedule.value); closeDetailPopup(); } };

const toggleDay = (val: number) => { if (repeatConfig.daysOfWeek.includes(val)) { repeatConfig.daysOfWeek = repeatConfig.daysOfWeek.filter(d => d !== val); } else { repeatConfig.daysOfWeek.push(val); } };
const saveRepeat = () => { if (!repeatConfig.endDate) { showToast('Vui lòng chọn ngày kết thúc', 'warning'); return; } showRepeatModal.value = false; };
const cancelRepeat = () => { resetRepeatConfig(); showRepeatModal.value = false; };

const todayDateStr = computed(() => getTodayStr());
const getStartOfWeek = (date: Date) => { const day = date.getDay(); const diff = date.getDate() - day + (day === 0 ? -6 : 1); return new Date(date.setDate(diff)); };
const calendarTitle = computed(() => { const d = new Date(currentDate.value); if (calendarView.value === 'month') return `Tháng ${d.getMonth() + 1} - ${d.getFullYear()}`; else if (calendarView.value === 'week') { const s = getStartOfWeek(new Date(d)); const e = new Date(s); e.setDate(e.getDate() + 6); return `Tuần: ${s.getDate()}/${s.getMonth()+1} - ${e.getDate()}/${e.getMonth()+1}`; } else return `Ngày ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; });
const calendarDays = computed(() => { const days = []; const curr = new Date(currentDate.value); if (calendarView.value === 'month') { const year = curr.getFullYear(); const month = curr.getMonth(); const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0); let startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; for (let i = 0; i < startPadding; i++) days.push({ day: null, dateStr: '' }); for (let i = 1; i <= lastDay.getDate(); i++) { days.push({ day: i, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` }); } } else if (calendarView.value === 'week') { const s = getStartOfWeek(new Date(curr)); for (let i = 0; i < 7; i++) { const d = new Date(s); d.setDate(d.getDate() + i); days.push({ day: d.getDate(), dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }); } } else { days.push({ day: curr.getDate(), dateStr: `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}` }); } return days; });
const navigateCalendar = (step: number) => { const d = new Date(currentDate.value); if (calendarView.value === 'month') d.setMonth(d.getMonth() + step); else if (calendarView.value === 'week') d.setDate(d.getDate() + (step * 7)); else d.setDate(d.getDate() + step); currentDate.value = d; };
const goToToday = () => { const t = new Date(); currentDate.value = new Date(t.getFullYear(), t.getMonth(), t.getDate()); filters.date = getTodayStr(); if (calendarView.value !== 'month') calendarView.value = 'month'; };

// Filter dùng riêng cho Calendar (Lọc trên Frontend)
const getSchedulesForCalendarCell = (dateStr: string) => {
  if (!dateStr) return [];
  return schedules.value.filter(s => {
    if (s.ngayLamViec !== dateStr) return false;
    const searchName = filters.employeeName.toLowerCase();
    const matchEmpName = !filters.employeeName || (s.nhanVien?.hoTen?.toLowerCase().includes(searchName) || s.nhanVien?.maNv?.toLowerCase().includes(searchName));
    const matchStatus = filters.status === 'all' || s.trangThai === filters.status;
    return matchEmpName && matchStatus;
  });
};

const hours = Array.from({ length: 24 }, (_, i) => i);
const getEventStyle = (sche: Schedule, dateStr: string, allSchedules: Schedule[]) => { const startMins = timeToMinutes(sche.caLamViec.gioBatDau); const endMins = timeToMinutes(sche.caLamViec.gioKetThuc); const topPercent = (startMins / 1440) * 100; const heightPercent = ((endMins - startMins) / 1440) * 100; const overlapping = allSchedules.filter(s => { if (s.ngayLamViec !== dateStr || s.id === sche.id) return false; const sStart = timeToMinutes(s.caLamViec.gioBatDau); const sEnd = timeToMinutes(s.caLamViec.gioKetThuc); return (startMins < sEnd) && (endMins > sStart); }); let leftOffset = 2; let widthOffset = 2; if (overlapping.length > 0) { const sorted = [...overlapping, sche].sort((a, b) => timeToMinutes(a.caLamViec.gioBatDau) - timeToMinutes(b.caLamViec.gioBatDau)); const index = sorted.findIndex(s => s.id === sche.id); const slotWidth = 100 / (sorted.length + 1); widthOffset = slotWidth - 2; leftOffset = index * slotWidth + 2; } return { top: `${topPercent}%`, height: `${heightPercent}%`, position: 'absolute' as 'absolute', left: `${leftOffset}%`, width: overlapping.length > 0 ? `${widthOffset}%` : 'auto', right: overlapping.length > 0 ? 'auto' : '2px', zIndex: 10 }; };

onMounted(fetchInitialData);
</script>

<template>
  <div class="page-container">
   
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="notif in notifications" :key="notif.id" class="toast" :class="notif.type">
          <span class="toast-msg">{{ notif.message }}</span>
        </div>
      </TransitionGroup>
    </div>


    <div class="card-section filter-card form-page-animation">
      <div class="filter-card-header">
        <h2 class="card-title">QUẢN LÝ LỊCH LÀM VIỆC</h2>
      </div>

      <div class="filter-controls">
        <div class="left-controls">
          <div class="filter-group search-group">
            <label class="filter-label">Tìm kiếm</label>
            <div class="search-box">
              <i class="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </i>
              <input
                v-model="filters.employeeName"
                type="text"
                class="form-input ps-icon"
                placeholder="Tìm NV (Tên/Mã)..."
              />
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">Ngày:</label>
            <input type="date" class="form-input mini-input" v-model="filters.date" />
          </div>

          <div class="filter-group">
            <label class="filter-label">Trạng thái:</label>
            <select class="form-select" v-model="filters.status">
              <option value="all">Tất cả</option>
              <option :value="2">Đang mở</option>
              <option :value="3">Đang làm</option>
              <option :value="1">Đã đóng</option>
            </select>
          </div>
        </div>

        <div class="right-controls">
          <button class="btn btn-outline hover-effect" @click="resetFilters">Đặt lại</button>
          <button class="btn btn-outline hover-effect" @click="exportExcel">
            <img src="/src/assets/icon/dowload.svg" alt="" style="width: 16px; height: 16px; margin-right: 8px;">
            Xuất Excel
          </button>
          <button class="btn btn-outline hover-effect" @click="openAddModal">
            + Phân lịch
          </button>
        </div>
      </div>

      <!-- View Toggle - Below Filter Section -->
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


    <div v-if="viewMode === 'table'" class="card-section table-card form-page-animation">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th width="5%" class="text-center">STT</th>
              <th width="20%">Nhân Viên</th>
              <th width="15%">Ca Làm Việc</th>
              <th width="15%">Thời Gian</th>
              <th width="12%">Ngày</th>
              <th width="13%" class="text-center">Trạng Thái</th>
              <th width="20%" class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-4">Đang tải dữ liệu...</td>
            </tr>
            <tr v-else-if="pagedSchedules.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">Không tìm thấy dữ liệu</td>
            </tr>
            <tr v-else v-for="(item, index) in pagedSchedules" :key="item.id">
              <td class="text-center font-bold text-gray-500">{{ index + 1 }}</td>
              <td>
                <div class="employee-info">
                  <span class="emp-code">{{ item.nhanVien?.maNv || '---' }}</span>
                  <span class="emp-name">{{ item.nhanVien?.hoTen || 'Không có tên' }}</span>
                </div>
              </td>
              <td>
                <span class="shift-badge">{{ item.caLamViec?.tenCa }}</span>
                <div v-if="item.ghiChu" class="small-note">📝 {{ item.ghiChu }}</div>
              </td>
              <td>
                <span class="time-text">
                  {{ formatTime(item.caLamViec?.gioBatDau) }} - {{ formatTime(item.caLamViec?.gioKetThuc) }}
                </span>
              </td>
              <td><div class="date-badge">{{ item.ngayLamViec }}</div></td>
              <td class="text-center">
                <span class="status-badge" :class="getStatusClass(item.trangThai)">
                  {{ getStatusText(item.trangThai) }}
                </span>
              </td>
              <td class="text-center">
                <div class="tooltip-wrapper tooltip-left" data-tooltip="Sửa">
                  <span class="icon edit" @click="openEditModal(item)">
                    <img src="/src/assets/icon/edit.svg" style="width: 20px; height: 20px" />
                  </span>
                </div>

                <div class="tooltip-wrapper tooltip-right" data-tooltip="Xóa" style="display: inline-block; margin-left: 12px;">
                  <span class="icon delete" @click="handleDelete(item)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      <div class="pagination-footer" v-if="totalPages > 1">
        <button class="p-btn" :disabled="page === 0" @click="changePage(page - 1)"> &lt; </button>
        <template v-for="p in visiblePages" :key="p">
          <button v-if="p !== '...'" class="p-btn number" :class="{ active: p === (page + 1) }" @click="changePage((p as number) - 1)">{{ p }}</button>
          <span v-else class="dots">...</span>
        </template>
        <button class="p-btn" :disabled="page >= totalPages - 1" @click="changePage(page + 1)"> &gt; </button>
      </div>
    </div>


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
                    'selected-day': cell.dateStr && cell.dateStr === filters.date
                }"
                @click="cell.day && (filters.date = cell.dateStr)"
            >
                <div v-if="cell.day">
                   <span class="day-number">{{ cell.day }}</span>
                   <button class="cell-add-btn" @click.stop="openAddModalWithDate(cell.dateStr)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                   </button>
                </div>

                <div v-if="cell.day" class="shifts-container">
                    <div v-for="sche in getSchedulesForCalendarCell(cell.dateStr)" :key="sche.id" 
                        class="shift-item"
                        :class="{'draft': sche.trangThai === 1, 'working': sche.trangThai === 3}"
                        @click.stop="openDetailPopup($event, sche)" 
                        :data-tooltip="`${sche.nhanVien?.hoTen} (${sche.caLamViec?.tenCa})`"
                    >
                        <span class="shift-time">{{ formatTime(sche.caLamViec?.gioBatDau) }}</span>
                        <span class="shift-name">{{ sche.nhanVien?.hoTen }}</span>
                    </div>
                </div>
            </div>
        </div>

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
                <div v-for="shift in sortedShifts" :key="shift.idCa" class="matrix-row">
                    <div class="matrix-cell shift-info-cell">
                        <div class="shift-name">{{ shift.tenCa }}</div>
                        <div class="shift-time">{{ formatTime(shift.gioBatDau) }} - {{ formatTime(shift.gioKetThuc) }}</div>
                    </div>

                    <div v-for="(cell, index) in calendarDays" :key="index"
                         class="matrix-cell data-cell"
                         :class="{'today-col': cell.dateStr === todayDateStr}"
                         @click="openAddModalWithDateAndShift(cell.dateStr, shift.idCa)">

                        <button class="cell-add-btn" @click.stop="openAddModalWithDateAndShift(cell.dateStr, shift.idCa)" title="Thêm ca làm việc">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                        <div v-for="sche in getSchedulesForShiftAndDate(shift.idCa, cell.dateStr)" :key="sche.id"
                             class="emp-card"
                             :class="{'draft': sche.trangThai === 1, 'working': sche.trangThai === 3}"
                             @click.stop="openDetailPopup($event, sche)"
                             @contextmenu.prevent="openContextMenu($event, sche)">
                            
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
                <div v-for="shift in sortedShifts" :key="shift.idCa" class="matrix-row" style="grid-template-columns: 200px 1fr;">
                    
                    <div class="matrix-cell shift-info-cell" style="justify-content: center; align-items: center; text-align: center;">
                        <div class="shift-name" style="font-size: 15px;">{{ shift.tenCa }}</div>
                        <div class="shift-time" style="font-size: 13px; margin-top: 4px;">
                            {{ formatTime(shift.gioBatDau) }} - {{ formatTime(shift.gioKetThuc) }}
                        </div>
                    </div>

                    <div class="matrix-cell data-cell"
                         @click="openAddModalWithDateAndShift(calendarDays[0].dateStr, shift.idCa)"
                         style="border-right: none; display: flex; flex-direction: column; gap: 16px; padding: 16px !important; position: relative;">
                        
                        <button class="cell-add-btn" @click.stop="openAddModalWithDateAndShift(calendarDays[0].dateStr, shift.idCa)" title="Thêm ca làm việc">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>

                        <div v-for="sche in getSchedulesForShiftAndDate(shift.idCa, calendarDays[0].dateStr)" :key="sche.id"
                             class="emp-card"
                             :class="{'draft': sche.trangThai === 1, 'working': sche.trangThai === 3}"
                             @click.stop="openDetailPopup($event, sche)"
                             @contextmenu.prevent="openContextMenu($event, sche)"
                             style="width: 100%; min-height: 100px;"> <img :src="sche.nhanVien?.avatar || 'https://ui-avatars.com/api/?name=' + sche.nhanVien?.hoTen + '&background=random'" 
                                 class="emp-avatar" 
                                 alt="avt" />
                            
                            <div class="emp-details">
                                <div class="emp-name">{{ sche.nhanVien?.hoTen }}</div>
                                <div class="emp-code">{{ sche.nhanVien?.maNv }}</div>
                            </div>
                        </div>

                        <div v-if="getSchedulesForShiftAndDate(shift.idCa, calendarDays[0].dateStr).length === 0"
                             style="color: #9ca3af; font-size: 13px; font-style: italic; width: 100%; display: flex; align-items: center; justify-content: center; min-height: 80px;">
                            + Bấm vào đây để thêm nhân viên vào ca này
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-box form-page-animation">
        <div class="modal-header">
          <h3>{{ isEditing ? 'ĐIỀU CHỈNH LỊCH' : 'PHÂN LỊCH MỚI' }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
       
        <div class="modal-body">
          <div class="form-group">
             <label>Ngày làm việc <span class="required">*</span></label>
             <input type="date" v-model="form.ngayLamViec" class="form-control"
                    :class="{ 'red-border': errors.ngayLamViec }" />
             <span v-if="errors.ngayLamViec" class="error-msg">{{ errors.ngayLamViec }}</span>
          </div>
          <div class="form-group" v-if="!isEditing">
             <div class="repeat-trigger" @click="showRepeatModal = true">
                <span class="icon">🔄</span>
                <span class="text">
                  {{ isRepeatEnabled ? 'Đang bật chế độ lặp lại' : 'Không lặp lại' }}
                </span>
                <span class="arrow">▼</span>
             </div>
          </div>
          <div class="form-group">
             <label>Chọn Nhân viên <span class="required">*</span></label>
             <select v-model="form.idNhanVien" class="form-control custom-select-modal"
                     :class="{ 'red-border': errors.idNhanVien }">
               <option value="" disabled>-- Chọn nhân viên --</option>
               <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                 {{ emp.maNv }} - {{ emp.hoTen }}
               </option>
             </select>
             <span v-if="errors.idNhanVien" class="error-msg">{{ errors.idNhanVien }}</span>
          </div>


          <div class="form-group">
             <label>Chọn Ca làm việc <span class="required">*</span></label>
             <select v-model="form.idCa" class="form-control custom-select-modal"
                     :class="{ 'red-border': errors.idCa }">
               <option :value="''" disabled>-- Chọn ca --</option>
               <option v-for="s in shifts" :key="s.idCa" :value="s.idCa">
                 {{ s.tenCa }} ({{ formatTime(s.gioBatDau) }} - {{ formatTime(s.gioKetThuc) }})
               </option>
             </select>
             <span v-if="errors.idCa" class="error-msg">{{ errors.idCa }}</span>
          </div>


          <div class="form-group" v-if="isEditing">
             <label>Trạng thái</label>
             <select v-model="form.trangThai" class="form-control">
                <option :value="3">Đang làm</option>
                <option :value="2">Đang mở</option>
                <option :value="1">Đã đóng</option>
              </select>
          </div>


          <div class="form-group">
             <label>Ghi chú (Tùy chọn)</label>
             <input type="text" v-model="form.ghiChu" class="form-control" placeholder="Ví dụ: Trực thay..." />
          </div>
        </div>


        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Hủy</button>
          <button class="btn btn-primary" @click="handleSave">
            {{ isEditing ? 'Lưu thay đổi' : 'Xác nhận' }}
          </button>
        </div>
      </div>
    </div>
   
  </div>
  <div v-if="showRepeatModal" class="modal-backdrop z-high" @click.self="showRepeatModal = false">
       <div class="modal-box small-box form-page-animation">
          <div class="modal-header">
             <h3>Tuỳ chỉnh lặp lại</h3>
             <button class="close-btn" @click="showRepeatModal = false">×</button>
          </div>
          <div class="modal-body">
             
             <div class="form-group row-group">
                <label>Lặp lại mỗi:</label>
                <div class="input-with-unit">
                   <input type="number" v-model="repeatConfig.interval" min="1" class="form-control short-input">
                   <select v-model="repeatConfig.frequency" class="form-control">
                      <option value="daily">Ngày</option>
                      <option value="weekly">Tuần</option>
                   </select>
                </div>
             </div>


             <div class="form-group" v-if="repeatConfig.frequency === 'weekly'">
                <label>Vào các ngày:</label>
                <div class="week-days-selector">
                   <div v-for="d in weekDays" :key="d.val"
                        class="day-circle"
                        :class="{ active: repeatConfig.daysOfWeek.includes(d.val) }"
                        @click="toggleDay(d.val)">
                      {{ d.label }}
                   </div>
                </div>
             </div>


             <div class="form-group">
                <label>Kết thúc:</label>
                <input type="date" v-model="repeatConfig.endDate" class="form-control">
             </div>


          </div>
          <div class="modal-footer">
             <button class="btn btn-secondary" @click="cancelRepeat">Hủy</button>
             <button class="btn btn-primary" @click="saveRepeat">Xong</button>
          </div>
       </div>
    </div>
   
    <!-- Confirm Dialog Modal -->
    <transition name="fade-modal">
      <div
        v-if="confirmDialog.show"
        class="modal-confirm"
        @click.self="handleConfirm(false)"
      >
        <div class="confirm-box">
          <div class="confirm-icon-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="40"
              height="40"
            >
              <path
                fill-rule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h3 class="confirm-title">{{ confirmDialog.title }}</h3>
          <p class="confirm-desc" v-html="confirmDialog.message"></p>
          <div class="confirm-actions">
            <button class="btn-cancel hover-effect" @click="handleConfirm(false)">
              Hủy
            </button>
            <button class="btn-confirm hover-effect" @click="handleConfirm(true)">
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </transition>
    <div v-if="contextMenu.visible"
         class="context-menu"
         :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
         v-click-outside="closeContextMenu">
       <div class="menu-item delete" @click="handleRightClickDelete()">
          Xóa lịch
        </div>
       <div class="menu-item" @click="contextMenu.item && openEditModal(contextMenu.item); closeContextMenu()">
          Sửa lịch
        </div>
    </div>


    <div v-if="showDeleteOptionModal" class="modal-backdrop z-high" @click.self="showDeleteOptionModal = false">
       <div class="modal-box small-box form-page-animation">
          <div class="modal-header">
             <h3>Xóa ca định kỳ</h3>
          </div>
          <div class="modal-body">
             <p class="mb-3">Bạn muốn xóa ca này hay tất cả ca trong chuỗi?</p>
             
             <div class="radio-group-vertical">
                <label class="radio-row">
                   <input type="radio" value="one" v-model="deleteOption">
                   <span>Chỉ ca này ({{ formatDate(contextMenu.item?.ngayLamViec || '') }})</span>
                </label>
                <label class="radio-row">
                   <input type="radio" value="all" v-model="deleteOption">
                   <span>Sự kiện này và các ca sau (Tương lai)</span>
                </label>
             </div>
          </div>
          <div class="modal-footer">
             <button class="btn btn-secondary" @click="showDeleteOptionModal = false">Hủy</button>
             <button class="btn btn-primary" @click="confirmDeleteSeries">OK</button>
          </div>
       </div>
    </div>
    <div v-if="showUpdateOptionModal" class="modal-backdrop z-high" @click.self="showUpdateOptionModal = false">
       <div class="modal-box small-box form-page-animation">
          <div class="modal-header">
             <h3>Cập nhật ca định kỳ</h3>
          </div>
          <div class="modal-body">
             <p class="mb-3">Đây là lịch lặp lại. Bạn muốn áp dụng thay đổi này cho?</p>
             
             <div class="radio-group-vertical">
                <label class="radio-row">
                   <input type="radio" value="one" v-model="updateOption">
                   <span>Chỉ ca này</span>
                </label>
                <label class="radio-row">
                   <input type="radio" value="all" v-model="updateOption">
                   <span>Ca này và các ca sau</span>
                </label>
             </div>
             
             <div class="alert-box" v-if="updateOption === 'all'">
                ⚠️ Lưu ý: Các ngày trong quá khứ sẽ không bị thay đổi.
             </div>
          </div>
          <div class="modal-footer">
             <button class="btn btn-secondary" @click="showUpdateOptionModal = false">Hủy</button>
             <button class="btn btn-primary" @click="confirmUpdateSeries">Lưu thay đổi</button>
          </div>
       </div>
    </div>
    <div v-if="showDetailPopup && selectedSchedule" class="modal-backdrop z-highest" @click.self="closeDetailPopup">
       <div class="modal-box detail-box form-page-animation">
          
          <div class="detail-header">
             <h3 class="modal-title">Chi tiết ca</h3>
             <div class="right-actions">
                <button class="icon-btn" @click="editFromDetail" title="Chỉnh sửa">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="icon-btn" @click="deleteFromDetail" title="Xóa">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
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

             <div class="detail-row info">
                <div class="icon">👤</div>
                <div class="content">
                   <div class="main-text">{{ selectedSchedule.nhanVien?.hoTen }}</div>
                   <div class="sub-text">Mã: {{ selectedSchedule.nhanVien?.maNv }}</div>
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
             
             <div class="repeat-info" v-if="selectedSchedule.maLapLai">
                🔄 Sự kiện này lặp lại định kỳ
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

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
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
   FILTER CONTROLS (MATCH EMPLOYEEMANAGER)
   ========================================= */
.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 10px;
}

.left-controls {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex: 1;
}

.right-controls {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

/* Filter Group */
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group.search-group {
  justify-content: flex-end;
}

.filter-label {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin-left: 2px;
}

/* Search Box */
.search-box {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  pointer-events: none;
  z-index: 1;
}

/* Form Inputs & Selects */
.form-input,
.form-select {
  height: 42px;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input {
  width: 100%;
  border: 1px solid #d1d5db;
  padding: 0 12px;
  outline: none;
  background-color: #fff;
  transition: all 0.2s;
}

.form-input.ps-icon {
  padding-left: 40px;
}

.mini-input {
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  background-color: #fff;
}

.form-select {
  min-width: 150px;
  border: 1px solid #d1d5db;
  padding: 0 12px;
  outline: none;
  background-color: #fff;
  cursor: pointer;
}

.form-input:focus,
.form-select:focus,
.mini-input:focus {
  border-color: #63391f;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}

/* =========================================
   VIEW TOGGLE (Below Filter)
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
   BUTTONS (Gradient Style)
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

.btn-primary {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: #fff;
  border-color: #6b3f23;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a3420, #b8895d);
  box-shadow: 0 4px 10px rgba(78, 44, 23, 0.3);
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

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
}

.btn-secondary:hover {
  background: #e5e7eb;
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
  min-width: 1000px;
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

.employee-info {
  display: flex;
  flex-direction: column;
}

.emp-code {
  font-size: 12px;
  color: #000000;
  font-weight: 600;
}

.emp-name {
  font-size: 14px;
  color: #000000;
  font-weight: 600;
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

.status-badge.draft {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #ef4444;
}

.status-badge.inactive {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #ef4444;
}

.status-badge.working {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: white;
  border: none;
}


.action-group.center-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.action-btn:hover {
  border-color: #63391f;
  color: #63391f;
  background: #fff8f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(99, 57, 31, 0.2);
}

.delete-btn:hover {
  border-color: #dc2626;
  color: #dc2626;
  background: #fef2f2;
}

/* Tooltip wrapper - matching EmployeeManager */
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

/* Action buttons wrapper for alignment */
.action-buttons-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tooltip-wrapper::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  z-index: 100;
}

.tooltip-wrapper::before {
  content: "";
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #333;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

.tooltip-wrapper:hover::after,
.tooltip-wrapper:hover::before {
  opacity: 1;
  visibility: visible;
}

/* Offset tooltip positions to prevent overlap - left tooltip */
.tooltip-wrapper.tooltip-left::after,
.tooltip-wrapper.tooltip-left::before {
  left: 20%;
}

/* Offset tooltip positions to prevent overlap - right tooltip */
.tooltip-wrapper.tooltip-right::after,
.tooltip-wrapper.tooltip-right::before {
  left: 80%;
}

/* Icon styles - matching EmployeeManager */
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.icon.edit {
  color: #63391f;
}

.icon.delete {
  color: #dc2626;
}

.icon.delete:hover {
  color: #b91c1c;
}

/* =========================================
   PAGINATION (Gradient Active)
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


/* CALENDAR STYLES */
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
  flex-shrink: 0; /* Header không bị co */
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
.day-cell .day-number-wrapper {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.day-cell:nth-child(7n) { border-right: none; }
.day-cell.empty { background: #fcfcfc; }
.day-cell.today { background: #fff8f5; }
.day-cell.selected-day { box-shadow: inset 0 0 0 2px #63391F; }
.day-number { font-weight: 700; font-size: 13px; color: #374151; margin-bottom: 6px; flex-shrink: 0; }
.today .day-number { color: #63391F; text-decoration: underline; }
.shifts-container { display: flex; flex-direction: column; gap: 3px; overflow-y: auto; max-height: 60px; }

/* ==================================
   SỬA CHỮ LỊCH THÁNG
   ================================== */
.shift-item { 
  background: #dcfce7; 
  color: #166534; 
  border-left: 3px solid #22c55e; 
  cursor: pointer; 
  position: relative; 
  flex-shrink: 0; 
  padding: 3px 6px; 
  margin-bottom: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.shift-item.draft { background: #fee2e2; color: #dc2626; border-left-color: #ef4444; }
.shift-item.working { background: linear-gradient(135deg, #6b3f23, #c89b6d); color: white; border-left-color: #8B5A2B; }

/* Ép font nhỏ và thanh mảnh gọn gàng */
.shift-time { 
  font-weight: 500; /* Mảnh hơn */
  font-size: 11px; 
}
.shift-name { 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
  font-weight: 400; /* Không in đậm */
  font-size: 11px; /* Nhỏ lại bằng giờ */
}

.legend-mini { display: flex; gap: 15px; font-size: 12px; color: #555; padding-right: 10px; }
.legend-item { display: flex; align-items: center; gap: 5px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.active { background: #22c55e; }
.dot.working { background: linear-gradient(135deg, #6b3f23, #c89b6d); }
.dot.draft { background: #ef4444; }
/* === THÊM CSS NÀY === */

/* 1. Quan trọng: Đặt relative để nút con định vị theo ô này */
.day-cell {
  position: relative; 
}

/* 2. Style nút cộng (Đã chỉnh sửa: Sang trái + Nhỏ lại) */
.cell-add-btn {
  position: absolute;
  top: 4px;          /* Cách lề trên một chút */
  left: 4px;         /* ĐỔI: Chuyển từ right sang left */
  
  width: 22px;       /* ĐỔI: Giảm từ 32px/28px xuống 22px */
  height: 22px;      /* ĐỔI: Giảm xuống 22px */
  
  border-radius: 50%;
  border: none;
  background: #63391F;
  color: white;
  
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease-in-out;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.cell-add-btn svg {
  width: 14px !important;  /* Ép icon nhỏ lại */
  height: 14px !important;
  stroke-width: 3px;       /* Tăng độ đậm nét một chút cho dễ nhìn */
}
/* 4. Hiệu ứng khi di chuột vào nút */
.day-cell:hover .cell-add-btn {
  opacity: 1;
  transform: scale(1);
}
/* 4. Hiệu ứng khi di chuột vào nút */
.cell-add-btn:hover {
  background: #8B5A2B;
  transform: scale(1.1);
}
/* TOOLTIP - Using .tooltip-wrapper class only */


/* MODAL */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(2px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.modal-box { background: white; width: 500px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { background: linear-gradient(135deg, #6b3f23, #c89b6d); padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; color: white; }
.modal-header h3 { margin: 0; font-size: 16px; font-weight: 700; }
.close-btn { background: none; border: none; color: white; font-size: 24px; cursor: pointer; }
.modal-body { padding: 24px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px; }
.required { color: #dc2626; }
.form-control { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; }
.form-control:focus { border-color: #63391F; outline: none; box-shadow: 0 0 0 2px rgba(99, 57, 31, 0.1); }
.modal-footer { padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px; }


/* TOAST */
.toast-container { position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
.toast { pointer-events: auto; min-width: 250px; max-width: 350px; padding: 12px 16px; border-radius: 4px; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); background: #fff; animation: slideInRight 0.3s forwards; }
.toast.success { background-color: #f0f9eb; border-left: 5px solid #67c23a; color: #67c23a; }
.toast.error { background-color: #fef0f0; border-left: 5px solid #f56c6c; color: #f56c6c; }
.toast.warning { background-color: #fdf6ec; border-left: 5px solid #e6a23c; color: #e6a23c; }
.toast-msg { color: #333; }
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }


/* === ERROR STYLES (MỚI) === */
.red-border { border-color: #dc2626 !important; background-color: #fff5f5; }
.error-msg { color: #dc2626; font-size: 12px; margin-top: 5px; display: block; animation: fadeIn 0.3s; font-weight: 500; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: translateY(0); } }
.repeat-trigger {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; background: #f3f4f6; border-radius: 6px;
  cursor: pointer; transition: 0.2s; user-select: none;
}
.repeat-trigger:hover { background: #e5e7eb; }
.repeat-trigger .text { flex: 1; font-weight: 500; color: #374151; font-size: 14px; }
.repeat-trigger .arrow { font-size: 10px; color: #6b7280; }


/* Modal nhỏ chồng lên */
.z-high { z-index: 10000; } /* Cao hơn modal thường */
.small-box { width: 400px; }


/* Input group */
.row-group { display: flex; align-items: center; gap: 15px; }
.input-with-unit { display: flex; gap: 10px; align-items: center; }
.short-input { width: 70px; text-align: center; }


/* Chọn thứ (Tròn tròn giống Google) */
.week-days-selector { display: flex; gap: 8px; margin-top: 8px; justify-content: flex-start; }
.day-circle {
  width: 32px; height: 32px; border-radius: 50%;
  background: #f3f4f6; color: #6b7280;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.day-circle:hover { background: #e5e7eb; }
.day-circle.active { background: linear-gradient(135deg, #6b3f23, #c89b6d); color: white; box-shadow: 0 2px 5px rgba(99,57,31,0.3); }


/* Confirm Dialog */
.z-highest { z-index: 10001; }


/* Modal Confirm */
.modal-confirm {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}


.confirm-box {
  background: #fff;
  padding: 30px;
  border-radius: 20px;
  width: 400px;
  text-align: center;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: zoomIn 0.3s ease-out;
}


@keyframes zoomIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}


.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #fff4e5;
  color: #ff9800;
  margin: 0 auto 15px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  line-height: 1;
}


.confirm-icon-wrapper i,
.confirm-icon-wrapper svg,
.confirm-icon-wrapper span {
  display: block;
  margin: 0;
}


.confirm-title {
  color: #63391f;
  margin-bottom: 10px;
  font-size: 20px;
}


.confirm-desc {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
}


.confirm-actions {
  display: flex;
  gap: 20px;
}


.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  flex: 1;
  height: 42px;
}


.btn-cancel:hover {
  background: #e5e7eb;
}


.btn-confirm {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  flex: 1;
  height: 42px;
}


.btn-confirm:hover {
  background: linear-gradient(135deg, #5a3420, #b8895d);
  box-shadow: 0 4px 10px rgba(78, 44, 23, 0.3);
}


.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}


.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
/* Context Menu */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-radius: 8px;
  width: 150px;
  z-index: 9999;
  padding: 5px 0;
  overflow: hidden;
  animation: fadeIn 0.1s ease-out;
}


.menu-item {
  padding: 8px 12px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.1s;
}


.menu-item:hover {
  background-color: #f3f4f6;
  color: #63391F;
}


.menu-item.delete:hover {
  background-color: #fef2f2;
  color: #dc2626;
}


/* Radio Modal */
.radio-group-vertical {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}
.radio-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
}
.mb-3 { margin-bottom: 12px; }
.alert-box {
  margin-top: 10px;
  background: #fff3cd;
  color: #856404;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #ffeeba;
}
/* === DETAIL POPUP STYLES === */
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

.repeat-info {
  margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;
  font-size: 12px; color: #70757a; font-style: italic; display: flex; align-items: center; gap: 6px;
}

/* Z-Index cao nhất cho popup này để đè lên mọi thứ */
.z-highest { z-index: 2000; }
/* --- VIEW SWITCHER STYLES --- */
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

/* --- CALENDAR GRID LAYOUTS --- */
.calendar-grid {
  display: grid;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  background: #e5e7eb; /* Màu đường kẻ */
  gap: 1px; /* Tạo đường kẻ giữa các ô */
}

/* 1. Layout mặc định (Tháng): 7 cột */
.calendar-grid.month {
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(80px, 1fr); 
}

/* 2. Layout Tuần: 7 cột với chiều cao cố định */
.calendar-grid.week {
  grid-template-columns: repeat(7, 1fr);
  height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 3. Layout Ngày: 1 cột duy nhất với chiều cao cố định */
.calendar-grid.day {
  grid-template-columns: 1fr;
  height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Container bên trong ô ngày - hỗ trợ scroll */
.day-cell-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Scrollable shifts container */
.shifts-container {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
  max-height: calc(100% - 30px); /* Trừ đi phần hiển thị ngày */
  padding-right: 2px;
}

/* Custom scrollbar cho shifts container */
.shifts-container::-webkit-scrollbar {
  width: 4px;
}

.shifts-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.shifts-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.shifts-container::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Chỉnh lại ô ngày cho đẹp */
.day-cell {
  background: white; /* Nền trắng đè lên gap nền xám */
  min-height: 80px;
  display: flex;
  flex-direction: column;
}

/* Riêng chế độ ngày thì ô phải to và list ca hiển thị dạng khác nếu cần */
.calendar-grid.day .day-cell {
  padding: 20px;
}
.calendar-grid.day .shifts-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Ca hiển thị dạng thẻ card */
  gap: 10px;
}

/* Week view - điều chỉnh cho đẹp */
.calendar-grid.week .day-cell {
  min-height: 120px;
}

.calendar-grid.week .day-cell-content {
  height: 100%;
}

/* === SCHEDULER VIEW (CẤU TRÚC MỚI) === */
.scheduler-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 500px; /* Chiều cao cố định tối thiểu */
  max-height: 600px; /* Chiều cao cố định tối đa */
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  background: white;
  overflow: hidden;
}

/* --- A. HEADER STYLES --- */
.scheduler-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0; /* Header không được co lại */
  z-index: 20;
  height: 50px; /* Chiều cao header cố định */
}

.gutter-head {
  width: 60px; /* Bằng cột giờ */
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  background: white;
}

.days-head-row {
  display: flex;
  flex: 1; /* Chiếm hết chiều rộng còn lại */
}

.day-head-cell {
  flex: 1; /* QUAN TRỌNG: Chia đều kích thước cột (giống View Tháng) */
  text-align: center;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.day-head-cell:last-child { border-right: none; }

.day-head-cell .day-name { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; line-height: 1; margin-bottom: 2px; }
.day-head-cell .day-num { font-size: 18px; font-weight: 600; color: #374151; width: 28px; height: 28px; line-height: 28px; border-radius: 50%; }

.day-head-cell.today .day-name { color: #63391F; }
.day-head-cell.today .day-num { background: #63391F; color: white; }

/* Đệm thanh cuộn: Giúp header thẳng hàng với body khi có scrollbar */
.scrollbar-spacer {
  width: 10px; /* Ước lượng scrollbar */
  flex-shrink: 0;
  background: #f9fafb;
  border-left: 1px solid #e5e7eb;
}

/* --- B. BODY STYLES --- */
.scheduler-body {
  display: flex;
  flex: 1;
  overflow-y: auto; /* Scroll dọc ở đây */
  overflow-x: hidden; /* Không cuộn ngang */
  position: relative;
}

/* Cột Giờ */
.time-labels-col {
  width: 60px;
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  background: white;
}

.time-slot-label {
  height: 60px; /* 1 giờ = 60px */
  position: relative;
  text-align: right;
  padding-right: 8px;
  font-size: 11px;
  color: #9ca3af;
}
.time-slot-label span {
  position: relative;
  top: -6px; /* Căn text lên dòng kẻ */
  background: white;
  padding-left: 4px;
}

/* Lưới Sự Kiện */
.events-grid-col {
  flex: 1; /* Chiếm hết phần còn lại */
  position: relative;
  /* background-size: 100% 60px; */
}

/* Dòng kẻ ngang */
.grid-horizontal-line {
  height: 60px;
  border-bottom: 1px solid #f3f4f6;
  box-sizing: border-box;
}
.grid-horizontal-line:last-child { border-bottom: none; }

/* Track chứa các cột ngày */
.days-track {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  height: 1440px; /* 24h * 60px */
}

.day-column {
  flex: 1; /* QUAN TRỌNG: Chia đều cột giống Header */
  border-right: 1px solid #f3f4f6;
  position: relative;
  height: 100%;
}
.day-column:hover { background-color: rgba(99, 57, 31, 0.02); }

/* --- EVENT CARD (Time Grid) --- */
.event-card {
  position: absolute; /* Định vị Top/Height theo giờ */
  left: 2px; right: 2px;
  background-color: #dcfce7;
  border-left: 3px solid #22c55e;
  border-right: 1px solid #22c55e;
  border-top: 1px solid #22c55e;
  border-bottom: 1px solid #22c55e;
  border-radius: 4px;
  padding: 4px;
  font-size: 11px;
  color: #166534;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: all 0.1s;
  z-index: 10;
  line-height: 1.2;
  font-weight: 400;
}

.event-card:hover {
  z-index: 20 !important;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transform: scale(1.02);
}

.event-card.draft {
  background-color: #fee2e2;
  border-left-color: #ef4444;
  border-right-color: #ef4444;
  border-top-color: #ef4444;
  border-bottom-color: #ef4444;
  color: #dc2626;
}

.event-card.working {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  border-left-color: #8B5A2B;
  border-right-color: #8B5A2B;
  border-top-color: #8B5A2B;
  border-bottom-color: #8B5A2B;
  color: white;
}

.event-time { font-weight: 700; margin-bottom: 1px; font-size: 9px; }
.event-title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 10px; }
.event-shift { opacity: 0.8; font-size: 9px; }
/* --- TRẠNG THÁI ĐANG LÀM (Gradient bình thường, không animation) --- */
.status-badge.in-progress {
  background: linear-gradient(135deg, #5a3016, #c89b6d);
  color: white;
  border: none;
  font-weight: bold;
}

/* =========================================
   GIAO DIỆN LỊCH DẠNG TUẦN (FIX LỆCH CỘT VÀ TRÀN Ô)
   ========================================= */
.week-matrix-view,
.week-matrix-view * {
  box-sizing: border-box; /* Ép border-box để grid không bị phình to do padding */
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

.matrix-header {
  display: grid;
  grid-template-columns: 140px repeat(7, minmax(130px, 1fr));
  background: #f9fafb !important;
  color: #374151 !important;
  border-bottom: 2px solid #edf2f7;
  position: sticky;
  top: 0;
  z-index: 20;
}

.matrix-cell-head {
  padding: 12px 8px; 
  text-align: center;
  border-right: 1px solid #e5e7eb !important;
  color: #374151 !important;
  min-width: 0; /* QUAN TRỌNG: Ngăn Header phình to */
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

.matrix-row {
  display: grid;
  grid-template-columns: 140px repeat(7, minmax(130px, 1fr)); /* Đồng bộ hoàn toàn với Header */
  border-bottom: 1px solid #e5e7eb;
}
.matrix-row:last-child { border-bottom: none; }

.matrix-cell {
  border-right: 1px solid #e5e7eb;
  min-height: 120px; 
  min-width: 0; /* QUAN TRỌNG: Ép cột tuân thủ kích thước, không phình theo text dài */
}
.matrix-cell:last-child { border-right: none; }

/* Cột Ca làm việc bên trái */
.shift-info-cell {
  background: #fcfcfc;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 16px;
}
.shift-time { 
  font-weight: normal !important; /* Ép bỏ in đậm */
  font-size: 11px; 
}
.shift-name { 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
  font-weight: normal !important; /* Ép bỏ in đậm */
  font-size: 11px; 
}

/* Ô dữ liệu Ngày */
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
   THẺ NHÂN VIÊN (GIỐNG ẢNH MẪU SỐ 3)
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
  min-width: 0; /* Ngăn Flexbox vỡ khung */
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
  text-overflow: ellipsis; /* Tự động cắt thành "..." nếu tên dài */
  width: 100%;
}

.emp-code {
  font-size: 10px;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
/* Ô dữ liệu Ngày */
.data-cell {
  display: flex;
  flex-direction: column;
  gap: 10px; 
  cursor: pointer;
  transition: background 0.2s;
  padding: 12px !important; 
  vertical-align: top;
  position: relative; /* <-- BẮT BUỘC ĐỂ GIỮ DẤU CỘNG Ở GÓC TRÁI */
}
.data-cell:hover { background: #f8fafc; }
.data-cell.today-col { background: #fafaf9; } 

/* Bổ sung hiệu ứng hiển thị dấu cộng khi hover chuột */
.data-cell:hover .cell-add-btn {
  opacity: 1;
  transform: scale(1);
}
</style>



