<template>
    <div class="employee-page">
        <div class="main-card">
            <h1 class="title">Quản lý nhân viên</h1>

            <section class="filters">
                <div class="filter-row">
                    <input v-model="query" class="search" placeholder="Nhập tên, mã hoặc email..." />
                    <select v-model="filters.gender">
                        <option value="all">Giới tính: Tất cả</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                    </select>
                    <select v-model="filters.role">
                        <option value="all">Chức vụ: Tất cả</option>
                        <option value="Admin">Quản lý</option>
                        <option value="Staff">Nhân viên</option>
                    </select>
                    <select v-model="filters.status">
                        <option value="all">Trạng thái: Tất cả</option>
                        <option value="active">Đang làm</option>
                        <option value="inactive">Đã nghỉ</option>
                        <option value="locked">Đã khóa</option>
                    </select>
                    <div class="actions">
                        <button class="btn btn-light" @click="resetFilters">Đặt lại</button>
                        <button class="btn btn-success" @click="exportExcel">Xuất Excel</button>
                        <button class="btn btn-primary" @click="addEmployee">Thêm mới</button>
                    </div>
                </div>
            </section>

            <section class="table-wrap">
                <table class="employees">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Ảnh</th>
                            <th>Mã NV</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>SDT</th>
                            <th>Địa chỉ</th>
                            <th>Chức vụ</th>
                            <th>Trạng thái</th>
                            <th style="min-width: 90px;">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(e, index) in pagedEmployees" :key="e.id">
                            <td>{{ startIndex + index }}</td>
                            <td class="avatar-cell">
                                <div class="avatar placeholder" :style="{backgroundColor: getRandomColor(index)}">
                                    {{ e.avatarLetter || initials(e.name) }}
                                </div>
                            </td>
                            <td class="code">{{ e.code }}</td>
                            <td class="fw-bold">{{ e.name }}</td>
                            <td class="muted">{{ e.email }}</td>
                            <td>{{ e.phone }}</td>
                            <td class="muted small">{{ e.address }}</td>
                            <td>{{ e.roleLabel }}</td>
                            <td>
                                <span :class="['status', getStatusClass(e.status)]">
                                    {{ getStatusLabel(e.status) }}
                                </span>
                            </td>
                            <td class="actions-cell">
                                <div class="action-buttons">
                                    <button class="btn-action edit" @click="openEditModal(e)" title="Chỉnh sửa">
                                        ✏️
                                    </button>
                                    <button class="btn-action lock" :class="{ 'is-locked': e.status !== 1 }" @click="toggleStatus(e)">
                                        <span v-if="e.status === 1">🔓</span>
                                        <span v-else>🔒</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="pagination" v-if="totalPages > 1">
                    <button :disabled="page===1" @click="prevPage">&lt;</button>
                    <button v-for="p in totalPages" :key="p" :class="['page', {active: p===page}]" @click="goPage(p)">{{p}}</button>
                    <button :disabled="page===totalPages" @click="nextPage">&gt;</button>
                </div>
            </section>
        </div>

        <div v-if="showModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chỉnh sửa nhân viên</h3>
                    <button class="close-btn" @click="closeModal">×</button>
                </div>

                <div class="modal-body">
                    <div class="avatar-section">
                        <div class="avatar-circle">
                            <img src="https://via.placeholder.com/100" alt="Avatar">
                            <button class="remove-avatar">×</button>
                        </div>
                        <span class="upload-hint">PNG, JPG - Tối đa 5MB</span>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Mã nhân viên</label>
                            <input v-model="editingEmployee.maNv" disabled class="disabled-input" />
                        </div>
                        <div class="form-group">
                            <label>Tên nhân viên</label>
                            <input v-model="editingEmployee.hoTen" />
                        </div>

                        <div class="form-group">
                            <label>Email</label>
                            <input v-model="editingEmployee.email" />
                        </div>
                        <div class="form-group">
                            <label>SDT</label>
                            <input v-model="editingEmployee.sdt" />
                        </div>

                        <div class="form-group">
                            <label>Ngày sinh</label>
                            <input type="date" v-model="editingEmployee.ngaySinh" />
                        </div>
                        <div class="form-group">
                            <label>Tỉnh/Thành phố</label>
                            <select class="form-select"><option>Hà Nội</option><option>TP.HCM</option></select>
                        </div>

                        <div class="form-group">
                            <label>Quận/Huyện</label>
                            <select class="form-select"><option>Tất cả</option></select>
                        </div>
                        <div class="form-group">
                            <label>Xã/Phường</label>
                            <select class="form-select"><option>Tất cả</option></select>
                        </div>

                        <div class="form-group full-width">
                            <label>Địa chỉ cụ thể</label>
                            <input v-model="editingEmployee.diaChi" />
                        </div>

                        <div class="form-group">
                            <label>Chức vụ</label>
                            <select v-model="editingEmployee.vaiTro" class="form-select">
                                <option value="Admin">Quản lý</option>
                                <option value="Staff">Nhân viên</option>
                                <option value="Nhân viên bán hàng">Nhân viên bán hàng</option>
                                <option value="Thủ kho">Thủ kho</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Trạng thái</label>
                            <select v-model="editingEmployee.trangThai" class="form-select status-select">
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
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// --- KHAI BÁO BIẾN ---
const employees = ref([])
const query = ref('')
const filters = ref({ gender: 'all', role: 'all', status: 'all' })
const perPage = ref(5)
const page = ref(1)
const router = useRouter()

