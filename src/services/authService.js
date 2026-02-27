import axios from "axios";

const AUTH_URL = "/auth/"; // Nhớ cấu hình baseURL trong axios ở chỗ khác nhé, hoặc ghi full "http://localhost:8080/api/auth/"

class AuthService {
  // ==========================
  // 1. LOGIN KHÁCH HÀNG (SỬA Ở ĐÂY)
  // ==========================
  async loginCustomer(user) {
    const response = await axios.post(AUTH_URL + "login/customer", {
      email: user.username,
      password: user.password,
    });

    if (response.data.accessToken) {
      // ĐÃ THÊM: Lưu token rời để Header.vue có thể lấy gọi API ảnh
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  }

  // ==========================
  // 1.1 LƯU DỮ LIỆU TỪ GOOGLE/FACEBOOK (HÀM MỚI)
  // ==========================
  // Khi bạn nhận được Token và thông tin từ Google/FB trả về, hãy gọi hàm này
  saveSocialLogin(data) {
    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data));
    }
  }

  // ==========================
  // 2. LOGIN NHÂN VIÊN
  // ==========================
  async loginStaff(user) {
    const response = await axios.post(AUTH_URL + "login/staff", {
      email: user.username,
      password: user.password,
    });

    if (response.data.accessToken) {
      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("idNv", response.data.id); 
      localStorage.setItem("tenNv", response.data.tenNhanVien); 
    }

    return response.data;
  }

  // ==========================
  // 3. REGISTER (KHÁCH HÀNG)
  // ==========================
  register(user) {
    return axios.post(AUTH_URL + "register", {
      hoTen: user.fullname,
      soDienThoai: user.phone,
      email: user.email,
      matKhau: user.password,
    });
  }

  // ==========================
  // 4. LOGOUT
  // ==========================
  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("idNv");
    localStorage.removeItem("tenNv");
  }

  // ==========================
  // CÁC HÀM QUÊN MẬT KHẨU GIỮ NGUYÊN...
  // ==========================
  forgotPassword(email, type) {
    return axios.post(AUTH_URL + "forgot-password", null, {
      params: { email: email, type: type },
    });
  }

  resetPassword(email, otp, newPassword, type) {
    return axios.post(AUTH_URL + "reset-password", {
      email: email, otp: otp, newPassword: newPassword, type: type,
    });
  }
}

export default new AuthService();