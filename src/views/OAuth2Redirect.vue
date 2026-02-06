<template>
  <div class="redirect-wrapper">
    <div class="spinner"></div>
    <p>Đang xử lý đăng nhập Google...</p>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

onMounted(() => {
  // 1. Lấy token từ thanh địa chỉ (URL)
  const token = route.query.token;

  if (token) {
    // 2. Tạo giả object user (vì Login thường trả về cả user, nhưng OAuth2 chỉ trả token)
    // Sau này bạn có thể gọi API lấy thông tin user sau nếu muốn
    const authData = {
      accessToken: token,
      tokenType: "Bearer",
    };

    // 3. Lưu vào LocalStorage để giữ trạng thái đăng nhập
    localStorage.setItem("user", JSON.stringify(authData));

    // 4. Chuyển hướng ngay lập tức vào trang Admin
    router.push("/admin/customer");
  } else {
    // Nếu không có token -> Lỗi -> Về lại trang login
    alert("Đăng nhập thất bại!");
    router.push("/login");
  }
});
</script>

<style scoped>
.redirect-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f7f7f7;
  color: #63391f;
  font-weight: 600;
}

/* Spinner xoay xoay cho đẹp */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ddd;
  border-top-color: #63391f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
