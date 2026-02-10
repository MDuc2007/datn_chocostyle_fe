import axios from "axios";

const AUTH_URL = "/auth/";

class AuthService {
  // 1. Đăng nhập
  async login(user) {
    const response = await axios.post(AUTH_URL + "login", {
      usernameOrEmail: user.username,
      password: user.password,
    });

    if (response.data.accessToken) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  }

  // 2. Đăng ký
  register(user) {
    return axios.post(AUTH_URL + "register", {
      hoTen: user.fullname,
      tenTaiKhoan: user.username,
      email: user.email,
      matKhau: user.password,
    });
  }

  // 3. Đăng xuất
  logout() {
    localStorage.removeItem("user");
  }

  // 4. Quên mật khẩu (GỬI OTP)
  forgotPassword(email, type) {
    return axios.post(AUTH_URL + "forgot-password", null, {
      params: {
        email: email,
        type: type, // "KHACH_HANG" | "NHAN_VIEN"
      },
    });
  }

  // 5. Đặt lại mật khẩu
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
