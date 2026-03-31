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
        <div class="main-card form-page-animation">
          
          <div class="header-simple address-header">
            <div>
              <h3 class="page-title">Địa chỉ của tôi</h3>
              <p class="page-subtitle">Quản lý thông tin nhận hàng để thanh toán nhanh chóng</p>
            </div>
            <button class="btn-orange hover-effect flex-center" @click="openModal">
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <p>Bạn chưa lưu địa chỉ nào.</p>
            </div>

            <div v-else class="address-grid">
              <div
                v-for="addr in addresses"
                :key="addr.id"
                class="address-card"
                :class="{ 'is-default': addr.macDinh }"
              >
                <div class="address-card-header">
                  <div class="addr-name-group">
                    <span class="addr-name">{{ currentUser?.tenKhachHang || 'Khách hàng' }}</span>
                    <span class="divider">|</span>
                    <span class="addr-phone">{{ currentUser?.soDienThoai || 'Chưa cập nhật SĐT' }}</span>
                  </div>
                  <span class="default-badge" v-if="addr.macDinh">✓ Mặc định</span>
                </div>

                <div class="address-card-body">
                  <div class="addr-row">
                    <svg class="icon-location" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <div class="addr-text">
                      <p class="addr-detail">{{ addr.diaChiCuThe }}</p>
                      <p class="addr-sub">{{ addr.phuong }}, {{ addr.quan }}, {{ addr.thanhPho }}</p>
                    </div>
                  </div>
                </div>

                <div class="address-card-footer">
                  <button
                    class="btn-outline"
                    :class="{ 'btn-disabled': addr.macDinh }"
                    :disabled="addr.macDinh"
                    @click="!addr.macDinh && setDefault(addr.id)"
                  >
                    Thiết lập mặc định
                  </button>
                  
                  <button class="btn-text-edit" @click="openEditModal(addr)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Sửa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">{{ isEditingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới' }}</h3>
            <button class="btn-close" @click="closeModal">×</button>
          </div>

          <form @submit.prevent="saveAddress" class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Tỉnh/Thành phố <span class="req">*</span></label>
                <div class="select-wrapper">
                  <select
                    v-model="form.provinceId"
                    @change="onProvinceChange"
                    class="form-input custom-select"
                    :class="{ 'red-border': errors.provinceId }"
                  >
                    <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                    <option v-for="p in listProvinces" :key="p.code" :value="p.code">
                      {{ p.name }}
                    </option>
                  </select>
                </div>
                <span v-if="errors.provinceId" class="error-msg slide-down">{{ errors.provinceId }}</span>
              </div>
              
              <div class="form-group">
                <label>Quận/Huyện <span class="req">*</span></label>
                <div class="select-wrapper">
                  <select
                    v-model="form.districtId"
                    @change="onDistrictChange"
                    class="form-input custom-select"
                    :disabled="!form.provinceId"
                    :class="{ 'red-border': errors.districtId }"
                  >
                    <option value="" disabled>Chọn Quận/Huyện</option>
                    <option v-for="d in districtOptions" :key="d.code" :value="d.code">
                      {{ d.name }}
                    </option>
                  </select>
                </div>
                <span v-if="errors.districtId" class="error-msg slide-down">{{ errors.districtId }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>Phường/Xã <span class="req">*</span></label>
              <div class="select-wrapper">
                <select
                  v-model="form.wardCode"
                  @change="onWardChange"
                  class="form-input custom-select"
                  :disabled="!form.districtId"
                  :class="{ 'red-border': errors.wardCode }"
                >
                  <option value="" disabled>Chọn Phường/Xã</option>
                  <option v-for="w in wardOptions" :key="w.code" :value="w.code">
                    {{ w.name }}
                  </option>
                </select>
              </div>
              <span v-if="errors.wardCode" class="error-msg slide-down">{{ errors.wardCode }}</span>
            </div>

            <div class="form-group">
              <label>Địa chỉ cụ thể (Số nhà, đường) <span class="req">*</span></label>
              <textarea
                v-model="form.diaChiCuThe"
                class="form-input form-textarea"
                placeholder="VD: Số 12, Ngõ 34, Đường ABC..."
                rows="3"
                :class="{ 'red-border': errors.diaChiCuThe }"
                @input="clearError('diaChiCuThe')"
              ></textarea>
              <span v-if="errors.diaChiCuThe" class="error-msg slide-down">{{ errors.diaChiCuThe }}</span>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel-clean" @click="closeModal">Hủy bỏ</button>
              <button type="submit" class="btn-orange" :disabled="isSubmitting">
                <span v-if="isSubmitting"><i class="fa fa-spinner fa-spin"></i> Đang tải...</span>
                <span v-else>{{ isEditingAddress ? 'Cập nhật' : 'Lưu địa chỉ' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Footer></Footer>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-indicator"></div>
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import ClientSidebar from "../../pages/views/ClientSidebar.vue";

const PROVINCE_API_URL = "https://provinces.open-api.vn/api/v1";

const addresses = ref([]);
const currentUser = ref(null);
const loading = ref(false);
const showModal = ref(false);
const isSubmitting = ref(false);

const isEditingAddress = ref(false);
const editingAddressId = ref(null);
const currentEditingMacDinh = ref(false);

const listProvinces = ref([]);
const districtOptions = ref([]);
const wardOptions = ref([]);

const toast = ref({ show: false, message: "", type: "success" });
const errors = ref({});

const form = reactive({
  provinceId: "",
  districtId: "",
  wardCode: "",
  provinceName: "",
  districtName: "",
  wardName: "",
  diaChiCuThe: "",
});

// 👉 HÀM LẤY TOKEN ĐỂ GẮN VÀO API
const getToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return (
      user?.accessToken ||
      user?.access_token ||
      user?.token ||
      user?.jwt ||
      localStorage.getItem("token")
    );
  } catch {
    return null;
  }
};

const loadUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) currentUser.value = JSON.parse(userStr);
};

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => (toast.value.show = false), 3000);
};

