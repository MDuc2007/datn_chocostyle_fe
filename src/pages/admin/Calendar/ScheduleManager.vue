<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from "vue";
import axios from "axios";

// --- 1. INTERFACES ---
interface Employee {
  id: number;
  maNv: string;
  hoTen: string;
  chucVu?: string;
}
interface Shift {
  id: number;
  idCa: number; // SỬA: Dùng chính xác idCa
  tenCa: string;
  gioBatDau: string;
  gioKetThuc: string;
}

interface Schedule {
  id: number;
  ngayLamViec: string;
  nhanVien: Employee;
  caLamViec: Shift;
  ghiChu?: string;
  trangThai: number; // 1: Công khai, 0: Ẩn
}

// API Endpoints
const API_URL = "http://localhost:8080/api/lich-lam-viec";
const API_EMP = "http://localhost:8080/api/nhan-vien";
const API_SHIFT = "http://localhost:8080/api/ca-lam-viec";

// --- 2. STATE ---
const schedules = ref<Schedule[]>([]);
const employees = ref<Employee[]>([]);
const shifts = ref<Shift[]>([]);

const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);

// VIEW MODE: 'table' hoặc 'calendar'
const viewMode = ref<"table" | "calendar">("table");

// Calendar State
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());

// Filter State
const filters = reactive({
  date: "",
  employeeName: "",
  shiftName: "",
  status: "all" as string | number,
});

// Pagination State
const perPage = ref(8);
const page = ref(0);

// Form Data
const form = reactive({
  id: null as number | null,
  ngayLamViec: new Date().toISOString().split("T")[0],
  idNhanVien: "" as string | number,
  idCa: "" as string | number,
  ghiChu: "",
  trangThai: 0,
});

// Toast
const notifications = ref<{ id: number; message: string; type: string }[]>([]);
const showToast = (message: string, type: "success" | "error" | "warning") => {
  const id = Date.now();
  notifications.value.push({ id, message, type });
  setTimeout(
    () =>
      (notifications.value = notifications.value.filter((n) => n.id !== id)),
    3000,
  );
};

