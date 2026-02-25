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
        <h2 class="card-title">QUẢN LÝ NHÂN VIÊN</h2>
      </div>

      <div class="filter-controls">
        <div class="left-controls">
          <div class="filter-group search-group">
            <label class="filter-label">Tìm kiếm</label>
            <div class="search-box">
              <i class="search-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </i>
              <input
                v-model="query"
                type="text"
                class="form-input ps-icon"
                placeholder="Tìm theo tên, mã hoặc email"
              />
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">Trạng thái</label>
            <select class="form-select" v-model="filters.status">
              <option value="all">Tất cả</option>
              <option value="active">Đang làm</option>
              <option value="inactive">Đã nghỉ</option>
              <option value="locked">Đã khóa</option>
            </select>
          </div>
        </div>

        <div class="right-controls">
          <button class="btn btn-outline hover-effect" @click="resetFilters">
            Đặt lại
          </button>

          <button class="btn btn-outline hover-effect" @click="exportExcel">
            <img
              src="/src/assets/icon/dowload.svg"
              alt=""
              style="width: 16px; height: 16px; margin-right: 8px"
            />
            Xuất Excel
          </button>

          <button class="btn btn-add hover-effect" @click="addEmployee">
            <span>+</span> Thêm nhân viên
          </button>
        </div>
      </div>
    </div>

    <div class="card-section table-card form-page-animation">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th width="50" class="text-center">STT</th>
              <th width="80" class="text-center">Ảnh</th>
              <th width="80">Mã NV</th>
              <th style="min-width: 180px">Tên</th>
              <th style="min-width: 220px">Email</th>
              <th width="100">SDT</th>
              <th style="min-width: 250px">Địa chỉ</th>
              <th width="110">Chức vụ</th>
              <th width="110" class="text-center">Trạng thái</th>
              <th width="110" class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="employees.length === 0">
              <td colspan="10" class="text-center py-5 text-muted">
                Không có dữ liệu nhân viên
              </td>
            </tr>

            <template v-else>
              <tr v-for="(e, i) in employees" :key="e.id">
                <td class="text-center text-muted">
                  <b>{{ startIndex + i }}</b>
                </td>

                <td class="text-center">
                  <img
                    v-if="e.avatar && e.avatar.length > 20"
                    :src="e.avatar"
                    class="avatar-img"
                  />
                  <div
                    v-else
                    class="avatar-placeholder"
                    :style="{ backgroundColor: getRandomColor(i) }"
                  >
                    {{ initials(e.name) }}
                  </div>
                </td>

                <td style="color: #000000">
                  {{ e.code }}
                </td>

                <td>
                  <span>{{ e.name }}</span>
                </td>

                <td>
                  <span class="text-muted">{{ e.email }}</span>
                </td>

                <td>{{ e.phone }}</td>

                <td class="text-muted small">
                  <div
                    class="custom-tooltip address-tooltip-wrapper"
                    :data-tooltip="
                      e.address ? e.address : 'Chưa cập nhật địa chỉ'
                    "
                    style="display: block; position: relative; width: 100%"
                  >
                    <div class="address-truncate">
                      {{ e.address ? e.address : "---" }}
                    </div>
                  </div>
                </td>

                <td>{{ getRoleLabel(e.role) }}</td>

                <td class="text-center">
                  <span :class="['status-badge', getStatusClass(e.status)]">
                    {{ getStatusLabel(e.status) }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="actions-group">
                    <div
                      class="tooltip-wrapper"
                      :data-tooltip="
                        e.status === 1
                          ? 'Khóa nhân viên'
                          : e.status === 2
                            ? 'Mở khóa'
                            : 'Kích hoạt lại'
                      "
                    >
                      <label class="switch">
                        <input
                          type="checkbox"
                          :checked="e.status === 1"
                          @click="toggleStatus(e, $event)"
                        />
                        <span class="slider round"></span>
                      </label>
                    </div>

                    <div class="tooltip-wrapper" data-tooltip="Chi tiết">
                      <span class="icon edit" @click="openEditModal(e)">
                        <img
                          src="/src/assets/icon/edit.svg"
                          style="width: 20px; height: 20px"
                        />
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="pagination-footer" v-if="totalPages > 1">
        <button
          class="p-btn"
          :disabled="page === 0"
          @click="changePage(page - 1)"
        >
          <
        </button>
        <template v-for="p in visiblePages" :key="p">
          <button
            v-if="p !== '...'"
            class="p-btn number"
            :class="{ active: p === page + 1 }"
            @click="changePage(p - 1)"
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
          >
        </button>
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

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content form-page-animation">
        <div class="modal-header">
          <h3 style="color: #63391f; margin: 0">Chỉnh sửa nhân viên</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <div class="avatar-section">
            <div class="avatar-circle" @click="triggerFileInput">
              <img
                :src="
                  editingEmployee.avatar || 'https://via.placeholder.com/100'
                "
                alt="Avatar"
              />
              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload"
                class="hidden-input"
                accept="image/*"
              />
              <div class="overlay-edit">📷</div>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Mã NV</label>
              <input
                v-model="editingEmployee.maNv"
                disabled
                class="disabled-input"
              />
            </div>

            <div class="form-group">
              <div class="label-flex">
                <label>Tên</label>
                <span v-if="errors.hoTen" class="error-msg">{{
                  errors.hoTen
                }}</span>
              </div>
              <input
                v-model="editingEmployee.hoTen"
                :class="{ 'red-border': errors.hoTen }"
              />
            </div>

            <div class="form-group">
              <div class="label-flex">
                <label>Email</label>
                <span v-if="errors.email" class="error-msg">{{
                  errors.email
                }}</span>
              </div>
              <input
                v-model="editingEmployee.email"
                :class="{ 'red-border': errors.email }"
              />
            </div>

            <div class="form-group">
              <div class="label-flex">
                <label>SDT</label>
                <span v-if="errors.sdt" class="error-msg">{{
                  errors.sdt
                }}</span>
              </div>
              <input
                v-model="editingEmployee.sdt"
                :class="{ 'red-border': errors.sdt }"
              />
            </div>

            <div class="form-group">
              <div class="label-flex">
                <label>Ngày sinh</label>
                <span v-if="errors.ngaySinh" class="error-msg">{{
                  errors.ngaySinh
                }}</span>
              </div>
              <input
                type="date"
                v-model="editingEmployee.ngaySinh"
                :class="{ 'red-border': errors.ngaySinh }"
              />
            </div>

            <div class="form-group full-width">
              <div class="label-flex">
                <label>Địa chỉ</label>
                <span v-if="errors.diaChi" class="error-msg">{{
                  errors.diaChi
                }}</span>
              </div>
              <input
                v-model="editingEmployee.diaChi"
                :class="{ 'red-border': errors.diaChi }"
              />
            </div>

            <div class="form-group">
              <label>Chức vụ</label>
              <select v-model="editingEmployee.vaiTro" class="form-select">
                <option value="Quản lý">Quản lý</option>
                <option value="Nhân viên">Nhân viên</option>
                <option value="Nhân viên bán hàng">Nhân viên bán hàng</option>
                <option value="Thủ kho">Thủ kho</option>
              </select>
            </div>

            <div class="form-group">
              <label>Trạng thái</label>
              <select v-model="editingEmployee.trangThai" class="form-select">
                <option :value="1">Đang làm việc</option>
                <option :value="0">Đã nghỉ việc</option>
                <option :value="2">Đã khóa</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-light" @click="closeModal">Hủy</button>
          <button class="btn btn-orange" @click="saveEmployee">Lưu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const notifications = ref([]);
const employees = ref([]);
const totalPages = ref(0);
const totalElements = ref(0);

const query = ref("");
const filters = ref({ gender: "all", role: "all", status: "all" });
const perPage = ref(8);
const page = ref(0);
const router = useRouter();

// Modal & Edit State
const showModal = ref(false);
const editingEmployee = ref({});
const fileInput = ref(null);

const errors = ref({});

// Confirm Dialog State
const confirmDialog = ref({
  show: false,
  title: "Xác nhận",
  message: "",
  resolve: null,
});

const showConfirmDialog = (message, title = "Xác nhận") => {
  return new Promise((resolve) => {
    confirmDialog.value.title = title;
    confirmDialog.value.message = message;
    confirmDialog.value.resolve = resolve;
    confirmDialog.value.show = true;
  });
};

const handleConfirm = (result) => {
  if (confirmDialog.value.resolve) {
    confirmDialog.value.resolve(result);
  }
  confirmDialog.value.show = false;
  confirmDialog.value.message = "";
  confirmDialog.value.resolve = null;
};

// --- HÀM VALIDATE CHO FORM SỬA ---
function validateEditForm() {
  errors.value = {};
  let isValid = true;
  const data = editingEmployee.value;

  if (!data.hoTen || data.hoTen.trim() === "") {
    errors.value.hoTen = "Tên trống";
    isValid = false;
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.value.email = "Email sai";
    isValid = false;
  }
  if (!data.sdt || !/^0\d{9}$/.test(data.sdt)) {
    errors.value.sdt = "SĐT sai (10 số, đầu 0)";
    isValid = false;
  }
  if (!data.diaChi) {
    errors.value.diaChi = "Địa chỉ trống";
    isValid = false;
  }
  if (!data.ngaySinh) {
    errors.value.ngaySinh = "Chọn ngày sinh";
    isValid = false;
  } else {
    const birthDate = new Date(data.ngaySinh);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      errors.value.ngaySinh = "Chưa đủ 18t";
      isValid = false;
    }
  }

  return isValid;
}

