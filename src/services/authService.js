import axios from "axios";

const AUTH_URL = "/auth/"; // Nhớ cấu hình baseURL trong axios ở chỗ khác nhé, hoặc ghi full "http://localhost:8080/api/auth/"

class AuthService {
  // ==========================
  // 1. LOGIN KHÁCH HÀNG
  // ==========================
  async loginCustomer(user) {
    const response = await axios.post(AUTH_URL + "login/customer", {
      email: user.username,
      password: user.password,
    });

    // SỬA Ở ĐÂY: Bao phủ trường hợp backend trả về 'token' hoặc 'accessToken'
    const jwtToken = response.data.accessToken || response.data.token;

    if (jwtToken) {
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  }

  // ==========================
  // 1.1 LƯU DỮ LIỆU TỪ GOOGLE/FACEBOOK
  // ==========================
  saveSocialLogin(data) {
    const jwtToken = data.accessToken || data.token;
    if (jwtToken) {
      localStorage.setItem("token", jwtToken);
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

    // SỬA Ở ĐÂY: Chặn lỗi lưu 'undefined' vào Local Storage
    const jwtToken = response.data.accessToken || response.data.token;

    if (jwtToken) {
      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("token", jwtToken); // Lưu token chuẩn xác
      localStorage.setItem("idNv", response.data.id); 
      localStorage.setItem("tenNv", response.data.tenNhanVien || response.data.hoTen); 
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
  // 5. QUÊN MẬT KHẨU & ĐỔI MẬT KHẨU
  // ==========================
  forgotPassword(email, type) {
    return axios.post(AUTH_URL + "forgot-password", null, {
      params: { email: email, type: type },
    });
  }

  resetPassword(email, otp, newPassword, type) {
    return axios.post(AUTH_URL + "reset-password", {
      email: email, 
      otp: otp, 
      newPassword: newPassword, 
      type: type,
    });
  }
}

export default new AuthService();