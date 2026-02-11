<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
// Toggle chọn thứ
const toggleDay = (val: number) => {
  if (repeatConfig.daysOfWeek.includes(val)) {
    repeatConfig.daysOfWeek = repeatConfig.daysOfWeek.filter(d => d !== val);
  } else {
    repeatConfig.daysOfWeek.push(val);
  }
};
// --- STATE CHO CONTEXT MENU & DELETE MODAL ---
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  item: null as Schedule | null
});
// --- STATE UPDATE OPTION ---
const showUpdateOptionModal = ref(false);
const updateOption = ref('one'); // 'one' hoặc 'all'
const showDeleteOptionModal = ref(false); // Modal hỏi xóa 1 hay xóa tất cả
const deleteOption = ref('one'); // 'one' hoặc 'all'
// Nút "Xong" ở modal lặp lại
const saveRepeat = () => {
  if (!repeatConfig.endDate) {
     showToast('Vui lòng chọn ngày kết thúc', 'warning');
     return;
  }
  showRepeatModal.value = false;
};


// Nút "Hủy" hoặc tắt lặp lại
const cancelRepeat = () => {
  resetRepeatConfig(); // Xóa config
  showRepeatModal.value = false;
};




// --- 1. INTERFACES ---
interface Employee {
  id: number;
  maNv: string;
  hoTen: string;
  chucVu?: string;
  trangThai: number; // Thêm để lọc dropdown
}
interface Shift {
  idCa: number;
  tenCa: string;
  gioBatDau: string;
  gioKetThuc: string;
  trangThai: number; // Thêm để lọc dropdown
}


interface Schedule {
  id: number;
  ngayLamViec: string;
  nhanVien: Employee;
  caLamViec: Shift;
  ghiChu?: string;
  trangThai: number; // 1: Công khai, 0: Ẩn
  maLapLai?: string; // Mã lặp lại (nếu có)
}
// State cho Modal Lặp lại
const showRepeatModal = ref(false);
const repeatConfig = reactive({
  frequency: 'weekly', // 'daily', 'weekly'
  interval: 1,         // Lặp lại mỗi x tuần
  daysOfWeek: [] as number[], // 0=CN, 1=T2... (Chỉ dùng cho weekly)
  endDate: '',         // Kết thúc vào ngày
});


// Helper: Tên các thứ trong tuần
const weekDays = [
  { val: 1, label: 'T2' },
  { val: 2, label: 'T3' },
  { val: 3, label: 'T4' },
  { val: 4, label: 'T5' },
  { val: 5, label: 'T6' },
  { val: 6, label: 'T7' },
  { val: 0, label: 'CN' }
];


// Hàm reset cấu hình lặp
const resetRepeatConfig = () => {
  repeatConfig.frequency = 'weekly';
  repeatConfig.interval = 1;
  repeatConfig.daysOfWeek = [];
  // Mặc định endDate là 1 tháng sau
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  repeatConfig.endDate = d.toISOString().split('T')[0];
};
// API Endpoints
const API_URL = 'http://localhost:8080/api/lich-lam-viec';
const API_EMP = 'http://localhost:8080/api/nhan-vien';
const API_SHIFT = 'http://localhost:8080/api/ca-lam-viec';


// --- 2. STATE ---
const schedules = ref<Schedule[]>([]);
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


// Filter State
const filters = reactive({
  date: '',
  employeeName: '',
  shiftName: '',    
  status: 'all' as string | number
});


// Pagination State
const perPage = ref(8);
const page = ref(0);


// Form Data
const form = reactive({
  id: null as number | null,
  ngayLamViec: new Date().toISOString().split('T')[0],
  idNhanVien: '' as string | number,
  idCa: '' as string | number,
  ghiChu: '',
  trangThai: 1
});


// Track original form values for change detection
const originalForm = ref<any>(null);
const hasFormChanged = computed(() => {
  if (!originalForm.value || !isEditing.value) return false;
  return (
    form.ngayLamViec !== originalForm.value.ngayLamViec ||
    String(form.idNhanVien) !== String(originalForm.value.idNhanVien) ||
    String(form.idCa) !== String(originalForm.value.idCa) ||
    form.ghiChu !== originalForm.value.ghiChu ||
    form.trangThai !== originalForm.value.trangThai
  );
});


// --- NEW: Error State (Quản lý lỗi đỏ) ---
const errors = reactive({
  ngayLamViec: '',
  idNhanVien: '',
  idCa: ''
});


// Toast
const notifications = ref<{ id: number; message: string; type: string }[]>([]);
const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
  const id = Date.now();
  notifications.value.push({ id, message, type });
  setTimeout(() => notifications.value = notifications.value.filter(n => n.id !== id), 3000);
};


// Confirm Dialog State
const confirmDialog = ref({
  show: false,
  message: '',
  resolve: null as ((value: boolean) => void) | null
});


const showConfirmDialog = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    confirmDialog.value.message = message;
    confirmDialog.value.resolve = resolve;
    confirmDialog.value.show = true;
  });
};


const handleConfirm = (result: boolean) => {
  if (confirmDialog.value.resolve) {
    confirmDialog.value.resolve(result);
  }
  confirmDialog.value.show = false;
  confirmDialog.value.message = '';
  confirmDialog.value.resolve = null;
};


