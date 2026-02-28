<template>
  <div class="app-container">
    <Header></Header>

    <div class="breadcrumb">
      <span @click="$router.push('/')">Trang chủ</span>
      <span class="separator">/</span>
      <span class="current">Sổ địa chỉ</span>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="card">
          <div class="card-header-flex">
            <h3>Địa chỉ của tôi</h3>
            <button class="btn-add" @click="openModal">
              + Thêm địa chỉ mới
            </button>
          </div>

          <div class="card-body">
            <div v-if="loading" class="text-center">Đang tải...</div>

            <div v-else-if="addresses.length === 0" class="empty-state">
              <p>Bạn chưa lưu địa chỉ nào.</p>
            </div>

            <div v-else class="address-list">
              <div
                v-for="addr in addresses"
                :key="addr.id"
                class="address-item"
              >
                <div class="addr-info">
                  <div class="addr-row">
                    <span class="addr-name">{{
                      currentUser?.tenKhachHang
                    }}</span>
                    <span class="divider">|</span>
                    <span class="addr-phone">{{
                      currentUser?.soDienThoai
                    }}</span>
                  </div>
                  <div class="addr-detail">
                    {{ addr.diaChiCuThe }}
                  </div>
                  <div class="addr-sub">
                    {{ addr.phuong }}, {{ addr.quan }}, {{ addr.thanhPho }}
                  </div>
                  <div v-if="addr.macDinh" class="default-badge">Mặc định</div>
                </div>

                <div class="addr-actions">
                  <button class="btn-text">Cập nhật</button>
                  <button
                    v-if="!addr.macDinh"
                    class="btn-text"
                    @click="deleteAddress(addr.id)"
                  >
                    Xóa
                  </button>

                  <button
                    v-if="!addr.macDinh"
                    class="btn-set-default"
                    @click="setDefault(addr.id)"
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

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <h3 class="modal-title">Địa chỉ mới</h3>

        <form @submit.prevent="saveAddress">
          <div class="form-group">
            <label>Tỉnh/Thành phố</label>
            <input
              v-model="form.thanhPho"
              type="text"
              placeholder="Nhập Tỉnh/Thành phố"
              required
            />
          </div>
          <div class="form-group">
            <label>Quận/Huyện</label>
            <input
              v-model="form.quan"
              type="text"
              placeholder="Nhập Quận/Huyện"
              required
            />
          </div>
          <div class="form-group">
            <label>Phường/Xã</label>
            <input
              v-model="form.phuong"
              type="text"
              placeholder="Nhập Phường/Xã"
              required
            />
          </div>
          <div class="form-group">
            <label>Địa chỉ cụ thể</label>
            <textarea
              v-model="form.diaChiCuThe"
              placeholder="Số nhà, tên đường..."
              rows="2"
              required
            ></textarea>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="btn-secondary"
              @click="showModal = false"
            >
              Trở lại
            </button>
            <button type="submit" class="btn-primary">Hoàn thành</button>
          </div>
        </form>
      </div>
    </div>

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
  // await axios.delete(...)
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
/* CSS Layout giống các trang trước */
.app-container {
  background: #f7f9fa;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
}
.breadcrumb {
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 4%;
  font-size: 14px;
  color: #666;
}
.breadcrumb span {
  cursor: pointer;
}
.breadcrumb span:hover {
  color: #6b3f1e;
}
.breadcrumb .separator {
  margin: 0 10px;
  cursor: default;
}
.breadcrumb .current {
  font-weight: 600;
  color: #6b3f1e;
}

.main-layout {
  max-width: 1400px;
  margin: 0 auto 40px auto;
  padding: 0 4%;
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.content-section {
  flex: 1;
  min-width: 0;
}
.card {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Riêng cho trang Address */
.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #efefef;
}
.card-header-flex h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}
.btn-add {
  background: #6b3f1e;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
.btn-add:hover {
  background: #5a3218;
}

.card-body {
  padding: 0 30px 30px 30px;
}
.address-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}
.address-item:last-child {
  border-bottom: none;
}

.addr-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.addr-name {
  font-weight: 700;
  color: #333;
  font-size: 15px;
}
.divider {
  margin: 0 8px;
  color: #ddd;
}
.addr-phone {
  color: #666;
  font-size: 14px;
}
.addr-detail {
  margin-bottom: 4px;
  color: #444;
}
.addr-sub {
  color: #666;
  font-size: 13px;
}

.default-badge {
  display: inline-block;
  margin-top: 8px;
  border: 1px solid #6b3f1e;
  color: #6b3f1e;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 2px;
}

.addr-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.btn-text {
  background: none;
  border: none;
  color: #0984e3;
  cursor: pointer;
  font-size: 13px;
}
.btn-text:hover {
  text-decoration: underline;
}
.btn-set-default {
  background: #fff;
  border: 1px solid #ddd;
  color: #333;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 2px;
}
.btn-set-default:hover {
  border-color: #999;
}

/* MODAL FORM */
.modal-title {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.btn-secondary {
  background: #eee;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary {
  background: #6b3f1e;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  .address-item {
    flex-direction: column;
    gap: 15px;
  }
  .addr-actions {
    align-items: flex-start;
    flex-direction: row;
  }
}
</style>