// --- HELPERS & API ---
function getRoleLabel(roleCode) {
  switch (roleCode) {
    case "Admin":
      return "Quản lý";
    case "Staff":
      return "Nhân viên";
    case "Sales":
      return "Nhân viên Bán hàng";
    case "StoreKeeper":
      return "Thủ kho";
    default:
      return roleCode;
  }
}

// Gọi API lấy dữ liệu phân trang từ backend thay thế cho dữ liệu local
const loadEmployees = async () => {
  try {
    let statusParam = null;
    if (filters.value.status === "active") statusParam = 1;
    if (filters.value.status === "inactive") statusParam = 0;
    if (filters.value.status === "locked") statusParam = 2;

    const response = await axios.get(
      "http://localhost:8080/api/nhan-vien/search",
      {
        params: {
          keyword: query.value,
          trangThai: statusParam,
          page: page.value,
          size: perPage.value,
        },
      },
    );

    // Map content từ backend sang format của frontend
    employees.value = response.data.content.map((item) => ({
      id: item.id,
      code: item.maNv,
      name: item.hoTen,
      email: item.email,
      phone: item.sdt,
      address: item.diaChi,
      role: item.chucVu,
      roleLabel: item.chucVu,
      status: item.trangThai,
      dob: item.ngaySinh,
      avatar: item.avatar,
      gender: item.gioiTinh,
    }));

    totalPages.value = response.data.totalPages;
    totalElements.value = response.data.totalElements;
  } catch (error) {
    console.error("Lỗi khi tải danh sách nhân viên:", error);
    showNotification("Lỗi khi tải dữ liệu", "error");
  }
};

