<template>
  <div class="app-container">
    <Header></Header>

    <div class="breadcrumb">
      <span @click="$router.push('/')">Trang chủ</span>
      <span class="separator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </span>
      <span class="current">Sổ địa chỉ</span>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="card">
          <div class="card-header-flex">
            <h3 class="page-title">Địa chỉ của tôi</h3>
            <button class="btn-add" @click="openModal">
              <svg class="icon-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Thêm địa chỉ mới
            </button>
          </div>

          <div class="card-body">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>

            <div v-else-if="addresses.length === 0" class="empty-state">
              <div class="empty-icon">📍</div>
              <p>Bạn chưa lưu địa chỉ nào.</p>
            </div>

            <div v-else class="address-list">
              <div
                v-for="addr in addresses"
                :key="addr.id"
                class="address-item"
                :class="{ 'is-default': addr.macDinh }"
              >
                <div class="addr-info">
                  <div class="addr-header">
                    <span class="addr-name">{{ currentUser?.tenKhachHang || 'Khách hàng' }}</span>
                    <span class="divider">|</span>
                    <span class="addr-phone">{{ currentUser?.soDienThoai || 'Chưa cập nhật SĐT' }}</span>
                  </div>
                  
                  <div class="addr-body">
                    <p class="addr-detail">{{ addr.diaChiCuThe }}</p>
                    <p class="addr-sub">{{ addr.phuong }}, {{ addr.quan }}, {{ addr.thanhPho }}</p>
                  </div>

                  <div class="addr-badges" v-if="addr.macDinh">
                    <span class="badge default-badge">Mặc định</span>
                  </div>
                </div>

                <div class="addr-actions">
                  <div class="action-links">
                    <button class="btn-text text-primary">Cập nhật</button>
                    <button
                      v-if="!addr.macDinh"
                      class="btn-text text-danger"
                      @click="deleteAddress(addr.id)"
                    >
                      Xóa
                    </button>
                  </div>
                  
                  <button
                    class="btn-outline"
                    :class="{ 'btn-disabled': addr.macDinh }"
                    :disabled="addr.macDinh"
                    @click="!addr.macDinh && setDefault(addr.id)"
                  >
                    Thiết lập mặc định
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Địa chỉ mới</h3>
            <button class="btn-close" @click="showModal = false">×</button>
          </div>

          <form @submit.prevent="saveAddress" class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Tỉnh/Thành phố</label>
                <input
                  v-model="form.thanhPho"
                  type="text"
                  class="form-input"
                  placeholder="VD: Hà Nội"
                  required
                />
              </div>
              <div class="form-group">
                <label>Quận/Huyện</label>
                <input
                  v-model="form.quan"
                  type="text"
                  class="form-input"
                  placeholder="VD: Ba Đình"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Phường/Xã</label>
              <input
                v-model="form.phuong"
                type="text"
                class="form-input"
                placeholder="VD: Phường Quán Thánh"
                required
              />
            </div>

            <div class="form-group">
              <label>Địa chỉ cụ thể</label>
              <textarea
                v-model="form.diaChiCuThe"
                class="form-input form-textarea"
                placeholder="Số nhà, ngõ, tên đường..."
                rows="3"
                required
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="showModal = false">Trở lại</button>
              <button type="submit" class="btn-primary">Hoàn thành</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Footer></Footer>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import ClientSidebar from "../../pages/views/ClientSidebar.vue";

const addresses = ref([]);
const currentUser = ref(null);
const loading = ref(false);
const showModal = ref(false);

const form = reactive({
  thanhPho: "",
  quan: "",
  phuong: "",
  diaChiCuThe: "",
});

const loadUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) currentUser.value = JSON.parse(userStr);
};

