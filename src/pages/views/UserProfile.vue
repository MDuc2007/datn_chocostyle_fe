<template>
  <div class="app-container">
    <Header></Header>

    <div class="breadcrumb">
      <span @click="$router.push('/')">Trang chủ</span>
      <span class="separator">/</span>
      <span class="current">Hồ sơ của tôi</span>
    </div>

    <div class="main-layout">
      <ClientSidebar />

      <div class="content-section">
        <div class="card profile-card">
          <div class="card-header">
            <h3>Hồ sơ của tôi</h3>
            <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">Đang tải thông tin...</div>

            <div v-else>
              <div class="form-group">
                <label>Tên khách hàng</label>
                <input
                  type="text"
                  :value="currentUser?.tenKhachHang"
                  disabled
                  class="input-readonly"
                />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input
                  type="text"
                  :value="currentUser?.email"
                  disabled
                  class="input-readonly"
                />
              </div>
              <div class="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  :value="currentUser?.soDienThoai"
                  disabled
                  class="input-readonly"
                />
              </div>

              <div class="form-group" v-if="defaultAddress">
                <label>Địa chỉ mặc định</label>
                <textarea
                  rows="2"
                  disabled
                  class="input-readonly"
                  :value="formatAddress(defaultAddress)"
                ></textarea>
              </div>

              <!-- <button class="btn-save">Lưu thay đổi</button> -->
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
import axios from "axios"; // Import Axios
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
import ClientSidebar from "../../pages/views/ClientSidebar.vue";

const currentUser = ref(null);
const loading = ref(false);

// Tìm địa chỉ mặc định từ list
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

const fetchUserProfile = async () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;

  const localUser = JSON.parse(userStr);
  const token = localUser.accessToken || localStorage.getItem("token");

  // Lấy ID từ localStorage (hoặc email nếu id không có)
  const userId = localUser.id;

  if (!userId) return;

  loading.value = true;
  try {
    // Gọi API lấy chi tiết khách hàng
    const res = await axios.get(
      `http://localhost:8080/api/khach-hang/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // Cập nhật data từ API
    currentUser.value = res.data;

    // (Tùy chọn) Cập nhật lại localStorage nếu tên/avatar thay đổi để đồng bộ Header
    const updatedLocalUser = {
      ...localUser,
      tenKhachHang: res.data.tenKhachHang,
      avatar: res.data.avatar,
      email: res.data.email,
    };
    localStorage.setItem("user", JSON.stringify(updatedLocalUser));
  } catch (error) {
    console.error("Lỗi tải thông tin profile:", error);
    // Fallback: dùng tạm dữ liệu localStorage nếu API lỗi
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
/* Dùng chung style layout */
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
  transition: 0.2s;
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
  cursor: default;
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
}

.card {
  background: #fff;
  padding: 30px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.card-header {
  border-bottom: 1px solid #efefef;
  padding-bottom: 15px;
  margin-bottom: 20px;
}
.card-header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
}
.card-header p {
  margin: 0;
  font-size: 14px;
  color: #555;
}

.form-group {
  margin-bottom: 20px;
  max-width: 500px; /* Tăng chiều rộng input */
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}
.input-readonly {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  color: #333; /* Màu chữ đậm hơn cho dễ đọc */
  border-radius: 4px;
  box-sizing: border-box;
}

.btn-save {
  background: #6b3f1e;
  color: #fff;
  border: none;
  padding: 10px 25px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
.btn-save:hover {
  background: #5a3218;
}
.text-center {
  text-align: center;
  color: #666;
  margin: 20px 0;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
}
</style>
