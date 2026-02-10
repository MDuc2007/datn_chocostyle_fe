<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import axios from "axios";

// --- 1. Interface & Config ---
interface Shift {
  idCa: number;
  maCa: string;
  tenCa: string;
  gioBatDau: string;
  gioKetThuc: string;
  trangThai: number;
}

const API_URL = "http://localhost:8080/api/ca-lam-viec";

// --- 2. State ---
const shifts = ref<Shift[]>([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);

// Filter State
const filterStatus = ref<string | number>("all");
const filterStartTime = ref("");
const filterEndTime = ref("");

// Pagination State
const perPage = ref(8);
const page = ref(0);

// Form Data
const form = reactive({
  idCa: null as number | null,
  maCa: "",
  tenCa: "",
  gioBatDau: "",
  gioKetThuc: "",
  trangThai: 1,
});

// --- STATE QUẢN LÝ LỖI (Mới thêm) ---
const errors = reactive({
  tenCa: "",
  gioBatDau: "",
  gioKetThuc: "",
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

// --- 3. HELPER & VALIDATION LOGIC ---

// Hàm reset lỗi
const clearErrors = () => {
  errors.tenCa = "";
  errors.gioBatDau = "";
  errors.gioKetThuc = "";
};

// Hàm đổi giờ "HH:mm" sang phút
const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

// Hàm Validate chi tiết (Gán lỗi vào biến errors)
const validateForm = () => {
  clearErrors();
  let isValid = true;

  // 1. Check Tên Ca
  if (!form.tenCa || !form.tenCa.trim()) {
    errors.tenCa = "Tên ca không được để trống";
    isValid = false;
  } else if (form.tenCa.length < 2) {
    errors.tenCa = "Tên ca phải có ít nhất 2 ký tự";
    isValid = false;
  } else {
    // Check trùng tên
    const isDuplicateName = shifts.value.some(
      (s) =>
        s.tenCa.trim().toLowerCase() === form.tenCa.trim().toLowerCase() &&
        (!isEditing.value || s.idCa !== form.idCa),
    );
    if (isDuplicateName) {
      errors.tenCa = "Tên ca này đã tồn tại";
      isValid = false;
    }
  }

  // 2. Check Giờ
  if (!form.gioBatDau) {
    errors.gioBatDau = "Vui lòng chọn giờ bắt đầu";
    isValid = false;
  }
  if (!form.gioKetThuc) {
    errors.gioKetThuc = "Vui lòng chọn giờ kết thúc";
    isValid = false;
  }

  // 3. Check Logic thời gian (chỉ check khi đã nhập đủ giờ)
  if (form.gioBatDau && form.gioKetThuc) {
    const startMins = timeToMinutes(form.gioBatDau);
    const endMins = timeToMinutes(form.gioKetThuc);
    const duration = endMins - startMins;

    if (startMins >= endMins) {
      errors.gioKetThuc = "Giờ kết thúc phải sau giờ bắt đầu";
      isValid = false;
    } else if (duration < 30) {
      errors.gioKetThuc = "Ca làm việc quá ngắn (Tối thiểu 30 phút)";
      isValid = false;
    } else if (duration > 840) {
      // Cảnh báo mềm (confirm)
      if (
        !confirm("Ca làm việc này dài hơn 14 tiếng. Bạn có chắc chắn không?")
      ) {
        isValid = false;
      }
    }

    // Check trùng khung giờ chính xác
    if (isValid) {
      const isDuplicateTime = shifts.value.some((s) => {
        if (isEditing.value && s.idCa === form.idCa) return false;
        const sStart = s.gioBatDau?.substring(0, 5);
        const sEnd = s.gioKetThuc?.substring(0, 5);
        return sStart === form.gioBatDau && sEnd === form.gioKetThuc;
      });
      if (isDuplicateTime) {
        errors.gioBatDau = "Khung giờ này đã tồn tại";
        errors.gioKetThuc = "Khung giờ này đã tồn tại";
        isValid = false;
      }
    }
  }

  return isValid;
};

// --- 4. API Logic ---
const fetchShifts = async () => {
  loading.value = true;
  try {
    const res = await axios.get(API_URL);
    shifts.value = res.data;
  } catch (error) {
    showToast("Lỗi kết nối server", "error");
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  // Gọi hàm validate (nếu lỗi, biến errors sẽ có data -> UI hiện đỏ)
  if (!validateForm()) return;

  // Cảnh báo nghiệp vụ khi Edit
  // if (isEditing.value) {
  //   const confirmEdit = confirm('LƯU Ý: Việc thay đổi giờ của Ca sẽ ảnh hưởng đến lịch sử chấm công. Nếu bạn có chắc chắn muốn cập nhật?');
  //   if (!confirmEdit) return;
  // }

  try {
    // Format HH:mm -> HH:mm:00
    const payload = {
      ...form,
      gioBatDau:
        form.gioBatDau.length === 5 ? form.gioBatDau + ":00" : form.gioBatDau,
      gioKetThuc:
        form.gioKetThuc.length === 5
          ? form.gioKetThuc + ":00"
          : form.gioKetThuc,
    };

    if (isEditing.value && form.idCa) {
      await axios.put(`${API_URL}/${form.idCa}`, payload);
      showToast("Cập nhật thành công", "success");
    } else {
      await axios.post(API_URL, payload);
      showToast("Thêm mới thành công", "success");
    }

    closeModal();
    fetchShifts();
  } catch (error: any) {
    const msg =
      error.response?.data?.message || error.response?.data || "Có lỗi xảy ra";

    // Auto map lỗi backend vào ô input
    if (msg.toLowerCase().includes("tên ca")) {
      errors.tenCa = msg; // Nó sẽ hiện đỏ lòm ngay ô Tên
    } else if (msg.toLowerCase().includes("giờ")) {
      errors.gioBatDau = msg;
      errors.gioKetThuc = msg;
    } else {
      showToast(msg, "error"); // Lỗi khác thì hiện Toast
    }
  }
};

const toggleStatus = async (shift: Shift) => {
  const oldStatus = shift.trangThai;
  const newStatus = oldStatus === 1 ? 0 : 1;

  shift.trangThai = newStatus; // Optimistic update

  try {
    const payload = {
      ...shift,
      trangThai: newStatus,
      gioBatDau:
        shift.gioBatDau.length === 5
          ? shift.gioBatDau + ":00"
          : shift.gioBatDau,
      gioKetThuc:
        shift.gioKetThuc.length === 5
          ? shift.gioKetThuc + ":00"
          : shift.gioKetThuc,
    };
    await axios.put(`${API_URL}/${shift.idCa}`, payload);
    showToast(
      `Đã ${newStatus === 1 ? "mở" : "đóng"} ca ${shift.tenCa}`,
      "success",
    );
  } catch (error) {
    shift.trangThai = oldStatus; // Hoàn tác nếu lỗi
    showToast("Lỗi khi cập nhật trạng thái", "error");
  }
};

const deleteShift = async (id: number) => {
  if (!confirm("Bạn có chắc muốn xóa ca này?")) return;
  try {
    await axios.delete(`${API_URL}/${id}`);
    showToast("Đã xóa thành công", "success");
    fetchShifts();
  } catch (error) {
    showToast("Lỗi khi xóa", "error");
  }
};

// --- 5. Modal Handlers ---
const openAddModal = () => {
  isEditing.value = false;
  // Reset form
  form.idCa = null;
  form.maCa = "";
  form.tenCa = "";
  form.gioBatDau = "";
  form.gioKetThuc = "";
  form.trangThai = 1;
  clearErrors(); // Reset lỗi
  showModal.value = true;
};

const openEditModal = (item: Shift) => {
  isEditing.value = true;
  form.idCa = item.idCa;
  form.maCa = item.maCa;
  form.tenCa = item.tenCa;
  // Cắt chuỗi HH:mm:ss -> HH:mm
  form.gioBatDau = item.gioBatDau?.substring(0, 5) || "";
  form.gioKetThuc = item.gioKetThuc?.substring(0, 5) || "";
  form.trangThai = item.trangThai;
  clearErrors(); // Reset lỗi
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

// --- 6. Filters & Pagination ---
const resetFilters = () => {
  filterStatus.value = "all";
  filterStartTime.value = "";
  filterEndTime.value = "";
  page.value = 0;
};

const filteredShifts = computed(() => {
  return shifts.value.filter((s) => {
    const matchStatus =
      filterStatus.value === "all" || s.trangThai === filterStatus.value;
    let matchTime = true;
    if (filterStartTime.value)
      matchTime = matchTime && s.gioBatDau >= filterStartTime.value;
    if (filterEndTime.value)
      matchTime = matchTime && s.gioKetThuc <= filterEndTime.value;
    return matchStatus && matchTime;
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredShifts.value.length / perPage.value)),
);
const pagedShifts = computed(() =>
  filteredShifts.value.slice(
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

onMounted(fetchShifts);
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
          <span v-if="notif.type === 'success'" style="font-size: 18px"></span>
          <span v-if="notif.type === 'error'" style="font-size: 18px"></span>
          <span v-if="notif.type === 'warning'" style="font-size: 18px"></span>
          <span class="toast-msg">{{ notif.message }}</span>
        </div>
      </TransitionGroup>
    </div>

    <div class="card-section filter-card form-page-animation">
      <div class="filter-card-header">
        <h2 class="card-title">QUẢN LÝ CA LÀM VIỆC</h2>
        <div class="header-actions">
          <button class="btn btn-primary" @click="openAddModal">
            <span class="plus-icon">+</span> Thiết lập ca
          </button>
        </div>
      </div>

      <div class="filter-row">
        <div class="left-filters">
          <div class="filter-group">
            <span class="filter-label">Trạng thái:</span>
            <select class="custom-select" v-model="filterStatus">
              <option value="all">Tất cả</option>
              <option :value="1">Hoạt động</option>
              <option :value="0">Ngưng hoạt động</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Khung giờ:</span>
            <div class="time-range-box">
              <input type="time" v-model="filterStartTime" />
              <span class="arrow">➝</span>
              <input type="time" v-model="filterEndTime" />
            </div>
          </div>
        </div>
        <button class="btn btn-outline" @click="resetFilters">Làm mới</button>
      </div>
    </div>

    <div class="card-section table-card form-page-animation">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th width="5%" class="text-center">STT</th>
              <th width="15%">Mã Ca</th>
              <th width="25%">Tên Ca</th>
              <th width="25%">Thời gian</th>
              <th width="15%" class="text-center">Trạng thái</th>
              <th width="15%" class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">Đang tải dữ liệu...</td>
            </tr>
            <tr v-else-if="filteredShifts.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">
                Không có dữ liệu phù hợp
              </td>
            </tr>
            <tr v-else v-for="(shift, index) in pagedShifts" :key="shift.idCa">
              <td class="text-center font-bold text-gray-500">
                {{ index + 1 }}
              </td>
              <td class="code-text">{{ shift.maCa }}</td>
              <td>
                <span class="name-badge">{{ shift.tenCa }}</span>
              </td>
              <td>
                <span class="time-text">
                  {{ shift.gioBatDau?.substring(0, 5) }} -
                  {{ shift.gioKetThuc?.substring(0, 5) }}
                </span>
              </td>
              <td class="text-center">
                <span
                  class="status-badge"
                  :class="shift.trangThai === 1 ? 'active' : 'inactive'"
                >
                  {{ shift.trangThai === 1 ? "Hoạt động" : "Ngưng" }}
                </span>
              </td>
              <td class="text-center">
                <div class="action-group center-actions">
                  <button
                    class="action-btn"
                    @click="openEditModal(shift)"
                    data-tooltip="Chỉnh sửa"
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

                  <label class="switch" data-tooltip="Kích hoạt/Tắt">
                    <input
                      type="checkbox"
                      :checked="shift.trangThai === 1"
                      @change="toggleStatus(shift)"
                    />
                    <span class="slider"></span>
                  </label>
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

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-box form-page-animation">
        <div class="modal-header">
          <h3>
            {{ isEditing ? "CẬP NHẬT CA LÀM VIỆC" : "THÊM CA LÀM VIỆC MỚI" }}
          </h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Tên Ca <span class="required">*</span></label>
            <input
              type="text"
              v-model="form.tenCa"
              class="form-control"
              :class="{ 'red-border': errors.tenCa }"
              placeholder="Ví dụ: Ca Sáng, Ca Chiều..."
            />
            <span v-if="errors.tenCa" class="error-msg">{{
              errors.tenCa
            }}</span>
          </div>

          <div class="form-row">
            <div class="form-group col">
              <label>Giờ bắt đầu <span class="required">*</span></label>
              <input
                type="time"
                v-model="form.gioBatDau"
                class="form-control"
                :class="{ 'red-border': errors.gioBatDau }"
              />
              <span v-if="errors.gioBatDau" class="error-msg">{{
                errors.gioBatDau
              }}</span>
            </div>

            <div class="form-group col">
              <label>Giờ kết thúc <span class="required">*</span></label>
              <input
                type="time"
                v-model="form.gioKetThuc"
                class="form-control"
                :class="{ 'red-border': errors.gioKetThuc }"
              />
              <span v-if="errors.gioKetThuc" class="error-msg">{{
                errors.gioKetThuc
              }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Hủy bỏ</button>
          <button class="btn btn-primary" @click="handleSubmit">
            {{ isEditing ? "Lưu thay đổi" : "Hoàn tất" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* === GENERAL LAYOUT === */
.page-container {
  min-height: 100vh;
}

.card-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

/* === HEADER & BUTTONS === */
.filter-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 2px solid #ffffff;
  padding-bottom: 16px;
}

.card-title {
  color: #63391f;
  font-weight: 800;
  font-size: 20px;
  margin: 0;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
.btn-secondary:hover {
  background: #d1d5db;
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

/* === FILTER BAR === */
.filter-row {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.left-filters {
  display: flex;
  gap: 24px;
  align-items: center;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-label {
  font-weight: 600;
  color: #4b5563;
  font-size: 14px;
}

.custom-select,
.time-range-box input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.custom-select:focus,
.time-range-box input:focus {
  border-color: #63391f;
  box-shadow: 0 0 0 2px rgba(99, 57, 31, 0.1);
}

.time-range-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 4px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.time-range-box input {
  border: none;
  padding: 4px;
}

/* === TABLE STYLES (ĐÃ SỬA LỖI LỆCH) === */
.table-container {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}
.custom-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  table-layout: fixed;
}
.custom-table th {
  background: #f9fafb;
  color: #374151;
  padding: 14px 16px;
  font-weight: 700;
  text-align: left; /* Mặc định left */
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

/* FIX 1: Thêm !important để ghi đè thuộc tính text-align: left của thẻ th bên trên */
.text-center {
  text-align: center !important;
}

.code-text {
  font-weight: 700;
  color: #63391f;
  font-size: 13px;
}
.font-bold {
  font-weight: 600;
}
.text-gray-500 {
  color: #6b7280;
}
.name-badge {
  font-weight: 600;
  color: #111827;
  font-size: 14px;
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
.inactive {
  background: #fef3c7;
  color: #92400e;
}

/* === ACTION GROUP (ĐÃ SỬA CĂN CHỈNH NÚT) === */
.action-group.center-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
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
}

/* FIX 2: Bỏ comment đoạn này. SVG phải là block để không bị tính khoảng trống dòng (line-height) gây lệch icon */
.action-btn svg {
  display: block;
}

.action-btn:hover {
  border-color: #63391f;
  color: #63391f;
  background: #fff8f5;
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

/* === MODAL STYLES === */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}
@keyframes modalSlideIn {
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
  background: #63391f;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  color: white;
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}
.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.8;
}
.close-btn:hover {
  opacity: 1;
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
  margin-left: 2px;
}
.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
}
.form-control:focus {
  border-color: #63391f;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.15);
  outline: none;
}
.form-row {
  display: flex;
  gap: 20px;
}
.col {
  flex: 1;
}
.modal-footer {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* TOAST */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.toast {
  pointer-events: auto;
  min-width: 250px;
  max-width: 350px;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background: #fff;
  animation: slideInRight 0.3s forwards;
}
.toast.success {
  background-color: #f0f9eb;
  border-left: 5px solid #67c23a;
  color: #67c23a;
}
.toast.error {
  background-color: #fef0f0;
  border-left: 5px solid #f56c6c;
  color: #f56c6c;
}
.toast.warning {
  background-color: #fdf6ec;
  border-left: 5px solid #e6a23c;
  color: #e6a23c;
}
.toast-msg {
  color: #333;
}
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* === SWITCH STYLING (FIX 3) === */
.switch {
  position: relative;
  display: inline-block; /* Hoặc block đều được vì flex cha đã xử lý */
  width: 40px;
  height: 22px;
  margin: 0;
  cursor: pointer; /* Thêm con trỏ tay */
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: 0.3s;
  border-radius: 24px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px; /* 16+3+3 = 22px height -> Căn chuẩn */
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
input:checked + .slider {
  background-color: #63391f !important;
}
input:checked + .slider:before {
  transform: translateX(18px);
}

/* Tooltip */
[data-tooltip] {
  position: relative;
}
[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  animation: fadeIn 0.2s forwards;
  z-index: 100;
  margin-bottom: 8px;
}
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
/* --- VALIDATION STYLES --- */
.red-border {
  border-color: #dc2626 !important; /* Màu đỏ đậm */
  background-color: #fff5f5; /* Nền đỏ nhạt */
}

.red-border:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2) !important; /* Shadow đỏ khi focus */
}

.error-msg {
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  margin-top: 6px;
  display: block;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