// Biến cho Modal
const showModal = ref(false)
const editingEmployee = ref({}) // Object chứa thông tin đang sửa

// --- API & LOGIC ---
const fetchEmployees = async () => {
    try {
        const response = await axios.get('http://localhost:8080/api/nhan-vien')
        employees.value = response.data.map(item => ({
            id: item.id,
            code: item.maNv,
            name: item.hoTen,
            email: item.email,
            phone: item.sdt,
            address: item.diaChi,
            role: item.chucVu,
            roleLabel: item.chucVu,
            status: item.trangThai, 
            avatarLetter: item.avatarLetter,
            // Thêm field ngày sinh để bind vào input date
            dob: item.ngaySinh 
        }))
    } catch (error) {
        console.error("Lỗi tải dữ liệu:", error)
    }
}

onMounted(() => {
    fetchEmployees()
})

// --- LOGIC MODAL ---
function openEditModal(emp) {
    // Copy dữ liệu từ dòng được chọn vào biến editingEmployee
    // Lưu ý: format ngày sinh sang YYYY-MM-DD để input date hiển thị đúng
    editingEmployee.value = {
        id: emp.id,
        maNv: emp.code,
        hoTen: emp.name,
        email: emp.email,
        sdt: emp.phone,
        diaChi: emp.address,
        vaiTro: emp.role,
        trangThai: emp.status,
        ngaySinh: emp.dob // Bạn cần đảm bảo Backend trả về định dạng yyyy-MM-dd
    }
    showModal.value = true; // Hiện modal
}

function closeModal() {
    showModal.value = false;
}

async function saveEmployee() {
    try {
        // Gửi API cập nhật
        await axios.put(`http://localhost:8080/api/nhan-vien/${editingEmployee.value.id}`, {
            hoTen: editingEmployee.value.hoTen,
            email: editingEmployee.value.email,
            sdt: editingEmployee.value.sdt,
            diaChi: editingEmployee.value.diaChi,
            vaiTro: editingEmployee.value.vaiTro,
            trangThai: editingEmployee.value.trangThai, // 1: Đang làm, 0: Đã nghỉ
            ngaySinh: editingEmployee.value.ngaySinh
        });
        
        alert("Cập nhật thành công!");
        closeModal();
        fetchEmployees(); // Load lại bảng để thấy thay đổi
    } catch (error) {
        console.error("Lỗi lưu dữ liệu:", error);
        alert("Có lỗi xảy ra khi lưu!");
    }
}

// --- CÁC HÀM CŨ (TOGGLE, SEARCH...) GIỮ NGUYÊN ---
async function toggleStatus(e) {
    let newStatus = (e.status === 1) ? 2 : 1;
    const originalStatus = e.status; 
    e.status = newStatus; 
    try {
        await axios.put(`http://localhost:8080/api/nhan-vien/${e.id}`, { trangThai: newStatus });
    } catch (error) { e.status = originalStatus; }
}

function getStatusLabel(status) {
    if (status === 1) return 'Đang làm';
    if (status === 0) return 'Đã nghỉ'; // Đã chỉnh lại text theo ý bạn
    if (status === 2) return 'Đã khóa';
    return 'Không rõ';
}
function getStatusClass(status) {
    if (status === 1) return 'active';
    if (status === 0) return 'inactive';
    if (status === 2) return 'locked';
    return '';
}
const filtered = computed(() => {
    return employees.value.filter(e => {
        const matchesQuery = query.value.trim() === '' || [e.name, e.code, e.email].some(f => f && f.toLowerCase().includes(query.value.toLowerCase()))
        const matchesRole = filters.value.role === 'all' || e.role === filters.value.role
        let matchesStatus = true;
        if (filters.value.status === 'active') matchesStatus = e.status === 1;
        if (filters.value.status === 'inactive') matchesStatus = e.status === 0;
        if (filters.value.status === 'locked') matchesStatus = e.status === 2;
        return matchesQuery && matchesRole && matchesStatus
    })
})
//Hàm thêm nhân viên mới
function addEmployee() {
    // Thay vì alert hoặc mở modal, ta chuyển hướng
    router.push('/admin/employee/add')
}
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
const startIndex = computed(() => (page.value - 1) * perPage.value + 1)
const pagedEmployees = computed(() => filtered.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))
function initials(name) { if (!name) return ''; return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() }
const colors = ['#f2d6d0', '#d0e1f2', '#d0f2d6', '#f2f0d0', '#e2d0f2'];
function getRandomColor(index) { return colors[index % colors.length]; }
function goPage(p) { page.value = p }
function prevPage() { if (page.value > 1) page.value-- }
function nextPage() { if (page.value < totalPages.value) page.value++ }
function resetFilters() { query.value = ''; filters.value = { gender: 'all', role: 'all', status: 'all' }; page.value = 1; }
function exportExcel() { alert('Xuất Excel') }
</script>