onMounted(() => {
  loadEmployees();
});

// Khi thay đổi text hoặc dropdown filter -> Quay về trang đầu tiên và gọi lại API
watch(
  [query, () => filters.value.status],
  () => {
    page.value = 0;
    loadEmployees();
  },
  { deep: true },
);

// Khi thay đổi page (Bấm next, prev...) -> Gọi lại API
watch(page, () => {
  loadEmployees();
});

// --- MODAL ---
function openEditModal(emp) {
  router.push(`/admin/employee/edit/${emp.id}`);
}

function closeModal() {
  showModal.value = false;
}

// --- UPLOAD ẢNH ---
function triggerFileInput() {
  fileInput.value.click();
}
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh quá lớn (< 5MB)!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      editingEmployee.value.avatar = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// --- LƯU DỮ LIỆU ---
async function saveEmployee() {
  if (!validateEditForm()) return;

  try {
    await axios.put(
      `http://localhost:8080/api/nhan-vien/${editingEmployee.value.id}`,
      {
        hoTen: editingEmployee.value.hoTen,
        email: editingEmployee.value.email,
        sdt: editingEmployee.value.sdt,
        diaChi: editingEmployee.value.diaChi,
        vaiTro: editingEmployee.value.vaiTro,
        trangThai: editingEmployee.value.trangThai,
        ngaySinh: editingEmployee.value.ngaySinh,
        avatar: editingEmployee.value.avatar,
      },
    );
    showNotification("Cập nhật thành công!", "success");
    closeModal();
    loadEmployees();
  } catch (error) {
    console.error(error);
    showNotification("Lỗi lưu dữ liệu!", "error");
  }
}

