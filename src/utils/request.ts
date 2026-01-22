import axios from 'axios';

// Tạo instance axios trỏ đến cổng Backend (mặc định 8080)
const request = axios.create({
    baseURL: 'http://localhost:8080/api', // URL cơ sở định nghĩa trong HoaDonController [cite: 53]
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default request;