// --- 3. HELPER & VALIDATION ---
const clearErrors = () => {
  errors.ngayLamViec = '';
  errors.idNhanVien = '';
  errors.idCa = '';
};


// Hàm đổi giờ sang phút
const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};


const validateForm = () => {
  clearErrors();
  let isValid = true;


  // 1. Check trống
  if (!form.ngayLamViec) { errors.ngayLamViec = 'Vui lòng chọn ngày'; isValid = false; }
  if (!form.idNhanVien) { errors.idNhanVien = 'Vui lòng chọn nhân viên'; isValid = false; }
  if (!form.idCa) { errors.idCa = 'Vui lòng chọn ca làm việc'; isValid = false; }


  if (!isValid) return false;


  // 2. Check ngày quá khứ
  const today = new Date().toISOString().split('T')[0];
  if (!isEditing.value && form.ngayLamViec < today) {
     errors.ngayLamViec = 'Không thể phân lịch cho ngày đã qua';
     isValid = false;
  }


  // 3. CHECK TRÙNG GIỜ (Overlap Check)
  const selectedShift = shifts.value.find(s => s.idCa === Number(form.idCa));
  if (selectedShift) {
    const newStart = timeToMinutes(selectedShift.gioBatDau);
    const newEnd = timeToMinutes(selectedShift.gioKetThuc);


    const hasConflict = schedules.value.some(s => {
      if (isEditing.value && s.id === form.id) return false; // Bỏ qua chính nó


      const isSameDay = s.ngayLamViec === form.ngayLamViec;
      // Handle trường hợp user object hoặc id
      const sIdNv = s.nhanVien?.id || (s.nhanVien as any)?.idNv;
      const isSameEmp = Number(sIdNv) === Number(form.idNhanVien);


      if (isSameDay && isSameEmp) {
        // Lấy giờ ca cũ
        const existingStart = timeToMinutes(s.caLamViec.gioBatDau);
        const existingEnd = timeToMinutes(s.caLamViec.gioKetThuc);
       
        // Công thức trùng: (StartA < EndB) && (EndA > StartB)
        return (newStart < existingEnd) && (newEnd > existingStart);
      }
      return false;
    });


    if (hasConflict) {
      errors.idCa = 'Nhân viên này đã có ca làm việc bị trùng giờ trong ngày!';
      isValid = false;
    }
  }


  return isValid;
};


// --- 4. API ACTIONS ---
const fetchData = async () => {
  loading.value = true;
  try {
    const [resSch, resEmp, resShift] = await Promise.all([
      axios.get(API_URL),
      axios.get(API_EMP),
      axios.get(API_SHIFT)
    ]);
    schedules.value = resSch.data;
    // Lọc chỉ lấy nhân viên/ca Active cho đẹp dropdown
    employees.value = resEmp.data.filter((e: any) => e.trangThai === 1);
    shifts.value = resShift.data.filter((s: any) => s.trangThai === 1);
  } catch (error) {
    showToast('Lỗi kết nối server', 'error');
  } finally {
    loading.value = false;
  }
};


// --- LOGIC SINH NGÀY ---
const generateDates = () => {
  const dates: string[] = [];
  const start = new Date(form.ngayLamViec);
  const end = new Date(repeatConfig.endDate);
 
  if (start > end) return [];


  const current = new Date(start);


  // Nếu chọn Daily (Hằng ngày)
  if (repeatConfig.frequency === 'daily') {
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      // Tăng ngày theo interval (Ví dụ: cách 1 ngày)
      current.setDate(current.getDate() + repeatConfig.interval);
    }
  }
  // Nếu chọn Weekly (Hằng tuần) - Phổ biến nhất cho xếp ca
  else if (repeatConfig.frequency === 'weekly') {
    // Nếu user không chọn thứ nào, mặc định là thứ của ngày bắt đầu
    const targetDays = repeatConfig.daysOfWeek.length > 0
                       ? repeatConfig.daysOfWeek
                       : [start.getDay()];


    while (current <= end) {
      // Check xem thứ hiện tại có nằm trong list chọn không
      if (targetDays.includes(current.getDay())) {
        dates.push(current.toISOString().split('T')[0]);
      }
     
      // Tăng ngày lên 1
      current.setDate(current.getDate() + 1);
     
      // Nếu qua tuần mới (Chủ nhật -> Thứ 2), check interval
      // Logic đơn giản: cứ duyệt từng ngày, nhưng nếu muốn interval tuần chính xác thì phức tạp hơn.
      // Ở đây ta dùng cách đơn giản: Duyệt từng ngày một, nếu trúng thứ thì lấy.
      // (Lưu ý: Logic interval tuần chuẩn Google Calendar rất phức tạp,
      // ở đây ta tạm bỏ qua interval tuần cho loop đơn giản, chỉ loop days)
    }
  }
  return dates;
};