<style scoped>
/* GIỮ LẠI CSS CŨ CỦA BẠN */
.employee-page { padding: 10px; font-family: 'Segoe UI', Roboto, sans-serif; color: #3b2b20; background-color: #f5f5f5; min-height: 100vh; }
.main-card { background: #fff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); max-width: 100%; margin: 0; }
.title { font-size: 24px; margin-bottom: 24px; color: #6b3a2b; font-weight: 700; border-bottom: 2px solid #f0e6df; padding-bottom: 12px; }
.filters { margin-bottom: 24px; }
.filters .filter-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.filters input.search { flex: 1; min-width: 250px; padding: 10px 14px; border: 1px solid #e0d8d0; border-radius: 6px; }
.filters select { padding: 10px; border: 1px solid #d6c3b4; border-radius: 6px; color: #3b2b20; cursor: pointer; }
.actions { margin-left: auto; display: flex; gap: 10px; }
.btn { padding: 10px 16px; border-radius: 6px; border: 0; cursor: pointer; font-weight: 600; transition: 0.2s; }
.btn-light { background: #f3ece6; color: #5a2e18; }
.btn-success { background: #28a745; color: #fff; }
.btn-primary { background: #c75a00; color: #fff; }
.table-wrap { overflow-x: auto; }
.employees { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 900px; }
.employees thead th { background: #6b3a2b; color: #fff; text-align: left; padding: 14px 16px; font-weight: 700; }
.employees tbody td { padding: 14px 16px; border-bottom: 1px solid #f0e6df; vertical-align: middle; }
.employees tbody tr:hover td { background: #fffaf6; }
.avatar { width: 40px; height: 40px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #6b3a2b; }
.code { font-weight: 600; color: #6b3a2b; }
.muted { color: #6b655f; }
.small { font-size: 12px; }
.status { padding: 5px 12px; border-radius: 12px; color: #fff; font-size: 11px; font-weight: 600; white-space: nowrap; }
.status.active { background: #27ae60; }
.status.inactive { background: #e74c3c; }
.status.locked { background: #7f8c8d; }
.actions-cell .action-buttons { display: flex; align-items: center; gap: 12px; }
.btn-action { background-color: transparent; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; padding: 4px; transition: all 0.2s ease; color: #95a5a6; }
.btn-action.edit { color: #3498db; }
.btn-action.edit:hover { color: #2980b9; transform: scale(1.1); }
.btn-action.lock { color: #95a5a6; }
.btn-action.lock.is-locked { color: #e74c3c; }
.btn-action.lock:hover { transform: scale(1.1); }
.pagination { display: flex; gap: 6px; justify-content: flex-end; padding-top: 20px; }
.page { padding: 8px 14px; border-radius: 4px; background: #fff; border: 1px solid #d9d9d9; cursor: pointer; transition: 0.2s; }
.page:hover { border-color: #6b3a2b; color: #6b3a2b; }
.page.active { background: #6b3a2b; color: #fff; border-color: #6b3a2b; }

/* --- CSS MỚI CHO MODAL (STYLE GIỐNG ẢNH) --- */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    width: 700px;
    max-width: 95%;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    position: relative;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.modal-header h3 { font-size: 20px; font-weight: 700; color: #333; margin: 0; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #888; }

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
}
.avatar-circle {
    width: 80px; height: 80px;
    border-radius: 50%;
    position: relative;
    margin-bottom: 8px;
}
.avatar-circle img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.remove-avatar {
    position: absolute; top: 0; right: -5px;
    background: #e74c3c; color: white;
    border: none; border-radius: 50%;
    width: 20px; height: 20px;
    font-size: 12px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
}
.upload-hint { font-size: 12px; color: #888; }

/* Grid layout cho Form */
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}
.form-group { display: flex; flex-direction: column; }
.form-group.full-width { grid-column: span 2; }
.form-group label { font-size: 13px; color: #666; margin-bottom: 6px; }
.form-group input, .form-group select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
}
.form-group input:focus, .form-group select:focus { border-color: #e67e22; }
.disabled-input { background-color: #f9f9f9; color: #888; cursor: not-allowed; }

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 24px;
}
.btn-orange {
    background-color: #e67e22; /* Màu cam giống ảnh */
    color: white;
}
</style>