<template>
    <div class="employee-page">
        
        <div class="card-box">
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
                        <option value="Quản lý">Quản lý</option>
                        <option value="Nhân viên">Nhân viên</option>
                        <option value="Nhân viên bán hàng">Nhân viên bán hàng</option>
                        <option value="Thủ kho">Thủ kho</option>
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
        </div>

        <div class="card-box" style="margin-top: 20px;">
            <section class="table-wrap">
                <table class="employees">
                    <thead>
                        <tr>
                            <th style="width: 30px;">STT</th>
                            <th style="width: 90px;">Ảnh</th>
                            <th style="width: 100px;">Mã NV</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th style="width: 110px;">SDT</th>
                            <th>Địa chỉ</th>
                            <th style="width: 140px;">Chức vụ</th>
                            <th style="width: 110px;">Trạng thái</th>
                            <th style="width: 100px;">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(e, index) in pagedEmployees" :key="e.id">
                            <td>{{ startIndex + index }}</td>
                            <td class="avatar-cell">
                                <img v-if="e.avatar && e.avatar.length > 20" :src="e.avatar" class="avatar-img" />
                                <div v-else class="avatar placeholder" :style="{backgroundColor: getRandomColor(index)}">
                                    {{ initials(e.name) }}
                                </div>
                            </td>
                            <td class="code">{{ e.code }}</td>
                            <td class="fw-bold">{{ e.name }}</td>
                            <td class="muted">{{ e.email }}</td>
                            <td>{{ e.phone }}</td>
                            <td class="muted small">{{ e.address }}</td>
                            <td>{{ getRoleLabel(e.role) }}</td>
                            <td>
                                <span :class="['status', getStatusClass(e.status)]">
                                    {{ getStatusLabel(e.status) }}
                                </span>
                            </td>
                            <td class="actions-cell">
                                <div class="action-buttons">
                                    <button class="btn-action edit" @click="openEditModal(e)" title="Chỉnh sửa">✏️</button>
                                    <label class="switch">
                                        <input type="checkbox" :checked="e.status === 1" @change="toggleStatus(e)">
                                        <span class="slider"></span>
                                    </label>
                                </div>
                            </td>
                        </tr>
                        <tr v-for="i in (perPage - pagedEmployees.length)" :key="'empty-' + i">
                            <td colspan="10">&nbsp;</td>
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
                        <div class="avatar-circle" @click="triggerFileInput">
                            <img :src="editingEmployee.avatar || 'https://via.placeholder.com/100'" alt="Avatar">
                            <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden-input" accept="image/*" />
                            <div class="overlay-edit">📷</div>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Mã NV</label>
                            <input v-model="editingEmployee.maNv" disabled class="disabled-input" />
                        </div>

                        <div class="form-group">
                            <div class="label-flex">
                                <label>Tên</label>
                                <span v-if="errors.hoTen" class="error-msg">{{ errors.hoTen }}</span>
                            </div>
                            <input v-model="editingEmployee.hoTen" :class="{ 'red-border': errors.hoTen }" />
                        </div>

                        <div class="form-group">
                            <div class="label-flex">
                                <label>Email</label>
                                <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
                            </div>
                            <input v-model="editingEmployee.email" :class="{ 'red-border': errors.email }" />
                        </div>

                        <div class="form-group">
                            <div class="label-flex">
                                <label>SDT</label>
                                <span v-if="errors.sdt" class="error-msg">{{ errors.sdt }}</span>
                            </div>
                            <input v-model="editingEmployee.sdt" :class="{ 'red-border': errors.sdt }" />
                        </div>

                        <div class="form-group">
                            <div class="label-flex">
                                <label>Ngày sinh</label>
                                <span v-if="errors.ngaySinh" class="error-msg">{{ errors.ngaySinh }}</span>
                            </div>
                            <input type="date" v-model="editingEmployee.ngaySinh" :class="{ 'red-border': errors.ngaySinh }" />
                        </div>

                        <div class="form-group full-width">
                            <div class="label-flex">
                                <label>Địa chỉ</label>
                                <span v-if="errors.diaChi" class="error-msg">{{ errors.diaChi }}</span>
                            </div>
                            <input v-model="editingEmployee.diaChi" :class="{ 'red-border': errors.diaChi }" />
                        </div>

                        <div class="form-group">
                            <label>Chức vụ</label>
                            <select v-model="editingEmployee.vaiTro" class="form-select">
                                <option value="Quản lý">Quản lý (Admin)</option>
                                <option value="Nhân viên">Nhân viên (Staff)</option>
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

const employees = ref([])
const query = ref('')
const filters = ref({ gender: 'all', role: 'all', status: 'all' })
const perPage = ref(8)
const page = ref(1)
const router = useRouter()

// Modal & Edit State
const showModal = ref(false)
const editingEmployee = ref({})
const fileInput = ref(null)

const statusHistory = ref({}) 
const errors = ref({})

// --- HÀM VALIDATE CHO FORM SỬA ---
function validateEditForm() {
    errors.value = {}; 
    let isValid = true;
    const data = editingEmployee.value;

    if (!data.hoTen || data.hoTen.trim() === '') {
        errors.value.hoTen = "Tên trống"; isValid = false;
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.value.email = "Email sai"; isValid = false;
    }
    if (!data.sdt || !/^0\d{9}$/.test(data.sdt)) {
        errors.value.sdt = "SĐT sai (10 số, đầu 0)"; isValid = false;
    }
    if (!data.diaChi) {
        errors.value.diaChi = "Địa chỉ trống"; isValid = false;
    }
    if (!data.ngaySinh) {
        errors.value.ngaySinh = "Chọn ngày sinh"; isValid = false;
    } else {
        const birthDate = new Date(data.ngaySinh);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) { errors.value.ngaySinh = "Chưa đủ 18t"; isValid = false; }
    }

    return isValid;
}

// --- HELPERS & API ---
function formatDateForInput(dateString) {
    if (!dateString) return '';
    return dateString.substring(0, 10);
}

function getRoleLabel(roleCode) {
    switch (roleCode) {
        case 'Admin': return 'Quản lý';
        case 'Staff': return 'Nhân viên';
        case 'Sales': return 'Nhân viên Bán hàng';
        case 'StoreKeeper': return 'Thủ kho';
        default: return roleCode;
    }
}

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
            dob: item.ngaySinh,
            avatar: item.avatar,
            gender: item.gioiTinh
        }))
    } catch (error) {
        console.error("Lỗi tải dữ liệu:", error)
    }
}

onMounted(() => {
    fetchEmployees()
})

// --- MODAL ---
function openEditModal(emp) {
    // errors.value = {}; // Reset lỗi cũ
    // editingEmployee.value = {
    //     id: emp.id,
    //     maNv: emp.code,
    //     hoTen: emp.name,
    //     email: emp.email,
    //     sdt: emp.phone,
    //     diaChi: emp.address,
    //     vaiTro: emp.role, 
    //     trangThai: emp.status,
    //     ngaySinh: formatDateForInput(emp.dob), 
    //     avatar: emp.avatar
    // }
    // showModal.value = true;
    router.push({ name: 'EditEmployee', params: { id: emp.id } });
}

function closeModal() { showModal.value = false; }

// --- UPLOAD ẢNH ---
function triggerFileInput() { fileInput.value.click(); }
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert("Ảnh quá lớn (< 5MB)!"); return;
        }
        const reader = new FileReader();
        reader.onload = (e) => { editingEmployee.value.avatar = e.target.result; };
        reader.readAsDataURL(file);
    }
}

// --- LƯU DỮ LIỆU ---
async function saveEmployee() {
    if (!validateEditForm()) return; // Kiểm tra validate trước
    
    try {
        await axios.put(`http://localhost:8080/api/nhan-vien/${editingEmployee.value.id}`, {
            hoTen: editingEmployee.value.hoTen,
            email: editingEmployee.value.email,
            sdt: editingEmployee.value.sdt,
            diaChi: editingEmployee.value.diaChi,
            vaiTro: editingEmployee.value.vaiTro,
            trangThai: editingEmployee.value.trangThai,
            ngaySinh: editingEmployee.value.ngaySinh,
            avatar: editingEmployee.value.avatar
        });
        alert("Cập nhật thành công!");
        closeModal();
        fetchEmployees();
    } catch (error) {
        console.error(error);
        alert("Lỗi lưu dữ liệu!");
    }
}

// --- UTILS KHÁC ---
async function toggleStatus(e) {
    let newStatus = 1;
    if (e.status !== 2) {
        statusHistory.value[e.id] = e.status; 
        newStatus = 2;
    } else {
        if (statusHistory.value.hasOwnProperty(e.id)) {
            newStatus = statusHistory.value[e.id];
        } else {
            newStatus = 1; 
        }
    }
    const originalStatus = e.status;
    e.status = newStatus;
    try {
        await axios.put(`http://localhost:8080/api/nhan-vien/${e.id}`, { trangThai: newStatus });
        if (newStatus !== 2) delete statusHistory.value[e.id];
    } catch (error) {
        e.status = originalStatus;
        alert("Lỗi cập nhật trạng thái!");
    }
}
function addEmployee() { router.push('/admin/employee/add') }
function getStatusLabel(status) { return status === 1 ? 'Đang làm' : (status === 0 ? 'Đã nghỉ' : 'Đã khóa'); }
function getStatusClass(status) { return status === 1 ? 'active' : (status === 0 ? 'inactive' : 'locked'); }
function initials(name) { if (!name) return ''; return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() }
const colors = ['#f2d6d0', '#d0e1f2', '#d0f2d6', '#f2f0d0', '#e2d0f2'];
function getRandomColor(index) { return colors[index % colors.length]; }

const filtered = computed(() => {
    return employees.value.filter(e => {
        const matchesQuery = query.value.trim() === '' || 
            [e.name, e.code, e.email].some(f => f && f.toLowerCase().includes(query.value.toLowerCase()));
        const matchesRole = filters.value.role === 'all' || e.role === filters.value.role;
        let matchesStatus = true;
        if (filters.value.status === 'active') matchesStatus = e.status === 1;
        if (filters.value.status === 'inactive') matchesStatus = e.status === 0;
        if (filters.value.status === 'locked') matchesStatus = e.status === 2;
        let matchesGender = true;
        if (filters.value.gender === 'male') { matchesGender = (e.gender === true); } 
        else if (filters.value.gender === 'female') { matchesGender = (e.gender === false); }
        return matchesQuery && matchesRole && matchesStatus && matchesGender;
    })
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
const startIndex = computed(() => (page.value - 1) * perPage.value + 1)
const pagedEmployees = computed(() => filtered.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))
function goPage(p) { page.value = p }
function prevPage() { if (page.value > 1) page.value-- }
function nextPage() { if (page.value < totalPages.value) page.value++ }
function resetFilters() { query.value = ''; filters.value = { gender: 'all', role: 'all', status: 'all' }; page.value = 1; }
function exportExcel() { alert('Xuất Excel') }
</script>

<style scoped>
/* Reset padding cho trang */
.employee-page { padding: 10px; font-family: 'Segoe UI', Roboto, sans-serif; color: #3b2b20; background-color: transparent; }

/* CARD-BOX */
.card-box {
    background: #fff; border-radius: 8px; padding: 24px;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
    max-width: 100%;
}

.title { font-size: 24px; margin-bottom: 24px; color: #6b3a2b; font-weight: 700; border-bottom: 2px solid #f0e6df; padding-bottom: 12px; }

/* FILTERS */
.filters { margin-bottom: 0; }
.filters .filter-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.filters input.search { flex: 1; min-width: 250px; padding: 10px 14px; border: 1px solid #e0d8d0; border-radius: 6px; }
.filters select { padding: 10px; border: 1px solid #d6c3b4; border-radius: 6px; }
.actions { margin-left: auto; display: flex; gap: 10px; }
.btn { padding: 10px 16px; border-radius: 6px; border: 0; cursor: pointer; font-weight: 600; }
.btn-light { background: #f3ece6; color: #5a2e18; }
.btn-success { background: #28a745; color: #fff; }
.btn-primary { background: #63391F; color: #fff; }

/* TABLE */
.table-wrap { overflow-x: auto; background: #fff; min-height: 550px; display: flex; flex-direction: column; justify-content: space-between; }
.employees { width: 100%; border-collapse: collapse; font-size: 14px; table-layout: fixed; }
.employees thead th { background: #6b3a2b; color: #fff; text-align: left; padding: 0 16px; font-weight: 700; height: 50px; }
.employees tbody tr { height: 80px; border-bottom: 1px solid #f0e6df; }
.employees tbody td { padding: 0 16px; vertical-align: middle; white-space: normal; word-break: break-word; line-height: 1.4; }
.employees tbody tr:hover td { background: #fffaf6; }

/* Avatar */
.avatar-cell { width: 90px; }
.avatar-img { width: 60px; height: 60px; border-radius: 6px; object-fit: cover; border: 1px solid #eee; }
.avatar.placeholder { width: 60px; height: 60px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #6b3a2b; font-size: 20px; }

/* Status & Actions */
.status { padding: 5px 12px; border-radius: 12px; color: #fff; font-size: 11px; font-weight: 600; display: inline-block; }
.status.active { background: #27ae60; }
.status.inactive { background: #e74c3c; }
.status.locked { background: #7f8c8d; }
.actions-cell .action-buttons { display: flex; align-items: center; gap: 12px; }
.btn-action { background: transparent; border: none; font-size: 18px; cursor: pointer; color: #95a5a6; }
.btn-action.edit:hover { color: #2980b9; transform: scale(1.1); }

/* Switch Toggle */
.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
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
    background-color: #e74c3c; /* red for locked */
    transition: .4s;
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
    transition: .4s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: #6b3a2b; /* brown for unlocked */
}

input:checked + .slider:before {
    transform: translateX(26px);
}

/* Pagination */
.pagination { display: flex; gap: 6px; justify-content: center; padding: 15px 0; border-top: 1px solid #eee; margin-top: auto; }
.page { padding: 8px 14px; border-radius: 4px; background: #fff; border: 1px solid #d9d9d9; cursor: pointer; }
.page.active { background: #6b3a2b; color: #fff; border-color: #6b3a2b; }

/* Modal CSS */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; width: 700px; max-width: 95%; border-radius: 12px; padding: 25px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
.close-btn { background: none; border: none; font-size: 28px; cursor: pointer; color: #888; line-height: 1; }
.avatar-section { display: flex; justify-content: center; margin-bottom: 20px; }
.avatar-circle { width: 100px; height: 100px; border-radius: 50%; border: 2px solid #eee; overflow: hidden; position: relative; cursor: pointer; }
.avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
.hidden-input { display: none; }
.overlay-edit { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.5); color: #fff; text-align: center; padding: 4px 0; font-size: 12px; display: none; }
.avatar-circle:hover .overlay-edit { display: block; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; }
.form-group.full-width { grid-column: span 2; }
.form-group input, .form-group select { padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-top: 5px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
.btn-orange { background-color: #63391F; color: white; }

/* CSS VALIDATE ERROR (LABEL CÙNG HÀNG VỚI LỖI) */
.label-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

/* Chữ lỗi màu đỏ */
.error-msg {
    color: #e74c3c;
    font-size: 12px;
    font-style: italic;
    font-weight: 600;
}

/* Viền đỏ cho input khi lỗi */
.red-border {
    border-color: #e74c3c !important;
    background-color: #fff5f5;
}
</style>