// --- HÀM LƯU (ĐÃ NÂNG CẤP) ---
const handleSave = async () => {
  // 1. Validate cơ bản (GIỮ NGUYÊN)
  if (!validateForm()) return;


  // 2. Nếu đang Edit -> Logic mới kết hợp cũ
  if (isEditing.value && form.id) {
     
      // --- LOGIC MỚI: KIỂM TRA LỊCH LẶP LẠI ---
      // Tìm item gốc để xem nó có mã lặp lại không
      const originalItem = schedules.value.find(s => s.id === form.id);
     
      // Nếu là lịch thuộc chuỗi (có maLapLai) -> Mở Modal tùy chọn update -> DỪNG HÀM TẠI ĐÂY
      if (originalItem && originalItem.maLapLai) {
          updateOption.value = 'one'; // Reset lựa chọn về mặc định
          showUpdateOptionModal.value = true; // Mở modal hỏi (Sửa 1 hay Sửa tất cả)
          return; // Dừng lại! Việc lưu sẽ do hàm confirmUpdateSeries đảm nhận
      }
      // --- HẾT LOGIC MỚI ---




      // --- LOGIC CŨ: XỬ LÝ SỬA LỊCH ĐƠN LẺ (Không có maLapLai) ---
      // (Đoạn này chạy khi lịch là lịch thường)
     
      // Xác nhận trước khi lưu thay đổi
      const emp = employees.value.find(e => e.id === Number(form.idNhanVien));
      const shift = shifts.value.find(s => s.idCa === Number(form.idCa));
      const confirmMsg = `
        Bạn có chắc chắn muốn cập nhật lịch làm việc?<br><br>
        <strong>Ngày:</strong> ${form.ngayLamViec}<br>
        <strong>Nhân viên:</strong> ${emp?.hoTen}<br>
        <strong>Ca làm việc:</strong> ${shift?.tenCa}<br>
        <strong>Trạng thái:</strong> ${form.trangThai === 1 ? 'Đã chốt' : 'Dự thảo'}
      `;
     
      // Dùng await showConfirmDialog của bạn
      if(!await showConfirmDialog(confirmMsg)) return;


      try {
        const payload = { ...form, idNhanVien: Number(form.idNhanVien), idCa: Number(form.idCa) };
        await axios.put(`${API_URL}/${form.id}`, payload);
        showToast('Cập nhật thành công', 'success');
       
        // Reset originalForm
        originalForm.value = null;
        closeModal();
        fetchData();
      } catch (e: any) {
        showToast(e.response?.data?.message || 'Lỗi', 'error');
      }
      return;
  }


  // 3. Nếu là Tạo Mới (GIỮ NGUYÊN TOÀN BỘ LOGIC CŨ)
  try {
    let payloads = [];


    // Nếu CÓ dùng lặp lại (Chỉ check khi tạo mới)
    if (showRepeatModal.value || repeatConfig.daysOfWeek.length > 0) {
       
        const dates = generateDates();
        if (dates.length === 0) {
            showToast('Không có ngày nào được chọn để tạo lịch', 'warning');
            return;
        }
       
        // Hiển thị thông báo xác nhận
        const confirmMsg = `Hệ thống sẽ tạo <strong>${dates.length} lịch làm việc</strong><br>Từ ngày: <strong>${dates[0]}</strong><br>Đến ngày: <strong>${dates[dates.length-1]}</strong>`;
        if (!await showConfirmDialog(confirmMsg)) return;


        payloads = dates.map(date => ({
            ngayLamViec: date,
            idNhanVien: Number(form.idNhanVien),
            idCa: Number(form.idCa),
            ghiChu: form.ghiChu,
            trangThai: form.trangThai
        }));
       
        // Gọi API Batch
        await axios.post(`${API_URL}/batch`, payloads);
        showToast(`Đã tạo thành công ${dates.length} lịch làm việc`, 'success');


    } else {
        // Tạo 1 cái bình thường
        const payload = {
            ngayLamViec: form.ngayLamViec,
            idNhanVien: Number(form.idNhanVien),
            idCa: Number(form.idCa),
            ghiChu: form.ghiChu,
            trangThai: form.trangThai
        };
        await axios.post(API_URL, payload);
        showToast('Phân lịch thành công', 'success');
    }


    // Reset originalForm
    originalForm.value = null;
    closeModal();
    fetchData();
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Có lỗi xảy ra';
    if(msg.includes('trùng')) showToast(msg, 'error');
    else showToast(msg, 'error');
  }
};
// Hàm này gọi khi bấm nút OK ở Modal Update Option
const confirmUpdateSeries = async () => {
  const originalItem = schedules.value.find(s => s.id === form.id);
  if (!originalItem || !originalItem.maLapLai) return;


  try {
     const payload = {
        ngayLamViec: form.ngayLamViec,
        ghiChu: form.ghiChu,
        trangThai: form.trangThai,
        idNhanVien: Number(form.idNhanVien),
        idCa: Number(form.idCa)
     };


     if (updateOption.value === 'one') {
        // Option 1: Chỉ sửa cái này (API PUT thường)
        await axios.put(`${API_URL}/${form.id}`, payload);
        showToast('Đã cập nhật lịch này', 'success');
     } else {
        // Option 2: Sửa chuỗi (API PUT Series)
        await axios.put(`${API_URL}/series/${originalItem.maLapLai}`, payload);
        showToast('Đã cập nhật toàn bộ chuỗi lịch tương lai', 'success');
     }
     
     showUpdateOptionModal.value = false; // Đóng modal hỏi
     originalForm.value = null;
     closeModal(); // Đóng modal chính
     fetchData();
  } catch (error: any) {
     const msg = error.response?.data?.message || 'Lỗi cập nhật chuỗi';
     showToast(msg, 'error');
  }
};
// --- LOGIC CONTEXT MENU ---


