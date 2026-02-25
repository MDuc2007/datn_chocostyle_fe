<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from "vue";
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
const totalPages = ref(0); // Thay bằng ref để lấy từ API

// Form Data
const form = reactive({
  idCa: null as number | null,
  maCa: "",
  tenCa: "",
  gioBatDau: "",
  gioKetThuc: "",
  trangThai: 1,
});

// --- State theo dõi thay đổi Form (Để confirm khi đóng) ---
const originalForm = ref<any>(null);
const hasFormChanged = computed(() => {
  if (!originalForm.value) return false;
  return (
    form.tenCa !== originalForm.value.tenCa ||
    form.gioBatDau !== originalForm.value.gioBatDau ||
    form.gioKetThuc !== originalForm.value.gioKetThuc
  );
});

// --- STATE QUẢN LÝ LỖI ---
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

// --- CONFIRM DIALOG STATE (Giống ScheduleManager) ---
const confirmDialog = ref({
  show: false,
  title: "Xác nhận",
  message: "",
  resolve: null as ((value: boolean) => void) | null,
});

const showConfirmDialog = (
  message: string,
  title: string = "Xác nhận",
): Promise<boolean> => {
  return new Promise((resolve) => {
    confirmDialog.value.message = message;
    confirmDialog.value.title = title;
    confirmDialog.value.resolve = resolve;
    confirmDialog.value.show = true;
  });
};

const handleConfirm = (result: boolean) => {
  if (confirmDialog.value.resolve) {
    confirmDialog.value.resolve(result);
  }
  confirmDialog.value.show = false;
  confirmDialog.value.message = "";
  confirmDialog.value.resolve = null;
};

// --- 3. HELPER & VALIDATION LOGIC ---

const clearErrors = () => {
  errors.tenCa = "";
  errors.gioBatDau = "";
  errors.gioKetThuc = "";
};