// --- UTILS KHÁC ---
async function toggleStatus(e, event) {
  event.preventDefault();

  const originalStatus = e.status;
  let newStatus = 1;

  if (e.status !== 2) {
    newStatus = 2; // Khóa
  } else {
    newStatus = 1; // Mở khóa về Active
  }

  const statusText = newStatus === 1 ? "Hoạt động" : "Khóa tài khoản";
  const confirmMsg = `
      Bạn có chắc chắn muốn thay đổi trạng thái nhân viên?<br><br>
    `;

  if (!(await showConfirmDialog(confirmMsg, "Xác nhận thay đổi trạng thái"))) {
    return;
  }

  e.status = newStatus; // Cập nhật UI

  try {
    await axios.put(`http://localhost:8080/api/nhan-vien/${e.id}`, {
      trangThai: newStatus,
    });

    showNotification(`Đã cập nhật trạng thái: ${statusText}`, "success");
  } catch (error) {
    e.status = originalStatus; // Hoàn tác nếu lỗi
    console.error(error);
    showNotification("Lỗi cập nhật trạng thái!", "error");
  }
}

function addEmployee() {
  router.push("/admin/employee/add");
}
function getStatusLabel(status) {
  return status === 1 ? "Đang làm" : status === 0 ? "Đã nghỉ" : "Đã khóa";
}
function getStatusClass(status) {
  return status === 1 ? "active" : status === 0 ? "inactive" : "locked";
}
function initials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
const colors = ["#f2d6d0", "#d0e1f2", "#d0f2d6", "#f2f0d0", "#e2d0f2"];
function getRandomColor(index) {
  return colors[index % colors.length];
}

const startIndex = computed(() => page.value * perPage.value + 1);

function changePage(newPage) {
  if (newPage < 0 || newPage >= totalPages.value) return;
  page.value = newPage;
}

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = page.value + 1;
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

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

function resetFilters() {
  query.value = "";
  filters.value = { gender: "all", role: "all", status: "all" };
  // page.value sẽ tự động set = 0 do watcher và gọi loadEmployees()
}