// 1. Lấy danh sách địa chỉ
const fetchAddresses = async () => {
  if (!currentUser.value) return;
  loading.value = true;
  try {
    const res = await axios.get(
      `http://localhost:8080/api/dia-chi/khach-hang/${currentUser.value.id}`,
    );
    // Sắp xếp mặc định lên đầu
    addresses.value = res.data.sort((a, b) => b.macDinh - a.macDinh);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// 2. Thêm địa chỉ mới
const saveAddress = async () => {
  try {
    const payload = {
      ...form,
      idKhachHang: currentUser.value.id,
      macDinh: addresses.value.length === 0, // Nếu chưa có địa chỉ nào thì cái đầu tiên là mặc định
    };

    await axios.post("http://localhost:8080/api/dia-chi", payload);
    showModal.value = false;
    resetForm();
    fetchAddresses();
    alert("Thêm địa chỉ thành công!");
  } catch (e) {
    console.error(e);
    alert("Lỗi thêm địa chỉ");
  }
};

// 3. Đặt mặc định
const setDefault = async (idDiaChi) => {
  try {
    await axios.put(
      `http://localhost:8080/api/dia-chi/${idDiaChi}/mac-dinh?khachHangId=${currentUser.value.id}`,
    );
    fetchAddresses();
  } catch (e) {
    console.error(e);
    alert("Lỗi thiết lập mặc định");
  }
};

const deleteAddress = async (id) => {
  if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
  // Cần thêm API xóa trong Controller nếu chưa có
  alert("Chức năng xóa cần bổ sung API backend");
};

const openModal = () => {
  resetForm();
  showModal.value = true;
};

const resetForm = () => {
  form.thanhPho = "";
  form.quan = "";
  form.phuong = "";
  form.diaChiCuThe = "";
};

onMounted(() => {
  loadUser();
  fetchAddresses();
});
</script>

<style scoped>
/* ================== LAYOUT CHUNG ================== */
.app-container {
  background: #f4f6f8;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #333;
}

.breadcrumb {
  max-width: 1280px;
  margin: 20px auto;
  padding: 0 20px;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb span {
  cursor: pointer;
  transition: color 0.2s;
}

.breadcrumb span:hover {
  color: #6b3f1e;
}

.breadcrumb .separator svg {
  width: 14px;
  height: 14px;
  margin-top: 3px;
}

.breadcrumb .current {
  font-weight: 500;
  color: #111827;
}

.main-layout {
  max-width: 1280px;
  margin: 0 auto 50px auto;
  padding: 0 20px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.content-section {
  flex: 1;
  min-width: 0;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* ================== HEADER CARD ================== */
.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid #f3f4f6;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #6b3f1e;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(107, 63, 30, 0.2);
}

.btn-add:hover {
  background: #5a3218;
  transform: translateY(-1px);
}

.icon-plus {
  width: 16px;
  height: 16px;
}

/* ================== BODY CARD & DANH SÁCH ĐỊA CHỈ ================== */
.card-body {
  padding: 10px 30px 30px 30px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 0;
  border-bottom: 1px solid #e5e7eb;
}

.address-item:last-child {
  border-bottom: none;
}

/* Phần thông tin bên trái */
.addr-info {
  flex: 1;
  padding-right: 20px;
}

.addr-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.addr-name {
  font-weight: 700;
  color: #111827;
  font-size: 16px;
}

.divider {
  margin: 0 12px;
  color: #d1d5db;
}

.addr-phone {
  color: #6b7280;
  font-size: 15px;
}

.addr-body p {
  margin: 0 0 4px 0;
  color: #4b5563;
  line-height: 1.5;
  font-size: 14px;
}

.addr-badges {
  margin-top: 10px;
}

.default-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e59866;
  color: #e59866;
  background: #fff8f5;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
}

/* Phần hành động bên phải */
.addr-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  min-width: 150px;
}

.action-links {
  display: flex;
  gap: 16px;
}

.btn-text {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 0;
  transition: opacity 0.2s;
}

.btn-text:hover {
  opacity: 0.7;
}

.text-primary {
  color: #0284c7;
}

.text-danger {
  color: #dc2626;
}

.btn-outline {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-outline:hover:not(.btn-disabled) {
  border-color: #6b3f1e;
  color: #6b3f1e;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

/* ================== MODAL THÊM ĐỊA CHỈ ================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-card {
  background: #fff;
  width: 100%;
  max-width: 550px;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #111827;
}

.modal-body {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  transition: all 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus {
  outline: none;
  border-color: #e59866;
  box-shadow: 0 0 0 3px rgba(229, 152, 102, 0.15);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #6b3f1e;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #5a3218;
}

/* Animation cho Modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

/* ================== TRẠNG THÁI ================== */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #6b7280;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6b3f1e;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ================== RESPONSIVE ================== */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  
  .address-item {
    flex-direction: column;
    gap: 16px;
  }
  
  .addr-actions {
    align-items: flex-start;
    flex-direction: row-reverse;
    justify-content: space-between;
    width: 100%;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>