// --- 3. API ACTIONS ---
const fetchData = async () => {
  loading.value = true;
  try {
    // Nếu dữ liệu quá lớn, bạn nên gọi API theo tháng (from...to)
    // Ở đây tôi giữ nguyên logic lấy tất cả để đơn giản hóa filter client-side
    const [resSch, resEmp, resShift] = await Promise.all([
      axios.get(API_URL),
      axios.get(API_EMP),
      axios.get(API_SHIFT),
    ]);
    schedules.value = resSch.data;
    employees.value = resEmp.data;
    shifts.value = resShift.data;
  } catch (error) {
    showToast("Lỗi kết nối server", "error");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  if (!form.idNhanVien || !form.idCa || !form.ngayLamViec) {
    showToast("Vui lòng nhập đầy đủ thông tin bắt buộc (*)", "warning");
    return;
  }

  // Check trùng
  const isDuplicate = schedules.value.some(
    (s) =>
      s.ngayLamViec === form.ngayLamViec &&
      (s.nhanVien?.id === Number(form.idNhanVien) ||
        (s.nhanVien as any)?.idNv === Number(form.idNhanVien)) &&
      s.caLamViec?.idCa === Number(form.idCa) &&
      s.id !== form.id,
  );

  if (isDuplicate) {
    showToast("Nhân viên này đã có lịch trùng trong ca này!", "error");
    return;
  }

  try {
    const payload = {
      id: form.id,
      ngayLamViec: form.ngayLamViec,
      ghiChu: form.ghiChu,
      trangThai: form.trangThai,
      idNhanVien: Number(form.idNhanVien),
      idCa: Number(form.idCa),
    };

    if (isEditing.value && form.id) {
      await axios.put(`${API_URL}/${form.id}`, payload);
      showToast("Cập nhật thành công", "success");
    } else {
      const { id, ...createPayload } = payload;
      await axios.post(API_URL, createPayload);
      showToast("Phân lịch thành công", "success");
    }
    closeModal();
    fetchData();
  } catch (error: any) {
    showToast(error.response?.data?.message || "Lỗi xử lý dữ liệu", "error");
  }
};

const handleDelete = async (id: number) => {
  if (!confirm("Bạn chắc chắn muốn xóa lịch này?")) return;
  try {
    await axios.delete(`${API_URL}/${id}`);
    showToast("Đã xóa lịch làm việc", "success");
    fetchData();
  } catch (error) {
    showToast("Lỗi khi xóa", "error");
  }
};

// --- 4. MODAL HANDLERS ---
const openAddModal = () => {
  isEditing.value = false;
  form.id = null;
  // Nếu đang chọn ngày ở bộ lọc thì lấy ngày đó, không thì lấy hôm nay
  form.ngayLamViec = filters.date || new Date().toISOString().split("T")[0];
  form.idNhanVien = "";
  form.idCa = "";
  form.ghiChu = "";
  form.trangThai = 1;
  showModal.value = true;
};

const openEditModal = (item: Schedule) => {
  isEditing.value = true;
  form.id = item.id;
  form.ngayLamViec = item.ngayLamViec;

  const nv = item.nhanVien;
  if (nv)
    form.idNhanVien = nv.id || (nv as any).idNv || (nv as any).id_nv || "";
  else form.idNhanVien = "";

  const ca = item.caLamViec;
  if (ca) form.idCa = ca.idCa || (ca as any).id || (ca as any).id_ca || "";
  else form.idCa = "";

  form.ghiChu = item.ghiChu || "";
  form.trangThai = item.trangThai;
  showModal.value = true;
};

const closeModal = () => (showModal.value = false);

// --- 5. LOGIC FILTERS & CALENDAR ---

// Watch filter date để nhảy lịch đến tháng đó
watch(
  () => filters.date,
  (newDate) => {
    if (newDate) {
      const d = new Date(newDate);
      currentMonth.value = d.getMonth();
      currentYear.value = d.getFullYear();
    }
  },
);

const resetFilters = () => {
  filters.date = "";
  filters.employeeName = "";
  filters.shiftName = "";
  filters.status = "all";
  page.value = 0;
  goToToday();
};

const formatTime = (time: string) => (time ? time.substring(0, 5) : "--:--");

// Logic cho BẢNG (Table) - Lọc chặt chẽ
const filteredSchedules = computed(() => {
  return schedules.value.filter((s) => {
    // Nếu có chọn ngày -> Lọc đúng ngày. Nếu không -> Hiện tất cả
    const matchDate = !filters.date || s.ngayLamViec === filters.date;

    const name = s.nhanVien?.hoTen?.toLowerCase() || "";
    const code = s.nhanVien?.maNv?.toLowerCase() || "";
    const searchName = filters.employeeName.toLowerCase();
    const matchEmpName =
      !filters.employeeName ||
      name.includes(searchName) ||
      code.includes(searchName);

    const matchShiftName =
      !filters.shiftName ||
      (s.caLamViec?.tenCa &&
        s.caLamViec.tenCa
          .toLowerCase()
          .includes(filters.shiftName.toLowerCase()));

    const matchStatus =
      filters.status === "all" || s.trangThai === filters.status;

    return matchDate && matchEmpName && matchShiftName && matchStatus;
  });
});

// Pagination computeds
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredSchedules.value.length / perPage.value)),
);
const pagedSchedules = computed(() =>
  filteredSchedules.value.slice(
    page.value * perPage.value,
    (page.value + 1) * perPage.value,
  ),
);
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = page.value + 1;
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
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

  // Tính padding đầu tháng (0=Mon, 6=Sun)
  let startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = 0; i < startDay; i++) {
    days.push({ day: null, dateStr: "" });
  }

  // Các ngày trong tháng
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const monthStr = String(currentMonth.value + 1).padStart(2, "0");
    const dayStr = String(i).padStart(2, "0");
    days.push({
      day: i,
      dateStr: `${currentYear.value}-${monthStr}-${dayStr}`,
    });
  }
  return days;
});

// Lọc dữ liệu hiển thị TRÊN LỊCH (Không lọc ngày, chỉ lọc NV/Ca/Trạng thái)
const getSchedulesForCalendarCell = (dateStr: string) => {
  if (!dateStr) return [];
  return schedules.value.filter((s) => {
    if (s.ngayLamViec !== dateStr) return false;

    // Áp dụng các bộ lọc còn lại
    const name = s.nhanVien?.hoTen?.toLowerCase() || "";
    const code = s.nhanVien?.maNv?.toLowerCase() || "";
    const searchName = filters.employeeName.toLowerCase();
    const matchEmpName =
      !filters.employeeName ||
      name.includes(searchName) ||
      code.includes(searchName);

    const matchShiftName =
      !filters.shiftName ||
      (s.caLamViec?.tenCa &&
        s.caLamViec.tenCa
          .toLowerCase()
          .includes(filters.shiftName.toLowerCase()));

    const matchStatus =
      filters.status === "all" || s.trangThai === filters.status;

    return matchEmpName && matchShiftName && matchStatus;
  });
};