// 1. Lấy dữ liệu danh sách Tỉnh/TP từ API
const fetchProvinces = async () => {
  try {
    const res = await axios.get(`${PROVINCE_API_URL}/p/`);
    listProvinces.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const onProvinceChange = async () => {
  clearError('provinceId');
  form.districtId = "";
  form.wardCode = "";
  districtOptions.value = [];
  wardOptions.value = [];
  
  form.provinceName = listProvinces.value.find((p) => String(p.code) === String(form.provinceId))?.name || "";
  
  if (form.provinceId) {
    try {
      const res = await axios.get(`${PROVINCE_API_URL}/p/${form.provinceId}?depth=2`);
      districtOptions.value = res.data.districts;
    } catch (error) {
      console.error(error);
    }
  }
};

const onDistrictChange = async () => {
  clearError('districtId');
  form.wardCode = "";
  wardOptions.value = [];
  
  form.districtName = districtOptions.value.find((d) => String(d.code) === String(form.districtId))?.name || "";
  
  if (form.districtId) {
    try {
      const res = await axios.get(`${PROVINCE_API_URL}/d/${form.districtId}?depth=2`);
      wardOptions.value = res.data.wards;
    } catch (error) {
       console.error(error);
    }
  }
};

const onWardChange = () => {
  clearError('wardCode');
  form.wardName = wardOptions.value.find((w) => String(w.code) === String(form.wardCode))?.name || "";
};

// 2. Lấy danh sách địa chỉ của User (Đã gài Token)
const fetchAddresses = async () => {
  if (!currentUser.value) return;
  const token = getToken();
  
  loading.value = true;
  try {
    const res = await axios.get(
      `http://localhost:8080/api/dia-chi/khach-hang/${currentUser.value.id}`,
      { headers: { Authorization: `Bearer ${token}` } } // Gài token vào đây
    );
    addresses.value = res.data.sort((a, b) => b.macDinh - a.macDinh);
  } catch (e) {
    console.error(e);
    if (e.response?.status === 401) {
      showToast("Phiên đăng nhập hết hạn!", "error");
    } else {
      showToast("Lỗi tải danh sách địa chỉ", "error");
    }
  } finally {
    loading.value = false;
  }
};

const validateAddress = () => {
  errors.value = {};
  let isValid = true;
  
  if (!form.provinceId) { 
    errors.value.provinceId = "Vui lòng chọn Tỉnh/Thành phố"; 
    isValid = false; 
  }
  
  if (!form.districtId) { 
    errors.value.districtId = "Vui lòng chọn Quận/Huyện"; 
    isValid = false; 
  }
  
  if (!form.wardCode) { 
    errors.value.wardCode = "Vui lòng chọn Phường/Xã"; 
    isValid = false; 
  }
  
  if (!form.diaChiCuThe?.trim()) { 
    errors.value.diaChiCuThe = "Vui lòng nhập địa chỉ cụ thể"; 
    isValid = false; 
  } else {
    // Biểu thức Regex kiểm tra địa chỉ:
    // Cho phép: Chữ cái Tiếng Việt, số, khoảng trắng, dấu phẩy, dấu chấm, gạch ngang, gạch chéo
    // Chặn: Các ký tự đặc biệt như @, #, $, %, ^, &, *, !, ?, <, >, {, }, [, ]...
    const addressRegex = /^[a-zA-Z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s,.\-\/]+$/;
    
    if (!addressRegex.test(form.diaChiCuThe.trim())) {
      errors.value.diaChiCuThe = "Địa chỉ không được chứa ký tự đặc biệt (chỉ cho phép dấu phẩy, chấm, gạch ngang, gạch chéo)";
      isValid = false;
    } else if (form.diaChiCuThe.trim().length < 5) {
      errors.value.diaChiCuThe = "Địa chỉ cụ thể quá ngắn (phải có ít nhất 5 ký tự)";
      isValid = false;
    }
  }

  return isValid;
};

const clearError = (field) => {
  if (errors.value[field]) delete errors.value[field];
};

// 3. Thêm hoặc Cập nhật địa chỉ (Đã vá lỗi bảo mật 401)
const saveAddress = async () => {
  if (!validateAddress()) return;

  const token = getToken();
  if (!token) {
    showToast("Phiên đăng nhập hết hạn, vui lòng tải lại trang!", "error");
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      thanhPho: form.provinceName,
      quan: form.districtName,
      phuong: form.wardName,
      diaChiCuThe: form.diaChiCuThe,
      khachHangId: currentUser.value.id, 
      tenDiaChi: currentUser.value.tenKhachHang || "Khách hàng",
      sdt: currentUser.value.soDienThoai || "",
      macDinh: isEditingAddress.value ? currentEditingMacDinh.value : addresses.value.length === 0, 
    };

    // Đính kèm token vào Header
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    if (isEditingAddress.value) {
      await axios.put(`http://localhost:8080/api/dia-chi/${editingAddressId.value}`, payload, config);
      showToast("Cập nhật địa chỉ thành công!", "success");
    } else {
      await axios.post("http://localhost:8080/api/dia-chi", payload, config);
      showToast("Thêm địa chỉ thành công!", "success");
    }

    closeModal();
    await fetchAddresses();
  } catch (e) {
    console.error(e);
    if (e.response?.status === 401) {
      showToast("Tài khoản của bạn đã bị đăng xuất!", "error");
    } else {
      showToast("Lỗi khi lưu địa chỉ", "error");
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 4. Đặt mặc định (Đã gài Token)
const setDefault = async (idDiaChi) => {
  const token = getToken();
  if (!token) {
    showToast("Vui lòng đăng nhập lại!", "error");
    return;
  }

  try {
    await axios.put(
      `http://localhost:8080/api/dia-chi/${idDiaChi}/mac-dinh?khachHangId=${currentUser.value.id}`,
      {}, // Body trống
      { headers: { Authorization: `Bearer ${token}` } } // Gài token vào
    );
    await fetchAddresses();
    showToast("Đã thay đổi địa chỉ mặc định!", "success");
  } catch (e) {
    console.error(e);
    if (e.response?.status === 401) {
      showToast("Tài khoản đã bị đăng xuất!", "error");
    } else {
      showToast("Lỗi thiết lập mặc định", "error");
    }
  }
};

const openModal = () => {
  resetForm();
  isEditingAddress.value = false;
  showModal.value = true;
};

const openEditModal = async (addr) => {
  resetForm();
  isEditingAddress.value = true;
  editingAddressId.value = addr.id;
  currentEditingMacDinh.value = addr.macDinh;
  form.diaChiCuThe = addr.diaChiCuThe;
  
  showModal.value = true;
  isSubmitting.value = true; 

  try {
    if (listProvinces.value.length === 0) {
      await fetchProvinces();
    }

    const matchedProvince = listProvinces.value.find(p => p.name.includes(addr.thanhPho) || addr.thanhPho.includes(p.name));
    if (matchedProvince) {
      form.provinceId = matchedProvince.code;
      form.provinceName = matchedProvince.name;
      
      const resD = await axios.get(`${PROVINCE_API_URL}/p/${form.provinceId}?depth=2`);
      districtOptions.value = resD.data.districts;

      const matchedDistrict = districtOptions.value.find(d => d.name.includes(addr.quan) || addr.quan.includes(d.name));
      if (matchedDistrict) {
        form.districtId = matchedDistrict.code;
        form.districtName = matchedDistrict.name;

        const resW = await axios.get(`${PROVINCE_API_URL}/d/${form.districtId}?depth=2`);
        wardOptions.value = resW.data.wards;

        const matchedWard = wardOptions.value.find(w => w.name.includes(addr.phuong) || addr.phuong.includes(w.name));
        if (matchedWard) {
          form.wardCode = matchedWard.code;
          form.wardName = matchedWard.name;
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi khớp địa chỉ cũ:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const resetForm = () => {
  form.provinceId = "";
  form.districtId = "";
  form.wardCode = "";
  form.provinceName = "";
  form.districtName = "";
  form.wardName = "";
  form.diaChiCuThe = "";
  districtOptions.value = [];
  wardOptions.value = [];
  errors.value = {};
  isEditingAddress.value = false;
  editingAddressId.value = null;
  currentEditingMacDinh.value = false;
};

onMounted(() => {
  loadUser();
  fetchProvinces();
  fetchAddresses();
});
</script>

<style scoped>
/* ================== LAYOUT CHUNG ================== */
.app-container {
  background: #f4f6f8;
  min-height: 100vh;
  font-family: 'Inter', "Segoe UI", sans-serif;
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
.breadcrumb span { cursor: pointer; transition: color 0.2s; }
.breadcrumb span:hover { color: #63391F; } 
.breadcrumb .separator svg { width: 14px; height: 14px; margin-top: 3px; }
.breadcrumb .current { font-weight: 500; color: #111827; cursor: default; }

.main-layout {
  max-width: 1280px;
  margin: 0 auto 50px auto;
  padding: 0 20px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.content-section { flex: 1; min-width: 0; }

/* ================== MAIN CARD & HEADER ================== */
.main-card {
  background: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px; 
  border-bottom: 1px solid #f3f4f6; 
  padding-bottom: 20px;
}

.page-title { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #111827; }
.page-subtitle { margin: 0; font-size: 14px; color: #6b7280; }

.btn-orange { 
  background: linear-gradient(135deg, #63391F, #8b5328); 
  color: #fff; 
  border: none; 
  padding: 10px 20px; 
  border-radius: 8px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: all 0.3s ease; 
}
.btn-orange:hover:not(:disabled) { 
  box-shadow: 0 6px 12px rgba(99, 57, 31, 0.25); 
  transform: translateY(-2px);
}
.btn-orange:disabled { opacity: 0.7; cursor: not-allowed; }

.flex-center { display: flex; align-items: center; gap: 8px; font-size: 14px;}
.icon-plus { width: 16px; height: 16px; }

/* ================== ADDRESS GRID (CARD STYLE) ================== */
.address-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 10px;
}

.address-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
}
.address-card:hover { border-color: #d6bda9; box-shadow: 0 4px 12px rgba(99, 57, 31, 0.05); }

.address-card.is-default { 
  border: 1.5px solid #63391F; 
  background: #fdfaf8; 
}

.address-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px dashed #e5e7eb;
  padding-bottom: 12px;
}

.addr-name-group { display: flex; align-items: center; }
.addr-name { font-weight: 700; color: #111827; font-size: 16px; }
.divider { margin: 0 12px; color: #d1d5db; }
.addr-phone { color: #6b7280; font-size: 15px; }

.default-badge {
  background: #FDF8F5;
  color: #63391F;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #E8D3C3;
}

.address-card-body {
  margin-bottom: 15px;
}
.addr-row { display: flex; gap: 12px; align-items: flex-start; }

.icon-location { 
  width: 18px; 
  height: 18px; 
  color: #6b7280; 
  margin-top: 2px; 
  flex-shrink: 0;
}

.addr-text p { margin: 0; line-height: 1.5; color: #4b5563; }
.addr-detail { font-size: 15px; font-weight: 500; color: #111827 !important; margin-bottom: 4px !important; }
.addr-sub { font-size: 14px; color: #6b7280;}

.address-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-outline {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #4b5563;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}
.btn-outline:hover:not(.btn-disabled) { 
  border-color: #63391F; 
  color: #63391F; 
}
.btn-disabled { 
  opacity: 0.4; 
  cursor: not-allowed; 
  border-color: #e5e7eb; 
  background: #f9fafb;
}

.btn-text-edit {
  background: none;
  border: none;
  color: #63391F;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.2s;
}
.btn-text-edit svg { width: 16px; height: 16px; }
.btn-text-edit:hover { opacity: 0.7; }

/* ================== TRẠNG THÁI EMPTY & LOADING ================== */
.loading-state, .empty-state { text-align: center; padding: 60px 0; color: #6b7280; }
.spinner { border: 3px solid #f3f3f3; border-top: 3px solid #63391F; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin: 0 auto 16px; } 
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.empty-state { background: #fafafa; border-radius: 8px; border: 1px dashed #e5e7eb; }
.empty-icon { width: 48px; height: 48px; color: #d1d5db; margin-bottom: 15px; }

/* ================== MODAL THÊM/SỬA ĐỊA CHỈ ================== */
.modal-overlay { 
  position: fixed; 
  top: 0; left: 0; width: 100vw; height: 100vh; 
  background: rgba(17, 24, 39, 0.6); 
  backdrop-filter: blur(4px); 
  display: flex; align-items: center; justify-content: center; z-index: 9999; 
}
.modal-card { 
  background: #fff; 
  width: 100%; max-width: 550px; 
  border-radius: 16px; 
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
  overflow: hidden; 
}

.modal-header { 
  display: flex; justify-content: space-between; align-items: center; 
  padding: 20px 24px; border-bottom: 1px solid #f3f4f6; 
  background: #ffffff; 
}
.modal-title { margin: 0; font-size: 18px; font-weight: 700; color: #111827; }
.btn-close { 
  background: #f1f5f9; border: none; 
  font-size: 20px; color: #64748b; cursor: pointer; 
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; 
}
.btn-close:hover { background: #fef2f2; color: #ef4444; transform: rotate(90deg); }

.modal-body { padding: 24px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #4b5563; }
.req { color: #dc2626; margin-left: 2px; }

.select-wrapper { position: relative; }
.form-input { 
  width: 100%; padding: 12px 14px; 
  border: 1px solid #d1d5db; border-radius: 8px; 
  font-size: 14px; color: #111827; 
  transition: all 0.2s; box-sizing: border-box; 
}
.form-input::placeholder { color: #9ca3af; }
.form-input:focus { outline: none; border-color: #63391F; box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1); } 
.form-textarea { resize: vertical; min-height: 90px; }

select.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat; background-position: right 12px top 50%; background-size: 10px auto; cursor: pointer;
  padding-right: 35px;
}
select.custom-select:disabled { background-color: #f9fafb; cursor: not-allowed; border-color: #e5e7eb; color: #9ca3af; }
.red-border { border-color: #dc2626 !important; background-color: #fef2f2; }
.error-msg { color: #dc2626; font-size: 13px; font-weight: 500; margin-top: 6px; display: block;}

.modal-actions { 
  display: flex; justify-content: flex-end; gap: 12px; 
  margin-top: 10px; border-top: 1px solid #f3f4f6; 
  padding-top: 20px; 
}
.btn-cancel-clean { 
  padding: 10px 20px; border: 1px solid transparent; 
  background: #f1f5f9; color: #475569; border-radius: 8px; 
  font-weight: 600; cursor: pointer; transition: 0.2s; 
}
.btn-cancel-clean:hover { background: #e2e8f0; color: #1e293b; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: translateY(-20px) scale(0.98); }

/* ================== TOAST ================== */
.toast-notification { position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 250px; padding: 12px 15px; border-radius: 6px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); font-size: 14px; font-weight: 500; background: #F0FDF4; color: #111827; }
.toast-indicator { width: 6px; height: 100%; background-color: #10B981; position: absolute; left: 0; top: 0; border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
.toast-content { margin-left: 10px; }
.toast-notification.error { background: #FEF2F2; color: #991b1b; }
.toast-notification.error .toast-indicator { background-color: #EF4444; }
.toast-notification.warning { background: #FFFBEB; color: #92400E; }
.toast-notification.warning .toast-indicator { background-color: #F59E0B; }

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s; }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(120%); opacity: 0; }

/* ================== RESPONSIVE ================== */
@media (max-width: 768px) {
  .main-layout { flex-direction: column; }
  .address-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .btn-orange { width: 100%; justify-content: center; }
  .address-card-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .form-row { grid-template-columns: 1fr; gap: 0; }
  .modal-actions { flex-direction: column; }
  .btn-cancel-clean, .btn-orange { width: 100%; }
}
</style>