// Mở menu khi click chuột phải
const openContextMenu = (event: MouseEvent, item: Schedule) => {
  contextMenu.visible = true;
  contextMenu.item = item;
  // Tính toán vị trí để không bị tràn màn hình
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
};


// Đóng menu
const closeContextMenu = () => {
  contextMenu.visible = false;
};


// Directive custom để click ra ngoài thì đóng menu (Thêm cái này vào script nếu chưa có)
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
};


// Xử lý khi bấm nút Xóa trong menu chuột phải
const handleRightClickDelete = () => {
  closeContextMenu();
  const item = contextMenu.item;
  if (!item) return;


  // Validate quá khứ
  const today = new Date().toISOString().split('T')[0];
  if (item.ngayLamViec < today) {
     showToast('Không thể xóa lịch quá khứ!', 'error');
     return;
  }


  // Kiểm tra xem lịch này có phải là lịch lặp lại không?
  // (Dựa vào field maLapLai ta vừa thêm ở Backend. Cần update Interface Schedule bên trên)
  if (item.maLapLai) {
     // Nếu có mã lặp lại -> Hiện modal hỏi
     deleteOption.value = 'one'; // Reset default
     showDeleteOptionModal.value = true;
  } else {
     // Nếu là lịch thường -> Xóa luôn (Confirm thường)
     handleDelete(item);
  }
};


// Xử lý xác nhận trong Modal chọn kiểu xóa
const confirmDeleteSeries = async () => {
  if (!contextMenu.item) return;
 
  try {
    if (deleteOption.value === 'one') {
       // Xóa 1 cái
       await axios.delete(`${API_URL}/${contextMenu.item.id}`);
       showToast('Đã xóa lịch làm việc', 'success');
    } else {
       // Xóa hàng loạt (Gọi API mới)
       await axios.delete(`${API_URL}/series/${contextMenu.item.maLapLai}`);
       showToast('Đã xóa chuỗi lịch (các ngày tương lai)', 'success');
    }
    fetchData();
  } catch (error: any) {
    showToast(error.response?.data?.message || 'Lỗi khi xóa', 'error');
  } finally {
    showDeleteOptionModal.value = false;
  }
};
const handleDelete = async (item: Schedule) => {
  // 1. Check ngày quá khứ ngay tại Client (Nhanh & Mượt)
  const today = new Date().toISOString().split('T')[0];
  if (item.ngayLamViec < today) {
     showToast('Không thể xóa lịch sử làm việc đã qua!', 'error');
     return;
  }


  // 2. Confirm với dialog đẹp
  const confirmMsg = `Bạn có chắc chắn muốn xóa lịch làm việc?<br><br><strong>Ngày:</strong> ${item.ngayLamViec}<br><strong>Nhân viên:</strong> ${item.nhanVien?.hoTen}<br><strong>Ca làm việc:</strong> ${item.caLamViec?.tenCa}`;
  if(!await showConfirmDialog(confirmMsg)) return;
 
  // 3. Gọi API
  try {
    await axios.delete(`${API_URL}/${item.id}`);
    showToast('Đã xóa lịch làm việc', 'success');
    fetchData();
  } catch (error: any) {
    // Vẫn giữ logic bắt lỗi backend để an toàn tuyệt đối
    const msg = error.response?.data?.message || error.response?.data || 'Lỗi khi xóa';
    showToast(msg, 'error');
  }
};


// --- 5. MODAL HANDLERS ---
const openAddModal = () => {
  isEditing.value = false;
  form.id = null;
  form.ngayLamViec = filters.date || new Date().toISOString().split('T')[0];
  form.idNhanVien = '';
  form.idCa = '';      
  form.ghiChu = '';
  form.trangThai = 1;
  clearErrors(); // Reset lỗi
  resetRepeatConfig();
  showModal.value = true;
};


const openEditModal = (item: Schedule) => {
  isEditing.value = true;
  form.id = item.id;
  form.ngayLamViec = item.ngayLamViec;
 
  const nv = item.nhanVien;
  if (nv) form.idNhanVien = nv.id || (nv as any).idNv || '';
  else form.idNhanVien = '';
 
  const ca = item.caLamViec;
  if (ca) form.idCa = ca.idCa || '';
  else form.idCa = '';


  form.ghiChu = item.ghiChu || '';
  form.trangThai = item.trangThai;
 
  // Lưu giá trị gốc để so sánh thay đổi
  originalForm.value = {
    ngayLamViec: form.ngayLamViec,
    idNhanVien: form.idNhanVien,
    idCa: form.idCa,
    ghiChu: form.ghiChu,
    trangThai: form.trangThai
  };
 
  clearErrors(); // Reset lỗi
  showModal.value = true;
};


const closeModal = async () => {
  // Nếu đang chỉnh sửa và có thay đổi, xác nhận trước khi đóng
  if (isEditing.value && hasFormChanged.value) {
    const confirmMsg = `Bạn có thay đổi chưa được lưu.<br>Bạn có chắc chắn muốn hủy các thay đổi này?`;
    if(!await showConfirmDialog(confirmMsg)) return;
  }
  showModal.value = false;
  originalForm.value = null;
};


// --- 6. LOGIC FILTERS & CALENDAR (Giữ nguyên) ---


watch(() => filters.date, (newDate) => {
  if (newDate) {
    const d = new Date(newDate);
    currentMonth.value = d.getMonth();
    currentYear.value = d.getFullYear();
  }
});