// Điều hướng lịch
const monthTitle = computed(
  () => `Tháng ${currentMonth.value + 1} - ${currentYear.value}`,
);

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
  // Nếu đang lọc ngày thì reset ngày về hôm nay để lịch highlight đúng
  // filters.date = now.toISOString().split('T')[0];
};

onMounted(fetchData);
</script>

<template>
  <div class="page-container">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="toast"
          :class="notif.type"
        >
          <span class="toast-icon">{{
            notif.type === "success"
              ? "✅"
              : notif.type === "error"
                ? "❌"
                : "⚠️"
          }}</span>
          <span class="toast-msg">{{ notif.message }}</span>
        </div>
      </TransitionGroup>
    </div>

    <div class="card-section filter-card form-page-animation">
      <div class="filter-card-header">
        <h2 class="card-title">QUẢN LÝ LỊCH LÀM VIỆC</h2>
        <div class="header-actions">
          <div class="view-toggle">
            <button
              class="toggle-btn"
              :class="{ active: viewMode === 'table' }"
              @click="viewMode = 'table'"
            >
              📋 Bảng
            </button>
            <button
              class="toggle-btn"
              :class="{ active: viewMode === 'calendar' }"
              @click="viewMode = 'calendar'"
            >
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
            <span class="filter-label">Tên/Mã nhân viên:</span>
            <input
              type="text"
              class="mini-input search"
              v-model="filters.employeeName"
              placeholder="Tìm NV (Tên/Mã)..."
            />
          </div>

          <div class="filter-group">
            <span class="filter-label">Tên ca:</span>
            <input
              type="text"
              class="mini-input search"
              v-model="filters.shiftName"
              placeholder="Tìm tên ca..."
            />
          </div>
        </div>

        <button class="btn btn-outline" @click="resetFilters">Làm mới</button>
      </div>
    </div>

    <div
      v-if="viewMode === 'table'"
      class="card-section table-card form-page-animation"
    >
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
              <td colspan="7" class="text-center py-4 text-muted">
                Không tìm thấy dữ liệu
              </td>
            </tr>
            <tr v-else v-for="(item, index) in pagedSchedules" :key="item.id">
              <td class="text-center font-bold text-gray-500">
                {{ index + 1 }}
              </td>
              <td>
                <div class="employee-info">
                  <span class="emp-code">{{
                    item.nhanVien?.maNv || "---"
                  }}</span>
                  <span class="emp-name">{{
                    item.nhanVien?.hoTen || "Không có tên"
                  }}</span>
                </div>
              </td>
              <td>
                <span class="shift-badge">{{ item.caLamViec?.tenCa }}</span>
                <div v-if="item.ghiChu" class="small-note">
                  📝 {{ item.ghiChu }}
                </div>
              </td>
              <td>
                <span class="time-text">
                  {{ formatTime(item.caLamViec?.gioBatDau) }} -
                  {{ formatTime(item.caLamViec?.gioKetThuc) }}
                </span>
              </td>
              <td>
                <div class="date-badge">📅 {{ item.ngayLamViec }}</div>
              </td>
              <td class="text-center">
                <span
                  class="status-badge"
                  :class="item.trangThai === 1 ? 'active' : 'draft'"
                >
                  {{ item.trangThai === 1 ? "Đã chốt" : "Dự thảo" }}
                </span>
              </td>
              <td class="text-center">
                <div class="action-group center-actions">
                  <button
                    class="action-btn"
                    @click="openEditModal(item)"
                    data-tooltip="Sửa"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      ></path>
                      <path
                        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                      ></path>
                    </svg>
                  </button>
                  <button
                    class="action-btn delete-btn"
                    @click="handleDelete(item.id)"
                    data-tooltip="Xóa"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      ></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-footer" v-if="totalPages > 1">
        <button
          class="p-btn"
          :disabled="page === 0"
          @click="changePage(page - 1)"
        >
          &lt;
        </button>
        <template v-for="p in visiblePages" :key="p">
          <button
            v-if="p !== '...'"
            class="p-btn number"
            :class="{ active: p === page + 1 }"
            @click="changePage((p as number) - 1)"
          >
            {{ p }}
          </button>
          <span v-else class="dots">...</span>
        </template>
        <button
          class="p-btn"
          :disabled="page >= totalPages - 1"
          @click="changePage(page + 1)"
        >
          &gt;
        </button>
      </div>
    </div>

    <div
      v-if="viewMode === 'calendar'"
      class="card-section calendar-card form-page-animation"
    >
      <div class="calendar-header">
        <div class="month-nav">
          <button class="nav-btn" @click="changeMonth(-1)">❮</button>
          <h2 class="current-month">{{ monthTitle }}</h2>
          <button class="nav-btn" @click="changeMonth(1)">❯</button>
          <button class="btn-today" @click="goToToday">Hôm nay</button>
        </div>
        <div class="legend-mini">
          <div class="legend-item">
            <span class="dot active"></span> Đã chốt
          </div>
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

        <div
          v-for="(cell, index) in calendarDays"
          :key="index"
          class="day-cell"
          :class="{
            empty: !cell.day,
            today: cell.dateStr === new Date().toISOString().split('T')[0],
            /* SỬA 1: Thêm điều kiện cell.dateStr phải có giá trị */
            'selected-day': cell.dateStr && cell.dateStr === filters.date,
          }"
          @click="cell.day && (filters.date = cell.dateStr)"
        >
          <div v-if="cell.day" class="day-number">{{ cell.day }}</div>
          <div v-if="cell.day" class="shifts-container">
            <div
              v-for="sche in getSchedulesForCalendarCell(cell.dateStr)"
              :key="sche.id"
              class="shift-item"
              :class="{ draft: sche.trangThai === 0 }"
              @click.stop="openEditModal(sche)"
              :data-tooltip="`${sche.nhanVien?.hoTen} (${sche.caLamViec?.tenCa})`"
            >
              <span class="shift-time">{{
                formatTime(sche.caLamViec?.gioBatDau)
              }}</span>
              <span class="shift-name">{{ sche.nhanVien?.hoTen }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-box form-page-animation">
        <div class="modal-header">
          <h3>{{ isEditing ? "ĐIỀU CHỈNH LỊCH" : "PHÂN LỊCH MỚI" }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Ngày làm việc <span class="required">*</span></label>
            <input
              type="date"
              v-model="form.ngayLamViec"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Chọn Nhân viên <span class="required">*</span></label>
            <select
              v-model="form.idNhanVien"
              class="form-control custom-select-modal"
            >
              <option value="" disabled>-- Chọn nhân viên --</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.maNv }} - {{ emp.hoTen }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Chọn Ca làm việc <span class="required">*</span></label>
            <select
              v-model="form.idCa"
              class="form-control custom-select-modal"
            >
              <option :value="''" disabled>-- Chọn ca --</option>
              <option v-for="s in shifts" :key="s.idCa" :value="s.idCa">
                {{ s.tenCa }} ({{ formatTime(s.gioBatDau) }} -
                {{ formatTime(s.gioKetThuc) }})
              </option>
            </select>
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
            <input
              type="text"
              v-model="form.ghiChu"
              class="form-control"
              placeholder="Ví dụ: Trực thay..."
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Hủy</button>
          <button class="btn btn-primary" @click="handleSave">
            {{ isEditing ? "Lưu thay đổi" : "Xác nhận" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* === GENERAL LAYOUT === */
.page-container {
  background-color: #f3f4f6;
  min-height: 100vh;
}
.card-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

/* === HEADER & FILTER === */
.filter-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 16px;
}
.card-title {
  color: #63391f;
  font-weight: 800;
  font-size: 20px;
  margin: 0;
}
.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

/* --- VIEW TOGGLE BUTTONS --- */
.view-toggle {
  background: #f3f4f6;
  padding: 4px;
  border-radius: 8px;
  display: flex;
  gap: 4px;
}
.toggle-btn {
  border: none;
  background: transparent;
  padding: 6px 16px;
  font-weight: 600;
  font-size: 14px;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}
.toggle-btn.active {
  background: #63391f;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.toggle-btn:hover:not(.active) {
  background: #e5e7eb;
}

/* FILTERS */
.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 12px;
}
.left-filters {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-label {
  font-weight: 600;
  color: #4b5563;
  font-size: 14px;
  white-space: nowrap;
}
.mini-input,
.mini-select {
  height: 38px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
  background: white;
}
.mini-input.search {
  width: 180px;
}
.mini-input:focus,
.mini-select:focus {
  border-color: #63391f;
}

/* === BUTTONS === */
.btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  font-size: 14px;
  transition: 0.2s;
  white-space: nowrap;
}
.btn-primary {
  background: linear-gradient(135deg, #8b5a2b, #63391f);
  color: white;
  box-shadow: 0 4px 6px rgba(99, 57, 31, 0.2);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(99, 57, 31, 0.3);
}
.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}
.btn-outline {
  background: white;
  border: 1px solid #d1d5db;
  color: #4b5563;
}
.btn-outline:hover {
  border-color: #63391f;
  color: #63391f;
  background: #fff8f5;
}

/* === TABLE STYLES === */
.table-container {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}
.custom-table {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
  table-layout: fixed;
}
.custom-table th {
  background: #f9fafb;
  color: #374151;
  padding: 14px 16px;
  font-weight: 700;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  text-transform: uppercase;
  white-space: nowrap;
}
.custom-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
  white-space: nowrap;
}

