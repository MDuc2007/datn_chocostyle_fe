<template>
  <div class="app-container">
    <Header></Header>

    <div class="breadcrumb">
      <span @click="$router.push('/')">Trang chủ</span>
      <span class="separator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </span>
      <span class="current">Hồ sơ của tôi</span>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="card profile-card">
          <div class="card-header">
            <div>
              <h3 class="page-title">Hồ sơ của tôi</h3>
              <p class="page-subtitle">Quản lý thông tin cá nhân để bảo mật tài khoản</p>
            </div>
            </div>

          <div class="card-body">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Đang tải thông tin...</p>
            </div>

            <div v-else class="profile-content">
              
              <div class="profile-avatar-section">
                <div class="avatar-wrapper">
                  <img 
                    v-if="currentUser?.avatar" 
                    :src="getFullImageUrl(currentUser.avatar)" 
                    alt="Avatar"
                    @error="handleAvatarError"
                  >
                  <span v-else class="avatar-placeholder">{{ getUserInitial(currentUser?.tenKhachHang) }}</span>
                </div>
                <div class="avatar-actions">
                  <button class="btn-upload">Chọn Ảnh</button>
                  <p class="upload-note">Dụng lượng file tối đa 1 MB<br>Định dạng: .JPEG, .PNG</p>
                </div>
              </div>

              <div class="profile-info-section">
                
                <div class="info-row">
                  <div class="info-label">Họ và tên</div>
                  <div class="info-value text-bold">{{ currentUser?.tenKhachHang || 'Chưa cập nhật' }}</div>
                </div>

                <div class="info-row">
                  <div class="info-label">Email</div>
                  <div class="info-value">
                    {{ maskEmail(currentUser?.email) }}
                    <span v-if="currentUser?.email" class="verified-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Đã xác minh
                    </span>
                  </div>
                </div>

                <div class="info-row">
                  <div class="info-label">Số điện thoại</div>
                  <div class="info-value">
                    {{ maskPhone(currentUser?.soDienThoai) }}
                  </div>
                </div>

                <div class="info-row" v-if="defaultAddress">
                  <div class="info-label">Địa chỉ mặc định</div>
                  <div class="info-value address-box">
                    <svg class="icon-location" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>{{ formatAddress(defaultAddress) }}</span>
                  </div>
                </div>

                <div class="info-row" v-if="currentUser?.ngaySinh">
                  <div class="info-label">Ngày sinh</div>
                  <div class="info-value">{{ formatDate(currentUser.ngaySinh) }}</div>
                </div>

                <div class="info-row" v-if="currentUser?.gioiTinh !== undefined && currentUser?.gioiTinh !== null">
                  <div class="info-label">Giới tính</div>
                  <div class="info-value">{{ currentUser.gioiTinh ? 'Nam' : 'Nữ' }}</div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer></Footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import ClientSidebar from "../../pages/views/ClientSidebar.vue";

const currentUser = ref(null);
const loading = ref(false);

// --- CÁC HÀM HELPER HIỂN THỊ (UI Helpers) ---
const getUserInitial = (name) => {
  if (!name) return "U";
  const words = String(name).trim().split(" ");
  return words[words.length - 1].charAt(0).toUpperCase();
};

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `http://localhost:8080/images/${imagePath}`;
};

const handleAvatarError = (e) => {
  e.target.style.display = "none";
};

// Che email (VD: nguyenvanA@gmail.com -> nguyen***@gmail.com)
const maskEmail = (email) => {
  if (!email) return "Chưa cập nhật";
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 3) return email;
  return name.substring(0, 3) + "***@" + domain;
};

// Che SĐT (VD: 0987654321 -> ******4321)
const maskPhone = (phone) => {
  if (!phone) return "Chưa cập nhật";
  if (phone.length < 8) return phone;
  return "******" + phone.substring(phone.length - 4);
};

const formatDate = (dateString) => {
  if (!dateString) return "Chưa cập nhật";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

const defaultAddress = computed(() => {
  if (!currentUser.value || !currentUser.value.listDiaChi) return null;
  return (
    currentUser.value.listDiaChi.find((d) => d.macDinh) ||
    currentUser.value.listDiaChi[0]
  );
});

const formatAddress = (addr) => {
  if (!addr) return "";
  return `${addr.diaChiCuThe}, ${addr.phuong}, ${addr.quan}, ${addr.thanhPho}`;
};

// --- LOGIC GỌI API ---
const fetchUserProfile = async () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;

  const localUser = JSON.parse(userStr);
  const token = localUser.accessToken || localStorage.getItem("token");
  const userId = localUser.id;

  if (!userId) return;

  loading.value = true;
  try {
    const res = await axios.get(
      `http://localhost:8080/api/khach-hang/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    currentUser.value = res.data;

    const updatedLocalUser = {
      ...localUser,
      tenKhachHang: res.data.tenKhachHang,
      avatar: res.data.avatar,
      email: res.data.email,
    };
    localStorage.setItem("user", JSON.stringify(updatedLocalUser));
  } catch (error) {
    console.error("Lỗi tải thông tin profile:", error);
    currentUser.value = localUser;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUserProfile();
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
  cursor: default;
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

/* ================== CARD HỒ SƠ ================== */
.profile-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid #f3f4f6;
}

.page-title {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.btn-outline-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline-primary svg {
  width: 16px;
  height: 16px;
}

.btn-outline-primary:hover {
  border-color: #6b3f1e;
  color: #6b3f1e;
}

/* ================== CARD BODY & CHIA CỘT ================== */
.card-body {
  padding: 40px 30px;
}

.profile-content {
  display: flex;
  gap: 50px;
}

/* --- Cột Trái: Avatar --- */
.profile-avatar-section {
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #f3f4f6;
  padding-right: 30px;
}

.avatar-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: #fdf3eb;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(107, 63, 30, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 40px;
  font-weight: 700;
  color: #6b3f1e;
}

.avatar-actions {
  text-align: center;
}

.btn-upload {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.btn-upload:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.upload-note {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;
  margin: 0;
}

/* --- Cột Phải: Thông tin chi tiết --- */
.profile-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 10px;
}

.info-row {
  display: flex;
  align-items: flex-start;
}

.info-label {
  width: 150px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
  padding-top: 2px;
}

.info-value {
  flex: 1;
  font-size: 15px;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-bold {
  font-weight: 600;
  font-size: 16px;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #059669;
  background: #ecfdf5;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.verified-badge svg {
  width: 14px;
  height: 14px;
}

.address-box {
  background: #f9fafb;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  line-height: 1.5;
  align-items: flex-start; /* Ghi đè align-items: center của .info-value */
}

.icon-location {
  width: 18px;
  height: 18px;
  color: #6b7280;
  margin-top: 2px;
  flex-shrink: 0;
}

/* ================== TRẠNG THÁI LOADING ================== */
.loading-state {
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ================== RESPONSIVE ================== */
@media (max-width: 900px) {
  .profile-content {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .profile-avatar-section {
    width: 100%;
    border-right: none;
    border-bottom: 1px dashed #e5e7eb;
    padding-right: 0;
    padding-bottom: 30px;
  }

  .info-row {
    flex-direction: column;
    gap: 8px;
  }

  .info-label {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
}
</style>