// --- HÀM XUẤT EXCEL ---
const exportExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Danh sách nhân viên");

  worksheet.columns = [
    { key: "stt", width: 10 },
    { key: "maNv", width: 15 },
    { key: "hoTen", width: 30 },
    { key: "email", width: 30 },
    { key: "sdt", width: 15 },
    { key: "gioiTinh", width: 10 },
    { key: "chucVu", width: 20 },
    { key: "trangThai", width: 15 },
  ];

  worksheet.mergeCells("A1:H1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "DANH SÁCH NHÂN VIÊN";
  titleCell.font = {
    name: "Times New Roman",
    size: 16,
    bold: true,
    color: { argb: "FF000000" },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("A2:H2");
  const subTitleCell = worksheet.getCell("A2");
  const today = new Date();
  subTitleCell.value = `Xuất file excel vào: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  subTitleCell.font = { name: "Times New Roman", size: 11, italic: true };
  subTitleCell.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.addRow([]);

  const headerRow = worksheet.addRow([
    "STT",
    "Mã NV",
    "Họ và tên",
    "Email",
    "SĐT",
    "Giới tính",
    "Chức vụ",
    "Trạng thái",
  ]);

  headerRow.eachCell((cell) => {
    cell.font = { name: "Times New Roman", bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9D9D9" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  const dataToExport = employees.value;

  dataToExport.forEach((emp, index) => {
    const row = worksheet.addRow([
      index + 1,
      emp.code,
      emp.name,
      emp.email,
      emp.phone,
      emp.gender ? "Nam" : "Nữ",
      getRoleLabel(emp.role),
      getStatusLabel(emp.status),
    ]);

    row.eachCell((cell) => {
      cell.font = { name: "Times New Roman" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      if (cell.col !== 3 && cell.col !== 4) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `DanhSachNhanVien_${Date.now()}.xlsx`);
};

const showNotification = (message, type = "success") => {
  const id = Date.now() + Math.random();
  notifications.value.push({ message, type, id });
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 3000);
};
</script>

<style scoped>
/* Toàn bộ phần CSS của bạn được giữ nguyên không thay đổi 1 dòng nào */
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
   FILTER CONTROLS (NEW STYLE)
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
  flex-wrap: wrap;
}

.right-controls {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: wrap;
}

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

.search-box {
  position: relative;
  width: 320px;
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

.form-input,
.form-select,
.btn {
  height: 42px;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input,
.form-select {
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

.form-select {
  min-width: 180px;
  cursor: pointer;
}

.form-input:focus,
.form-select:focus {
  border-color: #63391f;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}

.btn {
  padding: 0 16px;
  font-weight: 600;
  height: 42px; /* 👈 bằng input */
  padding: 0 16px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #484848;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  height: 42px; /* 👈 bằng input */
  padding: 0 16px; /* ngang vừa tay */
  border: 1px solid #ccc;
  border-radius: 10px; /* 👈 bo y hệt */
  background: #fff;
  cursor: pointer;

  font-size: 14px;
  font-weight: 600;
  color: #484848;

  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-outline {
  background-color: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.hover-effect:active {
  transform: translateY(1px);
}
/* =========================================
   5. TABLE
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
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
  color: #000000;
}
.custom-table td {
  padding: 14px 12px;
  font-size: 15px;
  color: #000000;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}
.custom-table td,
.custom-table th {
  word-break: break-word;
  white-space: normal;
}
/* .custom-table tbody tr:hover td {
  background-color: var(--primary-light);
} */
.fw-bold {
  font-weight: 600;
}
.text-muted {
  color: #000000 !important;
  font-size: 13px;
}
.text-dark {
  color: #111827;
}
.text-center {
  text-align: center;
}
.py-5 {
  padding: 20px 0;
}
.small {
  font-size: 13px;
}

/* === TRUNCATE TEXT WITH TOOLTIP === */
.truncate-text {
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}

/* Căn giữa nội dung trong cột ảnh */
.custom-table td:nth-child(2) {
  text-align: left;
  vertical-align: middle;
}

/* Ảnh thật */
.avatar-img {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
  display: inline-block; /* đổi từ block */
}

/* Placeholder */
.avatar-placeholder {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: inline-flex; /* đổi sang inline-flex */
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #fff;
  font-size: 14px;
  border: 1px solid #e5e7eb;
}

/* === STATUS BADGE === */
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  min-width: 90px;
}
.status-badge.active {
  background-color: #e8f5e9;
  color: var(--success-green);
  border: 1px solid #c8e6c9;
}
.status-badge.inactive {
  background-color: #ffebee;
  color: var(--danger-red);
  border: 1px solid #ffcdd2;
}
.status-badge.locked {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

/* === SWITCH & ACTIONS === */
.actions-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

/* Icon button styles from ProductManager */
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
.switch {
  position: relative;
  width: 50px;
  height: 24px;
}
.switch input {
  display: none;
}
.slider {
  position: absolute;
  inset: 0;
  background: #ccc;
  border-radius: 24px;
  transition: 0.3s;
}
.slider::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.3s;
}
input:checked + .slider {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
}
input:checked + .slider::before {
  transform: translateX(26px);
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: 1px solid transparent;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.btn-icon:hover {
  background: var(--primary-brown);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(99, 57, 31, 0.2);
}

/* =========================================
   6. PAGINATION
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
   7. MODAL
   ========================================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal-content {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  width: 600px;
  max-width: 95%;
  text-align: center;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}
.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #888;
  line-height: 1;
}
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #eee;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}
.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-circle:hover .overlay-edit {
  display: block;
}
.overlay-edit {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
  padding: 4px 0;
  font-size: 12px;
  display: none;
}
.hidden-input {
  display: none;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.full-width {
  grid-column: span 2;
}
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 6px;
}
.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}
.form-group input:focus,
.form-group select:focus {
  border-color: var(--primary-brown);
  box-shadow: 0 0 0 2px rgba(99, 57, 31, 0.1);
  outline: none;
}
.disabled-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
.label-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.error-msg {
  color: #ef4444;
  font-size: 12px;
  font-style: italic;
  font-weight: 600;
}
.red-border {
  border-color: #ef4444 !important;
  background-color: #fff5f5;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}
.modal-footer .btn {
  padding: 10px 24px;
}
.btn-light {
  background: #f3f4f6;
  color: #374151;
}
.btn-orange {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: white;
}

/* =========================================
   8. CUSTOM TOOLTIP
   ========================================= */
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
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

.custom-tooltip {
  position: relative;
}
/* Tạo nội dung tooltip */
.custom-tooltip::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;

  /* Sửa 3 dòng dưới đây để địa chỉ dài tự xuống dòng */
  white-space: normal;
  /* max-width: 300px;  */
  width: 250px;
  width: max-content;
  line-height: 1.4;
  text-align: center;
  word-break: break-word;

  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.2s,
    visibility 0.2s;
  z-index: 100;
  pointer-events: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  font-weight: 500;
}
.custom-tooltip::after {
  content: "";
  position: absolute;
  bottom: 115%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.2s,
    visibility 0.2s;
  z-index: 100;
}
.custom-tooltip:hover::before,
.custom-tooltip:hover::after {
  opacity: 1;
  visibility: visible;
  bottom: 135%;
}
.custom-tooltip:hover::after {
  bottom: 125%;
}

/* =========================================
   9. TOAST
   ========================================= */
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

/* =========================================
   10. CONFIRM DIALOG
   ========================================= */
.modal-confirm {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 12000;
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
  color: var(--primary-brown);
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

/* =========================================
   RESPONSIVE STYLES
   ========================================= */
@media (max-width: 1024px) {
  .left-controls {
    gap: 12px;
  }

  .search-box {
    width: 250px;
  }

  .form-select {
    min-width: 150px;
  }
}

@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .left-controls,
  .right-controls {
    width: 100%;
    justify-content: flex-start;
  }

  .search-box {
    width: 100%;
  }

  .form-select {
    width: 100%;
  }

  .btn {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .left-controls {
    flex-direction: column;
    width: 100%;
  }

  .filter-group {
    width: 100%;
  }

  .right-controls {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
/* Cắt chữ hiển thị dấu ... cho địa chỉ */
.address-truncate {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
  word-break: break-word;
  overflow-wrap: break-word;
  vertical-align: middle;
}
.address-tooltip-wrapper.custom-tooltip::before {
  left: 0 !important;
  transform: none !important;
  text-align: left;
  max-width: 350px;
}

.address-tooltip-wrapper.custom-tooltip::after {
  left: 20px !important;
  transform: none !important;
}
</style>