const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const validateForm = () => {
  clearErrors();
  let isValid = true;

  // Validate Tên
  if (!form.tenCa || !form.tenCa.trim()) {
    errors.tenCa = "Tên ca không được để trống";
    isValid = false;
  } else if (form.tenCa.length < 2) {
    errors.tenCa = "Tên ca phải có ít nhất 2 ký tự";
    isValid = false;
  } else {
    // Check trùng tên ở frontend (Backend cũng sẽ bắt thêm)
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

  // Validate Giờ
  if (!form.gioBatDau) {
    errors.gioBatDau = "Vui lòng chọn giờ bắt đầu";
    isValid = false;
  }
  if (!form.gioKetThuc) {
    errors.gioKetThuc = "Vui lòng chọn giờ kết thúc";
    isValid = false;
  }

  // Check Logic thời gian
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
    }

    // Check trùng khung giờ (Frontend bắt trên page hiện tại)
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

// --- 4. API Logic (GỌI THEO API TÌM KIẾM CÓ PHÂN TRANG) ---
const fetchShifts = async () => {
  loading.value = true;
  try {
    // Chỉ khởi tạo page và size mặc định
    const params: any = {
      page: page.value,
      size: perPage.value,
    };

    // Chỉ đẩy param trangThai vào nếu khác 'all'
    if (filterStatus.value !== "all") {
      params.trangThai = filterStatus.value;
    }

    // Chỉ đẩy param giờ vào nếu có chọn giờ
    if (filterStartTime.value) {
      params.gioBatDau = filterStartTime.value + ":00";
    }
    if (filterEndTime.value) {
      params.gioKetThuc = filterEndTime.value + ":00";
    }

    const res = await axios.get(`${API_URL}/search`, { params });
    shifts.value = res.data.content;
    totalPages.value = res.data.totalPages;
  } catch (error) {
    console.error("Lỗi lấy danh sách ca:", error);
    showToast("Lỗi kết nối server", "error");
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  // Confirm Dialog trước khi lưu
  const actionText = isEditing.value ? 'cập nhật' : 'thêm mới';
  const confirmMsg = `Bạn có chắc chắn muốn ${actionText} ca làm việc này?`;

  if (
    !(await showConfirmDialog(
      confirmMsg,
      isEditing.value ? "Xác nhận cập nhật" : "Xác nhận thêm mới",
    ))
  )
    return;

  try {
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

    // Reset originalForm để closeModal không hỏi lại
    originalForm.value = null;
    closeModal();
    fetchShifts();
  } catch (error: any) {
    const msg =
      error.response?.data?.message || error.response?.data || "Có lỗi xảy ra";
    if (msg.toLowerCase().includes("tên ca")) errors.tenCa = msg;
    else if (msg.toLowerCase().includes("giờ")) {
      errors.gioBatDau = msg;
      errors.gioKetThuc = msg;
    } else showToast(msg, "error");
  }
};

// --- LOGIC TOGGLE SWITCH (ĐÃ FIX LỖI UI) ---
const toggleStatus = async (shift: Shift, event: Event) => {
  // 1. QUAN TRỌNG: Ngăn chặn checkbox tự đổi trạng thái ngay lập tức
  event.preventDefault();

  const oldStatus = shift.trangThai;
  const newStatus = oldStatus === 1 ? 0 : 1;

  // 2. Hỏi xác nhận
  const actionText = newStatus === 1 ? 'kích hoạt' : 'ngưng hoạt động';
  const confirmMsg = `Bạn có chắc chắn muốn ${actionText} ca này?`;
  
  if (!await showConfirmDialog(confirmMsg, 'Xác nhận trạng thái')) {
    // Nếu bấm Hủy, do đã preventDefault ở trên, UI switch vẫn giữ nguyên -> Đúng ý bạn.
    return;
  }

  // 3. Nếu Đồng ý -> Cập nhật UI và gọi API
  shift.trangThai = newStatus; // Cập nhật UI

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
    shift.trangThai = oldStatus; // Revert nếu API lỗi
    showToast("Lỗi khi cập nhật trạng thái", "error");
  }
};

const deleteShift = async (id: number) => {
  const shift = shifts.value.find((s) => s.idCa === id);
  if (!shift) return;

  const confirmMsg = `Bạn có chắc chắn muốn xóa ca này?`;
  if (!await showConfirmDialog(confirmMsg, 'Xác nhận xóa')) return;

  try {
    await axios.delete(`${API_URL}/${id}`);
    showToast("Đã xóa thành công", "success");
    fetchShifts();
  } catch (error) {
    showToast("Lỗi khi xóa (Có thể ca đang được sử dụng)", "error");
  }
};

// --- 5. Modal Handlers ---
const openAddModal = () => {
  isEditing.value = false;
  form.idCa = null;
  form.maCa = "";
  form.tenCa = "";
  form.gioBatDau = "";
  form.gioKetThuc = "";
  form.trangThai = 1;
  clearErrors();

  // Lưu trạng thái gốc (để check dirty form)
  originalForm.value = { ...form };
  showModal.value = true;
};

const openEditModal = (item: Shift) => {
  isEditing.value = true;
  form.idCa = item.idCa;
  form.maCa = item.maCa;
  form.tenCa = item.tenCa;
  form.gioBatDau = item.gioBatDau?.substring(0, 5) || "";
  form.gioKetThuc = item.gioKetThuc?.substring(0, 5) || "";
  form.trangThai = item.trangThai;
  clearErrors();

  // Lưu trạng thái gốc
  originalForm.value = { ...form };
  showModal.value = true;
};

const closeModal = async () => {
  // Check nếu có thay đổi chưa lưu
  if (hasFormChanged.value) {
    const confirmMsg = 'Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy bỏ và đóng?';
    if (!await showConfirmDialog(confirmMsg, 'Cảnh báo')) return;
  }

  showModal.value = false;
  originalForm.value = null; // Reset
};

// --- 6. Filters & Pagination ---
const resetFilters = () => {
  filterStatus.value = "all";
  filterStartTime.value = "";
  filterEndTime.value = "";
  // Watcher sẽ tự bắt và gọi lại API, set page về 0
};

// THEO DÕI THAY ĐỔI FILTER ĐỂ GỌI API LẠI TỪ BACKEND
watch([filterStatus, filterStartTime, filterEndTime], () => {
  page.value = 0;
  fetchShifts();
});

watch(page, () => {
  fetchShifts();
});

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
          <span class="toast-msg">{{ notif.message }}</span>
        </div>
      </TransitionGroup>
    </div>

    <div class="card-section filter-card form-page-animation">
      <div class="filter-card-header">
        <h2 class="card-title">QUẢN LÝ CA LÀM VIỆC</h2>
      </div>

      <div class="filter-row">
        <div class="left-filters">
          <div class="input-wrapper">
            <span class="label-inside">Trạng thái</span>
            <select class="form-select" v-model="filterStatus">
              <option value="all">Tất cả</option>
              <option :value="1">Hoạt động</option>
              <option :value="0">Ngưng hoạt động</option>
            </select>
          </div>
          <div class="input-wrapper">
            <span class="label-inside">Khung giờ</span>
            <div class="time-range-box">
              <input type="time" v-model="filterStartTime" />
              <span class="arrow">➝</span>
              <input type="time" v-model="filterEndTime" />
            </div>
          </div>
        </div>
        <button class="btn btn-outline" @click="resetFilters">Làm mới</button>
        <div class="header-actions">
          <button class="btn btn-add hover-effect" @click="openAddModal">
            <span>+</span> Thiết lập ca
          </button>
        </div>
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
            <tr v-else-if="shifts.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">
                Không có dữ liệu phù hợp
              </td>
            </tr>
            <tr v-else v-for="(shift, index) in shifts" :key="shift.idCa">
              <td class="text-center font-bold text-gray-500">
                {{ page * perPage + index + 1 }}
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
                <div class="action-buttons-wrapper">
                  <div class="tooltip-wrapper" data-tooltip="Chỉnh sửa">
                    <span class="icon edit" @click="openEditModal(shift)">
                      <img
                        src="/src/assets/icon/edit.svg"
                        style="width: 20px; height: 20px"
                      />
                    </span>
                  </div>

                  <div
                    class="tooltip-wrapper"
                    data-tooltip="Kích hoạt/Tắt"
                    style="margin-left: 8px"
                  >
                    <label class="switch">
                      <input
                        type="checkbox"
                        :checked="shift.trangThai === 1"
                        @click="toggleStatus(shift, $event)"
                      />
                      <span class="slider"></span>
                    </label>
                  </div>
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
      <div class="modal-box">
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
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12l3 3 5-5"></path>
            </svg>
          </div>
          <h3 class="confirm-title">{{ confirmDialog.title }}</h3>
          <p class="confirm-desc" v-html="confirmDialog.message"></p>
          <div class="confirm-actions">
            <button
              class="btn-cancel hover-effect"
              @click="handleConfirm(false)"
            >
              Hủy
            </button>
            <button
              class="btn-confirm hover-effect"
              @click="handleConfirm(true)"
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* === GENERAL LAYOUT === */
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
  color: #333;
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

.card-section {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
  overflow: hidden;
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;
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

/* === HEADER & BUTTONS === */
.filter-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.card-title {
  color: #63391f;
  font-weight: 700;
  font-size: 24px;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  padding: 0 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: 1px solid transparent;
  height: 42px;
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
}

.btn-primary {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: #fff;
  border-color: #6b3f23;
  box-shadow: 0 4px 6px rgba(99, 57, 31, 0.2);
}
.btn-primary:hover {
  background: linear-gradient(135deg, #5a3420, #b8895d);
  box-shadow: 0 4px 10px rgba(78, 44, 23, 0.3);
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
  border: 1px solid #ccc;
  color: #484848;
  border-radius: 10px;
}
.btn-outline:hover {
  border-color: #63391f;
  color: #63391f;
  background: #fdf8f6;
}

/* Add button style - matching EmployeeManager */
.btn-add {
  background: #fff;
  color: #484848;
  border: 1px solid #ccc;
  border-radius: 10px;
  height: 42px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-add:hover {
  border-color: #63391f;
  color: #63391f;
  background: #fdf8f6;
}

/* === FILTER BAR === */
.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.left-filters {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  flex: 1;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-inside {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.form-select {
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  background-color: #fff;
  min-width: 160px;
}

.form-select:focus {
  border-color: var(--primary-brown);
  box-shadow: 0 0 0 4px rgba(99, 57, 31, 0.1);
}

.time-range-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  min-width: 200px;
}
.time-range-box input {
  border: none;
  padding: 4px;
  background: transparent;
  font-size: 14px;
}

/* === TABLE STYLES === */
.table-container {
  width: 100%;
  overflow-x: auto;
}
.custom-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  table-layout: fixed;
}
.custom-table th {
  background: transparent;
  color: #374151;
  padding: 16px 12px;
  font-weight: 700;
  text-align: left;
  border-bottom: 2px solid #edf2f7;
  font-size: 13px;
  text-transform: uppercase;
  white-space: nowrap;
}
.custom-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  white-space: nowrap;
  font-size: 14px;
  color: #000000;
}
.custom-table tbody tr:hover {
  background-color: #fdf8f6;
}

.text-center {
  text-align: center !important;
}

.code-text {
  color: #000000;
  font-size: 13px;
}
.font-bold {
  font-weight: 600;
}
.text-gray-500 {
  color: #000000;
}
.name-badge {
  font-weight: 0;
  color: #000000;
  font-size: 14px;
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
  min-width: 100px;
}
.active {
  background: #e8f5e9;
  color: #166534;
  border: 1px solid #c8e6c9;
}
.inactive {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

/* === ACTION GROUP === */
.action-group.center-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}
.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn svg {
  display: block;
}

.action-btn:hover {
  border-color: #63391f;
  color: #63391f;
  background: #fff8f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(99, 57, 31, 0.15);
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
  vertical-align: middle;
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
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
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
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
}

.tooltip-wrapper:hover::after,
.tooltip-wrapper:hover::before {
  opacity: 1;
  visibility: visible;
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

/* === PAGINATION === */
.pagination-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px 0;
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
  transition: 0.2s;
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
  border-color: #63391f;
  color: #63391f;
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
  z-index: 9999;
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

/* === SWITCH STYLING === */
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
  margin: 0;
  cursor: pointer;
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
  background-color: #d9534f;
  transition: 0.4s;
  border-radius: 24px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
input:checked + .slider {
  background: linear-gradient(135deg, #6b3f23, #c89b6d) !important;
}
input:checked + .slider:before {
  transform: translateX(22px);
}

/* Tooltip */
.tooltip-wrapper[data-tooltip] {
  position: relative;
}
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* --- VALIDATION STYLES --- */
.red-border {
  border-color: #dc2626 !important;
  background-color: #fff5f5;
}

.red-border:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2) !important;
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

/* === CONFIRM DIALOG STYLES === */
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
.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e8f5e9;
  color: #22c55e;
  margin: 0 auto 15px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.confirm-icon-wrapper svg {
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
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
@keyframes zoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
