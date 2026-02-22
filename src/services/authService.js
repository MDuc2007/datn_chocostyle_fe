import axios from "axios";

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

    if (response.data.accessToken) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  }

  // ==========================
  // 2. LOGIN NHÂN VIÊN
  // ==========================
// ==========================
  // 2. LOGIN NHÂN VIÊN
  // ==========================
  async loginStaff(user) {
    const response = await axios.post(AUTH_URL + "login/staff", {
      email: user.username,
      password: user.password,
    });

    if (response.data.accessToken) {
      // 1. Vẫn lưu cục "user" cũ để không ảnh hưởng các chức năng khác
      localStorage.setItem("user", JSON.stringify(response.data));
      
      // 2. 👉 LƯU THÊM CÁC BIẾN RỜI ĐỂ DÙNG CHO DASHBOARD & CHẤM CÔNG
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("idNv", response.data.id); 
      localStorage.setItem("tenNv", response.data.tenNhanVien); // Lấy tên nhân viên từ Backend
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
  }

  // ==========================
  // 5. FORGOT PASSWORD
  // ==========================
  forgotPassword(email, type) {
    return axios.post(AUTH_URL + "forgot-password", null, {
      params: {
        email: email,
        type: type, // "KHACH_HANG" | "NHAN_VIEN"
      },
    });
  }

  // ==========================
  // 6. RESET PASSWORD
  // ==========================
  resetPassword(email, otp, newPassword, type) {
    return axios.post(AUTH_URL + "reset-password", {
      email: email,
      otp: otp,
      newPassword: newPassword,
      type: type, // "KHACH_HANG" | "NHAN_VIEN"
    });
  }
}

export default new AuthService();