const resetFilters = () => {
  filters.date = '';
  filters.employeeName = '';
  filters.shiftName = '';
  filters.status = 'all';
  page.value = 0;
  goToToday();
};


const formatTime = (time: string) => time ? time.substring(0, 5) : '--:--';
// --- Helper Format Ngày ---
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  // Giả sử dateStr dạng YYYY-MM-DD (từ backend trả về)
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};
// Logic cho BẢNG (Table)
const filteredSchedules = computed(() => {
  return schedules.value.filter(s => {
    const matchDate = !filters.date || s.ngayLamViec === filters.date;
    const name = s.nhanVien?.hoTen?.toLowerCase() || '';
    const code = s.nhanVien?.maNv?.toLowerCase() || '';
    const searchName = filters.employeeName.toLowerCase();
    const matchEmpName = !filters.employeeName || name.includes(searchName) || code.includes(searchName);
    const matchShiftName = !filters.shiftName ||
                           (s.caLamViec?.tenCa && s.caLamViec.tenCa.toLowerCase().includes(filters.shiftName.toLowerCase()));
    const matchStatus = filters.status === 'all' || s.trangThai === filters.status;
    return matchDate && matchEmpName && matchShiftName && matchStatus;
  });
});


const totalPages = computed(() => Math.max(1, Math.ceil(filteredSchedules.value.length / perPage.value)));
const pagedSchedules = computed(() => filteredSchedules.value.slice(page.value * perPage.value, (page.value + 1) * perPage.value));
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = page.value + 1;
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;


  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }


  range.forEach(i => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  });
  return rangeWithDots;
});


const changePage = (newPage: number) => {
  if (newPage < 0 || newPage >= totalPages.value) return;
  page.value = newPage;
};


// Logic cho LỊCH (Calendar)
const calendarDays = computed(() => {
  const days = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  let startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = 0; i < startDay; i++) {
    days.push({ day: null, dateStr: '' });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const monthStr = String(currentMonth.value + 1).padStart(2, '0');
    const dayStr = String(i).padStart(2, '0');
    days.push({ day: i, dateStr: `${currentYear.value}-${monthStr}-${dayStr}` });
  }
  return days;
});


const getSchedulesForCalendarCell = (dateStr: string) => {
  if (!dateStr) return [];
  return schedules.value.filter(s => {
    if (s.ngayLamViec !== dateStr) return false;
    const name = s.nhanVien?.hoTen?.toLowerCase() || '';
    const code = s.nhanVien?.maNv?.toLowerCase() || '';
    const searchName = filters.employeeName.toLowerCase();
    const matchEmpName = !filters.employeeName || name.includes(searchName) || code.includes(searchName);
    const matchShiftName = !filters.shiftName ||
                           (s.caLamViec?.tenCa && s.caLamViec.tenCa.toLowerCase().includes(filters.shiftName.toLowerCase()));
    const matchStatus = filters.status === 'all' || s.trangThai === filters.status;
    return matchEmpName && matchShiftName && matchStatus;
  });
};


const monthTitle = computed(() => `Tháng ${currentMonth.value + 1} - ${currentYear.value}`);


