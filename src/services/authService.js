import axios from "axios";

// Nhớ cấu hình baseURL trong axios ở chỗ khác nhé, hoặc ghi full "http://localhost:8080/api/auth/"
const AUTH_URL = "/auth/"; 

class AuthService {
  // ==========================
  // 1. LOGIN KHÁCH HÀNG
  // ==========================
  async loginCustomer(user) {
    const response = await axios.post(AUTH_URL + "login/customer", {
      email: user.username,
      password: user.password,
    });

    // Bao phủ trường hợp backend trả về 'token' hoặc 'accessToken'
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

    // Chặn lỗi lưu 'undefined' vào Local Storage
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
  // 5. QUÊN MẬT KHẨU & ĐỔI MẬT KHẨU (ĐÃ ĐỒNG BỘ CÁCH 2)
  // ==========================
  forgotPassword(email, type) {
    // Dựa vào biến type truyền vào để trỏ đúng URL API
    const endpoint = (type === 'KHACH_HANG') ? "customer/forgot-password" : "staff/forgot-password";
    
    return axios.post(AUTH_URL + endpoint, null, {
      params: { email: email },
      // Backend không cần nhận type nữa vì đã rẽ nhánh ngay từ đường dẫn API
    });
  }

  resetPassword(email, otp, newPassword, type) {
    // Dựa vào biến type truyền vào để trỏ đúng URL API
    const endpoint = (type === 'KHACH_HANG') ? "customer/reset-password" : "staff/reset-password";

    return axios.post(AUTH_URL + endpoint, {
      email: email, 
      otp: otp, 
      newPassword: newPassword, 
      // Backend không cần nhận type trong Request Body nữa
    });
  }
}

export default new AuthService();