/* Badge & Text Styles */
.date-badge {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}
.employee-info {
  display: flex;
  flex-direction: column;
}
.emp-code {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}
.emp-name {
  font-size: 14px;
  color: #111827;
  font-weight: 600;
}
.shift-badge {
  background: #e0e7ff;
  color: #4338ca;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  display: inline-block;
}
.small-note {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
  font-style: italic;
}
.time-text {
  font-family: monospace;
  font-weight: 500;
  color: #4b5563;
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
}
.active {
  background: #dcfce7;
  color: #166534;
}
.draft {
  background: #fef3c7;
  color: #92400e;
}
.text-center {
  text-align: center !important;
}
.action-group.center-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.action-btn:hover {
  border-color: #63391f;
  color: #63391f;
  background: #fff8f5;
}
.delete-btn:hover {
  border-color: #dc2626;
  color: #dc2626;
  background: #fef2f2;
}

/* === PAGINATION === */
.pagination-footer {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
}
.p-btn {
  width: 36px;
  height: 36px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  font-weight: 500;
  transition: 0.2s;
}
.p-btn.active {
  background: #63391f;
  border-color: #63391f;
  color: #fff;
}
.p-btn:hover:not(.active):not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
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

/* === CALENDAR STYLES === */
.calendar-card {
  min-height: 700px;
  display: flex;
  flex-direction: column;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.month-nav {
  display: flex;
  align-items: center;
  gap: 15px;
}
.current-month {
  color: #63391f;
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  min-width: 180px;
  text-align: center;
}
.nav-btn {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  color: #555;
}
.nav-btn:hover {
  background: #63391f;
  color: white;
}
.btn-today {
  background: white;
  border: 1px solid #d1d5db;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  color: #555;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
}
.weekday-header {
  background: #f9fafb;
  padding: 10px;
  text-align: center;
  font-weight: 700;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  font-size: 13px;
}
.weekday-header:last-child {
  border-right: none;
}
.text-red {
  color: #dc2626;
}

.day-cell {
  min-height: 100px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 6px;
  position: relative;
  background: white;
  cursor: pointer;
}
.day-cell:nth-child(7n) {
  border-right: none;
}
.day-cell.empty {
  background: #fcfcfc;
}
.day-cell.today {
  background: #fff8f5;
}
.day-cell.selected-day {
  box-shadow: inset 0 0 0 2px #63391f;
}

.day-number {
  font-weight: 700;
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
  text-align: right;
}
.today .day-number {
  color: #63391f;
  text-decoration: underline;
}

.shifts-container {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
  max-height: 80px;
}
.shift-item {
  background: #e0e7ff;
  color: #3730a3;
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  border-left: 3px solid #4f46e5;
  cursor: pointer;
  position: relative;
}
.shift-item.draft {
  background: #fffbeb;
  color: #92400e;
  border-left-color: #f59e0b;
}
.shift-time {
  font-weight: 700;
  margin-right: 4px;
}
.shift-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-mini {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #555;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot.active {
  background: #4f46e5;
}
.dot.draft {
  background: #f59e0b;
}

/* === TOOLTIP === */
[data-tooltip] {
  position: relative;
}
[data-tooltip]::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-5px);
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: 0.2s;
  pointer-events: none;
  z-index: 100;
}
[data-tooltip]:hover::before {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-10px);
}

/* === MODAL === */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-box {
  background: white;
  width: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
.modal-header {
  background: #63391f;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}
.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}
.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}
.modal-body {
  padding: 24px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}
.required {
  color: #dc2626;
}
.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
}
.form-control:focus {
  border-color: #63391f;
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 57, 31, 0.1);
}
.modal-footer {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.toast {
  background: #333;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