const changeMonth = (step: number) => {
  let newMonth = currentMonth.value + step;
  if (newMonth > 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else if (newMonth < 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value = newMonth;
  }
};


const goToToday = () => {
  const now = new Date();
  currentMonth.value = now.getMonth();
  currentYear.value = now.getFullYear();
};


// --- HÀM XUẤT EXCEL ---
const exportExcel = async () => {
  // 1. Khởi tạo Workbook và Worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lịch làm việc');


  // 2. Định nghĩa các cột
  worksheet.columns = [
    { key: 'stt', width: 10 },
    { key: 'ngayLamViec', width: 15 },
    { key: 'maNv', width: 15 },
    { key: 'hoTen', width: 30 },
    { key: 'tenCa', width: 20 },
    { key: 'gioBatDau', width: 12 },
    { key: 'gioKetThuc', width: 12 },
    { key: 'ghiChu', width: 30 },
    { key: 'trangThai', width: 15 },
  ];


  // 3. Tạo Tiêu đề lớn (Dòng 1) - Merge cell
  worksheet.mergeCells('A1:I1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'DANH SÁCH LỊCH LÀM VIỆC';
  titleCell.font = { name: 'Times New Roman', size: 16, bold: true, color: { argb: 'FF000000' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };


  // 4. Tạo Ngày xuất file (Dòng 2) - Merge cell
  worksheet.mergeCells('A2:I2');
  const subTitleCell = worksheet.getCell('A2');
  const today = new Date();
  subTitleCell.value = `Xuất file excel vào: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  subTitleCell.font = { name: 'Times New Roman', size: 11, italic: true };
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };


  // Thêm 1 dòng trống
  worksheet.addRow([]);


  // 5. Tạo Header bảng (Dòng 4)
  const headerRow = worksheet.addRow([
    'STT', 'Ngày làm việc', 'Mã NV', 'Họ và tên', 'Ca làm việc', 'Giờ bắt đầu', 'Giờ kết thúc', 'Ghi chú', 'Trạng thái'
  ]);


  // Style cho Header
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Times New Roman', bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });


  // 6. Đổ dữ liệu lịch làm việc vào
  const dataToExport = filteredSchedules.value;


  dataToExport.forEach((sche, index) => {
    const row = worksheet.addRow([
      index + 1,
      sche.ngayLamViec,
      sche.nhanVien?.maNv || '---',
      sche.nhanVien?.hoTen || 'Không có tên',
      sche.caLamViec?.tenCa || '---',
      formatTime(sche.caLamViec?.gioBatDau),
      formatTime(sche.caLamViec?.gioKetThuc),
      sche.ghiChu || '',
      sche.trangThai === 1 ? 'Đã chốt' : 'Dự thảo'
    ]);


    // Style border cho từng cell dữ liệu
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Times New Roman' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      // Căn giữa cho STT, Ngày, Giờ, Trạng thái
      if(colNumber === 1 || colNumber === 2 || colNumber === 6 || colNumber === 7 || colNumber === 9) {
         cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
         cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });


  // 7. Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `LichLamViec_${Date.now()}.xlsx`);
  showToast('Xuất Excel thành công!', 'success');
};


onMounted(fetchData);
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
        <div class="header-actions">
           <div class="view-toggle">
              <button class="toggle-btn" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">
                 📋 Bảng
              </button>
              <button class="toggle-btn" :class="{ active: viewMode === 'calendar' }" @click="viewMode = 'calendar'">
                 📅 Lịch
              </button>
           </div>


           <button class="btn btn-primary" @click="openAddModal">
             <span class="plus-icon">+</span> Phân lịch
           </button>
        </div>
      </div>


      <div class="filter-row">
        <div class="left-filters">
          <div class="filter-group">
            <span class="filter-label">Ngày:</span>
            <input type="date" class="mini-input" v-model="filters.date" />
          </div>


          <div class="filter-group">
            <span class="filter-label">Trạng thái:</span>
            <select class="mini-select" v-model="filters.status">
              <option value="all">Tất cả</option>
              <option :value="1">Đã chốt</option>
              <option :value="0">Dự thảo</option>
            </select>
          </div>


          <div class="filter-group">
            <span class="filter-label">Tên/Mã NV:</span>
            <input type="text" class="mini-input search" v-model="filters.employeeName" placeholder="Tìm NV (Tên/Mã)..." />
          </div>


          <div class="filter-group">
            <span class="filter-label">Tên ca:</span>
            <input type="text" class="mini-input search" v-model="filters.shiftName" placeholder="Tìm tên ca..." />
          </div>
        </div>
       
        <div class="right-actions">
          <button class="btn btn-outline" @click="resetFilters">Làm mới</button>
          <button class="btn btn-outline" @click="exportExcel">Xuất Excel</button>
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
            <tr v-else-if="filteredSchedules.length === 0">
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
                <span class="status-badge" :class="item.trangThai === 1 ? 'active' : 'draft'">
                    {{ item.trangThai === 1 ? 'Đã chốt' : 'Dự thảo' }}
                </span>
              </td>
              <td class="text-center">
                <div class="action-group center-actions">
                  <button class="action-btn" @click="openEditModal(item)" data-tooltip="Sửa">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="action-btn delete-btn" @click="handleDelete(item)" data-tooltip="Xóa">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
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
            <div class="month-nav">
                <button class="nav-btn" @click="changeMonth(-1)">❮</button>
                <h2 class="current-month">{{ monthTitle }}</h2>
                <button class="nav-btn" @click="changeMonth(1)">❯</button>
                <button class="btn-today" @click="goToToday">Hôm nay</button>
            </div>
            <div class="legend-mini">
                <div class="legend-item"><span class="dot active"></span> Đã chốt</div>
                <div class="legend-item"><span class="dot draft"></span> Dự thảo</div>
            </div>
        </div>


        <div class="calendar-grid">
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
                    'today': cell.dateStr === new Date().toISOString().split('T')[0],
                    'selected-day': cell.dateStr && cell.dateStr === filters.date
                }"
                @click="cell.day && (filters.date = cell.dateStr)"
            >
                <div v-if="cell.day" class="day-number">{{ cell.day }}</div>
                <div v-if="cell.day" class="shifts-container">
                    <div v-for="sche in getSchedulesForCalendarCell(cell.dateStr)" :key="sche.id"
                          class="shift-item"
                          :class="{'draft': sche.trangThai === 0}"
                          @click.stop="openContextMenu($event, sche)"
                          :data-tooltip="`${sche.nhanVien?.hoTen} (${sche.caLamViec?.tenCa})`"
                      >
                        <span class="shift-time">{{ formatTime(sche.caLamViec?.gioBatDau) }}</span>
                        <span class="shift-name">{{ sche.nhanVien?.hoTen }}</span>
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
                   {{ repeatConfig.daysOfWeek.length > 0 ? 'Đang bật chế độ lặp lại' : 'Không lặp lại' }}
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


          <div class="form-group">
             <label>Trạng thái</label>
             <select v-model="form.trangThai" class="form-control">
               <option :value="1">Đã chốt (Công khai)</option>
               <option :value="0">Dự thảo (Ẩn)</option>
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
    <div v-if="confirmDialog.show" class="modal-backdrop z-highest" @click.self="handleConfirm(false)">
       <div class="confirm-dialog-box form-page-animation">
          <div class="confirm-header">
             <div class="confirm-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <circle cx="12" cy="12" r="10"></circle>
                   <line x1="12" y1="16" x2="12" y2="12"></line>
                   <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
             </div>
             <h3>Lưu ý</h3>
          </div>
          <div class="confirm-body">
             <div class="confirm-message" v-html="confirmDialog.message"></div>
          </div>
          <div class="confirm-footer">
             <button class="btn btn-secondary" @click="handleConfirm(false)">Hủy bỏ</button>
             <button class="btn btn-primary" @click="handleConfirm(true)">Xác nhận</button>
          </div>
       </div>
    </div>
    <div v-if="contextMenu.visible"
         class="context-menu"
         :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
         v-click-outside="closeContextMenu">
       <div class="menu-item delete" @click="handleRightClickDelete">
           Xóa lịch
       </div>
       <div class="menu-item" @click="contextMenu.item && openEditModal(contextMenu.item); closeContextMenu()">
          Sửa lịch
        </div>
    </div>


    <div v-if="showDeleteOptionModal" class="modal-backdrop z-high" @click.self="showDeleteOptionModal = false">
       <div class="modal-box small-box form-page-animation">
          <div class="modal-header">
             <h3>Xóa sự kiện định kỳ</h3>
          </div>
          <div class="modal-body">
             <p class="mb-3">Bạn muốn xóa sự kiện này hay tất cả sự kiện trong chuỗi?</p>
             
             <div class="radio-group-vertical">
                <label class="radio-row">
                   <input type="radio" value="one" v-model="deleteOption">
                   <span>Chỉ sự kiện này ({{ formatDate(contextMenu.item?.ngayLamViec || '') }})</span>
                </label>
                <label class="radio-row">
                   <input type="radio" value="all" v-model="deleteOption">
                   <span>Sự kiện này và các sự kiện sau (Tương lai)</span>
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
             <h3>Cập nhật sự kiện định kỳ</h3>
          </div>
          <div class="modal-body">
             <p class="mb-3">Đây là lịch lặp lại. Bạn muốn áp dụng thay đổi này cho?</p>
             
             <div class="radio-group-vertical">
                <label class="radio-row">
                   <input type="radio" value="one" v-model="updateOption">
                   <span>Chỉ sự kiện này</span>
                </label>
                <label class="radio-row">
                   <input type="radio" value="all" v-model="updateOption">
                   <span>Sự kiện này và các sự kiện sau</span>
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
 </template>


<style scoped>
/* === GIỮ NGUYÊN STYLE CŨ === */
.page-container { min-height: 100vh; }
.card-section { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 24px; margin-bottom: 24px; }


/* HEADER & FILTER */
.filter-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #f3f4f6; padding-bottom: 16px; }
.card-title { color: #63391F; font-weight: 800; font-size: 20px; margin: 0; }
.header-actions { display: flex; gap: 15px; align-items: center; }


/* VIEW TOGGLE */
.view-toggle { background: #f3f4f6; padding: 4px; border-radius: 8px; display: flex; gap: 4px; }
.toggle-btn { border: none; background: transparent; padding: 6px 16px; font-weight: 600; font-size: 14px; color: #6b7280; border-radius: 6px; cursor: pointer; transition: 0.2s; }
.toggle-btn.active { background: #63391F; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.toggle-btn:hover:not(.active) { background: #e5e7eb; }


/* FILTERS */
.filter-row { display: flex; justify-content: space-between; align-items: center; background: #f9fafb; padding: 16px; border-radius: 8px; flex-wrap: wrap; gap: 12px; }
.left-filters { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; flex: 1; }
.right-actions { display: flex; gap: 10px; }
.filter-group { display: flex; align-items: center; gap: 8px; }
.filter-label { font-weight: 600; color: #4b5563; font-size: 14px; white-space: nowrap; }
.mini-input, .mini-select { height: 38px; padding: 0 12px; border: 1px solid #d1d5db; border-radius: 6px; outline: none; font-size: 14px; background: white; }
.mini-input.search { width: 180px; }
.mini-input:focus, .mini-select:focus { border-color: #63391F; }


/* BUTTONS */
.btn { height: 40px; padding: 0 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; border: none; font-size: 14px; transition: 0.2s; white-space: nowrap; }
.btn-primary { background: linear-gradient(135deg, #8B5A2B, #63391F); color: white; box-shadow: 0 4px 6px rgba(99, 57, 31, 0.2); }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 12px rgba(99, 57, 31, 0.3); }
.btn-secondary { background: #e5e7eb; color: #374151; }
.btn-outline { background: white; border: 1px solid #d1d5db; color: #4b5563; }
.btn-outline:hover { border-color: #63391F; color: #63391F; background: #fff8f5; }


/* TABLE STYLES */
.table-container { width: 100%; overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 8px; background: white; }
.custom-table { width: 100%; min-width: 1000px; border-collapse: collapse; table-layout: fixed; }
.custom-table th { background: #f9fafb; color: #374151; padding: 14px 16px; font-weight: 700; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-transform: uppercase; white-space: nowrap; }
.custom-table td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; white-space: nowrap; }
.text-center { text-align: center !important; }
.date-badge { font-weight: 600; color: #374151; font-size: 14px; }
.employee-info { display: flex; flex-direction: column; }
.emp-code { font-size: 12px; color: #6b7280; font-weight: 600; }
.emp-name { font-size: 14px; color: #111827; font-weight: 600; }
.shift-badge { background: #E0E7FF; color: #4338CA; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block; }
.small-note { font-size: 11px; color: #6b7280; margin-top: 4px; font-style: italic; }
.time-text { font-family: monospace; font-weight: 500; color: #4b5563; background: #F3F4F6; padding: 4px 8px; border-radius: 4px; font-size: 13px; }
.status-badge { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; }
.active { background: #DCFCE7; color: #166534; }
.draft { background: #FEF3C7; color: #92400E; }  
.action-group.center-actions { display: flex; align-items: center; justify-content: center; gap: 10px; }
.action-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #e5e7eb; border-radius: 8px; color: #6b7280; cursor: pointer; transition: all 0.2s; position: relative; }
.action-btn:hover { border-color: #63391F; color: #63391F; background: #fff8f5; }
.delete-btn:hover { border-color: #DC2626; color: #DC2626; background: #FEF2F2; }


/* PAGINATION */
.pagination-footer { display: flex; justify-content: center; gap: 6px; margin-top: 24px; }
.p-btn { width: 36px; height: 36px; background: #FFF; border: 1px solid #E5E7EB; border-radius: 6px; cursor: pointer; color: #4B5563; font-weight: 500; transition: 0.2s; }
.p-btn.active { background: #63391F; border-color: #63391F; color: #FFF; }
.p-btn:hover:not(.active):not(:disabled) { background: #F9FAFB; border-color: #D1D5DB; }
.p-btn:disabled { background: #F9F9F9; color: #CCC; border-color: #EEE; cursor: not-allowed; }
.dots { color: #999; padding: 0 5px; font-weight: bold; }


/* CALENDAR STYLES */
.calendar-card { min-height: 700px; display: flex; flex-direction: column; }
.calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.month-nav { display: flex; align-items: center; gap: 15px; }
.current-month { color: #63391F; font-size: 20px; font-weight: 800; margin: 0; min-width: 180px; text-align: center; }
.nav-btn { background: #f3f4f6; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-weight: bold; color: #555; }
.nav-btn:hover { background: #63391F; color: white; }
.btn-today { background: white; border: 1px solid #d1d5db; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; color: #555; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; flex: 1; }
.weekday-header { background: #f9fafb; padding: 10px; text-align: center; font-weight: 700; color: #374151; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; font-size: 13px; }
.weekday-header:last-child { border-right: none; }
.text-red { color: #dc2626; }
.day-cell { min-height: 100px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 6px; position: relative; background: white; cursor: pointer; }
.day-cell:nth-child(7n) { border-right: none; }
.day-cell.empty { background: #fcfcfc; }
.day-cell.today { background: #fff8f5; }
.day-cell.selected-day { box-shadow: inset 0 0 0 2px #63391F; }
.day-number { font-weight: 700; font-size: 13px; color: #374151; margin-bottom: 6px; text-align: right; }
.today .day-number { color: #63391F; text-decoration: underline; }
.shifts-container { display: flex; flex-direction: column; gap: 3px; overflow-y: auto; max-height: 80px; }
.shift-item { background: #E0E7FF; color: #3730a3; padding: 3px 5px; border-radius: 3px; font-size: 11px; display: flex; justify-content: space-between; border-left: 3px solid #4f46e5; cursor: pointer; position: relative; }
.shift-item.draft { background: #fffbeb; color: #92400e; border-left-color: #f59e0b; }
.shift-time { font-weight: 700; margin-right: 4px; }
.shift-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.legend-mini { display: flex; gap: 15px; font-size: 12px; color: #555; }
.legend-item { display: flex; align-items: center; gap: 5px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.active { background: #4f46e5; }
.dot.draft { background: #f59e0b; }


/* TOOLTIP */
[data-tooltip] { position: relative; }
[data-tooltip]::before {
  content: attr(data-tooltip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(-5px);
  background: #333; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; white-space: nowrap;
  opacity: 0; visibility: hidden; transition: 0.2s; pointer-events: none; z-index: 100;
}
[data-tooltip]:hover::before { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(-10px); }


/* MODAL */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(2px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal-box { background: white; width: 500px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { background: #63391F; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; color: white; }
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
.z-high { z-index: 1100; } /* Cao hơn modal thường */
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
.day-circle.active { background: #63391F; color: white; box-shadow: 0 2px 5px rgba(99,57,31,0.3); }


/* Confirm Dialog */
.z-highest { z-index: 1200; }
.confirm-dialog-box {
  background: white; width: 450px; border-radius: 16px;
  overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  animation: scaleUp 0.3s ease-out;
}
@keyframes scaleUp {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.confirm-header {
  padding: 32px 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.confirm-icon {
  width: 72px; height: 72px;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.confirm-icon svg {
  stroke: #D97706;
  stroke-width: 2.5;
}
.confirm-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}
.confirm-body {
  padding: 0 32px 24px;
}
.confirm-message {
  text-align: center;
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
}
.confirm-message strong {
  color: #63391F;
  font-weight: 700;
}
.confirm-footer {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
  gap: 12px;
}
.confirm-footer .btn {
  min-width: 120px;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}
.confirm-footer .btn-secondary {
  background: #F3F4F6;
  color: #374151;
  border: none;
}
.confirm-footer .btn-secondary:hover {
  background: #E5E7EB;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
}
.confirm-footer .btn-primary {
  background: linear-gradient(135deg, #8B5A2B, #63391F);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(99, 57, 31, 0.3);
}
.confirm-footer .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 57, 31, 0.4);
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
</style>


