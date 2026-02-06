import axios from 'axios';


// Vì main.js đã set baseURL là 'http://localhost:8080/api'
// Nên ở đây ta chỉ cần trỏ vào phần đuôi '/auth/'
const AUTH_URL = '/auth/';


class AuthService {
  // 1. Đăng nhập
  async login(user) {
    const response = await axios.post(AUTH_URL + 'login', {
      usernameOrEmail: user.username,
      password: user.password
    });


    if (response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }


    return response.data;
  }


  // 2. Đăng ký
  register(user) {
    return axios.post(AUTH_URL + 'register', {
      hoTen: user.fullname,
      tenTaiKhoan: user.username,
      email: user.email,
      matKhau: user.password
    });
  }


  // 3. Đăng xuất
  logout() {
    localStorage.removeItem('user');
  }


  // 4. Quên mật khẩu
  forgotPassword(email) {
    return axios.post(AUTH_URL + 'forgot-password', null, {
      params: { email }
    });
  }


  // 5. Đặt lại mật khẩu
  resetPassword(email, otp, newPassword) {
    return axios.post(AUTH_URL + 'reset-password', {
      email: email,
      token: otp,
      newPassword: newPassword
    });
  }
}


export default new AuthService();

