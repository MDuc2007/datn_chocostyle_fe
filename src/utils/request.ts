import axios from "axios";

const request = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
});

// 👉 Gắn token cho mọi request
request.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
    if (user) {
      const { accessToken, tokenType } = JSON.parse(user);
      if (accessToken) {
        config.headers.Authorization = `${tokenType || "Bearer"} ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 👉 Bắt lỗi 401 (token hết hạn / chưa login)
request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token hết hạn hoặc chưa đăng nhập");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default request;
